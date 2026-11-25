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

variable "identifier" {
  type = string
}
variable "instance_class" {
  type = string
}
variable "allocated_storage" {
  type = number
}
variable "max_allocated_storage" {
  type = number
}
variable "db_subnet_group_name" {
  type = string
}
variable "db_security_group_name" {
  type = string
}
variable "db_user" {
  type    = string
  default = "Administrator"
}
variable "secret_name" {
  type = string
}

data "aws_secretsmanager_secret_version" "runtime" {
  secret_id = var.secret_name
}

locals {
  db_password = jsondecode(data.aws_secretsmanager_secret_version.runtime.secret_string).DB_PASSWORD
}

data "aws_security_group" "db" {
  name   = var.db_security_group_name
  vpc_id = var.vpc_id
}

resource "aws_db_subnet_group" "this" {
  name       = var.db_subnet_group_name
  subnet_ids = var.private_subnet_ids
  tags       = local.tags
}

resource "aws_db_instance" "this" {
  identifier                  = var.identifier
  engine                      = "postgres"
  engine_version              = "17"
  allow_major_version_upgrade = true
  instance_class              = var.instance_class
  allocated_storage           = var.allocated_storage
  max_allocated_storage       = var.max_allocated_storage
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = var.db_name
  username                    = var.db_user
  password                    = local.db_password
  port                        = 5432
  db_subnet_group_name        = aws_db_subnet_group.this.name
  vpc_security_group_ids      = [data.aws_security_group.db.id]
  multi_az                    = true
  publicly_accessible         = false
  backup_retention_period     = 7
  deletion_protection         = true
  skip_final_snapshot         = false
  final_snapshot_identifier   = "${var.identifier}-final"
  copy_tags_to_snapshot       = true
  auto_minor_version_upgrade  = true
  apply_immediately           = true
  tags                        = local.tags
  lifecycle {
    prevent_destroy = true
  }
}
