# ------------------------------------------------------------------------------
# MODULE PARAMETERS
# These variables are expected to be passed in by the operator when calling this
# terraform module.
# ------------------------------------------------------------------------------
variable "app_team_oidc_arn" {
  description = "The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline."
  type        = string
}

variable "application_id" {
  type        = string
  description = "Unique identifier for the application"
}

variable "application_name" {
  type        = string
  description = "Name of the application"
}

variable "created_by_email" {
  type        = string
  description = "Email of the person who created the resource"
}

variable "custom_tags" {
  type        = map(string)
  description = "Custom tags to be applied to DynamoDB"
  default     = {}
}

variable "infra_live_repo" {
  type        = string
  description = "The name of the infrastructure live repository"
}

variable "data_classification" {
  type        = string
  description = "Data classification level"
  validation {
    condition     = contains(["public", "protected", "confidential", "legal", "highly_confidential", "no_classification"], var.data_classification)
    error_message = "data_classification must be either 'public', 'protected', 'confidential', 'legal', 'highly_confidential', 'no_classification'."
  }
  default = "no_classification"
}

variable "environment" {
  type        = string
  description = "Environment in which the EKS cluster is being deployed"
}

variable "team" {
  type        = string
  description = "Name of the team responsible for the EKS cluster"
}

variable "name" {
  description = "The name used to namespace all resources created by these templates, including the ElastiCache cluster itself (e.g. rediscache). Must be unique in this region. Must be a lowercase string."
  type        = string
}

variable "name_prefix" {
  type        = string
  description = "Prefix to be used in naming resources"
}

# For a list of node types, see https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheNodes.SupportedTypes.html
# Consider referring https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/nodes-select-size.html, which outlines how to choose your node size.
# - Note that snapshotting functionality is not compatible with t2 instance types.
# - Note that automatic failover (Multi-AZ) is not supported for T1 and T2 instance node types.
variable "instance_type" {
  description = "The compute and memory capacity of the nodes (e.g. cache.t3.medium). For a list of node types and specifications, see https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/CacheNodes.SupportedTypes.html"
  type        = string
}

variable "subnet_ids" {
  default     = []
  description = "List of private subnet IDs where the redis will be deployed. If empty, the module will automatically select private subnets from the VPC based on the 'Attributes' and 'Type' tags. These subnets must be in the same VPC as specified by vpc_id."
  type        = list(string)
}

variable "vpc_id" {
  description = "The id of the VPC in which the ElastiCache cluster should be deployed."
  type        = string
}

variable "replication_group_size" {
  description = "The total number of nodes in the Redis Replication Group. E.g. 1 represents just the primary node, 2 represents the primary plus a single Read Replica. This is required if enable_single_instance_mode is set to false"
  type        = number
  default     = null
}

variable "enable_automatic_failover" {
  description = "Specifies whether a read-only replica is automatically promoted to read/write primary if the existing primary fails. It must be enabled for Redis (cluster mode enabled) replication groups. This is required if enable_single_instance_mode is set to false."
  type        = bool
  default     = null
}

variable "enable_multi_az" {
  description = "Indicates whether Multi-AZ is enabled. When Multi-AZ is enabled, a read-only replica is automatically promoted to a read-write primary cluster if the existing primary cluster fails. If you specify true, you must specify a value greater than 1 for replication_group_size. This is required if enable_single_instance_mode is set to false"
  type        = bool
  default     = null
}

variable "num_node_groups" {
  description = "Number of node groups (shards) for this Redis replication group. Changing this number will trigger a resizing operation before other settings modifications."
  type        = number
  default     = null
}

variable "replicas_per_node_group" {
  description = " Number of replica nodes in each node group. Changing this number will trigger a resizing operation before other settings modifications. Valid values are 0 to 5."
  type        = number
  default     = null
}

variable "enable_at_rest_encryption" {
  description = "Whether to enable encryption at rest."
  type        = bool
  default     = true
}

variable "enable_single_instance_mode" {
  description = "Whether to enable single-node Redis instance."
  type        = bool
  default     = false
}

variable "enable_transit_encryption" {
  description = "Whether to enable encryption in transit."
  type        = bool
  default     = true
}

variable "allow_connections_from_cidr_blocks" {
  description = "A list of CIDR-formatted IP address ranges that can connect to this ElastiCache cluster. For the standard Gruntwork VPC setup, these should be the CIDR blocks of the private app subnet in this VPC plus the private subnet in the mgmt VPC."
  type        = list(string)
  default     = []
}

variable "allow_connections_from_security_groups" {
  description = "Specifies a list of Security Groups to allow connections from."
  type        = list(string)
  default     = []
}

variable "additional_security_group_ids" {
  description = "A list of additional security group ids to attach"
  type        = list(string)
  default     = []
}

variable "sns_topic_for_notifications" {
  description = "The ARN of the SNS Topic to which notifications will be sent when a Replication Group event happens, such as an automatic failover (e.g. arn:aws:sns:*:123456789012:my_sns_topic). An empty string is a valid value if you do not wish to receive notifications via SNS. This is required if enable_single_instance_mode is set to false"
  type        = string
  default     = null
}

# ------------------------------------------------------------------------------
# DEFINE CONSTANTS
# Generally, these values won't need to be changed.
# ------------------------------------------------------------------------------

variable "redis_version" {
  description = "Version number of redis to use. For a list of versions, see: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/supported-engine-versions.html"
  type        = string
  default     = "7.0"
}

variable "snapshot_retention_limit" {
  description = "The number of days for which ElastiCache will retain automatic cache cluster snapshots before deleting them. The maximum retention period is 35 days. Set to 0 to disable snapshots."
  type        = number
  default     = 7
}

# By default, run backups from 2-3am EST, which is 6-7am UTC
variable "snapshot_window" {
  description = "The daily time range during which automated backups are created (e.g. 04:00-09:00). Time zone is UTC. Performance may be degraded while a backup runs. Set to empty string to disable snapshots."
  type        = string
  default     = "06:00-07:00"
}

# By default, do maintenance from 3-4am EST on Saturday, which is 7-8am UTC.
variable "maintenance_window" {
  description = "Specifies the weekly time range for when maintenance on the cache cluster is performed (e.g. sun:05:00-sun:09:00). The format is ddd:hh24:mi-ddd:hh24:mi (24H Clock UTC). The minimum maintenance window is a 60 minute period."
  type        = string
  default     = "sat:07:00-sat:08:00"
}

variable "port" {
  description = "The port number on which each of the cache nodes will accept connections (e.g. 6379)."
  type        = number
  default     = 6379
}

variable "apply_immediately" {
  description = "Specifies whether any database modifications are applied immediately, or during the next maintenance window."
  type        = bool
  default     = false
}

variable "parameter_group_name" {
  description = <<EOT
Name of the parameter group to associate with this Redis cluster.
If not set, the module will assign a default based on cluster mode:
  - Single node:        default.redis7
  - Cluster mode off:   default.redis7.cluster.off
  - Cluster mode on:    default.redis7.cluster.on
Override only if you're using a custom parameter group.
EOT
  type        = string
  default     = null
}

variable "security_group_tags" {
  description = "A set of tags to set for the Security Group created as part of this module."
  type        = map(string)
  default     = {}
}

# ----------------------------------------------------------------------------------------------------------------------
# OPTIONAL PARAMETERS
# These variables may be optionally passed in by the templates using this module to overwite the defaults.
# ----------------------------------------------------------------------------------------------------------------------
variable "aws_elasticache_subnet_group_description" {
  description = "Subnet group for the var.name ElastiCache cluster."
  type        = string
  default     = null
}

variable "aws_elasticache_security_group_description" {
  description = "The description of the aws_elasticache_security_group that is created. Defaults to 'Security group for the var.name ElastiCache cluster' if not specified."
  type        = string
  default     = null
}

variable "snapshot_name" {
  description = "The name of a snapshot from which to restore the Redis cluster. You can use this to restore from an ElastiCache snapshot. If you have an externally created snapshot, use snapshot_arn."
  type        = string
  default     = null
}

variable "snapshot_arn" {
  description = "The Amazon Resource Name (ARN) of a Redis RDB snapshot file stored in Amazon S3. You can use this parameter to restore from an externally created snapshot. If you have an ElastiCache snapshot, use snapshot_name."
  type        = string
  default     = null
}

variable "default_user_id" {
  description = "The name of the new 'default' user_id, in the event is different from 'default'."
  type        = string
  default     = "default"
}

variable "enable_auto_scaling" {
  description = "Whether to enable auto-scaling or not. Please refer to the prerequisite section to understand the supported Redis configuration: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/AutoScaling.html"
  type        = bool
  default     = false
}

variable "auto_scale_dimension" {
  description = "Scalable dimension of the scalable target. Supported dimensions are: [elasticache:replication-group:NodeGroups,elasticache:replication-group:Replicas]. Documentation can be found in the ScalableDimension parameter at: https://docs.aws.amazon.com/autoscaling/application/APIReference/API_RegisterScalableTarget.html#API_RegisterScalableTarget_RequestParameters."
  type        = string
  default     = null
}

variable "auto_scale_trigger_metric" {
  description = "Metric type to trigger auto-scaling. Supported metric type can be found here: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.Redis.html"
  type        = string
  default     = null
}

variable "auto_scale_trigger_metric_target_value" {
  description = "Target value of the auto_scale trigger metric"
  type        = number
  default     = null
}

variable "auto_scale_min_capacity" {
  type        = number
  description = "Min capacity of the scalable target."
  default     = null
}

variable "auto_scale_max_capacity" {
  type        = number
  description = "Max capacity of the scalable target."
  default     = null
}

variable "kms_multi_region" {
  description = "Whether the default KMS master key created by this module should be multi-region or not. This setting is to support global database configurations."
  type        = bool
  default     = false
}

# Monitoring Variables
variable "enable_alarms" {
  description = "Enable CloudWatch alarms for Redis"
  type        = bool
  default     = false
}

variable "custom_alarms" {
  description = "Map of custom CloudWatch alarms to create for the ElastiCache Redis instance. Each alarm should follow the structure required by the monitoring module."
  type = map(object({
    alarm_name          = string
    metric_name         = string
    namespace           = string
    comparison_operator = string
    threshold           = number
    evaluation_periods  = number
    period              = number
    statistic           = string
    alarm_description   = string
    dimensions          = map(string)
    treat_missing_data  = string
    datapoints_to_alarm = number
  }))
  default = {}
}

variable "log_group_name" {
  description = "Name of log group to create."
  type        = string
  default     = "redis-log"
}

variable "existing_cloudwatch_log_group" {
  type        = string
  description = "Existing CloudWatch Log Group to send the container's logs to. Only supply if you have an existing group with this name. Otherwise, a new group will be created. If using an existing CloudWatch Group, you must provide cw_existing_key_arn."
  default     = null
  validation {
    condition     = var.existing_cloudwatch_log_group == null || can(regex("^[0-9A-Za-z-]{1,128}$", var.existing_cloudwatch_log_group))
    error_message = "Argument 'existing_cloudwatch_log_group' must contain alphanumeric characters, hyphens and can be empty. Length of value have to be lower than 128 symbols. If default - service_name will apply. "
  }
}

variable "cw_existing_key_arn" {
  type        = string
  default     = null
  description = "ARN of an existing KMS key used SPECIFICALLY for encrypting CloudWatch logs. If not provided, the module will create a separate KMS key for log encryption."
}

variable "service_name" {
  description = "Name of the service."
  type        = string
  validation {
    condition     = var.service_name != null && can(regex("^[0-9A-Za-z-]{1,128}$", var.service_name))
    error_message = "Argument 'service_name' must contain alphanumeric characters, hyphens and can't be empty. Length of value have to be lower than 128 symbols."
  }
}

variable "cloudwatch_force_destroy" {
  type        = bool
  default     = false
  description = "Controls whether the cloudwatch log group, along with its corresponding, logs gets destroyed upon a `terraform destroy`. If set to false then the group will simply be removed from the terraform state. This can only be set to true in non-prod environments."
}

variable "log_retention_period_days" {
  description = "How long in days the Cloudwatch logs are stored before being deleted."
  default     = 30
  type        = number
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_period_days)
    error_message = "Argument 'log_retention_period_days' must be either 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653."
  }
}

variable "enable_datadog_monitoring" {
  type        = bool
  description = "Enable CloudWatch logs to deliver to DataDog"
  default     = false
}

variable "customer_kms_key_id" {
  description = "ARN of the customer-provided KMS key for Redis data encryption at rest. If not provided, the module will create a dedicated KMS key for Redis data encryption."
  type        = string
  default     = null
}

variable "resource_slug" {
  description = "An identifier to uniquely name this resource. This is often the service name, or a unique identifier."
  type        = string
  default     = "redis"
}