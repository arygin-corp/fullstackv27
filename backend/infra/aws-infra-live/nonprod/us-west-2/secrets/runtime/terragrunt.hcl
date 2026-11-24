# Shared runtime secret edmp-gdxp-admin-nonprod-runtime.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/runtime-secret"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  secret_name = "edmp-gdxp-admin-nonprod-runtime"
}
