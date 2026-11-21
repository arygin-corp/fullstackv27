module "cloudwatch_logs" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/logs?ref=v47.3.3"

  count = var.existing_cloudwatch_log_group == null ? 1 : 0

  log_group_name            = "${var.name_prefix}-${var.environment}-${local.region_cd}-${var.service_name}-${var.log_group_name}"
  log_retention_period_days = var.log_retention_period_days
  force_destroy             = var.cloudwatch_force_destroy
  enable_datadog_monitoring = var.enable_datadog_monitoring
  existing_key_arn          = var.cw_existing_key_arn
  cmk_create_key            = var.cw_existing_key_arn == null ? true : false

  customer_master_key = var.cw_existing_key_arn == null ? {
    cmk_administrator_iam_arns = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    cmk_service_principals = [
      {
        name       = "logs.${data.aws_region.current.region}.amazonaws.com"
        actions    = ["kms:Encrypt", "kms:Decrypt", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:DescribeKey"]
        conditions = []
      }
    ]
  } : null

  application_id   = var.application_id
  application_name = var.application_name
  created_by_email = var.created_by_email
  custom_tags      = var.custom_tags
  environment      = var.environment
  team             = var.team
}