# Production SES identity.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/ses"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  domains           = ["data.toyota.com"]
  configuration_set = "edmp-gdxp-admin-prod-mail"
}
