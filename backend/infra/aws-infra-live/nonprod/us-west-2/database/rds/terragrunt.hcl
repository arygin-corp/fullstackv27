# Shared Postgres edmp-gdxp-admin-nonprod-rds.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/rds"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_db_subnet_group.this
  id = "edmp-gdxp-admin-db-subnets"
}
import {
  to = aws_db_instance.this
  id = "edmp-gdxp-admin-nonprod-rds"
}
EOF
}

inputs = {
  identifier             = "edmp-gdxp-admin-nonprod-rds"
  db_name                = "edmp_gdxp_admin_nonprod"
  instance_class         = "db.t4g.medium"
  allocated_storage      = 100
  max_allocated_storage  = 500
  db_subnet_group_name   = "edmp-gdxp-admin-db-subnets"
  db_security_group_name = "edmp-gdxp-admin-nonprod-db-sg"
  secret_name            = "edmp-gdxp-admin-nonprod-runtime"
}
