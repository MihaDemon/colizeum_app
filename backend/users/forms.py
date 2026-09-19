from datetime import timedelta

from django import forms
from django.db.models import Q
from django.utils import timezone


class AudienceFilterForm(forms.Form):
    last_login_days = forms.IntegerField(
        label='Не заходил больше дней чем',
        required=False,
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

    def filter_queryset(self, queryset):
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

        if values['last_login_days']:
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
