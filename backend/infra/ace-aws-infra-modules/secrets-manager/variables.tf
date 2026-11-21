variable "application_id" {
  type        = string
  description = "Unique identifier for the application"
}

variable "application_name" {
  type        = string
  description = "Name of the application"
}

variable "created_by_email" {
  type        = string
  description = "Email of the person who created the resource"
}

variable "custom_tags" {
  type        = map(string)
  description = "A map of custom tags to apply to resources."
  default     = null
}

variable "infra_live_repo" {
  type        = string
  description = "The name of the infrastructure live repository"
  default     = "ace-aws-infra-modules"
}

variable "existing_rotation_lambda_arn" {
  type        = string
  description = "ARN of a rotation Lambda created in this stack. Skips the remote function lookup."
  default     = null
}

variable "existing_rotation_lambda_role_name" {
  type        = string
  description = "Role name for existing_rotation_lambda_arn. Required when that ARN is set."
  default     = null
}

variable "environment" {
  type        = string
  description = "Environment in which the secret is being deployed"
}

variable "team" {
  type        = string
  description = "Name of the team responsible for the secret"
}

variable "data_classification" {
  type        = string
  description = "Data classification level"
  default     = "no_classification"
  validation {
    condition     = contains(["public", "protected", "confidential", "legal", "highly_confidential", "no_classification"], var.data_classification)
    error_message = "data_classification must be either 'public', 'protected', 'confidential', 'legal', 'highly_confidential', 'no_classification'."
  }
}

variable "app_team_oidc_arn" {
  type        = string
  description = "The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline.The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline."
}

variable "name_prefix" {
  type        = string
  description = "Prefix to be used in naming resources. Must follow standard resource naming conventions: https://chofer.cloud.toyota.com/docs/default/component/ace-tech-docs/cloud-platform/aws/standards/cloud-resource-naming/#resource-naming-convention"
  validation {
    condition     = var.name_prefix != null && can(regex("^[0-9A-Za-z-]{3,5}$", var.name_prefix))
    error_message = "Argument 'name_prefix' must contain alphanumeric characters, hyphens and must be 3 to 5 characters in length."
  }
}

variable "secrets" {
  type = map(object({
    name                          = string
    existing_rotation_lambda_name = string
    description                   = optional(string)
    existing_kms_key_id           = optional(string)
    resource_policy               = optional(string)
    rotation_schedule             = optional(string, "rate(30 days)")
    custom_tags                   = optional(map(string))
  }))
  description = <<-EOT
    Map of secrets to manage. All secrets are created by this module with automatic rotation enabled.
    
    ROTATION LAMBDAS: Each secret must specify its rotation lambda via existing_rotation_lambda_name. 
    This allows for service-specific rotation logic (e.g., database vs. Datadog vs. API keys). 
    All rotation lambdas must exist and implement the AWS Secrets Manager rotation interface.
    
    Example:
    ```hcl
    secrets = {
      # Database secret with database-specific rotation lambda
      "app-database" = {
        name                        = "ksf-app-database-secret"
        description                 = "Database credentials for KSF application"
        existing_rotation_lambda_name = "database-rotation-lambda" # Database-specific lambda
        rotation_schedule           = "rate(7 days)"
        custom_tags = {
          "secret-type" = "database"
          "application" = "ksf-app"
        }
      }

      # Datadog API keys with Datadog-specific rotation lambda
      "datadog-keys" = {
        name                        = "ksf-datadog-api-keys"
        description                 = "Datadog API keys for monitoring"
        existing_rotation_lambda_name = "datadog-rotation-lambda" # Datadog-specific lambda
        rotation_schedule           = "rate(30 days)"
        custom_tags = {
          "secret-type" = "datadog"
          "application" = "ksf-app"
        }
      }

      # API keys with general API rotation lambda
      "api-keys" = {
        name                        = "ksf-api-keys-secret"
        description                 = "API keys for external services"
        existing_rotation_lambda_name = "api-rotation-lambda" # API-specific lambda
        rotation_schedule           = "cron(0 2 ? * MON *)" # Every Monday at 2 AM
        custom_tags = {
          "secret-type" = "api-keys"
          "application" = "ksf-app"
        }
      }

      # New secret with custom rotation lambda
      "database-credentials" = {
        name                  = "ksf-database-credentials"
        description           = "Database credentials with custom rotation"
        existing_rotation_lambda_name = "custom-db-rotation-lambda" # ← Custom rotation lambda
        rotation_schedule     = "rate(7 days)"
        custom_tags = {
          "secret-type" = "database"
        }
      }

      # New secret with custom KMS key
      "sensitive-data" = {
        name              = "ksf-sensitive-data-secret"
        description       = "Highly sensitive application data"
        existing_kms_key_id = "arn:aws:kms:us-west-2:123456789012:key/abcd1234-ef56-7890-abcd-ef1234567890"
        rotation_schedule = "rate(7 days)" # Weekly rotation for sensitive data
        custom_tags = {
          "secret-type"    = "sensitive"
          "classification" = "highly_confidential"
        }
      }
    }
    ```
  EOT
  validation {
    condition = alltrue([
      for k, v in var.secrets : (
        v.rotation_schedule == null || can(regex("^(rate\\(.*\\)|cron\\(.*\\))$", v.rotation_schedule))
      )
    ])
    error_message = "rotation_schedule must be a valid rate or cron expression."
  }
}

variable "default_rotation_schedule_expression" {
  type        = string
  description = "Default rotation schedule for secrets that don't specify their own. Examples: 'rate(7 days)', 'cron(0 2 ? * MON *)' for every Monday at 2 AM, 'rate(12 hours)' for every 12 hours."
  default     = "rate(30 days)"
  validation {
    condition     = can(regex("^(rate\\(.*\\)|cron\\(.*\\))$", var.default_rotation_schedule_expression))
    error_message = "default_rotation_schedule_expression must be a valid rate or cron expression."
  }
}

variable "resource_slug" {
  description = "An identifier to uniquely name this resource. This is often the service name, or a unique identifier."
  type        = string
  default     = "secrets-manager"
}