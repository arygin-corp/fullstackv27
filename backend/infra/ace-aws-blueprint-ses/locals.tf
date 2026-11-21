locals {
  sns_allow_additional_publish_iam_arns   = var.sns_allow_additional_publish_iam_arns
  sns_allow_additional_subscribe_iam_arns = var.sns_allow_additional_subscribe_iam_arns
  aws_region_tokens                       = split("-", data.aws_region.current.region)
  aws_region_cd                           = "${local.aws_region_tokens[0]}${substr(local.aws_region_tokens[1], 0, 1)}${substr(local.aws_region_tokens[2], 0, 1)}"
  smtp_secret_name                        = "${var.name_prefix}-${var.environment}-${local.aws_region_cd}-ses-smtp-credentials"
  default_smtp_user_name                  = "${var.name_prefix}-${var.environment}-${local.aws_region_cd}-ses-smtp"
  smtp_user_name                          = var.existing_smtp_user_name != null ? var.existing_smtp_user_name : local.default_smtp_user_name

  toyota_domains = ["toyota.com", "lexus.com", "toyotasupplier.com"]
  create_records = !contains(local.toyota_domains, var.domain)
}
