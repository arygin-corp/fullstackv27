from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class AthenaAdapter(BaseAWSServiceAdapter):
    service_key='athena'
    supported_operations=frozenset(('query', 'monitor'))
