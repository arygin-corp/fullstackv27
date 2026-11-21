output "redis_configuration_endpoint" {
  description = "The configuration endpoint of the Redis cluster (used for cluster mode)."
  value       = var.enable_single_instance_mode ? null : module.redis.configuration_endpoint
}

output "redis_primary_endpoint" {
  description = "The primary endpoint of the Redis cluster"
  value       = module.redis.primary_endpoint
}

output "redis_reader_endpoint" {
  description = "The reader endpoint of the Redis cluster (for read replicas)"
  value       = module.redis.reader_endpoint
}

output "redis_port" {
  description = "The port on which the Redis cluster accepts connections."
  value       = var.port
}

output "redis_security_group_id" {
  description = "The ID of the security group for the Redis cluster"
  value       = module.redis.security_group_id
}

output "redis_iam_role_arn" {
  description = "The ARN of the IAM role for Redis"
  value       = aws_iam_role.redis_access.arn
}

output "redis_iam_policy_arn" {
  description = "The ARN of the IAM policy attached to the role"
  value       = aws_iam_policy.redis_access.arn
}

output "kms_key_arn" {
  description = "The ARN of the KMS key used for Redis encryption"
  value       = var.customer_kms_key_id != null ? var.customer_kms_key_id : module.kms_master_key[0].key_arns[module.naming_helpers["kms_key"].names[64]]
}

output "cloudwatch_log_group_name" {
  description = "The name of the CloudWatch Log Group for Redis logs."
  value       = var.existing_cloudwatch_log_group == null ? module.cloudwatch_logs[0].log_group_name : var.existing_cloudwatch_log_group
}

output "redis_version" {
  description = "The version of Redis used."
  value       = var.redis_version
}

output "redis_parameter_group_name" {
  description = "The parameter group used by the Redis cluster."
  value       = var.parameter_group_name
}

output "multi_az_enabled" {
  description = "Whether Multi-AZ deployment is enabled for the Redis cluster."
  value       = var.enable_multi_az
}