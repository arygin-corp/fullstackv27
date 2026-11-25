locals {
  environment = "dev"
  app_env = "dev"
  route53_zone_name = "dev.data.toyota.com"
  angular_domain = "dev.data.toyota.com"
  admin_domain = "admin.dev.data.toyota.com"
  frontend_bucket = "edmp-nonprod-dev-gdx"
  admin_bucket = "edmp-nonprod-admin-dev-gdx"
  vpc_id = "vpc-064d050c9dc2f2863"
  zone_id = "Z05286522RI3CIPII1TYY"
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
  settings_module = "gdx.settings.dev"
  redis_database = 1
  listener_priority = 2
}
