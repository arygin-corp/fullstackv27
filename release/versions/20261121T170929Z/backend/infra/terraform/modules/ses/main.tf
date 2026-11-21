resource "aws_ses_domain_identity" "domain" {
  for_each = toset(var.domains)
  domain   = each.value
}

resource "aws_ses_domain_dkim" "domain" {
  for_each = aws_ses_domain_identity.domain
  domain   = each.value.domain
}

resource "aws_ses_configuration_set" "mail" {
  name = var.configuration_set
}

data "aws_iam_policy_document" "send" {
  statement {
    effect = "Allow"
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail",
    ]
    resources = concat(
      [for identity in aws_ses_domain_identity.domain : identity.arn],
      ["arn:aws:ses:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:configuration-set/${aws_ses_configuration_set.mail.name}"],
    )
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_iam_policy" "send" {
  name   = "${var.name_prefix}-ses-send"
  policy = data.aws_iam_policy_document.send.json
  tags   = var.standard_tags
}

data "aws_iam_policy_document" "ec2_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "beanstalk" {
  name               = "${var.name_prefix}-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_trust.json
  tags               = var.standard_tags
}

resource "aws_iam_role_policy_attachment" "ses" {
  role       = aws_iam_role.beanstalk.name
  policy_arn = aws_iam_policy.send.arn
}

resource "aws_iam_role_policy_attachment" "web" {
  role       = aws_iam_role.beanstalk.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy" "buckets" {
  name = "${var.name_prefix}-s3"
  role = aws_iam_role.beanstalk.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [for bucket in var.buckets : "arn:aws:s3:::${bucket}"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = [for bucket in var.buckets : "arn:aws:s3:::${bucket}/*"]
      },
    ]
  })
}

resource "aws_iam_instance_profile" "beanstalk" {
  name = aws_iam_role.beanstalk.name
  role = aws_iam_role.beanstalk.name
  tags = var.standard_tags
}
