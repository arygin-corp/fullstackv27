# dev web service edmp-gdxp-admin-dev-web.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/service-web"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_lb_target_group.web
  id = "arn:aws:elasticloadbalancing:us-west-2:963334842848:targetgroup/edmp-gdxp-admin-dev-tg/163a913ee935663c"
}
import {
  to = aws_cloudwatch_log_group.this
  id = "/ecs/edmp-gdxp-admin-dev-web"
}
import {
  to = aws_cloudwatch_log_group.migration
  id = "/ecs/edmp-gdxp-admin-dev-migration"
}
EOF
}

inputs = {
  service_name = "edmp-gdxp-admin-dev-web"
}
