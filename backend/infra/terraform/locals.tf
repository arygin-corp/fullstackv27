locals {
  nonprod_network = {
    account_id         = "963334842848"
    region             = "us-west-2"
    vpc_id             = "vpc-064d050c9dc2f2863"
    private_subnet_ids = ["subnet-0c85c72661638ee5f", "subnet-09e44957f431cf0c4"]
    public_subnet_ids  = ["subnet-0377bd2b513381dd2", "subnet-0083e4d08f61267dc"]
  }
  prod_network = {
    account_id         = "471550468381"
    region             = "us-east-1"
    vpc_id             = "vpc-0e3a39484c06c06f6"
    private_subnet_ids = ["subnet-0f17a22158c417984", "subnet-093645f1e69b538e6"]
    public_subnet_ids  = ["subnet-094126f3246d18324", "subnet-0430e3236dafb9506"]
  }

  envs = {
    demo = merge(local.nonprod_network, {
      group           = "nonprod"
      priority        = 1
      domain          = "admin.demo.data.toyota.com"
      angular_origin  = "https://demo.data.toyota.com"
      frontend_bucket = "edmp-gdxp-nonprod-demo-admin"
      certificate_arn = "arn:aws:acm:us-west-2:963334842848:certificate/708f155e-2918-45d3-8351-1d9dcb7ee62c"
      zone_id         = "Z0836512INFRJWXX8WDG"
      redis_db        = 0
      settings_module = "gdx.settings.demo"
      name_prefix     = "edmp-gdxp-admin-demo"
    })
    dev = merge(local.nonprod_network, {
      group           = "nonprod"
      priority        = 2
      domain          = "admin.dev.data.toyota.com"
      angular_origin  = "https://dev.data.toyota.com"
      frontend_bucket = "edmp-gdxp-nonprod-dev-admin"
      certificate_arn = "arn:aws:acm:us-west-2:963334842848:certificate/82a5f077-9a3f-4356-a5b7-a949b151e5ff"
      zone_id         = "Z05286522RI3CIPII1TYY"
      redis_db        = 1
      settings_module = "gdx.settings.dev"
      name_prefix     = "edmp-gdxp-admin-dev"
    })
    qa = merge(local.nonprod_network, {
      group           = "nonprod"
      priority        = 3
      domain          = "admin.qa.data.toyota.com"
      angular_origin  = "https://qa.data.toyota.com"
      frontend_bucket = "edmp-gdxp-nonprod-qa-admin"
      certificate_arn = "arn:aws:acm:us-west-2:963334842848:certificate/a5c31abf-0771-4cf2-976c-72fa90a6618f"
      zone_id         = "Z07056893PYOYHNHDX3X0"
      redis_db        = 2
      settings_module = "gdx.settings.qa"
      name_prefix     = "edmp-gdxp-admin-qa"
    })
    stage = merge(local.nonprod_network, {
      group           = "nonprod"
      priority        = 4
      domain          = "admin.stage.data.toyota.com"
      angular_origin  = "https://stage.data.toyota.com"
      frontend_bucket = "edmp-gdxp-nonprod-stage-admin"
      certificate_arn = "arn:aws:acm:us-west-2:963334842848:certificate/cee1dbbd-3963-448a-8fc5-4ee24f4ab1c6"
      zone_id         = "Z05445923VK2SSXZE0ZDV"
      redis_db        = 3
      settings_module = "gdx.settings.stage"
      name_prefix     = "edmp-gdxp-admin-stage"
    })
    prod = merge(local.prod_network, {
      group           = "prod"
      priority        = 1
      domain          = "admin.data.toyota.com"
      angular_origin  = "https://data.toyota.com"
      frontend_bucket = "edmp-gdxp-admin-use1-s3-web"
      certificate_arn = "arn:aws:acm:us-east-1:471550468381:certificate/b2cd2025-cb0f-4a22-9883-96676b35e301"
      zone_id         = "Z011351814R04VAHWC1K7"
      redis_db        = 0
      settings_module = "gdx.settings.prod"
      name_prefix     = "edmp-gdxp-admin-prod"
    })
  }

  shared = {
    nonprod = {
      environment      = "nonprod"
      cluster          = "edmp-gdxp-admin-cluster"
      ecr              = "edmp-gdxp-admin-ecr"
      alb              = "edmp-gdxp-admin-alb"
      alb_sg           = "edmp-gdxp-admin-alb-sg"
      db_subnets       = "edmp-gdxp-admin-db-subnets"
      db_identifier    = "edmp-gdxp-admin-nonprod"
      db_name          = "edmp_gdxp_admin_nonprod"
      db_sg            = "edmp-gdxp-admin-nonprod-db-sg"
      app_sg           = "edmp-gdxp-admin-nonprod-app-sg"
      redis            = "edmp-gdxp-admin-nonprod-redis"
      redis_sg         = "edmp-gdxp-admin-nonprod-redis-sg"
      redis_subnets    = "edmp-gdxp-admin-redis-subnets"
      secret_name      = "edmp-gdxp-admin-nonprod-runtime"
      execution_role   = "edmp-gdxp-admin-nonprod-execution-role"
      task_role        = "edmp-gdxp-admin-nonprod-task-role"
      frontend_policy  = "edmp-gdx-frontend-deployment-nonprod"
      frontend_attach  = true
      frontend_buckets = ["edmp-gdxp-nonprod-demo-admin", "edmp-gdxp-nonprod-dev-admin", "edmp-gdxp-nonprod-qa-admin", "edmp-gdxp-nonprod-stage-admin"]
    }
    prod = {
      environment      = "prod"
      cluster          = "edmp-gdxp-admin-prod-cluster"
      ecr              = "edmp-gdxp-admin-prod-ecr"
      alb              = "edmp-gdxp-admin-prod-alb"
      alb_sg           = "edmp-gdxp-admin-prod-alb-sg"
      db_subnets       = "edmp-gdxp-admin-prod-db-subnets"
      db_identifier    = "edmp-gdxp-admin-prod-rds"
      db_name          = "edmp_gdxp_admin_prod"
      db_sg            = "edmp-gdxp-admin-prod-db-sg"
      app_sg           = "edmp-gdxp-admin-prod-app-sg"
      redis            = "edmp-gdxp-admin-prod-redis"
      redis_sg         = "edmp-gdxp-admin-prod-redis-sg"
      redis_subnets    = "edmp-gdxp-admin-prod-redis-subnets"
      secret_name      = "edmp-gdxp-admin-prod-runtime"
      execution_role   = "edmp-gdxp-admin-prod-execution-role"
      task_role        = "edmp-gdxp-admin-prod-task-role"
      frontend_policy  = "edmp-gdx-frontend-deployment-prod"
      frontend_attach  = false
      frontend_buckets = ["edmp-gdxp-admin-use1-s3-web"]
    }
  }

  selected = local.envs[var.target_env]
  platform = local.shared[local.selected.group]

  common_tags = merge(var.standard_tags, {
    "tmna:environment"  = var.target_env
    "tmna:git_revision" = var.git_revision != "" ? var.git_revision : data.external.git.result.revision
    "tmna:timestamp"    = var.build_timestamp != "" ? var.build_timestamp : data.external.deployment.result.timestamp
  })

  cluster_arn             = var.manage_shared ? aws_ecs_cluster.shared[0].arn : data.aws_ecs_cluster.shared[0].arn
  ecr_url                 = var.manage_shared ? aws_ecr_repository.shared[0].repository_url : data.aws_ecr_repository.shared[0].repository_url
  alb_sg_id               = var.manage_shared ? aws_security_group.alb[0].id : data.aws_security_group.alb[0].id
  listener_arn            = var.manage_shared ? aws_lb_listener.https[0].arn : data.aws_lb_listener.https[0].arn
  alb_dns_name            = var.manage_shared ? aws_lb.shared[0].dns_name : data.aws_lb.shared[0].dns_name
  alb_zone_id             = var.manage_shared ? aws_lb.shared[0].zone_id : data.aws_lb.shared[0].zone_id
  db_subnet_group_name    = var.manage_shared ? aws_db_subnet_group.shared[0].name : data.aws_db_subnet_group.shared[0].name
  redis_subnet_group_name = var.manage_shared ? aws_elasticache_subnet_group.shared[0].name : data.aws_elasticache_subnet_group.shared[0].name
  db_sg_id                = var.manage_shared ? aws_security_group.db[0].id : data.aws_security_group.db[0].id
  db_host                 = var.manage_shared ? aws_db_instance.postgres[0].address : data.aws_db_instance.postgres[0].address
  app_sg_id               = var.manage_shared ? aws_security_group.app[0].id : data.aws_security_group.app[0].id
  redis_sg_id             = var.manage_shared ? aws_security_group.redis[0].id : data.aws_security_group.redis[0].id
  redis_host              = var.manage_shared ? aws_elasticache_replication_group.redis[0].primary_endpoint_address : data.aws_elasticache_replication_group.redis[0].primary_endpoint_address
  secret_arn              = var.manage_shared ? aws_secretsmanager_secret.runtime[0].arn : data.aws_secretsmanager_secret.runtime[0].arn
  execution_role_arn      = var.manage_shared ? aws_iam_role.execution[0].arn : data.aws_iam_role.execution[0].arn
  task_role_arn           = var.manage_shared ? aws_iam_role.task[0].arn : data.aws_iam_role.task[0].arn
  app_bucket_name         = aws_s3_bucket.frontend.id
  image_uri               = var.image_uri != "" ? var.image_uri : "${local.ecr_url}:${var.image_tag}"

  secret_values = {
    GDX_SECRET_KEY                            = var.gdx_secret_key
    DB_USER                                   = var.db_user
    DB_PASSWORD                               = var.db_password
    MICROSOFT_APP_SECRET                      = var.microsoft_app_secret
    PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET = var.peoplefinder_microsoft_auth_client_secret
    TDSP_PODS_USERNAME                        = var.tdsp_pods_username
    TDSP_PODS_PASSWORD                        = var.tdsp_pods_password
    MONITORING_TOKEN                          = var.monitoring_token
  }

  runtime = {
    APP_ENV                     = var.target_env
    DJANGO_SETTINGS_MODULE      = local.selected.settings_module
    DJANGO_ALLOWED_HOSTS        = local.selected.domain
    DJANGO_CSRF_TRUSTED_ORIGINS = "https://${local.selected.domain}"
    DJANGO_CORS_ALLOWED_ORIGINS = local.selected.angular_origin
    AWS_REGION                  = data.aws_region.current.region
    AWS_STORAGE_BUCKET_NAME     = local.app_bucket_name
    AWS_S3_MEDIA_PREFIX         = "${var.target_env}/media"
    AWS_S3_DATA_PREFIX          = "${var.target_env}/data"
    DB_HOST                     = local.db_host
    DB_PORT                     = "5432"
    DB_NAME                     = local.platform.db_name
    DB_SSLMODE                  = "require"
    REDIS_URL                   = "rediss://${local.redis_host}:6379/${local.selected.redis_db}"
    CELERY_BROKER_URL           = "rediss://${local.redis_host}:6379/${local.selected.redis_db}"
    CELERY_RESULT_BACKEND       = "django-db"
  }
}