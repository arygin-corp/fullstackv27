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

variable "db_user" {
  type    = string
  default = "Administrator"
}
variable "monitoring_token" {
  type      = string
  sensitive = true
  default   = ""
}
variable "microsoft_app_secret" {
  type      = string
  sensitive = true
  default   = ""
}
variable "peoplefinder_microsoft_auth_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}
variable "tdsp_pods_username" {
  type      = string
  sensitive = true
  default   = ""
}
variable "tdsp_pods_password" {
  type      = string
  sensitive = true
  default   = ""
}

resource "random_password" "gdx_secret_key" {
  length  = 64
  special = false
}

resource "random_password" "db" {
  length           = 32
  special          = true
  override_special = "!#$%^&*()-_=+"
  min_lower        = 1
  min_upper        = 1
  min_numeric      = 1
  min_special      = 1
}

resource "aws_secretsmanager_secret" "this" {
  name                    = var.secret_name
  recovery_window_in_days = 30
  tags                    = local.tags
  lifecycle { prevent_destroy = true }
}

resource "aws_secretsmanager_secret_version" "this" {
  secret_id = aws_secretsmanager_secret.this.id
  secret_string = jsonencode({
    GDXP_SECRET_KEY                           = random_password.gdx_secret_key.result
    DB_USER                                   = var.db_user
    DB_PASSWORD                               = random_password.db.result
    MICROSOFT_APP_SECRET                      = var.microsoft_app_secret
    PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET = var.peoplefinder_microsoft_auth_client_secret
    TDSP_PODS_USERNAME                        = var.tdsp_pods_username
    TDSP_PODS_PASSWORD                        = var.tdsp_pods_password
    MONITORING_TOKEN                          = var.monitoring_token
  })
}
