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

variable "alb_security_group_name" {
  type = string
}
variable "db_security_group_name" {
  type = string
}
variable "frontend_policy_name" {
  type = string
}
variable "frontend_buckets" {
  type = list(string)
}
variable "admin_buckets" {
  type = list(string)
}

data "aws_security_group" "alb" {
  name   = var.alb_security_group_name
  vpc_id = var.vpc_id
}

data "aws_secretsmanager_secret" "runtime" {
  name = var.secret_name
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

resource "aws_security_group" "app" {
  name        = var.app_security_group_name
  description = "GDXP Admin application"
  vpc_id      = var.vpc_id
  tags        = merge(local.tags, { Name = var.app_security_group_name })
}

resource "aws_security_group" "db" {
  name        = var.db_security_group_name
  description = "GDXP Admin PostgreSQL"
  vpc_id      = var.vpc_id
  tags        = merge(local.tags, { Name = var.db_security_group_name })
  lifecycle { ignore_changes = [description, ingress, egress] }
}

resource "aws_vpc_security_group_ingress_rule" "app" {
  security_group_id            = aws_security_group.app.id
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = data.aws_security_group.alb.id
}

resource "aws_vpc_security_group_ingress_rule" "db" {
  security_group_id            = aws_security_group.db.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.app.id
}

resource "aws_vpc_security_group_egress_rule" "https" {
  security_group_id = aws_security_group.app.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "db" {
  security_group_id            = aws_security_group.app.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.db.id
}

resource "aws_iam_role" "execution" {
  name               = var.execution_role_name
  assume_role_policy = data.aws_iam_policy_document.ecs_trust.json
  tags               = local.tags
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execution_secrets" {
  name = "${var.execution_role_name}-extra"
  role = aws_iam_role.execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [data.aws_secretsmanager_secret.runtime.arn]
    }]
  })
}

resource "aws_iam_role" "task" {
  name               = var.task_role_name
  assume_role_policy = data.aws_iam_policy_document.ecs_trust.json
  tags               = local.tags
}

resource "aws_iam_role_policy" "task" {
  name = var.task_role_name
  role = aws_iam_role.task.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [for bucket in concat(var.frontend_buckets, var.admin_buckets) : "arn:aws:s3:::${bucket}"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = [for bucket in concat(var.frontend_buckets, var.admin_buckets) : "arn:aws:s3:::${bucket}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [data.aws_secretsmanager_secret.runtime.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = ["*"]
      },
    ]
  })
}

resource "aws_iam_policy" "frontend" {
  name = var.frontend_policy_name
  tags = local.tags
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListBuckets"
        Effect   = "Allow"
        Action   = ["s3:ListBucket", "s3:GetBucketLocation"]
        Resource = [for bucket in concat(var.frontend_buckets, var.admin_buckets) : "arn:aws:s3:::${bucket}"]
      },
      {
        Sid      = "ManageObjects"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = [for bucket in concat(var.frontend_buckets, var.admin_buckets) : "arn:aws:s3:::${bucket}/*"]
      },
    ]
  })
}
