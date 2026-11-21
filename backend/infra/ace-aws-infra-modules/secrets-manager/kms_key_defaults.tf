locals {
  // KMS Key defaults - generate for each secret
  default_customer_master_keys = merge([
    for k, v in var.secrets : {
      "${k}-${local.kms_key_name}" = {
        cmk_administrator_iam_arns     = local.default_cmk_administrator_iam_arns,
        cmk_service_principals         = local.default_cmk_service_principals,
        cmk_user_iam_arns              = local.default_cmk_user_iam_arns
        allowed_manage_key_permissions = true
      }
    }
  ]...)

  default_cmk_administrator_iam_arns = [
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/app-admin-role",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${module.platform_roles.app_team_role_name}"
  ]

  default_cmk_service_principals = [
    {
      name    = "rds.amazonaws.com"
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
      }, {
      name    = "secretsmanager.amazonaws.com"
      actions = ["kms:GenerateDataKey*", "kms:Decrypt", "kms:CreateGrant"]
      conditions = [{
        test     = "StringEquals"
        variable = "kms:CallerAccount"
        values   = [data.aws_caller_identity.current.account_id]
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
      conditions = [{
        test     = "StringEquals"
        variable = "kms:ViaService",
        values   = ["secretsmanager.${data.aws_region.current.region}.amazonaws.com"]
        }, {
        test     = "StringEquals"
        variable = "kms:CallerAccount",
        values   = [data.aws_caller_identity.current.account_id]
      }]
    }
  ]
}