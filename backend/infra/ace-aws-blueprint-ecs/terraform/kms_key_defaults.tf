locals {
  // KMS Key defaults
  default_kms_key_name = "${local.constructed_service_name}-cw-logs-key"
  default_cmk_admin_iam_arns = [
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/app-admin-role",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${module.platform_roles.app_team_role_name}",
    data.aws_caller_identity.current.arn
  ]

  default_cmk_administrator_iam_arns = (
    !var.allow_override_iam_delegation ? local.default_cmk_admin_iam_arns :
    concat(local.default_cmk_admin_iam_arns, ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"])
  )

  default_cmk_service_principals = [
    {
      name = "logs.${data.aws_region.current.region}.amazonaws.com"
      actions = [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ]
      conditions = [
        {
          test     = "StringEquals"
          variable = "kms:CallerAccount",
          values   = [data.aws_caller_identity.current.account_id]
        }
      ]
    },
    {
      name = "s3.${data.aws_region.current.region}.amazonaws.com"
      actions = [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ]
      conditions = [
        {
          test     = "StringEquals"
          variable = "kms:CallerAccount",
          values   = [data.aws_caller_identity.current.account_id]
        }
      ]
    },
    {
      name    = "logs.amazonaws.com"
      actions = ["kms:*"]
      conditions = [{
        test     = "StringLike"
        variable = "kms:EncryptionContext:aws:logs:arn"
        values   = ["arn:aws:logs:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:log-group:*"]
      }]
    }
  ]

  default_customer_master_keys = {
    cmk_administrator_iam_arns            = local.default_cmk_administrator_iam_arns
    cmk_service_principals                = local.default_cmk_service_principals
    allow_manage_key_permissions_with_iam = true
  }
}
