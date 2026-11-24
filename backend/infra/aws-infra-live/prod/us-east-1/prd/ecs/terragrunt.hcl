# Production ECS cluster.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/ecs-cluster"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  cluster_name = "edmp-gdxp-admin-prod-cluster"
}
