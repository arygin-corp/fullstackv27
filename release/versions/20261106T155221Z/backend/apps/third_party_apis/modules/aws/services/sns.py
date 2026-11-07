from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class SNSAdapter(BaseAWSServiceAdapter):
    service_key='sns'
    supported_operations=frozenset(('publish', 'monitor'))
