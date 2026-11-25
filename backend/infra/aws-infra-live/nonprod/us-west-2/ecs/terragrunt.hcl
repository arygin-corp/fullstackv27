# Shared ECS cluster edmp-gdxp-admin-cluster.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/ecs-cluster"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_ecs_cluster.this
  id = "edmp-gdxp-admin-cluster"
}
import {
  to = aws_ecs_cluster_capacity_providers.this
  id = "edmp-gdxp-admin-cluster"
}
EOF
}

inputs = {
  cluster_name = "edmp-gdxp-admin-cluster"
}
