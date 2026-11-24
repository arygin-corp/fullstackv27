# Production beat service.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-beat"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-prod-beat"
}
