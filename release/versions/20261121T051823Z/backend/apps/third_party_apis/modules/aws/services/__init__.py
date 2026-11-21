from .registry import AWS_SERVICE_REGISTRY,get_adapter,register_adapter,UnknownAWSServiceAdapter
from . import s3, lambda_, dynamodb, rds, sqs, sns, eventbridge, api_gateway, secrets_manager, kms, cloudwatch, athena, glue  # noqa: F401
