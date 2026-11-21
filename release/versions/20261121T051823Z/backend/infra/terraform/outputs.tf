output "alb_dns_name" {
  description = "Application load balancer DNS name"
  value       = local.alb_dns_name
}

output "admin_host" {
  value = local.selected.domain
}

output "ecr_repository_url" {
  value = local.ecr_url
}

output "ecs_cluster_arn" {
  value = local.cluster_arn
}

output "rds_endpoint" {
  value = local.db_host
}

output "database_name" {
  value = local.platform.db_name
}

output "redis_endpoint" {
  value = local.redis_host
}

output "application_bucket" {
  value = local.app_bucket_name
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.id
}

output "migration_task_definition_arn" {
  value = aws_ecs_task_definition.migration.arn
}
