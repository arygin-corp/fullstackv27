from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class RDSAdapter(BaseAWSServiceAdapter):
    service_key='rds'
    supported_operations=frozenset(('read', 'write', 'query', 'monitor'))
