resource "aws_ses_domain_dkim" "domain" {
  domain = aws_ses_domain_identity.domain.domain
}

resource "aws_ses_domain_identity" "domain" {
  domain = var.domain
}

resource "aws_ses_domain_identity_verification" "domain_verification" {
  count = local.create_records ? 1 : 0

  domain = aws_ses_domain_identity.domain.id

  depends_on = [module.domain_verification_record]
}

# Number of dkim records cannot be determined programmatically as this Blueprint also creates the aws_ses_domain_dkim resource. Count for these records based on documentation in Terraform registry: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ses_domain_dkim
module "dkim_record" {
  source = "git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/dns/record?ref=v47.3.2"
  count  = local.create_records ? 3 : 0

  allow_overwrite = var.route53_record_allow_overwrite
  name            = "${aws_ses_domain_dkim.domain.dkim_tokens[count.index]}._domainkey"
  record_values   = ["${aws_ses_domain_dkim.domain.dkim_tokens[count.index]}.dkim.amazonses.com"]
  private_zone    = var.private_zone
  ttl             = var.route53_record_ttl
  type            = "CNAME"
  zone_name       = var.zone_name
}

module "domain_verification_record" {
  source = "git::git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/dns/record?ref=v47.3.2"
  count  = local.create_records ? 1 : 0

  allow_overwrite = var.route53_record_allow_overwrite
  name            = "_amazonses.${var.domain}"
  private_zone    = var.private_zone
  record_values   = [aws_ses_domain_identity.domain.verification_token]
  ttl             = var.route53_record_ttl
  type            = "TXT"
  zone_name       = var.zone_name
}

module "standard_tags" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//tagging/tmna-standard-tags?ref=v47.1.14"

  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  infra_live_repo     = var.infra_live_repo
  data_classification = var.data_classification
}

resource "null_resource" "key_rotation" {
  triggers = {
    "key_number" = var.smtp_key_number
  }
}

# null_resource above allows the customer to force replacement of the created access_key, essentially rotating it
resource "aws_iam_access_key" "smtp_access_key" {
  count = var.smtp_enabled ? 1 : 0

  user   = local.smtp_user_name
  status = var.smtp_access_key_status

  lifecycle {
    replace_triggered_by = [null_resource.key_rotation]
  }
}

module "kms_master_key" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key?ref=v47.1.14"

  aws_region = "us-west-2" # unused variable, but required by module
  customer_master_keys = {
    (local.default_kms_key_name) = local.default_customer_master_keys
  }

  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  infra_live_repo     = var.infra_live_repo
  data_classification = var.data_classification
}

resource "aws_secretsmanager_secret" "smtp_credentials" {
  count = var.smtp_enabled ? 1 : 0

  kms_key_id              = module.kms_master_key.key_arns[local.default_kms_key_name]
  name                    = local.smtp_secret_name
  description             = "Username and password to be used when sending email in SES with SMTP."
  recovery_window_in_days = var.smtp_recovery_window_days
  tags                    = module.standard_tags.tags
}

resource "aws_secretsmanager_secret_version" "smtp_credentials" {
  count = var.smtp_enabled ? 1 : 0

  secret_id = aws_secretsmanager_secret.smtp_credentials[0].id
  secret_string = sensitive(jsonencode({
    username = aws_iam_access_key.smtp_access_key[0].id
    password = aws_iam_access_key.smtp_access_key[0].ses_smtp_password_v4
  }))
}

# v13.0.0 of the SNS Blueprint is used here as more recent versions require at least one value in allow_publish_accounts and allow_subscribe_accounts
module "sns_event_notification_topic" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//messaging/sns?ref=v50.1.1"

  aws_region                = data.aws_region.current.region
  name_prefix               = var.name_prefix
  resource_slug             = "event${var.resource_slug != null ? "-${var.resource_slug}" : ""}"
  name                      = var.name
  allow_publish_iam_arns    = local.sns_allow_additional_publish_iam_arns
  allow_publish_services    = ["ses.amazonaws.com"]
  allow_subscribe_iam_arns  = local.sns_allow_additional_subscribe_iam_arns
  enable_datadog_monitoring = var.enable_datadog_monitoring
  application_id            = var.application_id
  application_name          = var.application_name
  created_by_email          = var.created_by_email
  custom_tags               = var.custom_tags
  environment               = var.environment
  team                      = var.team
  app_team_oidc_arn         = var.app_team_oidc_arn
  data_classification       = var.data_classification
  infra_live_repo           = var.infra_live_repo
}

# An IAM policy can be used as a KMS key policy so long as it has a principal
resource "aws_kms_key_policy" "ses_event_key_policy" {
  key_id = module.sns_event_notification_topic.key_id
  policy = data.aws_iam_policy_document.ses_key_policy.json
}

resource "aws_ses_identity_notification_topic" "event_notifications" {
  count = length(var.event_notification_types)

  topic_arn                = module.sns_event_notification_topic.topic_arn
  notification_type        = var.event_notification_types[count.index]
  identity                 = aws_ses_domain_identity.domain.domain
  include_original_headers = var.event_notification_include_original_headers
}

module "sns_reputation_management_topic" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//messaging/sns?ref=v50.1.1"
  count  = var.reputation_metrics_bounce_rate_enabled || var.reputation_metrics_complaint_rate_enabled ? 1 : 0

  aws_region                = data.aws_region.current.region
  name_prefix               = "${var.name_prefix}-reputation"
  resource_slug             = "rep${var.resource_slug != null ? "-${var.resource_slug}" : ""}"
  name                      = var.name
  allow_publish_iam_arns    = local.sns_allow_additional_publish_iam_arns
  allow_publish_services    = ["ses.amazonaws.com"]
  allow_subscribe_iam_arns  = local.sns_allow_additional_subscribe_iam_arns
  enable_datadog_monitoring = var.enable_datadog_monitoring
  application_id            = var.application_id
  application_name          = var.application_name
  created_by_email          = var.created_by_email
  custom_tags               = var.custom_tags
  environment               = var.environment
  team                      = var.team
  app_team_oidc_arn         = var.app_team_oidc_arn
  data_classification       = var.data_classification
  infra_live_repo           = var.infra_live_repo
}

# An IAM policy can be used as a KMS key policy so long as it has a principal
resource "aws_kms_key_policy" "ses_reputation_key_policy" {
  count = var.reputation_metrics_bounce_rate_enabled || var.reputation_metrics_complaint_rate_enabled ? 1 : 0

  key_id = module.sns_reputation_management_topic[0].key_id
  policy = data.aws_iam_policy_document.ses_key_policy.json
}

module "reputation_metric_alarm_bounce_rate" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/monitoring?ref=v47.1.14"
  count  = var.reputation_metrics_bounce_rate_enabled ? 1 : 0

  application_id   = var.application_id
  application_name = var.application_name
  aws_region_cd    = local.aws_region_cd
  blueprint_type   = "none"
  created_by_email = var.created_by_email
  custom_alarms = {
    ses_bounce_rate_alarm = {
      alarm_name          = "${var.name_prefix}-${var.environment}-${local.aws_region_cd}-cw-ses-bounce-rate"
      comparison_operator = "GreaterThanOrEqualToThreshold"
      evaluation_periods  = var.reputation_metric_alarm_evaluation_periods
      metric_name         = "Reputation.BounceRate"
      namespace           = "AWS/SES"
      period              = var.reputation_metric_alarm_period_seconds
      statistic           = "Maximum"
      threshold           = var.reputation_metrics_bounce_rate_threshold
    }
  }
  environment    = var.environment
  name_prefix    = var.name_prefix
  service_name   = "SES"
  sns_topic_arns = [module.sns_reputation_management_topic[0].topic_arn]

  custom_tags         = var.custom_tags
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "reputation_metric_alarm_complaint_rate" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/monitoring?ref=v47.1.14"
  count  = var.reputation_metrics_complaint_rate_enabled ? 1 : 0

  application_id   = var.application_id
  application_name = var.application_name
  aws_region_cd    = local.aws_region_cd
  blueprint_type   = "none"
  created_by_email = var.created_by_email
  custom_alarms = {
    ses_complaint_rate_alarm = {
      alarm_name          = "${var.name_prefix}-${var.environment}-${local.aws_region_cd}-cw-ses-complaint-rate"
      comparison_operator = "GreaterThanOrEqualToThreshold"
      evaluation_periods  = var.reputation_metric_alarm_evaluation_periods
      metric_name         = "Reputation.BounceRate"
      namespace           = "AWS/SES"
      period              = var.reputation_metric_alarm_period_seconds
      statistic           = "Maximum"
      threshold           = var.reputation_metrics_complaint_rate_threshold
    }
  }
  environment    = var.environment
  name_prefix    = var.name_prefix
  service_name   = "SES"
  sns_topic_arns = [module.sns_reputation_management_topic[0].topic_arn]

  custom_tags         = var.custom_tags
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "platform_roles" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles?ref=v47.1.14"

  app_team_oidc_arn = var.app_team_oidc_arn
}
