<!-- * AWS account where you want to deploy the Blueprint.
* **terraform:** `>= 1.3.4` installed to your local machine. -->

# Prerequisites

* AWS account with appropriate permissions
* **terraform:** `>= 1.5`
* **aws provider:** `>= 4.0.0`
* VPC with private subnets
* IAM permissions for:
  - ElastiCache
  - KMS
  - CloudWatch
* DataDog API and App keys (if using DataDog integration)