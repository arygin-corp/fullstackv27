from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class SecretsManagerAdapter(BaseAWSServiceAdapter):
    service_key='secrets_manager'
    supported_operations=frozenset(('read', 'update', 'monitor'))
