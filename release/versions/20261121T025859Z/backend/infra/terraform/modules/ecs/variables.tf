
variable "env" { type = string }
variable "env_group" { type = string }
variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "service_sg_id" { type = string }
variable "ecr_repo" { type = string }
variable "image_tag" { type = string }
variable "web_cpu" { type = string }
variable "web_memory" { type = string }
variable "worker_cpu" { type = string }
variable "worker_memory" { type = string }
variable "log_retention_days" { type = number }
variable "shared_sqs_arn" { type = string }
variable "shared_sns_arn" { type = string }
variable "alb_listener_arn" { type = string }
variable "path_prefix" { type = string }
variable "standard_tags" { type = map(string) }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "db_secret_arn" {
  type        = string
  description = "The ARN of the database secrets in Secrets Manager"
  default     = ""
}
variable "ecs_sg_id" {
  type        = string
  description = "The Security Group ID for the ECS service"
}
