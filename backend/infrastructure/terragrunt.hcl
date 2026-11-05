locals {
  account = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = ">= 1.5.0, < 2.0.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}
provider "aws" {
  region = "${local.account.locals.aws_region}"
  default_tags { tags = {
    "tmna:app-id" = "APM0003247"
    "tmna:app-name" = "Data Marketplace Xchange Platform"
    "tmna:created-by-email" = "giovanni.austin@toyota.com"
    "tmna:git_url" = "https://github.com/Toyota-Motor-North-America/edmp-aws-infra-live"
    "tmna:team" = "Data Marketplace Team"
    "tmna:data_classification" = "Protected"
  } }
}
EOF
}
remote_state {
  backend = "s3"
  config = {
    bucket       = local.account.locals.tfstate_bucket
    key          = "gdx/${path_relative_to_include()}/terraform.tfstate"
    region       = local.account.locals.aws_region
    encrypt      = true
    use_lockfile = true
  }
}
