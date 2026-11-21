from celery import shared_task

from .services import refresh_open_requests


@shared_task
def refresh_open_order_history():
    return refresh_open_requests()
