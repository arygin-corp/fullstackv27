# demo web service edmp-gdxp-admin-demo-web.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-web"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-demo-web"
  admin_domain = "admin.demo.data.toyota.com"
}
