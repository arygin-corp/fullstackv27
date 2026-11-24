# Production Angular frontend bucket edmp-gdxp-prod.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/frontend-s3"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  bucket_name = "edmp-gdxp-prod"
}
