from django.db.models import Q
from ..platform_models import SearchDocument
class SearchService:
 @staticmethod
 def search(query,tenant_key,limit=50):
  return SearchDocument.objects.filter(tenant_key=tenant_key).filter(Q(title__icontains=query)|Q(body__icontains=query))[:limit]
