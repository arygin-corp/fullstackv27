variable "name_prefix" {
  type = string
}
variable "application_id" {
  type = string
}
variable "application_name" {
  type = string
}
variable "aws_account_id" {
  type = string
}
variable "account_type" {
  type = string
}
variable "aws_region" {
  type = string
}
variable "aws_region_cd" {
  type = string
}
variable "environment" {
  type = string
}
variable "vpc_id" {
  type = string
}

variable "route53_zone_name" {
  type    = string
  default = ""
}
variable "angular_domain" {
  type    = string
  default = ""
}
variable "admin_domain" {
  type    = string
  default = ""
}
variable "frontend_bucket" {
  type    = string
  default = ""
}
variable "admin_bucket" {
  type    = string
  default = ""
}
variable "zone_id" {
  type    = string
  default = ""
}
variable "private_subnet_ids" {
  type    = list(string)
  default = []
}
variable "cluster_name" {
  type    = string
  default = ""
}
variable "repository_name" {
  type    = string
  default = ""
}
variable "load_balancer_name" {
  type    = string
  default = ""
}
variable "app_security_group_name" {
  type    = string
  default = ""
}
variable "secret_name" {
  type    = string
  default = ""
}
variable "execution_role_name" {
  type    = string
  default = ""
}
variable "task_role_name" {
  type    = string
  default = ""
}
variable "db_identifier" {
  type    = string
  default = ""
}
variable "db_name" {
  type    = string
  default = ""
}
variable "redis_replication_group_id" {
  type    = string
  default = ""
}
variable "settings_module" {
  type    = string
  default = ""
}
variable "app_env" {
  type    = string
  default = ""
}
variable "redis_database" {
  type    = number
  default = 0
}
variable "listener_priority" {
  type    = number
  default = 1
}
