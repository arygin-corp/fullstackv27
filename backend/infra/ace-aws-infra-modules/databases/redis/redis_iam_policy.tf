data "aws_iam_policy_document" "redis_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type = "Service"
      identifiers = [
        "elasticache.amazonaws.com"
      ]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_policy" "redis_access" {
  name        = module.naming_helpers["redis-access"].names[64]
  description = "Policy providing ElastiCache + KMS permissions"
  policy      = data.aws_iam_policy_document.redis_access.json
}

resource "aws_iam_role" "redis_access" {
  name               = module.naming_helpers["redis-access-role"].names[64]
  assume_role_policy = data.aws_iam_policy_document.redis_assume_role.json

  tags = module.standard_tags.tags
}

resource "aws_iam_role_policy_attachment" "redis_attach" {
  role       = aws_iam_role.redis_access.name
  policy_arn = aws_iam_policy.redis_access.arn
}

data "aws_iam_policy_document" "redis_access" {
  statement {
    sid    = "AllowRedisConnectAndDescribe"
    effect = "Allow"
    actions = [
      "elasticache:DescribeReplicationGroups",
      "elasticache:DescribeCacheClusters",
      "elasticache:Connect"
    ]
    resources = [
      "arn:aws:elasticache:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:replicationgroup:${module.naming_helpers["name"].names[64]}",
      "arn:aws:elasticache:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:user:${var.default_user_id}"
    ]
  }

  statement {
    sid    = "AllowKMSForRedis"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey*",
      "kms:Encrypt",
      "kms:ReEncrypt*"
    ]
    resources = [var.customer_kms_key_id != null ? var.customer_kms_key_id : module.kms_master_key[0].key_arns[module.naming_helpers["kms_key"].names[64]]]
  }
}


