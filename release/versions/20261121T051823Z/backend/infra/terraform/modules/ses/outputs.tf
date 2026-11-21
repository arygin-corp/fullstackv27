output "configuration_set" {
  value = aws_ses_configuration_set.mail.name
}

output "instance_profile" {
  value = aws_iam_instance_profile.beanstalk.name
}

output "dkim_tokens" {
  value = { for domain, dkim in aws_ses_domain_dkim.domain : domain => dkim.dkim_tokens }
}
