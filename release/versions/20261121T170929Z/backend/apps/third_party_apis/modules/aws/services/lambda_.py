from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class LambdaAdapter(BaseAWSServiceAdapter):
    service_key='lambda'
    supported_operations=frozenset(('execute', 'read', 'update', 'monitor'))
