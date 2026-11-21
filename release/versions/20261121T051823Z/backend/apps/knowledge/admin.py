from django.contrib import admin
from .models import Document, DocumentChunk, DocumentEntity, Entity, EntityRelation, TimelineEvent

models_to_register = [
    Document,
    DocumentChunk,
    DocumentEntity,
    Entity,
    EntityRelation,
    TimelineEvent,
]
for model in models_to_register:
    admin.site.register(model)
