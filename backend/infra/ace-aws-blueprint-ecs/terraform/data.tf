data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

#NOTE: This data filter work only when you have standard VPC id with standard subnets, 
#      custom subnet's doesn't work. 

data "aws_subnets" "subnets" {
  count = length(var.lb_subnet_ids) != 0 ? 0 : 1

  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
  filter {
    name = "tag:Attributes"
    values = [
      var.is_lb_public ? "sn-public" : "sn-private"
    ]
  }
  filter {
    name   = "tag:Stage"
    values = [var.environment]
  }
}

data "aws_lb" "existing_lb" {
  count = var.existing_lb_name != null ? 1 : 0
  name  = var.existing_lb_name
}

data "aws_ecs_cluster" "ecs_cluster" {
  count        = !var.create_ecs_cluster ? 1 : 0
  cluster_name = local.cluster_name
}

data "aws_route53_zone" "route53_public_zone_id" {
  name = var.route53_zone_name
}