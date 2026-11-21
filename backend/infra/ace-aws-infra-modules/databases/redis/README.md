<!-- BEGIN_TF_DOCS -->
## Prerequisites
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

## Deployment Information
### Deploy the service using GitHub Actions

See documentation on general steps for Blueprint creation and deployment here: https://chofer.cloud.toyota.com/docs/default/Component/ACE-TECH-DOCS/blueprints/blueprintdeployment/

For more information on the CD Terraform Standalone pipeline, see here: https://chofer.cloud.toyota.com/docs/default/Component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/cd-pipeline-terraform-standalone-gha/

## Blueprint Features
# Redis Blueprint Features

## Core Features
- Single instance and cluster mode support
- Configurable node types and counts
- Automatic failover and Multi-AZ deployment
- At-rest and in-transit encryption

## Security
- KMS encryption integration
- Network security groups
- Custom VPC support

## Monitoring & Operations
- CloudWatch logging
- DataDog integration
- Custom alarm configurations
- Automated backups
- Maintenance window management

## Upgrading


## Notes
## Important Notes

- **⚠️ IMPORTANT:** Redis requires network connectivity from your application. Ensure security groups allow traffic on port 6379.
- **Encryption:** This module enables encryption by default. Do not disable for production workloads.

## Use Cases
# Redis Blueprint Use Cases

This document outlines the common use cases for the Redis Blueprint module.

## Prerequisites

Before connecting to Redis, ensure you have:

1. SSM VPC Connection Blueprint deployed in your environment
2. Required IAM permissions for SSM Session Manager
3. Redis cluster fully deployed and available

## Connecting to Redis using SSM VPC Connection

### Step 1: Deploy SSM VPC Connection Blueprint

First, deploy the [SSM VPC Connection Blueprint](https://chofer.cloud.toyota.com/create/templates/aws-infra-live-module-ssm-vpc-connection?learnMore=https:/github.com/Toyota-Motor-North-America/ace-aws-infra-modules/tree/master/compute/ssm-vpc-connection/README.md) in your environment:

### Step 2: Connect to Redis

You'll need two terminal windows to establish the connection:

#### Terminal 1: Set Up Port Forwarding

In your first terminal, establish port forwarding to your Redis instance using the SSM VPC Connection:

```bash
# For Redis with auth - requires SSM Session Manager access
aws ssm start-session \
  --target i-0123456789abcdef0 \  # Replace with your SSM VPC Connection instance ID
  --document-name "AWS-StartPortForwardingSessionToRemoteHost" \
  --parameters '{"host":["clustercfg.name_prefix-environment-region_cd-rc-bh.jezufk.region_cd.cache.amazonaws.com"],"portNumber":["6379"],"localPortNumber":["6443"]}' \
  --region us-west-2 \
  --profile default
```

**⚠️ IMPORTANT:**
- Keep this terminal window open as long as you need the connection
- Replace the endpoint with your actual Redis endpoint
- The port forwarding (6379 -> 6443) allows secure access to Redis through the SSM VPC Connection
- If you close this terminal, you'll lose the connection

#### Terminal 2: Connect to Redis

In your second terminal, use redis-cli to connect to the port-forwarded Redis instance:

```bash
# Test the connection
nc -vz 127.0.0.1 6443
```

## Observability


## Example Terragrunt Usage
```hcl
# ---------------------------------------------------------------------------------------------------------------------
# TERRAGRUNT CONFIGURATION
# This is the configuration for Terragrunt, a thin wrapper for Terraform that supports locking and enforces best practices: https://github.com/gruntwork-io/terragrunt
# ---------------------------------------------------------------------------------------------------------------------

# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the working directory, into a temporary folder, and execute your Terraform commands in that folder.
terraform {
  source = "git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//databases/elasticache_redis?ref=v31.0.5-beta"
}

# Include all settings from the root terragrunt.hcl file
include { path = find_in_parent_folders() }

# Local variables
# Pull required parameters set in the parameter files of this relative path to be used as values.
locals {
  global_vars      = read_terragrunt_config(find_in_parent_folders("global.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  environment_vars = read_terragrunt_config(find_in_parent_folders("environment.hcl"))
  name_prefix      = local.global_vars.locals.name_prefix
  application_id   = local.global_vars.locals.application_id
  application_name = local.global_vars.locals.application_name
  environment      = local.environment_vars.locals.environment
  aws_region_cd    = local.region_vars.locals.aws_region_cd
}

# ---------------------------------------------------------------------------------------------------------------------
# MODULE PARAMETERS
# These are the variables we have to pass in to use the module specified in the Terragrunt configuration above
# ---------------------------------------------------------------------------------------------------------------------

inputs = {
  # Required
environment         = "sandbox"
application_id      = "ksf00"
application_name    = "fsk"
created_by_email    = "Chofer-Blueprints@toyota.com"
data_classification = "protected"
infra_live_repo     = "aws-infra-live.git"
team                = "chofer"
name                = "redis-cache-new"
instance_type       = "cache.t3.medium"
vpc_id              = "vpc-****************"

# ------------------------------------------------------------------------------
# Cluster Configuration
# ------------------------------------------------------------------------------
# Option 1: Standard replication group (non-cluster mode)
replication_group_size    = 2 # Primary node + 1 replica
enable_automatic_failover = true
enable_multi_az           = true

# Option 2: Cluster mode configuration - setting to null to avoid conflicts
num_node_groups         = null
replicas_per_node_group = null

# ------------------------------------------------------------------------------
# Security Configuration
# ------------------------------------------------------------------------------
enable_at_rest_encryption   = true
enable_single_instance_mode = false
enable_transit_encryption   = true
allow_connections_from_cidr_blocks = []

allow_connections_from_security_groups = []
additional_security_group_ids          = []
sns_topic_for_notifications            = "arn:aws:sns:us-west-2:123456789012:redis-notifications"
default_user_id                        = "default"

# ------------------------------------------------------------------------------
# Redis Configuration
# ------------------------------------------------------------------------------
redis_version            = "7.0"
snapshot_retention_limit = 7
snapshot_window          = "06:00-07:00"
maintenance_window       = "sat:07:00-sat:08:00"
port                     = 6379
apply_immediately        = false
parameter_group_name     = "default.redis7.cluster.on"

security_group_tags = {
  Environment = "sandbox"
  Project     = "redis-cache"
}

# ------------------------------------------------------------------------------
# Optional Configuration
# ------------------------------------------------------------------------------
aws_elasticache_subnet_group_description   = "Subnet group for Redis cache in sandbox environment"
aws_elasticache_security_group_description = "Security group for Redis cache in sandbox environment"

# Snapshot configuration - setting to null to avoid errors
snapshot_name = null
snapshot_arn  = null


# ------------------------------------------------------------------------------
# Auto Scaling Configuration
# ------------------------------------------------------------------------------
enable_auto_scaling                    = false
auto_scale_dimension                   = "elasticache:replication-group:Replicas"
auto_scale_trigger_metric              = "DatabaseMemoryUsageCountedForEvictPercentage"
auto_scale_trigger_metric_target_value = 75
auto_scale_min_capacity                = 1
auto_scale_max_capacity                = 3
kms_multi_region                       = true
enable_alarms                          = true
name_prefix                            = "fsk"
# ------------------------------------------------------------------------------
# CloudWatch Alarm Configuration
# ------------------------------------------------------------------------------

# Custom alarms - only override specific defaults or add new metrics
custom_alarms = {
  # OVERRIDE: Lower the memory threshold to be more conservative (70% instead of 80%)
  memory_utilization_high = {
    alarm_name          = "redis-memory-high-custom"
    metric_name         = "DatabaseMemoryUsagePercentage"
    namespace           = "AWS/ElastiCache"
    comparison_operator = "GreaterThanThreshold"
    threshold           = 70 # Lower threshold than default (80%)
    evaluation_periods  = 2
    period              = 300
    statistic           = "Average"
    alarm_description   = "Redis memory utilization is over 70% - custom threshold"
    dimensions          = { CacheClusterId = "redis-cluster" }
    treat_missing_data  = "missing"
    datapoints_to_alarm = 2
  },

  # NEW: Add monitoring for authentication failures (not in defaults)
  auth_failures = {
    alarm_name          = "redis-auth-failures"
    metric_name         = "AuthenticationFailures"
    namespace           = "AWS/ElastiCache"
    comparison_operator = "GreaterThanThreshold"
    threshold           = 5 # More than 5 auth failures
    evaluation_periods  = 2
    period              = 300
    statistic           = "Sum"
    alarm_description   = "Redis cluster has authentication failures"
    dimensions          = { CacheClusterId = "redis-cluster" }
    treat_missing_data  = "notBreaching"
    datapoints_to_alarm = 2
  },

  # NEW: Monitor total items cached
  cached_items_high = {
    alarm_name          = "redis-cached-items-high"
    metric_name         = "CurrItems"
    namespace           = "AWS/ElastiCache"
    comparison_operator = "GreaterThanThreshold"
    threshold           = 1000000 # 1 million items
    evaluation_periods  = 3
    period              = 300
    statistic           = "Average"
    alarm_description   = "Redis cache has a high number of cached items"
    dimensions          = { CacheClusterId = "redis-cluster" }
    treat_missing_data  = "missing"
    datapoints_to_alarm = 2
  },

  # NEW: Monitor bytes used for cache
  bytes_used_for_cache_high = {
    alarm_name          = "redis-bytes-used-high"
    metric_name         = "BytesUsedForCache"
    namespace           = "AWS/ElastiCache"
    comparison_operator = "GreaterThanThreshold"
    threshold           = 10000000000 # 10GB
    evaluation_periods  = 2
    period              = 300
    statistic           = "Average"
    alarm_description   = "Redis data size is exceeding 10GB"
    dimensions          = { CacheClusterId = "redis-cluster" }
    treat_missing_data  = "missing"
    datapoints_to_alarm = 2
  }
}
log_group_name            = "redis-log"
cloudwatch_force_destroy  = true
service_name              = "redis"
log_retention_period_days = 90
enable_datadog_monitoring = true
}
```

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.5.7 |
| <a name="requirement_archive"></a> [archive](#requirement\_archive) | >= 2.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 4.0.0, < 6.0.0 |
| <a name="requirement_null"></a> [null](#requirement\_null) | >= 3.0.0 |
| <a name="requirement_random"></a> [random](#requirement\_random) | >= 3.1.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_cloudwatch_logs"></a> [cloudwatch\_logs](#module\_cloudwatch\_logs) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/logs | v37.5.6 |
| <a name="module_cw_monitoring"></a> [cw\_monitoring](#module\_cw\_monitoring) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/monitoring | v37.5.6 |
| <a name="module_kms_master_key"></a> [kms\_master\_key](#module\_kms\_master\_key) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key | v37.5.6 |
| <a name="module_naming_helpers"></a> [naming\_helpers](#module\_naming\_helpers) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/naming | v37.5.6 |
| <a name="module_platform_roles"></a> [platform\_roles](#module\_platform\_roles) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles | v37.5.6 |
| <a name="module_redis"></a> [redis](#module\_redis) | git::git@github.com:Toyota-Motor-North-America/chofer-gw-terraform-aws-cache.git//modules/redis | v1.0.1 |
| <a name="module_standard_tags"></a> [standard\_tags](#module\_standard\_tags) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//tagging/tmna-standard-tags | v37.5.6 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_policy.redis_access](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_role.redis_access](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.redis_attach](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_policy_document.redis_access](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.redis_assume_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_subnets.private](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnets) | data source |
| [aws_vpc.vpc](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_additional_security_group_ids"></a> [additional\_security\_group\_ids](#input\_additional\_security\_group\_ids) | A list of additional security group ids to attach | `list(string)` | `[]` | no |
| <a name="input_allow_connections_from_cidr_blocks"></a> [allow\_connections\_from\_cidr\_blocks](#input\_allow\_connections\_from\_cidr\_blocks) | A list of CIDR-formatted IP address ranges that can connect to this ElastiCache cluster. For the standard Gruntwork VPC setup, these should be the CIDR blocks of the private app subnet in this VPC plus the private subnet in the mgmt VPC. | `list(string)` | `[]` | no |
| <a name="input_allow_connections_from_security_groups"></a> [allow\_connections\_from\_security\_groups](#input\_allow\_connections\_from\_security\_groups) | Specifies a list of Security Groups to allow connections from. | `list(string)` | `[]` | no |
| <a name="input_app_team_oidc_arn"></a> [app\_team\_oidc\_arn](#input\_app\_team\_oidc\_arn) | The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline. | `string` | n/a | yes |
| <a name="input_application_id"></a> [application\_id](#input\_application\_id) | Unique identifier for the application | `string` | n/a | yes |
| <a name="input_application_name"></a> [application\_name](#input\_application\_name) | Name of the application | `string` | n/a | yes |
| <a name="input_apply_immediately"></a> [apply\_immediately](#input\_apply\_immediately) | Specifies whether any database modifications are applied immediately, or during the next maintenance window. | `bool` | `false` | no |
| <a name="input_auto_scale_dimension"></a> [auto\_scale\_dimension](#input\_auto\_scale\_dimension) | Scalable dimension of the scalable target. Supported dimensions are: [elasticache:replication-group:NodeGroups,elasticache:replication-group:Replicas]. Documentation can be found in the ScalableDimension parameter at: https://docs.aws.amazon.com/autoscaling/application/APIReference/API_RegisterScalableTarget.html#API_RegisterScalableTarget_RequestParameters. | `string` | `null` | no |
| <a name="input_auto_scale_max_capacity"></a> [auto\_scale\_max\_capacity](#input\_auto\_scale\_max\_capacity) | Max capacity of the scalable target. | `number` | `null` | no |
| <a name="input_auto_scale_min_capacity"></a> [auto\_scale\_min\_capacity](#input\_auto\_scale\_min\_capacity) | Min capacity of the scalable target. | `number` | `null` | no |
| <a name="input_auto_scale_trigger_metric"></a> [auto\_scale\_trigger\_metric](#input\_auto\_scale\_trigger\_metric) | Metric type to trigger auto-scaling. Supported metric type can be found here: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.Redis.html | `string` | `null` | no |
| <a name="input_auto_scale_trigger_metric_target_value"></a> [auto\_scale\_trigger\_metric\_target\_value](#input\_auto\_scale\_trigger\_metric\_target\_value) | Target value of the auto\_scale trigger metric | `number` | `null` | no |
| <a name="input_aws_elasticache_security_group_description"></a> [aws\_elasticache\_security\_group\_description](#input\_aws\_elasticache\_security\_group\_description) | The description of the aws\_elasticache\_security\_group that is created. Defaults to 'Security group for the var.name ElastiCache cluster' if not specified. | `string` | `null` | no |
| <a name="input_aws_elasticache_subnet_group_description"></a> [aws\_elasticache\_subnet\_group\_description](#input\_aws\_elasticache\_subnet\_group\_description) | Subnet group for the var.name ElastiCache cluster. | `string` | `null` | no |
| <a name="input_cloudwatch_force_destroy"></a> [cloudwatch\_force\_destroy](#input\_cloudwatch\_force\_destroy) | Controls whether the cloudwatch log group, along with its corresponding, logs gets destroyed upon a `terraform destroy`. If set to false then the group will simply be removed from the terraform state. This can only be set to true in non-prod environments. | `bool` | `false` | no |
| <a name="input_created_by_email"></a> [created\_by\_email](#input\_created\_by\_email) | Email of the person who created the resource | `string` | n/a | yes |
| <a name="input_custom_alarms"></a> [custom\_alarms](#input\_custom\_alarms) | Map of custom CloudWatch alarms to create for the ElastiCache Redis instance. Each alarm should follow the structure required by the monitoring module. | <pre>map(object({<br/>    alarm_name          = string<br/>    metric_name         = string<br/>    namespace           = string<br/>    comparison_operator = string<br/>    threshold           = number<br/>    evaluation_periods  = number<br/>    period              = number<br/>    statistic           = string<br/>    alarm_description   = string<br/>    dimensions          = map(string)<br/>    treat_missing_data  = string<br/>    datapoints_to_alarm = number<br/>  }))</pre> | `{}` | no |
| <a name="input_custom_tags"></a> [custom\_tags](#input\_custom\_tags) | Custom tags to be applied to DynamoDB | `map(string)` | `{}` | no |
| <a name="input_customer_kms_key_id"></a> [customer\_kms\_key\_id](#input\_customer\_kms\_key\_id) | ARN of the customer-provided KMS key for Redis data encryption at rest. If not provided, the module will create a dedicated KMS key for Redis data encryption. | `string` | `null` | no |
| <a name="input_cw_existing_key_arn"></a> [cw\_existing\_key\_arn](#input\_cw\_existing\_key\_arn) | ARN of an existing KMS key used SPECIFICALLY for encrypting CloudWatch logs. If not provided, the module will create a separate KMS key for log encryption. | `string` | `null` | no |
| <a name="input_data_classification"></a> [data\_classification](#input\_data\_classification) | Data classification level | `string` | `"no_classification"` | no |
| <a name="input_default_user_id"></a> [default\_user\_id](#input\_default\_user\_id) | The name of the new 'default' user\_id, in the event is different from 'default'. | `string` | `"default"` | no |
| <a name="input_enable_alarms"></a> [enable\_alarms](#input\_enable\_alarms) | Enable CloudWatch alarms for Redis | `bool` | `false` | no |
| <a name="input_enable_at_rest_encryption"></a> [enable\_at\_rest\_encryption](#input\_enable\_at\_rest\_encryption) | Whether to enable encryption at rest. | `bool` | `true` | no |
| <a name="input_enable_auto_scaling"></a> [enable\_auto\_scaling](#input\_enable\_auto\_scaling) | Whether to enable auto-scaling or not. Please refer to the prerequisite section to understand the supported Redis configuration: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/AutoScaling.html | `bool` | `false` | no |
| <a name="input_enable_automatic_failover"></a> [enable\_automatic\_failover](#input\_enable\_automatic\_failover) | Specifies whether a read-only replica is automatically promoted to read/write primary if the existing primary fails. It must be enabled for Redis (cluster mode enabled) replication groups. This is required if enable\_single\_instance\_mode is set to false. | `bool` | `null` | no |
| <a name="input_enable_datadog_monitoring"></a> [enable\_datadog\_monitoring](#input\_enable\_datadog\_monitoring) | Enable CloudWatch logs to deliver to DataDog | `bool` | `false` | no |
| <a name="input_enable_multi_az"></a> [enable\_multi\_az](#input\_enable\_multi\_az) | Indicates whether Multi-AZ is enabled. When Multi-AZ is enabled, a read-only replica is automatically promoted to a read-write primary cluster if the existing primary cluster fails. If you specify true, you must specify a value greater than 1 for replication\_group\_size. This is required if enable\_single\_instance\_mode is set to false | `bool` | `null` | no |
| <a name="input_enable_single_instance_mode"></a> [enable\_single\_instance\_mode](#input\_enable\_single\_instance\_mode) | Whether to enable single-node Redis instance. | `bool` | `false` | no |
| <a name="input_enable_transit_encryption"></a> [enable\_transit\_encryption](#input\_enable\_transit\_encryption) | Whether to enable encryption in transit. | `bool` | `true` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment in which the EKS cluster is being deployed | `string` | n/a | yes |
| <a name="input_existing_cloudwatch_log_group"></a> [existing\_cloudwatch\_log\_group](#input\_existing\_cloudwatch\_log\_group) | Existing CloudWatch Log Group to send the container's logs to. Only supply if you have an existing group with this name. Otherwise, a new group will be created. If using an existing CloudWatch Group, you must provide cw\_existing\_key\_arn. | `string` | `null` | no |
| <a name="input_infra_live_repo"></a> [infra\_live\_repo](#input\_infra\_live\_repo) | The name of the infrastructure live repository | `string` | n/a | yes |
| <a name="input_instance_type"></a> [instance\_type](#input\_instance\_type) | The compute and memory capacity of the nodes (e.g. cache.t3.medium). For a list of node types and specifications, see https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/CacheNodes.SupportedTypes.html | `string` | n/a | yes |
| <a name="input_kms_multi_region"></a> [kms\_multi\_region](#input\_kms\_multi\_region) | Whether the default KMS master key created by this module should be multi-region or not. This setting is to support global database configurations. | `bool` | `false` | no |
| <a name="input_log_group_name"></a> [log\_group\_name](#input\_log\_group\_name) | Name of log group to create. | `string` | `"redis-log"` | no |
| <a name="input_log_retention_period_days"></a> [log\_retention\_period\_days](#input\_log\_retention\_period\_days) | How long in days the Cloudwatch logs are stored before being deleted. | `number` | `30` | no |
| <a name="input_maintenance_window"></a> [maintenance\_window](#input\_maintenance\_window) | Specifies the weekly time range for when maintenance on the cache cluster is performed (e.g. sun:05:00-sun:09:00). The format is ddd:hh24:mi-ddd:hh24:mi (24H Clock UTC). The minimum maintenance window is a 60 minute period. | `string` | `"sat:07:00-sat:08:00"` | no |
| <a name="input_name"></a> [name](#input\_name) | The name used to namespace all resources created by these templates, including the ElastiCache cluster itself (e.g. rediscache). Must be unique in this region. Must be a lowercase string. | `string` | n/a | yes |
| <a name="input_name_prefix"></a> [name\_prefix](#input\_name\_prefix) | Prefix to be used in naming resources | `string` | n/a | yes |
| <a name="input_num_node_groups"></a> [num\_node\_groups](#input\_num\_node\_groups) | Number of node groups (shards) for this Redis replication group. Changing this number will trigger a resizing operation before other settings modifications. | `number` | `null` | no |
| <a name="input_parameter_group_name"></a> [parameter\_group\_name](#input\_parameter\_group\_name) | Name of the parameter group to associate with this Redis cluster.<br/>If not set, the module will assign a default based on cluster mode:<br/>  - Single node:        default.redis7<br/>  - Cluster mode off:   default.redis7.cluster.off<br/>  - Cluster mode on:    default.redis7.cluster.on<br/>Override only if you're using a custom parameter group. | `string` | `null` | no |
| <a name="input_port"></a> [port](#input\_port) | The port number on which each of the cache nodes will accept connections (e.g. 6379). | `number` | `6379` | no |
| <a name="input_redis_version"></a> [redis\_version](#input\_redis\_version) | Version number of redis to use. For a list of versions, see: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/supported-engine-versions.html | `string` | `"7.0"` | no |
| <a name="input_replicas_per_node_group"></a> [replicas\_per\_node\_group](#input\_replicas\_per\_node\_group) | Number of replica nodes in each node group. Changing this number will trigger a resizing operation before other settings modifications. Valid values are 0 to 5. | `number` | `null` | no |
| <a name="input_replication_group_size"></a> [replication\_group\_size](#input\_replication\_group\_size) | The total number of nodes in the Redis Replication Group. E.g. 1 represents just the primary node, 2 represents the primary plus a single Read Replica. This is required if enable\_single\_instance\_mode is set to false | `number` | `null` | no |
| <a name="input_resource_slug"></a> [resource\_slug](#input\_resource\_slug) | An identifier to uniquely name this resource. This is often the service name, or a unique identifier. | `string` | `"redis"` | no |
| <a name="input_security_group_tags"></a> [security\_group\_tags](#input\_security\_group\_tags) | A set of tags to set for the Security Group created as part of this module. | `map(string)` | `{}` | no |
| <a name="input_service_name"></a> [service\_name](#input\_service\_name) | Name of the service. | `string` | n/a | yes |
| <a name="input_snapshot_arn"></a> [snapshot\_arn](#input\_snapshot\_arn) | The Amazon Resource Name (ARN) of a Redis RDB snapshot file stored in Amazon S3. You can use this parameter to restore from an externally created snapshot. If you have an ElastiCache snapshot, use snapshot\_name. | `string` | `null` | no |
| <a name="input_snapshot_name"></a> [snapshot\_name](#input\_snapshot\_name) | The name of a snapshot from which to restore the Redis cluster. You can use this to restore from an ElastiCache snapshot. If you have an externally created snapshot, use snapshot\_arn. | `string` | `null` | no |
| <a name="input_snapshot_retention_limit"></a> [snapshot\_retention\_limit](#input\_snapshot\_retention\_limit) | The number of days for which ElastiCache will retain automatic cache cluster snapshots before deleting them. The maximum retention period is 35 days. Set to 0 to disable snapshots. | `number` | `7` | no |
| <a name="input_snapshot_window"></a> [snapshot\_window](#input\_snapshot\_window) | The daily time range during which automated backups are created (e.g. 04:00-09:00). Time zone is UTC. Performance may be degraded while a backup runs. Set to empty string to disable snapshots. | `string` | `"06:00-07:00"` | no |
| <a name="input_sns_topic_for_notifications"></a> [sns\_topic\_for\_notifications](#input\_sns\_topic\_for\_notifications) | The ARN of the SNS Topic to which notifications will be sent when a Replication Group event happens, such as an automatic failover (e.g. arn:aws:sns:*:123456789012:my\_sns\_topic). An empty string is a valid value if you do not wish to receive notifications via SNS. This is required if enable\_single\_instance\_mode is set to false | `string` | `null` | no |
| <a name="input_subnet_ids"></a> [subnet\_ids](#input\_subnet\_ids) | List of private subnet IDs where the redis will be deployed. If empty, the module will automatically select private subnets from the VPC based on the 'Attributes' and 'Type' tags. These subnets must be in the same VPC as specified by vpc\_id. | `list(string)` | `[]` | no |
| <a name="input_team"></a> [team](#input\_team) | Name of the team responsible for the EKS cluster | `string` | n/a | yes |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | The id of the VPC in which the ElastiCache cluster should be deployed. | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_cloudwatch_log_group_name"></a> [cloudwatch\_log\_group\_name](#output\_cloudwatch\_log\_group\_name) | The name of the CloudWatch Log Group for Redis logs. |
| <a name="output_kms_key_arn"></a> [kms\_key\_arn](#output\_kms\_key\_arn) | The ARN of the KMS key used for Redis encryption |
| <a name="output_multi_az_enabled"></a> [multi\_az\_enabled](#output\_multi\_az\_enabled) | Whether Multi-AZ deployment is enabled for the Redis cluster. |
| <a name="output_redis_configuration_endpoint"></a> [redis\_configuration\_endpoint](#output\_redis\_configuration\_endpoint) | The configuration endpoint of the Redis cluster (used for cluster mode). |
| <a name="output_redis_iam_policy_arn"></a> [redis\_iam\_policy\_arn](#output\_redis\_iam\_policy\_arn) | The ARN of the IAM policy attached to the role |
| <a name="output_redis_iam_role_arn"></a> [redis\_iam\_role\_arn](#output\_redis\_iam\_role\_arn) | The ARN of the IAM role for Redis |
| <a name="output_redis_parameter_group_name"></a> [redis\_parameter\_group\_name](#output\_redis\_parameter\_group\_name) | The parameter group used by the Redis cluster. |
| <a name="output_redis_port"></a> [redis\_port](#output\_redis\_port) | The port on which the Redis cluster accepts connections. |
| <a name="output_redis_primary_endpoint"></a> [redis\_primary\_endpoint](#output\_redis\_primary\_endpoint) | The primary endpoint of the Redis cluster |
| <a name="output_redis_reader_endpoint"></a> [redis\_reader\_endpoint](#output\_redis\_reader\_endpoint) | The reader endpoint of the Redis cluster (for read replicas) |
| <a name="output_redis_security_group_id"></a> [redis\_security\_group\_id](#output\_redis\_security\_group\_id) | The ID of the security group for the Redis cluster |
| <a name="output_redis_version"></a> [redis\_version](#output\_redis\_version) | The version of Redis used. |
<!-- END_TF_DOCS -->