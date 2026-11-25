# Production Redis.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/redis"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  replication_group_id    = "edmp-gdxp-admin-prod-redis"
  use_existing_network    = false
  redis_security_group_name = "edmp-gdxp-admin-prod-redis-sg"
  redis_subnet_group_name   = "edmp-gdxp-admin-prod-redis-subnets"
  app_security_group_name   = "edmp-gdxp-admin-prod-app-sg"
}
