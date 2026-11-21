from django.core.cache import cache
class WorkflowCache:
 @staticmethod
 def definition(key,version,loader,seconds=300):return cache.get_or_set(f'workflow:{key}:{version}',loader,seconds)
 @staticmethod
 def invalidate(key,version):cache.delete(f'workflow:{key}:{version}')
