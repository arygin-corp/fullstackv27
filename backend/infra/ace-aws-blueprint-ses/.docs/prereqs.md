* AWS account where you want to deploy the blueprint.
* A delegated AWS Route53 zone deployed to AWS Account, see [published Blueprints](https://github.com/Toyota-Motor-North-America/ace-tech-docs/blob/master/docs/blueprints/published-blueprints.md) for latest version. To learn more about subdomain delegation, see the [Subdomain Delegation Documentation](https://chofer.cloud.toyota.com/docs/default/Component/ACE-FAQ/domain%20delegation/).
* IAM arns to allow to publish and subscribe to SNS topics for observability
* **terraform:** required version installed to your local machine or on Jenkins (in case using Jenkins pipelines).

### Prerequisites for Optional SMTP Credentials Management
* When using SMTP, **must** have an SMTP user with username "${var.business_unit}_${var.application_name}-ses_${var.environment}_svc", where \${application_name} is replaced by your application name. To request an SMTP user in 1TS, you can use [this request](https://tmna.service-now.com/1ts?id=1ts_cat_item&sys_id=a8aeed1d6f5ad344993579331c3ee4b8).
