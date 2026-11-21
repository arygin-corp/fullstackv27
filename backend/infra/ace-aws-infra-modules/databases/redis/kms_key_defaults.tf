locals {
  kms_key_name = module.naming_helpers["kms_key"].names[64]
  kms_key_arn  = var.customer_kms_key_id != null ? var.customer_kms_key_id : module.kms_master_key[0].key_arns[local.kms_key_name]

  // KMS Key defaults
  default_cmk_administrator_iam_arns = [
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/app-admin-role",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${module.platform_roles.app_team_role_name}"
  ]

  default_cmk_service_principals = [
    {
      name    = "elasticache.amazonaws.com"
      actions = ["kms:GenerateDataKey*", "kms:Decrypt", "kms:CreateGrant"]
      conditions = [{
        test     = "StringEquals"
        variable = "kms:CallerAccount"
        values   = [data.aws_caller_identity.current.account_id]
      }]
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

  default_cmk_user_iam_arns = [
    {
      name = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
      conditions = [{
        test     = "StringLike"
        variable = "kms:ViaService"
        values   = ["logs.amazonaws.com"]
      }]
    },
    {
      name = ["*"]
      actions = [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ]
      conditions = [{
        test     = "StringEquals"
        variable = "kms:ViaService",
        values   = ["elasticache.${data.aws_region.current.region}.amazonaws.com"]
        }, {
        test     = "StringEquals"
        variable = "kms:CallerAccount",
        values   = [data.aws_caller_identity.current.account_id]
      }]
    }
  ]

  default_customer_master_keys = {
    (local.kms_key_name) = {
      cmk_administrator_iam_arns     = local.default_cmk_administrator_iam_arns
      cmk_service_principals         = local.default_cmk_service_principals
      cmk_user_iam_arns              = local.default_cmk_user_iam_arns
      multi_region                   = var.kms_multi_region
      allowed_manage_key_permissions = true
    }
  }
}
