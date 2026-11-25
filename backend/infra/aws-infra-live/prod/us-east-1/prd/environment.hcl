locals {
  environment = "prd"
  app_env = "prod"
  route53_zone_name = "data.toyota.com"
  angular_domain = "data.toyota.com"
  admin_domain = "admin.data.toyota.com"
  frontend_bucket = "edmp-gdxp-prod"
  admin_bucket = "edmp-gdxp-admin-prod"
  vpc_id = "vpc-0e3a39484c06c06f6"
  zone_id = "Z011351814R04VAHWC1K7"
  private_subnet_ids = ["subnet-0f17a22158c417984", "subnet-093645f1e69b538e6"]

  cluster_name = "edmp-gdxp-admin-prod-cluster"
  repository_name = "edmp-gdxp-admin-prod-ecr"
  load_balancer_name = "edmp-gdxp-admin-prod-alb"
  app_security_group_name = "edmp-gdxp-admin-prod-app-sg"
  secret_name = "edmp-gdxp-admin-prod-runtime"
  execution_role_name = "edmp-gdxp-admin-prod-execution-role"
  task_role_name = "edmp-gdxp-admin-prod-task-role"
  db_identifier = "edmp-gdxp-admin-prod-rds"
  db_name = "gdxpadminprod"
  redis_replication_group_id = "edmp-gdxp-admin-prod-redis"
  settings_module = "gdx.settings.prod"
  redis_database = 0
  listener_priority = 1
}
