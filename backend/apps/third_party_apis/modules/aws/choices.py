from django.db import models


class AwsEnvironment(models.TextChoices):
    DEMO = "demo", "Demo"
    DEV = "dev", "Dev"
    STAGE = "stage", "Stage"
    QA = "qa", "QA"
    PROD = "prod", "Prod"


from django.db import models


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
