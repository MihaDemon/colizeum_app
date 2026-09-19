from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _
from django.shortcuts import redirect, render
from django.urls import path

from .models import User, ClubUser, ClubTransaction, MonthlyLadderArchive
from .forms import AudienceFilterForm, CampaignSendForm
from .services import send_telegram_message, sync_guests_database
from wheel.models import PromocodePrize

admin.site.unregister(Group)


@admin.register(ClubUser)
class ClubUserAdmin(admin.ModelAdmin):
    list_display = (
        'mobile_phone',
        'last_name',
        'first_name',
        'middle_name',
        'age'
    )
    search_fields = (
        'mobile_phone',
        'first_name',
        'last_name',
        'middle_name'
    )
    list_filter = ('age',)
    ordering = ('last_name', 'first_name')
    change_list_template = "admin/users/clubuser/change_list.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'sync-db/',
                self.admin_site.admin_view(self.sync_db_view),
                name='users_clubuser_sync_db',
            ),
        ]
        return custom_urls + urls

    def sync_db_view(self, request):
        try:
            created, updated = sync_guests_database()
            self.message_user(
                request,
                f"Синхронизация завершена успешно! Создано: {created}, Обновлено: {updated}",
                messages.SUCCESS
            )
        except Exception as e:
            self.message_user(
                request,
                f"Ошибка во время синхронизации: {str(e)}",
                messages.ERROR
            )
        return redirect('admin:users_clubuser_changelist')


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    change_list_template = 'admin/users/user/change_list.html'

    # What shows up in the main list table
    list_display = (
        'username',
        'telegram_id',
        'mobile_phone',
        'available_spins',
        'monthly_points',
        'daily_streak',
        'is_active'
    )

    # Allows searching by username, telegram ID, or the related ClubUser's name/phone
    search_fields = (
        'username',
        'telegram_id',
        'mobile_phone__mobile_phone',
    )

    list_filter = (
        'is_active',
        'is_staff'
    )

    readonly_fields = ('last_spin',)

    # Organizes the detail/edit page into clean sections
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}), # Default Django fields
        ('Связь с клубом (Club Info)', {
            'fields': (
                'mobile_phone',
                'telegram_id'
            )
        }),
        ('Игровая статистика (Game Stats)', {
            'fields': (
                'available_spins',
                'total_spins',
                'monthly_points',
                'daily_streak',
                'last_spin'
            )
        }),
        (_('Permissions'), {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            ),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Required for creating a new user cleanly via the admin panel
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'telegram_id', 'mobile_phone', 'password'),
        }),
    )

    # Register custom bulk actions
    actions = ['grant_free_spin', 'reset_spins', 'reset_daily_streaks']

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'campaign/',
                self.admin_site.admin_view(self.campaign_view),
                name='users_user_campaign',
            ),
        ]
        return custom_urls + urls

    def campaign_view(self, request):
        """Filter users and send a message or existing-model promo code."""
        base_queryset = User.objects.select_related('mobile_phone').order_by(
            'username'
        )

        if request.method == 'POST':
            filter_form = AudienceFilterForm(request.POST)
            campaign_form = CampaignSendForm(request.POST)
        else:
            filter_form = AudienceFilterForm(request.GET or None)
            campaign_form = CampaignSendForm()

        users_queryset = filter_form.filter_queryset(base_queryset)

        if request.method == 'POST' and (
            filter_form.is_valid() and campaign_form.is_valid()
        ):
            if campaign_form.cleaned_data['send_to_all_filtered']:
                recipients = users_queryset
            else:
                selected_ids = request.POST.getlist('user_ids')
                recipients = users_queryset.filter(pk__in=selected_ids)

            if not recipients.exists():
                self.message_user(
                    request,
                    'Выберите хотя бы одного пользователя или включите отправку всем найденным.',
                    messages.ERROR
                )
            else:
                sent, failed = self._send_campaign(
                    recipients,
                    campaign_form.cleaned_data
                )
                self.message_user(
                    request,
                    f'Отправлено: {sent}. Ошибок: {failed}.',
                    messages.SUCCESS if not failed else messages.WARNING
                )

                return redirect(request.path)

        return render(
            request,
            'admin/users/user/campaign.html',
            {
                **self.admin_site.each_context(request),
                'title': 'Рассылка пользователям',
                'filter_form': filter_form,
                'campaign_form': campaign_form,
                'users': users_queryset[:500],
                'matched_count': users_queryset.count(),
            }
        )

    def _send_campaign(self, recipients, campaign_data):
        sent = 0
        failed = 0

        for user in recipients.iterator():
            promo = None
            try:
                if not user.telegram_id:
                    failed += 1
                    continue

                replacements = {
                    'username': user.username,
                    'label': campaign_data.get('promo_label', ''),
                    'value': campaign_data.get('promo_value', ''),
                    'promo_code': '',
                }

                if campaign_data['campaign_type'] == 'promo':
                    promo = PromocodePrize.objects.create(
                        user=user,
                        label=campaign_data['promo_label'],
                        internal_value=campaign_data['promo_value'],
                    )
                    replacements['promo_code'] = promo.promo_code

                message_text = campaign_data['message'].format(**replacements)

                if promo and '{promo_code}' not in campaign_data['message']:
                    message_text = (
                        f'{message_text}\n\nПромокод: {promo.promo_code}'
                    )

                delivered, _ = send_telegram_message(
                    user.telegram_id,
                    message_text
                )
                if delivered:
                    sent += 1
                else:
                    failed += 1
                    if promo:
                        promo.delete()
            except Exception:
                failed += 1
                if promo:
                    promo.delete()

        return sent, failed

    # --- Custom Admin Bulk Actions ---

    @admin.action(description='Выдать 1 бесплатный спин')
    def grant_free_spin(self, request, queryset):
        for user in queryset:
            user.spins += 1
            user.save(update_fields=['available_spins'])
        self.message_user(request, f"Выдан 1 спин для {queryset.count()} пользователей.")

    @admin.action(description='Сбросить спины до 0')
    def reset_spins(self, request, queryset):
        updated = queryset.update(available_spins=0)
        self.message_user(request, f"Спины обнулены у {updated} пользователей.")

    @admin.action(description='Обнулить стрик (Daily Streak)')
    def reset_daily_streaks(self, request, queryset):
        updated = queryset.update(daily_streak=0)
        self.message_user(request, f"Ежедневный стрик сброшен у {updated} пользователей.")


@admin.register(ClubTransaction)
class ClubTransactionAdmin(admin.ModelAdmin):
    # What shows up in the main list table
    list_display = (
        'check_number',
        'user',
        'amount_rub',
        'spins_awarded',
        'admin',
        'created_at'
    )

    # Filters on the right sidebar
    list_filter = (
        'created_at',
        'admin'
    )

    # Search box functionality
    search_fields = (
        'check_number',
        'user__username',
        'user__telegram_id',
        'user__mobile_phone__mobile_phone',
        'admin__username'
    )

    # Make auto-calculated fields read-only to prevent accidental overwrites
    readonly_fields = (
        'user',
        'amount_rub',
        'check_number',
        'admin',
        'spins_awarded',
        'created_at'
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    # Organizes the detail/edit page into clean sections
    fieldsets = (
        ('Информация о чеке (Receipt Info)', {
            'fields': (
                'check_number',
                'amount_rub',
                'spins_awarded'
            )
        }),
        ('Участники (Participants)', {
            'fields': (
                'user',
                'admin'
            )
        }),
        ('Даты (Dates)', {
            'fields': (
                'created_at',
            )
        }),
    )


@admin.register(MonthlyLadderArchive)
class MonthlyLadderArchiveAdmin(admin.ModelAdmin):
    list_display = (
        'month_name',
        'year',
        'total_players',
        'total_points',
        'created_at'
    )
    list_filter = ('year', 'month')
    search_fields = ('month_name', 'year')
    readonly_fields = (
        'month_name',
        'year',
        'month',
        'total_players',
        'total_points',
        'top_players',
        'created_at'
    )

    def has_add_permission(self, request):
        # Archives should only be generated automatically 
        # by the background task
        return False
