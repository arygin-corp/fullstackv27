import numpy as np
from django.db.models.signals import post_save
from django.dispatch import receiver
from sentence_transformers import SentenceTransformer

# Load model once on startup
try:
    MODEL = SentenceTransformer('all-MiniLM-L6-v2')
except:
    MODEL = None

from .models import ProductEmbedding, HistoricalRequestEmbedding


@receiver(post_save, sender=ProductEmbedding)
def auto_vectorize_product(sender, instance, created, **kwargs):
    """Automatically updates the AI vector whenever a product is created or edited."""
    # Prevent infinite recursion if saving again
    if hasattr(instance, '_skip_signal'): return

    if MODEL:
        # Combine name and metadata for a rich search query
        text_to_vectorize = f"{instance.product_name} {instance.metadata}".lower()
        vector = MODEL.encode(text_to_vectorize).tolist()

        # Save the vector back to the model
        instance.vector = vector
        instance._skip_signal = True
        instance.save()


@receiver(post_save, sender=HistoricalRequestEmbedding)
def auto_vectorize_history(sender, instance, created, **kwargs):
    """Automatically turns a past user request into a searchable AI signal."""
    if hasattr(instance, '_skip_signal'): return

    if MODEL and instance.request_text:
        vector = MODEL.encode(instance.request_text.lower()).tolist()

        instance.vector = vector
        instance._skip_signal = True
        instance.save()