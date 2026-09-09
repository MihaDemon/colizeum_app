from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _
from django.shortcuts import redirect
from django.urls import path

from .models import User, ClubUser, ClubTransaction, MonthlyLadderArchive
from .services import sync_guests_database

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
        'spins_awarded',
        'created_at'
    )

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
        # Archives should only be generated automatically by the background task
        return False
