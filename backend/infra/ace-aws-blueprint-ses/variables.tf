# ---------------------------------------------------------------------------------------------------------------------
# REQUIRED MODULE PARAMETERS
# These variables must be passed in by the operator.
# ---------------------------------------------------------------------------------------------------------------------
variable "name_prefix" {
  description = "String to prefix resource names."
  type        = string
  validation {
    condition     = var.name_prefix != null && can(regex("^[0-9A-Za-z-]{1,128}$", var.name_prefix))
    error_message = "Argument 'name_prefix' must contain alphanumeric characters, hyphens and can't be empty. Length of value have to be lower than 128 symbols."
  }
}

variable "infra_live_repo" {
  type        = string
  description = "The name of the infrastructure live repository"
  default     = "ace-aws-infra-modules"
}

variable "domain" {
  description = "The domain or subdomain to use for Email sending."
  type        = string
}

variable "zone_name" {
  description = "Name of the Route53 zone to use for email authentication."
  type        = string
  validation {
    condition     = can(regex("^(?:[A-Za-z0-9-]{1,63}\\.)*(?:[A-Za-z0-9-]*toyota[A-Za-z0-9-]*\\.com|4poc\\.net|[A-Za-z0-9-]*lexus[A-Za-z0-9-]*\\.com)$", var.zone_name))
    error_message = "Argument 'zone_name' must contain only alphanumeric characters or hyphens, must not begin or end with a hyphen, can't be empty, and must match '*toyota*.com', '*4poc.net', or '*lexus*.com'. Length of value must be lower than 64 symbols."
  }
}

# ---------------------------------------------------------------------------------------------------------------------
# OPTIONAL MODULE PARAMETERS
# These variables have defaults, but may be overridden by the operator.
# ---------------------------------------------------------------------------------------------------------------------

variable "enable_datadog_monitoring" {
  description = "Set to true to forward logs and events that are transiting through to the SNS to Datadog. Requires Datadog setup on your AWS account. May incur additional costs."
  type        = bool
  default     = false
}

variable "route53_record_allow_overwrite" {
  description = "Allows the creation of records in Terraform to overwrite existing records. This doesn't affect the ability to update the records in Terraform."
  type        = bool
  default     = false
}

variable "route53_record_ttl" {
  description = "TTL for Route53 records. Setting a lower TTL may allow DNS records to propagate faster, but may cost more."
  type        = number
  default     = 300
  validation {
    condition     = var.route53_record_ttl > 0
    error_message = "Argument 'route53_record_ttl' must contain a numeric value greater than 0"
  }
}

variable "name" {
  description = "The name of the SNS topic that will be created"
  type        = string
  default     = null
}

variable "resource_slug" {
  description = "An optional slug to append to the names of created resources. This can be used to differentiate resources created by different instances of this module, if multiple instances are using the same name_prefix and name parameters. If provided, the slug will be appended to the end of resource names, separated by a hyphen."
  type        = string
  default     = null
}

variable "smtp_enabled" {
  description = "If this is true, SMTP will also be set up for the domain identity. This includes granting permissions to the already-existing SMTP user, storing the credentials in secrets manager, and creating the required resources for encryption. If this is false, the settings of `SMTP Access Key Status`, `SMTP Key Number`, `Existing SMTP User Name` and `SMTP Recovery Window' fields will have no effect."
  type        = bool
  default     = false
}

variable "smtp_access_key_status" {
  description = "The status of the access key of the IAM user for SMTP credentials. If smtp_enabled is false, this setting has no effect."
  type        = string
  default     = "Active"
  validation {
    condition     = var.smtp_access_key_status == "Active" || var.smtp_access_key_status == "Inactive"
    error_message = "Argument 'smtp_access_key_status' must be either 'Active' or 'Inactive'."
  }
}

# WARNING: this variable will be removed in a future release. It is only to be used in the case of credentials requiring rotation prior to automated rotation lambda update.
variable "smtp_key_number" {
  description = "A number to associate the created SMTP access key with. Changing this value will force replacement of the aws_iam_access_key resource. WARNING: this will be removed in a future release."
  type        = number
  default     = 0
}

variable "existing_smtp_user_name" {
  description = "An existing SMTP user to create credentials for, which will be stored in secrets manager."
  type        = string
  default     = null
}

variable "smtp_recovery_window_days" {
  description = "Recovery window (in days) for SMTP credentials in Secrets Manager. This value can be set to 0 to force deletion without recovery. If smtp_enabled is false, this setting has no effect."
  type        = number
  default     = 30
  validation {
    condition     = (var.smtp_recovery_window_days <= 30 && var.smtp_recovery_window_days >= 7) || (var.smtp_recovery_window_days == 0)
    error_message = "The value for smtp_recovery_window_days must be between 7 and 30, or be 0."
  }
}

variable "private_zone" {
  description = "Private hosted DNS zone. Only set to true if the zone name in var.zone_name is a private zone."
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------------------------------------------------
# OBSERVABILITY MODULE PARAMETERS
# These variables have defaults, but may be overridden by the operator. They are related specifically to observability.
# ---------------------------------------------------------------------------------------------------------------------
variable "event_notification_include_original_headers" {
  description = "Whether to include original headers in event notifications."
  type        = bool
  default     = false
}

variable "event_notification_types" {
  description = "List of types of events to send to the created SNS topic. Available types are 'Bounce', 'Complaint', and 'Delivery'."
  type        = list(string)
  default     = ["Bounce", "Complaint"]
}

# Bounce and complaint rate threshold defaults are based on advice from AWS knowledge center found here: https://repost.aws/knowledge-center/ses-reputation-dashboard-bounce-rate
variable "reputation_metrics_bounce_rate_enabled" {
  description = "Whether to create a Cloudwatch metric alarm for bounce rate."
  type        = bool
  default     = false
}

variable "reputation_metrics_bounce_rate_threshold" {
  description = "Threshold for bounce rate metric alarm (reputation_metrics_bounce_rate must be true). AWS may pause the ability to send emails if bounce rate is at or above 0.10."
  type        = number
  default     = 0.05
}

variable "reputation_metrics_complaint_rate_enabled" {
  description = "Whether to create a Cloudwatch metric alarm for complaint rate."
  type        = bool
  default     = false
}

variable "reputation_metrics_complaint_rate_threshold" {
  description = "The threshold for complaint rate metric alarm (reputation_metrics_complaint_rate must be true). AWS may pause the ability to send emails if complaint rate is at or above 0.005."
  type        = number
  default     = 0.001
}

variable "reputation_metric_alarm_evaluation_periods" {
  description = "The number of periods to use when Cloudwatch determines alarm state for reputation management alarms."
  type        = number
  default     = 2
}

variable "reputation_metric_alarm_period_seconds" {
  description = "The length (in time) of the period which Cloudwatch will evaluate when determining alarm state for reputation management alarms."
  type        = number
  default     = 120
}

variable "sns_allow_additional_publish_iam_arns" {
  description = "The IAM arns that will be given permission to publish to the SNS topic"
  type        = list(string)
  default     = []
}

variable "sns_allow_additional_subscribe_iam_arns" {
  description = "The IAM arns that will be given permission to subscribe to the SNS topic"
  type        = list(string)
  default     = []
}

variable "allow_override_iam_delegation" {
  description = "Allow user to override IAM delegation."
  type        = bool
  default     = false
}

variable "customer_master_keys" {
  description = "Map of CMK names to spec for managing each key. Each entry in the map corresponds to a key that will be created by this template. This field can be used to create multiple keys."
  type        = any
  default     = {}
}
# ---------------------------------------------------------------------------------------------------------------------
# TAGS PARAMETERS
# These variables set configuration for tags
# ---------------------------------------------------------------------------------------------------------------------

variable "application_id" {
  type        = string
  description = "Application ID as per CMDB"
}

variable "application_name" {
  type        = string
  description = "Name of Application as per CMDB"
}

variable "created_by_email" {
  type        = string
  description = "Toyota email of the person who creates resource."

}

variable "custom_tags" {
  description = "A map of custom tags to apply to the resources."
  type        = map(string)
  default     = {}
}

variable "environment" {
  type        = string
  description = "Environment abbreviation of resource."
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

variable "team" {
  default     = null
  description = "A team identifier which will populate the tmna:team tag. If one is not provided, this will be populated based on your git repo setup."
  type        = string
}

variable "app_team_oidc_arn" {
  description = "The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline."
  type        = string
}
