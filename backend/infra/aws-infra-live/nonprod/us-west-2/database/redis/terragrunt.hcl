# Shared Redis edmp-gdxp-admin-nonprod-redis.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/redis"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_elasticache_replication_group.this
  id = "edmp-gdxp-admin-nonprod-redis"
}
import {
  to = aws_vpc_security_group_ingress_rule.live[0]
  id = "sgr-0ef9b155623ac38e4"
}
import {
  to = aws_vpc_security_group_egress_rule.app
  id = "sgr-0620b5408933fd93f"
}
EOF
}

inputs = {
  replication_group_id         = "edmp-gdxp-admin-nonprod-redis"
  use_existing_network         = true
  existing_subnet_group_name   = "edmp-gdxp-nonprod-redis-sg"
  existing_security_group_name = "edmp-redis-sg"
  app_security_group_name      = "edmp-gdxp-admin-nonprod-app-sg"
}
