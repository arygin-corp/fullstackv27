#############################################
# Account resources shared by every environment.
# The first apply creates them. Later environments set manage_shared = false.
#############################################

resource "aws_ecs_cluster" "shared" {
  count = var.manage_shared ? 1 : 0
  name  = local.platform.cluster

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_ecs_cluster_capacity_providers" "shared" {
  count              = var.manage_shared ? 1 : 0
  cluster_name       = aws_ecs_cluster.shared[0].name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

resource "aws_ecr_repository" "shared" {
  count                = var.manage_shared ? 1 : 0
  name                 = local.platform.ecr
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_ecr_lifecycle_policy" "shared" {
  count      = var.manage_shared ? 1 : 0
  repository = aws_ecr_repository.shared[0].name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "retain latest 50 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 50
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_security_group" "alb" {
  count       = var.manage_shared ? 1 : 0
  name        = local.platform.alb_sg
  description = "GDXP Admin internal ALB"
  vpc_id      = local.selected.vpc_id

  tags = merge(local.common_tags, {
    Name               = local.platform.alb_sg
    "tmna:environment" = local.platform.environment
  })
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  count             = var.manage_shared ? 1 : 0
  security_group_id = aws_security_group.alb[0].id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_app" {
  count             = var.manage_shared ? 1 : 0
  security_group_id = aws_security_group.alb[0].id
  from_port         = 8000
  to_port           = 8000
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_lb" "shared" {
  count                      = var.manage_shared ? 1 : 0
  name                       = local.platform.alb
  internal                   = true
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.alb[0].id]
  subnets                    = local.selected.private_subnet_ids
  enable_deletion_protection = true
  drop_invalid_header_fields = true

  tags = merge(local.common_tags, { "tmna:environment" = local.platform.environment })

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb_listener" "https" {
  count             = var.manage_shared ? 1 : 0
  load_balancer_arn = aws_lb.shared[0].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = local.selected.certificate_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_certificate" "additional" {
  for_each = var.manage_shared ? {
    for name, env in local.envs : name => env.certificate_arn
    if env.group == local.selected.group && env.certificate_arn != local.selected.certificate_arn
  } : {}

  listener_arn    = aws_lb_listener.https[0].arn
  certificate_arn = each.value
}

resource "aws_wafv2_web_acl_association" "alb" {
  count        = var.manage_shared && var.waf_web_acl_arn != "" ? 1 : 0
  resource_arn = aws_lb.shared[0].arn
  web_acl_arn  = var.waf_web_acl_arn
}

resource "aws_db_subnet_group" "shared" {
  count      = var.manage_shared ? 1 : 0
  name       = local.platform.db_subnets
  subnet_ids = local.selected.private_subnet_ids
  tags       = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_elasticache_subnet_group" "shared" {
  count      = var.manage_shared ? 1 : 0
  name       = local.platform.redis_subnets
  subnet_ids = local.selected.private_subnet_ids
}

data "aws_iam_policy_document" "frontend_deploy" {
  count = var.manage_shared ? 1 : 0

  statement {
    sid       = "ListBuckets"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [for bucket in local.platform.frontend_buckets : "arn:aws:s3:::${bucket}"]
  }

  statement {
    sid       = "ManageObjects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = [for bucket in local.platform.frontend_buckets : "arn:aws:s3:::${bucket}/*"]
  }
}

resource "aws_iam_policy" "frontend_deploy" {
  count  = var.manage_shared ? 1 : 0
  name   = local.platform.frontend_policy
  policy = data.aws_iam_policy_document.frontend_deploy[0].json
  tags   = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

data "aws_iam_role" "frontend_deploy" {
  count = var.manage_shared && local.platform.frontend_attach ? 1 : 0
  name  = "EDMP_gha_oidc_iam_role"
}

resource "aws_iam_role_policy_attachment" "frontend_deploy" {
  count      = var.manage_shared && local.platform.frontend_attach ? 1 : 0
  role       = data.aws_iam_role.frontend_deploy[0].name
  policy_arn = aws_iam_policy.frontend_deploy[0].arn
}

data "aws_ecs_cluster" "shared" {
  count        = var.manage_shared ? 0 : 1
  cluster_name = local.platform.cluster
}

data "aws_ecr_repository" "shared" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.ecr
}

data "aws_security_group" "alb" {
  count  = var.manage_shared ? 0 : 1
  name   = local.platform.alb_sg
  vpc_id = local.selected.vpc_id
}

data "aws_lb" "shared" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.alb
}

data "aws_lb_listener" "https" {
  count             = var.manage_shared ? 0 : 1
  load_balancer_arn = data.aws_lb.shared[0].arn
  port              = 443
}

data "aws_db_subnet_group" "shared" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.db_subnets
}

data "aws_elasticache_subnet_group" "shared" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.redis_subnets
}

#############################################
# This environment
#############################################

resource "aws_s3_bucket" "frontend" {
  bucket        = local.selected.frontend_bucket
  force_destroy = false
  tags          = merge(local.common_tags, { "tmna:environment" = var.target_env })

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "frontend" {
  bucket     = aws_s3_bucket.frontend.id
  depends_on = [aws_s3_bucket_versioning.frontend]

  rule {
    id     = "release-archives"
    status = "Enabled"
    filter { prefix = "_releases/" }
    expiration { days = 180 }
    noncurrent_version_expiration { noncurrent_days = 30 }
  }

  rule {
    id     = "rollback-archives"
    status = "Enabled"
    filter { prefix = "_rollback/releases/" }
    expiration { days = 365 }
    noncurrent_version_expiration { noncurrent_days = 30 }
  }

  rule {
    id     = "multipart"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }
}

data "aws_iam_policy_document" "frontend_tls" {
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.frontend.arn,
      "${aws_s3_bucket.frontend.arn}/*",
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }

  statement {
    sid       = "TaskRoleAccess"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.frontend.arn]
    principals {
      type        = "AWS"
      identifiers = [local.task_role_arn]
    }
  }

  statement {
    sid       = "TaskRoleObjectAccess"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
    principals {
      type        = "AWS"
      identifiers = [local.task_role_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_tls.json
}

resource "aws_security_group" "app" {
  count       = var.manage_shared ? 1 : 0
  name        = local.platform.app_sg
  description = "GDXP Admin application"
  vpc_id      = local.selected.vpc_id
  tags        = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_security_group" "db" {
  count       = var.manage_shared ? 1 : 0
  name        = local.platform.db_sg
  description = "GDXP Admin PostgreSQL"
  vpc_id      = local.selected.vpc_id
  tags        = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_security_group" "redis" {
  count       = var.manage_shared ? 1 : 0
  name        = local.platform.redis_sg
  description = "GDXP Admin Redis"
  vpc_id      = local.selected.vpc_id
  tags        = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_vpc_security_group_ingress_rule" "app" {
  count                        = var.manage_shared ? 1 : 0
  security_group_id            = aws_security_group.app[0].id
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = local.alb_sg_id
}

resource "aws_vpc_security_group_ingress_rule" "db" {
  count                        = var.manage_shared ? 1 : 0
  security_group_id            = local.db_sg_id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.app[0].id
}

resource "aws_vpc_security_group_ingress_rule" "redis" {
  count                        = var.manage_shared ? 1 : 0
  security_group_id            = aws_security_group.redis[0].id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.app[0].id
}

resource "aws_vpc_security_group_egress_rule" "app_https" {
  count             = var.manage_shared ? 1 : 0
  security_group_id = aws_security_group.app[0].id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "app_db" {
  count                        = var.manage_shared ? 1 : 0
  security_group_id            = aws_security_group.app[0].id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = local.db_sg_id
}

resource "aws_vpc_security_group_egress_rule" "app_redis" {
  count                        = var.manage_shared ? 1 : 0
  security_group_id            = aws_security_group.app[0].id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.redis[0].id
}

resource "aws_secretsmanager_secret" "runtime" {
  count                   = var.manage_shared ? 1 : 0
  name                    = local.platform.secret_name
  recovery_window_in_days = 30
  tags                    = merge(local.common_tags, { "tmna:environment" = local.platform.environment })

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_secretsmanager_secret_version" "runtime" {
  count         = var.manage_shared ? 1 : 0
  secret_id     = aws_secretsmanager_secret.runtime[0].id
  secret_string = jsonencode(local.secret_values)
}

resource "aws_db_instance" "postgres" {
  count                       = var.manage_shared ? 1 : 0
  identifier                  = local.platform.db_identifier
  engine                      = "postgres"
  engine_version              = "17"
  allow_major_version_upgrade = true
  instance_class              = local.platform.db_instance_class
  allocated_storage           = local.platform.db_allocated_storage
  max_allocated_storage       = local.platform.db_max_allocated_storage
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = local.platform.db_name
  username                    = var.db_user
  password                    = var.db_password
  port                        = 5432
  db_subnet_group_name        = local.db_subnet_group_name
  vpc_security_group_ids      = [local.db_sg_id]
  multi_az                    = true
  publicly_accessible         = false
  backup_retention_period     = 7
  deletion_protection         = true
  skip_final_snapshot         = false
  final_snapshot_identifier   = "${local.platform.db_identifier}-final"
  copy_tags_to_snapshot       = true
  auto_minor_version_upgrade  = true
  apply_immediately           = false
  tags                        = merge(local.common_tags, { "tmna:environment" = local.platform.environment })

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [password]
  }
}

data "aws_security_group" "db" {
  count  = var.manage_shared ? 0 : 1
  name   = local.platform.db_sg
  vpc_id = local.selected.vpc_id
}

data "aws_db_instance" "postgres" {
  count                  = var.manage_shared ? 0 : 1
  db_instance_identifier = local.platform.db_identifier
}

data "aws_security_group" "app" {
  count  = var.manage_shared ? 0 : 1
  name   = local.platform.app_sg
  vpc_id = local.selected.vpc_id
}

data "aws_security_group" "redis" {
  count  = var.manage_shared ? 0 : 1
  name   = local.platform.redis_sg
  vpc_id = local.selected.vpc_id
}

data "aws_elasticache_replication_group" "redis" {
  count                = var.manage_shared ? 0 : 1
  replication_group_id = local.platform.redis
}

data "aws_secretsmanager_secret" "runtime" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.secret_name
}

data "aws_secretsmanager_secret" "database" {
  name = local.platform.db_secret_name
}

data "aws_iam_role" "execution" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.execution_role
}

data "aws_iam_role" "task" {
  count = var.manage_shared ? 0 : 1
  name  = local.platform.task_role
}

resource "aws_elasticache_replication_group" "redis" {
  count                      = var.manage_shared ? 1 : 0
  replication_group_id       = local.platform.redis
  description                = local.platform.redis
  engine                     = "redis"
  node_type                  = "cache.t4g.small"
  port                       = 6379
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  subnet_group_name          = local.redis_subnet_group_name
  security_group_ids         = [aws_security_group.redis[0].id]
  snapshot_retention_limit   = 7
  apply_immediately          = false
  tags                       = merge(local.common_tags, { "tmna:environment" = local.platform.environment })

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_iam_policy_document" "ecs_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  count              = var.manage_shared ? 1 : 0
  name               = local.platform.execution_role
  assume_role_policy = data.aws_iam_policy_document.ecs_trust.json
  tags               = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_iam_role_policy_attachment" "execution" {
  count      = var.manage_shared ? 1 : 0
  role       = aws_iam_role.execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execution_secrets" {
  count = var.manage_shared ? 1 : 0
  name  = "${local.platform.execution_role}-extra"
  role  = aws_iam_role.execution[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        aws_secretsmanager_secret.runtime[0].arn,
        data.aws_secretsmanager_secret.database.arn,
      ]
    }]
  })
}

resource "aws_iam_role" "task" {
  count              = var.manage_shared ? 1 : 0
  name               = local.platform.task_role
  assume_role_policy = data.aws_iam_policy_document.ecs_trust.json
  tags               = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_iam_role_policy" "task" {
  count = var.manage_shared ? 1 : 0
  name  = local.platform.task_role
  role  = aws_iam_role.task[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [for bucket in local.platform.frontend_buckets : "arn:aws:s3:::${bucket}"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = [for bucket in local.platform.frontend_buckets : "arn:aws:s3:::${bucket}/*"]
      },
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = [
          aws_secretsmanager_secret.runtime[0].arn,
          data.aws_secretsmanager_secret.database.arn,
        ]
      },
    ]
  })
}

module "ses" {
  count             = var.manage_shared ? 1 : 0
  source            = "./modules/ses"
  domains           = local.platform.ses_domains
  configuration_set = local.platform.ses_configuration_set
  name_prefix       = "edmp-gdxp-admin-${local.platform.environment}"
  buckets           = local.platform.frontend_buckets
  standard_tags     = merge(local.common_tags, { "tmna:environment" = local.platform.environment })
}

resource "aws_lb_target_group" "web" {
  name                 = "${local.selected.name_prefix}-tg"
  port                 = 8000
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = local.selected.vpc_id
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

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_lb_listener_rule" "web" {
  listener_arn = local.listener_arn
  priority     = local.selected.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }

  condition {
    host_header {
      values = [local.selected.domain]
    }
  }
}

locals {
  container_environment = [for key, value in local.runtime : { name = key, value = value }]
  container_secrets = concat(
    [for key in keys(local.secret_values) : {
      name      = key
      valueFrom = "${local.secret_arn}:${key}::"
    }],
    [{
      name      = "DB_PASSWORD"
      valueFrom = "${data.aws_secretsmanager_secret.database.arn}:password::"
    }]
  )
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${local.selected.name_prefix}-web"
  retention_in_days = var.log_retention_days
  tags              = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/${local.selected.name_prefix}-worker"
  retention_in_days = var.log_retention_days
  tags              = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_cloudwatch_log_group" "beat" {
  name              = "/ecs/${local.selected.name_prefix}-beat"
  retention_in_days = var.log_retention_days
  tags              = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_cloudwatch_log_group" "migration" {
  name              = "/ecs/${local.selected.name_prefix}-migration"
  retention_in_days = var.log_retention_days
  tags              = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${local.selected.name_prefix}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.web_cpu
  memory                   = var.web_memory
  execution_role_arn       = local.execution_role_arn
  task_role_arn            = local.task_role_arn

  container_definitions = jsonencode([{
    name      = "${local.selected.name_prefix}-web"
    image     = local.image_uri
    essential = true
    command   = ["/app/scripts/web.sh"]
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
      protocol      = "tcp"
    }]
    environment = local.container_environment
    secrets     = local.container_secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.web.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_ecs_service" "web" {
  name                               = "${local.selected.name_prefix}-web"
  cluster                            = local.cluster_arn
  task_definition                    = aws_ecs_task_definition.web.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  enable_execute_command             = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = local.selected.private_subnet_ids
    security_groups  = [local.app_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "${local.selected.name_prefix}-web"
    container_port   = 8000
  }

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })

  lifecycle {
    ignore_changes = [task_definition]
  }
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "${local.selected.name_prefix}-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.worker_cpu
  memory                   = var.worker_memory
  execution_role_arn       = local.execution_role_arn
  task_role_arn            = local.task_role_arn

  container_definitions = jsonencode([{
    name        = "${local.selected.name_prefix}-worker"
    image       = local.image_uri
    essential   = true
    command     = ["/app/scripts/worker.sh"]
    environment = local.container_environment
    secrets     = local.container_secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.worker.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_ecs_service" "worker" {
  name                               = "${local.selected.name_prefix}-worker"
  cluster                            = local.cluster_arn
  task_definition                    = aws_ecs_task_definition.worker.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  enable_execute_command             = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = local.selected.private_subnet_ids
    security_groups  = [local.app_sg_id]
    assign_public_ip = false
  }

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })

  lifecycle {
    ignore_changes = [task_definition]
  }
}

resource "aws_ecs_task_definition" "beat" {
  family                   = "${local.selected.name_prefix}-beat"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = local.execution_role_arn
  task_role_arn            = local.task_role_arn

  container_definitions = jsonencode([{
    name        = "${local.selected.name_prefix}-beat"
    image       = local.image_uri
    essential   = true
    command     = ["/app/scripts/beat.sh"]
    environment = local.container_environment
    secrets     = local.container_secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.beat.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_ecs_service" "beat" {
  name                               = "${local.selected.name_prefix}-beat"
  cluster                            = local.cluster_arn
  task_definition                    = aws_ecs_task_definition.beat.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  enable_execute_command             = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = local.selected.private_subnet_ids
    security_groups  = [local.app_sg_id]
    assign_public_ip = false
  }

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })

  lifecycle {
    ignore_changes = [task_definition]
  }
}

resource "aws_ecs_task_definition" "migration" {
  family                   = "${local.selected.name_prefix}-migration"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = local.execution_role_arn
  task_role_arn            = local.task_role_arn

  container_definitions = jsonencode([{
    name        = "${local.selected.name_prefix}-migration"
    image       = local.image_uri
    essential   = true
    command     = ["/app/scripts/migrate.sh"]
    environment = local.container_environment
    secrets     = local.container_secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.migration.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])

  tags = merge(local.common_tags, { "tmna:environment" = var.target_env })
}

resource "aws_route53_record" "admin" {
  count   = local.selected.zone_id != "" ? 1 : 0
  zone_id = local.selected.zone_id
  name    = local.selected.domain
  type    = "A"

  alias {
    name                   = local.alb_dns_name
    zone_id                = local.alb_zone_id
    evaluate_target_health = true
  }
}
