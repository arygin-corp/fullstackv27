from .base import BaseAWSServiceAdapter
from .registry import register_adapter
@register_adapter
class S3Adapter(BaseAWSServiceAdapter):
    service_key='s3'
    supported_operations=frozenset(('list', 'read', 'write', 'delete', 'monitor'))
