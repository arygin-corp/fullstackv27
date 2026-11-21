# ---------------------------------------------------------------------------------------------------------------------
# MODULE VARIABLES
# Define these paramater values as inputs.
# ---------------------------------------------------------------------------------------------------------------------

terraform {
  # this is an example only
  # In production code, Chofer recommends pinning the version of Blueprints to the specific, latest version
  # source = "git@github.com:Toyota-Motor-North-America/ace-aws-blueprint-ecs.git//terraform?ref=vX.Y.Z"
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-blueprint-ecs.git//terraform?ref=master"
}

include {
  path = find_in_parent_folders()
}
## Uncomment if ecs cluster infra blueprint was deployed in this repo
#dependency "ecs-cluster" {
#  config_path = "${get_terragrunt_dir()}/../../cluster" # NOTE: This Relative path will change according to your folder structure
#}

locals {
  ## Variables assumed from aws-infra-live template repo 
  global_vars          = read_terragrunt_config(find_in_parent_folders("global.hcl"))
  environment_vars     = read_terragrunt_config(find_in_parent_folders("environment.hcl"))
  region_vars          = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  aws_region_cd        = local.region_vars.locals.aws_region_cd
  environment          = local.environment_vars.locals.environment
  name_prefix          = replace(local.global_vars.locals.name_prefix, "_", "-") ## This can be customized
  service_name         = ""
  resource_name_prefix = "${local.name_prefix}-${local.environment}-${local.aws_region_cd}-fargate"
  http_port            = 8080
  cpu                  = 256 ## Must be either 256, 512, 1024, 2048, 4096
  memory               = 512 ## Must be either 512, 1024, 2048, 4096, 5120, 6144, 7168, 8192, 16384, 30720
}

inputs = {

  ## Required variables
  service_name    = "${local.resource_name_prefix}-${local.service_name}"
  ecs_cluster_arn = "" # dependency.ecs-cluster.outputs.ecs_cluster_arn ## Usage of the dependency block to an ECS Cluster
  containers = [
    {
      name      = "${local.resource_name_prefix}-${local.service_name}"
      image     = "" ## Existing image arn
      http_port = local.http_port
      cpu       = local.cpu
      memory    = local.memory
      env_vars = {
        PORT         = "${local.http_port}"
        SERVICE_NAME = local.service_name
      }
      expose_secrets = false
    }
  ]
  lb_container_name = "${local.resource_name_prefix}-${local.service_name}"
  http_port         = local.http_port
  cpu               = local.cpu
  memory            = local.memory
  name_prefix       = local.name_prefix

  # Mandatory Tags
  application_id   = "test-app-id"
  application_name = "test-app"
  created_by_email = "chofer-Blueprints@toyota.com"

  ## Optional variables  
  #cluster_name = ""
  #service_name = ""
  #secrets = {}
  #private_subnet_ids = []
  #inbound_cidr_blocks = ["192.168.0.0/16"]
  #cloudwatch_log_group = null
  #cloudwatch_logs_stream_prefix = null
  #cloudwatch_logs_aws_region = local.region_vars.locals.aws_region
  #log_retention_period_days = 30                                                     
  # runtime_platform = "{
  #   operating_system_family: "LINUX",
  #   cpu_architecture:        "X86_64",
  # }"                                                                     
  #cw_cmk_administrator_iam_arns = []                                      
  #cw_cmk_user_iam_arns = []                                                        
  #cw_cmk_service_principals = []                                              
  #cw_key_name = null
  #cw_existing_key_arn = null
  #cloudwatch_force_destroy = false
  #enable_datadog_monitoring = false
  #cw_create_key = true       
  #use_auto_scaling = true
  #min_number_of_tasks = 1
  #max_number_of_tasks = 4  
  #existing_ecs_task_role_name = ""
  #existing_ecs_task_execution_role_name = ""
  #existing_waf_acl_arn = null
  #custom_iam_role_name_prefix = ""
  #custom_task_execution_name_prefix = ""
  #custom_ecs_service_role_name = ""
  #protocol = "TCP"
  #health_check_protocol = "TCP"
  #vpc_id = ""
  #lb_slow_start = 30
  #alb_use_sticky_sessions = false
  #alb_sticky_session_type = "lb_cookie"
  #alb_sticky_session_cookie_duration = 86400
  #health_check_grace_period_seconds = 30
  #health_check_path = "/healthcheck"
  #health_check_matcher = 200
  #health_check_healthy_threshold = 6
  #health_check_unhealthy_threshold = 7
  #health_check_interval = 120
  #health_check_timeout = 10
  #enable_vpc_cidr_inbound = true
  #propagate_tags = "SERVICE"  # Options: "SERVICE", "TASK_DEFINITION", or null
  #deployment_circuit_breaker = {
  #  enable   = true
  #  rollback = true
  #}
  #deployment_cloudwatch_alarms = {
  #  cloudwatch_alarms = ["arn:aws:cloudwatch:us-west-2:123456789012:alarm:my-alarm"]
  #  enable            = true
  #  rollback          = true
  #}
}
