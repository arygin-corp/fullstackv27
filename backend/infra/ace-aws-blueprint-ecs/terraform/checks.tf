# Extract commonly used values
locals {
  has_advanced_def = length(coalesce(var.advanced_container_definition, [])) > 0
  has_containers   = length(coalesce(var.containers, [])) > 0

  # Get container port based on which definition is used
  container_port = local.has_advanced_def ? (
    try(var.advanced_container_definition[0].portMappings[0].containerPort, null)
    ) : local.has_containers ? (
    var.containers[0].http_port
  ) : null

  ports_match = local.container_port == var.http_port
}

resource "terraform_data" "containers_config" {
  lifecycle {
    precondition {
      condition = (
        local.ports_match
      )

      error_message = local.has_advanced_def ? (
        "When using a load balancer, advanced container port (${coalesce(local.container_port, "undefined")}) must match load balancer port (${var.http_port})."
        ) : local.has_containers ? (
        "When using a load balancer, container port (${local.container_port}) must match load balancer port (${var.http_port})."
        ) : (
        "Either 'containers' or 'advanced_container_definition' must be provided."
      )
    }
  }
}

resource "terraform_data" "windows_runtime_platform_validation" {
  lifecycle {
    precondition {
      condition = (
        var.ec2_task_operating_system != "WINDOWS" ||
        var.ecs_service_launch_type != "EC2" ||
        var.create_ecs_cluster == false ||
        (var.create_ecs_cluster && var.ecs_service_launch_type == "EC2" && var.runtime_platform != null &&
          contains(
            ["WINDOWS_SERVER_2019_FULL", "WINDOWS_SERVER_2019_CORE", "WINDOWS_SERVER_2022_FULL", "WINDOWS_SERVER_2022_CORE"],
            lookup(coalesce(var.runtime_platform, {}), "operating_system_family", "")
          )
        )
      )

      error_message = "When ec2_task_operating_system is 'WINDOWS', runtime_platform must not be null and operating_system_family must be one of: WINDOWS_SERVER_2019_FULL, WINDOWS_SERVER_2019_CORE, WINDOWS_SERVER_2022_FULL, or WINDOWS_SERVER_2022_CORE."
    }
  }
}

resource "terraform_data" "linux_runtime_platform_validation" {
  lifecycle {
    precondition {
      condition = (
        var.ec2_task_operating_system != "LINUX" ||
        var.ecs_service_launch_type != "EC2" ||
        var.runtime_platform == null ||
        var.create_ecs_cluster == false ||
        (var.create_ecs_cluster && var.ecs_service_launch_type == "EC2" &&
          !contains(
            ["WINDOWS_SERVER_2019_FULL", "WINDOWS_SERVER_2019_CORE", "WINDOWS_SERVER_2022_FULL", "WINDOWS_SERVER_2022_CORE"],
            lookup(coalesce(var.runtime_platform, {}), "operating_system_family", "")
          )
        )
      )

      error_message = "When ec2_task_operating_system is 'LINUX' and runtime_platform is not null, operating_system_family must not be one of: WINDOWS_SERVER_2019_FULL, WINDOWS_SERVER_2019_CORE, WINDOWS_SERVER_2022_FULL, or WINDOWS_SERVER_2022_CORE."
    }
  }
}

resource "terraform_data" "windows_container_definition_validation" {
  lifecycle {
    precondition {
      condition = (
        var.ec2_task_operating_system != "WINDOWS" ||
        var.ecs_service_launch_type != "EC2" ||
        var.create_ecs_cluster == false ||
        (var.create_ecs_cluster && var.ecs_service_launch_type == "EC2" &&
          var.advanced_container_definition != null &&
          length(coalesce(var.advanced_container_definition, [])) > 0 &&
          alltrue([
            for container in coalesce(var.advanced_container_definition, []) :
            contains(["json-file"], try(container.logConfiguration.logDriver, null))
          ])
        )
      )

      error_message = "When ec2_task_operating_system is 'WINDOWS', advanced_container_definition must not be null, must not be empty, and all containers must have logConfiguration.logDriver set to: json-file."
    }
  }
}
