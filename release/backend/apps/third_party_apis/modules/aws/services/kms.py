from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class KMSAdapter(BaseAWSServiceAdapter):
    service_key='kms'
    supported_operations=frozenset(('execute', 'monitor'))
