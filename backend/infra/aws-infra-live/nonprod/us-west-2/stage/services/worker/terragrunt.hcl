# stage worker service.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-worker"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-stage-worker"
}
