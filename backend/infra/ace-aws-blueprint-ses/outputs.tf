output "dkim_verification_record_names" {
  description = "Names of dkim records"
  value       = local.create_records ? flatten([for record in module.dkim_record : [record.hostname]]) : []
}

output "domain_verification_record" {
  description = "Name of domain verification record"
  value       = local.create_records ? module.domain_verification_record[0].hostname : ""
}

output "ses_domain_identity_arn" {
  description = "ARN of the domain identity in AWS SES"
  value       = aws_ses_domain_identity.domain.arn
}

output "smtp_secret_arn" {
  description = "The ARN of the SMTP credentials secret in Secrets Manager"
  value       = var.smtp_enabled ? aws_secretsmanager_secret.smtp_credentials[0].arn : null
}

output "dkim_tokens" {
  value = local.create_records ? aws_ses_domain_dkim.domain.dkim_tokens : []
}

output "domain_verification_token" {
  value = local.create_records ? aws_ses_domain_identity.domain.verification_token : ""
}