# ace-aws-blueprint-ecs

![ECS Blueprint](diagrams/ECS_Blueprint.png?raw=true "ECS Blueprint")

# Table of Contents

- [ace-aws-blueprint-ecs](#ace-aws-blueprint-ecs)
- [Use Case Patterns](#use-case-patterns)
- [Prerequisites](#prerequisites)
- [Blueprint Testing using Terratest](#blueprint-testing-using-terratest)
- [Deploy the Fargate service using ECS Blueprint](#deploy-the-fargate-service-using-ecs-blueprint)
- [Notes](#notes)
- [Example Usage](#example-usage)
- [Observability](#observability)
- [Requirements](#requirements)
- [Modules](#modules)
- [Resources](#resources)
- [Inputs](#inputs)
- [Outputs](#outputs)

> # warning: **Breaking Change**
## Version v8.0.0 - updates WAF module to v51.0.0 ⚠️ BREAKING CHANGE

This version upgrades the `waf-acl-zscalar` module from `v50.2.6` to `v51.0.0`. The internal `aws_wafv2_rule_group` resource has been removed. Rule logic previously grouped inside a managed rule group is now expressed directly as standalone `aws_wafv2_web_acl_rule` resources on the web ACL.

### Upgrade Steps (two-run process required)

1. **Run your pipeline/deployment** targeting this version. The apply will fail with the following expected error:
   ```
   WAFAssociatedItemException: AWS WAF couldn't perform the operation because your resource
   is being used by another resource or it's associated with another resource.
   ```
2. **Manually remove the rule group** from the web ACL in AWS.
3. **Re-run your pipeline/deployment**. Terraform will complete successfully and the new standalone `aws_wafv2_web_acl_rule` resources will be created.

## Version 6.0.0 - updates ecs-service to v35.2.1

The following settings are now required for proper configuration of the blueprint. Please ensure you provide values for each of these settings in your configuration:

### Network Security Settings
* `outbound_cidr_blocks`: Controls which networks your service can send data to
* `outbound_from_port`: Starting port for outbound traffic
* `outbound_to_port`: Ending port for outbound traffic
* `outbound_protocol`: Controls which types of network traffic are allowed out (TCP, UDP, etc.)

### Logging and Storage Settings
* `access_logging_enabled`: Toggle for logging service access
* `accesslogs_bucketprefix`: Storage location for access logs
* `allow_encrypted_uploads_only`: Restricts uploads to encrypted files only

### Security and Encryption Settings
* `cmk_create_key`: Option to create a new encryption key
* `cmk_existing_key_arn`: Option to use an existing encryption key
* `s3_replication_enabled`: Toggle for data replication to backup location
* `allow_override_iam_delegation`: Control over permission modifications
* `source_policy_documents`: Additional security rules

## Version 5.8.9 - updates ecs-service to v31.1.1
- The `enable_ecs_deployment_check` property was deprecated in favor of the `wait_for_steady_state` parameter in version 0.37.0 of the `chofer-gw-terraform-aws-ecs` module, released on June 7, 2024. This update removed the custom Python script previously used for deployment checks, as the `wait_for_steady_state` parameter now covers these use cases. Consequently, the following input variables were removed:
    * `enable_ecs_deployment_check`
    * `deployment_check_timeout_seconds`
    * `deployment_check_loglevel`

- The following new input variables have been added: 
    * `wait_for_steady_state` with default value `true`
    * `service_create_update_timeout` with default value `20m`
    * `service_delete_timeout` with default value `5m`

> ## Version 4.0.0 - All Blueprint module version updates
> - adds var.name_prefix which is now a required variable
> - rename var.public_subnet_ids to lb_subnet_ids, this field accepts both public and private subnet ids
> - updates ECS Cluster Blueprint 2.0.2 -> v16.0.1
> - updates ACM TLS Cert 1.10.1 -> v17.1.0
> - updates Route53 Record Blueprint networking-dns-v1.4.6 -> v10.5.0
> - updates Cloudwatch Logs Blueprint cloudwatch-logs-v3.1.0 -> v17.0.0
> - updates LB Listener Rules Blueprint v11.0.1 -> v16.0.0
> - updates Database RDS Blueprint databases-rds-v4.0.1 -> v17.0.0
> - updates ECS Service Blueprint v15.1.0 -> v17.0.0

> ## Version 3.2.0 - Update Cloudwatch logs module to v3.1.0
> - adds var.enable_datadog_monitoring to enable datadog monitoring
> - adjusts cloudwatch logs module to use the generic version instead of the ecs specific version
> - adds var.cloudwatch_force_destroy to control whether created log group gets destroyed on `terraform destroy``
> - log_retention_period is now defaulted to 30 days with new validation for accepted values
> - update RDS version to 4.0.1

## Version 3.1.2 - Bugfix implemented for Error : creating DB Subnet Group: InvalidSubnet: Subnet IDs are required.

> Made changes in the automatic persistence subnet fetching logic with different tag filters to avoid multiple same zone subnet issue.
> Enabled option to provide DB `resource_slug` Input so that app team can create unique resources.

> - updates RDS database creation Blueprint 3.0.4 -> 3.0.6
>
> ## Version 3.1.1 - Bugfix implemented for Route53 Zone name Input field

> Regex pattern updated for Route53 Zone name input field and also upgraded below dependency modules where the zone name is used.
> Made changes in the automatic network subnet fetching logic with different tag filters to avoid same zone subnet configuration issue.

> - updates SSL Creation Blueprint 2.2.1 -> 2.2.2
> - updates Route53 Record Blueprint 1.4.5 -> 1.4.6
> - updates LB Listener Rules Blueprint 2.2.0 -> 3.0.1

> ## Version 3.x.x New Features
>
> - updates ALB Blueprint 1.10.1 -> 2.2.0 (breaking)
> - updates NLB Blueprint 1.1.0.1 -> 3.0.0 (breaking)
> - updates Database RDS Blueprint 2.1.4 -> 3.0.4 (breaking)
> - drops invalid headers by default (breaking)
> - updates ECS Cluster Blueprint 2.0.2 -> 2.0.4
> - updates SSL Creation Blueprint 2.2.0 -> 2.2.1
> - updates Route53 Record Blueprint 1.4.3 -> 1.4.5
> - updates Cloudwatch Logs Blueprint 2.1.4 -> 2.1.5
> - updates LB Listener Rules Blueprint 2.0.1 -> 2.2.0
> - updates ECS Service Blueprint 2.0.2 -> 2.0.4
>
> ## Breaking changes
>
> With the latest version following are key changes which requires consideration from application side when adopting or upgrading existing infrastructure module.
>
> - dependencies require Terraform >= 1.3
> - dependencies require AWS Provider >= 4.9.0
>
> ## Upgrading from older versions (prior to v3.0.0)
>
> When trying to upgrade from older version follow below steps:
>
> 1. Download and install [`Terraform`](https://developer.hashicorp.com/terraform/downloads) 1.3 and above. Additionally, download and install [`Terragrunt`](https://terragrunt.gruntwork.io/docs/getting-started/install/) if required.
> 2. Execute `terragrunt plan` or `terragrunt apply` from Github pipeline.

ECS Blueprint can be used to provision any containerized application using [Amazon ECS on AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html). Support for Amazon ECS on AWS EC2 and Amazon EKS on AWS Fargate might be added in future versions, please let us know what you are looking for in GitHub issues in this repository.
Blueprint is designed to provision all necessary infrastructure, such as:

- ESC cluster
- Application or Network Load Balancer
- DNS records
- SSL certificate
- Basic monitoring and logging infrastructure
- AutoScaling rules
- RDS Database

Blueprint has built-in best practices and is managed by [Advanced Cloud Engineering team](mailto:Advanced_Cloud_Engineering@toyota.com).

# Use Case Patterns

Given Architecture Blueprint can be leveraged to spin up infrastructure for various architectural patterns. Few are listed below as reference for adoption.

Blueprint can come in handy for implementing:

- `Sidecar container`
- `Microservices`
- `Standalone services`, and so on.

Additionally you can leverage blueprint to implement:

- `Full infrastructure` - Including creation of Cluster/DNS Record/SSL Cert/Load Balancer/ECS services/Database
- `Partial infrastructure` - Of which Cluster/DNS Record/SSL Cert/Load Balancer/Database could be skipped. Provides capability to Bring Your Own Existing Cluster/Load Balancer

### Sidecar container

A sidecar is a container that runs alongside an application container in an Amazon ECS task.

### Microservices / Standalone services

Deploying services as an independent entity for microservices or host a standalone services

### Multiple Microservices/Services

Deploying multiple microservices/standalone services clubbed together on shared cluster

Examples to get started with:

- [Multiple services on the same cluster](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs/tree/master/examples/ecs/ecs-service)

<!-- BEGIN_TF_DOCS -->
## Prerequisites
This blueprint is being actively developed. As of now, we have some requirements you need to comply with in order to use the blueprint:

- AWS account where you want to deploy the blueprint
- VPC and public/private subnets created, all the connectivity on the network layer set up
- DNS subdomain delegated to your AWS account with [dns/zone-delegation module](https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules-platform/tree/master/networking/dns/zone-delegation)
- To request DNS subdomain delegation please refer [chofer FAQ](https://chofer.cloud.toyota.com/docs/default/component/ace-faq/domain%20delegation/#how-to-request-a-dns-subdomain-delegation-under-toyotacom)

## Blueprint Testing using Terratest
This code is tested using Go and [Terratest](https://terratest.gruntwork.io) packages.

In the folder `../test` you can find comprehensive test files including `*_test.go` and detailed documentation.

To run tests locally, your testing environment should be authorized to use the pc-test sandbox account.

```bash
# Run all tests (recommended)
(ace-aws-blueprint-ecs) $ cd test
(ace-aws-blueprint-ecs/test) $ go test -timeout 90m ./...

# Run individual tests
(ace-aws-blueprint-ecs/test) $ go test -v -timeout 45m -run TestECSBlueprint
(ace-aws-blueprint-ecs/test) $ go test -v -timeout 45m -run TestECSBlueprintWithDatabase
```

**Available Tests** (12 comprehensive scenarios):
- `TestECSBlueprint` - Basic ECS Blueprint with ALB
- `TestECSBlueprintAutoScaling` - Auto-scaling validation  
- `TestECSBlueprintWithDatabase` - RDS integration
- `TestECSBlueprintWithNLB` - Network Load Balancer
- `TestECSBlueprintWithoutLB` - No load balancer scenario
- `TestECSBlueprintWithWAF` - WAF integration
- `TestECSBlueprintAdvancedContainerDefinition` - Complex containers
- `TestECSBlueprintAutoScalingStress` - Performance testing
- `TestECSBlueprintFargateEC2` - EC2 launch type
- `TestECSBlueprintWithExistingALB` - Existing ALB integration
- `TestECSBlueprintWithExistingNLB` - Existing NLB integration
- `TestECSBlueprintWithExistingALBAndWAF` - WAF with existing ALB integration

Timeout 90m is recommended for the full suite; individual tests typically complete in 15-25 minutes. [Terratest Docs: Timeout and Logging](https://terratest.gruntwork.io/docs/testing-best-practices/timeouts-and-logging/)

For detailed test documentation, see [test/README.md](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs/blob/master/test/README.md).

## Deploy the Fargate service using ECS Blueprint
### Prerequisites

To deploy the Fargate service using [ECS Blueprint](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs), it is recommended you use [Terragrunt Infrastructure Live Template Repository](https://github.com/Toyota-Motor-North-America/ace-aws-infra-live) to create your repository with the recommended structure. Please also check the documentation in [ace-aws-infra-live](https://github.com/Toyota-Motor-North-America/ace-aws-infra-live/blob/master/README.md)(https://github.com/Toyota-Motor-North-America/ace-aws-infra-live/blob/master/README.md).

### Port Mapping

When deploying with a load balancer, ensure your container port matches the load balancer's listening port for proper traffic routing. You can configure this either through regular containers' http_port or through advanced container definition's portMappings.

### Deploy the service using GitHub Actions

See the documentation on general steps for Blueprint creation and deployment here: https://chofer.cloud.toyota.com/docs/default/Component/ACE-TECH-DOCS/blueprints/blueprintdeployment/

For more information on the CD Terraform Standalone pipeline, see here: https://chofer.cloud.toyota.com/docs/default/Component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/cd-pipeline-terraform-standalone-gha/

## Notes
* For ACM certificates for private zones, it is necessary to use a public zone to host the challenge DNS records AWS uses to verify domain ownership.  The private zone must be a subdomain of the public zone. Set route53_private_zone to true, route53_zone_name to the name of the public zone, and route53_zone_name_private to the name of the private zone. For example, to create a private record in private zone myinternal.myapp.toyota.com, you must specify myapp.toyota.com as var.route53_zone_name, myinternal.myapp.toyota.com as var.route53_zone_name_private and var.route53_private_zone as true.
* To access applications from Toyota laptops outside the organization without using the internet, use **_zScaler Private Access (ZPA)_**, a cloud-based security service. To access application through Zscaler Remote Access, submit [1TS](https://tmna.service-now.com/1ts?id=1ts_cat_item&sys_id=ba5afe7adb9f2050df739d4b8a961951) request for **_ZPA (Zscaler Private Access) Remote Access (TMNA)_**. For more information on **_zScaler Onboarding_**, click [here](https://toyota.atlassian.net/wiki/spaces/HTT/pages/293766749/zScaler+Onboarding+Process).
* For WAF, when you enable advanced_managed_rules, you take complete control of the AWS Managed Rules.  You are responsible for implementing, at a minimum, the required Managed Rules as found in the [AWS Requirements](https://toyota.atlassian.net/wiki/spaces/CSTG/pages/297739017/AWS+Requirements#AWS-WAF-(Web-Application-Firewall)).  This is not needed for normal use cases.  If you decide to override the Managed Rules with advanced_managed_rules, you must: not enable Allow - either Block, or if required for application, Count -  and notify your SEE team to review your rules.
* example `advanced_managed_rules`:
```hcl
advanced_managed_rules = {
    AWSManagedRulesKnownBadInputsRuleSet = {
        priority             = 0
        override_action      = "none"
        rule_action_override = []
    },
    AWSManagedRulesCommonRuleSet = {
        priority             = 1
        override_action      = "none"
        rule_action_override = [{
            action_to_use = [{count = [{}]}]
            name = "SizeRestrictions_BODY"
        },
        {
            action_to_use = [{
                count = [{
                    custom_request_handling = [{
                        insert_header = {
                            name = "x-test-large-cookie"
                            value = "test"
                        }
                    }]
                }]
            }]
            name = "SizeRestrictions_Cookie_HEADER"
        }]
    },
    AWSManagedRulesAmazonIpReputationList = {
        priority             = 2
        override_action      = "none"
        rule_action_override = []
    }
}
```
### Inbound security group rule behavior

* If `inbound_cidr_blocks` is provided (non-empty), the module creates an ingress rule for those CIDRs.
* If `inbound_cidr_blocks` is empty and `enable_vpc_cidr_inbound = true`, the module will create an ingress rule that allows the VPC CIDR.
* If `inbound_cidr_blocks` is empty and `enable_vpc_cidr_inbound = false`, no CIDR-based ingress rule is created (the security group will have no inbound rules by default).
* If `existing_security_group_ids` is provided (non-empty), the module will create no CIDR-based ingress rules and uses the provided security groups as is.

## Example Usage
```
# ---------------------------------------------------------------------------------------------------------------------
# MODULE VARIABLES
# Define these paramater values as inputs.
# ---------------------------------------------------------------------------------------------------------------------

terraform {
  # this is an example only
  # In production code, Chofer recommends pinning the version of Blueprints to the specific, latest version
  # source = "git@github.com:Toyota-Motor-North-America/ace-aws-blueprint-ecs.git//terraform?ref=vX.Y.Z"
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-blueprint-ecs.git//terraform?ref=master"
}

include {
  path = find_in_parent_folders()
}
## Uncomment if ecs cluster infra blueprint was deployed in this repo
#dependency "ecs-cluster" {
#  config_path = "${get_terragrunt_dir()}/../../cluster" # NOTE: This Relative path will change according to your folder structure
#}

locals {
  ## Variables assumed from aws-infra-live template repo 
  global_vars          = read_terragrunt_config(find_in_parent_folders("global.hcl"))
  environment_vars     = read_terragrunt_config(find_in_parent_folders("environment.hcl"))
  region_vars          = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  aws_region_cd        = local.region_vars.locals.aws_region_cd
  environment          = local.environment_vars.locals.environment
  name_prefix          = replace(local.global_vars.locals.name_prefix, "_", "-") ## This can be customized
  service_name         = ""
  resource_name_prefix = "${local.name_prefix}-${local.environment}-${local.aws_region_cd}-fargate"
  http_port            = 8080
  cpu                  = 256 ## Must be either 256, 512, 1024, 2048, 4096
  memory               = 512 ## Must be either 512, 1024, 2048, 4096, 5120, 6144, 7168, 8192, 16384, 30720
}

inputs = {

  ## Required variables
  service_name    = "${local.resource_name_prefix}-${local.service_name}"
  ecs_cluster_arn = "" # dependency.ecs-cluster.outputs.ecs_cluster_arn ## Usage of the dependency block to an ECS Cluster
  containers = [
    {
      name      = "${local.resource_name_prefix}-${local.service_name}"
      image     = "" ## Existing image arn
      http_port = local.http_port
      cpu       = local.cpu
      memory    = local.memory
      env_vars = {
        PORT         = "${local.http_port}"
        SERVICE_NAME = local.service_name
      }
      expose_secrets = false
    }
  ]
  lb_container_name = "${local.resource_name_prefix}-${local.service_name}"
  http_port         = local.http_port
  cpu               = local.cpu
  memory            = local.memory
  name_prefix       = local.name_prefix

  # Mandatory Tags
  application_id   = "test-app-id"
  application_name = "test-app"
  created_by_email = "chofer-Blueprints@toyota.com"

  ## Optional variables  
  #cluster_name = ""
  #service_name = ""
  #secrets = {}
  #private_subnet_ids = []
  #inbound_cidr_blocks = ["192.168.0.0/16"]
  #cloudwatch_log_group = null
  #cloudwatch_logs_stream_prefix = null
  #cloudwatch_logs_aws_region = local.region_vars.locals.aws_region
  #log_retention_period_days = 30                                                     
  # runtime_platform = "{
  #   operating_system_family: "LINUX",
  #   cpu_architecture:        "X86_64",
  # }"                                                                     
  #cw_cmk_administrator_iam_arns = []                                      
  #cw_cmk_user_iam_arns = []                                                        
  #cw_cmk_service_principals = []                                              
  #cw_key_name = null
  #cw_existing_key_arn = null
  #cloudwatch_force_destroy = false
  #enable_datadog_monitoring = false
  #cw_create_key = true       
  #use_auto_scaling = true
  #min_number_of_tasks = 1
  #max_number_of_tasks = 4  
  #existing_ecs_task_role_name = ""
  #existing_ecs_task_execution_role_name = ""
  #existing_waf_acl_arn = null
  #custom_iam_role_name_prefix = ""
  #custom_task_execution_name_prefix = ""
  #custom_ecs_service_role_name = ""
  #protocol = "TCP"
  #health_check_protocol = "TCP"
  #vpc_id = ""
  #lb_slow_start = 30
  #alb_use_sticky_sessions = false
  #alb_sticky_session_type = "lb_cookie"
  #alb_sticky_session_cookie_duration = 86400
  #health_check_grace_period_seconds = 30
  #health_check_path = "/healthcheck"
  #health_check_matcher = 200
  #health_check_healthy_threshold = 6
  #health_check_unhealthy_threshold = 7
  #health_check_interval = 120
  #health_check_timeout = 10
  #enable_vpc_cidr_inbound = true
  #propagate_tags = "SERVICE"  # Options: "SERVICE", "TASK_DEFINITION", or null
  #deployment_circuit_breaker = {
  #  enable   = true
  #  rollback = true
  #}
  #deployment_cloudwatch_alarms = {
  #  cloudwatch_alarms = ["arn:aws:cloudwatch:us-west-2:123456789012:alarm:my-alarm"]
  #  enable            = true
  #  rollback          = true
  #}
}
```
## Observability
**Datadog Agent**

### About

To enable the Datadog Agent, set `enable_datadog_agent`. Tasks that do not have the Datadog Agent still report metrics with Cloudwatch, however the Agent is needed for Autodiscovery, detailed container metrics, tracing, and more. Additionally, Cloudwatch metrics are less granular, and have more latency in reporting than metrics shipped directly through the Datadog Agent.

To learn more about the agent see:
* [ECS Documentation](https://docs.datadoghq.com/containers/amazon_ecs/data_collected/)
* [Fargate Documentation](https://docs.datadoghq.com/integrations/ecs_fargate/?tab=webui#data-collected)

### Prerequisites

The Datadog Agent requires that your AWS Account has a Datadog API Key stored in AWS Parameter store. 

To validate if your account has this
1. Navigate to AWS Systems Manager > Parameter Store
2. Search for `datadog` - parameters will follow the naming convention `/datadog/<UNIQUE IDENTIFIER>/api-key`

If your account does not have these parameters, you can use the [Datadog AWS Account Integration](https://chofer.cloud.toyota.com/create/templates/aws-infra-live-module-dd-aws-integration?learnMore=) module to create them.

### Validation

To validate the Datadog Agent is properly set up for your ECS Cluster follow the steps below in the AWS Console.

#### Fargate

The Datadog Agent runs as a side car to the ECS task. In the AWS Console:

1. Navigate to ECS
2. Select your ECS Cluster
3. Under 'Services', select your service
4. Click on the 'Task' tab and select the running task
5. Under 'Containers' there should be two running: one is your service and the other is the Datadog Agent (`datadog-agent`)

#### EC2

The Datadog Agent runs as a DAEMON service in the ECS Cluster. In the AWS Console:

1. Naviate to ECS
2. Select your ECS Cluster
3. Under 'Services' there should be two running: one will be the application and the other will be the Datadog Agent (`<SERVICE_NAME>-datadog-agent`).

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.5.7 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 6.0.0, < 7.0.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_acm_tls_certificate"></a> [acm\_tls\_certificate](#module\_acm\_tls\_certificate) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/acm-tls-certificate | v47.5.4 |
| <a name="module_alb"></a> [alb](#module\_alb) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/alb | v47.5.4 |
| <a name="module_cw_ecs_logs"></a> [cw\_ecs\_logs](#module\_cw\_ecs\_logs) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/logs | v47.5.4 |
| <a name="module_database"></a> [database](#module\_database) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//databases/rds | v47.5.1 |
| <a name="module_ecs-service"></a> [ecs-service](#module\_ecs-service) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//compute/ecs/ecs-service | v47.5.4 |
| <a name="module_ecs_cluster"></a> [ecs\_cluster](#module\_ecs\_cluster) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//compute/ecs/cluster | v47.5.4 |
| <a name="module_ecs_ec2_cluster"></a> [ecs\_ec2\_cluster](#module\_ecs\_ec2\_cluster) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//compute/ecs/cluster-ec2 | v47.5.4 |
| <a name="module_kms_master_key"></a> [kms\_master\_key](#module\_kms\_master\_key) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key | v47.5.1 |
| <a name="module_lb-listener-rules"></a> [lb-listener-rules](#module\_lb-listener-rules) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/lb-listener-rules | v47.5.4 |
| <a name="module_nlb"></a> [nlb](#module\_nlb) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/nlb | v48.2.4 |
| <a name="module_platform_roles"></a> [platform\_roles](#module\_platform\_roles) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles | v47.5.1 |
| <a name="module_route53_record"></a> [route53\_record](#module\_route53\_record) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/dns/record | v47.5.4 |
| <a name="module_waf"></a> [waf](#module\_waf) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/defense/waf-acl-zscalar | v51.0.0 |

## Resources

| Name | Type |
|------|------|
| [aws_security_group_rule.allow_https_inbound_rule](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.allow_outbound_on_container_port](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group_rule) | resource |
| [aws_wafv2_web_acl_association.alb_waf_association](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/wafv2_web_acl_association) | resource |
| [terraform_data.containers_config](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/resources/data) | resource |
| [terraform_data.linux_runtime_platform_validation](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/resources/data) | resource |
| [terraform_data.windows_container_definition_validation](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/resources/data) | resource |
| [terraform_data.windows_runtime_platform_validation](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/resources/data) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_ecs_cluster.ecs_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecs_cluster) | data source |
| [aws_lb.existing_lb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/lb) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_route53_zone.route53_public_zone_id](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/route53_zone) | data source |
| [aws_subnets.subnets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnets) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_access_log_bucket_suffix"></a> [access\_log\_bucket\_suffix](#input\_access\_log\_bucket\_suffix) | The suffix for the S3 bucket used for storing ALB access logs. | `string` | `"alb"` | no |
| <a name="input_access_logging_enabled"></a> [access\_logging\_enabled](#input\_access\_logging\_enabled) | Specifies if bucket access logging should be enabled. If set to false, accesslogs\_bucketname and <br>accesslogs\_bucketprefix will be ignored. | `bool` | `true` | no |
| <a name="input_accesslogs_bucketprefix"></a> [accesslogs\_bucketprefix](#input\_accesslogs\_bucketprefix) | The prefix for the access log bucket. Will be ignored if access\_logging\_enabled is set to false. | `string` | `"accesslogs/S3/"` | no |
| <a name="input_additional_datadog_env_vars"></a> [additional\_datadog\_env\_vars](#input\_additional\_datadog\_env\_vars) | Additional environment variables to pass to the Datadog Agent container. This should be a map of key/value pairs. For example: { DD\_ENV = 'staging', DD\_SERVICE = 'my-service' }. DD\_API\_KEY, DD\_SITE, and ECS\_FARGATE are reserved and may not be set here. For more information on available environment variables, see https://docs.datadoghq.com/containers/docker/#environment-variables. | `map(string)` | `{}` | no |
| <a name="input_additional_db_read_replica_instance_security_group_ids"></a> [additional\_db\_read\_replica\_instance\_security\_group\_ids](#input\_additional\_db\_read\_replica\_instance\_security\_group\_ids) | List of IDs of AWS Security Groups to attach to the read replica RDS instance. | `list(string)` | `[]` | no |
| <a name="input_additional_ecs_secret_arns"></a> [additional\_ecs\_secret\_arns](#input\_additional\_ecs\_secret\_arns) | Additional secrets to be provided to all ECS containers defined, as environment variables. The map should have environment variable names as its keys, and AWS Secret ARNs as values. | `map(any)` | `{}` | no |
| <a name="input_additional_security_group_ids"></a> [additional\_security\_group\_ids](#input\_additional\_security\_group\_ids) | Add additional security groups to the ALB | `list(string)` | `[]` | no |
| <a name="input_advanced_container_definition"></a> [advanced\_container\_definition](#input\_advanced\_container\_definition) | The JSON text of the ECS Task Container Definitions. This portion of the ECS Task Definition defines the Docker container(s) to be run along with all their properties. It should adhere to the format described at https://goo.gl/ob5U3g. The variable 'containers' and is ignored if this value is set. | `list(any)` | `null` | no |
| <a name="input_advanced_container_definition_file_path"></a> [advanced\_container\_definition\_file\_path](#input\_advanced\_container\_definition\_file\_path) | Path to a file containing the JSON text of the ECS Task Container Definitions. This value is ignored if 'advanced\_container\_definition' is defined. | `string` | `null` | no |
| <a name="input_alb_allow_inbound_from_security_group_ids"></a> [alb\_allow\_inbound\_from\_security\_group\_ids](#input\_alb\_allow\_inbound\_from\_security\_group\_ids) | The IDs of security groups from which this ALB will allow incoming requests. | `list(string)` | `[]` | no |
| <a name="input_alb_default_action"></a> [alb\_default\_action](#input\_alb\_default\_action) | Define the default action if a request to the ALB load balancer does not match any of your listener rules. Currently only 'fixed-response' and 'redirect' are supported. https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener#default_action | `map(any)` | <pre>{<br>  "fixed-response": {<br>    "content_type": "text/plain",<br>    "message_body": null,<br>    "status_code": 404<br>  }<br>}</pre> | no |
| <a name="input_alb_sticky_session_cookie_duration_seconds"></a> [alb\_sticky\_session\_cookie\_duration\_seconds](#input\_alb\_sticky\_session\_cookie\_duration\_seconds) | The duration in seconds for the sticky session to be valid from ALB perspective, should be between 1 second and 1 week (604800 seconds), inclusive. | `number` | `86400` | no |
| <a name="input_alb_sticky_session_type"></a> [alb\_sticky\_session\_type](#input\_alb\_sticky\_session\_type) | The type of sticky sessions, only 'lb\_cookie' is supported for ALB. | `string` | `"lb_cookie"` | no |
| <a name="input_alb_use_sticky_sessions"></a> [alb\_use\_sticky\_sessions](#input\_alb\_use\_sticky\_sessions) | Whether to use sticky sessions (affinity) with ALB. | `bool` | `false` | no |
| <a name="input_allow_connections_from_cidr_blocks_to_db_read_replicas"></a> [allow\_connections\_from\_cidr\_blocks\_to\_db\_read\_replicas](#input\_allow\_connections\_from\_cidr\_blocks\_to\_db\_read\_replicas) | A list of CIDR-formatted IP address ranges that can connect to read replica instances. If not set read replica instances will use the same security group as master instance. | `list(string)` | `[]` | no |
| <a name="input_allow_inbound_from_security_groups"></a> [allow\_inbound\_from\_security\_groups](#input\_allow\_inbound\_from\_security\_groups) | List of security group IDs to allow inbound traffic from | `list(string)` | `[]` | no |
| <a name="input_allow_override_iam_delegation"></a> [allow\_override\_iam\_delegation](#input\_allow\_override\_iam\_delegation) | Allow user to override IAM delegation. | `bool` | `false` | no |
| <a name="input_allowed_db_read_replica_zones"></a> [allowed\_db\_read\_replica\_zones](#input\_allowed\_db\_read\_replica\_zones) | The availability zones within which it should be possible to spin up replicas | `list(string)` | `[]` | no |
| <a name="input_app_team_oidc_arn"></a> [app\_team\_oidc\_arn](#input\_app\_team\_oidc\_arn) | The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline. | `string` | n/a | yes |
| <a name="input_application_id"></a> [application\_id](#input\_application\_id) | Application ID as per CMDB | `string` | n/a | yes |
| <a name="input_application_name"></a> [application\_name](#input\_application\_name) | Name of Application as per CMDB | `string` | n/a | yes |
| <a name="input_autoscaling_cooldown"></a> [autoscaling\_cooldown](#input\_autoscaling\_cooldown) | Time to wait after last scaling activities | `number` | `60` | no |
| <a name="input_availability_zone_rebalancing"></a> [availability\_zone\_rebalancing](#input\_availability\_zone\_rebalancing) | ECS automatically redistributes tasks within a service across Availability Zones (AZs) to mitigate the risk of impaired application availability due to underlying infrastructure failures and task lifecycle activities. The valid values are ENABLED and DISABLED. Defaults to DISABLED. | `string` | `"DISABLED"` | no |
| <a name="input_aws_region"></a> [aws\_region](#input\_aws\_region) | The AWS region in which all resources will be created. | `string` | `"us-west-2"` | no |
| <a name="input_backup_retention_period_days"></a> [backup\_retention\_period\_days](#input\_backup\_retention\_period\_days) | How many days to keep backup snapshots around before cleaning them up. Must be 1 or greater to support read replicas. | `number` | `7` | no |
| <a name="input_backup_window"></a> [backup\_window](#input\_backup\_window) | The daily time range during which automated backups are created (e.g. 04:00-09:00). Time zone is UTC. Performance may be degraded while a backup runs. | `string` | `"04:00-05:00"` | no |
| <a name="input_block_device_mappings"></a> [block\_device\_mappings](#input\_block\_device\_mappings) | Specify volumes to attach to the instance besides the volumes specified by the AMI | <pre>list(object({<br>    device_name  = string<br>    no_device    = optional(bool)<br>    virtual_name = optional(string)<br>    ebs = object({<br>      delete_on_termination = bool<br>      encrypted             = bool<br>      iops                  = optional(number)<br>      kms_key_id            = optional(string)<br>      snapshot_id           = optional(string)<br>      volume_size           = number<br>      volume_type           = string<br>    })<br>  }))</pre> | `[]` | no |
| <a name="input_cloudwatch_force_destroy"></a> [cloudwatch\_force\_destroy](#input\_cloudwatch\_force\_destroy) | Controls whether the cloudwatch log group, along with its corresponding, logs gets destroyed upon a `terraform destroy`. If set to false then the group will simply be removed from the terraform state. This can only be set to true in non-prod environments | `bool` | `false` | no |
| <a name="input_cloudwatch_log_group"></a> [cloudwatch\_log\_group](#input\_cloudwatch\_log\_group) | CloudWatch Log Group to group logs from containers as group. | `string` | `null` | no |
| <a name="input_cloudwatch_logs_stream_prefix"></a> [cloudwatch\_logs\_stream\_prefix](#input\_cloudwatch\_logs\_stream\_prefix) | The 'cloudwatch\_logs\_stream\_prefix' option allows you to associate a log stream with the specified prefix. | `string` | `null` | no |
| <a name="input_cluster_ami_id"></a> [cluster\_ami\_id](#input\_cluster\_ami\_id) | AMI ID to use for cluster compute; if not provided, will find latest appropriate Golden Image | `string` | `null` | no |
| <a name="input_cluster_instance_type"></a> [cluster\_instance\_type](#input\_cluster\_instance\_type) | Instance type for cluster Container Instances; if default, a type will be chosen that may not be suitable for all workloads | `string` | `null` | no |
| <a name="input_cluster_max_size"></a> [cluster\_max\_size](#input\_cluster\_max\_size) | The maximum Container Instance size of the ECS cluster; AWS ECS will change the desired size up to this maximum | `number` | `10` | no |
| <a name="input_cluster_min_size"></a> [cluster\_min\_size](#input\_cluster\_min\_size) | The minimum Container Instance size of the ECS cluster | `number` | `1` | no |
| <a name="input_cluster_name"></a> [cluster\_name](#input\_cluster\_name) | The ECS cluster name to use for deployment. (If value is not provided, 'service\_name-cluster' will be used) | `string` | `null` | no |
| <a name="input_cmk_existing_key_arn"></a> [cmk\_existing\_key\_arn](#input\_cmk\_existing\_key\_arn) | The ARN of an existing CMK/KMS key used for the `SSE-KMS` encryption. Providing a value for 'cmk\_existing\_key\_arn' will cause all other cmk variables to be ignored. | `string` | `null` | no |
| <a name="input_containers"></a> [containers](#input\_containers) | Define the containers for ECS Task Definition. | <pre>list(object({<br>    name      = string<br>    image     = string<br>    http_port = number<br>    cpu       = number<br>    memory    = number<br>    env_vars  = map(string)<br>  }))</pre> | n/a | yes |
| <a name="input_cpu"></a> [cpu](#input\_cpu) | The desired CPU amount for the service used on ECS task.  If using Fargate, please see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html#fargate-tasks-size for proper Task CPU/Memory Options | `number` | `256` | no |
| <a name="input_create_ecs_cluster"></a> [create\_ecs\_cluster](#input\_create\_ecs\_cluster) | Decide when you need to create ECS cluster or deploy in existing one. | `bool` | `true` | no |
| <a name="input_create_lb"></a> [create\_lb](#input\_create\_lb) | Decide when you need to create Load Balancer or deploy with existing one. Default is true. | `bool` | `true` | no |
| <a name="input_create_listeners"></a> [create\_listeners](#input\_create\_listeners) | Indicates whether to create new listeners. If set to true, it will create listeners based on the values of https\_listener\_ports\_and\_ssl\_certs and http\_listener\_ports. | `bool` | `true` | no |
| <a name="input_create_redirect_listener_rule"></a> [create\_redirect\_listener\_rule](#input\_create\_redirect\_listener\_rule) | Indicates whether to create a redirect action rule for your HTTP listener(s). This requires at least one HTTP listener to add this rule to. Either existing listener arns must be provided in `http_listener_arns` to create the HTTP listeners to add this rule to. This rule will take the highest priority preventing user defined rules from being applied. | `bool` | `true` | no |
| <a name="input_created_by_email"></a> [created\_by\_email](#input\_created\_by\_email) | Toyota email of the person who creates resource. | `string` | n/a | yes |
| <a name="input_custom_db_parameter_group_parameters"></a> [custom\_db\_parameter\_group\_parameters](#input\_custom\_db\_parameter\_group\_parameters) | Specify custom parameters to add to the RDS parameter group. If you provide custom values, they will be merged with the existing default parameters defined by the Cloud Security team. In case of overlapping key values between the custom and default parameters, the security requirements defined by the Cloud Security team will take precedence over the custom values. | `map(string)` | `null` | no |
| <a name="input_custom_ecs_cloudwatch_alarms"></a> [custom\_ecs\_cloudwatch\_alarms](#input\_custom\_ecs\_cloudwatch\_alarms) | Map of cloudwatch alarms to create. This object can be used to override the default set created for the application. To learn more about the format of alarms, see https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/blob/master/cloudwatch/monitoring/README.md | `any` | `{}` | no |
| <a name="input_custom_ecs_service_role_name"></a> [custom\_ecs\_service\_role\_name](#input\_custom\_ecs\_service\_role\_name) | Custom name to use for the ECS service IAM role that is created. Note that this service IAM role is only needed when the ECS service is being used with an ELB. If blank (default), the name will be set to var.service\_name. | `string` | `null` | no |
| <a name="input_custom_iam_role_name_prefix"></a> [custom\_iam\_role\_name\_prefix](#input\_custom\_iam\_role\_name\_prefix) | Prefix for name of the IAM role used by the ECS task. If not provide, will be set to var.service\_name. | `string` | `null` | no |
| <a name="input_custom_tags"></a> [custom\_tags](#input\_custom\_tags) | A map of custom tags to apply to the resources. | `map(string)` | `{}` | no |
| <a name="input_custom_task_execution_name_prefix"></a> [custom\_task\_execution\_name\_prefix](#input\_custom\_task\_execution\_name\_prefix) | Prefix for name of task execution IAM role and policy that grants access to CloudWatch and ECR. If not provide, will be set to var.service\_name. | `string` | `null` | no |
| <a name="input_cw_existing_key_arn"></a> [cw\_existing\_key\_arn](#input\_cw\_existing\_key\_arn) | The ARN of an existing CMK/KMS key used for the `SSE-KMS` encryption. Used for encrypting the CloudWatch Log Group. | `string` | `null` | no |
| <a name="input_data_classification"></a> [data\_classification](#input\_data\_classification) | Data classification level | `string` | `"no_classification"` | no |
| <a name="input_db_allocated_storage"></a> [db\_allocated\_storage](#input\_db\_allocated\_storage) | The amount of storage space the DB should use, in GB. | `number` | `10` | no |
| <a name="input_db_allow_connections_from_cidr_blocks"></a> [db\_allow\_connections\_from\_cidr\_blocks](#input\_db\_allow\_connections\_from\_cidr\_blocks) | A list of CIDR-formatted IP address ranges that can connect to this DB. Cannot exceed more than 27 CIDR ranges | `list(string)` | `[]` | no |
| <a name="input_db_allow_major_version_upgrade"></a> [db\_allow\_major\_version\_upgrade](#input\_db\_allow\_major\_version\_upgrade) | Indicates whether major version upgrades (e.g. 9.4.x to 9.5.x) will ever be permitted. Note that these updates must always be manually performed and will never automatically applied. To learn more about major version upgrades, please visit https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Upgrading.html | `bool` | `true` | no |
| <a name="input_db_apply_immediately"></a> [db\_apply\_immediately](#input\_db\_apply\_immediately) | Specifies whether any cluster modifications are applied immediately, or during the next maintenance window. Note that cluster modifications may cause degraded performance or downtime. | `bool` | `false` | no |
| <a name="input_db_cloudwatch_logs_key_arn"></a> [db\_cloudwatch\_logs\_key\_arn](#input\_db\_cloudwatch\_logs\_key\_arn) | The arn of an existing KMS Key to encrypt the Database CloudWatch logs. If this is null, a CMK KMS key will be created for you. | `string` | `null` | no |
| <a name="input_db_custom_option_group_parameters"></a> [db\_custom\_option\_group\_parameters](#input\_db\_custom\_option\_group\_parameters) | Specify custom parameters to add to the RDS option group. If you provide custom values, they will be merged with any existing default parameters. Option groups can be created for mysql and sqlserver. Learn more here: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithOptionGroups.html | <pre>list(object({<br>    option_name = string<br>    option_settings = optional(object({<br>      name  = optional(string)<br>      value = optional(string)<br>    }))<br>  }))</pre> | `[]` | no |
| <a name="input_db_deletion_protection"></a> [db\_deletion\_protection](#input\_db\_deletion\_protection) | If the DB instance should have deletion protection enabled. The database can't be deleted when this value is set to true. This is a High Availability Disaster Recovery (HADR) field. Learn more in the README | `bool` | `true` | no |
| <a name="input_db_engine"></a> [db\_engine](#input\_db\_engine) | The DB engine to use (e.g. mysql, postgres). | `string` | `"postgres"` | no |
| <a name="input_db_engine_version"></a> [db\_engine\_version](#input\_db\_engine\_version) | The database engine version to use. | `string` | `"14"` | no |
| <a name="input_db_instance_type"></a> [db\_instance\_type](#input\_db\_instance\_type) | The database instance type (e.g. db.t3.micro). | `string` | `"db.t3.micro"` | no |
| <a name="input_db_iops"></a> [db\_iops](#input\_db\_iops) | The amount of provisioned IOPS for the primary instance. Setting this implies a storage\_type of 'io1','io2, or 'gp3'. Set to 0 to disable. | `number` | `0` | no |
| <a name="input_db_maintenance_window"></a> [db\_maintenance\_window](#input\_db\_maintenance\_window) | The weekly day and time range during which system maintenance can occur (e.g. wed:04:00-wed:04:30). Time zone is UTC. Performance may be degraded or there may even be a downtime during maintenance windows. | `string` | `"sun:07:00-sun:08:00"` | no |
| <a name="input_db_max_allocated_storage"></a> [db\_max\_allocated\_storage](#input\_db\_max\_allocated\_storage) | When configured, the upper limit to which Amazon RDS can automatically scale the storage of the DB instance. | `number` | `50` | no |
| <a name="input_db_monitoring_interval_seconds"></a> [db\_monitoring\_interval\_seconds](#input\_db\_monitoring\_interval\_seconds) | The interval, in seconds, between points when Enhanced Monitoring metrics are collected for the DB instance. To disable collecting Enhanced Monitoring metrics, specify 0. Allowed values: 0, 1, 5, 15, 30, 60. Note: This can increase cost based on CloudWatch storage and transfer rates. | `number` | `0` | no |
| <a name="input_db_name"></a> [db\_name](#input\_db\_name) | The name for your database of up to 8 alpha-numeric characters. | `string` | `null` | no |
| <a name="input_db_num_read_replicas"></a> [db\_num\_read\_replicas](#input\_db\_num\_read\_replicas) | The number of read replicas to create. RDS will asynchronously replicate all data from the master to these replicas, which you can use to horizontally scale reads traffic. | `number` | `0` | no |
| <a name="input_db_parameter_group_name"></a> [db\_parameter\_group\_name](#input\_db\_parameter\_group\_name) | Custom name for a DB parameter group to associate. If this value is left blank, a default parameter group will be created automatically. If you intend to use an existing parameter group, provide its name here. If this value is provided, custom\_parameter\_group\_parameters will be ignored. | `string` | `null` | no |
| <a name="input_db_period_seconds"></a> [db\_period\_seconds](#input\_db\_period\_seconds) | The period, in seconds over which the specified statistic is applied. | `number` | `60` | no |
| <a name="input_db_port"></a> [db\_port](#input\_db\_port) | The port the DB will listen on (e.g. 3306) | `number` | `5432` | no |
| <a name="input_db_replica_backup_retention_period_days"></a> [db\_replica\_backup\_retention\_period\_days](#input\_db\_replica\_backup\_retention\_period\_days) | How many days to keep backup snapshots around before cleaning them up on the read replicas. Must be 1 or greater to support read replicas. 0 means disable automated backups. | `number` | `0` | no |
| <a name="input_db_resource_slug"></a> [db\_resource\_slug](#input\_db\_resource\_slug) | When given, may be used to differentiate multiple resources with a unique name.  e.g. multiple database/rds Blueprints may be deployed with different slugs to coexist in the same AWS account and environment | `string` | `null` | no |
| <a name="input_db_secret_kms_key_id"></a> [db\_secret\_kms\_key\_id](#input\_db\_secret\_kms\_key\_id) | The Amazon Web Services KMS key identifier is the key ARN, key ID, alias ARN, or alias name for the KMS key. Used for encrypting the Database Secret. Defaults to shared CMK KMS key | `string` | `null` | no |
| <a name="input_db_snapshot_identifier"></a> [db\_snapshot\_identifier](#input\_db\_snapshot\_identifier) | If non-null, the RDS Instance will be restored from the given Snapshot ID. This is the Snapshot ID you'd find in the RDS console, e.g: rds:production-2015-06-26-06-05. | `string` | `null` | no |
| <a name="input_db_storage_type"></a> [db\_storage\_type](#input\_db\_storage\_type) | The type of storage to use for the primary instance. Must be one of 'standard' (magnetic), 'gp2' (general purpose SSD), 'gp3' (general purpose SSD), io1' (provisioned IOPS SSD), or 'io2' (2nd gen provisioned IOPS SSD). | `string` | `"gp2"` | no |
| <a name="input_db_subnet_ids"></a> [db\_subnet\_ids](#input\_db\_subnet\_ids) | List of persistence or private subnet ids, for RDS | `list(string)` | `[]` | no |
| <a name="input_dd_api_key_path"></a> [dd\_api\_key\_path](#input\_dd\_api\_key\_path) | The name of the SSM parameter that holds your Datadog API key. Required if enable\_datadog\_agent is set to true. | `string` | `null` | no |
| <a name="input_deployment_circuit_breaker"></a> [deployment\_circuit\_breaker](#input\_deployment\_circuit\_breaker) | Set enable to 'true' to prevent the task from attempting to continuously redeploy after a failed health check. Set rollback to 'true' to also automatically roll back to the last successful deployment. If this setting is used, both 'enable' and 'rollback' are required fields. | <pre>object({<br>    enable   = bool<br>    rollback = bool<br>  })</pre> | `null` | no |
| <a name="input_deployment_cloudwatch_alarms"></a> [deployment\_cloudwatch\_alarms](#input\_deployment\_cloudwatch\_alarms) | CloudWatch alarms which triggers deployment rollback if failure. | <pre>object({<br>    cloudwatch_alarms = list(string)<br>    enable            = bool<br>    rollback          = bool<br>  })</pre> | `null` | no |
| <a name="input_desired_number_of_ecs_canary_tasks_to_run"></a> [desired\_number\_of\_ecs\_canary\_tasks\_to\_run](#input\_desired\_number\_of\_ecs\_canary\_tasks\_to\_run) | How many Tasks to run of the var.ecs\_task\_definition\_canary to deploy for a canary deployment. Typically, only 0 or 1 should be used. | `number` | `0` | no |
| <a name="input_discovery_alias_record_evaluate_target_health"></a> [discovery\_alias\_record\_evaluate\_target\_health](#input\_discovery\_alias\_record\_evaluate\_target\_health) | Check alias target health before routing to the service. Only used if var.discovery\_use\_public\_dns is true. | `bool` | `true` | no |
| <a name="input_discovery_custom_health_check_failure_threshold"></a> [discovery\_custom\_health\_check\_failure\_threshold](#input\_discovery\_custom\_health\_check\_failure\_threshold) | The number of 30-second intervals that you want service discovery to wait before it changes the health status of a service instance. Maximum value of 10. Only used if var.use\_service\_discovery is true. | `number` | `1` | no |
| <a name="input_discovery_dns_routing_policy"></a> [discovery\_dns\_routing\_policy](#input\_discovery\_dns\_routing\_policy) | The routing policy that you want to apply to all records that Route 53 creates when you register an instance and specify the service. Valid Values: MULTIVALUE, WEIGHTED. Only used if var.use\_service\_discovery is true. | `string` | `"MULTIVALUE"` | no |
| <a name="input_discovery_dns_ttl_seconds"></a> [discovery\_dns\_ttl\_seconds](#input\_discovery\_dns\_ttl\_seconds) | The amount of time, in seconds, that you want DNS resolvers to cache the settings for this resource record set. Only used if var.use\_service\_discovery is true. | `number` | `60` | no |
| <a name="input_discovery_namespace_name"></a> [discovery\_namespace\_name](#input\_discovery\_namespace\_name) | The host name for the service discovery namespace. Example: example-staging.local | `string` | `null` | no |
| <a name="input_downscale_threshold"></a> [downscale\_threshold](#input\_downscale\_threshold) | Trigger for Alarm to decrease number of tasks | `number` | `10` | no |
| <a name="input_ec2_cluster_resource_slug"></a> [ec2\_cluster\_resource\_slug](#input\_ec2\_cluster\_resource\_slug) | A suffix which will be inserted at the end of resource names | `string` | `null` | no |
| <a name="input_ec2_task_operating_system"></a> [ec2\_task\_operating\_system](#input\_ec2\_task\_operating\_system) | The operating system of the ECS Task. Valid values are 'LINUX' or 'WINDOWS'. Used for the Datadog Agent definition. This value is ignored enable\_datadog\_agent is false and if ecs\_service\_launch\_type is FARGATE. | `string` | `"LINUX"` | no |
| <a name="input_ecr_repository_names"></a> [ecr\_repository\_names](#input\_ecr\_repository\_names) | The names of the ECR Repositories where images are pulled from for container definitions. This is used to limit the task execution role's ECR-related permissions. | `list(string)` | `[]` | no |
| <a name="input_ecs_cluster_container_insights"></a> [ecs\_cluster\_container\_insights](#input\_ecs\_cluster\_container\_insights) | Controls if ECS Cluster has container insights enabled. Valid values are 'enabled', 'disabled', or 'enhanced' | `string` | `"enabled"` | no |
| <a name="input_ecs_service_launch_type"></a> [ecs\_service\_launch\_type](#input\_ecs\_service\_launch\_type) | The launch type of the ECS service. Defaults to FARGATE. Valid value must be one of EC2 or FARGATE. | `string` | `"FARGATE"` | no |
| <a name="input_ecs_task_definition_canary"></a> [ecs\_task\_definition\_canary](#input\_ecs\_task\_definition\_canary) | The JSON text of the ECS Task Definition to be run for the canary. This defines the Docker container(s) to be run along with all their properties. It should adhere to the format described at https://goo.gl/ob5U3g. Defaults to the container definition used in var.container if not provided. | <pre>list(object({<br>    name      = string<br>    image     = string<br>    http_port = number<br>    cpu       = number<br>    memory    = number<br>    env_vars  = map(string)<br>  }))</pre> | `null` | no |
| <a name="input_efs_volumes"></a> [efs\_volumes](#input\_efs\_volumes) | (Optional) A map of EFS volumes that containers in your task may use. Each item in the list should be a map compatible with https://www.terraform.io/docs/providers/aws/r/ecs_task_definition.html#efs-volume-configuration-arguments. | <pre>map(object({<br>    file_system_id          = string # required<br>    container_path          = string # required<br>    root_directory          = string<br>    transit_encryption      = string<br>    transit_encryption_port = number<br>    access_point_id         = string<br>    iam                     = string<br>  }))</pre> | `{}` | no |
| <a name="input_enable_datadog_agent"></a> [enable\_datadog\_agent](#input\_enable\_datadog\_agent) | Set to true to enable the Datadog Agent. This will collect metrics from you instances. May incur additional costs. | `bool` | `false` | no |
| <a name="input_enable_datadog_monitoring"></a> [enable\_datadog\_monitoring](#input\_enable\_datadog\_monitoring) | Enable CloudWatch logs to deliver to DataDog; incurs additional cost | `bool` | `false` | no |
| <a name="input_enable_vpc_cidr_inbound"></a> [enable\_vpc\_cidr\_inbound](#input\_enable\_vpc\_cidr\_inbound) | Enable automatic inbound rule from VPC CIDR when no specific inbound\_cidr\_blocks are provided. Set to false for enhanced security compliance. | `bool` | `true` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment abbreviation of resource. | `string` | n/a | yes |
| <a name="input_evaluation_periods"></a> [evaluation\_periods](#input\_evaluation\_periods) | How many checks should fail for Alarm trigger | `number` | `2` | no |
| <a name="input_existing_acm_certificate_arn"></a> [existing\_acm\_certificate\_arn](#input\_existing\_acm\_certificate\_arn) | ARN of an existing ACM certificate to use. If provided, certificate and all DNS must already exist. If not provided, a certificate and DNS will be created. | `string` | `""` | no |
| <a name="input_existing_acm_hostname"></a> [existing\_acm\_hostname](#input\_existing\_acm\_hostname) | The hostname for the record associated with the existing ACM cert. Required if using existing\_acm\_certificate\_arn with NLB. | `string` | `""` | no |
| <a name="input_existing_ecs_task_execution_role_name"></a> [existing\_ecs\_task\_execution\_role\_name](#input\_existing\_ecs\_task\_execution\_role\_name) | The name of the existing task execution role to be used in place of creating a new role. | `string` | `null` | no |
| <a name="input_existing_ecs_task_role_name"></a> [existing\_ecs\_task\_role\_name](#input\_existing\_ecs\_task\_role\_name) | The name of the existing task role to be used in place of creating a new role. | `string` | `null` | no |
| <a name="input_existing_lb_name"></a> [existing\_lb\_name](#input\_existing\_lb\_name) | The name of the existing Load Balancer to be used. NOTE: `create_lb` should be `false` in case of `existing_lb_name` specified. | `string` | `null` | no |
| <a name="input_existing_namespace_id"></a> [existing\_namespace\_id](#input\_existing\_namespace\_id) | Namespace ID of the existing Service Discovery namespace | `string` | `null` | no |
| <a name="input_existing_security_group_ids"></a> [existing\_security\_group\_ids](#input\_existing\_security\_group\_ids) | List of existing security group IDs to use for the ECS task. If not provided, a new security group will be created. | `list(string)` | `[]` | no |
| <a name="input_existing_waf_acl_arn"></a> [existing\_waf\_acl\_arn](#input\_existing\_waf\_acl\_arn) | The ARN of an existing WAFv2 web ACL for API Gateway | `string` | `null` | no |
| <a name="input_fqdn"></a> [fqdn](#input\_fqdn) | Override the configuration with your desired Fully Qualified Domain Name (FQDN). <br>    If not provided, it is derived from the `route53_zone_name` and the `route53_cname` / `service_name` variables.<br>For example:<br>    If the configured hosted zone is `dev.primelabs.toyota.com` and you want traffic to be served from `dev.primelabs.toyota.com`, <br>    then set the `fqdn` value to `dev.primelabs.toyota.com`.<br>    If the configured hosted zone is `primelabs.toyota.com` but you want traffic to be served from `dev.primelabs.toyota.com`, <br>    then set `route53_cname` / `service_name` to `dev`, `route53_zone_name` to `primelabs.toyota.com`, and leave `fqdn` as null. | `string` | `null` | no |
| <a name="input_health_check_code"></a> [health\_check\_code](#input\_health\_check\_code) | HTTP codes to use when checking for a successful response from a Target. You can specify multiple values (e.g. '200,202') or a range of values (e.g. '200-299'). Required when using ALBs. | `string` | `"200"` | no |
| <a name="input_health_check_grace_period_seconds"></a> [health\_check\_grace\_period\_seconds](#input\_health\_check\_grace\_period\_seconds) | Give the container seconds to boot before having the LB start checking health. | `number` | `30` | no |
| <a name="input_health_check_healthy_threshold"></a> [health\_check\_healthy\_threshold](#input\_health\_check\_healthy\_threshold) | Specifies consecutives checks required to classify as healthy. Range is 2-10. | `number` | `5` | no |
| <a name="input_health_check_interval"></a> [health\_check\_interval](#input\_health\_check\_interval) | Specifies time duration between checks (in seconds). Range is 5-300. | `number` | `30` | no |
| <a name="input_health_check_path"></a> [health\_check\_path](#input\_health\_check\_path) | The ping path that is the destination on the Targets for health checks. Required when using ALBs. | `string` | `"/healthcheck"` | no |
| <a name="input_health_check_protocol"></a> [health\_check\_protocol](#input\_health\_check\_protocol) | Protocol to use between the service and the load balancer for health check | `string` | `"TCP"` | no |
| <a name="input_health_check_timeout"></a> [health\_check\_timeout](#input\_health\_check\_timeout) | Specifies the duration to wait for response before considering a check failed (in seconds). Range is 2-60. | `number` | `5` | no |
| <a name="input_health_check_unhealthy_threshold"></a> [health\_check\_unhealthy\_threshold](#input\_health\_check\_unhealthy\_threshold) | Specifies consecutives checks required to classify as unhealthy. Range is 2-10. For NLBs, this must equal health\_check\_healthy\_threshold. | `number` | `2` | no |
| <a name="input_http_port"></a> [http\_port](#input\_http\_port) | The port on which the host and container listens on for HTTP requests. | `number` | n/a | yes |
| <a name="input_https_listener_arns"></a> [https\_listener\_arns](#input\_https\_listener\_arns) | A list of objects providing ARNs of existing HTTPS listeners to attach the rules to. Each object has keys 'port'(number), the port number the listener is connected to, and 'arn'(string), the ARN of the listener to which to attach the rule. | <pre>list(object({<br>    port = number<br>    arn  = string<br>  }))</pre> | `[]` | no |
| <a name="input_https_listener_port"></a> [https\_listener\_port](#input\_https\_listener\_port) | The HTTPS list the load balancer should listen on | `number` | `443` | no |
| <a name="input_iam_database_authentication_enabled"></a> [iam\_database\_authentication\_enabled](#input\_iam\_database\_authentication\_enabled) | Specifies whether IAM database authentication is enabled. This option is only available for MySQL and PostgreSQL engines. | `bool` | `true` | no |
| <a name="input_iam_role_compatibility"></a> [iam\_role\_compatibility](#input\_iam\_role\_compatibility) | Make custom IAM prefixes backwards compatible (prior to v1.5.0 the module used `service_name` and now removed `environment_name` to name the IAM entities, thus the newer version would lead to IAM entities will be recreated when upgrading, unless compatibility flag set). | `bool` | `false` | no |
| <a name="input_inbound_service_cidr_blocks"></a> [inbound\_service\_cidr\_blocks](#input\_inbound\_service\_cidr\_blocks) | Provide inbound cidr blocks for ECS Service module. If none provided, it will use the first cidr block on the VPC | `list(string)` | `[]` | no |
| <a name="input_infra_live_repo"></a> [infra\_live\_repo](#input\_infra\_live\_repo) | The name of the infrastructure live repository | `string` | `"ace-aws-blueprint-ecs"` | no |
| <a name="input_instance_refresh"></a> [instance\_refresh](#input\_instance\_refresh) | The instance refresh definition. Set this to null if you don't want instances to automatically refresh. | <pre>object({<br>    strategy = string<br>    preferences = object({<br>      instance_warmup              = number<br>      min_healthy_percentage       = number<br>      scale_in_protected_instances = optional(string, "Ignore")<br>    })<br>    triggers = list(string)<br>  })</pre> | <pre>{<br>  "preferences": {<br>    "instance_warmup": 300,<br>    "min_healthy_percentage": 60,<br>    "scale_in_protected_instances": "Ignore"<br>  },<br>  "strategy": "Rolling",<br>  "triggers": []<br>}</pre> | no |
| <a name="input_is_lb_public"></a> [is\_lb\_public](#input\_is\_lb\_public) | The LB type to select public or private subnets to use. Set false to use private network with LB. | `bool` | `true` | no |
| <a name="input_lb_access_logs_s3_bucket_name"></a> [lb\_access\_logs\_s3\_bucket\_name](#input\_lb\_access\_logs\_s3\_bucket\_name) | The S3 Bucket name where NLB logs should be stored. If no value is provided, will use <name\_prefix>-<environment>-<aws\_region\_cd>-aw-<service\_name>-accesslogs. | `string` | `null` | no |
| <a name="input_lb_allow_inbound_from_cidr_blocks"></a> [lb\_allow\_inbound\_from\_cidr\_blocks](#input\_lb\_allow\_inbound\_from\_cidr\_blocks) | The list of CIDRs to allow inbound requests to the Load Balancer from, default to '0.0.0.0/0' (any source). | `list(string)` | <pre>[<br>  "0.0.0.0/0"<br>]</pre> | no |
| <a name="input_lb_allow_outbound_from_cidr_blocks"></a> [lb\_allow\_outbound\_from\_cidr\_blocks](#input\_lb\_allow\_outbound\_from\_cidr\_blocks) | The list of CIDRs to allow outbound requests to the Load Balancer from, default to '0.0.0.0/0' (any source). | `list(string)` | <pre>[<br>  "0.0.0.0/0"<br>]</pre> | no |
| <a name="input_lb_container_name"></a> [lb\_container\_name](#input\_lb\_container\_name) | The name of the container in the ECS Task Definition to map with Load Balancer. | `string` | n/a | yes |
| <a name="input_lb_enable_shield_advanced"></a> [lb\_enable\_shield\_advanced](#input\_lb\_enable\_shield\_advanced) | Enable AWS Shield Advanced for the load balancer. This will incur additional costs. | `bool` | `false` | no |
| <a name="input_lb_listener_fixed_response_rules"></a> [lb\_listener\_fixed\_response\_rules](#input\_lb\_listener\_fixed\_response\_rules) | A list of custom fixed response rules to be added to your listeners. You must specify the content\_type<br>(Valid values are `text/plain`, `text/css`, `text/html`, `application/javascript` and `application/json`)<br>and status\_code (Valid values are `2XX`, `4XX`, or `5XX`.) attribute<br>and may optionally specify the message\_body attributes. These rules will be applied<br>to the listeners specified in listener\_arns or listener\_ports. You must provide either listener\_arns<br>or listener\_ports. The rule will be applied to the specified listeners. At least one condition must also be provided.<br>Possible conditions include path\_patterns, host\_headers, source\_ips, query\_strings, and http\_request\_methods.<br>Each is a list of strings except for query\_strings which is a list of objects with keys 'key' and 'value'.<br>All conditions must match for the rule to be applied. | <pre>list(object({<br>    priority      = number<br>    content_type  = string<br>    status_code   = string<br>    message_body  = optional(string)<br>    path_patterns = optional(list(string), [])<br>    host_headers  = optional(list(string), [])<br>    source_ips    = optional(list(string), [])<br>    query_strings = optional(list(object({<br>      key   = optional(string)<br>      value = string<br>    })), [])<br>    http_request_methods = optional(list(string), [])<br>    listener_ports       = optional(list(number))<br>    listener_arns        = optional(list(string))<br>  }))</pre> | `[]` | no |
| <a name="input_lb_listener_forward_rules"></a> [lb\_listener\_forward\_rules](#input\_lb\_listener\_forward\_rules) | A list of custom forward rules to be added to your listeners. These will all point to<br>the target group specified by var.target\_group\_arns unless target\_groups are specified<br>in this variable. You may also optionally include a stickiness value (an object containing the<br>values `enabled` a boolean specifying whether to turn on stickiness, and `duration` the time period,<br>in seconds, during which requests from a client should be routed to the same target group for this rule)<br>Stickiness will only apply if more than one target group is specified. These rules will be applied<br>to the listeners specified in listener\_arns or listener\_ports. You must provide either listener\_arns<br>or listener\_ports. The rule will be applied to the specified listeners. At least one condition must also be<br>provided. Possible conditions include path\_patterns, host\_headers, source\_ips, query\_strings, and<br>http\_request\_methods. Each is a list of strings except for query\_strings which is a list of objects<br>with keys 'key' and 'value'. All conditions must match for the rule to be applied. | <pre>list(object({<br>    priority = number<br>    target_group_arns = optional(list(object({<br>      arn    = string<br>      weight = optional(number)<br>    })))<br>    stickiness = optional(object({<br>      enabled  = bool<br>      duration = optional(number)<br>    }))<br>    path_patterns = optional(list(string), [])<br>    host_headers  = optional(list(string), [])<br>    source_ips    = optional(list(string), [])<br>    query_strings = optional(list(object({<br>      key   = optional(string)<br>      value = string<br>    })), [])<br>    http_request_methods = optional(list(string), [])<br>    listener_ports       = optional(list(number))<br>    listener_arns        = optional(list(string))<br>  }))</pre> | `[]` | no |
| <a name="input_lb_listener_redirect_rules"></a> [lb\_listener\_redirect\_rules](#input\_lb\_listener\_redirect\_rules) | A list of custom redirect rules to be added to your listeners. You will specify the address to redirect to using the<br>attributes: host, path, port, protocol, and query. These get combined into `protocol://host:port/path?query`,<br>and any value not provided will default to the original value from the incoming request. These rules will be applied<br>to the listeners specified in listener\_arns or listener\_ports. You must provide either listener\_arns<br>or listener\_ports. The rule will be applied to the specified listeners. At least one condition must also be provided.<br>Possible conditions include path\_patterns, host\_headers, source\_ips, query\_strings, and http\_request\_methods.<br>Each is a list of strings except for query\_strings which is a list of objects with keys 'key' and 'value'.<br>All conditions must match for the rule to be applied. | <pre>list(object({<br>    priority      = number<br>    status_code   = string<br>    host          = optional(string)<br>    path          = optional(string)<br>    port          = optional(number)<br>    protocol      = optional(string)<br>    query         = optional(string)<br>    path_patterns = optional(list(string), [])<br>    host_headers  = optional(list(string), [])<br>    source_ips    = optional(list(string), [])<br>    query_strings = optional(list(object({<br>      key   = optional(string)<br>      value = string<br>    })), [])<br>    http_request_methods = optional(list(string), [])<br>    listener_ports       = optional(list(number))<br>    listener_arns        = optional(list(string))<br>  }))</pre> | `[]` | no |
| <a name="input_lb_listener_rules_default_actions"></a> [lb\_listener\_rules\_default\_actions](#input\_lb\_listener\_rules\_default\_actions) | A list of objects defining default actions for the listeners. You must either pass in one map to<br>be applied to all created listeners, or one for each entry in `https_listener_ports_and_ssl_certs`<br>with the corresponding port defined in the `port` attributes. The maps must contain the key 'type'<br>which can be either 'forward', 'redirect' or 'fixed-response'. If this list is left empty, the<br>default\_action will be set to forward traffic to the target group specified in the 'target\_group\_arn'<br>variable if use\_nlb is true, or to return a 404 response if use\_alb is true. See the README for more details. | <pre>list(object({<br>    type = string<br>    port = optional(number)<br>    fixed_response = optional(object({<br>      content_type = string<br>      message_body = optional(string)<br>      status_code  = optional(string)<br>    }))<br>    forward = optional(object({<br>      target_group = list(object({<br>        arn    = string<br>        weight = optional(number)<br>      }))<br>      stickiness = optional(object({<br>        duration = number<br>        enabled  = optional(bool)<br>      }))<br>    }))<br>    order = optional(number)<br>    redirect = optional(object({<br>      status_code = string<br>      host        = optional(string)<br>      path        = optional(string)<br>      port        = optional(string)<br>      protocol    = optional(string)<br>      query       = optional(string)<br>    }))<br>  }))</pre> | `[]` | no |
| <a name="input_lb_logs_bucket_force_destroy"></a> [lb\_logs\_bucket\_force\_destroy](#input\_lb\_logs\_bucket\_force\_destroy) | Force destroy S3 buckets for Load Balancer logs | `bool` | `false` | no |
| <a name="input_lb_s3_logs_lifecycle_configuration_rules"></a> [lb\_s3\_logs\_lifecycle\_configuration\_rules](#input\_lb\_s3\_logs\_lifecycle\_configuration\_rules) | Lifecycle policy to be applied to the logging S3 bucket. | <pre>list(object({<br>    enabled                                = bool<br>    id                                     = string<br>    abort_incomplete_multipart_upload_days = number<br>    # `filter_and` is the `and` configuration block inside the `filter` configuration.<br>    # This is the only place you should specify a prefix.<br>    filter_and                    = any<br>    expiration                    = any<br>    transition                    = list(any)<br>    noncurrent_version_expiration = any<br>    noncurrent_version_transition = list(any)<br>  }))</pre> | <pre>[<br>  {<br>    "abort_incomplete_multipart_upload_days": 90,<br>    "enabled": true,<br>    "expiration": {<br>      "days": 365<br>    },<br>    "filter_and": null,<br>    "id": "access_logging_lifecycle",<br>    "noncurrent_version_expiration": null,<br>    "noncurrent_version_transition": null,<br>    "transition": null<br>  }<br>]</pre> | no |
| <a name="input_lb_security_group_ids"></a> [lb\_security\_group\_ids](#input\_lb\_security\_group\_ids) | List of security group IDs to assign to the Load Balancer. NOTE: Security groups cannot be added if none are currently present, and cannot all be removed once added. If either of these conditions are met, this will force a recreation of the resource. | `list(string)` | `[]` | no |
| <a name="input_lb_shield_aggregation_method"></a> [lb\_shield\_aggregation\_method](#input\_lb\_shield\_aggregation\_method) | An aggregation method for the protection group to detect anomalies. Valid values are 'SUM', 'MEAN','MAX' | `string` | `"SUM"` | no |
| <a name="input_lb_slow_start"></a> [lb\_slow\_start](#input\_lb\_slow\_start) | Amount time for targets to warm up before the load balancer sends them a full share of requests. Range is 30-900 seconds or 0 to disable. | `number` | `30` | no |
| <a name="input_lb_subnet_ids"></a> [lb\_subnet\_ids](#input\_lb\_subnet\_ids) | List of public (when 'is\_lb\_public' set to 'true') or private (when 'is\_lb\_public' set to 'false') subnet IDs for Load Balancer. | `list(string)` | `[]` | no |
| <a name="input_lb_type"></a> [lb\_type](#input\_lb\_type) | Indication the type of a load balancer, possible values are: 'application' and 'network'. | `string` | `"application"` | no |
| <a name="input_log_retention_period_days"></a> [log\_retention\_period\_days](#input\_log\_retention\_period\_days) | How long in days the Cloudwatch logs are stored before being deleted. | `number` | `30` | no |
| <a name="input_master_username"></a> [master\_username](#input\_master\_username) | The username for the master user. Required unless var.replicate\_source\_db is set. | `string` | `null` | no |
| <a name="input_max_number_of_tasks"></a> [max\_number\_of\_tasks](#input\_max\_number\_of\_tasks) | Autoscaling configuration. Set maximum number of tasks | `number` | `4` | no |
| <a name="input_memory"></a> [memory](#input\_memory) | The desired Memory amount for the service used on ECS task.  If using Fargate, please see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html#fargate-tasks-size for proper Task CPU/Memory Options | `number` | `512` | no |
| <a name="input_metric_aggregation_type"></a> [metric\_aggregation\_type](#input\_metric\_aggregation\_type) | The aggregation type for the policy's metrics. Valid values are 'Minimum', 'Maximum', and 'Average'. Without a value, AWS will treat the aggregation type as 'Average' | `string` | `"Average"` | no |
| <a name="input_min_number_of_tasks"></a> [min\_number\_of\_tasks](#input\_min\_number\_of\_tasks) | Autoscaling configuration. Set minimum number of tasks | `number` | `1` | no |
| <a name="input_monitoring_role_arn"></a> [monitoring\_role\_arn](#input\_monitoring\_role\_arn) | The ARN for the IAM role that permits RDS to send enhanced monitoring metrics to CloudWatch Logs. If ARN is not provided, a role will be created. | `string` | `null` | no |
| <a name="input_multi_az"></a> [multi\_az](#input\_multi\_az) | Specifies if a standby instance should be deployed in another availability zone. If the primary fails, this instance will automatically take over. | `bool` | `false` | no |
| <a name="input_name_prefix"></a> [name\_prefix](#input\_name\_prefix) | String to prefix resource names. | `string` | n/a | yes |
| <a name="input_nlb_enable_deletion_protection"></a> [nlb\_enable\_deletion\_protection](#input\_nlb\_enable\_deletion\_protection) | This will prevent Terraform from deleting the network load balancer if the value is true | `bool` | `true` | no |
| <a name="input_nlb_enforce_security_group_inbound_rules_on_private_link_traffic"></a> [nlb\_enforce\_security\_group\_inbound\_rules\_on\_private\_link\_traffic](#input\_nlb\_enforce\_security\_group\_inbound\_rules\_on\_private\_link\_traffic) | Whether or not to enforce ingress security rules when traffic originates from PrivateLink | `bool` | `true` | no |
| <a name="input_outbound_cidr_blocks"></a> [outbound\_cidr\_blocks](#input\_outbound\_cidr\_blocks) | List of CIDR blocks allowed for egress traffic | `list(string)` | <pre>[<br>  "0.0.0.0/0"<br>]</pre> | no |
| <a name="input_outbound_from_port"></a> [outbound\_from\_port](#input\_outbound\_from\_port) | The starting port for outbound traffic allowed by the security group rule. | `number` | `0` | no |
| <a name="input_outbound_protocol"></a> [outbound\_protocol](#input\_outbound\_protocol) | Outbound traffic protocol. Options: 'tcp', 'udp', 'icmp', or '-1' (all). | `string` | `"-1"` | no |
| <a name="input_outbound_to_port"></a> [outbound\_to\_port](#input\_outbound\_to\_port) | The ending port for outbound traffic allowed by the security group rule. | `number` | `0` | no |
| <a name="input_parameter_group_name_for_db_read_replicas"></a> [parameter\_group\_name\_for\_db\_read\_replicas](#input\_parameter\_group\_name\_for\_db\_read\_replicas) | Name of a DB parameter group to associate with read replica instances. Defaults to var.parameter\_group\_name if not set. | `string` | `null` | no |
| <a name="input_performance_insights_enabled"></a> [performance\_insights\_enabled](#input\_performance\_insights\_enabled) | Specifies whether Performance Insights is enabled or not. On Aurora MySQL, Performance Insights is not supported on db.t2 or db.t3 DB instance classes. Note: This will increase cost if retention period is longer than 7 days. | `bool` | `false` | no |
| <a name="input_performance_insights_kms_key_id"></a> [performance\_insights\_kms\_key\_id](#input\_performance\_insights\_kms\_key\_id) | The ARN for the KMS key to encrypt Performance Insights data. Defaults to shared CMK KMS Key. | `string` | `null` | no |
| <a name="input_performance_insights_retention_period_days"></a> [performance\_insights\_retention\_period\_days](#input\_performance\_insights\_retention\_period\_days) | The amount of time in days to retain Performance Insights data. Valid options are 7, 31, 62, 93, 124, 155, 186, 217, 248, 279, 310, 341, 372, 403, 434, 465, 496, 527, 558, 589, 620, 651, 682, 713, 731. When specifying performance\_insights\_retention\_period, performance\_insights\_enabled needs to be set to true. Defaults to 7. Note: This will increase cost if retention period is longer than 7 days. | `number` | `0` | no |
| <a name="input_period"></a> [period](#input\_period) | The period in seconds over which the specified statistic is applied. | `number` | `60` | no |
| <a name="input_private_subnet_ids"></a> [private\_subnet\_ids](#input\_private\_subnet\_ids) | List of private subnet ids, for ECS services | `list(string)` | `[]` | no |
| <a name="input_propagate_tags"></a> [propagate\_tags](#input\_propagate\_tags) | Whether tags should be propogated to the tasks from the service or from the task definition. Valid values are SERVICE and TASK\_DEFINITION. Defaults to SERVICE. If set to null, no tags are created for tasks. | `string` | `"SERVICE"` | no |
| <a name="input_protect_from_scale_in"></a> [protect\_from\_scale\_in](#input\_protect\_from\_scale\_in) | If true, instances are protected from scale-in termination. | `bool` | `false` | no |
| <a name="input_protocol"></a> [protocol](#input\_protocol) | Protocol to use between the service and the load balancer | `string` | `"TCP"` | no |
| <a name="input_rds_key_arn"></a> [rds\_key\_arn](#input\_rds\_key\_arn) | ARN of an existing KMS key. Used for RDS Database encryption. If this is not provided, a CMK KMS key will be created. | `string` | `null` | no |
| <a name="input_resource_slug"></a> [resource\_slug](#input\_resource\_slug) | A suffix which will be inserted at the end of resource names | `string` | `null` | no |
| <a name="input_route53_alias_records"></a> [route53\_alias\_records](#input\_route53\_alias\_records) | A block indicating an alias resource record set. Conflicts with ttl and record\_names. | <pre>object({<br>    name                   = string<br>    zone_id                = string<br>    evaluate_target_health = bool<br>  })</pre> | `null` | no |
| <a name="input_route53_cidr_routing_policy"></a> [route53\_cidr\_routing\_policy](#input\_route53\_cidr\_routing\_policy) | A block indicating a routing policy based on the IP network ranges of requestors. Conflicts with any other routing policy | <pre>object({<br>    collection_id = string<br>    location_name = string<br>  })</pre> | `null` | no |
| <a name="input_route53_cname"></a> [route53\_cname](#input\_route53\_cname) | CNAME for application | `string` | `null` | no |
| <a name="input_route53_failover_health_check_id"></a> [route53\_failover\_health\_check\_id](#input\_route53\_failover\_health\_check\_id) | The ID of the health check the record should be associated with. Required if you specify a failover routing policy. | `string` | `null` | no |
| <a name="input_route53_failover_routing_policy"></a> [route53\_failover\_routing\_policy](#input\_route53\_failover\_routing\_policy) | A string indicating whether this record is the PRIMARY or SECONDARY record for a failover routing policy. The PRIMARY record must have an associated health check. Conflicts with any other routing policy. | `string` | `null` | no |
| <a name="input_route53_geolocation_routing_policy"></a> [route53\_geolocation\_routing\_policy](#input\_route53\_geolocation\_routing\_policy) | A block indicating a routing policy based on the geolocation of the requestor. You must provide at least one of continent or country. See the README for documentation on valid inputs. Conflicts with any other routing policy. | <pre>object({<br>    continent   = optional(string, null)<br>    country     = optional(string, null)<br>    subdivision = optional(string, null)<br>  })</pre> | `null` | no |
| <a name="input_route53_latency_routing_policy"></a> [route53\_latency\_routing\_policy](#input\_route53\_latency\_routing\_policy) | The AWS region to compare the requestors latency to for a latency based routing policy. Conflicts with any other routing policy. | `string` | `null` | no |
| <a name="input_route53_multivalue_answer_routing_policy"></a> [route53\_multivalue\_answer\_routing\_policy](#input\_route53\_multivalue\_answer\_routing\_policy) | Set to true to indicate a multivalue answer routing policy. This will allow multiple IPs to be returned for a single request. Conflicts with any other routing policy. | `bool` | `null` | no |
| <a name="input_route53_private_zone"></a> [route53\_private\_zone](#input\_route53\_private\_zone) | Private hosted DNS zone. Only set to true if the zone name in var.zone\_name is a private zone. | `bool` | `false` | no |
| <a name="input_route53_set_identifier"></a> [route53\_set\_identifier](#input\_route53\_set\_identifier) | Unique identifier to identify records using routing policies. Required if you specify a routing policy. | `string` | `null` | no |
| <a name="input_route53_ttl"></a> [route53\_ttl](#input\_route53\_ttl) | Route53 record ttl | `number` | `60` | no |
| <a name="input_route53_weighted_routing_policy"></a> [route53\_weighted\_routing\_policy](#input\_route53\_weighted\_routing\_policy) | A number indicating a weight for this record. Use these records to balance the load across multiple resources. Conflicts with any other routing policy. | `number` | `null` | no |
| <a name="input_route53_zone_name"></a> [route53\_zone\_name](#input\_route53\_zone\_name) | Public DNS zone name; when creating private DNS certificates and records, this zone must be set to a public zone containing the private zone as a subdomain. See README.md Notes for more information | `string` | `null` | no |
| <a name="input_route53_zone_name_private"></a> [route53\_zone\_name\_private](#input\_route53\_zone\_name\_private) | Private DNS zone name; used only when var.route53\_private\_zone is true | `string` | `null` | no |
| <a name="input_runtime_platform"></a> [runtime\_platform](#input\_runtime\_platform) | Define the runtime platform for ECS Task Definition. | <pre>object({<br>    operating_system_family = string<br>    cpu_architecture        = string<br>  })</pre> | `null` | no |
| <a name="input_s3_replication_enabled"></a> [s3\_replication\_enabled](#input\_s3\_replication\_enabled) | Set this to true and specify `s3_replication_rules` to enable replication. `versioning_enabled` must also be `true`. | `bool` | `false` | no |
| <a name="input_s3_replication_rules"></a> [s3\_replication\_rules](#input\_s3\_replication\_rules) | Specifies the replication rules for S3 bucket replication if enabled. You must also set s3\_replication\_enabled to true. | <pre>list(object({<br>    id       = string<br>    status   = optional(string, "Enabled")<br>    priority = number<br>    prefix   = optional(string)<br><br>    # Delete marker replication - support both formats<br>    delete_marker_replication = optional(object({<br>      status = string<br>    }))<br><br>    # Destination bucket options<br>    destination = object({<br>      bucket        = optional(string)<br>      storage_class = optional(string, "STANDARD")<br>      encryption_configuration = optional(object({<br>        replica_kms_key_id = string<br>      }))<br>      access_control_translation = optional(object({<br>        owner = string<br>      }))<br>      account = optional(string)<br>      metrics = optional(object({<br>        event_threshold = optional(object({<br>          minutes = optional(number, 15)<br>        }), { minutes = 15 })<br>        status = optional(string, "Enabled")<br>      }), { status = "Disabled" })<br>      replication_time = optional(object({<br>        time = optional(object({<br>          minutes = optional(number, 15)<br>        }), { minutes = 15 })<br>        status = optional(string)<br>      }))<br>    })<br><br>    source_selection_criteria = optional(object({<br>      replica_modifications = optional(object({<br>        status = string<br>      }))<br>      sse_kms_encrypted_objects = optional(object({<br>        status = optional(string)<br>      }))<br>    }))<br><br>    filter = optional(object({<br>      prefix = optional(string)<br>      tags   = optional(map(string), {})<br>    }))<br>  }))</pre> | `null` | no |
| <a name="input_scaling_metric"></a> [scaling\_metric](#input\_scaling\_metric) | Define the metric for auto scaling process to refer. (e.g. memory or cpu.) | `string` | `"cpu"` | no |
| <a name="input_service_create_update_timeout"></a> [service\_create\_update\_timeout](#input\_service\_create\_update\_timeout) | Use this variable to adjust the default timeout of 20m for create and update operations the the ECS service. Adjusting the value can be particularly useful when using 'wait\_for\_steady\_state'. | `string` | `"20m"` | no |
| <a name="input_service_delete_timeout"></a> [service\_delete\_timeout](#input\_service\_delete\_timeout) | Use this variable to adjust the default timeout of 5m for delete operations the the ECS service. | `string` | `"5m"` | no |
| <a name="input_service_name"></a> [service\_name](#input\_service\_name) | The name of the ECS service to run. | `string` | n/a | yes |
| <a name="input_skip_final_snapshot"></a> [skip\_final\_snapshot](#input\_skip\_final\_snapshot) | Determines whether a final DB snapshot is created before the DB instance is deleted. | `bool` | `false` | no |
| <a name="input_source_policy_documents"></a> [source\_policy\_documents](#input\_source\_policy\_documents) | List of IAM policy documents (in JSON) that are merged together into the final bucket policy.<br>Statements defined in source\_policy\_documents must have unique SIDs.<br>Note that if the policy documents are not specific enough (but still valid), <br>Terraform may view them as constantly changing in a terraform plan. <br>In this case, please make sure you use the verbose/specific version of the policies. | `list(string)` | `[]` | no |
| <a name="input_statistic"></a> [statistic](#input\_statistic) | The statistic of the metric. Valid values: Average, Minimum, Maximum, SampleCount, and Sum. | `string` | `"Average"` | no |
| <a name="input_subject_alternative_names"></a> [subject\_alternative\_names](#input\_subject\_alternative\_names) | A list of additional Subject Alternative Names (SANs) to be added to the ACM certificate.<br>These should be fully qualified names matching the domain provided at route53\_zone\_name variable.<br><br>If a route53\_cname value is provided, it will be automatically included as a SAN.<br>Note: This module does not create Route53 records for the specified SANs. | `list(string)` | `[]` | no |
| <a name="input_task_T_shirt_size"></a> [task\_T\_shirt\_size](#input\_task\_T\_shirt\_size) | Container size in T-shirt mode | `string` | `""` | no |
| <a name="input_team"></a> [team](#input\_team) | a team identifier which will populate the tmna:team tag | `string` | `null` | no |
| <a name="input_threshold_cpu"></a> [threshold\_cpu](#input\_threshold\_cpu) | Value on which alarm will be triggered, for CPU this is percent | `number` | `80` | no |
| <a name="input_threshold_hdd"></a> [threshold\_hdd](#input\_threshold\_hdd) | Value on which alarm will be triggered, for HDD this is bytes (1000000000 = 1GB) | `number` | `1000000000` | no |
| <a name="input_threshold_ram"></a> [threshold\_ram](#input\_threshold\_ram) | Value on which alarm will be triggered, for RAM this is bytes (256000000 = 256MB) | `number` | `256000000` | no |
| <a name="input_tls_passthrough"></a> [tls\_passthrough](#input\_tls\_passthrough) | Set to true to terminate TLS at your application, not at the load balancer.<br>This is more secure, but less common.  Your application must have this capability for it to work.<br>Applies to listeners for NLB only. | `bool` | `false` | no |
| <a name="input_upscale_threshold"></a> [upscale\_threshold](#input\_upscale\_threshold) | Trigger for Alarm to increase number of tasks | `number` | `50` | no |
| <a name="input_use_auto_scaling"></a> [use\_auto\_scaling](#input\_use\_auto\_scaling) | Autoscaling configuration. Set false to disable Autoscaling | `bool` | `true` | no |
| <a name="input_use_existing_namespace"></a> [use\_existing\_namespace](#input\_use\_existing\_namespace) | This variable determines whether to use an existing Service Discovery namespace in your infrastructure. Set this to true if you want to leverage a previously created namespace for your resources. Keep it at the default (false) if you prefer to create a new namespace during configuration | `bool` | `false` | no |
| <a name="input_use_service_discovery"></a> [use\_service\_discovery](#input\_use\_service\_discovery) | Set this variable to 'true' to setup service discovery for the ECS service by automatically registering the task IPs to a registry that is created within this module. Currently this is only supported with the 'awsvpc' networking mode. | `bool` | `false` | no |
| <a name="input_volumes"></a> [volumes](#input\_volumes) | (Optional) A map of volume blocks that containers in your task may use. The key should be the name of the volume and the value should be a map compatible with https://www.terraform.io/docs/providers/aws/r/ecs_task_definition.html#volume-block-arguments, but not including the name parameter. | `map(any)` | `{}` | no |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | The id of the specific VPC to retrieve. | `string` | n/a | yes |
| <a name="input_waf_add_default_zscalar_ips"></a> [waf\_add\_default\_zscalar\_ips](#input\_waf\_add\_default\_zscalar\_ips) | When true, adds the list of TMNA zScaler IP's to the IP's whitelisted in var.waf\_list\_of\_ips. | `bool` | `false` | no |
| <a name="input_waf_add_tmna_network_device_ips"></a> [waf\_add\_tmna\_network\_device\_ips](#input\_waf\_add\_tmna\_network\_device\_ips) | These should be whitelisted for traffic originating inside TMNA. When true, adds the list of TMNA Network Device IP's to the IP's whitelisted in var.list\_of\_ips. | `bool` | `false` | no |
| <a name="input_waf_add_vpc_private_ips"></a> [waf\_add\_vpc\_private\_ips](#input\_waf\_add\_vpc\_private\_ips) | These should be whitelisted for traffic originating from TMNA AWS Workspaces IP's and AWS Appstream IP's. When true, adds the list of TMNA AWS Workspaces IP's and AWS Appstream IP's to the IP's whitelisted in var.list\_of\_ips. | `bool` | `false` | no |
| <a name="input_waf_advanced_managed_rules"></a> [waf\_advanced\_managed\_rules](#input\_waf\_advanced\_managed\_rules) | A map of AWS Managed WAF rules for the Web ACL. When you enable advanced\_managed\_rules, you take complete control of the AWS Managed Rules (the `managed_rules` variable will be ignored if `advanced_managed_rules` is not {}).  You are responsible for implementing, at a minimum, the required Managed Rules as found in the [AWS Requirements](https://toyota.atlassian.net/wiki/spaces/CSTG/pages/297739017/AWS+Requirements#AWS-WAF-(Web-Application-Firewall)).  This is not needed for normal use cases.  If you decide to override the Managed Rules with advanced\_managed\_rules, you must: not enable Allow - either Block, or if required for application, Count -  and notify your SEE team to review your rules. See https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list for more details. | `any` | `{}` | no |
| <a name="input_waf_default_action"></a> [waf\_default\_action](#input\_waf\_default\_action) | The default action for the WAF ACL. Choose 'allow' to make the WAF public and permit all requests, or 'block' to deny all requests by default. https://docs.aws.amazon.com/waf/latest/developerguide/web-acl-default-action.html | `string` | `"block"` | no |
| <a name="input_waf_filtered_header_rule"></a> [waf\_filtered\_header\_rule](#input\_waf\_filtered\_header\_rule) | HTTP header to filter in Web ACL. Priority should be greater than or equal to 1000, and unique for Rules. Currently supports a single header type and multiple header values. Optional rule name can also be provided. | <pre>object({<br>    header_types = list(string)<br>    priority     = number<br>    header_value = string<br>    action       = string<br>    rule_name    = optional(string)<br>  })</pre> | <pre>{<br>  "action": "block",<br>  "header_types": [],<br>  "header_value": "",<br>  "priority": 1000,<br>  "rule_name": ""<br>}</pre> | no |
| <a name="input_waf_group_rules"></a> [waf\_group\_rules](#input\_waf\_group\_rules) | List of WAFv2 Rule Groups in Web ACL. Priority should be greater than or equal to 1000, and unique for Rule Groups. To learn more about the fields of this object, see https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/blob/master/security/defense/waf-acl-zscalar/README.md | <pre>list(object({<br>    name            = string<br>    arn             = string<br>    priority        = number<br>    override_action = string<br>    rule_action_override = list(object({<br>      name          = string<br>      action_to_use = any<br>    }))<br>  }))</pre> | `[]` | no |
| <a name="input_waf_ip_rate_based_rule"></a> [waf\_ip\_rate\_based\_rule](#input\_waf\_ip\_rate\_based\_rule) | A rate-based rule in Web ACL tracks the rate of requests for each originating IP address, and triggers the rule action when the rate exceeds a limit that you specify on the number of requests in any 5-minute time span. Priority should be greater than or equal to 1000, and unique for Rules | <pre>object({<br>    name     = string<br>    priority = number<br>    limit    = number<br>    action   = string<br>  })</pre> | `null` | no |
| <a name="input_waf_kinesis_firehose_stream_arns"></a> [waf\_kinesis\_firehose\_stream\_arns](#input\_waf\_kinesis\_firehose\_stream\_arns) | Kinesis Firehose Log Stream arns, for log delivery | `list(string)` | `[]` | no |
| <a name="input_waf_list_of_ips"></a> [waf\_list\_of\_ips](#input\_waf\_list\_of\_ips) | List of IP addresses to whitelist. Creates a Rule Group. Priority will be 999 if used. WAF supports all IPv4 and IPv6 CIDR ranges except for /0 | `list(string)` | <pre>[<br>  "0.0.0.0/1"<br>]</pre> | no |
| <a name="input_waf_managed_rules"></a> [waf\_managed\_rules](#input\_waf\_managed\_rules) | Map of Managed WAF rules. Details on available values can be found in AWS documentation: https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups.html | `map(any)` | `{}` | no |
| <a name="input_waf_s3_lifecycle_configuration_rules"></a> [waf\_s3\_lifecycle\_configuration\_rules](#input\_waf\_s3\_lifecycle\_configuration\_rules) | Lifecycle policy to be applied to the logging S3 bucket. S3 logging is disabled if use\_kinesis is set to true. | <pre>list(object({<br>    enabled = bool<br>    id      = string<br><br>    abort_incomplete_multipart_upload_days = number<br><br>    filter_and = any<br>    expiration = any<br>    transition = list(any)<br><br>    noncurrent_version_expiration = any<br>    noncurrent_version_transition = list(any)<br>  }))</pre> | `null` | no |
| <a name="input_waf_s3_logging_bucket_force_destroy"></a> [waf\_s3\_logging\_bucket\_force\_destroy](#input\_waf\_s3\_logging\_bucket\_force\_destroy) | Force destroy the WAF S3 logging bucket. This value should only be set to true in non-prod for testing purposes. S3 logging is disabled if use\_kinesis is set to true. | `bool` | `false` | no |
| <a name="input_waf_use_kinesis"></a> [waf\_use\_kinesis](#input\_waf\_use\_kinesis) | Send WAF logs to Kinesis instead of S3. This will incur additional cost. NOTE: This will cause all s3 logging variables to be ignored. If set to true, you must provide a value for kinesis\_firehose\_stream\_arns as well. | `bool` | `false` | no |
| <a name="input_wait_for_steady_state"></a> [wait\_for\_steady\_state](#input\_wait\_for\_steady\_state) | If true, Terraform will wait for the service to reach a steady state — as in, the ECS tasks you wanted are actually deployed — before 'apply' is considered complete. | `bool` | `true` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_acm_certificate_arns"></a> [acm\_certificate\_arns](#output\_acm\_certificate\_arns) | n/a |
| <a name="output_alb_access_logging_enabled"></a> [alb\_access\_logging\_enabled](#output\_alb\_access\_logging\_enabled) | Whether access logging is enabled for ALB |
| <a name="output_aws_ecs_task_definition_arn"></a> [aws\_ecs\_task\_definition\_arn](#output\_aws\_ecs\_task\_definition\_arn) | n/a |
| <a name="output_cloudwatch_log_group_name"></a> [cloudwatch\_log\_group\_name](#output\_cloudwatch\_log\_group\_name) | n/a |
| <a name="output_database_address"></a> [database\_address](#output\_database\_address) | n/a |
| <a name="output_database_parameter_arn_map"></a> [database\_parameter\_arn\_map](#output\_database\_parameter\_arn\_map) | n/a |
| <a name="output_database_port"></a> [database\_port](#output\_database\_port) | n/a |
| <a name="output_database_security_group_id"></a> [database\_security\_group\_id](#output\_database\_security\_group\_id) | n/a |
| <a name="output_ecs_cluster_arn"></a> [ecs\_cluster\_arn](#output\_ecs\_cluster\_arn) | ECS Cluster ARN |
| <a name="output_ecs_service_security_group_id"></a> [ecs\_service\_security\_group\_id](#output\_ecs\_service\_security\_group\_id) | n/a |
| <a name="output_ecs_task_execution_iam_role_arn"></a> [ecs\_task\_execution\_iam\_role\_arn](#output\_ecs\_task\_execution\_iam\_role\_arn) | n/a |
| <a name="output_ecs_task_execution_iam_role_name"></a> [ecs\_task\_execution\_iam\_role\_name](#output\_ecs\_task\_execution\_iam\_role\_name) | n/a |
| <a name="output_ecs_task_iam_role_arn"></a> [ecs\_task\_iam\_role\_arn](#output\_ecs\_task\_iam\_role\_arn) | n/a |
| <a name="output_ecs_task_iam_role_name"></a> [ecs\_task\_iam\_role\_name](#output\_ecs\_task\_iam\_role\_name) | n/a |
| <a name="output_hostname"></a> [hostname](#output\_hostname) | n/a |
| <a name="output_kms_key_arn"></a> [kms\_key\_arn](#output\_kms\_key\_arn) | ARN of the KMS key used for encryption |
| <a name="output_lb_access_logs_s3_bucket_name"></a> [lb\_access\_logs\_s3\_bucket\_name](#output\_lb\_access\_logs\_s3\_bucket\_name) | S3 bucket name for load balancer access logs |
| <a name="output_lb_arn"></a> [lb\_arn](#output\_lb\_arn) | n/a |
| <a name="output_lb_dns_name"></a> [lb\_dns\_name](#output\_lb\_dns\_name) | n/a |
| <a name="output_lb_zone_id"></a> [lb\_zone\_id](#output\_lb\_zone\_id) | n/a |
| <a name="output_nlb_access_logging_enabled"></a> [nlb\_access\_logging\_enabled](#output\_nlb\_access\_logging\_enabled) | Whether access logging is enabled for NLB |
| <a name="output_waf2_acl_arn"></a> [waf2\_acl\_arn](#output\_waf2\_acl\_arn) | WAF ACL ARN generated by the module |
| <a name="output_waf2_acl_id"></a> [waf2\_acl\_id](#output\_waf2\_acl\_id) | WAF ACL ID generated by the module |
| <a name="output_waf_logging_enabled"></a> [waf\_logging\_enabled](#output\_waf\_logging\_enabled) | Whether logging is enabled for WAF |
<!-- END_TF_DOCS -->