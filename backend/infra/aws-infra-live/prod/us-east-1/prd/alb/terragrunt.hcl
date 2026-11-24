# Production ALB and HTTPS listener.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/alb"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  load_balancer_name = "edmp-gdxp-admin-prod-alb"
}
