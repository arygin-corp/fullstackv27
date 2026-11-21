locals {
  celery_processes = merge([
    for env, cfg in local.environments : {
      "${env}-worker" = {
        environment = env
        process     = "worker"
        command     = "/app/scripts/worker.sh"
        desired     = 1
        cpu         = "512"
        memory      = "1024"
        min_percent = 100
        max_percent = 200
      }
      "${env}-beat" = {
        environment = env
        process     = "beat"
        command     = "/app/scripts/beat.sh"
        desired     = 1
        cpu         = "256"
        memory      = "512"
        min_percent = 0
        max_percent = 100
      }
    }
  ]...)
}

resource "aws_security_group" "celery" {
  for_each = local.celery_processes

  name        = "edmp-gdxp-admin-${each.value.environment}-${each.value.process}"
  description = "GDXP admin ${each.value.environment} Celery ${each.value.process}"
  vpc_id      = "vpc-0e3a39484c06c06f6"

  egress {
    description = "AWS APIs, Redis, and PostgreSQL"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "redis_from_celery" {
  for_each = local.celery_processes

  description              = "Admin ${each.value.environment} ${each.value.process} to Redis"
  type                     = "ingress"
  from_port                = module.redis.redis_port
  to_port                  = module.redis.redis_port
  protocol                 = "tcp"
  security_group_id        = module.redis.redis_security_group_id
  source_security_group_id = aws_security_group.celery[each.key].id
}

resource "aws_security_group_rule" "database_from_celery" {
  for_each = local.celery_processes

  description              = "Admin ${each.value.environment} ${each.value.process} to PostgreSQL"
  type                     = "ingress"
  from_port                = module.database.database_port
  to_port                  = module.database.database_port
  protocol                 = "tcp"
  security_group_id        = module.database.database_security_group_id
  source_security_group_id = aws_security_group.celery[each.key].id
}

resource "aws_cloudwatch_log_group" "celery" {
  for_each = local.celery_processes

  name              = "edmp-gdxp-${each.value.environment}-use1-admin-${each.value.process}"
  retention_in_days = 30
  kms_key_id        = module.admin[each.value.environment].kms_key_arn
}

resource "aws_ecs_task_definition" "celery" {
  for_each = local.celery_processes

  family                   = "edmp-gdxp-admin-${each.value.environment}-${each.value.process}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = module.admin[each.value.environment].ecs_task_execution_iam_role_arn
  task_role_arn            = module.admin[each.value.environment].ecs_task_iam_role_arn

  container_definitions = jsonencode([{
    name      = each.value.process
    image     = local.container_image
    essential = true
    command   = [each.value.command]
    environment = [
      { name = "DJANGO_SETTINGS_MODULE", value = "gdx.settings.${each.value.environment}" },
      { name = "DJANGO_ENV", value = each.value.environment },
      { name = "APP_ENV", value = each.value.environment },
      { name = "AWS_REGION", value = "us-east-1" },
      { name = "AWS_STORAGE_BUCKET_NAME", value = data.aws_s3_bucket.admin[each.value.environment].id },
      { name = "DB_NAME", value = local.database_name },
      { name = "DB_SSLMODE", value = "require" },
      { name = "RUN_MIGRATIONS", value = "false" },
      { name = "COLLECT_STATIC", value = "false" },
      { name = "EMAIL_BACKEND", value = "gdx.email.SesEmailBackend" },
      { name = "AWS_SES_REGION", value = "us-east-1" },
      { name = "AWS_SES_CONFIGURATION_SET", value = aws_ses_configuration_set.mail.name },
      { name = "DEFAULT_FROM_EMAIL", value = local.environments[each.value.environment].mail_from },
      { name = "SERVER_EMAIL", value = local.environments[each.value.environment].mail_from },
      { name = "REDIS_URL", value = "rediss://${module.redis.redis_primary_endpoint}:${module.redis.redis_port}/${local.redis_database[each.value.environment]}" },
      { name = "CELERY_BROKER_URL", value = "rediss://${module.redis.redis_primary_endpoint}:${module.redis.redis_port}/${local.redis_database[each.value.environment]}" },
    ]
    secrets = [
      { name = "DB_HOST", valueFrom = local.database_secret_arns["DB_HOST"] },
      { name = "DB_PORT", valueFrom = local.database_secret_arns["DB_PORT"] },
      { name = "DB_USER", valueFrom = local.database_secret_arns["DB_USER"] },
      { name = "DB_PASSWORD", valueFrom = local.database_secret_arns["DB_PASSWORD"] },
      { name = "GDXP_SECRET_KEY", valueFrom = module.app_secrets[each.value.environment].secret_arns["django_secret_key"] },
      { name = "MONITORING_TOKEN", valueFrom = module.app_secrets[each.value.environment].secret_arns["monitoring_token"] },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.celery[each.key].name
        awslogs-region        = "us-east-1"
        awslogs-stream-prefix = each.value.process
      }
    }
  }])
}

resource "aws_ecs_service" "celery" {
  for_each = local.celery_processes

  name            = "admin-${each.value.environment}-${each.value.process}"
  cluster         = module.admin[each.value.environment].ecs_cluster_arn
  task_definition = aws_ecs_task_definition.celery[each.key].arn
  desired_count   = each.value.desired
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = each.value.min_percent
  deployment_maximum_percent         = each.value.max_percent

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = local.private_subnet_ids
    security_groups  = [aws_security_group.celery[each.key].id]
    assign_public_ip = false
  }
}
