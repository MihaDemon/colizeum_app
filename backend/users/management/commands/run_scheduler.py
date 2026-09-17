from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        'Run recurring guest synchronization and monthly ladder jobs.'
    )

    def handle(self, *args, **options):
        from apscheduler.schedulers.blocking import BlockingScheduler
        from django_apscheduler.jobstores import DjangoJobStore

        from users.scheduler import configure_scheduler

        scheduler = BlockingScheduler()
        scheduler.add_jobstore(DjangoJobStore(), "default")
        configure_scheduler(scheduler)

        self.stdout.write(
            self.style.SUCCESS(
                'Scheduler started: guest sync every 15 minutes; '
                'monthly ladder check every minute.'
            )
        )

        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            scheduler.shutdown(wait=False)
