# Production internal ALB and HTTPS listener.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/alb"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  load_balancer_name  = "edmp-gdxp-admin-prod-alb"
  security_group_name = "edmp-gdxp-admin-prod-alb-sg"
  certificate_arn     = "arn:aws:acm:us-east-1:471550468381:certificate/b2cd2025-cb0f-4a22-9883-96676b35e301"
}
