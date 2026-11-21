module "redis" {
  source = "../../ace-aws-infra-modules/databases/redis"

  name            = "admin"
  name_prefix     = "edmp-gdxp"
  service_name    = "admin"
  resource_slug   = "admin"
  environment     = "prod"
  infra_live_repo = "ace-aws-infra-modules"

  vpc_id        = "vpc-0e3a39484c06c06f6"
  subnet_ids    = local.private_subnet_ids
  instance_type = "cache.t3.micro"

  enable_single_instance_mode = true
  enable_transit_encryption   = true
  enable_at_rest_encryption   = true

  team                = "Data Marketplace Team"
  data_classification = "protected"
  application_id      = "APM0003247"
  application_name    = "Global Data-Marketplace Xchange Platform"
  created_by_email    = "giovanni.austin@toyota.com"
  app_team_oidc_arn   = data.aws_iam_role.pipeline.arn
}

resource "aws_security_group_rule" "redis_from_admin" {
  for_each = module.admin

  description              = "Admin ${each.key} tasks to Redis"
  type                     = "ingress"
  from_port                = module.redis.redis_port
  to_port                  = module.redis.redis_port
  protocol                 = "tcp"
  security_group_id        = module.redis.redis_security_group_id
  source_security_group_id = each.value.ecs_service_security_group_id
}
