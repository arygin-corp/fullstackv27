module "ses" {
  source = "../../ace-aws-blueprint-ses"

  name_prefix         = "edmp-gdxp"
  domain              = "data.toyota.com"
  zone_name           = "data.toyota.com"
  environment         = "nonprod"
  data_classification = "protected"
  application_id      = "APM0003247"
  application_name    = "Global Data-Marketplace Xchange Platform"
  created_by_email    = "giovanni.austin@toyota.com"
  team                = "Data Marketplace Team"
  app_team_oidc_arn   = data.aws_iam_role.pipeline.arn
  smtp_enabled        = false
}

resource "aws_ses_configuration_set" "mail" {
  name = "edmp-gdxp-admin-nonprod-mail"
}

resource "aws_iam_role_policy" "ses_send" {
  for_each = module.admin

  name = "ses-send"
  role = each.value.ecs_task_iam_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = [
        module.ses.ses_domain_identity_arn,
        aws_ses_configuration_set.mail.arn,
      ]
    }]
  })
}
