# Standalone ALB module for testing ECS Blueprint integration with existing load balancers
# Creates a minimal ALB configuration that can be referenced by main ECS Blueprint tests

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0.0, < 7.0.0"
    }
  }
  required_version = ">= 1.5.7"
}

# Required variables for ALB module
variable "application_id" {
  type        = string
  description = "Application ID"
}

variable "application_name" {
  type        = string
  description = "Application name"
}

variable "created_by_email" {
  type        = string
  description = "Email of the creator"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "name" {
  type        = string
  description = "ALB name"
}

variable "name_prefix" {
  type        = string
  description = "Prefix for resource names"
}

variable "lb_subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for the load balancer"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "custom_tags" {
  type        = map(string)
  description = "Custom tags"
  default     = {}
}

# Optional variables that may be passed from tests
# tflint-ignore: terraform_unused_declarations
variable "vpc" {
  type        = string
  description = "VPC ID (alternative name) - kept for module compatibility"
  default     = ""
}

variable "app_team_oidc_arn" {
  type        = string
  description = "OIDC ARN"
  default     = ""
}

variable "data_classification" {
  type        = string
  description = "Data classification"
  default     = "no_classification"
  validation {
    condition     = contains(["public", "protected", "confidential", "legal", "highly_confidential", "no_classification"], var.data_classification)
    error_message = "data_classification must be either 'public', 'protected', 'confidential', 'legal', 'highly_confidential', 'no_classification'."
  }
}

variable "infra_live_repo" {
  type        = string
  description = "Infrastructure repository"
  default     = "ace-aws-infra-modules"
}

module "alb" {
  source = "git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/alb?ref=v40.1.5"

  alb_name               = var.name
  application_id         = var.application_id
  application_name       = var.application_name
  created_by_email       = var.created_by_email
  environment            = var.environment
  s3_force_destroy       = true
  vpc_id                 = var.vpc_id
  name_prefix            = var.name_prefix
  custom_tags            = var.custom_tags
  alb_subnets            = var.lb_subnet_ids
  app_team_oidc_arn      = var.app_team_oidc_arn
  data_classification    = var.data_classification
  infra_live_repo        = var.infra_live_repo
  is_alb_public          = true
  enable_shield_advanced = false
}

output "arn" {
  description = "ALB ARN"
  value       = module.alb.alb_arn
}

output "alb_name" {
  description = "ALB name"
  value       = module.alb.alb_name
}
