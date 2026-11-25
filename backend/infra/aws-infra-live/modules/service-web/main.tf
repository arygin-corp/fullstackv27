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

variable "service_name" {
  type = string
}
variable "image_tag" {
  type    = string
  default = "latest"
}
variable "cpu" {
  type    = string
  default = "1024"
}
variable "memory" {
  type    = string
  default = "2048"
}
variable "command" {
  type    = list(string)
  default = ["/app/scripts/web.sh"]
}
variable "log_retention_days" {
  type    = number
  default = 30
}

data "aws_ecs_cluster" "shared" { cluster_name = var.cluster_name }
data "aws_ecr_repository" "shared" { name = var.repository_name }
data "aws_security_group" "app" {
  name   = var.app_security_group_name
  vpc_id = var.vpc_id
}
data "aws_secretsmanager_secret" "runtime" { name = var.secret_name }
data "aws_iam_role" "execution" { name = var.execution_role_name }
data "aws_iam_role" "task" { name = var.task_role_name }
data "aws_db_instance" "postgres" { db_instance_identifier = var.db_identifier }
data "aws_elasticache_replication_group" "redis" { replication_group_id = var.redis_replication_group_id }

locals {
  image_uri = "${data.aws_ecr_repository.shared.repository_url}:${var.image_tag}"
  environment = [
    { name = "APP_ENV", value = var.app_env },
    { name = "DJANGO_SETTINGS_MODULE", value = var.settings_module },
    { name = "DJANGO_ALLOWED_HOSTS", value = var.admin_domain },
    { name = "DJANGO_CSRF_TRUSTED_ORIGINS", value = "https://${var.admin_domain}" },
    { name = "DJANGO_CORS_ALLOWED_ORIGINS", value = "https://${var.angular_domain}" },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "AWS_STORAGE_BUCKET_NAME", value = var.frontend_bucket },
    { name = "AWS_S3_MEDIA_PREFIX", value = "${var.app_env}/media" },
    { name = "AWS_S3_DATA_PREFIX", value = "${var.app_env}/data" },
    { name = "DB_HOST", value = data.aws_db_instance.postgres.address },
    { name = "DB_PORT", value = "5432" },
    { name = "DB_NAME", value = var.db_name },
    { name = "DB_SSLMODE", value = "require" },
    { name = "REDIS_URL", value = "rediss://${data.aws_elasticache_replication_group.redis.primary_endpoint_address}:6379/${var.redis_database}" },
    { name = "CELERY_BROKER_URL", value = "rediss://${data.aws_elasticache_replication_group.redis.primary_endpoint_address}:6379/${var.redis_database}" },
    { name = "CELERY_RESULT_BACKEND", value = "django-db" },
  ]
  secret_keys = [
    "GDXP_SECRET_KEY",
    "DB_USER",
    "DB_PASSWORD",
    "MICROSOFT_APP_SECRET",
    "PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET",
    "TDSP_PODS_USERNAME",
    "TDSP_PODS_PASSWORD",
    "MONITORING_TOKEN",
  ]
  secrets = [for key in local.secret_keys : {
    name      = key
    valueFrom = "${data.aws_secretsmanager_secret.runtime.arn}:${key}::"
  }]
}

data "aws_lb" "shared" { name = var.load_balancer_name }
data "aws_lb_listener" "https" {
  load_balancer_arn = data.aws_lb.shared.arn
  port              = 443
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.service_name}"
  retention_in_days = var.log_retention_days
  tags              = local.tags
}

resource "aws_cloudwatch_log_group" "migration" {
  name              = "/ecs/${replace(var.service_name, "-web", "-migration")}"
  retention_in_days = var.log_retention_days
  tags              = local.tags
}

resource "aws_lb_target_group" "web" {
  name                 = replace(var.service_name, "-web", "-tg")
  port                 = 8000
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = var.vpc_id
  deregistration_delay = 30
  health_check {
    enabled             = true
    path                = "/api/health/ready/"
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
  tags = local.tags
}

resource "aws_lb_listener_rule" "web" {
  listener_arn = data.aws_lb_listener.https.arn
  priority     = var.listener_priority
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
  condition {
    host_header { values = [var.admin_domain] }
  }
}

resource "aws_ecs_task_definition" "this" {
  family                   = var.service_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = data.aws_iam_role.execution.arn
  task_role_arn            = data.aws_iam_role.task.arn
  container_definitions = jsonencode([{
    name         = var.service_name
    image        = local.image_uri
    essential    = true
    command      = var.command
    portMappings = [{ containerPort = 8000, hostPort = 8000, protocol = "tcp" }]
    environment  = local.environment
    secrets      = local.secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.this.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
  tags = local.tags
}

resource "aws_ecs_task_definition" "migration" {
  family                   = replace(var.service_name, "-web", "-migration")
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = data.aws_iam_role.execution.arn
  task_role_arn            = data.aws_iam_role.task.arn
  container_definitions = jsonencode([{
    name        = replace(var.service_name, "-web", "-migration")
    image       = local.image_uri
    essential   = true
    command     = ["/app/scripts/migrate.sh"]
    environment = local.environment
    secrets     = local.secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.migration.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
  tags = local.tags
}

resource "aws_ecs_service" "this" {
  name                               = var.service_name
  cluster                            = data.aws_ecs_cluster.shared.arn
  task_definition                    = aws_ecs_task_definition.this.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  enable_execute_command             = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [data.aws_security_group.app.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = var.service_name
    container_port   = 8000
  }
  tags = local.tags
  lifecycle { ignore_changes = [task_definition] }
  depends_on = [aws_lb_listener_rule.web]
}
