
# CloudWatch Logs groups
resource "aws_cloudwatch_log_group" "web" { name = "/ecs/edmp-gdx-${var.env}-web" retention_in_days = var.log_retention_days tags = var.standard_tags }
resource "aws_cloudwatch_log_group" "worker" { name = "/ecs/edmp-gdx-${var.env}-worker" retention_in_days = var.log_retention_days tags = var.standard_tags }

# Target group for web (IP mode, Fargate)
resource "aws_lb_target_group" "web" {
  name        = "tg-edmp-gdx-${substr(var.env,0,8)}-web"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  health_check { path = "/healthz" matcher = "200-399" interval = 30 timeout = 5 healthy_threshold = 2 unhealthy_threshold = 2 }
  tags = var.standard_tags
}

# Listener rule for path-based routing
resource "aws_lb_listener_rule" "path" {
  listener_arn = var.alb_listener_arn
  priority     = 200 + (var.env == "demo" ? 1 : var.env == "dev" ? 2 : var.env == "qa" ? 3 : var.env == "stage" ? 4 : 5)
  action { type = "forward" target_group_arn = aws_lb_target_group.web.arn }
  condition { path_pattern { values = [var.path_prefix] } }
}

# Data sources to fetch cluster/roles created elsewhere
data "aws_ecs_cluster" "cluster" { cluster_name = var.cluster_name }

# Link to IAM from separate module by naming convention (optional lookup could be added)
# For now, expect roles to exist and be passed in or attached later in higher level orchestration.

# Task definitions
resource "aws_ecs_task_definition" "web" {
  family                   = "edmp-gdx-${var.env}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.web_cpu
  memory                   = var.web_memory
  execution_role_arn       = aws_iam_role.task_exec.arn
  task_role_arn            = aws_iam_role.task.arn
  container_definitions = jsonencode([
    {
      name  = "web",
      image = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.ecr_repo}:${var.image_tag}",
      essential = true,
      portMappings = [{ containerPort = 8000, protocol = "tcp" }],
      environment = [
        { name = "AWS_REGION",     value = data.aws_region.current.name },
        { name = "SQS_QUEUE_URL",  value = "${var.shared_sqs_arn}" },
        { name = "SNS_TOPIC_ARN",  value = "${var.shared_sns_arn}" },
        { name = "SES_FROM_EMAIL", value = "no-reply@notify.example.com" }
      ],
      secrets = [
        {
          name      = "DATABASE_URL",
          valueFrom = var.db_secret_arn
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group  = aws_cloudwatch_log_group.web.name,
          awslogs-region = data.aws_region.current.name,
          awslogs-stream-prefix = "web"
        }
      }
    }
  ])
  tags = var.standard_tags
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "edmp-gdx-${var.env}-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.worker_cpu
  memory                   = var.worker_memory
  execution_role_arn       = aws_iam_role.task_exec.arn
  task_role_arn            = aws_iam_role.task.arn
  container_definitions = jsonencode([
    {
      name  = "worker",
      image = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.ecr_repo}:${var.image_tag}",
      essential = true,
      command = ["python","manage.py","process_sqs_messages"],
      environment = [
        { name = "AWS_REGION",    value = data.aws_region.current.name },
        { name = "SQS_QUEUE_URL", value = "${var.shared_sqs_arn}" }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group  = aws_cloudwatch_log_group.worker.name,
          awslogs-region = data.aws_region.current.name,
          awslogs-stream-prefix = "worker"
        }
      }
    }
  ])
  tags = var.standard_tags
}

# ECS Services
resource "aws_ecs_service" "web" {
  name            = "edmp-gdx-${var.env}-web"
  cluster         = data.aws_ecs_cluster.cluster.arn
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration { subnets = var.private_subnet_ids security_groups = [var.service_sg_id] assign_public_ip = false }
  load_balancer { target_group_arn = aws_lb_target_group.web.arn container_name = "web" container_port = 8000 }
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  tags = var.standard_tags
}

resource "aws_ecs_service" "worker" {
  name            = "edmp-gdx-${var.env}-worker"
  cluster         = data.aws_ecs_cluster.cluster.arn
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration { subnets = var.private_subnet_ids security_groups = [var.service_sg_id] assign_public_ip = false }
  tags = var.standard_tags
}

# Minimal IAM roles inside module for self-containment (can be replaced by module.iam outputs)
resource "aws_iam_role" "task_exec" {
  name = "edmp-gdx-${var.env}-task-exec"
  assume_role_policy = jsonencode({ Version="2012-10-17", Statement=[{Effect="Allow", Principal={Service=["ecs-tasks.amazonaws.com"]}, Action=["sts:AssumeRole"]}]})
  tags = var.standard_tags
}
resource "aws_iam_role_policy_attachment" "task_exec_attach" { role = aws_iam_role.task_exec.name policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" }
resource "aws_iam_role" "task" { name = "edmp-gdx-${var.env}-task-role" assume_role_policy = aws_iam_role.task_exec.assume_role_policy tags = var.standard_tags }
resource "aws_iam_role_policy" "task_inline" {
  role = aws_iam_role.task.id
  policy = jsonencode({ Version="2012-10-17", Statement=[
    {Effect:"Allow", Action:["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"], Resource: var.shared_sqs_arn},
    {Effect:"Allow", Action:["sns:Publish"], Resource: var.shared_sns_arn},
    {Effect:"Allow", Action:["ses:SendEmail","ses:SendRawEmail"], Resource: "*"}
  ]})
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

output "cluster_name" { value = var.cluster_name }
output "service_names" { value = [aws_ecs_service.web.name, aws_ecs_service.worker.name] }
output "web_tg_arn" { value = aws_lb_target_group.web.arn }
