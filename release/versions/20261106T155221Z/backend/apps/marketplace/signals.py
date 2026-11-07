from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.orders.models import Request, Task
from .models import ADGroup, Domain, Product, SubDomain_1, SubDomain_2
from .tasks import (
    export_ad_groups_task,
    export_domains_task,
    export_orders_task,
    export_products_task,
    generate_product_embedding,
    run_denodo_export_sequence,
)


@receiver(post_save, sender=Product)
def trigger_product_save_actions(sender, instance, **kwargs):
    """Refresh exports and enqueue one canonical embedding after commit."""
    transaction.on_commit(export_products_task.delay)
    transaction.on_commit(lambda: generate_product_embedding.delay(instance.id))


@receiver(post_delete, sender=Product)
def trigger_product_delete_actions(sender, instance, **kwargs):
    transaction.on_commit(export_products_task.delay)


@receiver(post_save, sender=Domain)
@receiver(post_save, sender=SubDomain_1)
@receiver(post_save, sender=SubDomain_2)
@receiver(post_delete, sender=Domain)
@receiver(post_delete, sender=SubDomain_1)
@receiver(post_delete, sender=SubDomain_2)
def trigger_domain_export(sender, instance, **kwargs):
    transaction.on_commit(export_domains_task.delay)


@receiver(post_save, sender=ADGroup)
@receiver(post_delete, sender=ADGroup)
def trigger_adgroup_export(sender, instance, **kwargs):
    transaction.on_commit(export_ad_groups_task.delay)
    transaction.on_commit(run_denodo_export_sequence.delay)


@receiver(post_save, sender=Request)
@receiver(post_save, sender=Task)
@receiver(post_delete, sender=Request)
@receiver(post_delete, sender=Task)
def trigger_order_master_export(sender, **kwargs):
    transaction.on_commit(export_orders_task.delay)
