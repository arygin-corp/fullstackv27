data "aws_iam_role" "pipeline" {
  name = "EDMP_gha_oidc_iam_role"
}

locals {
  private_subnet_ids = ["subnet-0f17a22158c417984", "subnet-093645f1e69b538e6"]
  public_subnet_ids  = ["subnet-094126f3246d18324", "subnet-0430e3236dafb9506"]
  container_image    = var.container_image != null && var.container_image != "" ? var.container_image : "${aws_ecr_repository.admin.repository_url}:${var.image_tag}"
  redis_database = {
    prod = 0
  }
  environments = {
    prod = {
      hostname        = "admin.data.toyota.com"
      cert_arn        = "arn:aws:acm:us-east-1:471550468381:certificate/b2cd2025-cb0f-4a22-9883-96676b35e301"
      bucket          = "edmp-gdxp-admin-prod"
      frontend_bucket = "edmp-gdxp-prod"
      mail_from       = "no-reply@data.toyota.com"
    }
  }
}

module "admin" {
  for_each = local.environments
  source   = "../../ace-aws-blueprint-ecs/terraform"

  vpc_id              = "vpc-0e3a39484c06c06f6"
  name_prefix         = "edmp-gdxp"
  service_name        = "admin-${each.key}"
  environment         = each.key
  data_classification = "protected"
  application_id      = "APM0003247"
  application_name    = "Global Data-Marketplace Xchange Platform"
  created_by_email    = "giovanni.austin@toyota.com"
  app_team_oidc_arn   = data.aws_iam_role.pipeline.arn

  ecs_service_launch_type           = "FARGATE"
  create_ecs_cluster                = true
  task_T_shirt_size                 = "L"
  private_subnet_ids                = local.private_subnet_ids
  lb_subnet_ids                     = local.public_subnet_ids
  is_lb_public                      = true
  lb_type                           = "application"
  http_port                         = 8000
  lb_container_name                 = "admin"
  health_check_path                 = "/api/health/ready/"
  health_check_grace_period_seconds = 180
  route53_zone_name                 = "data.toyota.com"
  fqdn                              = each.value.hostname
  existing_acm_certificate_arn      = each.value.cert_arn

  outbound_protocol    = "tcp"
  outbound_from_port   = 0
  outbound_to_port     = 65535
  ecr_repository_names = [aws_ecr_repository.admin.name]

  additional_ecs_secret_arns = merge(local.database_secret_arns, {
    GDXP_SECRET_KEY  = module.app_secrets[each.key].secret_arns["django_secret_key"]
    MONITORING_TOKEN = module.app_secrets[each.key].secret_arns["monitoring_token"]
  })

  containers = [{
    name      = "admin"
    image     = local.container_image
    http_port = 8000
    cpu       = 1024
    memory    = 2048
    env_vars = {
      DJANGO_SETTINGS_MODULE    = "gdx.settings.${each.key}"
      DJANGO_ENV                = each.key
      APP_ENV                   = each.key
      AWS_REGION                = "us-east-1"
      AWS_STORAGE_BUCKET_NAME   = data.aws_s3_bucket.admin[each.key].id
      AWS_FRONTEND_BUCKET       = data.aws_s3_bucket.frontend[each.key].id
      DB_NAME                   = local.database_name
      DB_SSLMODE                = "require"
      RUN_MIGRATIONS            = "true"
      HEALTH_REDIS_REQUIRED     = "true"
      EMAIL_BACKEND             = "gdx.email.SesEmailBackend"
      AWS_SES_REGION            = "us-east-1"
      AWS_SES_CONFIGURATION_SET = aws_ses_configuration_set.mail.name
      DEFAULT_FROM_EMAIL        = each.value.mail_from
      SERVER_EMAIL              = each.value.mail_from
      REDIS_URL                 = "rediss://${module.redis.redis_primary_endpoint}:${module.redis.redis_port}/${local.redis_database[each.key]}"
      CELERY_BROKER_URL         = "rediss://${module.redis.redis_primary_endpoint}:${module.redis.redis_port}/${local.redis_database[each.key]}"
    }
  }]
}
