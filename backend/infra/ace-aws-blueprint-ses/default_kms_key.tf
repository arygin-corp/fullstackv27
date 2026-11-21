locals {
  default_kms_key_name = "${var.name_prefix}-${var.environment}-${local.aws_region_cd}-kms-ses-topic-key"

  default_cmk_admin_iam_arns = [
    data.aws_iam_role.app_admin_role.arn,
    data.aws_iam_role.app_team_role_name.arn
  ]

  # IAM delegation override
  default_cmk_administrator_iam_arns = (
    !var.allow_override_iam_delegation ? local.default_cmk_admin_iam_arns :
    concat(local.default_cmk_admin_iam_arns, formatlist("${substr(data.aws_iam_role.app_admin_role.arn, 0, 26)}root"))
  )

  default_cmk_service_principals = [{
    name = "ses.amazonaws.com"
    actions = [
      "kms:GenerateDataKey*",
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:CreateGrant",
      "kms:DescribeKey"
    ]
    conditions = [{
      test     = "StringLike"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["*"]
    }]
  }]

  # Lookup with defaults for customer key overrides
  cmk_administrator_iam_arns            = lookup(var.customer_master_keys, "cmk_administrator_iam_arns", local.default_cmk_administrator_iam_arns)
  cmk_service_principals                = lookup(var.customer_master_keys, "cmk_service_principals", local.default_cmk_service_principals)
  cmk_user_iam_arns                     = lookup(var.customer_master_keys, "cmk_user_iam_arns", [])
  allow_manage_key_permissions_with_iam = var.allow_override_iam_delegation ? lookup(var.customer_master_keys, "allow_manage_key_permissions_with_iam", true) : true

  default_customer_master_keys = {
    cmk_administrator_iam_arns            = local.cmk_administrator_iam_arns
    cmk_service_principals                = local.cmk_service_principals
    cmk_user_iam_arns                     = local.cmk_user_iam_arns
    allow_manage_key_permissions_with_iam = local.allow_manage_key_permissions_with_iam
  }
}