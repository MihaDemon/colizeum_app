from django.db import models
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from django.utils import timezone

from datetime import timedelta

User = get_user_model()


class WheelPrize(models.Model):
    label = models.CharField(
        verbose_name='Название',
        max_length=50
    )
    internal_value = models.IntegerField(
        verbose_name='Содержимое'
    )
    weight = models.PositiveBigIntegerField(
        verbose_name='Шанс выпадения',
        default=10
    )
    is_active = models.BooleanField(
        verbose_name='Активность',
        default=True
    )
    points = models.IntegerField(
        verbose_name='Очки',
        default=100
    )

    class Meta:
        verbose_name = 'Приз на колесе'
        verbose_name_plural = 'Призы на колесе'
        ordering = ('-weight',)

    def __str__(self):
        return self.label


class DailyBonusPrize(models.Model):
    label = models.CharField(
        verbose_name='Название',
        max_length=50
    )
    internal_value = models.CharField(
        verbose_name='Содержимое',
        max_length=50
    )
    weight = models.PositiveBigIntegerField(
        verbose_name='Шанс выпадения',
        default=10
    )
    is_active = models.BooleanField(
        verbose_name='Активность',
        default=True
    )
    points = models.IntegerField(
        verbose_name='Очки',
        default=10
    )

    class Meta:
        verbose_name = 'Ежедневный бонус'
        verbose_name_plural = 'Ежедневные бонусы'

    def __str__(self) -> str:
        return self.label


class DailyBonus(models.Model):
    user = models.ForeignKey(
        User,
        verbose_name='Пользователь',
        on_delete=models.CASCADE,
        related_name='bonuses'
    )
    prize = models.ForeignKey(
        'DailyBonusPrize',
        verbose_name='Выигрыш',
        on_delete=models.SET_NULL,
        null=True,
        related_name='daily_bonuses'
    )
    promo_code = models.CharField(
        verbose_name='Промокод',
        max_length=20,
        unique=True,
        blank=True
    )
    is_redeemed = models.BooleanField(
        verbose_name='Использован',
        default=False
    )
    got_at = models.DateTimeField(
        verbose_name='Получен',
        auto_now_add=True
    )
    redeemed_at = models.DateTimeField(
        verbose_name='Использован',
        null=True,
        blank=True
    )
    use_after = models.DateTimeField(
        verbose_name='Использовать после',
        null=True,
        blank=True
    )
    use_until = models.DateTimeField(
        verbose_name='Просрочится',
        null=True,
        blank=True
    )
    is_expired = models.BooleanField(
        verbose_name='Просрочен',
        default=False
    )

    class Meta:
        verbose_name = 'Бонус пользователя'
        verbose_name_plural = 'Бонусы пользователя'
        ordering = ('-got_at', )

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        previous_claim_at = None
        if is_new:
            previous_claim_at = (self.user.bonuses.order_by('-got_at')
                                 .values_list('got_at', flat=True).first())

        if not self.promo_code:
            unique_id = get_random_string(10).upper()

            self.promo_code = f'DAILY-{unique_id}'

        if not self.use_after or not self.use_until:
            base_time = self.got_at or timezone.now()
            local_got_at = timezone.localtime(base_time)

            next_day = local_got_at + timedelta(days=1)
            self.use_after = next_day.replace(
                hour=12,
                minute=0,
                second=0,
                microsecond=0
            )

            day_after_next = local_got_at + timedelta(days=2)
            self.use_until = day_after_next.replace(
                hour=12,
                minute=0,
                second=0,
                microsecond=0
            )

        just_redeemed = False

        if self.is_redeemed and not self.redeemed_at:
            self.redeemed_at = timezone.now()
            just_redeemed = True

        super().save(*args, **kwargs)

        if is_new:
            self.user.update_daily_streak(previous_claim_at)

        if just_redeemed:
            if self.prize:
                self.user.add_monthly_points(self.prize.points)

    def can_redeem(self) -> bool:
        if self.is_redeemed or self.is_expired:
            return False

        now = timezone.now()

        if self.use_after and now < self.use_after:
            return False

        if self.use_until and now >= self.use_until:
            return False

        return True

    def check_expiration(self) -> bool:
        if self.is_expired or self.is_redeemed:
            return True

        if self.use_until <= timezone.now():
            self.is_expired = True

            self.save(update_fields=['is_expired'])

            return True

        return False

    def __str__(self):
        return (
            f'{self.user} выиграл {self.prize} в '
            f'{self.got_at.strftime("%Y-%m-%d %H:%M")}'
        )


class Spin(models.Model):
    user = models.ForeignKey(
        User,
        verbose_name='Пользователь',
        on_delete=models.CASCADE,
        related_name='spins'
    )
    prize = models.ForeignKey(
        'WheelPrize',
        verbose_name='Выигрыш',
        on_delete=models.SET_NULL,
        null=True,
        related_name='winnig_spins'
    )
    spun_at = models.DateTimeField(
        verbose_name='Прокручен',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Спин пользователя'
        verbose_name_plural = 'Спины пользователя'
        ordering = ('-spun_at', )

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new:
            self.user.remove_spin()

        if is_new and self.prize:
            self.user.add_monthly_points(self.prize.points)

    def __str__(self):
        return (
            f'{self.user} выиграл {self.prize} в '
            f'{self.spun_at.strftime("%Y-%m-%d %H:%M")}'
        )


class PromocodePrize(models.Model):
    user = models.ForeignKey(
        User,
        verbose_name='Пользователь',
        on_delete=models.CASCADE,
        related_name='promocodes'
    )
    label = models.CharField(
        verbose_name='Название',
        max_length=50
    )
    internal_value = models.CharField(
        verbose_name='Содержимое',
        max_length=50
    )
    promo_code = models.CharField(
        verbose_name='Промокод',
        max_length=20,
        unique=True,
        blank=True
    )
    is_redeemed = models.BooleanField(
        verbose_name='Получен',
        default=False
    )
    redeemed_at = models.DateTimeField(
        verbose_name='Использован',
        null=True,
        blank=True
    )
    got_at = models.DateTimeField(
        verbose_name='Получен',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Промокод'
        verbose_name_plural = 'Промокоды'
        ordering = ('-got_at', )

    def save(self, *args, **kwargs):
        if not self.promo_code:
            unique_id = get_random_string(10).upper()

            self.promo_code = f'PROMO-{unique_id}'

        if self.is_redeemed and not self.redeemed_at:
            self.redeemed_at = timezone.now()

        super().save(*args, **kwargs)
