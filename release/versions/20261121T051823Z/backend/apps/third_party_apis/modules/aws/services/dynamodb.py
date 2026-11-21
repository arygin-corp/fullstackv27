from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class DynamoDBAdapter(BaseAWSServiceAdapter):
    service_key='dynamodb'
    supported_operations=frozenset(('read', 'write', 'query', 'monitor'))
