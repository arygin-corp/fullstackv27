locals {
  account_id = "963334842848"
  aws_region = "us-west-2"
  tfstate_bucket = "edmp-nonprod-usw2-sb-infra-live-tfstate"
  vpc_id = "vpc-064d050c9dc2f2863"
  private_subnet_ids = ["subnet-0c85c72661638ee5f", "subnet-09e44957f431cf0c4"]
  public_subnet_ids = ["subnet-0377bd2b513381dd2", "subnet-0083e4d08f61267dc"]
  oidc_enabled = true
  oidc_role_arn = "arn:aws:iam::963334842848:role/EDMP_gha_oidc_iam_role"
  route53_zone_id = get_env("NONPROD_ROUTE53_ZONE_ID", "")
  acm_certificate_arn = get_env("NONPROD_ACM_CERTIFICATE_ARN", "")
  waf_web_acl_arn = get_env("NONPROD_WAF_WEB_ACL_ARN", "")
}
