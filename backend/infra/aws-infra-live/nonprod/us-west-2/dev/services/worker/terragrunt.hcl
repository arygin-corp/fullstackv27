# dev worker service.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-worker"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_ecs_service.this
  id = "edmp-gdxp-admin-cluster/edmp-gdxp-admin-dev-worker"
}
import {
  to = aws_cloudwatch_log_group.this
  id = "/ecs/edmp-gdxp-admin-dev-worker"
}
EOF
}

inputs = {
  service_name = "edmp-gdxp-admin-dev-worker"
}
