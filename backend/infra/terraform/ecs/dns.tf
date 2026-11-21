data "aws_route53_zone" "admin" {
  name = "data.toyota.com"
}

resource "aws_route53_record" "admin" {
  for_each = local.environments

  zone_id = data.aws_route53_zone.admin.zone_id
  name    = each.value.hostname
  type    = "A"

  alias {
    name                   = module.admin[each.key].lb_dns_name
    zone_id                = module.admin[each.key].lb_zone_id
    evaluate_target_health = true
  }
}
