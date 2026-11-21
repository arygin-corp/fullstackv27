/*
  General variables
*/

variable "aws_region" {
  type        = string
  description = "The AWS region in which all resources will be created."
  default     = "us-west-2"
}

variable "enable_datadog_monitoring" {
  type        = bool
  description = "Enable CloudWatch logs to deliver to DataDog; incurs additional cost"
  default     = false
}

variable "vpc_id" {
  description = "The id of the specific VPC to retrieve."
  type        = string
}

/*
  ECS variables
*/
variable "cluster_name" {
  description = "The ECS cluster name to use for deployment. (If value is not provided, 'service_name-cluster' will be used)"
  type        = string
  default     = null
}

variable "create_ecs_cluster" {
  description = "Decide when you need to create ECS cluster or deploy in existing one."
  type        = bool
  default     = true
}

variable "ecr_repository_names" {
  description = "The names of the ECR Repositories where images are pulled from for container definitions. This is used to limit the task execution role's ECR-related permissions."
  type        = list(string)
  nullable    = false
  default     = []
}

variable "existing_ecs_task_role_name" {
  description = "The name of the existing task role to be used in place of creating a new role."
  type        = string
  default     = null
}

variable "existing_ecs_task_execution_role_name" {
  description = "The name of the existing task execution role to be used in place of creating a new role."
  type        = string
  default     = null
}

variable "custom_iam_role_name_prefix" {
  description = "Prefix for name of the IAM role used by the ECS task. If not provide, will be set to var.service_name."
  type        = string
  default     = null
}

variable "custom_task_execution_name_prefix" {
  description = "Prefix for name of task execution IAM role and policy that grants access to CloudWatch and ECR. If not provide, will be set to var.service_name."
  type        = string
  default     = null
}

variable "custom_ecs_service_role_name" {
  description = "Custom name to use for the ECS service IAM role that is created. Note that this service IAM role is only needed when the ECS service is being used with an ELB. If blank (default), the name will be set to var.service_name."
  type        = string
  default     = null
}

variable "iam_role_compatibility" {
  description = "Make custom IAM prefixes backwards compatible (prior to v1.5.0 the module used `service_name` and now removed `environment_name` to name the IAM entities, thus the newer version would lead to IAM entities will be recreated when upgrading, unless compatibility flag set)."
  type        = bool
  default     = false
}

/*
  ECS Cluster variables
*/
variable "ecs_cluster_container_insights" {
  type        = string
  description = "Controls if ECS Cluster has container insights enabled. Valid values are 'enabled', 'disabled', or 'enhanced'"
  default     = "enabled"
  validation {
    condition     = contains(["enabled", "disabled", "enhanced"], var.ecs_cluster_container_insights)
    error_message = "Argument 'ecs_cluster_container_insights' must be either 'enabled', 'disabled', or 'enhanced'."
  }
}

/*
  ECS Cluster EC2 variables - only used if ecs_service_launch_type == "EC2"
*/

variable "cluster_ami_id" {
  default     = null
  description = "AMI ID to use for cluster compute; if not provided, will find latest appropriate Golden Image"
  type        = string
}

variable "cluster_instance_type" {
  default     = null
  description = "Instance type for cluster Container Instances; if default, a type will be chosen that may not be suitable for all workloads"
  type        = string
}

variable "cluster_min_size" {
  default     = 1
  description = "The minimum Container Instance size of the ECS cluster"
  type        = number
}

variable "cluster_max_size" {
  default     = 10
  description = "The maximum Container Instance size of the ECS cluster; AWS ECS will change the desired size up to this maximum"
  type        = number
}

variable "ec2_cluster_resource_slug" {
  default     = null
  description = "A suffix which will be inserted at the end of resource names"
  type        = string
}

variable "block_device_mappings" {
  description = "Specify volumes to attach to the instance besides the volumes specified by the AMI"

  type = list(object({
    device_name  = string
    no_device    = optional(bool)
    virtual_name = optional(string)
    ebs = object({
      delete_on_termination = bool
      encrypted             = bool
      iops                  = optional(number)
      kms_key_id            = optional(string)
      snapshot_id           = optional(string)
      volume_size           = number
      volume_type           = string
    })
  }))

  default = []

  validation {
    condition = alltrue([
      for bd in var.block_device_mappings : !(
        lower(try(bd.ebs.volume_type, "")) == "gp2" && try(bd.ebs.iops, null) != null
      )
    ])
    error_message = "IOPS must not be set when volume_type is \"gp2\". Only gp3, io1, and io2 support IOPS."
  }
}

/*
  Service specific configuration
*/

variable "service_name" {
  description = "The name of the ECS service to run."
  type        = string
}

#No possible to change "" to 'null', because 'contains' function doesn't work with null value
variable "task_T_shirt_size" {
  description = "Container size in T-shirt mode"
  default     = ""
  type        = string
  validation {
    condition     = contains(["", "S", "M", "L", "XL", "XXL", "XXXL"], var.task_T_shirt_size)
    error_message = "Argument 'task_T_shirt_size' must be either 'S', 'M', 'L', 'XL', 'XXL', 'XXXL' or empty."
  }
}

variable "containers" {
  description = "Define the containers for ECS Task Definition."

  type = list(object({
    name      = string
    image     = string
    http_port = number
    cpu       = number
    memory    = number
    env_vars  = map(string)
  }))

  # Example:
  # default = [
  #   {
  #     name           = "webapp"
  #     image          = "webapp:latest"
  #     http_port      = 3000
  #     cpu            = 256
  #     memory         = 512
  #     env_vars       = {}
  #   }
  # ]
}

variable "advanced_container_definition" {
  description = "The JSON text of the ECS Task Container Definitions. This portion of the ECS Task Definition defines the Docker container(s) to be run along with all their properties. It should adhere to the format described at https://goo.gl/ob5U3g. The variable 'containers' and is ignored if this value is set."
  type        = list(any)
  default     = null

  # Example Usage
  # [
  #  { 
  #     "command": [
  #       "/bin/sh -c \"echo '<html> <head> <title>Amazon ECS Sample App</title> </head></html>' >""
  #     ],
  #     "entryPoint": [
  #       "sh",
  #       "-c"
  #     ],
  #     "essential": true,
  #     "image": "831531666590.dkr.ecr.us-east-1.amazonaws.com/hello-world-go:0.0.1",
  #     "logConfiguration": { 
  #       "logDriver": "awslogs",
  #       "options": { 
  #           "awslogs-group" : "/ecs/fargate-task-definition",
  #           "awslogs-region": "us-east-1",
  #           "awslogs-stream-prefix": "ecs"
  #       }
  #     },
  #     "name": "sample-fargate-app",
  #     "portMappings": [
  #       {
  #           "containerPort": 80,
  #           "hostPort": 80,
  #           "protocol": "tcp"
  #       }
  #     ]
  #   }
  # ]
}

variable "advanced_container_definition_file_path" {
  description = "Path to a file containing the JSON text of the ECS Task Container Definitions. This value is ignored if 'advanced_container_definition' is defined."
  type        = string
  default     = null

  validation {
    condition     = var.advanced_container_definition_file_path == null || can(fileexists(var.advanced_container_definition_file_path))
    error_message = "Unable to find file provided at `advanced_container_definition_file_path`!"
  }
}

variable "runtime_platform" {
  description = "Define the runtime platform for ECS Task Definition."
  type = object({
    operating_system_family = string
    cpu_architecture        = string
  })
  default = null
  # note: arm64 may be supported by windows in the future, remove this validation when that becomes the case.
  validation {
    condition     = var.runtime_platform == null ? true : !(lookup(var.runtime_platform, "operating_system_family", null) != "LINUX" && lookup(var.runtime_platform, "cpu_architecture", null) == "ARM64")
    error_message = "ARM64 architecture is only supported on LINUX."
  }
  validation {
    condition     = var.runtime_platform == null ? true : contains(["X86_64", "ARM64"], lookup(var.runtime_platform, "cpu_architecture", null))
    error_message = "Attribute `cpu_architecture` must be either X86_64 or ARM64."
  }
  validation {
    condition     = var.runtime_platform == null ? true : contains(["LINUX", "WINDOWS_SERVER_2019_FULL", "WINDOWS_SERVER_2019_CORE", "WINDOWS_SERVER_2022_FULL", "WINDOWS_SERVER_2022_CORE"], lookup(var.runtime_platform, "operating_system_family", null))
    error_message = "Attribute `operating_system_family` must be either LINUX, WINDOWS_SERVER_2019_FULL, WINDOWS_SERVER_2019_CORE, WINDOWS_SERVER_2022_FULL, or WINDOWS_SERVER_2022_CORE."
  }
}

variable "ecs_service_launch_type" {
  description = "The launch type of the ECS service. Defaults to FARGATE. Valid value must be one of EC2 or FARGATE."
  type        = string
  default     = "FARGATE"
}

variable "lb_container_name" {
  description = "The name of the container in the ECS Task Definition to map with Load Balancer."
  type        = string
}

variable "http_port" {
  description = "The port on which the host and container listens on for HTTP requests."
  type        = number
}

variable "cpu" {
  description = "The desired CPU amount for the service used on ECS task.  If using Fargate, please see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html#fargate-tasks-size for proper Task CPU/Memory Options"
  type        = number
  default     = 256
}

variable "memory" {
  description = "The desired Memory amount for the service used on ECS task.  If using Fargate, please see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html#fargate-tasks-size for proper Task CPU/Memory Options"
  type        = number
  default     = 512
}

variable "volumes" {
  description = "(Optional) A map of volume blocks that containers in your task may use. The key should be the name of the volume and the value should be a map compatible with https://www.terraform.io/docs/providers/aws/r/ecs_task_definition.html#volume-block-arguments, but not including the name parameter."
  type        = map(any)
  default     = {}

  # Example:
  # volumes = {
  #   datadog = {
  #     host_path = "/var/run/datadog"
  #   }

  #   logs = {
  #     host_path = "/var/log"
  #     docker_volume_configuration = {
  #       scope         = "shared"
  #       autoprovision = true
  #       driver        = "local"
  #     }
  #   }
  # }
}

variable "efs_volumes" {
  description = "(Optional) A map of EFS volumes that containers in your task may use. Each item in the list should be a map compatible with https://www.terraform.io/docs/providers/aws/r/ecs_task_definition.html#efs-volume-configuration-arguments."
  type = map(object({
    file_system_id          = string # required
    container_path          = string # required
    root_directory          = string
    transit_encryption      = string
    transit_encryption_port = number
    access_point_id         = string
    iam                     = string
  }))
  default = {}

  # Example:
  # efs_volumes = {
  #   jenkins = {
  #     file_system_id          = "fs-a1bc234d"
  #     container_path          = "/efs"
  #     root_directory          = "/jenkins"
  #     transit_encryption      = "ENABLED"
  #     transit_encryption_port = 2999
  #     access_point_id         = "fsap-123a4b5c5d7891234"
  #     iam                     = "ENABLED"
  #   }
  # }
}

variable "propagate_tags" {
  description = "Whether tags should be propogated to the tasks from the service or from the task definition. Valid values are SERVICE and TASK_DEFINITION. Defaults to SERVICE. If set to null, no tags are created for tasks."
  type        = string
  default     = "SERVICE"
}

variable "health_check_path" {
  description = "The ping path that is the destination on the Targets for health checks. Required when using ALBs."
  type        = string
  default     = "/healthcheck"
}

variable "health_check_code" {
  description = "HTTP codes to use when checking for a successful response from a Target. You can specify multiple values (e.g. '200,202') or a range of values (e.g. '200-299'). Required when using ALBs."
  type        = string
  default     = "200"
}

variable "health_check_grace_period_seconds" {
  type        = number
  default     = 30
  description = "Give the container seconds to boot before having the LB start checking health."
  validation {
    condition     = var.health_check_grace_period_seconds >= 15 && var.health_check_grace_period_seconds <= 3600
    error_message = "Argument 'health_check_grace_period_seconds' must be within 15-3600 range."
  }
}

variable "health_check_healthy_threshold" {
  type        = number
  default     = 5
  description = "Specifies consecutives checks required to classify as healthy. Range is 2-10."
  validation {
    condition     = var.health_check_healthy_threshold == null ? true : (var.health_check_healthy_threshold >= 2 && var.health_check_healthy_threshold <= 10)
    error_message = "Argument 'health_check_healthy_threshold' must be within 2-10 range."
  }
}

variable "health_check_unhealthy_threshold" {
  type        = number
  default     = 2
  description = "Specifies consecutives checks required to classify as unhealthy. Range is 2-10. For NLBs, this must equal health_check_healthy_threshold."
  validation {
    condition     = var.health_check_unhealthy_threshold == null ? true : (var.health_check_unhealthy_threshold >= 2 && var.health_check_unhealthy_threshold <= 10)
    error_message = "Argument 'health_check_unhealthy_threshold' must be within 2-10 range."
  }
}

variable "health_check_interval" {
  type        = number
  default     = 30
  description = "Specifies time duration between checks (in seconds). Range is 5-300."
  validation {
    condition     = var.health_check_interval == null ? true : (var.health_check_interval >= 5 && var.health_check_interval <= 300)
    error_message = "Argument 'health_check_interval' must be within 5-300 range."
  }
}

variable "health_check_timeout" {
  type        = number
  default     = 5
  description = "Specifies the duration to wait for response before considering a check failed (in seconds). Range is 2-60."
  validation {
    condition     = var.health_check_timeout == null ? true : (var.health_check_timeout >= 2 && var.health_check_timeout <= 60)
    error_message = "Argument 'health_check_timeout' must be within 2-60 range."
  }
}

variable "inbound_service_cidr_blocks" {
  type        = list(string)
  default     = []
  description = "Provide inbound cidr blocks for ECS Service module. If none provided, it will use the first cidr block on the VPC"
}

variable "private_subnet_ids" {
  type        = list(string)
  default     = []
  description = "List of private subnet ids, for ECS services"
  validation {
    condition = length(var.private_subnet_ids) == 0 || length([
      for name in var.private_subnet_ids : name
      if !can(regex("^subnet-", name))
    ]) == 0 && length(var.private_subnet_ids) >= 2
    error_message = "Argument 'private_subnet_ids' must be empty or contain list of private network ids, at least two networks. Also must begin with 'subnet-'."
  }
}

variable "protocol" {
  default     = "TCP"
  description = "Protocol to use between the service and the load balancer"
  type        = string
  validation {
    condition     = contains(["TCP", "TLS", "UDP", "TCP_UDP", "HTTP", "HTTPS"], var.protocol)
    error_message = "Must be one of TCP, TLS, UDP, TCP_UDP, HTTP or HTTPS. For ALBs, must be HTTP or HTTPS."
  }
}

variable "health_check_protocol" {
  default     = "TCP"
  description = "Protocol to use between the service and the load balancer for health check"
  type        = string
  validation {
    condition     = contains(["TCP", "TLS", "UDP", "TCP_UDP", "HTTP", "HTTPS"], var.health_check_protocol)
    error_message = "Must be one of TCP, TLS, UDP, TCP_UDP, HTTP or HTTPS. For ALBs, must be HTTP or HTTPS."
  }
}

variable "tls_passthrough" {
  default     = false
  description = <<-EODESC
    Set to true to terminate TLS at your application, not at the load balancer.
    This is more secure, but less common.  Your application must have this capability for it to work.
    Applies to listeners for NLB only.
  EODESC
  type        = bool
}

variable "outbound_from_port" {
  description = "The starting port for outbound traffic allowed by the security group rule."
  type        = number
  default     = 0
}

variable "outbound_to_port" {
  description = "The ending port for outbound traffic allowed by the security group rule."
  type        = number
  default     = 0
}

variable "outbound_protocol" {
  description = "Outbound traffic protocol. Options: 'tcp', 'udp', 'icmp', or '-1' (all)."
  type        = string
  default     = "-1" # Default to all protocol
}

# ECS READY STATE CHECK OPTIONS

variable "wait_for_steady_state" {
  description = "If true, Terraform will wait for the service to reach a steady state — as in, the ECS tasks you wanted are actually deployed — before 'apply' is considered complete."
  type        = bool
  default     = true
}

variable "service_create_update_timeout" {
  description = "Use this variable to adjust the default timeout of 20m for create and update operations the the ECS service. Adjusting the value can be particularly useful when using 'wait_for_steady_state'."
  type        = string
  default     = "20m"
}

variable "service_delete_timeout" {
  description = "Use this variable to adjust the default timeout of 5m for delete operations the the ECS service."
  type        = string
  default     = "5m"
}

# Canary configuration
variable "desired_number_of_ecs_canary_tasks_to_run" {
  description = "How many Tasks to run of the var.ecs_task_definition_canary to deploy for a canary deployment. Typically, only 0 or 1 should be used."
  type        = number
  default     = 0
}

variable "ecs_task_definition_canary" {
  description = "The JSON text of the ECS Task Definition to be run for the canary. This defines the Docker container(s) to be run along with all their properties. It should adhere to the format described at https://goo.gl/ob5U3g. Defaults to the container definition used in var.container if not provided."
  type = list(object({
    name      = string
    image     = string
    http_port = number
    cpu       = number
    memory    = number
    env_vars  = map(string)
  }))
  default = null
}

# Circuit Breaker configuration

variable "deployment_circuit_breaker" {
  description = "Set enable to 'true' to prevent the task from attempting to continuously redeploy after a failed health check. Set rollback to 'true' to also automatically roll back to the last successful deployment. If this setting is used, both 'enable' and 'rollback' are required fields."
  type = object({
    enable   = bool
    rollback = bool
  })
  default = null
}

variable "deployment_cloudwatch_alarms" {
  description = "CloudWatch alarms which triggers deployment rollback if failure."
  type = object({
    cloudwatch_alarms = list(string)
    enable            = bool
    rollback          = bool
  })
  default = null
}

# Service Discovery configuration

variable "use_service_discovery" {
  description = "Set this variable to 'true' to setup service discovery for the ECS service by automatically registering the task IPs to a registry that is created within this module. Currently this is only supported with the 'awsvpc' networking mode."
  type        = bool
  default     = false
}

variable "discovery_namespace_name" {
  description = "The host name for the service discovery namespace. Example: example-staging.local"
  type        = string
  default     = null
}

variable "discovery_custom_health_check_failure_threshold" {
  description = "The number of 30-second intervals that you want service discovery to wait before it changes the health status of a service instance. Maximum value of 10. Only used if var.use_service_discovery is true."
  type        = number
  default     = 1
}

variable "discovery_dns_ttl_seconds" {
  description = "The amount of time, in seconds, that you want DNS resolvers to cache the settings for this resource record set. Only used if var.use_service_discovery is true."
  type        = number
  default     = 60
}

variable "discovery_dns_routing_policy" {
  description = "The routing policy that you want to apply to all records that Route 53 creates when you register an instance and specify the service. Valid Values: MULTIVALUE, WEIGHTED. Only used if var.use_service_discovery is true."
  type        = string
  default     = "MULTIVALUE"
}

variable "discovery_alias_record_evaluate_target_health" {
  description = "Check alias target health before routing to the service. Only used if var.discovery_use_public_dns is true."
  type        = bool
  default     = true
}

# Datadog Agent Configuration
variable "enable_datadog_agent" {
  description = "Set to true to enable the Datadog Agent. This will collect metrics from you instances. May incur additional costs."
  type        = bool
  default     = false
}

variable "dd_api_key_path" {
  description = "The name of the SSM parameter that holds your Datadog API key. Required if enable_datadog_agent is set to true."
  type        = string
  default     = null
}

variable "additional_datadog_env_vars" {
  description = "Additional environment variables to pass to the Datadog Agent container. This should be a map of key/value pairs. For example: { DD_ENV = 'staging', DD_SERVICE = 'my-service' }. DD_API_KEY, DD_SITE, and ECS_FARGATE are reserved and may not be set here. For more information on available environment variables, see https://docs.datadoghq.com/containers/docker/#environment-variables."
  type        = map(string)
  default     = {}
  nullable    = false
  validation {
    condition     = !contains(keys(var.additional_datadog_env_vars), "DD_API_KEY") && !contains(keys(var.additional_datadog_env_vars), "DD_SITE") && !contains(keys(var.additional_datadog_env_vars), "ECS_FARGATE")
    error_message = "You may not set DD_API_KEY, DD_SITE, or ECS_FARGATE in additional_datadog_env_vars, as these are reserved."
  }
}

# Gremlin Sidecar Configuration
variable "enable_gremlin_chaos" {
  description = "Set to true to enable Gremlin Chaos Engineering and allow experiments to affect your application."
  type        = bool
  default     = false
}

variable "enable_gremlin_sidecar" {
  description = "Set to true to add the Gremlin Sidecar container to task definition"
  type        = bool
  default     = false
}

variable "gremlin_config_ssm_parameter_arn" {
  description = "The ARN of the SSM parameter that holds your Gremlin config information. Required if enable_gremlin_chaos is set to true."
  type        = string
  default     = null
}

variable "gremlin_debug_enabled" {
  description = "Set to true to enable debugging for the Gremlin Sidecar."
  type        = bool
  default     = false
}

variable "gremlin_trace_enabled" {
  description = "Set to true to enable tracing for the Gremlin Sidecar."
  type        = bool
  default     = false
}

variable "ec2_task_operating_system" {
  type        = string
  description = "The operating system of the ECS Task. Valid values are 'LINUX' or 'WINDOWS'. Used for the Datadog Agent definition. This value is ignored enable_datadog_agent is false and if ecs_service_launch_type is FARGATE."
  default     = "LINUX"

  validation {
    condition     = contains(["LINUX", "WINDOWS"], var.ec2_task_operating_system)
    error_message = "Attribute `ec2_task_operating_system` must be either 'LINUX' or 'WINDOWS'."
  }
}

/* ALB sticky sessions */
variable "alb_use_sticky_sessions" {
  type        = bool
  default     = false
  description = "Whether to use sticky sessions (affinity) with ALB."
  validation {
    condition     = contains([true, false], var.alb_use_sticky_sessions)
    error_message = "Argument 'alb_use_sticky_sessions' must be either true or false."
  }
}

variable "alb_sticky_session_type" {
  type        = string
  default     = "lb_cookie"
  description = "The type of sticky sessions, only 'lb_cookie' is supported for ALB."
  validation {
    condition     = contains(["lb_cookie"], var.alb_sticky_session_type)
    error_message = "Argument 'alb_sticky_session_type' must be set to 'lb_cookie'."
  }
}

variable "alb_sticky_session_cookie_duration_seconds" {
  type        = number
  default     = 86400 # 1 day
  description = "The duration in seconds for the sticky session to be valid from ALB perspective, should be between 1 second and 1 week (604800 seconds), inclusive."
  validation {
    condition     = var.alb_sticky_session_cookie_duration_seconds >= 1 && var.alb_sticky_session_cookie_duration_seconds <= 604800
    error_message = "Argument 'alb_sticky_session_cookie_duration' must be between 1 second and 1 week (604800 seconds), inclusive."
  }
}

/*
  LB Configuration
*/

variable "create_lb" {
  type        = bool
  default     = true
  description = "Decide when you need to create Load Balancer or deploy with existing one. Default is true."
}

variable "lb_slow_start" {
  type        = number
  default     = 30
  description = "Amount time for targets to warm up before the load balancer sends them a full share of requests. Range is 30-900 seconds or 0 to disable."
  validation {
    condition     = var.lb_slow_start >= 0 && var.lb_slow_start <= 900
    error_message = "Argument 'health_check_grace_period_seconds' must be within 0-900 range, 0 to disable."
  }
}

variable "lb_allow_inbound_from_cidr_blocks" {
  type        = list(string)
  default     = ["0.0.0.0/0"]
  description = "The list of CIDRs to allow inbound requests to the Load Balancer from, default to '0.0.0.0/0' (any source)."
  validation {
    condition = !contains(
      [for x in var.lb_allow_inbound_from_cidr_blocks :
        can(regex("^([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/[0-9]{1,2})$", x))
    ], false)
    error_message = "Argument 'lb_allow_inbound_from_cidr_blocks' should be list of IPv4 CIDRs."
  }
}

variable "lb_allow_outbound_from_cidr_blocks" {
  type        = list(string)
  default     = ["0.0.0.0/0"]
  description = "The list of CIDRs to allow outbound requests to the Load Balancer from, default to '0.0.0.0/0' (any source)."
  validation {
    condition = !contains(
      [for x in var.lb_allow_outbound_from_cidr_blocks :
        can(regex("^([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/[0-9]{1,2})$", x))
    ], false)
    error_message = "Argument 'lb_allow_outbound_from_cidr_blocks' should be list of IPv4 CIDRs."
  }
}

variable "existing_lb_name" {
  type        = string
  default     = null
  description = "The name of the existing Load Balancer to be used. NOTE: `create_lb` should be `false` in case of `existing_lb_name` specified."
  validation {
    condition     = var.existing_lb_name != null ? length(var.existing_lb_name) <= 32 : var.existing_lb_name == null
    error_message = "The name of existing Load Balancer cannot be longer than 32 characters."
  }
}

variable "is_lb_public" {
  default     = true
  type        = bool
  description = "The LB type to select public or private subnets to use. Set false to use private network with LB."
}

variable "lb_type" {
  type        = string
  default     = "application"
  description = "Indication the type of a load balancer, possible values are: 'application' and 'network'."
  validation {
    condition     = contains(["application", "network"], var.lb_type)
    error_message = "Argument  'lb_type' must be either application or network."
  }
}

variable "lb_logs_bucket_force_destroy" {
  description = "Force destroy S3 buckets for Load Balancer logs"
  type        = bool
  default     = false
}

variable "lb_security_group_ids" {
  type        = list(string)
  default     = []
  description = "List of security group IDs to assign to the Load Balancer. NOTE: Security groups cannot be added if none are currently present, and cannot all be removed once added. If either of these conditions are met, this will force a recreation of the resource."
}

variable "lb_enable_shield_advanced" {
  description = "Enable AWS Shield Advanced for the load balancer. This will incur additional costs."
  type        = bool
  default     = false
}

variable "lb_shield_aggregation_method" {
  default     = "SUM"
  description = "An aggregation method for the protection group to detect anomalies. Valid values are 'SUM', 'MEAN','MAX'"
  type        = string
}

variable "lb_subnet_ids" {
  type        = list(string)
  default     = []
  description = "List of public (when 'is_lb_public' set to 'true') or private (when 'is_lb_public' set to 'false') subnet IDs for Load Balancer."
  validation {
    condition = length(var.lb_subnet_ids) == 0 || length([
      for name in var.lb_subnet_ids : name
      if !can(regex("^subnet-", name))
    ]) == 0 && length(var.lb_subnet_ids) >= 2
    error_message = "Argument 'lb_subnet_ids' must be empty or contain list of public network ids, at least two networks. Also must begin with 'subnet-'."
  }
}

variable "lb_s3_logs_lifecycle_configuration_rules" {
  description = "Lifecycle policy to be applied to the logging S3 bucket."
  type = list(object({
    enabled                                = bool
    id                                     = string
    abort_incomplete_multipart_upload_days = number
    # `filter_and` is the `and` configuration block inside the `filter` configuration.
    # This is the only place you should specify a prefix.
    filter_and                    = any
    expiration                    = any
    transition                    = list(any)
    noncurrent_version_expiration = any
    noncurrent_version_transition = list(any)
  }))
  default = [{
    enabled                                = true
    id                                     = "access_logging_lifecycle"
    filter_and                             = null
    transition                             = null
    noncurrent_version_transition          = null
    noncurrent_version_expiration          = null
    abort_incomplete_multipart_upload_days = 90
    expiration = {
      days = 365
    }
  }]
}

variable "lb_access_logs_s3_bucket_name" {
  description = "The S3 Bucket name where NLB logs should be stored. If no value is provided, will use <name_prefix>-<environment>-<aws_region_cd>-aw-<service_name>-accesslogs."
  type        = string
  default     = null
}

variable "access_logging_enabled" {
  type        = bool
  description = <<-EOT
    Specifies if bucket access logging should be enabled. If set to false, accesslogs_bucketname and 
    accesslogs_bucketprefix will be ignored.
  EOT
  default     = true
}

variable "accesslogs_bucketprefix" {
  type        = string
  description = "The prefix for the access log bucket. Will be ignored if access_logging_enabled is set to false."
  default     = "accesslogs/S3/"
}

/* SSL variables */
variable "https_listener_port" {
  type        = number
  default     = 443
  description = "The HTTPS list the load balancer should listen on"
  validation {
    condition     = var.https_listener_port >= 1 && var.https_listener_port <= 65535
    error_message = "Argument 'https_listener_port' must be within 1-65535 range."
  }
}

/*
  NLB Configuration
*/

variable "nlb_enable_deletion_protection" {
  description = "This will prevent Terraform from deleting the network load balancer if the value is true"
  type        = bool
  default     = true
}

variable "nlb_enforce_security_group_inbound_rules_on_private_link_traffic" {
  default     = true
  description = "Whether or not to enforce ingress security rules when traffic originates from PrivateLink"
  type        = bool
}

variable "s3_replication_enabled" {
  type        = bool
  description = "Set this to true and specify `s3_replication_rules` to enable replication. `versioning_enabled` must also be `true`."
  default     = false
}

variable "s3_replication_rules" {
  type = list(object({
    id       = string
    status   = optional(string, "Enabled")
    priority = number
    prefix   = optional(string)

    # Delete marker replication - support both formats
    delete_marker_replication = optional(object({
      status = string
    }))

    # Destination bucket options
    destination = object({
      bucket        = optional(string)
      storage_class = optional(string, "STANDARD")
      encryption_configuration = optional(object({
        replica_kms_key_id = string
      }))
      access_control_translation = optional(object({
        owner = string
      }))
      account = optional(string)
      metrics = optional(object({
        event_threshold = optional(object({
          minutes = optional(number, 15)
        }), { minutes = 15 })
        status = optional(string, "Enabled")
      }), { status = "Disabled" })
      replication_time = optional(object({
        time = optional(object({
          minutes = optional(number, 15)
        }), { minutes = 15 })
        status = optional(string)
      }))
    })

    source_selection_criteria = optional(object({
      replica_modifications = optional(object({
        status = string
      }))
      sse_kms_encrypted_objects = optional(object({
        status = optional(string)
      }))
    }))

    filter = optional(object({
      prefix = optional(string)
      tags   = optional(map(string), {})
    }))
  }))
  description = "Specifies the replication rules for S3 bucket replication if enabled. You must also set s3_replication_enabled to true."
  default     = null
}

variable "allow_override_iam_delegation" {
  description = "Allow user to override IAM delegation."
  type        = bool
  default     = false
}

variable "source_policy_documents" {
  type        = list(string)
  default     = []
  description = <<-EOT
    List of IAM policy documents (in JSON) that are merged together into the final bucket policy.
    Statements defined in source_policy_documents must have unique SIDs.
    Note that if the policy documents are not specific enough (but still valid), 
    Terraform may view them as constantly changing in a terraform plan. 
    In this case, please make sure you use the verbose/specific version of the policies.
  EOT
}

variable "cmk_existing_key_arn" {
  type        = string
  default     = null
  description = "The ARN of an existing CMK/KMS key used for the `SSE-KMS` encryption. Providing a value for 'cmk_existing_key_arn' will cause all other cmk variables to be ignored."
  validation {
    condition     = var.cmk_existing_key_arn != ""
    error_message = "cmk_existing_key_arn cannot be an empty string. Please remove this variable if unused."
  }
}

/*
  ALB Configuration
*/

variable "additional_security_group_ids" {
  description = "Add additional security groups to the ALB"
  type        = list(string)
  default     = []
}

variable "alb_allow_inbound_from_security_group_ids" {
  description = "The IDs of security groups from which this ALB will allow incoming requests."
  type        = list(string)
  default     = []
}

variable "alb_default_action" {
  description = "Define the default action if a request to the ALB load balancer does not match any of your listener rules. Currently only 'fixed-response' and 'redirect' are supported. https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener#default_action"
  type        = map(any)
  default = {
    fixed-response = {
      content_type = "text/plain"
      message_body = null
      status_code  = 404
    }
  }
}

/*
  LB Listener Rules Config
*/

variable "create_listeners" {
  default     = true
  type        = bool
  description = "Indicates whether to create new listeners. If set to true, it will create listeners based on the values of https_listener_ports_and_ssl_certs and http_listener_ports."
}

variable "https_listener_arns" {
  description = "A list of objects providing ARNs of existing HTTPS listeners to attach the rules to. Each object has keys 'port'(number), the port number the listener is connected to, and 'arn'(string), the ARN of the listener to which to attach the rule."
  type = list(object({
    port = number
    arn  = string
  }))
  default = []
}

variable "create_redirect_listener_rule" {
  default     = true
  type        = bool
  description = "Indicates whether to create a redirect action rule for your HTTP listener(s). This requires at least one HTTP listener to add this rule to. Either existing listener arns must be provided in `http_listener_arns` to create the HTTP listeners to add this rule to. This rule will take the highest priority preventing user defined rules from being applied."
}

variable "lb_listener_rules_default_actions" {
  description = <<-EOT
    A list of objects defining default actions for the listeners. You must either pass in one map to
    be applied to all created listeners, or one for each entry in `https_listener_ports_and_ssl_certs`
    with the corresponding port defined in the `port` attributes. The maps must contain the key 'type'
    which can be either 'forward', 'redirect' or 'fixed-response'. If this list is left empty, the
    default_action will be set to forward traffic to the target group specified in the 'target_group_arn'
    variable if use_nlb is true, or to return a 404 response if use_alb is true. See the README for more details.
    EOT
  type = list(object({
    type = string
    port = optional(number)
    fixed_response = optional(object({
      content_type = string
      message_body = optional(string)
      status_code  = optional(string)
    }))
    forward = optional(object({
      target_group = list(object({
        arn    = string
        weight = optional(number)
      }))
      stickiness = optional(object({
        duration = number
        enabled  = optional(bool)
      }))
    }))
    order = optional(number)
    redirect = optional(object({
      status_code = string
      host        = optional(string)
      path        = optional(string)
      port        = optional(string)
      protocol    = optional(string)
      query       = optional(string)
    }))
  }))
  default = []
}

variable "lb_listener_forward_rules" {
  description = <<-EOT
  A list of custom forward rules to be added to your listeners. These will all point to
  the target group specified by var.target_group_arns unless target_groups are specified
  in this variable. You may also optionally include a stickiness value (an object containing the
  values `enabled` a boolean specifying whether to turn on stickiness, and `duration` the time period,
  in seconds, during which requests from a client should be routed to the same target group for this rule)
  Stickiness will only apply if more than one target group is specified. These rules will be applied
  to the listeners specified in listener_arns or listener_ports. You must provide either listener_arns
  or listener_ports. The rule will be applied to the specified listeners. At least one condition must also be
  provided. Possible conditions include path_patterns, host_headers, source_ips, query_strings, and
  http_request_methods. Each is a list of strings except for query_strings which is a list of objects
  with keys 'key' and 'value'. All conditions must match for the rule to be applied.
  EOT
  type = list(object({
    priority = number
    target_group_arns = optional(list(object({
      arn    = string
      weight = optional(number)
    })))
    stickiness = optional(object({
      enabled  = bool
      duration = optional(number)
    }))
    path_patterns = optional(list(string), [])
    host_headers  = optional(list(string), [])
    source_ips    = optional(list(string), [])
    query_strings = optional(list(object({
      key   = optional(string)
      value = string
    })), [])
    http_request_methods = optional(list(string), [])
    listener_ports       = optional(list(number))
    listener_arns        = optional(list(string))
  }))
  default = []
}

variable "lb_listener_redirect_rules" {
  description = <<-EOT
  A list of custom redirect rules to be added to your listeners. You will specify the address to redirect to using the
  attributes: host, path, port, protocol, and query. These get combined into `protocol://host:port/path?query`,
  and any value not provided will default to the original value from the incoming request. These rules will be applied
  to the listeners specified in listener_arns or listener_ports. You must provide either listener_arns
  or listener_ports. The rule will be applied to the specified listeners. At least one condition must also be provided.
  Possible conditions include path_patterns, host_headers, source_ips, query_strings, and http_request_methods.
  Each is a list of strings except for query_strings which is a list of objects with keys 'key' and 'value'.
  All conditions must match for the rule to be applied.
  EOT
  type = list(object({
    priority      = number
    status_code   = string
    host          = optional(string)
    path          = optional(string)
    port          = optional(number)
    protocol      = optional(string)
    query         = optional(string)
    path_patterns = optional(list(string), [])
    host_headers  = optional(list(string), [])
    source_ips    = optional(list(string), [])
    query_strings = optional(list(object({
      key   = optional(string)
      value = string
    })), [])
    http_request_methods = optional(list(string), [])
    listener_ports       = optional(list(number))
    listener_arns        = optional(list(string))
  }))
  default = []
}

variable "lb_listener_fixed_response_rules" {
  description = <<-EOT
  A list of custom fixed response rules to be added to your listeners. You must specify the content_type
  (Valid values are `text/plain`, `text/css`, `text/html`, `application/javascript` and `application/json`)
  and status_code (Valid values are `2XX`, `4XX`, or `5XX`.) attribute
  and may optionally specify the message_body attributes. These rules will be applied
  to the listeners specified in listener_arns or listener_ports. You must provide either listener_arns
  or listener_ports. The rule will be applied to the specified listeners. At least one condition must also be provided.
  Possible conditions include path_patterns, host_headers, source_ips, query_strings, and http_request_methods.
  Each is a list of strings except for query_strings which is a list of objects with keys 'key' and 'value'.
  All conditions must match for the rule to be applied.
  EOT
  type = list(object({
    priority      = number
    content_type  = string
    status_code   = string
    message_body  = optional(string)
    path_patterns = optional(list(string), [])
    host_headers  = optional(list(string), [])
    source_ips    = optional(list(string), [])
    query_strings = optional(list(object({
      key   = optional(string)
      value = string
    })), [])
    http_request_methods = optional(list(string), [])
    listener_ports       = optional(list(number))
    listener_arns        = optional(list(string))
  }))
  default = []
}

/* 
  CloudWatch variables 
*/
variable "cw_existing_key_arn" {
  type        = string
  default     = null
  description = "The ARN of an existing CMK/KMS key used for the `SSE-KMS` encryption. Used for encrypting the CloudWatch Log Group."
  validation {
    condition     = var.cw_existing_key_arn != ""
    error_message = "cw_existing_key_arn cannot be an empty string. Please remove this variable if unused."
  }
}

variable "cloudwatch_log_group" {
  type        = string
  default     = null
  description = "CloudWatch Log Group to group logs from containers as group."
}

variable "log_retention_period_days" {
  description = "How long in days the Cloudwatch logs are stored before being deleted."
  default     = 30
  type        = number
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_period_days)
    error_message = "Argument 'log_retention_period_days' must be either 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653."
  }
}

variable "cloudwatch_logs_stream_prefix" {
  type        = string
  description = "The 'cloudwatch_logs_stream_prefix' option allows you to associate a log stream with the specified prefix."
  default     = null
}

variable "cloudwatch_force_destroy" {
  type        = bool
  default     = false
  description = "Controls whether the cloudwatch log group, along with its corresponding, logs gets destroyed upon a `terraform destroy`. If set to false then the group will simply be removed from the terraform state. This can only be set to true in non-prod environments"
}

/*
  Autoscaling Configuration
*/

variable "scaling_metric" {
  type        = string
  default     = "cpu"
  description = "Define the metric for auto scaling process to refer. (e.g. memory or cpu.)"
  validation {
    condition     = contains(["cpu", "memory"], var.scaling_metric)
    error_message = "Argument 'scaling_metric' must be either 'cpu' or 'memory'."
  }
}

variable "use_auto_scaling" {
  type        = bool
  default     = true
  description = "Autoscaling configuration. Set false to disable Autoscaling"
}

variable "min_number_of_tasks" {
  type        = number
  default     = 1
  description = "Autoscaling configuration. Set minimum number of tasks"
}

variable "max_number_of_tasks" {
  type        = number
  default     = 4
  description = "Autoscaling configuration. Set maximum number of tasks"
}

variable "metric_aggregation_type" {
  type        = string
  default     = "Average"
  description = "The aggregation type for the policy's metrics. Valid values are 'Minimum', 'Maximum', and 'Average'. Without a value, AWS will treat the aggregation type as 'Average'"
  validation {
    condition     = contains(["Minimum", "Maximum", "Average"], var.metric_aggregation_type)
    error_message = "Argument  'metric_aggregation_type' must be either 'Minimum', 'Maximum', or 'Average'."
  }
}

variable "upscale_threshold" {
  type        = number
  default     = 50
  description = "Trigger for Alarm to increase number of tasks"
}

variable "downscale_threshold" {
  type        = number
  default     = 10
  description = "Trigger for Alarm to decrease number of tasks"
}

variable "statistic" {
  type        = string
  default     = "Average"
  description = "The statistic of the metric. Valid values: Average, Minimum, Maximum, SampleCount, and Sum."
  validation {
    condition     = contains(["Minimum", "Maximum", "Average", "SampleCount", "Sum"], var.statistic)
    error_message = "Argument  'statistic' must be either Average, Minimum, Maximum, SampleCount, and Sum."
  }
}

variable "period" {
  type        = number
  default     = 60
  description = "The period in seconds over which the specified statistic is applied."
}

variable "evaluation_periods" {
  type        = number
  default     = 2
  description = "How many checks should fail for Alarm trigger"
}

variable "autoscaling_cooldown" {
  type        = number
  default     = 60
  description = "Time to wait after last scaling activities"
}

variable "custom_ecs_cloudwatch_alarms" {
  type        = any
  default     = {}
  description = "Map of cloudwatch alarms to create. This object can be used to override the default set created for the application. To learn more about the format of alarms, see https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/blob/master/cloudwatch/monitoring/README.md"
}

/*
  DATABASE CONFIGURATION
*/

variable "db_name" {
  description = "The name for your database of up to 8 alpha-numeric characters."
  type        = string
  default     = null
}

variable "db_engine" {
  description = "The DB engine to use (e.g. mysql, postgres)."
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "The database engine version to use."
  type        = string
  default     = "14"
}

variable "db_port" {
  description = "The port the DB will listen on (e.g. 3306)"
  type        = number
  default     = 5432
}

variable "db_instance_type" {
  description = "The database instance type (e.g. db.t3.micro)."
  type        = string
  default     = "db.t3.micro"
}

variable "master_username" {
  description = "The username for the master user. Required unless var.replicate_source_db is set."
  type        = string
  default     = null
}

variable "skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created before the DB instance is deleted."
  type        = bool
  default     = false
}

variable "db_allocated_storage" {
  description = "The amount of storage space the DB should use, in GB."
  type        = number
  default     = 10
}

variable "db_max_allocated_storage" {
  description = "When configured, the upper limit to which Amazon RDS can automatically scale the storage of the DB instance."
  type        = number
  default     = 50
}

variable "multi_az" {
  description = "Specifies if a standby instance should be deployed in another availability zone. If the primary fails, this instance will automatically take over."
  type        = bool
  default     = false
}

variable "backup_retention_period_days" {
  description = "How many days to keep backup snapshots around before cleaning them up. Must be 1 or greater to support read replicas."
  type        = number
  default     = 7
  validation {
    condition     = var.backup_retention_period_days >= 7 && var.backup_retention_period_days <= 14
    error_message = "Argument  'backup_retention_period' must be greater or equal 7, and not greater than 14, default value is 7."
  }
}

variable "backup_window" {
  description = "The daily time range during which automated backups are created (e.g. 04:00-09:00). Time zone is UTC. Performance may be degraded while a backup runs."
  type        = string
  default     = "04:00-05:00"
  validation {
    condition     = can(regex("[0-9]{2}:[0]{2}-[0-9]{2}:[0]{2}", var.backup_window))
    error_message = "Argument 'backup_window' should have at least 1h period."
  }
}

variable "threshold_cpu" {
  description = "Value on which alarm will be triggered, for CPU this is percent"
  type        = number
  default     = 80
}

variable "threshold_ram" {
  description = "Value on which alarm will be triggered, for RAM this is bytes (256000000 = 256MB)"
  type        = number
  default     = 256000000
}

variable "threshold_hdd" {
  description = "Value on which alarm will be triggered, for HDD this is bytes (1000000000 = 1GB)"
  type        = number
  default     = 1000000000
}

variable "db_subnet_ids" {
  type        = list(string)
  default     = []
  description = "List of persistence or private subnet ids, for RDS"
  validation {
    condition = length(var.db_subnet_ids) == 0 || length([
      for name in var.db_subnet_ids : name
      if !can(regex("^subnet-", name))
    ]) == 0 && length(var.db_subnet_ids) >= 2
    error_message = "Argument 'db_subnet_ids' must be empty or contain list of subnet ids, at least two networks. Also each must begin with 'subnet-'."
  }
}

variable "db_resource_slug" {
  default     = null
  description = "When given, may be used to differentiate multiple resources with a unique name.  e.g. multiple database/rds Blueprints may be deployed with different slugs to coexist in the same AWS account and environment"
  type        = string
}

variable "db_secret_kms_key_id" {
  description = "The Amazon Web Services KMS key identifier is the key ARN, key ID, alias ARN, or alias name for the KMS key. Used for encrypting the Database Secret. Defaults to shared CMK KMS key"
  type        = string
  default     = null
}

variable "db_cloudwatch_logs_key_arn" {
  description = "The arn of an existing KMS Key to encrypt the Database CloudWatch logs. If this is null, a CMK KMS key will be created for you."
  type        = string
  default     = null
  validation {
    condition     = var.db_cloudwatch_logs_key_arn == null || can(regex("^arn:aws:kms:[a-zA-Z0-9-]+:[0-9]{0,12}:key/[a-zA-Z0-9-]+$", var.db_cloudwatch_logs_key_arn))
    error_message = "Must be a valid ARN or null."
  }
}

variable "rds_key_arn" {
  description = "ARN of an existing KMS key. Used for RDS Database encryption. If this is not provided, a CMK KMS key will be created."
  type        = string
  validation {
    condition     = var.rds_key_arn == null || can(regex("^arn:aws:kms:[a-zA-Z0-9-]+:[0-9]{0,12}:key/[a-zA-Z0-9-]+$", var.rds_key_arn))
    error_message = "Must be a valid ARN or null."
  }
  default = null
}

# https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithDBInstanceParamGroups.html
variable "db_parameter_group_name" {
  description = "Custom name for a DB parameter group to associate. If this value is left blank, a default parameter group will be created automatically. If you intend to use an existing parameter group, provide its name here. If this value is provided, custom_parameter_group_parameters will be ignored."
  type        = string
  default     = null
}

variable "custom_db_parameter_group_parameters" {
  description = "Specify custom parameters to add to the RDS parameter group. If you provide custom values, they will be merged with the existing default parameters defined by the Cloud Security team. In case of overlapping key values between the custom and default parameters, the security requirements defined by the Cloud Security team will take precedence over the custom values."
  type        = map(string)
  default     = null
}

variable "db_custom_option_group_parameters" {
  description = "Specify custom parameters to add to the RDS option group. If you provide custom values, they will be merged with any existing default parameters. Option groups can be created for mysql and sqlserver. Learn more here: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithOptionGroups.html"
  type = list(object({
    option_name = string
    option_settings = optional(object({
      name  = optional(string)
      value = optional(string)
    }))
  }))
  default = []
}

variable "db_allow_connections_from_cidr_blocks" {
  description = "A list of CIDR-formatted IP address ranges that can connect to this DB. Cannot exceed more than 27 CIDR ranges"
  type        = list(string)
  default     = []
  validation {
    condition     = length(var.db_allow_connections_from_cidr_blocks) < 28
    error_message = "Argument 'db_allow_connections_from_cidr_blocks' cannot contain more than 27 CIDR Ranges. Requirement from the Cloud Security team"
  }
}

variable "iam_database_authentication_enabled" {
  description = "Specifies whether IAM database authentication is enabled. This option is only available for MySQL and PostgreSQL engines."
  type        = bool
  default     = true
}

variable "db_maintenance_window" {
  description = "The weekly day and time range during which system maintenance can occur (e.g. wed:04:00-wed:04:30). Time zone is UTC. Performance may be degraded or there may even be a downtime during maintenance windows."
  type        = string
  default     = "sun:07:00-sun:08:00"
}

variable "db_allow_major_version_upgrade" {
  description = "Indicates whether major version upgrades (e.g. 9.4.x to 9.5.x) will ever be permitted. Note that these updates must always be manually performed and will never automatically applied. To learn more about major version upgrades, please visit https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Upgrading.html"
  type        = bool
  default     = true
}

variable "db_apply_immediately" {
  description = "Specifies whether any cluster modifications are applied immediately, or during the next maintenance window. Note that cluster modifications may cause degraded performance or downtime."
  type        = bool
  default     = false
}

variable "db_snapshot_identifier" {
  description = "If non-null, the RDS Instance will be restored from the given Snapshot ID. This is the Snapshot ID you'd find in the RDS console, e.g: rds:production-2015-06-26-06-05."
  type        = string
  default     = null
}

variable "db_deletion_protection" {
  description = "If the DB instance should have deletion protection enabled. The database can't be deleted when this value is set to true. This is a High Availability Disaster Recovery (HADR) field. Learn more in the README"
  type        = bool
  default     = true
}

# Read Replica Parameters
variable "db_num_read_replicas" {
  description = "The number of read replicas to create. RDS will asynchronously replicate all data from the master to these replicas, which you can use to horizontally scale reads traffic."
  type        = number
  default     = 0
}

variable "additional_db_read_replica_instance_security_group_ids" {
  description = "List of IDs of AWS Security Groups to attach to the read replica RDS instance."
  type        = list(string)
  default     = []
}

variable "allow_connections_from_cidr_blocks_to_db_read_replicas" {
  description = "A list of CIDR-formatted IP address ranges that can connect to read replica instances. If not set read replica instances will use the same security group as master instance."
  type        = list(string)
  default     = []
}

variable "allowed_db_read_replica_zones" {
  description = "The availability zones within which it should be possible to spin up replicas"
  type        = list(string)
  default     = []
}

variable "parameter_group_name_for_db_read_replicas" {
  description = "Name of a DB parameter group to associate with read replica instances. Defaults to var.parameter_group_name if not set."
  type        = string
  default     = null
}

variable "db_replica_backup_retention_period_days" {
  description = "How many days to keep backup snapshots around before cleaning them up on the read replicas. Must be 1 or greater to support read replicas. 0 means disable automated backups."
  type        = number
  default     = 0
}

# Database Monitoring and Observability Parameters

variable "db_monitoring_interval_seconds" {
  type        = number
  description = "The interval, in seconds, between points when Enhanced Monitoring metrics are collected for the DB instance. To disable collecting Enhanced Monitoring metrics, specify 0. Allowed values: 0, 1, 5, 15, 30, 60. Note: This can increase cost based on CloudWatch storage and transfer rates."
  default     = 0
}

variable "monitoring_role_arn" {
  type        = string
  description = "The ARN for the IAM role that permits RDS to send enhanced monitoring metrics to CloudWatch Logs. If ARN is not provided, a role will be created."
  default     = null
}

variable "performance_insights_enabled" {
  type        = bool
  description = "Specifies whether Performance Insights is enabled or not. On Aurora MySQL, Performance Insights is not supported on db.t2 or db.t3 DB instance classes. Note: This will increase cost if retention period is longer than 7 days."
  default     = false
}

variable "performance_insights_kms_key_id" {
  type        = string
  description = "The ARN for the KMS key to encrypt Performance Insights data. Defaults to shared CMK KMS Key."
  default     = null
}

variable "performance_insights_retention_period_days" {
  type        = number
  description = "The amount of time in days to retain Performance Insights data. Valid options are 7, 31, 62, 93, 124, 155, 186, 217, 248, 279, 310, 341, 372, 403, 434, 465, 496, 527, 558, 589, 620, 651, 682, 713, 731. When specifying performance_insights_retention_period, performance_insights_enabled needs to be set to true. Defaults to 7. Note: This will increase cost if retention period is longer than 7 days."
  default     = 0
}

variable "db_period_seconds" {
  type        = number
  default     = 60
  description = "The period, in seconds over which the specified statistic is applied."
}

variable "db_storage_type" {
  description = "The type of storage to use for the primary instance. Must be one of 'standard' (magnetic), 'gp2' (general purpose SSD), 'gp3' (general purpose SSD), io1' (provisioned IOPS SSD), or 'io2' (2nd gen provisioned IOPS SSD)."
  type        = string
  default     = "gp2"
  validation {
    condition     = contains(["standard", "gp2", "gp3", "io1", "io2"], var.db_storage_type)
    error_message = "Invalid db_storage_type and must be either 'standard', 'gp2', 'gp3', 'io1', or 'io2'."
  }
}

variable "db_iops" {
  description = "The amount of provisioned IOPS for the primary instance. Setting this implies a storage_type of 'io1','io2, or 'gp3'. Set to 0 to disable."
  type        = number
  default     = 0
}

variable "create_log_group" {
  type        = bool
  default     = true
  description = "Set to true to create and manage CloudWatch log groups for RDS. Set to false to use AWS-managed log groups without Terraform management."
}

/*
  Route53 configuration
*/

variable "route53_zone_name" {
  description = "Public DNS zone name; when creating private DNS certificates and records, this zone must be set to a public zone containing the private zone as a subdomain. See README.md Notes for more information"
  type        = string
  default     = null
  validation {
    condition     = var.route53_zone_name != null && can(regex("^(?:[A-Za-z0-9-]{1,63}\\.)*(?:[A-Za-z0-9-]*toyota[A-Za-z0-9-]*\\.com|4poc\\.net|[A-Za-z0-9-]*lexus[A-Za-z0-9-]*\\.com)$", var.route53_zone_name))
    error_message = "Argument 'route53_zone_name' must be existing zone in route53, must contain alphanumeric characters, hyphens and can't be empty, and must match '*toyota*.com', '*4poc.net', or '*lexus*.com'."
  }
}

variable "route53_zone_name_private" {
  description = "Private DNS zone name; used only when var.route53_private_zone is true"
  type        = string
  default     = null
  validation {
    condition     = var.route53_zone_name_private == null || can(regex("^(?:[A-Za-z0-9-]{1,63}\\.)*(?:[A-Za-z0-9-]*toyota[A-Za-z0-9-]*\\.com|4poc\\.net|[A-Za-z0-9-]*lexus[A-Za-z0-9-]*\\.com)$", var.route53_zone_name_private))
    error_message = "Argument 'route53_zone_name_private' can be empty or must be existing private zone in route53, must contain only alphanumeric characters and hyphens, and must match '*toyota*.com', '*4poc.net', or '*lexus*.com'."
  }
}

variable "route53_cname" {
  description = "CNAME for application"
  type        = string
  default     = null
  validation {
    condition     = var.route53_cname == null || can(regex("[A-Za-z0-9-.]{3,64}", var.route53_cname))
    error_message = "Argument 'route53_cname' can be empty or must be in existing zone (route53_zone_name parameter) and contain alphanumeric characters, hyphens."
  }
}

variable "route53_ttl" {
  description = "Route53 record ttl"
  type        = number
  default     = 60
}

variable "route53_private_zone" {
  description = "Private hosted DNS zone. Only set to true if the zone name in var.zone_name is a private zone."
  type        = bool
  default     = false
}

# Route53 Routing Policy variables

variable "route53_set_identifier" {
  description = "Unique identifier to identify records using routing policies. Required if you specify a routing policy."
  type        = string
  default     = null
}

variable "route53_cidr_routing_policy" {
  description = "A block indicating a routing policy based on the IP network ranges of requestors. Conflicts with any other routing policy"
  type = object({
    collection_id = string
    location_name = string
  })
  default = null
}

variable "route53_failover_routing_policy" {
  description = "A string indicating whether this record is the PRIMARY or SECONDARY record for a failover routing policy. The PRIMARY record must have an associated health check. Conflicts with any other routing policy."
  type        = string
  default     = null
}

variable "route53_failover_health_check_id" {
  description = "The ID of the health check the record should be associated with. Required if you specify a failover routing policy."
  type        = string
  default     = null
}

variable "route53_geolocation_routing_policy" {
  description = "A block indicating a routing policy based on the geolocation of the requestor. You must provide at least one of continent or country. See the README for documentation on valid inputs. Conflicts with any other routing policy."
  type = object({
    continent   = optional(string, null)
    country     = optional(string, null)
    subdivision = optional(string, null)
  })
  default = null
}

variable "route53_latency_routing_policy" {
  description = "The AWS region to compare the requestors latency to for a latency based routing policy. Conflicts with any other routing policy."
  type        = string
  default     = null
}

variable "route53_multivalue_answer_routing_policy" {
  description = "Set to true to indicate a multivalue answer routing policy. This will allow multiple IPs to be returned for a single request. Conflicts with any other routing policy."
  type        = bool
  default     = null
}

variable "route53_weighted_routing_policy" {
  description = "A number indicating a weight for this record. Use these records to balance the load across multiple resources. Conflicts with any other routing policy."
  type        = number
  default     = null
}

variable "route53_alias_records" {
  description = "A block indicating an alias resource record set. Conflicts with ttl and record_names."
  type = object({
    name                   = string
    zone_id                = string
    evaluate_target_health = bool
  })
  default = null
}

variable "subject_alternative_names" {
  description = <<-EOT
    A list of additional Subject Alternative Names (SANs) to be added to the ACM certificate.
    These should be fully qualified names matching the domain provided at route53_zone_name variable.
    
    If a route53_cname value is provided, it will be automatically included as a SAN.
    Note: This module does not create Route53 records for the specified SANs.
  EOT
  type        = list(string)
  default     = []
}

variable "fqdn" {
  type        = string
  default     = null
  description = <<-EOT
    Override the configuration with your desired Fully Qualified Domain Name (FQDN). 
    If not provided, it is derived from the `route53_zone_name` and the `route53_cname` / `service_name` variables.
For example:
    If the configured hosted zone is `dev.primelabs.toyota.com` and you want traffic to be served from `dev.primelabs.toyota.com`, 
    then set the `fqdn` value to `dev.primelabs.toyota.com`.
    If the configured hosted zone is `primelabs.toyota.com` but you want traffic to be served from `dev.primelabs.toyota.com`, 
    then set `route53_cname` / `service_name` to `dev`, `route53_zone_name` to `primelabs.toyota.com`, and leave `fqdn` as null.
EOT
  validation {
    condition     = var.fqdn == null || var.fqdn == "" || can(regex("^(?:[A-Za-z0-9-]{1,63}\\.)*(?:[A-Za-z0-9-]*toyota[A-Za-z0-9-]*\\.com|4poc\\.net|[A-Za-z0-9-]*lexus[A-Za-z0-9-]*\\.com)$", var.fqdn))
    error_message = "Argument 'fqdn' must be existing zone in route53, must contain alphanumeric characters, hyphens, dots and can't be empty, and must match '*toyota*.com', '*4poc.net', or '*lexus*.com'."
  }
}

/*
 Secrets
*/
variable "additional_ecs_secret_arns" {
  type        = map(any)
  default     = {}
  description = "Additional secrets to be provided to all ECS containers defined, as environment variables. The map should have environment variable names as its keys, and AWS Secret ARNs as values."
  validation {
    condition     = length(setintersection(keys(var.additional_ecs_secret_arns), ["DATABASE_HOST", "DATABASE_PORT", "DATABASE_NAME", "DATABASE_USER", "DATABASE_PASSWORD"])) == 0
    error_message = "Secrets 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_USER', 'DATABASE_NAME', 'DATABASE_PASSWORD' are of reserved use."
  }

  # Example:
  #{
  #  "environment_variable_name" = "arn:aws:secretsmanager:us-west-2:000000000000:secret:example-secret-VKZ55V"
  #}
}

/*
  WAF configuration
*/

variable "waf_add_default_zscalar_ips" {
  description = "When true, adds the list of TMNA zScaler IP's to the IP's whitelisted in var.waf_list_of_ips."
  type        = bool
  default     = false
}

variable "waf_add_tmna_network_device_ips" {
  description = "These should be whitelisted for traffic originating inside TMNA. When true, adds the list of TMNA Network Device IP's to the IP's whitelisted in var.list_of_ips."
  type        = bool
  default     = false
}

variable "waf_add_vpc_private_ips" {
  description = "These should be whitelisted for traffic originating from TMNA AWS Workspaces IP's and AWS Appstream IP's. When true, adds the list of TMNA AWS Workspaces IP's and AWS Appstream IP's to the IP's whitelisted in var.list_of_ips."
  type        = bool
  default     = false
}

variable "waf_advanced_managed_rules" {
  description = "A map of AWS Managed WAF rules for the Web ACL. When you enable advanced_managed_rules, you take complete control of the AWS Managed Rules (the `managed_rules` variable will be ignored if `advanced_managed_rules` is not {}).  You are responsible for implementing, at a minimum, the required Managed Rules as found in the [AWS Requirements](https://toyota.atlassian.net/wiki/spaces/CSTG/pages/297739017/AWS+Requirements#AWS-WAF-(Web-Application-Firewall)).  This is not needed for normal use cases.  If you decide to override the Managed Rules with advanced_managed_rules, you must: not enable Allow - either Block, or if required for application, Count -  and notify your SEE team to review your rules. See https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list for more details."
  type        = any
  default     = {}
}

variable "waf_filtered_header_rule" {
  type = object({
    header_types = list(string)
    priority     = number
    header_value = string
    action       = string
    rule_name    = optional(string)
  })
  description = "HTTP header to filter in Web ACL. Priority should be greater than or equal to 1000, and unique for Rules. Currently supports a single header type and multiple header values. Optional rule name can also be provided."
  default = {
    header_types = []
    priority     = 1000
    header_value = ""
    action       = "block"
    rule_name    = ""
  }
}

variable "waf_ip_rate_based_rule" {
  type = object({
    name     = string
    priority = number
    limit    = number
    action   = string
  })
  description = "A rate-based rule in Web ACL tracks the rate of requests for each originating IP address, and triggers the rule action when the rate exceeds a limit that you specify on the number of requests in any 5-minute time span. Priority should be greater than or equal to 1000, and unique for Rules"
  default     = null
}

variable "waf_group_rules" {
  type = list(object({
    name            = string
    arn             = string
    priority        = number
    override_action = string
    rule_action_override = list(object({
      name          = string
      action_to_use = any
    }))
  }))
  description = "List of WAFv2 Rule Groups in Web ACL. Priority should be greater than or equal to 1000, and unique for Rule Groups. To learn more about the fields of this object, see https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules/blob/master/security/defense/waf-acl-zscalar/README.md"
  default     = []

  # EXAMPLE
  # group_rules = [{
  #   name = "rule-to-exclude"
  #   arn = aws_wafv2_rule_group.example.arn
  #   priority = 10
  #   override_action = "none"
  #   rule_action_override = [{
  #     name = "rule-to-exclude"
  #     action_to_use = [{
  #       allow = [{}]
  #     }]
  #   }]
  # }]
  # 
}

variable "waf_list_of_ips" {
  description = "List of IP addresses to whitelist. Creates a Rule Group. Priority will be 999 if used. WAF supports all IPv4 and IPv6 CIDR ranges except for /0"
  type        = list(string)
  default     = ["0.0.0.0/1"]
  validation {
    condition = length(var.waf_list_of_ips) == 0 || alltrue([
      for ip in var.waf_list_of_ips :
      can(regex("^([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/[0-9]{1,2})$", ip))
    ])
    error_message = "If provided, 'waf_list_of_ips' must contain list of valid IP ranges. Example: 164.42.55.11/24."
  }
}

variable "waf_managed_rules" {
  description = "Map of Managed WAF rules. Details on available values can be found in AWS documentation: https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups.html"
  default     = {}
  type        = map(any)
}

variable "waf_default_action" {
  description = "The default action for the WAF ACL. Choose 'allow' to make the WAF public and permit all requests, or 'block' to deny all requests by default. https://docs.aws.amazon.com/waf/latest/developerguide/web-acl-default-action.html"
  type        = string
  default     = "block"
  validation {
    condition     = contains(["allow", "block"], var.waf_default_action)
    error_message = "The default action must be either 'allow' or 'block'."
  }
}

variable "existing_waf_acl_arn" {
  description = "The ARN of an existing WAFv2 web ACL for API Gateway"
  type        = string
  default     = null
  validation {
    condition     = var.existing_waf_acl_arn == null || can(regex("^arn:aws:", var.existing_waf_acl_arn))
    error_message = "Argument 'existing_waf_acl_arn' has to be valid arn if specified, and start from 'arn:aws:******'."
  }
}

# WAF Kinesis Config
variable "waf_kinesis_firehose_stream_arns" {
  description = "Kinesis Firehose Log Stream arns, for log delivery"
  type        = list(string)
  default     = []
}

variable "waf_use_kinesis" {
  description = "Send WAF logs to Kinesis instead of S3. This will incur additional cost. NOTE: This will cause all s3 logging variables to be ignored. If set to true, you must provide a value for kinesis_firehose_stream_arns as well."
  default     = false
  type        = bool
}

# WAF S3 Logging Bucket
variable "waf_s3_logging_bucket_force_destroy" {
  description = "Force destroy the WAF S3 logging bucket. This value should only be set to true in non-prod for testing purposes. S3 logging is disabled if use_kinesis is set to true."
  type        = bool
  default     = false
}


variable "waf_s3_lifecycle_configuration_rules" {
  type = list(object({
    enabled = bool
    id      = string

    abort_incomplete_multipart_upload_days = number

    filter_and = any
    expiration = any
    transition = list(any)

    noncurrent_version_expiration = any
    noncurrent_version_transition = list(any)
  }))
  default     = null
  description = "Lifecycle policy to be applied to the logging S3 bucket. S3 logging is disabled if use_kinesis is set to true."
}


/*
 Tags configuration
*/

variable "application_id" {
  description = "Application ID as per CMDB"
  type        = string
}

variable "application_name" {
  description = "Name of Application as per CMDB"
  type        = string
}

variable "created_by_email" {
  type        = string
  description = "Toyota email of the person who creates resource."
}

variable "custom_tags" {
  description = "A map of custom tags to apply to the resources."
  type        = map(string)
  default     = {}
}

variable "environment" {
  description = "Environment abbreviation of resource."
  type        = string
}

variable "name_prefix" {
  description = "String to prefix resource names."
  type        = string
}

variable "team" {
  default     = null
  description = "a team identifier which will populate the tmna:team tag"
  type        = string
}

variable "app_team_oidc_arn" {
  description = "The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline."
  type        = string
}

variable "data_classification" {
  type        = string
  description = "Data classification level"
  default     = "no_classification"
  validation {
    condition     = contains(["public", "protected", "confidential", "legal", "highly_confidential", "no_classification"], var.data_classification)
    error_message = "Argument 'data_classification' must be either 'public', 'protected', 'confidential', 'legal', 'highly_confidential', 'no_classification'."
  }
}

variable "infra_live_repo" {
  type        = string
  description = "The name of the infrastructure live repository"
  default     = "ace-aws-blueprint-ecs"
}

variable "existing_acm_certificate_arn" {
  description = "ARN of an existing ACM certificate to use. If provided, certificate and all DNS must already exist. If not provided, a certificate and DNS will be created."
  type        = string
  default     = ""
}

variable "existing_acm_hostname" {
  description = "The hostname for the record associated with the existing ACM cert. Required if using existing_acm_certificate_arn with NLB."
  type        = string
  default     = ""
}

variable "existing_namespace_id" {
  type        = string
  default     = null
  description = "Namespace ID of the existing Service Discovery namespace"
}

variable "use_existing_namespace" {
  type        = bool
  default     = false
  description = "This variable determines whether to use an existing Service Discovery namespace in your infrastructure. Set this to true if you want to leverage a previously created namespace for your resources. Keep it at the default (false) if you prefer to create a new namespace during configuration"
}

variable "access_log_bucket_suffix" {
  description = "The suffix for the S3 bucket used for storing ALB access logs."
  type        = string
  default     = "alb"
}

variable "availability_zone_rebalancing" {
  description = "ECS automatically redistributes tasks within a service across Availability Zones (AZs) to mitigate the risk of impaired application availability due to underlying infrastructure failures and task lifecycle activities. The valid values are ENABLED and DISABLED. Defaults to DISABLED."
  type        = string
  default     = "DISABLED"
}

variable "outbound_cidr_blocks" {
  description = "List of CIDR blocks allowed for egress traffic"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Default: allow all outbound traffic
}

variable "resource_slug" {
  default     = null
  description = "A suffix which will be inserted at the end of resource names"
  type        = string
}

variable "existing_security_group_ids" {
  description = "List of existing security group IDs to use for the ECS task. If not provided, a new security group will be created."
  type        = list(string)
  default     = []
}

variable "allow_inbound_from_security_groups" {
  description = "List of security group IDs to allow inbound traffic from"
  type        = list(string)
  default     = []
}

variable "enable_vpc_cidr_inbound" {
  type        = bool
  default     = true
  description = "Enable automatic inbound rule from VPC CIDR when no specific inbound_cidr_blocks are provided. Set to false for enhanced security compliance."
}

variable "protect_from_scale_in" {
  type        = bool
  description = "If true, instances are protected from scale-in termination."
  default     = false
}

variable "instance_refresh" {
  description = "The instance refresh definition. Set this to null if you don't want instances to automatically refresh."
  type = object({
    strategy = string
    preferences = object({
      instance_warmup              = number
      min_healthy_percentage       = number
      scale_in_protected_instances = optional(string, "Ignore")
    })
    triggers = list(string)
  })

  default = {
    strategy = "Rolling"
    preferences = {
      instance_warmup              = 300
      min_healthy_percentage       = 60
      scale_in_protected_instances = "Ignore"
    }
    triggers = []
  }
}
