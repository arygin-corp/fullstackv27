from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class CloudWatchAdapter(BaseAWSServiceAdapter):
    service_key='cloudwatch'
    supported_operations=frozenset(('read', 'query', 'monitor'))
