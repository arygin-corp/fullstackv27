<!-- * AWS account where you want to deploy the Blueprint.
* **terraform:** `>= 1.5.7` installed to your local machine. -->


* AWS account with appropriate permissions for Secrets Manager, KMS, Lambda, and CloudWatch
* **terraform:** `>= 1.5.7`
* **aws provider:** `>= 5.0.0, < 6.0.0`
* VPC with private subnets
* IAM permissions for:
  - Secrets Manager
  - KMS
  - Lambda
* Existing Lambda rotation function implementing AWS Secrets Manager rotation interface