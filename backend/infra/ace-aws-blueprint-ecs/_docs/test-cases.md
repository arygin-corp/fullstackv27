# ECS Blueprint for Containerized Apps - Test Cases

## Overview

The ECS Blueprint includes a comprehensive test suite with 12 automated test scenarios covering various AWS configurations and deployment patterns. All tests are implemented using Go and [Terratest](https://terratest.gruntwork.io) framework.

## Core Infrastructure Test Cases

### Test Case 1: Basic ECS Blueprint Deployment (`TestECSBlueprint`)

**Purpose**: Validates baseline ECS Blueprint functionality with Application Load Balancer

**Configuration**:
- ECS Fargate service with ALB
- Auto-scaling enabled
- CloudWatch logging
- KMS encryption

**Validation**:
- ECS cluster and service creation
- ALB configuration and health checks
- Route53 DNS records (if configured)
- Auto-scaling policies

### Test Case 2: Auto-Scaling Validation (`TestECSBlueprintAutoScaling`)

**Purpose**: Tests CPU-based auto-scaling functionality

**Configuration**:
- Custom scaling thresholds
- Min/max task configuration
- CloudWatch metrics integration

**Validation**:
- Auto-scaling group configuration
- Scaling policies and alarms
- Metric aggregation settings

### Test Case 3: Database Integration (`TestECSBlueprintWithDatabase`)

**Purpose**: Validates RDS database integration with ECS services

**Configuration**:
- PostgreSQL RDS instance
- Security group configurations
- Database connectivity

**Validation**:
- RDS instance creation and configuration
- Security group rules for database access
- Parameter store integration for credentials

### Test Case 4: Network Load Balancer (`TestECSBlueprintWithNLB`)

**Purpose**: Tests Network Load Balancer deployment for TCP/UDP traffic

**Configuration**:
- NLB with TCP listeners
- Target group configuration
- Network-level load balancing

**Validation**:
- NLB creation and configuration
- Target group health checks
- Network connectivity validation

### Test Case 5: No Load Balancer Deployment (`TestECSBlueprintWithoutLB`)

**Purpose**: Validates deployment without load balancer for internal services

**Configuration**:
- ECS service without ALB/NLB
- Direct service communication
- Internal networking

**Validation**:
- Service deployment and health
- Network security configuration
- Internal service discovery

### Test Case 6: WAF Integration (`TestECSBlueprintWithWAF`)

**Purpose**: Tests Web Application Firewall integration for security

**Configuration**:
- WAF with managed rules
- IP filtering and rate limiting
- Security policies

**Validation**:
- WAF ACL creation and association
- Rule configuration and priorities
- Security group integration

## Advanced Feature Test Cases

### Test Case 7: Advanced Container Configuration (`TestECSBlueprintAdvancedContainerDefinition`)

**Purpose**: Validates complex container configurations with custom logging and port mappings

**Configuration**:
- Custom container definitions
- Advanced logging configuration
- Multiple port mappings
- Environment variable management

**Validation**:
- Container definition parsing
- Logging driver configuration
- Port mapping functionality
- Environment variable injection

### Test Case 8: Stress Testing (`TestECSBlueprintAutoScalingStress`)

**Purpose**: Performance validation under load with scaling behavior

**Configuration**:
- Load simulation containers
- Aggressive scaling policies
- Performance monitoring

**Validation**:
- Service performance under load
- Auto-scaling response times
- Resource utilization metrics

### Test Case 9: EC2 Launch Type (`TestECSBlueprintFargateEC2`)

**Purpose**: Tests EC2-based ECS deployment scenarios

**Configuration**:
- EC2 instances for ECS cluster
- Instance-level configurations
- Container placement strategies

**Validation**:
- EC2 instance provisioning
- ECS agent functionality
- Container scheduling and health

### Test Case 10: Existing ALB Integration (`TestECSBlueprintWithExistingALB`)

**Purpose**: Validates integration with pre-existing Application Load Balancer

**Configuration**:
- Existing ALB infrastructure
- Service integration without LB creation
- Target group association

**Validation**:
- Service registration with existing ALB
- Traffic routing configuration
- Health check integration

### Test Case 11: Existing NLB Integration (`TestECSBlueprintWithExistingNLB`)

**Purpose**: Tests integration with pre-existing Network Load Balancer

**Configuration**:
- Existing NLB infrastructure  
- TCP-based service integration
- Network-level load balancing

**Validation**:
- Service registration with existing NLB
- Network traffic routing
- Connection persistence

### Test Case 12: WAF with Existing ALB Integration (`TestECSBlueprintWithExistingALBAndWAF`)

**Purpose**: Validates Web Application Firewall integration with pre-existing Application Load Balancer

**Configuration**:
- Existing ALB infrastructure
- WAF v2 with custom rules
- Advanced security policies
- Combined existing LB + security scenario

**Validation**:
- WAF rule attachment to existing ALB
- Security policy enforcement
- Traffic filtering and logging
- Integration with existing load balancer infrastructure

## Test Execution

### Running All Tests
```bash
cd test
go test -v -timeout 90m ./...
```

### Running Individual Test Cases
```bash
# Basic deployment
go test -v -timeout 30m -run TestECSBlueprint$

# Database integration
go test -v -timeout 45m -run TestECSBlueprintWithDatabase

# Load balancer scenarios
go test -v -timeout 30m -run "TestECSBlueprintWith(ALB|NLB)"

# Advanced scenarios
go test -v -timeout 45m -run "TestECSBlueprintAdvanced|TestECSBlueprintFargateEC2"
```

### Test Environment Requirements

- **AWS Account**: pc-test sandbox account access required
- **Go Version**: 1.24.0 or later
- **Terraform**: 1.5.7 or later
- **Network Access**: VPC and subnets configured via `chofer-blp-terratest-common`
- **DNS**: Optional Route53 hosted zone for DNS validation tests

### Test Configuration

All tests use cost-optimized configurations:
- **Fargate**: 256 CPU / 512 MB memory
- **EC2**: t3.small instances with minimal cluster sizes
- **Cleanup**: Automatic resource destruction after test completion
- **Isolation**: Unique resource naming prevents test conflicts

For detailed test documentation and development guidelines, see [test/README.md](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs/blob/master/test/README.md).





