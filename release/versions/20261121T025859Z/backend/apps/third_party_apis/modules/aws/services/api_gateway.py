from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class APIGatewayAdapter(BaseAWSServiceAdapter):
    service_key='api_gateway'
    supported_operations=frozenset(('execute', 'monitor'))
