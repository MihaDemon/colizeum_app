from django.utils import timezone


def configure_scheduler(scheduler):
    """Register all recurring users-app jobs on an APScheduler instance."""
    from .services import sync_guests_database
    from .tasks import check_and_reset_monthly_ladder

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
        "monthly ladder check every minute."
    )
