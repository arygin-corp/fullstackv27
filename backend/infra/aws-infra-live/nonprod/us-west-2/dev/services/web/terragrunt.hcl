# dev web service edmp-gdxp-admin-dev-web.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-web"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-dev-web"
  admin_domain = "admin.dev.data.toyota.com"
}
