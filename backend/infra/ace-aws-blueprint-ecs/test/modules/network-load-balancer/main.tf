# Standalone NLB module for testing ECS Blueprint integration with existing load balancers
# Creates a minimal NLB configuration that can be referenced by main ECS Blueprint tests

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0.0, < 7.0.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0.0"
    }
  }
  required_version = ">= 1.5.7"
}

# Required variables for NLB module
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
  description = "NLB name"
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

# Random suffix for unique resource naming
resource "random_string" "suffix" {
  length  = 8
  numeric = true
  special = false
  upper   = false
}

# Dummy target group required by NLB module
resource "aws_lb_target_group" "test" {
  name        = "test-tg-${var.name}-${random_string.suffix.result}"
  port        = 8080
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  tags = merge(var.custom_tags, {
    Name = "test-target-group-${var.name}"
  })
}

module "nlb" {
  source = "git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/nlb?ref=v40.1.5"

  application_id             = var.application_id
  application_name           = var.application_name
  created_by_email           = var.created_by_email
  enable_deletion_protection = false
  enable_record              = false
  environment                = var.environment
  force_destroy              = true
  name_prefix                = var.name_prefix
  service_name               = "nlb-${var.name}"
  target_group_arn           = aws_lb_target_group.test.arn
  vpc_id                     = var.vpc_id
  custom_tags                = var.custom_tags
  app_team_oidc_arn          = var.app_team_oidc_arn
  data_classification        = var.data_classification
  infra_live_repo            = var.infra_live_repo
  lb_subnet_ids              = var.lb_subnet_ids
  is_lb_public               = true
  enable_shield_advanced     = false
  record_names               = ["test"]
}

# Lookup NLB details for name output
data "aws_lb" "nlb" {
  arn = module.nlb.nlb_arn
}

output "arn" {
  description = "NLB ARN for existing load balancer scenarios"
  value       = module.nlb.nlb_arn
}

# NLB name output for existing load balancer integration tests
output "nlb_name" {
  description = "NLB name for existing load balancer scenarios"
  value       = data.aws_lb.nlb.name
}