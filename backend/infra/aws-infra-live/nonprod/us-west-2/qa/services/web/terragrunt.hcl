# qa web service edmp-gdxp-admin-qa-web.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-web"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  service_name = "edmp-gdxp-admin-qa-web"
  admin_domain = "admin.qa.data.toyota.com"
}
