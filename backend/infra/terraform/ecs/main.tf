data "aws_iam_role" "pipeline" {
  name = "EDMP_gha_oidc_iam_role"
}

locals {
  private_subnet_ids = ["subnet-0c85c72661638ee5f", "subnet-09e44957f431cf0c4"]
  public_subnet_ids  = ["subnet-0377bd2b513381dd2", "subnet-0083e4d08f61267dc"]
  container_image    = var.container_image != null && var.container_image != "" ? var.container_image : "${aws_ecr_repository.admin.repository_url}:${var.image_tag}"
  redis_database = {
    demo  = 0
    dev   = 1
    qa    = 2
    stage = 3
  }
  environments = {
    demo = {
      hostname        = "admin.demo.data.toyota.com"
      cert_arn        = "arn:aws:acm:us-west-2:963334842848:certificate/708f155e-2918-45d3-8351-1d9dcb7ee62c"
      bucket          = "edmp-gdxp-nonprod-demo-admin"
      frontend_bucket = "edmp-nonprod-demo-gdx"
    }
    dev = {
      hostname        = "admin.dev.data.toyota.com"
      cert_arn        = "arn:aws:acm:us-west-2:963334842848:certificate/82a5f077-9a3f-4356-a5b7-a949b151e5ff"
      bucket          = "edmp-gdxp-nonprod-dev-admin"
      frontend_bucket = "edmp-nonprod-dev-gdx"
    }
    qa = {
      hostname        = "admin.qa.data.toyota.com"
      cert_arn        = "arn:aws:acm:us-west-2:963334842848:certificate/a5c31abf-0771-4cf2-976c-72fa90a6618f"
      bucket          = "edmp-gdxp-nonprod-qa-admin"
      frontend_bucket = "edmp-nonprod-qa-gdx"
    }
    stage = {
      hostname        = "admin.stage.data.toyota.com"
      cert_arn        = "arn:aws:acm:us-west-2:963334842848:certificate/cee1dbbd-3963-448a-8fc5-4ee24f4ab1c6"
      bucket          = "edmp-gdxp-nonprod-stage-admin"
      frontend_bucket = "edmp-nonprod-stage-gdx"
    }
  }
}

module "admin" {
  for_each = local.environments
  source   = "../../ace-aws-blueprint-ecs/terraform"

  vpc_id              = "vpc-064d050c9dc2f2863"
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
    GDXP_SECRET_KEY = module.app_secrets[each.key].secret_arns["django_secret_key"]
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
      AWS_REGION                = "us-west-2"
      AWS_STORAGE_BUCKET_NAME   = data.aws_s3_bucket.admin[each.key].id
      AWS_FRONTEND_BUCKET       = data.aws_s3_bucket.frontend[each.key].id
      DB_NAME                   = local.database_name
      DB_SSLMODE                = "require"
      RUN_MIGRATIONS            = "true"
      HEALTH_REDIS_REQUIRED     = "true"
      EMAIL_BACKEND             = "gdx.email.SesEmailBackend"
      AWS_SES_REGION            = "us-west-2"
      AWS_SES_CONFIGURATION_SET = aws_ses_configuration_set.mail.name
      DEFAULT_FROM_EMAIL        = "no-reply@${each.key}.data.toyota.com"
      SERVER_EMAIL              = "no-reply@${each.key}.data.toyota.com"
      REDIS_URL                 = "rediss://${module.redis.redis_primary_endpoint}:${module.redis.redis_port}/${local.redis_database[each.key]}"
      CELERY_BROKER_URL         = "rediss://${module.redis.redis_primary_endpoint}:${module.redis.redis_port}/${local.redis_database[each.key]}"
    }
  }]
}
