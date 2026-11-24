resource "aws_secretsmanager_secret" "microsoft" {
  for_each = var.microsoft_app_secrets

  name        = "edmp-gdxp-admin-${each.key}-microsoft-app-secret"
  description = "Entra client secret for the ${each.key} admin"
}

resource "aws_secretsmanager_secret_version" "microsoft" {
  for_each = var.microsoft_app_secrets

  secret_id     = aws_secretsmanager_secret.microsoft[each.key].id
  secret_string = each.value
}
