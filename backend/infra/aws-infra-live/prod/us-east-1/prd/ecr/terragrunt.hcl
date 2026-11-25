# Production ECR repository.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/ecr"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  repository_name = "edmp-gdxp-admin-prod-ecr"
}
