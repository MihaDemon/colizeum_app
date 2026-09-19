from datetime import timedelta

from django import forms
from django.db.models import Q
from django.utils import timezone


class AudienceFilterForm(forms.Form):
    last_login_days = forms.IntegerField(
        label='Не заходил больше дней чем',
        required=False,
        min_value=0,
        max_value=36500,
        widget=forms.NumberInput(attrs={'min': 0, 'placeholder': '30'})
    )
    min_total_spins = forms.IntegerField(
        label='Спинов больше чем',
        required=False,
        min_value=0
    )
    min_daily_streak = forms.IntegerField(
        label='Стрик больше чем',
        required=False,
        min_value=0
    )
    active_only = forms.BooleanField(
        label='Только активные пользователи',
        required=False,
        initial=True
    )

    search = forms.CharField(label='Никнейм, Telegram ID или телефон', required=False)
    login_within_days = forms.IntegerField(label='Заходил за последние N дней', required=False, min_value=0, max_value=36500)
    never_logged_in = forms.BooleanField(label='Никогда не заходил', required=False)
    joined_from = forms.DateField(label='Регистрация с', required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    joined_to = forms.DateField(label='Регистрация по', required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    max_total_spins = forms.IntegerField(label='Всего спинов не больше', required=False, min_value=0)
    max_daily_streak = forms.IntegerField(label='Стрик не больше', required=False, min_value=0)
    min_available_spins = forms.IntegerField(label='Доступных спинов от', required=False, min_value=0)
    max_available_spins = forms.IntegerField(label='Доступных спинов до', required=False, min_value=0)
    min_monthly_points = forms.IntegerField(label='Очков месяца от', required=False, min_value=0)
    max_monthly_points = forms.IntegerField(label='Очков месяца до', required=False, min_value=0)
    staff = forms.ChoiceField(label='Роль', required=False, choices=[('', 'Все'), ('players', 'Игроки'), ('staff', 'Администраторы')])

    def clean(self):
        values = super().clean()
        for lower, upper, strict in [
            ('min_total_spins', 'max_total_spins', True),
            ('min_daily_streak', 'max_daily_streak', True),
            ('min_available_spins', 'max_available_spins', False),
            ('min_monthly_points', 'max_monthly_points', False),
            ('joined_from', 'joined_to', False),
        ]:
            lo, hi = values.get(lower), values.get(upper)
            if lo is not None and hi is not None and (lo > hi or (strict and lo == hi)):
                self.add_error(upper, 'Проверьте границы диапазона.')
        if values.get('never_logged_in') and values.get('login_within_days') is not None:
            self.add_error('login_within_days', 'Несовместимо с фильтром «Никогда не заходил».')
        return values

    def filter_queryset(self, queryset):
        if self.is_bound and not self.is_valid():
            return queryset.none()
        if self.is_bound and self.is_valid():
            values = self.cleaned_data
        else:
            values = {
                'last_login_days': '',
                'min_total_spins': None,
                'min_daily_streak': None,
                'active_only': True,
            }

        if values['active_only']:
            queryset = queryset.filter(is_active=True)

        if values['last_login_days'] not in ('', None):
            cutoff = timezone.now() - timedelta(
                days=int(values['last_login_days'])
            )
            queryset = queryset.filter(
                Q(last_login__lt=cutoff) | Q(last_login__isnull=True)
            )

        if values['min_total_spins'] is not None:
            queryset = queryset.filter(
                total_spins__gt=values['min_total_spins']
            )

        if values['min_daily_streak'] is not None:
            queryset = queryset.filter(
                daily_streak__gt=values['min_daily_streak']
            )

        if values.get('search'):
            term = values['search']
            queryset = queryset.filter(Q(username__icontains=term) | Q(telegram_id__icontains=term) | Q(mobile_phone__mobile_phone__icontains=term))
        if values.get('login_within_days') is not None:
            queryset = queryset.filter(last_login__gte=timezone.now() - timedelta(days=values['login_within_days']))
        if values.get('never_logged_in'):
            queryset = queryset.filter(last_login__isnull=True)
        for field, lookup in {
            'joined_from': 'date_joined__date__gte', 'joined_to': 'date_joined__date__lte',
            'max_total_spins': 'total_spins__lte', 'max_daily_streak': 'daily_streak__lte',
            'min_available_spins': 'available_spins__gte', 'max_available_spins': 'available_spins__lte',
            'min_monthly_points': 'monthly_points__gte', 'max_monthly_points': 'monthly_points__lte',
        }.items():
            if values.get(field) is not None:
                queryset = queryset.filter(**{lookup: values[field]})
        if values.get('staff'):
            queryset = queryset.filter(is_staff=values['staff'] == 'staff')
        return queryset


class CampaignSendForm(forms.Form):
    campaign_type = forms.ChoiceField(
        label='Тип рассылки',
        choices=(
            ('message', 'Информационное сообщение'),
            ('promo', 'Персональный промокод'),
        )
    )
    message = forms.CharField(
        label='Текст сообщения',
        widget=forms.Textarea(attrs={'rows': 5}),
        help_text=(
            'Для промокодов можно использовать {promo_code}, {label} '
            'и {value}.'
        )
    )
    promo_label = forms.CharField(
        label='Название промокода',
        required=False,
        max_length=50
    )
    promo_value = forms.CharField(
        label='Содержимое промокода',
        required=False,
        max_length=50
    )
    send_to_all_filtered = forms.BooleanField(
        label='Отправить всем найденным пользователям',
        required=False
    )

    def clean(self):
        cleaned_data = super().clean()

        if cleaned_data.get('campaign_type') == 'promo':
            if not cleaned_data.get('promo_label'):
                self.add_error('promo_label', 'Укажите название промокода.')
            if not cleaned_data.get('promo_value'):
                self.add_error('promo_value', 'Укажите содержимое промокода.')

        if not cleaned_data.get('message'):
            self.add_error('message', 'Введите текст сообщения.')

        return cleaned_data
