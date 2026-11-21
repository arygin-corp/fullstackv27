target_env         = "prod"
account_id         = "471550468381"
nonprod_account_id = "963334842848"
prod_account_id    = "471550468381"
aws_region         = "us-east-1"

vpc_id             = "vpc-0e3a39484c06c06f6"
private_subnet_ids = ["subnet-0f17a22158c417984", "subnet-093645f1e69b538e6"]
public_subnet_ids  = ["subnet-094126f3246d18324", "subnet-0430e3236dafb9506"]

alb_certificate_arn = "arn:aws:acm:us-east-1:471550468381:certificate/b2cd2025-cb0f-4a22-9883-96676b35e301"

db_name = "edmp_gdxp_admin_prod"
db_user = "Administrator"

nonprod_shared_sqs_arn = "arn:aws:sqs:us-west-2:963334842848:edmp-gdx-nonprod-queue"
nonprod_shared_sns_arn = "arn:aws:sns:us-west-2:963334842848:edmp-gdx-nonprod-topic"
prod_shared_sqs_arn    = "arn:aws:sqs:us-east-1:471550468381:edmp-gdx-prod-queue"
prod_shared_sns_arn    = "arn:aws:sns:us-east-1:471550468381:edmp-gdx-prod-topic"

standard_tags = {
  "tmna:app-id"           = "APM0003247"
  "tmna:app-name"         = "Global Data-Marketplace Xchange Platform"
  "tmna:classification"   = "Protected"
  "tmna:created-by-email" = "giovanni.austin@toyota.com"
  "tmna:team"             = "Data Marketplace Team"
  "tmna:git_url"          = "https://github.com/Toyota-Motor-North-America/edmp-global-marketplace-xchange-platform"
}
