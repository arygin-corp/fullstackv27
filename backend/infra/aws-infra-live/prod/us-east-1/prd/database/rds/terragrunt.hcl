# Production Postgres.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/rds"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  identifier             = "edmp-gdxp-admin-prod-rds"
  db_name                = "gdxpadminprod"
  instance_class         = "db.r6g.large"
  allocated_storage      = 100
  max_allocated_storage  = 1000
  db_subnet_group_name   = "edmp-gdxp-admin-prod-db-subnets"
  db_security_group_name = "edmp-gdxp-admin-prod-db-sg"
  secret_name            = "edmp-gdxp-admin-prod-runtime"
}
