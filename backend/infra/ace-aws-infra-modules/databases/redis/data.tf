data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_subnets" "private" {
  filter {
    name   = "tag:Attributes"
    values = [local.private_subnet_attribute]
  }

  filter {
    name   = "tag:Type"
    values = ["private"]
  }

  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
}

data "aws_vpc" "vpc" {
  id = var.vpc_id
}