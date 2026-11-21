from .management.commands.publish_due_releases import Command


def publish_due_releases_task():
    """Scheduler-friendly entry point; invoke from Celery beat or a cron runner."""
    Command().handle()
