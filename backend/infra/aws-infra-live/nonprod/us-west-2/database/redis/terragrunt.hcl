# Shared Redis edmp-gdxp-admin-nonprod-redis.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/redis"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  replication_group_id = "edmp-gdxp-admin-nonprod-redis"
}
