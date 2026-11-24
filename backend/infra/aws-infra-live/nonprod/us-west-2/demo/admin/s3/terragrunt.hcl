# demo admin bucket edmp-nonprod-admin-demo-gdx.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/frontend-s3"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  bucket_name = "edmp-nonprod-admin-demo-gdx"
}
