locals {
  tags = {
    "tmna:app-id"           = var.application_id
    "tmna:app-name"         = var.application_name
    "tmna:environment"      = var.app_env != "" ? var.app_env : var.environment
    "tmna:classification"   = "Protected"
    "tmna:created-by-email" = "giovanni.austin@toyota.com"
    "tmna:team"             = "Data Marketplace Team"
    "tmna:git_url"          = "https://github.com/Toyota-Motor-North-America/edmp-global-marketplace-xchange-platform"
  }
}

variable "bucket_name" {
  type = string
}

data "aws_iam_role" "task" {
  count = var.task_role_name != "" ? 1 : 0
  name  = var.task_role_name
}

resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = false
  tags          = local.tags
  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id
  rule { object_ownership = "BucketOwnerEnforced" }
}

resource "aws_s3_bucket_lifecycle_configuration" "this" {
  bucket     = aws_s3_bucket.this.id
  depends_on = [aws_s3_bucket_versioning.this]
  rule {
    id     = "release-archives"
    status = "Enabled"
    filter { prefix = "_releases/" }
    expiration { days = 180 }
    noncurrent_version_expiration { noncurrent_days = 30 }
  }
  rule {
    id     = "rollback-archives"
    status = "Enabled"
    filter { prefix = "_rollback/releases/" }
    expiration { days = 365 }
    noncurrent_version_expiration { noncurrent_days = 30 }
  }
  rule {
    id     = "multipart"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }
}

data "aws_iam_policy_document" "this" {
  statement {
    sid       = "DenyInsecureTransport"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.this.arn, "${aws_s3_bucket.this.arn}/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
  dynamic "statement" {
    for_each = var.task_role_name != "" ? [1] : []
    content {
      sid       = "TaskRoleAccess"
      actions   = ["s3:ListBucket"]
      resources = [aws_s3_bucket.this.arn]
      principals {
        type        = "AWS"
        identifiers = [data.aws_iam_role.task[0].arn]
      }
    }
  }
  dynamic "statement" {
    for_each = var.task_role_name != "" ? [1] : []
    content {
      sid       = "TaskRoleObjectAccess"
      actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
      resources = ["${aws_s3_bucket.this.arn}/*"]
      principals {
        type        = "AWS"
        identifiers = [data.aws_iam_role.task[0].arn]
      }
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.this.json
}
