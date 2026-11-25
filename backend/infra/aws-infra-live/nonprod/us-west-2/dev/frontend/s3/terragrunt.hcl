# dev Angular frontend bucket edmp-nonprod-dev-gdx.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/frontend-s3"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_s3_bucket.this
  id = "edmp-nonprod-dev-gdx"
}
EOF
}

inputs = {
  bucket_name = "edmp-nonprod-dev-gdx"
}
