import os

from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'
    verbose_name = 'Пользователи'

    def ready(self):
        # Prevent scheduler from running twice during autoreload in development
        if os.environ.get('RUN_MAIN') != 'true':
            return

        from apscheduler.schedulers.background import BackgroundScheduler
        from django_apscheduler.jobstores import DjangoJobStore
        from .tasks import check_and_reset_monthly_ladder

        scheduler = BackgroundScheduler()
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Add the job to run every 1 minutes
        scheduler.add_job(
            check_and_reset_monthly_ladder,
            'interval',
            minutes=1,
            id='monthly_ladder_reset_job',
            replace_existing=True,
        )

        scheduler.start()
        print(
            (
                "Background scheduler started: Monthly ladder "
                "checker running every 1 minute."
            )
            )
