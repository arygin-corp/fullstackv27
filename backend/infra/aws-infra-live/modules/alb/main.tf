locals {
  tags = {
    "tmna:app-id"           = var.application_id
    "tmna:app-name"         = var.application_name
    "tmna:environment"      = var.app_env != "" ? var.app_env : var.environment
    "tmna:classification"   = "Protected"
    "tmna:created-by-email" = "giovanni.austin@toyota.com"
    "tmna:team"             = "Data Marketplace Team"
    "tmna:git_url"          = "https://github.com/Toyota-Motor-North-America/edmp-global-marketplace-xchange-platform"
  }
}

variable "security_group_name" {
  type = string
}
variable "certificate_arn" {
  type = string
}
variable "additional_certificate_arns" {
  type    = list(string)
  default = []
}

resource "aws_security_group" "this" {
  name        = var.security_group_name
  description = "GDXP Admin internal ALB"
  vpc_id      = var.vpc_id
  tags        = merge(local.tags, { Name = var.security_group_name })
  lifecycle { ignore_changes = [description, ingress, egress] }
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.this.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "app" {
  security_group_id = aws_security_group.this.id
  from_port         = 8000
  to_port           = 8000
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_lb" "this" {
  name                       = var.load_balancer_name
  internal                   = true
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.this.id]
  subnets                    = var.private_subnet_ids
  enable_deletion_protection = true
  drop_invalid_header_fields = true
  tags                       = local.tags
  lifecycle { prevent_destroy = true }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_certificate" "additional" {
  for_each        = toset(var.additional_certificate_arns)
  listener_arn    = aws_lb_listener.https.arn
  certificate_arn = each.value
}
