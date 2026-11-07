include "root"{path=find_in_parent_folders()}
locals{account=read_terragrunt_config(find_in_parent_folders("account.hcl"));env=read_terragrunt_config(find_in_parent_folders("environment.hcl"));global=read_terragrunt_config(find_in_parent_folders("global.hcl"))}
dependency "cluster"{config_path="../ecs-cluster";mock_outputs={cluster_arn="arn:aws:ecs:us-east-1:471550468381:cluster/mock"}}
dependency "alb"{config_path="../alb";mock_outputs={listener_arn="arn:aws:elasticloadbalancing:us-east-1:471550468381:listener/app/mock/1/2",dns_name="mock",zone_id="ZMOCK"}}
dependency "alb_sg"{config_path="../alb-security-group";mock_outputs={security_group_id="sg-mock"}}
dependency "db_subnets"{config_path="../db-subnet-group";mock_outputs={name="mock"}}
dependency "redis_subnets"{config_path="../redis-subnet-group";mock_outputs={name="mock"}}
terraform{source="${get_repo_root()}/modules/backend-environment"}
inputs={
environment=local.env.locals.environment
name_prefix="edmp-gdxp-admin-prod"
vpc_id=local.account.locals.vpc_id
private_subnet_ids=local.account.locals.private_subnet_ids
cluster_arn=dependency.cluster.outputs.cluster_arn
listener_arn=dependency.alb.outputs.listener_arn
alb_security_group_id=dependency.alb_sg.outputs.security_group_id
db_subnet_group_name=dependency.db_subnets.outputs.name
redis_subnet_group_name=dependency.redis_subnets.outputs.name
alb_dns_name=dependency.alb.outputs.dns_name
alb_zone_id=dependency.alb.outputs.zone_id
image_uri=local.env.locals.image_uri
admin_host=local.env.locals.admin_host
angular_origin=local.env.locals.angular_origin
listener_priority=local.env.locals.listener_priority
application_bucket_name=local.env.locals.application_bucket_name
db_name=local.env.locals.db_name
secret_name=local.env.locals.secret_name
secret_values=local.env.locals.secret_values
settings_module=local.env.locals.settings_module
route53_zone_id=local.account.locals.route53_zone_id
tags={"tmna:app-id"=local.global.locals.app_id,"tmna:app-name"=local.global.locals.app_name,"tmna:created-by-email"=local.global.locals.created_by_email,"tmna:git_url"=local.global.locals.git_url,"tmna:git_revision"=local.global.locals.git_revision,"tmna:blueprint_sources"=local.global.locals.blueprint_sources,"tmna:timestamp"=local.global.locals.timestamp,"tmna:team"=local.global.locals.team,"tmna:data_classification"=local.global.locals.data_classification}
}
