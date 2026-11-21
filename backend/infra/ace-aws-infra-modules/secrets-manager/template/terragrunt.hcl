# ---------------------------------------------------------------------------------------------------------------------
# TERRAGRUNT CONFIGURATION
# This is the configuration for Terragrunt, a thin wrapper for Terraform that supports locking and enforces best practices: https://github.com/gruntwork-io/terragrunt
# ---------------------------------------------------------------------------------------------------------------------

# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the working directory, into a temporary folder, and execute your Terraform commands in that folder.
terraform {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=vX.Y.Z"
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=master"
}

# Include all settings from the root terragrunt.hcl file
include { path = find_in_parent_folders() }

# Local variables
# Pull required parameters set in the parameter files of this relative path to be used as values.
locals {
  global_vars      = read_terragrunt_config(find_in_parent_folders("global.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  environment_vars = read_terragrunt_config(find_in_parent_folders("environment.hcl"))
  name_prefix      = local.global_vars.locals.name_prefix
  application_id   = local.global_vars.locals.application_id
  application_name = local.global_vars.locals.application_name
  environment      = local.environment_vars.locals.environment
  aws_region_cd    = local.region_vars.locals.aws_region_cd
}

# ---------------------------------------------------------------------------------------------------------------------
# MODULE PARAMETERS
# These are the variables we have to pass in to use the module specified in the Terragrunt configuration above
# ---------------------------------------------------------------------------------------------------------------------

inputs = { 
name_prefix         = "YOUR_NAME_PREFIX"
application_id      = "YOUR_APPLICATION_ID"
application_name    = "YOUR_APPLICATION_NAME"
created_by_email    = "YOUR_EMAIL"
team                = "YOUR_TEAM"
environment         = "YOUR_ENVIRONMENT"
data_classification = "YOUR_DATA_CLASSIFICATION"
infra_live_repo     = "YOUR_INFRA_LIVE_REPO"

# Multiple secrets configuration with service-specific rotation lambdas
secrets = {
  # Database secret with database-specific rotation lambda
  "app-database" = {
    name                          = "SECRET_NAME"
    existing_rotation_lambda_name = "EXISTING_ROTATION_LAMBDA"
    existing_kms_key_id           = "YOUR_KMS_KEY_ARN"
    description                   = "YOUR_DESCRIPTION"
    rotation_schedule             = "rate(7 days)"
    custom_tags = {
      "secret-type" = "SECRET_TYPE"
      "application" = "YOUR_APP_NAME"
      "service"     = "SERVICE"
    }
  }

  # API keys using default rotation lambda
  "api-keys" = {
    name                          = "SECRET_NAME"
    existing_rotation_lambda_name = "EXISTING_ROTATION_LAMBDA"
    description                   = "YOUR_DESCRIPTION"
    rotation_schedule             = "cron(0 2 ? * MON *)"
    custom_tags = {
      "secret-type"   = "SECRET_TYPE"
      "application"   = "YOUR_APP_NAME"
    }
  }

  # Redis credentials with custom rotation lambda
  "redis-credentials" = {
    name                          = "SECRET_NAME"
    existing_rotation_lambda_name = "EXISTING_ROTATION_LAMBDA"
    description                   = "YOUR_DESCRIPTION"
    rotation_schedule             = "rate(14 days)"
    custom_tags = {
      "secret-type"   = "SECRET_TYPE"
      "application"   = "YOUR_APP_NAME"
    }
  }

}

default_rotation_schedule_expression = "rate(30 days)"

custom_tags = {
  "purpose" = "YOUR_PURPOSE"
  "owner"   = "YOUR_OWNER"
}
}
