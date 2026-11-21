data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_iam_policy_document" "ses_key_policy" {
  statement {
    sid = "DefaultKMSPolicy"
    actions = [
      "kms:Create*",
      "kms:Describe*",
      "kms:Enable*",
      "kms:List*",
      "kms:Put*",
      "kms:Update*",
      "kms:Revoke*",
      "kms:Disable*",
      "kms:Get*",
      "kms:Delete*",
      "kms:Tag*",
      "kms:Untag*",
      "kms:ScheduleKeyDeletion",
      "kms:CancelKeyDeletion"
    ]
    resources = ["*"]
    principals {
      type = "AWS"
      identifiers = [
        data.aws_iam_role.app_admin_role.arn,
        data.aws_iam_role.app_team_role_name.arn
      ]
    }
  }

  # IAM Delegation Statement
  statement {
    sid       = "EnableIAMUserPermissions"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }

  # SES Service Principal Access
  statement {
    sid = "AllowSESToUseKMSKey"
    actions = [
      "kms:GenerateDataKey",
      "kms:Decrypt"
    ]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["ses.amazonaws.com"]
    }
  }
}

data "aws_iam_role" "app_admin_role" {
  name = "app-admin-role"
}

data "aws_iam_role" "app_team_role_name" {
  name = module.platform_roles.app_team_role_name
}