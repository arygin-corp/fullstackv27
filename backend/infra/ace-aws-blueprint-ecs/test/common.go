package test

/*
Package test provides shared test configuration and variables for the ECS Blueprint test suite.

This package centralizes constants, variables, and configuration maps used across all test scenarios
to ensure consistency and maintainability.

Organization:
- Constants: Default resource allocations
- Core Variables: Application, AWS, and network settings
- Common Variables Map: Consolidated Terraform variables
- Specialized Configurations: Database, auto-scaling, security, etc.
*/

import (
	terratestcommon "github.com/Toyota-Motor-North-America/chofer-blp-terratest-common"
)

// CONSTANTS - Default Container Resource Allocation

// DefaultCPU and DefaultMemory represent optimized resource allocation for testing
const (
	DefaultCPU    = 256
	DefaultMemory = 512 // Cost-optimized for Fargate while maintaining functionality
)

// CORE CONFIGURATION VARIABLES
var (
	// Core Application Configuration
	applicationID      = "ace-testid"
	applicationName    = "ace-testapp"
	team               = "blp"
	appTeamOIDCArn     = terratestcommon.AppTeamOidcArn
	customTags         = terratestcommon.TestTags
	dataClassification = "no_classification"
	infraLiveRepo      = "ace-aws-blueprint-ecs"

	// AWS Environment Configuration
	awsRegion      = terratestcommon.AwsRegion
	environment    = terratestcommon.Environment
	createdByEmail = terratestcommon.CreatedByEmail

	// Network Configuration
	vpcID       = terratestcommon.VpcId
	lbSubnetIDs = terratestcommon.SubnetsFmt("sn-public")

	// Core Service Configuration
	namePrefix  = "ace"
	serviceName = "ecs"
	httpPort    = 3000

	// Container Images
	StandardContainerImage = "mcr.microsoft.com/dotnet/samples:aspnetapp"
	AutoscalingTestImage   = "destis/stress-service"
	SimpleTestImage        = "nginx:alpine" // Lightweight image for EC2 testing

	// Test Environment Cleanup Settings (all enabled for tests)
	cloudwatchForceDestroy         = true
	lbLogsBucketForceDestroy       = true
	wafS3LoggingBucketForceDestroy = true
	nlbEnableDeletionProtection    = false
)

// DEFAULT CONTAINER CONFIGURATIONS

// defaultContainers provides standard container configuration for most test scenarios
var (
	defaultContainers = []map[string]interface{}{
		{
			"name":      "webapp",
			"image":     StandardContainerImage,
			"http_port": httpPort,
			"cpu":       DefaultCPU,
			"memory":    DefaultMemory,
			"env_vars":  map[string]string{},
		},
	}
)

// COMMON VARIABLES MAP

// commonVars contains the base Terraform variables used across all test scenarios.
// Individual tests copy and modify this map for specific testing requirements.
var (
	commonVars = map[string]interface{}{
		"service_name":                        serviceName,
		"aws_region":                          awsRegion,
		"name_prefix":                         namePrefix,
		"application_id":                      applicationID,
		"application_name":                    applicationName,
		"environment":                         environment,
		"created_by_email":                    createdByEmail,
		"team":                                team,
		"app_team_oidc_arn":                   appTeamOIDCArn,
		"custom_tags":                         customTags,
		"data_classification":                 dataClassification,
		"infra_live_repo":                     infraLiveRepo,
		"vpc_id":                              vpcID,
		"lb_subnet_ids":                       lbSubnetIDs,
		"route53_zone_name":                   terratestcommon.Route53ZoneName,
		"containers":                          defaultContainers,
		"lb_container_name":                   "webapp",
		"http_port":                           httpPort,
		"cpu":                                 DefaultCPU,
		"memory":                              DefaultMemory,
		"cloudwatch_force_destroy":            cloudwatchForceDestroy,
		"lb_logs_bucket_force_destroy":        lbLogsBucketForceDestroy,
		"waf_s3_logging_bucket_force_destroy": wafS3LoggingBucketForceDestroy,
		"nlb_enable_deletion_protection":      nlbEnableDeletionProtection,
		"lb_allow_inbound_from_cidr_blocks":   []string{"0.0.0.0/0"},
		"access_logging_enabled":              true,
		"accesslogs_bucketprefix":             "accesslogs/S3/",
		"route53_ttl":                         60,
		"route53_private_zone":                false,
		"existing_security_group_ids":         []string{},
		"resource_slug":                       "",
		"s3_replication_enabled":              false,
		"allow_override_iam_delegation":       false,
		"create_lb":                           create_lb,
		"lb_type":                             lb_type,
		"is_lb_public":                        is_lb_public,
		"ecs_service_launch_type":             ecs_service_launch_type,
		"enable_datadog_monitoring":           false, // Disabled to avoid Lambda policy size limit in tests
		"health_check_path":                   health_check_path,
		"health_check_code":                   health_check_code,
		"health_check_healthy_threshold":      health_check_healthy_threshold,
		"health_check_unhealthy_threshold":    health_check_unhealthy_threshold,
		"health_check_interval":               health_check_interval,
		"health_check_timeout":                health_check_timeout,
		"health_check_protocol":               health_check_protocol,
		"health_check_grace_period_seconds":   health_check_grace_period_seconds,
		"ec2_task_operating_system":           ec2_task_operating_system,
		"log_retention_period_days":           log_retention_period_days,
		"cloudwatch_logs_stream_prefix":       cloudwatch_logs_stream_prefix,
		"ecs_cluster_container_insights":      ecs_cluster_container_insights,
		"create_ecs_cluster":                  create_ecs_cluster,
		"cluster_min_size":                    cluster_min_size,
		"cluster_max_size":                    cluster_max_size,
		"protocol":                            protocol,
		"lb_slow_start":                       lb_slow_start,
		"create_listeners":                    create_listeners,
		"tls_passthrough":                     tls_passthrough,
		"lb_enable_shield_advanced":           lb_enable_shield_advanced,
		"nlb_enforce_security_group_inbound_rules_on_private_link_traffic": nlb_enforce_security_group_inbound_rules_on_private_link_traffic,
		"use_service_discovery":                         use_service_discovery,
		"discovery_alias_record_evaluate_target_health": discovery_alias_record_evaluate_target_health,
		"discovery_namespace_name":                      discovery_namespace_name,
		"discovery_dns_ttl_seconds":                     discovery_dns_ttl_seconds,
		"task_T_shirt_size":                             task_T_shirt_size,
		"efs_volumes":                                   efs_volumes,
		"lb_listener_forward_rules":                     lb_listener_forward_rules,
		"use_auto_scaling":                              use_auto_scaling,
		"min_number_of_tasks":                           min_number_of_tasks,
		"max_number_of_tasks":                           max_number_of_tasks,
		"upscale_threshold":                             upscale_threshold,
		"downscale_threshold":                           downscale_threshold,
		"scaling_metric":                                scaling_metric,
		"waf_default_action":                            waf_default_action,
		"waf_add_default_zscalar_ips":                   waf_add_default_zscalar_ips,
		"waf_add_tmna_network_device_ips":               waf_add_tmna_network_device_ips,
		"waf_add_vpc_private_ips":                       waf_add_vpc_private_ips,
		"waf_use_kinesis":                               waf_use_kinesis,
		"waf_kinesis_firehose_stream_arns":              waf_kinesis_firehose_stream_arns,
		"wait_for_steady_state":                         false,
	}
)

// SPECIALIZED TEST CONFIGURATIONS
var (
	// Database Configuration
	db_name                 = "testdb"
	db_engine               = "postgres"
	db_engine_version       = "14"
	db_instance_type        = "db.t3.micro"
	master_username         = "testuser"
	skip_final_snapshot     = true
	db_allocated_storage    = 20
	multi_az                = false
	backup_retention_period = 7
	backup_window           = "04:00-05:00"
	db_subnet_ids           = terratestcommon.SubnetsFmt("sn-private")
	db_deletion_protection  = false

	// Auto-Scaling Configuration
	use_auto_scaling    = true
	min_number_of_tasks = 1
	max_number_of_tasks = 4
	upscale_threshold   = 70
	downscale_threshold = 10
	scaling_metric      = "cpu"

	// Health Check Configuration
	health_check_path                 = "/"
	health_check_code                 = "200"
	health_check_healthy_threshold    = 3
	health_check_unhealthy_threshold  = 3
	health_check_interval             = 30
	health_check_timeout              = 10
	health_check_protocol             = "HTTP"
	health_check_grace_period_seconds = 300

	// ECS Launch Configuration
	ecs_service_launch_type   = "FARGATE"
	ec2_task_operating_system = "LINUX"

	// WAF Security Configuration
	waf_default_action               = "allow"
	waf_add_default_zscalar_ips      = false
	waf_add_tmna_network_device_ips  = false
	waf_add_vpc_private_ips          = false
	waf_use_kinesis                  = false
	waf_kinesis_firehose_stream_arns = []string{}

	// Service Discovery Configuration
	use_service_discovery                         = false
	discovery_alias_record_evaluate_target_health = true
	discovery_namespace_name                      = "ecs-test.local"
	discovery_dns_ttl_seconds                     = 60

	// Load Balancer Configuration
	create_lb                                                        = true
	lb_type                                                          = "application"
	is_lb_public                                                     = true
	lb_slow_start                                                    = 30
	create_listeners                                                 = true
	tls_passthrough                                                  = false
	lb_enable_shield_advanced                                        = false
	nlb_enforce_security_group_inbound_rules_on_private_link_traffic = true

	// Logging Configuration
	log_retention_period_days      = 30
	cloudwatch_logs_stream_prefix  = "ecs"
	ecs_cluster_container_insights = "enabled"

	// Cluster Configuration
	create_ecs_cluster = true
	cluster_min_size   = 1
	cluster_max_size   = 10

	// Protocol Configuration
	protocol = "HTTP"

	// Resource Sizing Configuration
	task_T_shirt_size = "" // Empty means use individual CPU/memory settings

	// EFS Volumes Configuration
	efs_volumes = map[string]interface{}{}

	// Load Balancer Listener Rules
	lb_listener_forward_rules = []map[string]interface{}{
		{
			"priority":       100,
			"path_patterns":  []string{"/*"},
			"listener_ports": []int{443},
		},
	}
)

// HELPER FUNCTIONS FOR TEST CONFIGURATION SIMPLIFICATION

// setAutoScalingConfig applies auto-scaling configuration to input variables
func setAutoScalingConfig(inputVars map[string]interface{}) {
	inputVars["use_auto_scaling"] = use_auto_scaling
	inputVars["min_number_of_tasks"] = min_number_of_tasks
	inputVars["max_number_of_tasks"] = max_number_of_tasks
	inputVars["upscale_threshold"] = upscale_threshold
	inputVars["downscale_threshold"] = downscale_threshold
	inputVars["scaling_metric"] = scaling_metric
}

// setDatabaseConfig applies database configuration to input variables
func setDatabaseConfig(inputVars map[string]interface{}) {
	inputVars["db_name"] = db_name
	inputVars["db_engine"] = db_engine
	inputVars["db_engine_version"] = db_engine_version
	inputVars["db_instance_type"] = db_instance_type
	inputVars["master_username"] = master_username
	inputVars["skip_final_snapshot"] = skip_final_snapshot
	inputVars["db_allocated_storage"] = db_allocated_storage
	inputVars["multi_az"] = multi_az
	inputVars["backup_retention_period_days"] = backup_retention_period
	inputVars["backup_window"] = backup_window
	inputVars["db_subnet_ids"] = db_subnet_ids
	inputVars["db_deletion_protection"] = db_deletion_protection
}

// setWAFConfig applies WAF configuration to input variables
func setWAFConfig(inputVars map[string]interface{}, action string) {
	inputVars["lb_type"] = "application" // WAF only works with ALB
	inputVars["waf_default_action"] = action
	inputVars["waf_add_default_zscalar_ips"] = waf_add_default_zscalar_ips
	inputVars["waf_add_tmna_network_device_ips"] = waf_add_tmna_network_device_ips
	inputVars["waf_add_vpc_private_ips"] = waf_add_vpc_private_ips
	inputVars["waf_use_kinesis"] = waf_use_kinesis
	inputVars["waf_kinesis_firehose_stream_arns"] = waf_kinesis_firehose_stream_arns
	inputVars["enable_datadog_monitoring"] = true
	inputVars["ecs_cluster_container_insights"] = "enabled"
}

// setEC2LaunchTypeConfig applies EC2 launch type configuration to input variables
func setEC2LaunchTypeConfig(inputVars map[string]interface{}) {
	inputVars["ecs_service_launch_type"] = "EC2"
	inputVars["cluster_min_size"] = 1
	inputVars["cluster_max_size"] = 3
	inputVars["cluster_instance_type"] = "t3.small"
	inputVars["cpu"] = 256
	inputVars["memory"] = 256
	inputVars["health_check_grace_period_seconds"] = 600 // 10 minutes
	inputVars["service_create_update_timeout"] = "45m"   // Increased from 30m to handle complex deployments with WAF/ALB
	inputVars["service_delete_timeout"] = "15m"          // Increased from 5m to handle ECS service deletion timeouts

	// Update container definition with optimized resources for EC2
	containers := []map[string]interface{}{
		{
			"name":      "webapp",
			"image":     SimpleTestImage, // nginx:alpine
			"http_port": 80,
			"cpu":       256,
			"memory":    256,
			"env_vars":  map[string]string{},
		},
	}
	inputVars["containers"] = containers
	inputVars["http_port"] = 80
}

// setStressTestingConfig applies stress testing configuration to input variables
func setStressTestingConfig(inputVars map[string]interface{}) {
	serviceName := inputVars["service_name"].(string)
	containers := []map[string]interface{}{
		{
			"name":      serviceName,
			"image":     AutoscalingTestImage,
			"http_port": httpPort,
			"cpu":       DefaultCPU,
			"memory":    DefaultMemory,
			"env_vars":  map[string]string{"PORT": "3000"},
		},
	}
	inputVars["containers"] = containers
	inputVars["lb_type"] = "application"
	inputVars["service_delete_timeout"] = "15m" // Increased timeout for stress test cleanup with auto-scaling
	setAutoScalingConfig(inputVars)
}

// setGremlinEnabledConfig applies Gremlin Chaos Engineering configuration with sidecar enabled
func setGremlinEnabledConfig(inputVars map[string]interface{}) {
	inputVars["enable_gremlin_chaos"] = true
	inputVars["enable_gremlin_sidecar"] = true
	inputVars["gremlin_config_ssm_parameter_arn"] = "arn:aws:ssm:us-west-2:000000000000:parameter/gremlin/config"
	inputVars["gremlin_debug_enabled"] = true
	inputVars["gremlin_trace_enabled"] = true
}

// setGremlinDisabledConfig explicitly disables Gremlin Chaos Engineering
func setGremlinDisabledConfig(inputVars map[string]interface{}) {
	inputVars["enable_gremlin_chaos"] = false
	inputVars["enable_gremlin_sidecar"] = false
	inputVars["gremlin_config_ssm_parameter_arn"] = nil
	inputVars["gremlin_debug_enabled"] = false
	inputVars["gremlin_trace_enabled"] = false
}

// setAdvancedContainerConfig applies advanced container configuration to input variables
func setAdvancedContainerConfig(inputVars map[string]interface{}) {
	advancedContainerDef := []map[string]interface{}{
		{
			"name":      "advanced-webapp",
			"image":     StandardContainerImage,
			"essential": true,
			"portMappings": []map[string]interface{}{
				{
					"containerPort": httpPort,
					"hostPort":      httpPort,
					"protocol":      "tcp",
				},
			},
			// Removed logConfiguration - let Terraform handle CloudWatch logging automatically
			// This ensures the correct log group name is used (ace-sandbox-usw2-<service>-<slug>)
		},
	}
	inputVars["advanced_container_definition"] = advancedContainerDef
	inputVars["lb_container_name"] = "advanced-webapp"
}
