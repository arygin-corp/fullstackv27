locals {
  environment = "demo"
  app_env = "demo"
  route53_zone_name = "demo.data.toyota.com"
  angular_domain = "demo.data.toyota.com"
  admin_domain = "admin.demo.data.toyota.com"
  frontend_bucket = "edmp-nonprod-demo-gdx"
  admin_bucket = "edmp-nonprod-admin-demo-gdx"
  vpc_id = "vpc-064d050c9dc2f2863"
  zone_id = "Z0836512INFRJWXX8WDG"
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
  settings_module = "gdx.settings.demo"
  redis_database = 0
  listener_priority = 1
}
