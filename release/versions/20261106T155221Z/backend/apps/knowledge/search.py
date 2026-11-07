from django.db.models import Count, Q
from .models import Document, Entity

def search_entities(user, query="", entity_type=""):
    qs = Entity.objects.filter(owner=user).annotate(document_count=Count("document_links", distinct=True))
    if query:
        qs = qs.filter(Q(canonical_name__icontains=query) | Q(description__icontains=query))
    if entity_type:
        qs = qs.filter(entity_type=entity_type)
    return qs

def search_documents(user, query="", entity_type=""):
    qs = Document.objects.filter(owner=user).prefetch_related("entity_links__entity")
    if query:
        qs = qs.filter(Q(title__icontains=query) | Q(executive_summary__icontains=query) | Q(entity_links__entity__canonical_name__icontains=query) | Q(entity_links__entity__description__icontains=query)).distinct()
    if entity_type:
        qs = qs.filter(entity_links__entity__entity_type=entity_type).distinct()
    return qs
