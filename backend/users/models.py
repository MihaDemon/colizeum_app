import os
from datetime import timedelta
from dotenv import load_dotenv

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import F
from django.utils import timezone

load_dotenv()


class User(AbstractUser):

    username = models.CharField(
        verbose_name='Логин',
        unique=True,
        max_length=30
    )
    mobile_phone = models.ForeignKey(
        'ClubUser',
        on_delete=models.CASCADE,
        related_name='club_user_phones',
        verbose_name='Телефон',
        null=True,
        blank=True
    )
    telegram_id = models.CharField(
        verbose_name='Телеграм ID',
        unique=True
    )
    monthly_points = models.IntegerField(
        verbose_name='Очки',
        default=0
    )
    available_spins = models.IntegerField(
        verbose_name='Спины',
        default=1
    )
    last_spin = models.DateTimeField(
        verbose_name='Последний спин',
        blank=True,
        null=True
    )
    total_spins = models.IntegerField(
        verbose_name='Всего спинов',
        default=0
    )
    daily_streak = models.IntegerField(
        verbose_name='Ежедневный стрик',
        default=0
    )

    class Meta:
        ordering = ('username',)
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self) -> str:
        return self.username

    def can_spin(self) -> bool:
        return self.available_spins > 0

    def remove_spin(self):
        self.last_spin = timezone.now()
        self.available_spins -= 1
        self.total_spins += 1

        self.save(update_fields=[
            'last_spin',
            'available_spins',
            'total_spins'
        ])

    def update_daily_streak(self, previous_claim_at):
        """Count a new claim, continuing only claims less than 48 hours
        apart."""
        if (
            previous_claim_at
            and timezone.now() < previous_claim_at + timedelta(days=2)
        ):
            User.objects.filter(pk=self.pk).update(
                daily_streak=F('daily_streak') + 1
            )
        else:
            User.objects.filter(pk=self.pk).update(daily_streak=1)
        self.refresh_from_db(fields=['daily_streak'])

    def current_daily_streak(self):
        """Clear an abandoned streak when it is read, even between scheduler
        runs."""
        if self.daily_streak:
            cutoff = timezone.now() - timedelta(days=2)
            expired = (User.objects.filter(pk=self.pk, daily_streak__gt=0)
                       .exclude(bonuses__got_at__gt=cutoff)
                       .update(daily_streak=0))
            if expired:
                self.daily_streak = 0
        return self.daily_streak

    def reset_daily_streak(self):
        self.daily_streak = 0

        self.save(update_fields=['daily_streak'])

    def add_monthly_points(self, points: int):
        self.monthly_points += points

        self.save(update_fields=['monthly_points'])

    def reset_monthly_points(self):
        self.monthly_points = 0

        self.save(update_fields=['monthly_points'])

    def can_claim_daily_bonus(self) -> bool:
        latest_bonus = self.bonuses.first()

        if not latest_bonus:
            return True

        latest_bonus.check_expiration()
        is_resolved = latest_bonus.is_redeemed or latest_bonus.is_expired

        if not is_resolved:
            return False

        if timezone.now() < latest_bonus.got_at + timedelta(days=1):
            return False

        if latest_bonus.use_after and timezone.now() >= latest_bonus.use_after:
            return True

        # Fallback safeguard
        return timezone.now() >= latest_bonus.got_at + timedelta(days=1)


class ClubUser(models.Model):
    first_name = models.CharField(
        verbose_name='Имя',
        blank=True,
        null=True,
        max_length=150
    )
    last_name = models.CharField(
        verbose_name='Фамилия',
        blank=True,
        null=True,
        max_length=150
    )
    middle_name = models.CharField(
        verbose_name='Отчество',
        blank=True,
        null=True,
        max_length=150
    )
    mobile_phone = models.CharField(
        verbose_name='Номер телефона',
        unique=True,
        primary_key=True,
        max_length=15
    )
    age = models.PositiveSmallIntegerField(
        verbose_name='Возраст',
        default=1
    )

    class Meta:
        ordering = ('mobile_phone',)
        verbose_name = 'Клубный пользователь'
        verbose_name_plural = 'Клубные пользователи'

    def __str__(self):
        return self.mobile_phone


class ClubTransaction(models.Model):
    admin = models.ForeignKey(
        'User',
        verbose_name='Админ',
        on_delete=models.SET_NULL,
        null=True,
        related_name='processed_transactions'
    )
    user = models.ForeignKey(
        'User',
        verbose_name='Пользователь',
        on_delete=models.CASCADE,
        related_name='club_transactions'
    )
    amount_rub = models.PositiveIntegerField(
        verbose_name='Сумма чека',
    )
    check_number = models.CharField(
        verbose_name='Номер чека ФД',
        unique=True,
        max_length=200
    )
    spins_awarded = models.PositiveIntegerField(
        verbose_name='Полученные спины',
        blank=True
    )
    created_at = models.DateTimeField(
        verbose_name='Создан',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Транзакция'
        verbose_name_plural = 'Транзакции'

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        x_value = int(os.getenv('ONE_SPIN_MIN_TOP_UP', 1000))

        if is_new:
            self.spins_awarded = self.amount_rub // x_value

        super().save(*args, **kwargs)

        if is_new and self.spins_awarded > 0:
            self.user.available_spins += self.spins_awarded

            self.user.save(update_fields=['available_spins'])


class MonthlyLadderArchive(models.Model):
    month_name = models.CharField(
        verbose_name='Название месяца',
        max_length=50
    )
    year = models.PositiveIntegerField(
        verbose_name='Год'
    )
    month = models.PositiveIntegerField(
        verbose_name='Номер месяца'
    )
    total_players = models.PositiveIntegerField(
        verbose_name='Всего участников',
        default=0
    )
    total_points = models.BigIntegerField(
        verbose_name='Общая сумма очков',
        default=0
    )
    top_players = models.JSONField(
        verbose_name='Топ 10 игроков',
        default=list
    )
    created_at = models.DateTimeField(
        verbose_name='Дата архивации',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Архив ладдера'
        verbose_name_plural = 'Архивы ладдеров'
        ordering = ('-year', '-month')

    def __str__(self):
        return f"Ладдер: {self.month_name} {self.year}"
