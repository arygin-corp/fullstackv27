data "aws_s3_bucket" "admin" {
  for_each = local.environments

  bucket = each.value.bucket
}

data "aws_s3_bucket" "frontend" {
  for_each = local.environments

  bucket = each.value.frontend_bucket
}

resource "aws_iam_role_policy" "admin_bucket" {
  for_each = module.admin

  name = "admin-bucket"
  role = each.value.ecs_task_iam_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = data.aws_s3_bucket.admin[each.key].arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = "${data.aws_s3_bucket.admin[each.key].arn}/*"
      },
    ]
  })
}

resource "aws_iam_role_policy" "frontend_bucket" {
  for_each = module.admin

  name = "frontend-bucket"
  role = each.value.ecs_task_iam_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = data.aws_s3_bucket.frontend[each.key].arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = "${data.aws_s3_bucket.frontend[each.key].arn}/*"
      },
    ]
  })
}
