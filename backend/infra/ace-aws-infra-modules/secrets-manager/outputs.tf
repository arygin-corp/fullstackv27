output "secret_arns" {
  description = "ARNs of the secrets created by this module, keyed by the secrets map key."
  value       = { for key, secret in aws_secretsmanager_secret.secrets : key => secret.arn }
}

output "kms_key_arns" {
  description = "KMS key ARNs created for secrets that do not use an existing key."
  value       = length(module.kms_master_key) > 0 ? module.kms_master_key[0].key_arns : {}
}

output "lambda_permissions_summary" {
  description = "Summary of all Lambda permissions created for easy reference"
  value = {
    secretsmanager_invoke_permissions = {
      for k, v in aws_lambda_permission.secretsmanager_invoke : k => {
        function_name = v.function_name
        statement_id  = v.statement_id
        principal     = v.principal
        action        = v.action
        source_arn    = v.source_arn
        description   = "Allows SecretsManager to invoke ${v.function_name} for secret ${k}"
      }
    }
  }
}