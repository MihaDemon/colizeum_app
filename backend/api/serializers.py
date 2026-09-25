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
    """Safe profile payload for the authenticated user only."""
    can_spin = serializers.ReadOnlyField()
    can_claim_daily_bonus = serializers.ReadOnlyField()
    daily_streak = serializers.ReadOnlyField(source='current_daily_streak')

    class Meta:
        model = User
        fields = [
            'username',
            'available_spins',
            'total_spins',
            'daily_streak',
            'can_spin',
            'can_claim_daily_bonus',
            'is_staff'
        ]
        read_only_fields = [
            'username',
            'available_spins',
            'total_spins',
            'daily_streak',
            'is_staff'
        ]


class NicknameSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=30, allow_blank=False, trim_whitespace=True
    )

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exclude(
            pk=self.context['request'].user.pk
        ).exists():
            raise serializers.ValidationError('Этот никнейм уже занят.')
        return value


class LeaderboardSerializer(serializers.ModelSerializer):
    """Only the public fields needed to render the monthly ladder."""
    daily_streak = serializers.ReadOnlyField(source='current_daily_streak')

    class Meta:
        model = User
        fields = [
            'username',
            'monthly_points',
            'daily_streak'
        ]
        read_only_fields = fields


class ClubTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubTransaction
        fields = [
            'id', 'admin', 'user', 'amount_rub',
            'check_number', 'spins_awarded', 'created_at'
        ]
        read_only_fields = fields


class WheelPrizeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Wheel of Fortune prizes.
    """
    class Meta:
        model = WheelPrize
        fields = [
            'id',
            'label',
            'is_active'
        ]


class DailyBonusPrizeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Daily Bonus prizes.
    """
    class Meta:
        model = DailyBonusPrize
        fields = [
            'id',
            'label'
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
    prize_id = serializers.ReadOnlyField(source='prize.id')
    bonus_amount = serializers.ReadOnlyField(source='prize.internal_value')

    class Meta:
        model = Spin
        fields = [
            'prize_id',
            'bonus_amount',
            'spun_at'
        ]
        read_only_fields = [
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
