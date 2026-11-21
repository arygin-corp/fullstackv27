# ECS Blueprint Test Suite

This directory contains a comprehensive test suite for the ECS Blueprint Terraform module, providing validation across various AWS configurations and deployment scenarios using [Terratest](https://terratest.gruntwork.io).

## 📁 Directory Structure

```
test/
├── README.md                              # This comprehensive documentation
├── go.mod                                 # Go module dependencies and version requirements
├── go.sum                                 # Go dependency checksums for reproducible builds
├── common.go                             # Shared test configuration, constants, and variables
├── ecs_blueprint_test.go                 # Main test runner functions and entry points
├── ecs_blueprint_test_cases.go           # Core test implementations and AWS resource validations
└── modules/                              # Helper Terraform modules for integration testing
    ├── README.md                         # Documentation for test-specific modules
    ├── application-load-balancer/
    │   └── main.tf                       # Standalone ALB module for existing LB integration tests
    └── network-load-balancer/
        └── main.tf                       # Standalone NLB module for existing LB integration tests
```

## 🧪 Test Organization

### Core Files

#### `common.go`
- **Purpose**: Centralizes shared test configuration and variables
- **Contents**:
  - Constants for default resource allocations
  - Core application, AWS, and network configuration variables
  - Common Terraform variables map used across all tests
  - Specialized configurations for database, auto-scaling, security, etc.

#### `ecs_blueprint_test.go`
- **Purpose**: Main test runners and entry points
- **Contents**:
  - 12 test functions validating different ECS Blueprint scenarios
  - Test utility functions for creating standardized test variables
  - Core Infrastructure Tests (6): Basic deployments, auto-scaling, database, load balancers, WAF
  - Advanced Feature Tests (6): Complex containers, stress testing, EC2 launch, existing LB integration

#### `ecs_blueprint_test_cases.go`
- **Purpose**: Core test implementations and validation logic
- **Contents**:
  - Test case orchestration functions
  - Infrastructure setup and deployment functions
  - 11 comprehensive validation functions for different AWS services
  - Error handling and retry logic for DNS propagation and service readiness

### Test Modules

#### `modules/application-load-balancer/`
- Creates standalone ALB for testing existing load balancer integration scenarios
- Used by `TestECSBlueprintWithExistingALB`

#### `modules/network-load-balancer/`
- Creates standalone NLB for testing existing load balancer integration scenarios
- Used by `TestECSBlueprintWithExistingNLB`

## 🚀 Available Tests

### Core Infrastructure Tests

| Test Function | Description | Key Features |
|---------------|-------------|--------------|
| `TestECSBlueprint` | Basic ECS Blueprint deployment with ALB | Baseline test, most common use case |
| `TestECSBlueprintAutoScaling` | Auto-scaling configuration validation | CPU-based scaling metrics |
| `TestECSBlueprintWithDatabase` | RDS database integration | Database connectivity and security groups |
| `TestECSBlueprintWithNLB` | Network Load Balancer deployment | TCP/UDP traffic, low-latency requirements |
| `TestECSBlueprintWithoutLB` | Deployment without load balancer | Internal services and background workloads |
| `TestECSBlueprintWithWAF` | Web Application Firewall integration | Security features for public applications |

### Advanced Feature Tests

| Test Function | Description | Key Features |
|---------------|-------------|--------------|
| `TestECSBlueprintAdvancedContainerDefinition` | Complex container configurations | Custom logging, port mappings, advanced settings |
| `TestECSBlueprintAutoScalingStress` | Stress testing with load simulation | Performance validation, scaling behavior |
| `TestECSBlueprintFargateEC2` | EC2 launch type deployment | Instance-based deployment scenarios |
| `TestECSBlueprintWithExistingALB` | Integration with existing ALB | Migration scenarios |
| `TestECSBlueprintWithExistingNLB` | Integration with existing NLB | Migration scenarios |
| `TestECSBlueprintWithExistingALBAndWAF` | WAF integration with existing ALB | Advanced security with existing load balancers |

## 🔧 Test Configuration

### Resource Allocation
- **Fargate tests**: 256 CPU / 512 MB memory (cost-optimized)
- **EC2 tests**: 256 CPU / 256 MB memory (fits within t3.small constraints)
- **Cluster sizes**: Minimal for cost efficiency

### Container Images
- **Standard**: `mcr.microsoft.com/dotnet/samples:aspnetapp`
- **Stress Testing**: `destis/stress-service`
- **EC2 Testing**: `nginx:alpine` (lightweight)

### Test Environment Settings
All cleanup settings enabled for tests:
- `cloudwatch_force_destroy = true`
- `lb_logs_bucket_force_destroy = true`
- `waf_s3_logging_bucket_force_destroy = true`
- `nlb_enable_deletion_protection = false`

## 📋 Validation Coverage

Each test performs comprehensive validation of:

### Always Validated
- ECS Blueprint outputs (ARNs, names, IDs)
- ECS cluster configuration and status
- ECS service configuration and health
- KMS key configuration
- CloudWatch log groups

### Conditionally Validated
- **Load Balancer**: Configuration, state, type, scheme (if `create_lb = true`)
- **Route53**: DNS records and propagation (if Route53 zone configured)
- **Auto Scaling**: Configuration and policies (if `use_auto_scaling = true`)
- **Database**: RDS configuration and connectivity (if database configured)
- **WAF**: Web Application Firewall setup (if ALB used)

## 🏃‍♂️ Running Tests

### Prerequisites
1. Go 1.24.0 or later
2. Terraform 1.5.7 or later
3. AWS credentials configured
4. Access to required VPC and subnets (configured in `chofer-blp-terratest-common`)

### Running Individual Tests
```bash
# Run a specific test
go test -v -run TestECSBlueprint

# Run with timeout (tests can take 20-30 minutes)
go test -v -timeout 45m -run TestECSBlueprint
```

### Running All Tests
```bash
# Run all tests in parallel (default)
go test -v -timeout 90m

# Run tests sequentially
go test -v -timeout 180m -parallel 1
```

### Running Test Categories
```bash
# Run only core infrastructure tests
go test -v -run "TestECSBlueprint$|TestECSBlueprintAutoScaling|TestECSBlueprintWithDatabase|TestECSBlueprintWithNLB|TestECSBlueprintWithoutLB|TestECSBlueprintWithWAF"

# Run only advanced feature tests
go test -v -run "TestECSBlueprintAdvanced|TestECSBlueprintFargateEC2|TestECSBlueprintWithExisting"
```

## 🔍 Debugging and Troubleshooting

### Common Issues

#### DNS Propagation Delays
- Route53 validation includes retry logic with 10-second delays
- Tests log available DNS records for debugging
- Route53 failures are warnings, not hard failures for WAF tests

#### Resource Naming Conflicts
- Tests use random IDs to ensure isolation
- Service names limited to 3 characters for ALB naming constraints
- Resource slugs use full unique IDs for proper isolation

#### EC2 Launch Type Considerations
- Uses t3.small instances (2GB RAM) for adequate container + ECS agent overhead
- Increased health check grace period (10 minutes)
- Extended service timeout (30 minutes) for instance launch times

### Test Output
- All tests include comprehensive logging of resource ARNs, names, and configurations
- Validation failures include detailed error messages
- Resource cleanup occurs automatically via defer statements (LIFO order)

## 📝 Test Development Guidelines

### Adding New Tests
1. Create test function in `ecs_blueprint_test.go`
2. Use `createBaseTestVars()` for consistent variable setup
3. Follow naming pattern: `TestECSBlueprint<Feature>`
4. Add `t.Parallel()` for concurrent execution
5. Document test purpose and key features

### Variable Naming
- Use 3-character prefixes for service names (ALB constraint)
- Generate unique resource slugs for isolation
- Maintain consistency with existing patterns

### Validation Functions
- Add new validation functions to `ecs_blueprint_test_cases.go`
- Include comprehensive error handling
- Log relevant information for debugging
- Use retry logic for eventually consistent resources

### Dependencies
- Keep dependencies minimal and up-to-date
- Use `chofer-blp-terratest-common` for shared utilities
- Pin Terraform module versions in test modules

## 🏗️ Infrastructure Dependencies

### Required AWS Resources
- VPC with public and private subnets
- Route53 hosted zone (optional, for DNS tests)
- Appropriate IAM permissions for resource creation

### External Dependencies
- `chofer-blp-terratest-common`: Shared testing utilities and configurations
- `ace-aws-infra-modules`: Referenced Terraform modules for ALB/NLB creation

## 📊 Test Metrics and Performance

### Typical Execution Times
| Test Scope | Duration | Notes |
|-----------|----------|--------|
| Individual test | 15-25 minutes | Includes infrastructure provisioning and cleanup |
| Full test suite (parallel) | 45-60 minutes | Recommended for CI/CD pipelines |
| Full test suite (sequential) | 3-4 hours | Use for debugging or resource-constrained environments |

### Resource Usage and Cost Optimization
- **Cost-efficient design**: Minimal instance sizes and cluster configurations
- **Automatic cleanup**: All resources removed via defer statements (LIFO order)
- **Test isolation**: Unique resource naming prevents conflicts
- **Smart defaults**: Optimized for pc-test sandbox account limits

### Test Environment Configuration
```go
// Example test environment settings from common.go
const (
    DefaultCpuUnits    = 256  // Cost-optimized for Fargate
    DefaultMemoryUnits = 512  // Fits within test account limits
    DefaultHttpPort    = 8080 // Standard application port
)
```

## 📈 Continuous Integration

### Pre-commit Integration
The test suite integrates with the project's pre-commit hooks:

```bash
# Run tests before commit (optional)
go test -v -timeout 30m -run TestECSBlueprint

# Format and validate Go code (automated)
pre-commit run go-fmt --all-files
pre-commit run go-mod-tidy --all-files
```

### GitHub Actions Integration
Tests are automatically executed in the CI/CD pipeline on:
- Pull request creation/updates
- Merges to main branch
- Manual workflow dispatch

### Test Reporting
- Comprehensive output logging for debugging
- Resource ARN/ID tracking for audit purposes
- Error context preservation for troubleshooting
- Performance timing for optimization

## 🔧 Configuration Management

### Environment Variables
The test suite uses these environment configurations:

| Variable | Purpose | Default |
|----------|---------|---------|
| `AWS_REGION` | Target AWS region | `us-west-2` |
| `TEST_VPC_ID` | VPC for test resources | From `chofer-blp-terratest-common` |
| `TEST_SUBNET_IDS` | Subnets for LB/ECS | Auto-discovered from VPC |
| `ROUTE53_ZONE_NAME` | DNS zone for tests | Optional, enables DNS validation |

### Dependency Management
```go
// go.mod dependencies
require (
    github.com/gruntwork-io/terratest v0.47.1
    github.com/stretchr/testify v1.8.4
    github.com/Toyota-Motor-North-America/chofer-blp-terratest-common v1.0.0
)
```

## 🛡️ Security and Compliance

### IAM Permissions
Tests require the following AWS permissions:
- `ecs:*` - ECS cluster and service management
- `ec2:*` - VPC, subnet, and security group operations
- `elasticloadbalancing:*` - ALB/NLB operations
- `route53:*` - DNS record management (optional)
- `rds:*` - Database operations (for database tests)
- `wafv2:*` - WAF configuration (for WAF tests)

### Data Classification
All test resources are tagged with:
```hcl
tags = {
  data_classification = "no_classification"
  environment        = "test"
  application_id     = "terratest"
  created_by_email   = "chofer-blueprints@toyota.com"
}
```

### Secret Management
- No secrets stored in code
- AWS credentials from environment/profile
- Temporary resources only during test execution

## 📋 Maintenance and Updates

### Regular Maintenance Tasks
1. **Dependency updates**: Monthly Go module updates
2. **Terraform version**: Keep aligned with blueprint requirements
3. **Test image updates**: Update container images for latest security patches
4. **Documentation sync**: Keep README aligned with test implementations

### Version Compatibility Matrix
| Component | Minimum Version | Tested Version | Notes |
|-----------|----------------|----------------|-------|
| Go | 1.24.0 | 1.24.x | Required for testing framework |
| Terraform | 1.5.7 | 1.6.x+ | Aligned with blueprint requirements |
| Terratest | 0.47.0 | 0.47.1+ | Latest stable version |
| AWS Provider | 5.29.0 | 6.0.0 | Maximum version constraint |

### Adding New Test Cases

1. **Planning Phase**:
   - Identify the feature/scenario to test
   - Determine required AWS resources
   - Plan validation approach

2. **Implementation Phase**:
   ```go
   func TestECSBlueprintNewFeature(t *testing.T) {
       t.Parallel() // Enable parallel execution
       
       // Setup test variables
       testVars := createBaseTestVars(t, "nft") // 3-char prefix
       testVars["new_feature_enabled"] = true
       
       // Deploy and validate
       defer cleanup(t, terraformOptions) // Ensure cleanup
       validateNewFeature(t, terraformOptions, testVars)
   }
   ```

3. **Validation Phase**:
   - Add validation function to `ecs_blueprint_test_cases.go`
   - Include error handling and retry logic
   - Document expected outcomes

### Best Practices for Test Development

#### Resource Naming
```go
// Good: Descriptive with constraints
serviceName := fmt.Sprintf("nft-%s", uniqueId[:3]) // ALB naming constraint

// Bad: Too long or non-descriptive
serviceName := fmt.Sprintf("new-feature-test-%s", uniqueId) // Exceeds ALB limits
```

#### Error Handling
```go
// Good: Comprehensive error context
if err != nil {
    t.Fatalf("Failed to validate ECS service: %v. Service ARN: %s", err, serviceArn)
}

// Bad: Minimal context
if err != nil {
    t.Fatal(err)
}
```

#### Resource Cleanup
```go
// Good: Proper cleanup order (LIFO)
defer terraform.Destroy(t, terraformOptions)
defer cleanupCustomResources(t, resourceIds)

// Deploy resources...
```

## 🎯 Future Enhancements

### Planned Improvements
1. **Performance Testing**: Load testing integration with realistic traffic patterns
2. **Security Scanning**: Automated security compliance validation
3. **Cost Analysis**: Test execution cost tracking and optimization
4. **Multi-Region**: Cross-region deployment testing scenarios
5. **Chaos Engineering**: Resilience testing with intentional failures

### Integration Opportunities
- **Datadog Integration**: Automated monitoring validation
- **Service Mesh**: Testing with AWS App Mesh integration
- **Container Insights**: Enhanced observability testing
- **Blue/Green Deployments**: Advanced deployment pattern validation

---

## 📞 Support and Contact

For questions, issues, or contributions to the test suite:

- **Primary Contact**: Advanced Cloud Engineering Team - `Advanced_Cloud_Engineering@toyota.com`
- **Repository Issues**: [GitHub Issues](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs/issues)
- **Documentation**: [Project CONTRIBUTING.md](../CONTRIBUTING.md)
- **Internal Slack**: `#ace-support` (TMNA Slack workspace)

### Reporting Test Issues
When reporting test failures, please include:
1. Test function name and scenario
2. Complete error output with stack trace
3. AWS region and account being used
4. Go and Terraform versions
5. Any custom test variables or modifications

---

*Last Updated: December 2024 - Version 6.0.0*
