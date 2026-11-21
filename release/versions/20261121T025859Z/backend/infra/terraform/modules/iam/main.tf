
# Task execution role
resource "aws_iam_role" "task_exec" {
  name = "edmp-gdx-${var.env}-task-exec"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{ Effect = "Allow", Principal = { Service = ["ecs-tasks.amazonaws.com"] }, Action = ["sts:AssumeRole"] }]
  })
  tags = var.standard_tags
}
resource "aws_iam_role_policy_attachment" "exec_attach" {
  role       = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task role (least privilege to shared SQS/SNS; SES Send)
resource "aws_iam_role" "task" {
  name               = "edmp-gdx-${var.env}-task-role"
  assume_role_policy = aws_iam_role.task_exec.assume_role_policy
  tags               = var.standard_tags
}
resource "aws_iam_role_policy" "task_inline" {
  name = "edmp-gdx-${var.env}-task-inline"
  role = aws_iam_role.task.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      { Effect = "Allow", Action = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"], Resource = var.sqs_arn },
      { Effect = "Allow", Action = ["sns:Publish"], Resource = var.sns_arn },
      { Effect = "Allow", Action = ["ses:SendEmail", "ses:SendRawEmail"], Resource = "*" }
    ]
  })
}

resource "aws_iam_role_policy" "task_exec_secrets" {
  name = "edmp-gdx-${var.env}-task-exec-secrets"
  role = aws_iam_role.task_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [var.db_secret_arn]
      }
    ]
  })
}

output "task_execution_role_arn" { value = aws_iam_role.task_exec.arn }
output "task_role_arn" { value = aws_iam_role.task.arn }
