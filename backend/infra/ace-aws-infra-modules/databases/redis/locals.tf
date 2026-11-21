locals {
  aws_region_tokens = split("-", data.aws_region.current.region)
  region_cd         = "${local.aws_region_tokens[0]}${substr(local.aws_region_tokens[1], 0, 1)}${substr(local.aws_region_tokens[2], 0, 1)}"
  blueprint_type    = "redis"
  all_alarms = merge(
    var.custom_alarms
  )
  private_subnet_ids = length(var.subnet_ids) > 0 ? var.subnet_ids : data.aws_subnets.private.ids
  log_delivery_configuration = var.existing_cloudwatch_log_group == null ? {
    destination      = module.cloudwatch_logs[0].log_group_name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
    } : {
    destination      = var.existing_cloudwatch_log_group
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }
}