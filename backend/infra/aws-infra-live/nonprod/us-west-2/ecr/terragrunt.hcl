# Shared ECR edmp-gdxp-admin-ecr.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/ecr"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_ecr_repository.this
  id = "edmp-gdxp-admin-ecr"
}
import {
  to = aws_ecr_lifecycle_policy.this
  id = "edmp-gdxp-admin-ecr"
}
EOF
}

inputs = {
  repository_name = "edmp-gdxp-admin-ecr"
}
