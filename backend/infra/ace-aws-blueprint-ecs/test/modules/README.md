# Test Modules

This directory contains helper Terraform modules used by the ECS Blueprint test suite for creating standalone AWS resources needed for specific test scenarios.

## 📁 Directory Structure

```
modules/
├── README.md                              # This documentation
├── application-load-balancer/
│   └── main.tf                           # Standalone ALB for existing LB tests
└── network-load-balancer/
    └── main.tf                           # Standalone NLB for existing LB tests
```

## 🎯 Purpose

These modules are specifically designed to support test scenarios where the ECS Blueprint needs to integrate with **existing** load balancers rather than creating new ones. This simulates real-world migration scenarios where applications are being moved to the ECS Blueprint but need to use pre-existing load balancing infrastructure.

## 📋 Module Details

### Application Load Balancer (`application-load-balancer/`)

**Purpose**: Creates a standalone Application Load Balancer for testing ECS Blueprint integration with existing ALBs.

**Used by**: 
- `TestECSBlueprintWithExistingALB`

**Key Features**:
- Creates ALB with minimal configuration for testing
- Configures S3 access logging with force destroy enabled
- Sets up public-facing ALB with Shield Advanced disabled
- Returns ALB ARN and name for integration testing

**Module Source**: `ace-aws-infra-modules//networking/lb/alb` (v41.2.3)

### Network Load Balancer (`network-load-balancer/`)

**Purpose**: Creates a standalone Network Load Balancer for testing ECS Blueprint integration with existing NLBs.

**Used by**: 
- `TestECSBlueprintWithExistingNLB`

**Key Features**:
- Creates NLB with dummy target group for testing
- Configures minimal TCP-based load balancing
- Sets up public-facing NLB with deletion protection disabled
- Includes random suffix for unique resource naming
- Returns NLB ARN and name for integration testing

**Module Source**: `ace-aws-infra-modules//networking/lb/nlb` (v41.0.0)

## 🔧 Configuration

Both modules accept standard variables required by the ace-aws-infra-modules:

### Required Variables
- `application_id` - Application identifier
- `application_name` - Application name (unique per test)
- `created_by_email` - Email of the creator
- `environment` - Environment name (from terratest-common)
- `name` - Load balancer name
- `name_prefix` - Prefix for resource names
- `lb_subnet_ids` - List of subnet IDs for the load balancer
- `vpc_id` - VPC ID where resources will be created

### Optional Variables
- `custom_tags` - Additional tags to apply to resources
- `app_team_oidc_arn` - OIDC ARN for team access
- `data_classification` - Data classification level
- `infra_live_repo` - Infrastructure repository name

## 🚀 Usage in Tests

These modules are automatically used by the test suite when running existing load balancer integration tests:

```go
// Example usage in test code
func TestECSBlueprintWithExistingALB(t *testing.T) {
    t.Parallel()
    
    inputVars := createBaseTestVars(t, "ex")
    inputVars["create_lb"] = false
    inputVars["lb_type"] = "application"
    
    ECSBlueprintTestCaseWithExistingLB(t, inputVars)
}
```

The test framework:
1. **Creates** the standalone load balancer using the appropriate module
2. **Deploys** the ECS Blueprint with `create_lb = false` 
3. **Integrates** the ECS service with the existing load balancer
4. **Validates** the integration works correctly
5. **Cleans up** both the ECS Blueprint and standalone load balancer

## 🧪 Test Scenarios Covered

### ALB Integration Scenarios
- Service registration with existing ALB target groups
- Security group configuration for ALB-to-ECS communication
- Health check configuration through existing ALB
- Route53 integration with existing ALB DNS name

### NLB Integration Scenarios  
- Service registration with existing NLB target groups
- TCP-based health checks through existing NLB
- Network-level load balancing validation
- Security group configuration for NLB-to-ECS communication

## 🔍 Module Lifecycle

1. **Setup Phase**: Module creates standalone load balancer
2. **Test Phase**: ECS Blueprint integrates with the existing load balancer
3. **Validation Phase**: Integration is validated through AWS APIs
4. **Cleanup Phase**: Both ECS Blueprint and standalone load balancer are destroyed

## 🛡️ Test Configuration

### Security Settings
- Public load balancers for testing accessibility
- Shield Advanced disabled to reduce costs
- Deletion protection disabled for easy cleanup
- Force destroy enabled for S3 buckets

### Resource Naming
- Uses unique random suffixes to prevent naming conflicts
- Follows consistent naming patterns with test prefixes
- Maintains compatibility with AWS resource naming constraints

## 📝 Development Notes

### Adding New Load Balancer Types
To add support for additional load balancer types:

1. Create new subdirectory under `modules/`
2. Add `main.tf` with appropriate Terraform configuration
3. Update test cases to reference the new module
4. Add validation logic for the new load balancer type

### Module Dependencies
- Both modules depend on `ace-aws-infra-modules` repository
- Version pinned to v41.x.x for consistency with main blueprint
- Terraform version requirement: >= 1.5.7
- AWS provider version: >= 5.29.0, <= 6.0.0

### Code Quality and Linting
- **TFLint integration**: Automated validation via pre-commit hooks
- **Unused variable handling**: Some variables kept for compatibility using `# tflint-ignore: terraform_unused_declarations`
- **Future-proofing**: Variables like `vpc` maintained for potential module enhancements

### Debugging Tips
- Module outputs include both ARN and name for debugging
- Resources use descriptive tags for identification
- Random suffixes help track resources in AWS console
- Error messages indicate which module and resource failed

---

These test modules ensure comprehensive validation of ECS Blueprint's ability to integrate with existing AWS load balancing infrastructure, supporting real-world migration and hybrid deployment scenarios.
