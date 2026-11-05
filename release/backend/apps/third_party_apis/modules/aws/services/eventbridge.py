from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class EventBridgeAdapter(BaseAWSServiceAdapter):
    service_key='eventbridge'
    supported_operations=frozenset(('publish', 'monitor'))
