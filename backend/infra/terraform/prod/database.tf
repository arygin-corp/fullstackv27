module "database" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//databases/rds?ref=v47.5.1"

  name_prefix         = "edmp-gdxp-admin"
  aws_region          = "us-east-1"
  aws_region_cd       = "use1"
  db_name             = local.database_name_requested
  engine              = "postgres"
  engine_version      = "17"
  instance_type       = "db.r6g.large"
  port                = 5432
  master_username     = "Administrator"
  vpc_id              = "vpc-0e3a39484c06c06f6"
  subnet_ids          = local.private_subnet_ids
  environment         = "prod"
  application_id      = "APM0003247"
  application_name    = "Global Data-Marketplace Xchange Platform"
  created_by_email    = "giovanni.austin@toyota.com"
  team                = "Data Marketplace Team"
  data_classification = "protected"
  app_team_oidc_arn   = data.aws_iam_role.pipeline.arn

  deletion_protection                  = true
  iam_roles_allowed_reading_db_secrets = [data.aws_iam_role.pipeline.name]
}

locals {
  database_name_requested = "GDXPAdminProd"
  database_name           = lower(local.database_name_requested)
  database_secret_arns = {
    DB_HOST     = module.database.database_parameter_arn_map["DATABASE_HOST"]
    DB_PORT     = module.database.database_parameter_arn_map["DATABASE_PORT"]
    DB_USER     = module.database.database_parameter_arn_map["DATABASE_USER"]
    DB_PASSWORD = "${module.database.database_parameter_arn_map["DATABASE_PASSWORD"]}:password::"
  }
}

resource "aws_security_group_rule" "database_from_admin" {
  for_each = module.admin

  description              = "Admin ${each.key} tasks to PostgreSQL"
  type                     = "ingress"
  from_port                = module.database.database_port
  to_port                  = module.database.database_port
  protocol                 = "tcp"
  security_group_id        = module.database.database_security_group_id
  source_security_group_id = each.value.ecs_service_security_group_id
}
