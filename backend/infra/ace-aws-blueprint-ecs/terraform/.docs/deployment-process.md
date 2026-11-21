### Prerequisites

To deploy the Fargate service using [ECS Blueprint](https://github.com/Toyota-Motor-North-America/ace-aws-blueprint-ecs), it is recommended you use [Terragrunt Infrastructure Live Template Repository](https://github.com/Toyota-Motor-North-America/ace-aws-infra-live) to create your repository with the recommended structure. Please also check the documentation in [ace-aws-infra-live](https://github.com/Toyota-Motor-North-America/ace-aws-infra-live/blob/master/README.md)(https://github.com/Toyota-Motor-North-America/ace-aws-infra-live/blob/master/README.md).

### Port Mapping

When deploying with a load balancer, ensure your container port matches the load balancer's listening port for proper traffic routing. You can configure this either through regular containers' http_port or through advanced container definition's portMappings.

### Deploy the service using GitHub Actions

See the documentation on general steps for Blueprint creation and deployment here: https://chofer.cloud.toyota.com/docs/default/Component/ACE-TECH-DOCS/blueprints/blueprintdeployment/

For more information on the CD Terraform Standalone pipeline, see here: https://chofer.cloud.toyota.com/docs/default/Component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/cd-pipeline-terraform-standalone-gha/
