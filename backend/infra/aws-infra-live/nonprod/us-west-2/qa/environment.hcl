locals {
  environment = "qa"
  app_env = "qa"
  route53_zone_name = "qa.data.toyota.com"
  angular_domain = "qa.data.toyota.com"
  admin_domain = "admin.qa.data.toyota.com"
  frontend_bucket = "edmp-nonprod-qa-gdx"
  admin_bucket = "edmp-nonprod-admin-qa-gdx"
  vpc_id = "vpc-064d050c9dc2f2863"
  zone_id = "Z07056893PYOYHNHDX3X0"
  private_subnet_ids = ["subnet-0c85c72661638ee5f", "subnet-09e44957f431cf0c4"]

  cluster_name = "edmp-gdxp-admin-cluster"
  repository_name = "edmp-gdxp-admin-ecr"
  load_balancer_name = "edmp-gdxp-admin-nonprod-alb"
  app_security_group_name = "edmp-gdxp-admin-nonprod-app-sg"
  secret_name = "edmp-gdxp-admin-nonprod-runtime"
  execution_role_name = "edmp-gdxp-admin-nonprod-execution-role"
  task_role_name = "edmp-gdxp-admin-nonprod-task-role"
  db_identifier = "edmp-gdxp-admin-nonprod-rds"
  db_name = "edmp_gdxp_admin_nonprod"
  redis_replication_group_id = "edmp-gdxp-admin-nonprod-redis"
  settings_module = "gdx.settings.qa"
  redis_database = 2
  listener_priority = 3
}
