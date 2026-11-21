package test

/*
Package test provides main test runners for ECS Blueprint Terraform module validation.

This package contains 12 test functions that validate ECS Blueprint deployments across various
AWS configurations and scenarios, organized into Core Infrastructure and Advanced Feature tests.

Organization:
- Test Utility Functions (1): createBaseTestVars
- Core Infrastructure Tests (6): Basic deployments, auto-scaling, database, load balancers, WAF
- Advanced Feature Tests (6): Complex containers, stress testing, EC2 launch, existing LB integration, enhanced WAF scenarios

Key Enhancements:
- Route53 DNS validation enabled across all load balancer tests
- Enhanced existing load balancer validation with setup function integration
- WAF + Existing ALB combination testing for advanced security scenarios
- Comprehensive auto-scaling validation with detailed configuration logging

Dependencies: ecs_blueprint_test_cases.go, common.go, chofer-blp-terratest-common
*/

import (
	"strings"
	"testing"

	terratestcommon "github.com/Toyota-Motor-North-America/chofer-blp-terratest-common"
)

// TEST UTILITY FUNCTIONS

// createBaseTestVars creates standardized test variables with unique identifiers.
// It generates a random ID to ensure test isolation and creates consistent naming
// patterns that comply with AWS resource naming constraints.
//
// Resource Allocation Notes:
// - Fargate tests use 256 CPU / 512 MB memory (cost-optimized)
// - EC2 tests use 256 CPU / 256 MB memory (fits within t3.small instance constraints)
// - All tests use minimal cluster sizes for cost efficiency
func createBaseTestVars(t *testing.T, prefix string) map[string]interface{} {
	uniqueId := terratestcommon.GenerateRandomId()
	// Use 2 characters for shortId to comply with NLB 32-character naming constraints
	shortId := strings.ToLower(uniqueId)[:2]
	// Use shorter resource slug (3 chars) to comply with NLB 32-character naming constraints
	baseSlug := strings.ToLower(uniqueId)[:3]

	inputVars := terratestcommon.DeepCopyTfVars(commonVars)
	inputVars["service_name"] = prefix + shortId
	inputVars["application_name"] = "ace-test-" + prefix + shortId
	inputVars["resource_slug"] = baseSlug // Resource slugs declared in Terraform variables
	inputVars["ec2_cluster_resource_slug"] = "ec2-" + baseSlug
	inputVars["db_resource_slug"] = "db-" + baseSlug

	return inputVars
}

// CORE INFRASTRUCTURE TESTS

// TestECSBlueprint validates basic ECS Blueprint deployment with ALB.
// This is the most common use case and serves as the baseline test.
// Includes Route53 DNS validation for comprehensive testing.
func TestECSBlueprint(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "base")
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintAutoScaling validates auto-scaling configuration.
// Tests dynamic scaling based on CPU metrics for production workloads.
// Includes Route53 DNS validation for auto-scaling scenarios.
func TestECSBlueprintAutoScaling(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "auto")
	setAutoScalingConfig(inputVars)
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintWithDatabase validates RDS database integration.
// Tests database connectivity and security group configuration.
func TestECSBlueprintWithDatabase(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "db")
	setDatabaseConfig(inputVars)
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintWithNLB validates Network Load Balancer deployment
// Tests NLB for TCP/UDP traffic and low-latency requirements
// Includes Route53 DNS validation for NLB scenarios
func TestECSBlueprintWithNLB(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "net")
	inputVars["lb_type"] = "network"
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintWithoutLB validates deployment without load balancer
// Tests internal services and background workloads
func TestECSBlueprintWithoutLB(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "int")
	inputVars["create_lb"] = false
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintWithWAF validates Web Application Firewall integration
// Tests security features for public-facing applications
// Includes Route53 DNS validation for WAF + ALB scenarios
func TestECSBlueprintWithWAF(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "waf")
	setWAFConfig(inputVars, "block")
	ECSBlueprintTestCase(t, inputVars)
}

// ADVANCED FEATURE TESTS

// TestECSBlueprintWithGremlinEnabled validates Gremlin Chaos Engineering sidecar integration.
// Tests that the Gremlin sidecar container is properly added to the ECS task definition
// when chaos engineering is enabled with full configuration.
func TestECSBlueprintWithGremlinEnabled(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "grml")
	setGremlinEnabledConfig(inputVars)
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintWithGremlinDisabled validates that Gremlin sidecar is not present when disabled.
// Tests that the ECS service deploys correctly without the Gremlin sidecar container
// when chaos engineering features are explicitly disabled.
func TestECSBlueprintWithGremlinDisabled(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "nogrm")
	setGremlinDisabledConfig(inputVars)
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintAdvancedContainerDefinition validates complex container configurations.
// Tests custom logging, port mappings, and advanced container settings.
func TestECSBlueprintAdvancedContainerDefinition(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "adv")
	setAdvancedContainerConfig(inputVars)
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintAutoScalingStress performs stress testing with load simulation
// Tests performance validation with CPU load simulation and scaling behavior
func TestECSBlueprintAutoScalingStress(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "str")
	setStressTestingConfig(inputVars)
	// Override some defaults for stress testing
	inputVars["min_number_of_tasks"] = 1
	inputVars["max_number_of_tasks"] = 2
	inputVars["upscale_threshold"] = 70
	inputVars["downscale_threshold"] = 30

	ECSBlueprintAutoScalingStressTestCase(t, inputVars)
}

// TestECSBlueprintFargateEC2 validates EC2 launch type deployment.
// Tests instance-based deployment for scenarios requiring instance control.
func TestECSBlueprintFargateEC2(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "ec2")
	setEC2LaunchTypeConfig(inputVars)
	ECSBlueprintTestCase(t, inputVars)
}

// TestECSBlueprintWithExistingALB validates integration with existing ALB
// Tests migration scenarios where services attach to pre-existing load balancers
// Includes Route53 DNS validation for existing ALB scenarios
func TestECSBlueprintWithExistingALB(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "ex")
	inputVars["create_lb"] = false
	inputVars["lb_type"] = "application"

	ECSBlueprintTestCaseWithExistingLB(t, inputVars)
}

// TestECSBlueprintWithExistingNLB validates integration with existing NLB
// Tests migration scenarios where services attach to pre-existing Network Load Balancers
// Includes Route53 DNS validation for existing NLB scenarios
func TestECSBlueprintWithExistingNLB(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "enlb")
	inputVars["create_lb"] = false
	inputVars["lb_type"] = "network"

	ECSBlueprintTestCaseWithExistingLB(t, inputVars)
}

// TestECSBlueprintWithExistingALBAndWAF validates WAF integration with existing ALB
// Tests advanced security scenarios where WAF is configured with pre-existing ALBs
// This is an enhanced test scenario combining existing LB validation with WAF features
func TestECSBlueprintWithExistingALBAndWAF(t *testing.T) {
	t.Parallel()

	inputVars := createBaseTestVars(t, "ewaf")
	inputVars["create_lb"] = false
	setWAFConfig(inputVars, "allow") // Use allow for safer testing with existing LB

	ECSBlueprintTestCaseWithExistingLB(t, inputVars)
}
