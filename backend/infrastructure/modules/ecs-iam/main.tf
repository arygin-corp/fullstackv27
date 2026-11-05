data "aws_iam_policy_document" "trust"{statement{actions=["sts:AssumeRole"];principals{type="Service";identifiers=["ecs-tasks.amazonaws.com"]}}}
resource "aws_iam_role" "execution"{name="${var.name_prefix}-execution-role";assume_role_policy=data.aws_iam_policy_document.trust.json;tags=merge(var.tags,{"tmna:environment"=var.environment})}
resource "aws_iam_role_policy_attachment" "execution"{role=aws_iam_role.execution.name;policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"}
data "aws_iam_policy_document" "execution_extra"{statement{actions=["secretsmanager:GetSecretValue"];resources=[var.secret_arn]}}
resource "aws_iam_role_policy" "execution_extra"{name="${var.name_prefix}-execution-extra";role=aws_iam_role.execution.id;policy=data.aws_iam_policy_document.execution_extra.json}
resource "aws_iam_role" "task"{name="${var.name_prefix}-task-role";assume_role_policy=data.aws_iam_policy_document.trust.json;tags=merge(var.tags,{"tmna:environment"=var.environment})}
data "aws_iam_policy_document" "task"{statement{actions=["s3:ListBucket"];resources=[var.bucket_arn]};statement{actions=["s3:GetObject","s3:PutObject","s3:DeleteObject"];resources=["${var.bucket_arn}/media/*","${var.bucket_arn}/data/*"]};statement{actions=["secretsmanager:GetSecretValue"];resources=[var.secret_arn]}}
resource "aws_iam_role_policy" "task"{name="${var.name_prefix}-task";role=aws_iam_role.task.id;policy=data.aws_iam_policy_document.task.json}
