import os

from django.conf import settings
from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'
    verbose_name = 'Пользователи'

    def ready(self):
        # Keep the development autoreloader from starting duplicate jobs.
        # Production runs the dedicated `run_scheduler` command instead.
        if not settings.DEBUG or os.environ.get('RUN_MAIN') != 'true':
            return

        from .scheduler import start_background_scheduler

        start_background_scheduler()
