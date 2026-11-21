module "cw_monitoring" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/monitoring?ref=v47.3.3"

  count = var.enable_alarms ? 1 : 0

  name_prefix         = var.name_prefix
  blueprint_type      = local.blueprint_type
  service_name        = var.name
  custom_alarms       = local.all_alarms
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
  environment         = var.environment
  team                = var.team
  custom_tags         = var.custom_tags
}

