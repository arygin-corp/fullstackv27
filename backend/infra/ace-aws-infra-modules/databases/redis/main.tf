module "redis" {
  source = "git::git@github.com:Toyota-Motor-North-America/chofer-gw-terraform-aws-cache.git//modules/redis?ref=v1.0.4"

  # Required parameters
  instance_type = var.instance_type
  name          = module.naming_helpers["name"].names[64]
  vpc_id        = var.vpc_id
  subnet_ids    = local.private_subnet_ids

  # Cluster configuration
  replication_group_size    = var.replication_group_size
  enable_automatic_failover = var.enable_automatic_failover
  enable_multi_az           = var.enable_multi_az
  num_node_groups           = var.num_node_groups
  replicas_per_node_group   = var.replicas_per_node_group

  # Security configuration
  enable_at_rest_encryption              = var.enable_at_rest_encryption
  enable_single_instance_mode            = var.enable_single_instance_mode
  enable_transit_encryption              = var.enable_transit_encryption
  allow_connections_from_cidr_blocks     = var.allow_connections_from_cidr_blocks
  allow_connections_from_security_groups = var.allow_connections_from_security_groups
  additional_security_group_ids          = var.additional_security_group_ids
  sns_topic_for_notifications            = var.sns_topic_for_notifications
  kms_key_id                             = local.kms_key_arn

  # Redis configuration
  redis_version            = var.redis_version
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window          = var.snapshot_window
  maintenance_window       = var.maintenance_window
  port                     = var.port
  apply_immediately        = var.apply_immediately
  parameter_group_name     = var.parameter_group_name

  tags = module.standard_tags.tags

  security_group_tags = var.security_group_tags

  # Optional configuration
  aws_elasticache_subnet_group_name          = module.naming_helpers["subnet_group"].names[64]
  aws_elasticache_subnet_group_description   = var.aws_elasticache_subnet_group_description
  aws_elasticache_security_group_name        = module.naming_helpers["security_group"].names[64]
  aws_elasticache_security_group_description = var.aws_elasticache_security_group_description
  snapshot_name                              = var.snapshot_name
  snapshot_arn                               = var.snapshot_arn

  # Log delivery configuration
  log_delivery_configuration = local.log_delivery_configuration

  # Auto scaling configuration
  enable_auto_scaling                    = var.enable_auto_scaling
  auto_scale_dimension                   = var.auto_scale_dimension
  auto_scale_trigger_metric              = var.auto_scale_trigger_metric
  auto_scale_trigger_metric_target_value = var.auto_scale_trigger_metric_target_value
  auto_scale_min_capacity                = var.auto_scale_min_capacity
  auto_scale_max_capacity                = var.auto_scale_max_capacity
}

module "kms_master_key" {
  # Create the KMS key only if the user did NOT provide their own
  count = var.customer_kms_key_id == null ? 1 : 0

  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key?ref=v47.3.3"

  aws_region           = data.aws_region.current.region
  customer_master_keys = local.default_customer_master_keys

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  environment         = var.environment
  infra_live_repo     = var.infra_live_repo
  data_classification = var.data_classification
  created_by_email    = var.created_by_email
  team                = var.team
  custom_tags         = var.custom_tags
}

module "platform_roles" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles?ref=v47.3.3"

  app_team_oidc_arn = var.app_team_oidc_arn
}

module "naming_helpers" {
  source   = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/naming?ref=v47.3.3"
  for_each = local.resource_types

  name_prefix   = var.name_prefix
  environment   = var.environment
  region_code   = local.region_cd
  resource_type = each.value
  resource_slug = var.resource_slug
}

module "standard_tags" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//tagging/tmna-standard-tags?ref=v47.3.3"

  application_id      = var.application_id
  application_name    = var.application_name
  environment         = var.environment
  infra_live_repo     = var.infra_live_repo
  data_classification = var.data_classification
  created_by_email    = var.created_by_email
  team                = var.team
  custom_tags         = var.custom_tags
}