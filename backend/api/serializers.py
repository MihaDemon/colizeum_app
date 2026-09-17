from rest_framework import serializers

from django.contrib.auth import get_user_model

from users.models import ClubUser, ClubTransaction
from wheel.models import (
    WheelPrize,
    DailyBonusPrize,
    DailyBonus,
    Spin,
    PromocodePrize
)

User = get_user_model()


class ClubUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubUser
        fields = [
            'first_name',
            'last_name',
            'middle_name',
            'mobile_phone',
            'age'
        ]


class UserSerializer(serializers.ModelSerializer):
    # Dynamically pull the result of the can_spin() method
    can_spin = serializers.ReadOnlyField()
    can_claim_daily_bonus = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'telegram_id', 'mobile_phone',
            'monthly_points', 'available_spins', 'last_spin',
            'total_spins', 'daily_streak', 'can_spin',
            'can_claim_daily_bonus', 'is_staff'
        ]
        # Prevent users from artificially modifying their stats
        read_only_fields = [
            'monthly_points', 'available_spins', 'last_spin',
            'total_spins', 'daily_streak', 'is_staff'
        ]


class ClubTransactionSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(write_only=True)

    class Meta:
        model = ClubTransaction
        fields = [
            'id', 'admin', 'user', 'amount_rub',
            'check_number', 'spins_awarded', 'created_at',
            'user_phone'
        ]
        # spins_awarded is handled by the model's save() method
        read_only_fields = [
            'id',
            'admin',
            'user',
            'spins_awarded',
            'created_at'
        ]

    def validate_user_phone(self, value):
        """Ensure a user with this phone number exists."""
        try:
            user = User.objects.get(mobile_phone=value)

        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Пользователь с таким номером телефона не найден."
            )

        return user

    def create(self, validated_data):
        # Extract the resolved User object
        target_user = validated_data.pop('user_phone')

        # Create the transaction
        transaction = ClubTransaction.objects.create(
            user=target_user,
            **validated_data
        )
        return transaction


class WheelPrizeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Wheel of Fortune prizes.
    """
    class Meta:
        model = WheelPrize
        fields = [
            'id', 'label', 'internal_value', 'weight', 'is_active', 'points'
        ]


class DailyBonusPrizeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Daily Bonus prizes.
    """
    class Meta:
        model = DailyBonusPrize
        fields = [
            'id', 'label', 'internal_value', 'weight', 'is_active', 'points'
        ]


class DailyBonusSerializer(serializers.ModelSerializer):
    """
    Serializer for user Daily Bonuses.
    Includes the 'can_redeem' method as a read-only field.
    """
    can_redeem = serializers.ReadOnlyField()
    prize = serializers.ReadOnlyField(source='prize.label')

    class Meta:
        model = DailyBonus
        fields = [
            'id',
            'user',
            'prize',
            'promo_code',
            'is_redeemed',
            'got_at',
            'redeemed_at',
            'use_until',
            'is_expired',
            'can_redeem',
            'use_after'
        ]
        # Protect fields generated in the model's save() method
        read_only_fields = [
            'promo_code',
            'got_at',
            'redeemed_at',
            'use_until',
            'is_expired',
            'use_after'
        ]


class SpinSerializer(serializers.ModelSerializer):
    """
    Serializer for user Wheel Spins.
    """
    prize = serializers.ReadOnlyField(source='prize.label')
    prize_id = serializers.ReadOnlyField(source='prize.id')
    bonus_amount = serializers.ReadOnlyField(source='prize.internal_value')

    class Meta:
        model = Spin
        fields = [
            'id',
            'user',
            'prize',
            'prize_id',
            'bonus_amount',
            'spun_at'
        ]
        read_only_fields = [
            'user',
            'prize',
            'prize_id',
            'bonus_amount',
            'spun_at'
        ]


class PromocodePrizeSerializer(serializers.ModelSerializer):
    """
    Serializer for Promocode Prizes.
    """
    class Meta:
        model = PromocodePrize
        fields = [
            'id',
            'user',
            'label',
            'internal_value',
            'promo_code',
            'is_redeemed',
            'redeemed_at',
            'got_at'
        ]
        # Protect fields generated in the model's save() method
        read_only_fields = [
            'promo_code',
            'redeemed_at',
            'got_at'
        ]
