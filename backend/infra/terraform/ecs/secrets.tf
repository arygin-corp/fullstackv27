module "app_secrets" {
  for_each = local.environments
  source   = "../../ace-aws-infra-modules/secrets-manager"

  # This module allows a 3 to 5 character prefix. The ECS blueprint prefix is edmp-gdxp.
  name_prefix         = "edmp"
  resource_slug       = "admin"
  environment         = each.key
  team                = "Data Marketplace Team"
  data_classification = "protected"
  application_id      = "APM0003247"
  application_name    = "Global Data-Marketplace Xchange Platform"
  created_by_email    = "giovanni.austin@toyota.com"
  app_team_oidc_arn   = data.aws_iam_role.pipeline.arn

  existing_rotation_lambda_arn       = aws_lambda_function.secret_rotation.arn
  existing_rotation_lambda_role_name = aws_iam_role.secret_rotation.name

  secrets = {
    django_secret_key = {
      name                          = "edmp-gdxp-admin-${each.key}-django-secret-key"
      description                   = "Django GDXP_SECRET_KEY for the ${each.key} admin"
      existing_rotation_lambda_name = aws_lambda_function.secret_rotation.function_name
      rotation_schedule             = "rate(30 days)"
    }
  }
}

resource "aws_iam_role_policy" "database_parameters" {
  for_each = module.admin

  name = "database-parameters"
  role = each.value.ecs_task_execution_iam_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
        "ssm:GetParameter",
        "ssm:GetParameters",
      ]
      Resource = values(module.database.database_parameter_arn_map)
    }]
  })
}

resource "aws_iam_role_policy" "app_secrets_read" {
  for_each = module.admin

  name = "app-secrets-read"
  role = each.value.ecs_task_execution_iam_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = concat(
          [module.app_secrets[each.key].secret_arns["django_secret_key"]],
          contains(keys(var.microsoft_app_secrets), each.key) ? [aws_secretsmanager_secret.microsoft[each.key].arn] : [],
        )
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = values(module.app_secrets[each.key].kms_key_arns)
      },
    ]
  })
}
