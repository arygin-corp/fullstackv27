## Important Notes

- **⚠️ CRITICAL**: Never store actual secret values in Terraform state files. This module only manages infrastructure, not secret content.
- **⚠️ IMPORTANT**: Always implement proper rotation for production secrets. The `rotate_immediately = true` setting triggers immediate rotation.
- **🔐 ENCRYPTION**: Each secret will be encrypted with its own KMS key unless a custom `existing_kms_key_id` is specified.
- **🔄 ROTATION**: Each secret must specify its own `existing_rotation_lambda_name`. See: [Rotation by Lambda function](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda.html)
- **📚 LAMBDA CREATION**: For creating rotation Lambda functions, see: [CI Pipeline for Python Serverless](https://chofer.cloud.toyota.com/docs/default/component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/ci-pipeline-cipysls-gha/) and [TDP Samples Python Serverless](https://github.com/Toyota-Motor-North-America/tdp-samples-python-serverless)
## KMS Key Management
- **🔒 Safe Key Updates**: Changing `existing_kms_key_id` is safe and non-disruptive - your secrets remain accessible during updates
- **🔄 Flexible Encryption**: Switch between auto-generated and custom KMS keys anytime without recreating secrets or losing data