from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class GlueAdapter(BaseAWSServiceAdapter):
    service_key='glue'
    supported_operations=frozenset(('read', 'execute', 'monitor'))
