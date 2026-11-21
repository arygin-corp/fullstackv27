# IAM policy for each rotation Lambda function - one for each secret
resource "aws_iam_policy" "rotation_lambda_policy" {
  for_each = var.secrets

  name = "${var.name_prefix}-${var.environment}-${local.region_cd}-${var.resource_slug}-${each.key}-rotation-policy"

  description = "Policy for ${var.resource_slug} secret rotation Lambda function - ${each.key}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:UpdateSecretVersionStage",
          "secretsmanager:ListSecretVersionIds"
        ]
        Resource = aws_secretsmanager_secret.secrets[each.key].arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = each.value.existing_kms_key_id != null ? each.value.existing_kms_key_id : module.kms_master_key[0].key_arns["${each.key}-${local.kms_key_name}"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rotation_lambda_policy_attachment" {
  for_each   = var.secrets
  role       = local.rotation_lambda_role_names[each.key]
  policy_arn = aws_iam_policy.rotation_lambda_policy[each.key].arn
}

resource "aws_lambda_permission" "secretsmanager_invoke" {
  for_each = var.secrets

  statement_id  = "AllowSM-${substr(md5("${var.resource_slug}-${each.key}-${each.value.existing_rotation_lambda_name}"), 0, 40)}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.existing_rotation_lambda_name
  principal     = "secretsmanager.amazonaws.com"
  source_arn    = aws_secretsmanager_secret.secrets[each.key].arn
}
