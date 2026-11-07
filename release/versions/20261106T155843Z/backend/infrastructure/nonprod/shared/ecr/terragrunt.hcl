include "root"{path=find_in_parent_folders()}
locals{account=read_terragrunt_config(find_in_parent_folders("account.hcl"));global=read_terragrunt_config(find_in_parent_folders("global.hcl"))}
terraform{source="${get_repo_root()}/modules/ecr"}
inputs={
name="edmp-gdxp-admin-ecr"
environment="nonprod"
tags={"tmna:app-id"=local.global.locals.app_id,"tmna:app-name"=local.global.locals.app_name,"tmna:created-by-email"=local.global.locals.created_by_email,"tmna:git_url"=local.global.locals.git_url,"tmna:git_revision"=local.global.locals.git_revision,"tmna:blueprint_sources"=local.global.locals.blueprint_sources,"tmna:timestamp"=local.global.locals.timestamp,"tmna:team"=local.global.locals.team,"tmna:data_classification"=local.global.locals.data_classification}
}
