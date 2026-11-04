# ---------------------------------------------------------------------------------------------------------------------
# TERRAGRUNT CONFIGURATION
# Terragrunt is a thin wrapper for Terraform that provides extra tools for working with multiple Terraform modules,
# remote state, and locking: https://github.com/gruntwork-io/terragrunt
# ---------------------------------------------------------------------------------------------------------------------

# Generate an AWS provider block
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
  allowed_account_ids = ["${local.aws_account_id}"]
}
EOF
}

# Configure Terragrunt to automatically store tfstate files in an S3 bucket
remote_state {
  backend = "s3"
  config = {
    encrypt        = true
    bucket         = local.terraform_state_s3_bucket
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    dynamodb_table = local.terraform_lock_dynamodb_table
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

terraform {
  # this is an example only. In production code, Chofer recommends pinning the version of Blueprints to the specific, latest version
  # source = "git@github.com:Toyota-Motor-North-America/ace-aws-blueprint-spa.git//terraform?ref=vX.Y.Z"
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-blueprint-spa.git//terraform?ref=v5.0.7"
}

locals {
  aws_account_id                = "715662994982"
  aws_region                    = "us-east-1"
  terraform_state_s3_bucket     = "prd-spa-angular-example-spa-angular-tfstate"
  terraform_lock_dynamodb_table = "terraform-locks"
}

# ---------------------------------------------------------------------------------------------------------------------
# MODULE PARAMETERS
# These are the variables we have to pass in to use the module specified in the Terragrunt configuration above
# ---------------------------------------------------------------------------------------------------------------------

inputs = {
  # Required
  application_id      = "ace"
  application_name    = "spa-angular-example"
  content_bucket_name = "spa-angular-example"
  created_by_email    = "Chofer-Blueprints@toyota.com"
  environment         = "prd"
  fqdn                = "spa-angular-example.autotest.4poc.net"

  # --- CloudFront ---
  use_cloudfront_origin_access_control   = true  # Boolean
  update_bucket_policy_for_origin_access = false # Boolean
  cf_failover_default_bucket_creation    = false # Boolean
  cf_include_cookies_in_logs             = false # Boolean
  cf_shield_advanced_enable              = false # Boolean
  # Non-booleans 
  #cf_access_log_prefix = null 
  cf_access_logs_expiration_days = 60
  cf_allowed_methods             = ["GET, HEAD, OPTIONS"]
  #cf_default_lambda_associations = [] 
  #cf_error_responses = null 
  #geo_restriction_type = ""
  #geo_locations_list = []
  #cf_failover_bucket_names = [] 
  cf_forward_cookies = "none"
  #cf_forward_headers = []
  cf_index_document      = "index.html"
  cf_default_ttl_seconds = 60
  cf_max_ttl_seconds     = 90
  cf_min_ttl_seconds     = 30
  #cf_ordered_cache_behaviors = [] 
  cf_route53_zone_name_existing = "autotest.4poc.net"
  #cf_route53_zone_name_existing = null 
  #cf_s3_bucket_base_path = null 
  cf_shield_advanced_aggregation = "SUM"
  cf_viewer_protocol_policy      = "redirect-to-https"
  #cf_whitelisted_cookie_names = [] 

  # --- Health Check --- 
  #email_for_notification = "" 
  health_check_failure_threshold = 3
  #health_check_path = "" 
  health_check_port                     = 443
  health_check_request_interval_seconds = 30
  health_check_type                     = "HTTPS"
  #sns_topic_name_prefix = "" 

  # --- DataDog ---
  enable_datadog_monitoring = false # Boolean
  # Non-booleans 
  #dd_api_key_path = "/datadog/tmna/api-key" 
  #dd_app_key_path = "/datadog/tmna/app-key" 
  #metric_monitors = null 

  # --- S3 --- 
  #s3_accesslogs_bucketname = "" 
  s3_accesslogs_bucketprefix = "accesslogs/S3/"
  #s3_cors_configuration = null 
  s3_lifecycle_configuration_rules = [{
    enabled = true #
    id      = "defaultLifecycleConfig"

    abort_incomplete_multipart_upload_days = 90
    filter_and                             = null
    # Don't automatically expire any objects
    expiration = null

    # After a week of a current object version existing, transition it to intelligent tiering. Intelligent tiering will
    # take over and transition it to different tiers based on the last time it was accessed.
    transition = [{
      days          = 7
      storage_class = "INTELLIGENT_TIERING"
    }]

    # Delete anything older than the two most recent noncurrent versions of an object after 30 days
    noncurrent_version_expiration = {
      newer_noncurrent_versions = 2
      noncurrent_days           = 30
    }
    # Transition any noncurrent object to intelligent tiering just in case it became noncurrent before hitting the
    # the 7 day current version transition to intelligent tiering.
    noncurrent_version_transition = [{
      newer_noncurrent_versions = null
      noncurrent_days           = 7
      storage_class             = "INTELLIGENT_TIERING"
    }]
  }]

  #s3_source_policy_documents = [] 

  # --- S3 Encryption (Either kms_existing_key_arn or others are required) --- 
  #kms_administrator_iam_arns = [] 
  #kms_existing_key_arn = null
  #kms_create_key = false #Boolean 
  #kms_key_name = null 
  #kms_service_principals = null 
  #kms_user_iam_arns = null 

  # --- WAF --- 
  #waf_filtered_header_rule = null
  #waf_group_rules = [] 
  #waf_ip_rate_based_rule = null 
  #waf_list_of_ips = [] 
  #waf_logging_bucket_name = null 
  #waf_managed_rules = {} 
  #waf_add_default_zscalar_ips = false
  #waf_advanced_managed_rules = {}
  #waf_add_tmna_network_device_ips = false
  #waf_add_vpc_private_ips = false

  # General
  force_destroy_resources = false # Boolean
  # Non-booleans 
  #custom_tags = {} 
  logging_bucket_lifecycle_configuration_rules = [{
    enabled = true # bool
    id      = "s3_logging_lifecycle"

    filter_and                             = null
    abort_incomplete_multipart_upload_days = null
    noncurrent_version_expiration          = null
    noncurrent_version_transition          = null
    transition                             = null

    expiration = {
      days = 365 # integer > 0
    }
  }]

  #team = null 
}
