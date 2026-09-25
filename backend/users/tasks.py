from datetime import timedelta

from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
from django.db.models import Sum
from django.contrib.auth import get_user_model

from .models import MonthlyLadderArchive

User = get_user_model()


def reset_expired_daily_streaks():
    """Persist streak expiry for users who have not opened the app."""
    cutoff = timezone.now() - timedelta(days=2)
    User.objects.filter(daily_streak__gt=0).exclude(
        bonuses__got_at__gt=cutoff
    ).update(daily_streak=0)


def check_and_reset_monthly_ladder():
    """
    Runs periodically and resets the ladder once when a new month starts.

    The latest archive restores the last processed month after a scheduler
    restart. The cache is only an optimization and does not need to persist
    between processes.
    """
    now = timezone.localtime(timezone.now())
    current_month = now.month
    current_year = now.year
    current_period = (current_year, current_month)

    if current_month == 1:
        previous_period = (current_year - 1, 12)
    else:
        previous_period = (current_year, current_month - 1)

    # Create a unique cache key for the last processed month.
    cache_key = 'last_ladder_reset_month'
    last_processed = cache.get(cache_key)

    if not last_processed:
        latest_archive = MonthlyLadderArchive.objects.first()
        if latest_archive:
            latest_period = (latest_archive.year, latest_archive.month)

            # If the previous month is already archived, the reset completed
            # before the cache was lost. Do not erase points earned this month.
            if latest_period == previous_period:
                cache.set(cache_key, current_period, timeout=None)
                return

            # Sync cache with what's actually stored in the database
            last_processed = latest_period

            cache.set(cache_key, last_processed, timeout=None)

            print(
                (
                    "[Ladder DEV] Startup sync: Last archived month in DB is "
                    f"{latest_archive.month_name} {latest_archive.year}."
                )
            )
        else:
            # Do not wipe points on the first ever scheduler run. Establish
            # the current month as the starting period instead.
            last_processed = current_period
            cache.set(cache_key, last_processed, timeout=None)
            return

    # Compare current year/month with what's stored in the cache
    if last_processed != current_period:
        active_users = User.objects.filter(monthly_points__gt=0)

        total_players_count = active_users.count()

        total_points_sum = active_users.aggregate(
            total=Sum('monthly_points')
        )['total'] or 0

        # Extract top 10 players
        top_10_queryset = active_users.order_by('-monthly_points')[:10]
        top_players_list = [
            {
                "position": idx + 1,
                "username": user.username,
                "telegram_id": user.telegram_id,
                "monthly_points": user.monthly_points
            }
            for idx, user in enumerate(top_10_queryset)
        ]

        # Russian month names mapping
        months_ru = {
            1: 'Январь', 2: 'Февраль', 3: 'Март', 4: 'Апрель',
            5: 'Май', 6: 'Июнь', 7: 'Июль', 8: 'Август',
            9: 'Сентябрь', 10: 'Октябрь', 11: 'Ноябрь', 12: 'Декабрь'
        }
        archive_year, archive_month = last_processed
        month_str = months_ru.get(archive_month, str(archive_month))

        # Archive the period whose points are currently accumulated, then
        # reset them in the same transaction. In a normal run this is the
        # immediately previous calendar month.
        with transaction.atomic():
            MonthlyLadderArchive.objects.create(
                month_name=month_str,
                year=archive_year,
                month=archive_month,
                total_players=total_players_count,
                total_points=total_points_sum,
                top_players=top_players_list
            )

            User.objects.all().update(monthly_points=0)

        # Save the current month into cache so the next check is a no-op.
        cache.set(cache_key, current_period, timeout=None)

        print(
            (
                "[Ladder] Monthly points reset successfully for "
                f"{archive_month}/{archive_year}."
            )
        )
