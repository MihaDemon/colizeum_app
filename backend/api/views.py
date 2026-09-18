import random
import json
from urllib.parse import parse_qsl

from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token

from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.conf import settings

from users.models import ClubUser, ClubTransaction
from users.services import edit_guest_bonus_balance
from users.utils import validate_telegram_data
from wheel.models import (
    WheelPrize,
    DailyBonusPrize,
    DailyBonus,
    Spin,
    PromocodePrize
)
from .serializers import (
    UserSerializer,
    ClubUserSerializer,
    ClubTransactionSerializer,
    WheelPrizeSerializer,
    DailyBonusPrizeSerializer,
    DailyBonusSerializer,
    SpinSerializer,
    PromocodePrizeSerializer
)

User = get_user_model()


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet handling authentication processes.
    """
    # AllowAny ensures users can hit this endpoint before they have a token
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='telegram')
    def telegram(self, request):
        init_data = request.data.get('initData')

        if not init_data:
            return Response(
                {"error": "No initData provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. SECURITY CHECK: Validate Telegram signature
        if not validate_telegram_data(init_data, settings.TELEGRAM_BOT_TOKEN):
            return Response(
                {"error": "Invalid Telegram signature"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Extract authentic telegram_id from the validated data
        parsed_data = dict(parse_qsl(init_data))
        user_data = json.loads(parsed_data.get('user', '{}'))
        telegram_id = str(user_data.get('id'))

        if not telegram_id:
            return Response(
                {"error": "Could not extract user ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. LOGIN ATTEMPT: Check if user already exists
        user = User.objects.filter(telegram_id=telegram_id).first()
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "is_new_user": False
            }, status=status.HTTP_200_OK)

        # 3. REGISTRATION CHECK: If user doesn't exist, see if they provided
        # registration info
        phone_number = request.data.get('phone_number')
        username = request.data.get('username')

        if not phone_number or not username:
            return Response(
                {
                    "require_registration": True
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # 4. VALIDATION: Check if ClubUser exists
        try:
            club_user = ClubUser.objects.get(mobile_phone=phone_number)

        except ClubUser.DoesNotExist:
            return Response(
                {
                    "error": (
                        "Пользователь с таким номером телефона не найден "
                        "в базе клуба."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. VALIDATION: Check if phone is already linked
        if User.objects.filter(mobile_phone=phone_number).exists():
            return Response(
                {
                    "error": (
                        "Этот номер телефона уже привязан к другому "
                        "Telegram аккаунту."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 6. VALIDATION: Check if nickname is taken
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Этот никнейм уже занят. Выберите другой."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 7. CREATE USER
        user = User.objects.create(
            username=username,
            telegram_id=telegram_id,
            # Adjust based on how User relates to ClubUser.
            mobile_phone=club_user
        )
        user.set_unusable_password()
        user.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "is_new_user": True
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows reading user profiles. Users can only see their own detailed data.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Endpoint: GET /api/users/me/"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ClubUserViewSet(viewsets.ModelViewSet):
    """
    Manages ClubUsers. Typically restricted to admin staff.
    """
    queryset = ClubUser.objects.all()
    serializer_class = ClubUserSerializer
    permission_classes = [IsAdminUser]


class ClubTransactionViewSet(viewsets.ModelViewSet):
    """
    Handles receipt transactions. Admins create them; regular users can
    view their own.
    """
    queryset = ClubTransaction.objects.all()
    serializer_class = ClubTransactionSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # Regular users only see their own transactions; admins see all
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the admin who is processing the check
        serializer.save(admin=self.request.user)


class WheelPrizeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for the frontend to fetch available wheel prizes
    and their weights.
    Only active prizes are returned.
    """
    queryset = WheelPrize.objects.filter(is_active=True)
    serializer_class = WheelPrizeSerializer
    permission_classes = [IsAuthenticated]


class DailyBonusPrizeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for available daily bonuses.
    """
    queryset = DailyBonusPrize.objects.filter(is_active=True)
    serializer_class = DailyBonusPrizeSerializer
    permission_classes = [IsAuthenticated]


class DailyBonusViewSet(viewsets.ModelViewSet):
    """
    Manages a user's daily bonuses.
    """
    serializer_class = DailyBonusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own bonuses
        return DailyBonus.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Generates a new daily bonus if the user is eligible according to the
        12:00 PM next-day rule.
        Endpoint: POST /api/daily-bonuses/
        """
        user = request.user

        # 1. Eligibility Check: Use the new User model method
        if not user.can_claim_daily_bonus():
            return Response(
                {"error": "Вы еще не можете получить новый бонус."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Fetch active daily bonus prizes
        active_prizes = DailyBonusPrize.objects.filter(is_active=True)

        if not active_prizes.exists():
            return Response(
                {"error": "Нет доступных ежедневных бонусов."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. Weighted Random Selection
        prizes_list = list(active_prizes)
        weights = [prize.weight for prize in prizes_list]
        selected_prize = random.choices(prizes_list, weights=weights, k=1)[0]

        # 4. Create the DailyBonus record
        bonus = DailyBonus.objects.create(
            user=user,
            prize=selected_prize
        )

        serializer = self.get_serializer(bonus)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAdminUser],
        url_path='redeem'
    )
    def redeem_bonus(self, request):
        """
        Endpoint to redeem a daily bonus using its promo code.
        Endpoint: POST /api/daily-bonuses/redeem/
        Body: { "promo_code": "DAILY-ABC123XYZ" }
        """
        promo_code = request.data.get('promo_code')
        if not promo_code:
            return Response(
                {"error": "Укажите промокод (promo_code is required)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Find the bonus
        bonus = get_object_or_404(DailyBonus, promo_code=promo_code)

        # 3. Run model validations (checks expiration and waiting windows)
        bonus.check_expiration()

        if not bonus.can_redeem():
            return Response(
                {
                    "error": (
                        "Этот бонус еще нельзя использовать, просрочен или "
                        "уже погашен."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Mark as redeemed
        # (triggers points addition and daily streak update)
        bonus.is_redeemed = True
        bonus.save()

        serializer = self.get_serializer(bonus)
        return Response(
            {
                "success": f"Ежедневный бонус {promo_code} успешно погашен!",
                "bonus": serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='last')
    def last(self, request):
        """
        GET /api/daily-bonuses/last/
        Returns the user's most recent daily bonus record.
        """
        last_bonus = self.get_queryset().filter(
            user=request.user
        ).order_by('-got_at').first()

        if not last_bonus:
            return Response(
                {"detail": "No daily bonuses found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(last_bonus)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SpinBonusCreditFailed(Exception):
    """Raised when a wheel prize cannot be credited to the club account."""


class SpinViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """
    Handles wheel spins with secure, weighted random selection on the backend.
    """
    serializer_class = SpinSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Spin.objects.select_related('prize').filter(
            user=self.request.user
        )

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                # Lock the user row before checking and consuming a spin. This
                # prevents two simultaneous requests from using one spin twice.
                user = User.objects.select_for_update().get(pk=request.user.pk)

                if not user.can_spin():
                    return Response(
                        {
                            "error": (
                                "У вас нет доступных спинов. (No spins "
                                "available)"
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                active_prizes = WheelPrize.objects.filter(is_active=True)
                if not active_prizes.exists():
                    return Response(
                        {"error": "Нет активных призов. (No active prizes)"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                prizes_list = list(active_prizes)
                weights = [prize.weight for prize in prizes_list]
                selected_prize = random.choices(
                    prizes_list,
                    weights=weights,
                    k=1
                )[0]

                # Create the spin before calling the external club API. If a
                # database write fails, no external bonus has been credited.
                # A failed external credit raises and rolls this transaction
                # back, restoring the user's spin and ladder points.
                spin = Spin.objects.create(
                    user=user,
                    prize=selected_prize
                )

                club_user = getattr(user, 'mobile_phone', None)
                phone_number = getattr(club_user, 'mobile_phone', None)

                if not phone_number or not edit_guest_bonus_balance(
                    phone_number,
                    selected_prize.internal_value
                ):
                    raise SpinBonusCreditFailed

        except SpinBonusCreditFailed:
            return Response(
                {
                    "error": (
                        "Не удалось начислить бонус на клубный аккаунт. "
                        "Попробуйте еще раз."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        serializer = self.get_serializer(spin)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PromocodePrizeViewSet(viewsets.ModelViewSet):
    """
    Manages promotional code prizes for users.
    """
    serializer_class = PromocodePrizeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Restrict visibility to the requesting user's own promo codes
        return PromocodePrize.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns the top players ranked by monthly points for the ladder.
    Endpoint: GET /api/leaderboard/
    """
    serializer_class = UserSerializer
    permission_codes = [IsAuthenticated]

    def get_queryset(self):
        # Return users sorted highest-to-lowest by monthly points
        return User.objects.all().filter(
            monthly_points__gt=0
        ).order_by(
            '-monthly_points'
        )[:10]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Inject sequential position into each user dictionary in the list
        data = serializer.data
        for index, user_data in enumerate(data, start=1):
            user_data['position'] = index

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='position')
    def position(self, request):
        user = self.request.user

        higher_users_count = User.objects.filter(
            monthly_points__gt=user.monthly_points
        ).count()

        position = higher_users_count + 1

        return Response({
            "position": position
        }, status=status.HTTP_200_OK)
