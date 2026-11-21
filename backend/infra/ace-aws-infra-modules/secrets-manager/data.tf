data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

data "aws_lambda_function" "rotation_lambdas" {
  for_each = var.existing_rotation_lambda_arn == null ? local.rotation_lambdas : {}

  function_name = each.value
}