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

variable "replication_group_id" {
  type = string
}
variable "use_existing_network" {
  type    = bool
  default = false
}
variable "existing_subnet_group_name" {
  type    = string
  default = ""
}
variable "existing_security_group_name" {
  type    = string
  default = ""
}
variable "redis_security_group_name" {
  type    = string
  default = ""
}
variable "redis_subnet_group_name" {
  type    = string
  default = ""
}

data "aws_security_group" "app" {
  name   = var.app_security_group_name
  vpc_id = var.vpc_id
}

data "aws_security_group" "live" {
  count  = var.use_existing_network ? 1 : 0
  name   = var.existing_security_group_name
  vpc_id = var.vpc_id
}

resource "aws_security_group" "this" {
  count       = var.use_existing_network ? 0 : 1
  name        = var.redis_security_group_name
  description = "GDXP Admin Redis"
  vpc_id      = var.vpc_id
  tags        = merge(local.tags, { Name = var.redis_security_group_name })
}

resource "aws_elasticache_subnet_group" "this" {
  count      = var.use_existing_network ? 0 : 1
  name       = var.redis_subnet_group_name
  subnet_ids = var.private_subnet_ids
}

resource "aws_vpc_security_group_ingress_rule" "clients" {
  count                        = var.use_existing_network ? 0 : 1
  security_group_id            = aws_security_group.this[0].id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
  referenced_security_group_id = data.aws_security_group.app.id
}

resource "aws_vpc_security_group_ingress_rule" "live" {
  count                        = var.use_existing_network ? 1 : 0
  security_group_id            = data.aws_security_group.live[0].id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
  referenced_security_group_id = data.aws_security_group.app.id
}

resource "aws_vpc_security_group_egress_rule" "app" {
  security_group_id            = data.aws_security_group.app.id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
  referenced_security_group_id = var.use_existing_network ? data.aws_security_group.live[0].id : aws_security_group.this[0].id
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id       = var.replication_group_id
  description                = var.replication_group_id
  engine                     = "redis"
  node_type                  = "cache.t4g.small"
  port                       = 6379
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  subnet_group_name          = var.use_existing_network ? var.existing_subnet_group_name : aws_elasticache_subnet_group.this[0].name
  security_group_ids         = [var.use_existing_network ? data.aws_security_group.live[0].id : aws_security_group.this[0].id]
  snapshot_retention_limit   = 7
  apply_immediately          = false
  tags                       = local.tags
  lifecycle {
    prevent_destroy = true
    ignore_changes  = [subnet_group_name, security_group_ids]
  }
}
