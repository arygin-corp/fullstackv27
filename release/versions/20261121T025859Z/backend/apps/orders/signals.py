# apps/orders/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Request, Task
from .utils import export_master_orders_json

@receiver(post_save, sender=Request)
@receiver(post_delete, sender=Request)
@receiver(post_save, sender=Task)
@receiver(post_delete, sender=Task)
def trigger_order_master_export(sender, **kwargs):
    export_master_orders_json()