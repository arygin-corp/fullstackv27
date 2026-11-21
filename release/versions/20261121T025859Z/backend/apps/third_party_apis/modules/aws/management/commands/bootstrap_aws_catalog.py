from django.core.management.base import BaseCommand
from django.db import transaction
from ...models import AWSResourceType,AWSService
SERVICES={"s3":("Amazon S3","Storage",("bucket","Bucket")),"lambda":("AWS Lambda","Compute",("function","Function")),"dynamodb":("Amazon DynamoDB","Database",("table","Table")),"rds":("Amazon RDS","Database",("db-instance","DB Instance")),"sqs":("Amazon SQS","Messaging",("queue","Queue")),"sns":("Amazon SNS","Messaging",("topic","Topic")),"eventbridge":("Amazon EventBridge","Events",("event-bus","Event Bus")),"api_gateway":("Amazon API Gateway","API",("rest-api","REST API")),"secrets_manager":("AWS Secrets Manager","Security",("secret","Secret")),"kms":("AWS KMS","Security",("key","Key")),"cloudwatch":("Amazon CloudWatch","Monitoring",("alarm","Alarm")),"athena":("Amazon Athena","Data",("workgroup","Workgroup")),"glue":("AWS Glue","Data",("database","Database"))}
class Command(BaseCommand):
    @transaction.atomic
    def handle(self,*args,**options):
        for key,(name,category,resource_type) in SERVICES.items():
            service,_=AWSService.objects.update_or_create(key=key,defaults={"name":name,"category":category,"enabled":True})
            AWSResourceType.objects.update_or_create(service=service,key=resource_type[0],defaults={"name":resource_type[1],"enabled":True})
        self.stdout.write(self.style.SUCCESS("AWS service catalog bootstrapped."))
