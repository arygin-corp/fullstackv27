module "ecs_cluster" {
  count  = var.create_ecs_cluster && var.ecs_service_launch_type == "FARGATE" ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//compute/ecs/cluster?ref=v47.5.4"

  # Required Variables
  name_prefix       = var.name_prefix
  cluster_name      = local.cluster_name
  app_team_oidc_arn = var.app_team_oidc_arn

  # Encryption
  ecs_key_arn                   = var.cmk_existing_key_arn
  cw_key_arn                    = var.cw_existing_key_arn
  s3_key_arn                    = var.cmk_existing_key_arn
  managed_storage_kms_key_arn   = var.cmk_existing_key_arn
  ephemeral_storage_kms_key_arn = var.cmk_existing_key_arn

  # Observability
  container_insights        = var.ecs_cluster_container_insights
  cloudwatch_log_group_name = module.cw_ecs_logs.log_group_name
  enable_datadog_monitoring = var.enable_datadog_monitoring

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "ecs_ec2_cluster" {
  count  = var.create_ecs_cluster && var.ecs_service_launch_type == "EC2" ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//compute/ecs/cluster-ec2?ref=v47.5.4"

  # Required Variables
  name_prefix   = var.name_prefix
  cluster_name  = local.cluster_name
  resource_slug = var.ec2_cluster_resource_slug == null ? var.name_prefix : var.ec2_cluster_resource_slug

  cluster_ami_id        = var.cluster_ami_id
  operating_system      = var.ec2_task_operating_system
  cluster_instance_type = var.enable_datadog_agent && var.cluster_instance_type == null ? "t3.small" : var.cluster_instance_type
  cluster_min_size      = var.cluster_min_size
  cluster_max_size      = var.cluster_max_size
  subnet_ids            = var.private_subnet_ids
  vpc_id                = var.vpc_id

  # Observability
  container_insights    = var.ecs_cluster_container_insights
  protect_from_scale_in = var.protect_from_scale_in
  instance_refresh      = var.instance_refresh
  block_device_mappings = var.block_device_mappings

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "acm_tls_certificate" {
  count  = (local.use_nlb || local.use_alb || local.use_existing_nlb || local.use_existing_alb) && local.create_new_acm_cert ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/acm-tls-certificate?ref=v47.5.4"

  domain_names   = [{ domain_name = local.fqdn, subject_alternative_names = var.subject_alternative_names }]
  hosted_zone_id = data.aws_route53_zone.route53_public_zone_id.zone_id

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "route53_record" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/dns/record?ref=v47.5.4"
  count  = (local.use_nlb || local.use_alb || local.use_existing_nlb || local.use_existing_alb) && local.create_new_acm_cert ? 1 : 0

  allow_overwrite = true
  name            = (var.fqdn != null && var.fqdn != "") ? var.fqdn : local.route53_cname
  record_values   = [local.use_nlb || local.use_existing_nlb ? (local.use_nlb ? module.nlb[0].nlb_dns_name : data.aws_lb.existing_lb[0].dns_name) : (local.use_existing_alb ? data.aws_lb.existing_lb[0].dns_name : module.alb[0].alb_dns_name)]
  ttl             = var.route53_ttl
  type            = (var.fqdn != null && var.fqdn != "") ? "A" : "CNAME"
  zone_name       = local.route53_zone_name
  private_zone    = var.route53_private_zone

  # Routing Policy Parameters
  set_identifier                   = var.route53_set_identifier
  cidr_routing_policy              = var.route53_cidr_routing_policy
  failover_routing_policy          = var.route53_failover_routing_policy
  health_check_id                  = var.route53_failover_health_check_id
  geolocation_routing_policy       = var.route53_geolocation_routing_policy
  latency_routing_policy           = var.route53_latency_routing_policy
  multivalue_answer_routing_policy = var.route53_multivalue_answer_routing_policy
  weighted_routing_policy          = var.route53_weighted_routing_policy
  alias = (var.fqdn != null && var.fqdn != "") ? {
    name                   = local.use_nlb || local.use_existing_nlb ? (local.use_nlb ? module.nlb[0].nlb_dns_name : data.aws_lb.existing_lb[0].dns_name) : (local.use_existing_alb ? data.aws_lb.existing_lb[0].dns_name : module.alb[0].alb_dns_name)
    zone_id                = local.use_nlb || local.use_existing_nlb ? (local.use_nlb ? module.nlb[0].nlb_zone_id : data.aws_lb.existing_lb[0].zone_id) : (local.use_existing_alb ? data.aws_lb.existing_lb[0].zone_id : module.alb[0].alb_hosted_zone_id)
    evaluate_target_health = true
  } : var.route53_alias_records
}

#tfsec:ignore:aws-cloudwatch-log-group-customer-key
module "cw_ecs_logs" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//cloudwatch/logs?ref=v47.5.4"

  log_group_name            = local.cloudwatch_log_group
  log_retention_period_days = var.log_retention_period_days
  enable_datadog_monitoring = var.enable_datadog_monitoring
  force_destroy             = var.cloudwatch_force_destroy

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "nlb" {
  count  = local.use_nlb ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/nlb?ref=v48.2.4"

  service_name                  = var.service_name
  name_prefix                   = var.name_prefix
  vpc_id                        = var.vpc_id
  record_names                  = local.create_new_acm_cert ? [module.route53_record[0].hostname] : [var.existing_acm_hostname]
  lb_subnet_ids                 = local.lb_subnet_ids
  lb_security_group_ids         = var.lb_security_group_ids
  is_lb_public                  = var.is_lb_public
  enable_deletion_protection    = var.nlb_enable_deletion_protection
  allow_inbound_from_cidr       = var.lb_allow_inbound_from_cidr_blocks
  allow_outbound_from_cidr      = var.lb_allow_outbound_from_cidr_blocks
  access_logging_enabled        = var.access_logging_enabled
  s3_replication_enabled        = var.s3_replication_enabled
  allow_override_iam_delegation = var.allow_override_iam_delegation
  accesslogs_bucketprefix       = var.accesslogs_bucketprefix
  source_policy_documents       = var.source_policy_documents
  cmk_existing_key_arn          = var.cmk_existing_key_arn
  app_team_oidc_arn             = var.app_team_oidc_arn
  s3_replication_rules          = var.s3_replication_rules
  resource_slug                 = var.resource_slug

  enforce_security_group_inbound_rules_on_private_link_traffic = var.nlb_enforce_security_group_inbound_rules_on_private_link_traffic

  # LB Listener Configuration  
  target_group_arn             = null # This is handled by lb-listener-rules
  listener_ports_and_ssl_certs = []   # This is created by lb-listener-rules 

  # Shield Configuration
  enable_shield_advanced = var.lb_enable_shield_advanced
  aggregation            = var.lb_shield_aggregation_method

  # Logging and Cbservability Configuration
  enable_datadog_monitoring             = var.enable_datadog_monitoring
  nlb_access_logs_s3_bucket_name        = var.lb_access_logs_s3_bucket_name
  force_destroy                         = var.lb_logs_bucket_force_destroy
  s3_logs_lifecycle_configuration_rules = var.lb_s3_logs_lifecycle_configuration_rules

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "alb" {
  count  = local.use_alb ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/alb?ref=v47.5.4"

  alb_name          = var.service_name
  alb_subnets       = local.lb_subnet_ids
  vpc_id            = var.vpc_id
  app_team_oidc_arn = var.app_team_oidc_arn

  additional_security_group_ids          = var.additional_security_group_ids
  alb_allow_inbound_from_cidr_blocks     = length(var.lb_allow_inbound_from_cidr_blocks) == 0 ? (var.is_lb_public ? ["0.0.0.0/0"] : []) : var.lb_allow_inbound_from_cidr_blocks
  allow_inbound_from_security_group_ids  = var.alb_allow_inbound_from_security_group_ids
  default_action                         = var.alb_default_action
  https_listener_ports_and_acm_ssl_certs = [] # This is created by lb-listener-rules
  is_alb_public                          = var.is_lb_public
  name_prefix                            = var.name_prefix
  access_log_bucket_suffix               = var.access_log_bucket_suffix
  access_logging_enabled                 = var.access_logging_enabled
  accesslogs_bucketprefix                = var.accesslogs_bucketprefix

  # Shield Configuration
  enable_shield_advanced = var.lb_enable_shield_advanced
  aggregation            = var.lb_shield_aggregation_method

  # Logging and Observability
  enable_datadog_monitoring = var.enable_datadog_monitoring

  s3_alb_access_logs_bucket_name        = var.lb_access_logs_s3_bucket_name == null ? "" : var.lb_access_logs_s3_bucket_name
  s3_force_destroy                      = var.lb_logs_bucket_force_destroy
  s3_logs_lifecycle_configuration_rules = var.lb_s3_logs_lifecycle_configuration_rules

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

resource "aws_wafv2_web_acl_association" "alb_waf_association" {
  count = (
    var.existing_waf_acl_arn != null &&
    var.existing_waf_acl_arn != "" &&
    var.lb_type == "application" &&
    (
      var.create_lb == true ||
      var.existing_lb_name != null
    )
  ) ? 1 : 0
  resource_arn = local.use_existing_alb ? data.aws_lb.existing_lb[0].arn : module.alb[0].alb_arn
  web_acl_arn  = var.existing_waf_acl_arn
}

module "waf" {
  count  = var.create_lb && var.lb_type == "application" && var.existing_waf_acl_arn == null ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/defense/waf-acl-zscalar?ref=v51.0.0"

  service_name = var.service_name
  resource_arn = local.use_existing_alb ? data.aws_lb.existing_lb[0].arn : module.alb[0].alb_arn

  add_default_zscalar_ips     = var.waf_add_default_zscalar_ips
  add_tmna_network_device_ips = var.waf_add_tmna_network_device_ips
  add_vpc_private_ips         = var.waf_add_vpc_private_ips
  filtered_header_rule        = var.waf_filtered_header_rule
  ip_rate_based_rule          = var.waf_ip_rate_based_rule
  group_rules                 = var.waf_group_rules
  use_cloudfront              = false
  list_of_ips                 = var.waf_list_of_ips
  managed_rules               = var.waf_managed_rules
  advanced_managed_rules      = var.waf_advanced_managed_rules
  waf_default_action          = var.waf_default_action
  app_team_oidc_arn           = var.app_team_oidc_arn

  # Kinesis Config
  kinesis_firehose_stream_arns = var.waf_kinesis_firehose_stream_arns
  use_kinesis                  = var.waf_use_kinesis

  # Logging Configuration
  s3_force_destroy                 = var.waf_s3_logging_bucket_force_destroy
  s3_lifecycle_configuration_rules = var.waf_s3_lifecycle_configuration_rules

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

# Add inbound security group rules for load balancers
resource "aws_security_group_rule" "allow_https_inbound_rule" {
  count = local.use_alb && length(var.lb_security_group_ids) == 0 ? 1 : 0

  security_group_id = local.use_alb ? module.alb[0].alb_security_group_id : null
  description       = "Allow TLS inbound traffic"
  type              = "ingress"
  from_port         = var.https_listener_port
  to_port           = var.https_listener_port
  protocol          = "tcp"
  cidr_blocks       = var.lb_allow_inbound_from_cidr_blocks #tfsec:ignore:aws-ec2-no-public-ingress-sgr
}

# Add outbound security group rules from load balancer to ECS service
resource "aws_security_group_rule" "allow_outbound_on_container_port" {
  count = local.use_nlb && length(var.lb_security_group_ids) == 0 ? 1 : 0

  security_group_id = local.use_nlb ? module.nlb[0].security_group_id[0] : null
  description       = "Allow TLS outbound traffic"
  type              = "egress"
  from_port         = var.http_port
  to_port           = var.http_port
  protocol          = "tcp"
  cidr_blocks       = var.lb_allow_outbound_from_cidr_blocks #tfsec:ignore:aws-ec2-no-public-egress-sgr
}

module "lb-listener-rules" {
  count      = local.use_nlb || local.use_alb || local.use_existing_nlb || local.use_existing_alb ? 1 : 0
  source     = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//networking/lb/lb-listener-rules?ref=v47.5.4"
  depends_on = [data.aws_lb.existing_lb, module.alb, module.nlb]

  create_listeners  = var.create_listeners
  load_balancer_arn = local.use_existing_alb || local.use_existing_nlb ? data.aws_lb.existing_lb[0].arn : local.lb_arn
  target_group_arns = [{ arn = module.ecs-service.lb_target_group_arn }]
  route53_zone_name = local.route53_zone_name
  fqdn              = var.fqdn

  https_listener_arns = local.use_alb ? [
    for port, arn in module.alb[0].https_listener_acm_cert_arns : { arn = local.https_listener_ports_and_ssl_certs[count.index].tls_arn, port = local.https_listener_ports_and_ssl_certs[count.index].port } if local.https_listener_ports_and_ssl_certs[count.index].port == port
  ] : var.https_listener_arns
  https_listener_ports_and_ssl_certs = local.https_listener_ports_and_ssl_certs
  ssl_passthrough                    = var.tls_passthrough
  use_alb                            = var.create_lb ? local.use_alb : local.use_existing_alb
  use_nlb                            = var.create_lb ? local.use_nlb : local.use_existing_nlb

  # Rules Config
  create_redirect_listener_rule = var.create_redirect_listener_rule
  default_actions               = var.lb_listener_rules_default_actions
  forward_rules                 = var.lb_listener_forward_rules
  redirect_rules                = var.lb_listener_redirect_rules
  fixed_response_rules          = var.lb_listener_fixed_response_rules
  create_forward_listener_rule  = true

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}

module "ecs-service" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//compute/ecs/ecs-service?ref=v51.2.1"


  depends_on = [module.acm_tls_certificate]

  service_name                  = var.service_name
  aws_region                    = var.aws_region
  ecs_cluster_arn               = !var.create_ecs_cluster ? data.aws_ecs_cluster.ecs_cluster[0].arn : var.ecs_service_launch_type == "FARGATE" ? module.ecs_cluster[0].ecs_cluster_arn : module.ecs_ec2_cluster[0].cluster_arn
  launch_type                   = var.ecs_service_launch_type
  vpc_id                        = var.vpc_id
  availability_zone_rebalancing = var.availability_zone_rebalancing

  existing_ecs_task_role_name           = var.existing_ecs_task_role_name
  existing_ecs_task_execution_role_name = var.existing_ecs_task_execution_role_name
  ecr_repository_names                  = var.ecr_repository_names

  volumes          = var.volumes
  efs_volumes      = var.efs_volumes
  runtime_platform = var.runtime_platform

  # Outbound Security Group Rules
  outbound_cidr_blocks = var.outbound_cidr_blocks
  outbound_from_port   = var.outbound_from_port
  outbound_to_port     = var.outbound_to_port
  outbound_protocol    = var.outbound_protocol

  # Allow custom prefixes to IAM entities the module manages, or make those backwards compatible (prior to v1.5.0 the
  # module used `service_name` and now removed `environment_name` to name the IAM entities, thus the newer version would
  # lead to IAM entities will be recreated when upgrading, unless compatibility flag set)
  custom_iam_role_name_prefix       = var.iam_role_compatibility ? "${var.service_name}-${var.environment}" : var.custom_iam_role_name_prefix
  custom_task_execution_name_prefix = var.iam_role_compatibility ? "${var.service_name}-${var.environment}" : var.custom_task_execution_name_prefix
  custom_ecs_service_role_name      = var.iam_role_compatibility ? "${var.service_name}-${var.environment}" : var.custom_ecs_service_role_name

  # Containers for ECS Task Definition
  containers = var.containers
  advanced_container_definition = (var.advanced_container_definition != null
    ? var.advanced_container_definition : var.advanced_container_definition_file_path != null
  ? jsondecode(file(var.advanced_container_definition_file_path)) : null)

  # Sticky sessions configuration
  alb_use_sticky_sessions                    = var.alb_use_sticky_sessions && (local.use_alb || local.use_existing_alb)
  alb_sticky_session_type                    = var.alb_sticky_session_type
  alb_sticky_session_cookie_duration_seconds = var.alb_sticky_session_cookie_duration_seconds

  // Glue the modules and pass the secrets to task definition, allowing the provide additional secrets via
  // `additional_ecs_secret_arns` variable.
  secrets = merge(
    var.db_name != null ? module.database[0].database_parameter_arn_map : {},
    var.db_name != null ? {
      DB_HOST     = module.database[0].database_parameter_arn_map["DATABASE_HOST"]
      DB_PORT     = module.database[0].database_parameter_arn_map["DATABASE_PORT"]
      DB_NAME     = module.database[0].database_parameter_arn_map["DATABASE_NAME"]
      DB_USER     = module.database[0].database_parameter_arn_map["DATABASE_USER"]
      DB_PASSWORD = "${module.database[0].database_parameter_arn_map["DATABASE_PASSWORD"]}:password::"
    } : {},
    var.additional_ecs_secret_arns,
  )

  use_target_group  = local.is_using_lb ? true : false
  lb_container_name = var.lb_container_name
  lb_slow_start     = var.lb_slow_start
  # allows for security group to use a smaller portion of the VPC CIDR Block
  inbound_cidr_blocks = var.inbound_service_cidr_blocks
  private_subnet_ids  = var.private_subnet_ids
  http_port           = var.http_port

  cpu    = var.task_T_shirt_size != "" ? local.container_size_map[var.task_T_shirt_size].cpu : var.cpu
  memory = var.task_T_shirt_size != "" ? (var.memory >= local.container_size_map[var.task_T_shirt_size].memory ? var.memory : local.container_size_map[var.task_T_shirt_size].memory) : var.memory

  health_check_grace_period_seconds = local.is_using_lb ? var.health_check_grace_period_seconds : null
  health_check_healthy_threshold    = local.is_using_lb ? var.health_check_healthy_threshold : null
  health_check_unhealthy_threshold  = local.is_using_lb ? var.health_check_unhealthy_threshold : null
  health_check_interval             = local.is_using_lb ? var.health_check_interval : null
  health_check_timeout              = local.is_using_lb ? var.health_check_timeout : null
  health_check_path                 = local.is_using_lb ? var.health_check_path : null
  health_check_matcher              = local.is_using_lb && local.use_alb ? var.health_check_code : null
  health_check_protocol             = local.use_nlb || local.use_existing_nlb ? "TCP" : local.health_check_protocol
  protocol                          = local.use_nlb || local.use_existing_nlb ? "TCP" : local.protocol

  # ECS Ready State Check Options
  wait_for_steady_state         = var.wait_for_steady_state
  service_create_update_timeout = var.service_create_update_timeout
  service_delete_timeout        = var.service_delete_timeout

  # ECS Canary Configuration
  desired_number_of_canary_tasks_to_run = var.desired_number_of_ecs_canary_tasks_to_run
  ecs_task_definition_canary            = var.ecs_task_definition_canary

  # Circuit Breaker configuration
  deployment_circuit_breaker   = var.deployment_circuit_breaker
  deployment_cloudwatch_alarms = var.deployment_cloudwatch_alarms

  # Service Discovery Configuration
  use_service_discovery                           = var.use_service_discovery
  discovery_namespace_name                        = var.discovery_namespace_name
  discovery_custom_health_check_failure_threshold = var.discovery_custom_health_check_failure_threshold
  discovery_dns_ttl_seconds                       = var.discovery_dns_ttl_seconds
  discovery_dns_routing_policy                    = var.discovery_dns_routing_policy
  discovery_alias_record_evaluate_target_health   = var.discovery_alias_record_evaluate_target_health
  existing_namespace_id                           = var.existing_namespace_id
  use_existing_namespace                          = var.use_existing_namespace

  # Autoscaling Configuration
  use_auto_scaling    = var.use_auto_scaling
  min_number_of_tasks = var.min_number_of_tasks
  max_number_of_tasks = var.max_number_of_tasks

  # Cloudwatch Alarm Configuration
  scaling_metric           = var.scaling_metric
  metric_aggregation_type  = var.metric_aggregation_type
  upscale_threshold        = var.upscale_threshold
  downscale_threshold      = var.downscale_threshold
  statistic                = var.statistic
  period                   = var.period
  evaluation_periods       = var.evaluation_periods
  autoscaling_cooldown     = var.autoscaling_cooldown
  custom_cloudwatch_alarms = var.custom_ecs_cloudwatch_alarms

  # Datadog Agent
  enable_datadog_agent        = var.enable_datadog_agent
  dd_api_key_path             = var.dd_api_key_path
  additional_datadog_env_vars = var.additional_datadog_env_vars
  ec2_task_operating_system   = var.ec2_task_operating_system

  # Gremlin Sidecar
  enable_gremlin_chaos             = var.enable_gremlin_chaos
  enable_gremlin_sidecar           = var.enable_gremlin_sidecar
  gremlin_config_ssm_parameter_arn = var.gremlin_config_ssm_parameter_arn
  gremlin_debug_enabled            = var.gremlin_debug_enabled
  gremlin_trace_enabled            = var.gremlin_trace_enabled

  # Cloudwatch configuration
  cw_existing_key_arn           = var.cw_existing_key_arn != null ? var.cw_existing_key_arn : module.kms_master_key[0].key_arns[local.default_kms_key_name]
  cloudwatch_log_group          = module.cw_ecs_logs.log_group_name
  cloudwatch_logs_aws_region    = var.aws_region
  cloudwatch_logs_stream_prefix = var.cloudwatch_logs_stream_prefix

  # Tags
  propagate_tags      = var.propagate_tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  name_prefix         = var.name_prefix
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo

  app_team_oidc_arn                  = var.app_team_oidc_arn
  resource_slug                      = var.resource_slug
  existing_security_group_ids        = var.existing_security_group_ids
  allow_inbound_from_security_groups = local.allow_inbound_from_security_groups
  enable_vpc_cidr_inbound            = var.enable_vpc_cidr_inbound
}

module "database" {
  # This module has an option to be turned on if user_input has db_name specified.
  count  = local.use_db ? 1 : 0
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//databases/rds?ref=v47.5.1"

  aws_region     = var.aws_region
  db_name        = var.db_name != "" ? var.db_name : var.service_name
  engine         = var.db_engine
  engine_version = var.db_engine_version
  instance_type  = var.db_instance_type
  name_prefix    = var.service_name
  port           = var.db_port
  vpc_id         = var.vpc_id

  aws_region_cd                            = local.aws_region_cd
  allocated_storage                        = var.db_allocated_storage
  allow_connections_from_cidr_blocks       = var.db_allow_connections_from_cidr_blocks
  allow_major_version_upgrade              = var.db_allow_major_version_upgrade
  apply_immediately                        = var.db_apply_immediately
  maintenance_window                       = var.db_maintenance_window
  master_username                          = var.master_username != null ? var.master_username : var.db_name
  max_allocated_storage                    = var.db_max_allocated_storage
  skip_final_snapshot                      = var.skip_final_snapshot
  num_read_replicas                        = var.db_num_read_replicas
  iam_database_authentication_enabled      = var.iam_database_authentication_enabled
  iam_roles_allowed_reading_db_secrets     = [module.ecs-service.ecs_task_iam_role_name, module.ecs-service.ecs_task_execution_iam_role_name]
  iam_roles_arn_allowed_reading_db_secrets = [module.ecs-service.ecs_task_iam_role_arn, module.ecs-service.ecs_task_execution_iam_role_arn]
  allow_connections_from_security_groups   = module.ecs-service.service_security_group_id
  backup_retention_period_days             = var.backup_retention_period_days
  backup_window                            = var.backup_window
  multi_az                                 = var.multi_az
  subnet_ids                               = var.db_subnet_ids
  snapshot_identifier                      = var.db_snapshot_identifier
  resource_slug                            = var.db_resource_slug
  deletion_protection                      = var.db_deletion_protection
  storage_type                             = var.db_storage_type
  iops                                     = var.db_iops
  create_log_group                         = var.create_log_group

  # Read Replica Configuration
  additional_read_replica_instance_security_group_ids = var.additional_db_read_replica_instance_security_group_ids
  allow_connections_from_cidr_blocks_to_read_replicas = var.allow_connections_from_cidr_blocks_to_db_read_replicas
  allowed_replica_zones                               = var.allowed_db_read_replica_zones
  parameter_group_name_for_read_replicas              = var.parameter_group_name_for_db_read_replicas
  replica_backup_retention_period_days                = var.db_replica_backup_retention_period_days

  # Parameter Group Configuration
  parameter_group_name              = var.db_parameter_group_name
  custom_parameter_group_parameters = var.custom_db_parameter_group_parameters
  custom_option_group_parameters    = var.db_custom_option_group_parameters

  # KMS Key Configuration
  master_user_secret_kms_key_id = var.db_secret_kms_key_id
  cw_key_arn                    = var.db_cloudwatch_logs_key_arn
  rds_key_arn                   = var.rds_key_arn

  # Enhanced Monitoring
  monitoring_interval_seconds = var.db_monitoring_interval_seconds
  monitoring_role_arn         = var.monitoring_role_arn

  # Performance Insights
  performance_insights_enabled               = var.performance_insights_enabled
  performance_insights_kms_key_id            = var.performance_insights_kms_key_id
  performance_insights_retention_period_days = var.performance_insights_retention_period_days

  # CloudWatch Monitoring and Log Configuration
  period_seconds            = var.db_period_seconds
  enable_datadog_monitoring = var.enable_datadog_monitoring
  evaluation_periods        = var.evaluation_periods
  log_retention_period_days = var.log_retention_period_days
  statistic                 = var.statistic
  threshold_hdd             = var.threshold_hdd
  threshold_ram             = var.threshold_ram
  threshold_cpu             = var.threshold_cpu

  # Tags
  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo

  app_team_oidc_arn = var.app_team_oidc_arn
}

module "platform_roles" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles?ref=v47.5.1"

  app_team_oidc_arn = var.app_team_oidc_arn
}

module "kms_master_key" {
  count  = var.cw_existing_key_arn != null ? 0 : 1
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key?ref=v47.5.1"

  aws_region = "us-west-2" # unused variable, but required by module
  customer_master_keys = {
    (local.default_kms_key_name) = local.default_customer_master_keys
  }

  application_id      = var.application_id
  application_name    = var.application_name
  created_by_email    = var.created_by_email
  custom_tags         = var.custom_tags
  environment         = var.environment
  team                = var.team
  data_classification = var.data_classification
  infra_live_repo     = var.infra_live_repo
}
