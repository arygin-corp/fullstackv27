from django.db import models


class AwsEnvironment(models.TextChoices):
    DEMO = "demo", "Demo"
    DEV = "dev", "Dev"
    STAGE = "stage", "Stage"
    QA = "qa", "QA"
    PROD = "prod", "Prod"


RESOURCE_CATEGORIES = {
    "api_gateway": "API & Integration",
    "eventbridge": "API & Integration",
    "sns": "API & Integration",
    "sqs": "API & Integration",
    "step_functions": "API & Integration",
    "ec2": "Compute",
    "lambda": "Compute",
    "ecr": "Containers",
    "ecs": "Containers",
    "eks": "Containers",
    "fargate": "Containers",
    "s3": "Storage",
    "aurora": "Databases",
    "dynamodb": "Databases",
    "rds": "Databases",
    "redshift": "Databases",
    "athena": "Analytics & Data",
    "emr": "Analytics & Data",
    "glue": "Analytics & Data",
    "iam": "Security & Identity",
    "kms": "Security & Identity",
    "secrets_manager": "Security & Identity",
    "cloudtrail": "Observability & Audit",
    "cloudwatch": "Observability & Audit",
    "cloudformation": "Infrastructure",
    "cloudfront": "Networking & Delivery",
    "route53": "Networking & Delivery",
    "ses": "Messaging",
    "bedrock": "AI / ML",
    "sagemaker": "AI / ML",
}


SERVICE_SUMMARIES = {
    "api_gateway": "HTTP APIs that front marketplace and integration traffic.",
    "eventbridge": "Event bus for routing application and AWS events.",
    "sns": "Publish and subscribe notifications to topics.",
    "sqs": "Queues for decoupling jobs and request processing.",
    "step_functions": "Workflow orchestration across AWS services.",
    "ec2": "Virtual servers for workloads that run on instances.",
    "lambda": "Functions that run integration and processing code.",
    "ecr": "Container image registry for application builds.",
    "ecs": "Container services for long-running application tasks.",
    "eks": "Kubernetes clusters for containerized workloads.",
    "fargate": "Serverless compute for ECS and EKS tasks.",
    "s3": "Object storage for files, exports, and data products.",
    "aurora": "Managed relational database compatible with MySQL and PostgreSQL.",
    "dynamodb": "Key-value and document database for application state.",
    "rds": "Managed relational databases.",
    "redshift": "Warehouse for analytical queries.",
    "athena": "SQL queries over data stored in S3.",
    "emr": "Managed clusters for large-scale data processing.",
    "glue": "Data catalog and ETL jobs.",
    "iam": "Identities and permissions for AWS access.",
    "kms": "Encryption keys for data and secrets.",
    "secrets_manager": "Stored credentials and other secrets.",
    "cloudtrail": "Account activity history for audit.",
    "cloudwatch": "Metrics, logs, and alarms.",
    "cloudformation": "Infrastructure templates for AWS resources.",
    "cloudfront": "Content delivery in front of origins.",
    "route53": "DNS records for application endpoints.",
    "ses": "Email sending for notifications.",
    "bedrock": "Foundation models for application features.",
    "sagemaker": "Model training and inference endpoints.",
}


def resource_category(resource_type):
    return RESOURCE_CATEGORIES.get(resource_type, "Other")


def service_summary(resource_type):
    return SERVICE_SUMMARIES.get(resource_type, "")


def parity_status(configured_count, enabled_count):
    """Return the parity cell for one resource type in one environment."""
    if enabled_count:
        noun = "resource" if enabled_count == 1 else "resources"
        return "ok", f"{enabled_count} enabled {noun}"
    if configured_count:
        return "attention", "Configured but disabled"
    return "missing", "Not configured"


class AwsResourceType(models.TextChoices):
    # API & Integration
    API_GATEWAY = "api_gateway", "Amazon API Gateway"
    EVENTBRIDGE = "eventbridge", "Amazon EventBridge"
    SNS = "sns", "Amazon SNS"
    SQS = "sqs", "Amazon SQS"
    STEP_FUNCTIONS = "step_functions", "AWS Step Functions"

    # Compute
    EC2 = "ec2", "Amazon EC2"
    LAMBDA = "lambda", "AWS Lambda"

    # Containers
    ECR = "ecr", "Amazon ECR"
    ECS = "ecs", "Amazon ECS"
    EKS = "eks", "Amazon EKS"
    FARGATE = "fargate", "AWS Fargate"

    # Storage
    S3 = "s3", "Amazon S3"

    # Databases
    AURORA = "aurora", "Amazon Aurora"
    DYNAMODB = "dynamodb", "Amazon DynamoDB"
    RDS = "rds", "Amazon RDS"
    REDSHIFT = "redshift", "Amazon Redshift"

    # Analytics & Data
    ATHENA = "athena", "Amazon Athena"
    EMR = "emr", "Amazon EMR"
    GLUE = "glue", "AWS Glue"

    # Security & Identity
    IAM = "iam", "AWS IAM"
    KMS = "kms", "AWS KMS"
    SECRETS_MANAGER = "secrets_manager", "AWS Secrets Manager"

    # Observability & Audit
    CLOUDTRAIL = "cloudtrail", "AWS CloudTrail"
    CLOUDWATCH = "cloudwatch", "Amazon CloudWatch"

    # Infrastructure
    CLOUDFORMATION = "cloudformation", "AWS CloudFormation"

    # Networking & Delivery
    CLOUDFRONT = "cloudfront", "Amazon CloudFront"
    ROUTE53 = "route53", "Amazon Route 53"

    # Messaging / Email
    SES = "ses", "Amazon SES"

    # AI / ML
    BEDROCK = "bedrock", "Amazon Bedrock"
    SAGEMAKER = "sagemaker", "Amazon SageMaker"
