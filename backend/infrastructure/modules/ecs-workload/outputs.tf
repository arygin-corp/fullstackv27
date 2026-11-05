output "task_definition_arn"{value=aws_ecs_task_definition.this.arn}
output "service_arn"{value=try(aws_ecs_service.this[0].id,null)}
