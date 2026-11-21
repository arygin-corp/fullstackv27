locals {
  container_size_map = {
    "S"   = { "cpu" : "256", "memory" : "512" }
    "M"   = { "cpu" : "512", "memory" : "1024" }
    "L"   = { "cpu" : "1024", "memory" : "2048" }
    "XL"  = { "cpu" : "2048", "memory" : "4096" }
    "XXL" = { "cpu" : "4096", "memory" : "8192" }
  }
}

locals {
  # These two lines allow us to infer aws region code from the current aws region instead of needing an additional var that could be different and cause errors
  _aws_region_tokens                 = split("-", data.aws_region.current.region)
  aws_region_cd                      = "${local._aws_region_tokens[0]}${substr(local._aws_region_tokens[1], 0, 1)}${substr(local._aws_region_tokens[2], 0, 1)}"
  use_nlb                            = var.create_lb && var.lb_type == "network"
  use_alb                            = var.create_lb && var.lb_type == "application"
  use_db                             = var.db_name != null
  use_existing_nlb                   = !var.create_lb && var.existing_lb_name != null && var.lb_type == "network"
  use_existing_alb                   = !var.create_lb && var.existing_lb_name != null && var.lb_type == "application"
  https_listener_ports_and_ssl_certs = local.is_using_lb ? [{ port = var.https_listener_port, tls_arn = local.acm_certificate_arn }] : null
  lb_arn                             = local.use_nlb ? module.nlb[0].nlb_arn : (local.use_alb ? module.alb[0].alb_arn : "")
  cluster_name                       = var.cluster_name == null ? "${var.service_name}-cluster" : var.cluster_name
  route53_cname                      = var.route53_cname != null ? var.route53_cname : var.service_name
  route53_zone_name                  = var.route53_private_zone ? var.route53_zone_name_private : var.route53_zone_name
  fqdn                               = (var.fqdn != null && var.fqdn != "") ? var.fqdn : (var.route53_cname != null ? "${var.route53_cname}.${local.route53_zone_name}" : "${var.service_name}.${local.route53_zone_name}")
  lb_subnet_ids                      = length(var.lb_subnet_ids) != 0 ? var.lb_subnet_ids : data.aws_subnets.subnets[0].ids
  resource_slug                      = (var.resource_slug != null && var.resource_slug != "") ? format("-%s", var.resource_slug) : ""
  constructed_service_name           = "${var.name_prefix}-${var.environment}-${local.aws_region_cd}-${var.service_name}${local.resource_slug}"
  cloudwatch_log_group               = var.cloudwatch_log_group != null ? var.cloudwatch_log_group : local.constructed_service_name

  health_check_protocol = var.lb_type == "application" && var.health_check_protocol == "TCP" ? "HTTP" : var.health_check_protocol
  protocol              = var.lb_type == "application" && var.protocol == "TCP" ? "HTTP" : var.protocol
  is_using_lb           = local.use_nlb || local.use_alb || local.use_existing_nlb || local.use_existing_alb

  ##create new cert only if using LB and no existing cert provided
  create_new_acm_cert = local.is_using_lb && length(var.existing_acm_certificate_arn) == 0

  # acm_cert logic to handle no LB scenario 
  acm_certificate_arn = local.is_using_lb ? (local.create_new_acm_cert ? module.acm_tls_certificate[0].certificate_arns[0] : var.existing_acm_certificate_arn) : null

  allow_inbound_from_security_groups = concat(local.use_nlb ? module.nlb[0].security_group_id : [], var.allow_inbound_from_security_groups)
}

