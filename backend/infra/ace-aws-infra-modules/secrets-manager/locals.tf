locals {
  _aws_region_tokens = split("-", data.aws_region.current.region)
  region_cd          = "${local._aws_region_tokens[0]}${substr(local._aws_region_tokens[1], 0, 1)}${substr(local._aws_region_tokens[2], 0, 1)}"

  kms_key_name = "${var.environment}-${local.region_cd}-${var.application_id}-${replace(var.application_name, " ", "-")}-${var.resource_slug}-key"

  rotation_lambdas = {
    for k, v in var.secrets : k => v.existing_rotation_lambda_name
    if v.existing_rotation_lambda_name != null
  }

  rotation_lambda_permissions = {
    for k, v in var.secrets : "${k}-${v.existing_rotation_lambda_name}" => {
      secret_key  = k
      lambda_name = v.existing_rotation_lambda_name
    }
    if v.existing_rotation_lambda_name != null
  }

  rotation_lambda_arns = var.existing_rotation_lambda_arn != null ? {
    for key, secret in var.secrets : key => var.existing_rotation_lambda_arn
    } : {
    for key, function in data.aws_lambda_function.rotation_lambdas : key => function.arn
  }

  rotation_lambda_role_names = var.existing_rotation_lambda_role_name != null ? {
    for key, secret in var.secrets : key => var.existing_rotation_lambda_role_name
    } : {
    for key, function in data.aws_lambda_function.rotation_lambdas : key => (
      length(split("/", function.role)) == 2 ? split("/", function.role)[1] : split("/", function.role)[2]
    )
  }
}