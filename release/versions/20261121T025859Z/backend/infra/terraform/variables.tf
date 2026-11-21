#############################################
# variables.tf
# Variable declarations for the GDX Platform
#############################################
variable "target_env" {
  type        = string
  description = "One of: demo | dev | qa | stage | prod"
}
variable "account_id" { type = string }
variable "nonprod_account_id" { type = string }
variable "prod_account_id" { type = string }
variable "aws_region" {
  type        = string
  description = "The region for deployment (e.g., us-west-2 for nonprod, us-east-1 for prod)"
}

#############################################
# Network & Infrastructure
#############################################
variable "vpc_id" { type = string }
variable "private_subnet_ids" {
  type        = list(string)
  description = "Subnets for Django App and RDS (no direct internet access)"
}
variable "public_subnet_ids" {
  type        = list(string)
  description = "Subnets for the New ALB (internet-facing)"
}
variable "service_sg_id" {
  type        = string
  description = "Subnets for the New ALB (internet-facing)"
}

#############################################
# Load Balancer Configuration
#############################################
# variable "alb_listener_arn" { 
#   type = string 
#   default = "" 
#   description = "If provided, uses an existing listener. If empty, the module creates a new one." 
# }

variable "alb_certificate_arn" {
  type        = string
  description = "The ARN of the ACM certificate for the internal ALB"
}

#############################################
# Shared Enterprise Resources (SQS/SNS)
#############################################
variable "nonprod_shared_sqs_arn" { type = string }
variable "nonprod_shared_sns_arn" { type = string }
variable "prod_shared_sqs_arn" { type = string }
variable "prod_shared_sns_arn" { type = string }

#############################################
# Application & Database Settings
#############################################
variable "standard_tags" { type = map(string) }
variable "log_retention_days" {
  type    = number
  default = 30
}
variable "db_host" {
  type    = string
  default = "localhost"
} # Usually provided by RDS module output}
variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}

#############################################
# Container Runtime (Fargate)
#############################################
variable "web_cpu" {
  type    = string
  default = "1024"
}
variable "web_memory" {
  type    = string
  default = "2048"
}
variable "worker_cpu" {
  type    = string
  default = "512"
}
variable "worker_memory" {
  type    = string
  default = "1024"
}

#############################################
# Container Image (Fargate)
#############################################
variable "image_tag" {
  type    = string
  default = "latest"
}

#############################################
# Github CI/CD Pipeline
#############################################
variable "git_revision" {
  type        = string
  default     = ""
  description = "Git SHA of the code used for this run. Empty reads HEAD from this git repo."
}
variable "build_timestamp" {
  type        = string
  default     = ""
  description = "ISO8601 UTC timestamp at build time. Empty uses the time of this deployment."
}

#############################################
# EC2 Instance ID
#############################################
variable "target_instance_id" {
  type        = string
  description = "The ID of the existing EC2 instance to attach to the Load Balancer"
  default     = "i-0c1677fe098c47416" # Keep your ID as the default
}

#############################################
# DNS Validation
#############################################
variable "manage_dns_validation" {
  type        = bool
  default     = false # Flip this to true to automate the DNS records
  description = "Set to true to allow Terraform to create the CNAME records in Route53"
}

variable "manage_shared" {
  type        = bool
  default     = true
  description = "Create the account-level cluster, load balancer, ECR repository, and subnet groups. Set false when those already exist for this account."
}

variable "image_uri" {
  type        = string
  default     = ""
  description = "Full ECS image URI. Empty uses the environment ECR repository and image_tag."
}

variable "route53_zone_id" {
  type    = string
  default = ""
}

variable "waf_web_acl_arn" {
  type    = string
  default = ""
}

variable "gdx_secret_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "microsoft_app_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "peoplefinder_microsoft_auth_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "tdsp_pods_username" {
  type      = string
  sensitive = true
  default   = ""
}

variable "tdsp_pods_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "monitoring_token" {
  type      = string
  sensitive = true
  default   = ""
}