# Shared ECS execution and task roles.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/iam"
}

include {
  path = find_in_parent_folders()
}
