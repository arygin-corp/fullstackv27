# Production application security group and task roles.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/iam"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  app_security_group_name = "edmp-gdxp-admin-prod-app-sg"
  alb_security_group_name = "edmp-gdxp-admin-prod-alb-sg"
  db_security_group_name  = "edmp-gdxp-admin-prod-db-sg"
  secret_name             = "edmp-gdxp-admin-prod-runtime"
  execution_role_name     = "edmp-gdxp-admin-prod-execution-role"
  task_role_name          = "edmp-gdxp-admin-prod-task-role"
  frontend_policy_name    = "edmp-gdx-frontend-deployment-prod"
  frontend_buckets        = ["edmp-gdxp-prod"]
  admin_buckets           = ["edmp-gdxp-admin-prod"]
}
