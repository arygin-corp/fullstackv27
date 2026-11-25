locals {
  tags = {
    "tmna:app-id"           = var.application_id
    "tmna:app-name"         = var.application_name
    "tmna:environment"      = var.app_env != "" ? var.app_env : var.environment
    "tmna:classification"   = "Protected"
    "tmna:created-by-email" = "giovanni.austin@toyota.com"
    "tmna:team"             = "Data Marketplace Team"
    "tmna:git_url"          = "https://github.com/Toyota-Motor-North-America/edmp-global-marketplace-xchange-platform"
  }
}

variable "domains" {
  type = list(string)
}
variable "configuration_set" {
  type = string
}

resource "aws_ses_domain_identity" "domain" {
  for_each = toset(var.domains)
  domain   = each.value
}

resource "aws_ses_domain_dkim" "domain" {
  for_each = aws_ses_domain_identity.domain
  domain   = each.value.domain
}

resource "aws_ses_configuration_set" "mail" {
  name = var.configuration_set
}
