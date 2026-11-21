**Datadog Agent**

### About

To enable the Datadog Agent, set `enable_datadog_agent`. Tasks that do not have the Datadog Agent still report metrics with Cloudwatch, however the Agent is needed for Autodiscovery, detailed container metrics, tracing, and more. Additionally, Cloudwatch metrics are less granular, and have more latency in reporting than metrics shipped directly through the Datadog Agent.

To learn more about the agent see:
* [ECS Documentation](https://docs.datadoghq.com/containers/amazon_ecs/data_collected/)
* [Fargate Documentation](https://docs.datadoghq.com/integrations/ecs_fargate/?tab=webui#data-collected)

### Prerequisites

The Datadog Agent requires that your AWS Account has a Datadog API Key stored in AWS Parameter store. 

To validate if your account has this
1. Navigate to AWS Systems Manager > Parameter Store
2. Search for `datadog` - parameters will follow the naming convention `/datadog/<UNIQUE IDENTIFIER>/api-key`

If your account does not have these parameters, you can use the [Datadog AWS Account Integration](https://chofer.cloud.toyota.com/create/templates/aws-infra-live-module-dd-aws-integration?learnMore=) module to create them.

### Validation

To validate the Datadog Agent is properly set up for your ECS Cluster follow the steps below in the AWS Console.

#### Fargate

The Datadog Agent runs as a side car to the ECS task. In the AWS Console:

1. Navigate to ECS
2. Select your ECS Cluster
3. Under 'Services', select your service
4. Click on the 'Task' tab and select the running task
5. Under 'Containers' there should be two running: one is your service and the other is the Datadog Agent (`datadog-agent`)

#### EC2

The Datadog Agent runs as a DAEMON service in the ECS Cluster. In the AWS Console:

1. Naviate to ECS
2. Select your ECS Cluster
3. Under 'Services' there should be two running: one will be the application and the other will be the Datadog Agent (`<SERVICE_NAME>-datadog-agent`).
