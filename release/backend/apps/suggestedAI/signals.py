from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import ProductEmbedding, HistoricalRequestEmbedding

_MODEL = None


def embedding_model():
    """Load MiniLM only when an embedding row is saved."""
    global _MODEL
    if _MODEL is False:
        return None
    if _MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            try:
                _MODEL = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
            except Exception:
                _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _MODEL = False
    return _MODEL or None


@receiver(post_save, sender=ProductEmbedding)
def auto_vectorize_product(sender, instance, created, **kwargs):
    """Automatically updates the AI vector whenever a product is created or edited."""
    # Prevent infinite recursion if saving again
    if hasattr(instance, '_skip_signal'): return

    model = embedding_model()
    if model:
        # Combine name and metadata for a rich search query
        text_to_vectorize = f"{instance.product_name} {instance.metadata}".lower()
        vector = model.encode(text_to_vectorize).tolist()

        # Save the vector back to the model
        instance.vector = vector
        instance._skip_signal = True
        instance.save()


@receiver(post_save, sender=HistoricalRequestEmbedding)
def auto_vectorize_history(sender, instance, created, **kwargs):
    """Automatically turns a past user request into a searchable AI signal."""
    if hasattr(instance, '_skip_signal'): return

    model = embedding_model()
    if model and instance.request_text:
        vector = model.encode(instance.request_text.lower()).tolist()

        instance.vector = vector
        instance._skip_signal = True
        instance.save()