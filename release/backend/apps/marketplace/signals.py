import threading

from django.conf import settings
from django.db import connections, transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.orders.models import Request, Task, UserActivity
from .badge_rules import end_to_end_apply_in_progress, propagate_end_to_end, sync_calculated_badges
from .models import ADGroup, Domain, EndToEndSolutionProduct, Product, Review, SubDomain_1, SubDomain_2
from .tasks import (
    export_ad_groups_task,
    export_domains_task,
    export_orders_task,
    export_products_task,
    generate_product_embedding,
    run_denodo_export_sequence,
)


def _spawn(func):
    def run():
        try:
            func()
        finally:
            connections.close_all()

    threading.Thread(target=run, daemon=True).start()


def _after_response(func):
    """Run follow-up work after the save commits, without holding the request."""
    transaction.on_commit(lambda: _spawn(func))


def _enqueue(task, *args, **kwargs):
    def start():
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            _spawn(lambda: task.run(*args, **kwargs))
            return
        task.delay(*args, **kwargs)

    transaction.on_commit(start)


def _sync_badges(include_associations=False):
    _after_response(lambda: sync_calculated_badges(include_associations=include_associations))


@receiver(post_save, sender=Product)
def trigger_product_save_actions(sender, instance, **kwargs):
    """Refresh exports and enqueue one canonical embedding after commit."""
    _enqueue(export_products_task)
    _enqueue(generate_product_embedding, instance.id)
    _sync_badges()


@receiver(post_delete, sender=Product)
def trigger_product_delete_actions(sender, instance, **kwargs):
    _enqueue(export_products_task)


@receiver(post_save, sender=Domain)
@receiver(post_save, sender=SubDomain_1)
@receiver(post_save, sender=SubDomain_2)
@receiver(post_delete, sender=Domain)
@receiver(post_delete, sender=SubDomain_1)
@receiver(post_delete, sender=SubDomain_2)
def trigger_domain_export(sender, instance, **kwargs):
    _enqueue(export_domains_task)


@receiver(post_save, sender=ADGroup)
@receiver(post_delete, sender=ADGroup)
def trigger_adgroup_export(sender, instance, **kwargs):
    _enqueue(export_ad_groups_task)
    _enqueue(run_denodo_export_sequence)


@receiver(post_save, sender=Request)
@receiver(post_save, sender=Task)
@receiver(post_delete, sender=Request)
@receiver(post_delete, sender=Task)
def trigger_order_master_export(sender, **kwargs):
    _enqueue(export_orders_task)


@receiver(post_save, sender=Request)
@receiver(post_delete, sender=Request)
@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def refresh_calculated_badges(sender, **kwargs):
    _sync_badges()


@receiver(post_save, sender=EndToEndSolutionProduct)
@receiver(post_delete, sender=EndToEndSolutionProduct)
def refresh_end_to_end_badges(sender, instance=None, **kwargs):
    if end_to_end_apply_in_progress():
        return
    if instance is not None and getattr(instance, "product_id", None):
        rows = EndToEndSolutionProduct.objects.filter(product_id=instance.product_id).order_by("position", "id")
        ordered = [instance.product_id]
        for row in rows:
            if row.solution_product_id and row.solution_product_id not in ordered:
                ordered.append(row.solution_product_id)
        propagate_end_to_end(ordered)
    _sync_badges()


@receiver(post_save, sender=UserActivity)
def refresh_favorite_badges(sender, instance, **kwargs):
    if instance.action in {"favorite_add", "favorite_remove"}:
        _sync_badges()
