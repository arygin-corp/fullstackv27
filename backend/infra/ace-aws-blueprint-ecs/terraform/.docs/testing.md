This code is tested using Go and [Terratest](https://terratest.gruntwork.io) packages.

In the folder `../test` you can find comprehensive test files including `*_test.go` and detailed documentation.

To run tests locally, your testing environment should be authorized to use the pc-test sandbox account.

```bash
# Run all tests (recommended)
(ace-aws-blueprint-ecs) $ cd test
(ace-aws-blueprint-ecs/test) $ go test -timeout 90m ./...

# Run individual tests
(ace-aws-blueprint-ecs/test) $ go test -v -timeout 45m -run TestECSBlueprint
(ace-aws-blueprint-ecs/test) $ go test -v -timeout 45m -run TestECSBlueprintWithDatabase
```

**Available Tests** (12 comprehensive scenarios):
- `TestECSBlueprint` - Basic ECS Blueprint with ALB
- `TestECSBlueprintAutoScaling` - Auto-scaling validation  
- `TestECSBlueprintWithDatabase` - RDS integration
- `TestECSBlueprintWithNLB` - Network Load Balancer
- `TestECSBlueprintWithoutLB` - No load balancer scenario
- `TestECSBlueprintWithWAF` - WAF integration
- `TestECSBlueprintAdvancedContainerDefinition` - Complex containers
- `TestECSBlueprintAutoScalingStress` - Performance testing
- `TestECSBlueprintFargateEC2` - EC2 launch type
- `TestECSBlueprintWithExistingALB` - Existing ALB integration
- `TestECSBlueprintWithExistingNLB` - Existing NLB integration
- `TestECSBlueprintWithExistingALBAndWAF` - WAF with existing ALB integration

Timeout 90m is recommended for the full suite; individual tests typically complete in 15-25 minutes. [Terratest Docs: Timeout and Logging](https://terratest.gruntwork.io/docs/testing-best-practices/timeouts-and-logging/)

For detailed test documentation, see [test/README.md](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs/blob/master/test/README.md).