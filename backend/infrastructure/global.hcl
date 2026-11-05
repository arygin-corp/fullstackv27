locals {
  app_id              = "APM0003247"
  app_name            = "Data Marketplace Xchange Platform"
  created_by_email    = "giovanni.austin@toyota.com"
  git_url             = "https://github.com/Toyota-Motor-North-America/edmp-aws-infra-live"
  team                = "Data Marketplace Team"
  data_classification = "Protected"
  git_revision        = get_env("GIT_REVISION", "not-supplied")
  blueprint_sources   = get_env("CHOFER_BLUEPRINT_NAME", "local-v10-baseline")
  timestamp           = get_env("DEPLOYMENT_TIMESTAMP", "not-supplied")
}
