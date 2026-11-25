# qa web service.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-web"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-qa-web"
}
