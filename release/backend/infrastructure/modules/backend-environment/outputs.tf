output "rds_endpoint"{value=module.rds.endpoint}
output "redis_endpoint"{value=module.redis.primary_endpoint}
output "secret_arn"{value=module.secret.secret_arn}
output "target_group_arn"{value=module.target_group.target_group_arn}
output "application_bucket_name"{value=module.application_s3.bucket_name}
output "migration_task_definition_arn"{value=module.migration.task_definition_arn}
