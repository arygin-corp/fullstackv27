# Nonprod SES identities.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/ses"
}

include {
  path = find_in_parent_folders()
}

generate "imports" {
  path      = "imports.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
import {
  to = aws_ses_domain_identity.domain["demo.data.toyota.com"]
  id = "demo.data.toyota.com"
}
import {
  to = aws_ses_domain_identity.domain["dev.data.toyota.com"]
  id = "dev.data.toyota.com"
}
import {
  to = aws_ses_domain_identity.domain["qa.data.toyota.com"]
  id = "qa.data.toyota.com"
}
import {
  to = aws_ses_domain_identity.domain["stage.data.toyota.com"]
  id = "stage.data.toyota.com"
}
import {
  to = aws_ses_domain_dkim.domain["demo.data.toyota.com"]
  id = "demo.data.toyota.com"
}
import {
  to = aws_ses_domain_dkim.domain["dev.data.toyota.com"]
  id = "dev.data.toyota.com"
}
import {
  to = aws_ses_domain_dkim.domain["qa.data.toyota.com"]
  id = "qa.data.toyota.com"
}
import {
  to = aws_ses_domain_dkim.domain["stage.data.toyota.com"]
  id = "stage.data.toyota.com"
}
import {
  to = aws_ses_configuration_set.mail
  id = "edmp-gdxp-admin-nonprod-mail"
}
EOF
}

inputs = {
  domains = ["demo.data.toyota.com", "dev.data.toyota.com", "qa.data.toyota.com", "stage.data.toyota.com"]
  configuration_set = "edmp-gdxp-admin-nonprod-mail"
}
