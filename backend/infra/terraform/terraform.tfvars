target_env          = "dev"
account_id          = "963334842848"
nonprod_account_id  = "963334842848"
prod_account_id     = "471550468381"
aws_region          = "us-west-2"
target_instance_id  = "i-0c1677fe098c47416"
public_subnet_ids   = ["subnet-0c85c72661638ee5f"]
private_subnet_ids  = ["subnet-0c85c72661638ee5f", "subnet-042fe53ab61be9b0b"]
alb_certificate_arn = "arn:aws:acm:us-west-2:963334842848:certificate/82a5f077-9a3f-4356-a5b7-a949b151e5ff"

# Network Mapping
vpc_id        = "vpc-064d050c9dc2f2863"
service_sg_id = "sg-04eb9f9cddfbf1ee8"
# Ensure you add a second subnet ID here for the ALB to deploy successfully

# Database Mapping (Matches RDS Screenshot)
db_name = "GDXNonprodDB"
db_user = "Administrator"
db_host = "nonprod-db.us-west-2.rds.amazonaws.com"

# Shared Enterprise Resources
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