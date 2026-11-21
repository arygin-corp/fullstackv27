from django.db.models import Q
class SearchBackend:
 def search(self,query,filters,principals):raise NotImplementedError
class DatabaseSearchBackend(SearchBackend):
 def search(self,queryset,query,principals):return queryset.filter(Q(title__icontains=query)|Q(body__icontains=query)).filter(security_principals__overlap=principals)
