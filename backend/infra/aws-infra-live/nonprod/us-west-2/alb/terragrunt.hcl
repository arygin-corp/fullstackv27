# Shared internal ALB and HTTPS listener.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/alb"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_security_group.this
  id = "sg-0f49ee363c84036e2"
}
import {
  to = aws_lb.this
  id = "edmp-gdxp-admin-nonprod-alb"
}
import {
  to = aws_vpc_security_group_ingress_rule.https
  id = "sgr-0bff5bd59fe6a2cdb"
}
import {
  to = aws_vpc_security_group_egress_rule.app
  id = "sgr-04363ae9b609d9b07"
}
EOF
}

inputs = {
  load_balancer_name          = "edmp-gdxp-admin-nonprod-alb"
  security_group_name         = "edmp-gdxp-admin-alb-sg"
  certificate_arn             = "arn:aws:acm:us-west-2:963334842848:certificate/82a5f077-9a3f-4356-a5b7-a949b151e5ff"
  additional_certificate_arns = [
    "arn:aws:acm:us-west-2:963334842848:certificate/708f155e-2918-45d3-8351-1d9dcb7ee62c",
    "arn:aws:acm:us-west-2:963334842848:certificate/a5c31abf-0771-4cf2-976c-72fa90a6618f",
    "arn:aws:acm:us-west-2:963334842848:certificate/cee1dbbd-3963-448a-8fc5-4ee24f4ab1c6",
  ]
}
