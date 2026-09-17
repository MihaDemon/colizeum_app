from django.contrib import admin
from .models import (
    WheelPrize,
    DailyBonusPrize,
    DailyBonus,
    Spin,
    PromocodePrize
)


@admin.register(WheelPrize)
class WheelPrizeAdmin(admin.ModelAdmin):
    list_display = (
        'label',
        'internal_value',
        'weight',
        'points',
        'is_active'
    )
    list_filter = ('is_active',)
    search_fields = ('label',)
    list_editable = ('is_active', 'weight', 'points')


@admin.register(DailyBonusPrize)
class DailyBonusPrizeAdmin(admin.ModelAdmin):
    list_display = (
        'label',
        'internal_value',
        'weight',
        'points',
        'is_active'
    )
    list_filter = ('is_active',)
    search_fields = ('label', 'internal_value')
    list_editable = ('is_active', 'weight', 'points')


@admin.register(DailyBonus)
class DailyBonusAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'prize',
        'promo_code',
        'is_redeemed',
        'is_expired',
        'got_at',
        'use_until'
    )
    list_filter = (
        'is_redeemed',
        'is_expired',
        'got_at'
    )
    search_fields = (
        'user__username',
        'user__telegram_id',
        'promo_code'
    )
    # Makes automatically generated fields read-only in the admin panel
    readonly_fields = (
        'promo_code',
        'got_at',
        'redeemed_at'
    )


@admin.register(Spin)
class SpinAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'prize',
        'spun_at'
    )
    list_filter = ('spun_at',)
    search_fields = (
        'user__username',
        'user__telegram_id',
        'prize__label'
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(PromocodePrize)
class PromocodePrizeAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'promo_code',
        'is_redeemed',
        'got_at',
        'redeemed_at'
    )
    list_filter = (
        'is_redeemed',
        'got_at'
    )
    search_fields = (
        'user__username',
        'user__telegram_id',
        'promo_code'
    )
    readonly_fields = (
        'promo_code',
        'got_at',
        'redeemed_at'
    )
