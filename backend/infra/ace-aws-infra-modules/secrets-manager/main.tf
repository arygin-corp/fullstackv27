resource "aws_secretsmanager_secret" "secrets" {
  for_each = var.secrets

  name        = each.value.name
  description = each.value.description != null ? "${each.value.description} (${var.resource_slug})" : "Secret managed by ${var.resource_slug}"
  kms_key_id  = each.value.existing_kms_key_id != null ? each.value.existing_kms_key_id : module.kms_master_key[0].key_arns["${each.key}-${local.kms_key_name}"]
  policy      = each.value.resource_policy

  tags = merge(module.standard_tags.tags, each.value.custom_tags != null ? each.value.custom_tags : {})
}

resource "aws_secretsmanager_secret_version" "secret_versions" {
  for_each = var.secrets

  secret_id     = aws_secretsmanager_secret.secrets[each.key].id
  secret_string = "I will be updated automatically" # pragma: allowlist secret

  # Ignore changes to secret values - allow manual updates without affecting state
  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret_rotation" "secret_rotation" {
  for_each = var.secrets

  secret_id           = aws_secretsmanager_secret.secrets[each.key].id
  rotation_lambda_arn = local.rotation_lambda_arns[each.key]
  rotate_immediately  = true

  rotation_rules {
    schedule_expression = each.value.rotation_schedule != null ? each.value.rotation_schedule : var.default_rotation_schedule_expression
  }

  depends_on = [
    aws_secretsmanager_secret_version.secret_versions,
    aws_iam_role_policy_attachment.rotation_lambda_policy_attachment,
    aws_lambda_permission.secretsmanager_invoke,
  ]
}

resource "aws_lambda_permission" "rotation_lambdas" {
  for_each = local.rotation_lambda_permissions

  statement_id  = "AllowExecutionFromSecretsManager-${replace(each.key, "-", "_")}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.lambda_name
  principal     = "secretsmanager.amazonaws.com"
}

module "kms_master_key" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key?ref=v47.3.3"

  count = length([for k, v in var.secrets : v if v.existing_kms_key_id == null]) > 0 ? 1 : 0

  aws_region           = data.aws_region.current.region
  customer_master_keys = local.default_customer_master_keys

  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  team                = var.team
  environment         = var.environment
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "platform_roles" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles?ref=v47.3.3"

  app_team_oidc_arn = var.app_team_oidc_arn
}

module "standard_tags" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//tagging/tmna-standard-tags?ref=v47.3.3"

  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}
