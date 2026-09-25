from datetime import timedelta

from django.utils import timezone


def configure_scheduler(scheduler):
    """Register all recurring users-app jobs on an APScheduler instance."""
    from .services import sync_club_transactions, sync_guests_database
    from .tasks import (
        check_and_reset_monthly_ladder,
        reset_expired_daily_streaks
    )

    scheduler.add_job(
        reset_expired_daily_streaks,
        'interval',
        minutes=1,
        id='daily_streak_reset_job',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        next_run_time=timezone.now(),
    )

    scheduler.add_job(
        check_and_reset_monthly_ladder,
        'interval',
        minutes=1,
        id='monthly_ladder_reset_job',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        next_run_time=timezone.now(),
    )
    scheduler.add_job(
        sync_guests_database,
        'interval',
        minutes=15,
        id='guests_sync_job',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        next_run_time=timezone.now(),
    )
    scheduler.add_job(
        sync_club_transactions,
        'interval',
        minutes=15,
        id='club_transactions_sync_job',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        # Run after the guest sync so newly imported club users can receive
        # spins in the same scheduler cycle.
        next_run_time=timezone.now() + timedelta(minutes=1),
    )


def start_background_scheduler():
    """Start the non-blocking scheduler used by Django development server."""
    from apscheduler.schedulers.background import BackgroundScheduler
    from django_apscheduler.jobstores import DjangoJobStore

    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")
    configure_scheduler(scheduler)
    scheduler.start()
    print(
        "Background scheduler started: guest sync every 15 minutes; "
        "club transaction sync every 15 minutes; "
        "monthly ladder check every minute; daily streak check every minute."
    )
