import logging

from celery import shared_task
from django.core.management import call_command
from django.utils.html import strip_tags

from .models import Product, SearchProductEmbedding
from .search_services import encode_search_text
from .utils import (
    export_active_products_json,
    export_active_ad_groups_json,
    export_master_orders_json,
    export_active_domains_json,
)

logger = logging.getLogger(__name__)


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def generate_product_embedding(product_id):
    """Create or refresh the single search embedding for a product."""
    try:
        product = Product.objects.select_related("domain", "datatype").get(id=product_id)
    except Product.DoesNotExist:
        logger.info("Skipping embedding because product %s no longer exists", product_id)
        return {"status": "not_found", "product_id": product_id}

    text_context = " ".join(
        part for part in [
            product.name or "",
            strip_tags(product.short_desc or ""),
            product.sku or "",
            product.datatype.name if product.datatype else "",
            product.domain.name if product.domain else "",
        ]
        if part
    )
    embedding = encode_search_text(text_context)
    SearchProductEmbedding.objects.update_or_create(
        product=product,
        defaults={"vector": embedding, "metadata": text_context},
    )
    return {"status": "updated", "product_id": product_id}


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def run_denodo_export_sequence():
    call_command("export_denodo")
    call_command("export_denodo_master")
    return "Denodo Metadata Sync Complete"


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def export_products_task():
    export_active_products_json()
    return "Products export completed"


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def export_ad_groups_task():
    export_active_ad_groups_json()
    return "AD Groups export completed"


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def export_domains_task():
    export_active_domains_json()
    return "Domains export completed"


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def export_orders_task():
    export_master_orders_json()
    return "Orders export completed"
