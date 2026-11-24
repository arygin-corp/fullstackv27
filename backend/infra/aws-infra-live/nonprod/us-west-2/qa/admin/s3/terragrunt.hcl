# qa admin bucket edmp-nonprod-admin-qa-gdx.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/frontend-s3"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  bucket_name = "edmp-nonprod-admin-qa-gdx"
}
