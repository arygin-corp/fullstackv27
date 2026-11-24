# Shared database edmp-gdxp-admin-nonprod-rds.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/rds"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  identifier = "edmp-gdxp-admin-nonprod-rds"
}
