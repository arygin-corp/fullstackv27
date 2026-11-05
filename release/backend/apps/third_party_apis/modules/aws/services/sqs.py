from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class SQSAdapter(BaseAWSServiceAdapter):
    service_key='sqs'
    supported_operations=frozenset(('publish', 'consume', 'monitor'))
