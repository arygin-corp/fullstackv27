locals {
  account_id = "471550468381"
  aws_region = "us-east-1"
  tfstate_bucket = "edmp-prod-use1-sb-infra-live-tfstate"
  vpc_id = "vpc-0e3a39484c06c06f6"
  private_subnet_ids = ["subnet-0f17a22158c417984", "subnet-093645f1e69b538e6"]
  public_subnet_ids = ["subnet-094126f3246d18324", "subnet-0430e3236dafb9506"]
  nat_gateway_ids = ["nat-0ac0d01159a2b1284", "nat-0f628b21a365a5be8"]
  oidc_enabled = false
  oidc_role_arn = null
  route53_zone_id = get_env("PROD_ROUTE53_ZONE_ID", "")
  acm_certificate_arn = "arn:aws:acm:us-east-1:471550468381:certificate/b2cd2025-cb0f-4a22-9883-96676b35e301"
  waf_web_acl_arn = get_env("PROD_WAF_WEB_ACL_ARN", "")
}
