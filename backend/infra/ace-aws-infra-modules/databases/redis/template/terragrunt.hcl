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