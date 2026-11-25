# Shared application security group and task roles.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/iam"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_security_group.app
  id = "sg-0585c48ea82a09778"
}
import {
  to = aws_security_group.db
  id = "sg-0e961e20de4a8335b"
}
import {
  to = aws_vpc_security_group_ingress_rule.app
  id = "sgr-0cac59da396e58d91"
}
import {
  to = aws_vpc_security_group_ingress_rule.db
  id = "sgr-01782d8630edbce6b"
}
import {
  to = aws_vpc_security_group_egress_rule.https
  id = "sgr-06f90a5cd8191c6e6"
}
import {
  to = aws_vpc_security_group_egress_rule.db
  id = "sgr-0fcce2a8cfca89d4d"
}
import {
  to = aws_iam_role.execution
  id = "edmp-gdxp-admin-nonprod-execution-role"
}
import {
  to = aws_iam_role.task
  id = "edmp-gdxp-admin-nonprod-task-role"
}
import {
  to = aws_iam_policy.frontend
  id = "arn:aws:iam::963334842848:policy/edmp-gdx-frontend-deployment-nonprod"
}
import {
  to = aws_iam_role_policy_attachment.execution
  id = "edmp-gdxp-admin-nonprod-execution-role/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
import {
  to = aws_iam_role_policy.execution_secrets
  id = "edmp-gdxp-admin-nonprod-execution-role:edmp-gdxp-admin-nonprod-execution-role-extra"
}
import {
  to = aws_iam_role_policy.task
  id = "edmp-gdxp-admin-nonprod-task-role:edmp-gdxp-admin-nonprod-task-role"
}
EOF
}

inputs = {
  app_security_group_name = "edmp-gdxp-admin-nonprod-app-sg"
  alb_security_group_name = "edmp-gdxp-admin-alb-sg"
  db_security_group_name  = "edmp-gdxp-admin-nonprod-db-sg"
  secret_name             = "edmp-gdxp-admin-nonprod-runtime"
  execution_role_name     = "edmp-gdxp-admin-nonprod-execution-role"
  task_role_name          = "edmp-gdxp-admin-nonprod-task-role"
  frontend_policy_name    = "edmp-gdx-frontend-deployment-nonprod"
  frontend_buckets        = ["edmp-nonprod-demo-gdx", "edmp-nonprod-dev-gdx", "edmp-nonprod-qa-gdx", "edmp-nonprod-stage-gdx"]
  admin_buckets           = ["edmp-nonprod-admin-demo-gdx", "edmp-nonprod-admin-dev-gdx", "edmp-nonprod-admin-qa-gdx", "edmp-nonprod-admin-stage-gdx"]
}
