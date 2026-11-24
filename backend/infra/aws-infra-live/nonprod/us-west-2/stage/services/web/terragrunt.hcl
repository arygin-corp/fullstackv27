# stage web service edmp-gdxp-admin-stage-web.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-web"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-stage-web"
  admin_domain = "admin.stage.data.toyota.com"
}
