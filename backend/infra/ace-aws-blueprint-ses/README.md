# AWS Simple Email Service Infrastructure Blueprint
Blueprint for creation of SES account and related resources.

## Table of Contents<!-- omit in toc -->

- [AWS Simple Email Service Infrastructure Blueprint](#aws-simple-email-service-infrastructure-blueprint)
- [Prerequisites](#prerequisites)
- [Deployment Information](#deployment-information)
- [Blueprint Features](#blueprint-features)
- [Upgrading](#upgrading)
- [Notes](#notes)
- [Use Cases](#use-cases)
- [Observability](#observability)
- [Example Terragrunt Usage](#example-terragrunt-usage)
- [Requirements](#requirements)
- [Modules](#modules)
- [Resources](#resources)
- [Inputs](#inputs)
- [Outputs](#outputs)

<!-- BEGIN_TF_DOCS -->
## Prerequisites
* AWS account where you want to deploy the blueprint.
* A delegated AWS Route53 zone deployed to AWS Account, see [published Blueprints](https://github.com/Toyota-Motor-North-America/ace-tech-docs/blob/master/docs/blueprints/published-blueprints.md) for latest version. To learn more about subdomain delegation, see the [Subdomain Delegation Documentation](https://chofer.cloud.toyota.com/docs/default/Component/ACE-FAQ/domain%20delegation/).
* IAM arns to allow to publish and subscribe to SNS topics for observability
* **terraform:** required version installed to your local machine or on Jenkins (in case using Jenkins pipelines).

### Prerequisites for Optional SMTP Credentials Management
* When using SMTP, **must** have an SMTP user with username "${var.business_unit}_${var.application_name}-ses_${var.environment}_svc", where \${application_name} is replaced by your application name. To request an SMTP user in 1TS, you can use [this request](https://tmna.service-now.com/1ts?id=1ts_cat_item&sys_id=a8aeed1d6f5ad344993579331c3ee4b8).

## Deployment Information
### Deploy the service using GitHub Actions

See documentation on general steps for Blueprint creation and deployment here: https://chofer.cloud.toyota.com/docs/default/Component/ACE-TECH-DOCS/blueprints/blueprintdeployment/

For more information on the CD Terraform Standalone pipeline, see here: https://chofer.cloud.toyota.com/docs/default/Component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/cd-pipeline-terraform-standalone-gha/

## Blueprint Features
* Set up SES for a given domain
* Create the following Route53 Records for email authentication
    * Domain verification token
    * DKIM
* Create and manage credentials for existing SMTP users in Secrets Manager

## Upgrading


## Notes
* It may take as much as up to 72 hours for domain verification to complete, due to time taken for changes in DNS settings. Please refer to [this aws documentation](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#just-verify-domain-proc) for more information.
* SMTP user name must be "${var.business_unit}_${var.application_name}-ses_${var.environment}_svc". For example, if your application name is coc and your business unit is dpe, then the user name would need to be "dpe_coc-ses_nonprod_svc".
* In order to rotate SMTP credentials created by this Blueprint, increment the smtp_key_number variable and re-deploy.
* If you don't know what BU to choose, you can use the Cloud Account Master App or L2 column to see what BU the account is under. Please refer to (https://chofer.cloud.toyota.com/cloud-account).
* For, ***toyota.com, lexus.com, and toyotasupplier.com*** domains, DKIM and Domain Identification Records/Tokens will not be created by this Blueprint. User needs to raise 1TS [1TS DNS Request Form](https://tmna.service-now.com/1ts/?id=1ts_cat_item&sys_id=b8a874e1db39b050278ae26b8a9619c1) to verify the domain. Please refer to [Amazon SES - DKIM Signing](https://toyota.atlassian.net/wiki/spaces/DSOP/pages/297306451/Amazon+SES+-+DKIM+Signing) for more information.
* If ***KMS Master Key ID*** is not provided by user then the Blueprint will create a [CMK KMS Key](https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/blob/master/security/encryption/kms/kms-master-key/README.md) along with default key policy with IAM delegation to SNS service and CMK Administrators.

* The Blueprint allows the user to specify/override the admins, users, and service principals by using `customer_master_keys` field. The `customer_master_keys` is Map of CMK names to spec for managing each key. Each entry in the map corresponds to a key that will be created by this template. This field can be used to create multiple keys. To learn more about the map and what each field means [see](https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/blob/master/messaging/sns/variables.tf).

* The Blueprint allows to override IAM delegation configuration by setting `allow_override_iam_delegation` to true. Default value of `allow_override_iam_delegation` is false. If user does not set value of `allow_override_iam_delegation` then the Blueprint will override the value provided for `allow_manage_key_permissions_with_iam` attribute which has been set by user as part of `customer_master_keys` variable.


* Overall TMNA guidelines for Key Management Service can be referred [here](https://toyota.atlassian.net/wiki/spaces/CSTG/pages/297739017/AWS+Requirements#Key-Management-Service).

## Use Cases
* Send email programmatically via AWS SES

## Observability
* This Blueprint utilizes AWS SNS for Observability
* Optional standard DataDog Integration is available
* SNS Topics may be created for bounce, complaint, and delivery notifications, as well as reputation metrics (bounce rate and complaint rate)
* For reputation metrics, alarms are also created based on recommended thresholds

## Example Terragrunt Usage
```hcl

```

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.5.7 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 6.0.0, < 7.0.0 |
| <a name="requirement_null"></a> [null](#requirement\_null) | ~> 3.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_dkim_record"></a> [dkim\_record](#module\_dkim\_record) | git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/dns/record | v47.3.2 |
| <a name="module_domain_verification_record"></a> [domain\_verification\_record](#module\_domain\_verification\_record) | git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/dns/record | v47.3.2 |
| <a name="module_kms_master_key"></a> [kms\_master\_key](#module\_kms\_master\_key) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key | v47.1.14 |
| <a name="module_platform_roles"></a> [platform\_roles](#module\_platform\_roles) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles | v47.1.14 |
| <a name="module_reputation_metric_alarm_bounce_rate"></a> [reputation\_metric\_alarm\_bounce\_rate](#module\_reputation\_metric\_alarm\_bounce\_rate) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/monitoring | v47.1.14 |
| <a name="module_reputation_metric_alarm_complaint_rate"></a> [reputation\_metric\_alarm\_complaint\_rate](#module\_reputation\_metric\_alarm\_complaint\_rate) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/monitoring | v47.1.14 |
| <a name="module_sns_event_notification_topic"></a> [sns\_event\_notification\_topic](#module\_sns\_event\_notification\_topic) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//messaging/sns | v50.1.1 |
| <a name="module_sns_reputation_management_topic"></a> [sns\_reputation\_management\_topic](#module\_sns\_reputation\_management\_topic) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//messaging/sns | v50.1.1 |
| <a name="module_standard_tags"></a> [standard\_tags](#module\_standard\_tags) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//tagging/tmna-standard-tags | v47.1.14 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_access_key.smtp_access_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_access_key) | resource |
| [aws_kms_key_policy.ses_event_key_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key_policy) | resource |
| [aws_kms_key_policy.ses_reputation_key_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key_policy) | resource |
| [aws_secretsmanager_secret.smtp_credentials](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret) | resource |
| [aws_secretsmanager_secret_version.smtp_credentials](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret_version) | resource |
| [aws_ses_domain_dkim.domain](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ses_domain_dkim) | resource |
| [aws_ses_domain_identity.domain](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ses_domain_identity) | resource |
| [aws_ses_domain_identity_verification.domain_verification](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ses_domain_identity_verification) | resource |
| [aws_ses_identity_notification_topic.event_notifications](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ses_identity_notification_topic) | resource |
| [null_resource.key_rotation](https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_policy_document.ses_key_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_role.app_admin_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_role) | data source |
| [aws_iam_role.app_team_role_name](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_role) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_allow_override_iam_delegation"></a> [allow\_override\_iam\_delegation](#input\_allow\_override\_iam\_delegation) | Allow user to override IAM delegation. | `bool` | `false` | no |
| <a name="input_app_team_oidc_arn"></a> [app\_team\_oidc\_arn](#input\_app\_team\_oidc\_arn) | The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline. | `string` | n/a | yes |
| <a name="input_application_id"></a> [application\_id](#input\_application\_id) | Application ID as per CMDB | `string` | n/a | yes |
| <a name="input_application_name"></a> [application\_name](#input\_application\_name) | Name of Application as per CMDB | `string` | n/a | yes |
| <a name="input_created_by_email"></a> [created\_by\_email](#input\_created\_by\_email) | Toyota email of the person who creates resource. | `string` | n/a | yes |
| <a name="input_custom_tags"></a> [custom\_tags](#input\_custom\_tags) | A map of custom tags to apply to the resources. | `map(string)` | `{}` | no |
| <a name="input_customer_master_keys"></a> [customer\_master\_keys](#input\_customer\_master\_keys) | Map of CMK names to spec for managing each key. Each entry in the map corresponds to a key that will be created by this template. This field can be used to create multiple keys. | `any` | `{}` | no |
| <a name="input_data_classification"></a> [data\_classification](#input\_data\_classification) | Data classification level | `string` | `"no_classification"` | no |
| <a name="input_domain"></a> [domain](#input\_domain) | The domain or subdomain to use for Email sending. | `string` | n/a | yes |
| <a name="input_enable_datadog_monitoring"></a> [enable\_datadog\_monitoring](#input\_enable\_datadog\_monitoring) | Set to true to forward logs and events that are transiting through to the SNS to Datadog. Requires Datadog setup on your AWS account. May incur additional costs. | `bool` | `false` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment abbreviation of resource. | `string` | n/a | yes |
| <a name="input_event_notification_include_original_headers"></a> [event\_notification\_include\_original\_headers](#input\_event\_notification\_include\_original\_headers) | Whether to include original headers in event notifications. | `bool` | `false` | no |
| <a name="input_event_notification_types"></a> [event\_notification\_types](#input\_event\_notification\_types) | List of types of events to send to the created SNS topic. Available types are 'Bounce', 'Complaint', and 'Delivery'. | `list(string)` | <pre>[<br>  "Bounce",<br>  "Complaint"<br>]</pre> | no |
| <a name="input_existing_smtp_user_name"></a> [existing\_smtp\_user\_name](#input\_existing\_smtp\_user\_name) | An existing SMTP user to create credentials for, which will be stored in secrets manager. | `string` | `null` | no |
| <a name="input_infra_live_repo"></a> [infra\_live\_repo](#input\_infra\_live\_repo) | The name of the infrastructure live repository | `string` | `"ace-aws-infra-modules"` | no |
| <a name="input_name"></a> [name](#input\_name) | The name of the SNS topic that will be created | `string` | `null` | no |
| <a name="input_name_prefix"></a> [name\_prefix](#input\_name\_prefix) | String to prefix resource names. | `string` | n/a | yes |
| <a name="input_private_zone"></a> [private\_zone](#input\_private\_zone) | Private hosted DNS zone. Only set to true if the zone name in var.zone\_name is a private zone. | `bool` | `false` | no |
| <a name="input_reputation_metric_alarm_evaluation_periods"></a> [reputation\_metric\_alarm\_evaluation\_periods](#input\_reputation\_metric\_alarm\_evaluation\_periods) | The number of periods to use when Cloudwatch determines alarm state for reputation management alarms. | `number` | `2` | no |
| <a name="input_reputation_metric_alarm_period_seconds"></a> [reputation\_metric\_alarm\_period\_seconds](#input\_reputation\_metric\_alarm\_period\_seconds) | The length (in time) of the period which Cloudwatch will evaluate when determining alarm state for reputation management alarms. | `number` | `120` | no |
| <a name="input_reputation_metrics_bounce_rate_enabled"></a> [reputation\_metrics\_bounce\_rate\_enabled](#input\_reputation\_metrics\_bounce\_rate\_enabled) | Whether to create a Cloudwatch metric alarm for bounce rate. | `bool` | `false` | no |
| <a name="input_reputation_metrics_bounce_rate_threshold"></a> [reputation\_metrics\_bounce\_rate\_threshold](#input\_reputation\_metrics\_bounce\_rate\_threshold) | Threshold for bounce rate metric alarm (reputation\_metrics\_bounce\_rate must be true). AWS may pause the ability to send emails if bounce rate is at or above 0.10. | `number` | `0.05` | no |
| <a name="input_reputation_metrics_complaint_rate_enabled"></a> [reputation\_metrics\_complaint\_rate\_enabled](#input\_reputation\_metrics\_complaint\_rate\_enabled) | Whether to create a Cloudwatch metric alarm for complaint rate. | `bool` | `false` | no |
| <a name="input_reputation_metrics_complaint_rate_threshold"></a> [reputation\_metrics\_complaint\_rate\_threshold](#input\_reputation\_metrics\_complaint\_rate\_threshold) | The threshold for complaint rate metric alarm (reputation\_metrics\_complaint\_rate must be true). AWS may pause the ability to send emails if complaint rate is at or above 0.005. | `number` | `0.001` | no |
| <a name="input_resource_slug"></a> [resource\_slug](#input\_resource\_slug) | An optional slug to append to the names of created resources. This can be used to differentiate resources created by different instances of this module, if multiple instances are using the same name\_prefix and name parameters. If provided, the slug will be appended to the end of resource names, separated by a hyphen. | `string` | `null` | no |
| <a name="input_route53_record_allow_overwrite"></a> [route53\_record\_allow\_overwrite](#input\_route53\_record\_allow\_overwrite) | Allows the creation of records in Terraform to overwrite existing records. This doesn't affect the ability to update the records in Terraform. | `bool` | `false` | no |
| <a name="input_route53_record_ttl"></a> [route53\_record\_ttl](#input\_route53\_record\_ttl) | TTL for Route53 records. Setting a lower TTL may allow DNS records to propagate faster, but may cost more. | `number` | `300` | no |
| <a name="input_smtp_access_key_status"></a> [smtp\_access\_key\_status](#input\_smtp\_access\_key\_status) | The status of the access key of the IAM user for SMTP credentials. If smtp\_enabled is false, this setting has no effect. | `string` | `"Active"` | no |
| <a name="input_smtp_enabled"></a> [smtp\_enabled](#input\_smtp\_enabled) | If this is true, SMTP will also be set up for the domain identity. This includes granting permissions to the already-existing SMTP user, storing the credentials in secrets manager, and creating the required resources for encryption. If this is false, the settings of `SMTP Access Key Status`, `SMTP Key Number`, `Existing SMTP User Name` and `SMTP Recovery Window' fields will have no effect.` | `bool` | `false` | no |
| <a name="input_smtp_key_number"></a> [smtp\_key\_number](#input\_smtp\_key\_number) | A number to associate the created SMTP access key with. Changing this value will force replacement of the aws\_iam\_access\_key resource. WARNING: this will be removed in a future release. | `number` | `0` | no |
| <a name="input_smtp_recovery_window_days"></a> [smtp\_recovery\_window\_days](#input\_smtp\_recovery\_window\_days) | Recovery window (in days) for SMTP credentials in Secrets Manager. This value can be set to 0 to force deletion without recovery. If smtp\_enabled is false, this setting has no effect. | `number` | `30` | no |
| <a name="input_sns_allow_additional_publish_iam_arns"></a> [sns\_allow\_additional\_publish\_iam\_arns](#input\_sns\_allow\_additional\_publish\_iam\_arns) | The IAM arns that will be given permission to publish to the SNS topic | `list(string)` | `[]` | no |
| <a name="input_sns_allow_additional_subscribe_iam_arns"></a> [sns\_allow\_additional\_subscribe\_iam\_arns](#input\_sns\_allow\_additional\_subscribe\_iam\_arns) | The IAM arns that will be given permission to subscribe to the SNS topic | `list(string)` | `[]` | no |
| <a name="input_team"></a> [team](#input\_team) | A team identifier which will populate the tmna:team tag. If one is not provided, this will be populated based on your git repo setup. | `string` | `null` | no |
| <a name="input_zone_name"></a> [zone\_name](#input\_zone\_name) | Name of the Route53 zone to use for email authentication. | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_dkim_tokens"></a> [dkim\_tokens](#output\_dkim\_tokens) | n/a |
| <a name="output_dkim_verification_record_names"></a> [dkim\_verification\_record\_names](#output\_dkim\_verification\_record\_names) | Names of dkim records |
| <a name="output_domain_verification_record"></a> [domain\_verification\_record](#output\_domain\_verification\_record) | Name of domain verification record |
| <a name="output_domain_verification_token"></a> [domain\_verification\_token](#output\_domain\_verification\_token) | n/a |
| <a name="output_ses_domain_identity_arn"></a> [ses\_domain\_identity\_arn](#output\_ses\_domain\_identity\_arn) | ARN of the domain identity in AWS SES |
| <a name="output_smtp_secret_arn"></a> [smtp\_secret\_arn](#output\_smtp\_secret\_arn) | The ARN of the SMTP credentials secret in Secrets Manager |
<!-- END_TF_DOCS -->
