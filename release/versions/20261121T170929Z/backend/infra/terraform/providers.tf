#############################################
# providers.tf
# AWS provider configuration
#############################################
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws      = { source = "hashicorp/aws", version = ">= 5.0" }
    external = { source = "hashicorp/external", version = ">= 2.3" }
  }
}

# Provider configured dynamically per env in locals/main
provider "aws" {
  region = var.aws_region
}

# Discover the active region (for env mapping)
data "aws_region" "current" {}

# Discover the current AWS account ID (for validation & ARN building)
data "aws_caller_identity" "current" {}

data "external" "git" {
  program = ["bash", "-c", "printf '{\"revision\":\"%s\"}\\n' \"$(git rev-parse HEAD)\""]
}

data "external" "deployment" {
  program = ["bash", "-c", "printf '{\"timestamp\":\"%s\"}\\n' \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""]
}
