# modules/alb/main.tf
resource "aws_lb" "this" {
  name               = "edmp-gdx-${var.env}-alb"
  internal           = true # Set to true for Private ALB
  load_balancer_type = "application"
  subnets            = var.private_subnet_ids # Using Private Subnets
  security_groups    = [var.alb_security_group_id]
  tags               = var.standard_tags
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.alb_certificate_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Access Denied"
      status_code  = "403"
    }
  }
}

output "listener_arn" {
  value = aws_lb_listener.https.arn
}