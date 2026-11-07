resource "aws_s3_bucket" "this" { bucket=var.bucket_name; force_destroy=false; tags=merge(var.tags,{"tmna:environment"=var.environment}); lifecycle { prevent_destroy=true } }
resource "aws_s3_bucket_versioning" "this" { bucket=aws_s3_bucket.this.id; versioning_configuration { status="Enabled" } }
resource "aws_s3_bucket_server_side_encryption_configuration" "this" { bucket=aws_s3_bucket.this.id; rule { apply_server_side_encryption_by_default { sse_algorithm=var.kms_key_arn==null?"AES256":"aws:kms"; kms_master_key_id=var.kms_key_arn }; bucket_key_enabled=var.kms_key_arn!=null } }
resource "aws_s3_bucket_public_access_block" "this" { bucket=aws_s3_bucket.this.id; block_public_acls=true; block_public_policy=true; ignore_public_acls=true; restrict_public_buckets=true }
resource "aws_s3_bucket_ownership_controls" "this" { bucket=aws_s3_bucket.this.id; rule { object_ownership="BucketOwnerEnforced" } }
resource "aws_s3_bucket_lifecycle_configuration" "this" { bucket=aws_s3_bucket.this.id; depends_on=[aws_s3_bucket_versioning.this]
 rule { id="release-archives"; status="Enabled"; filter { prefix="_releases/" }; expiration { days=var.release_retention_days }; noncurrent_version_expiration { noncurrent_days=30 } }
 rule { id="rollback-archives"; status="Enabled"; filter { prefix="_rollback/releases/" }; expiration { days=var.rollback_retention_days }; noncurrent_version_expiration { noncurrent_days=30 } }
 rule { id="multipart"; status="Enabled"; filter {}; abort_incomplete_multipart_upload { days_after_initiation=7 } }
}
data "aws_iam_policy_document" "tls" { statement { sid="DenyInsecureTransport"; effect="Deny"; actions=["s3:*"]; resources=[aws_s3_bucket.this.arn,"${aws_s3_bucket.this.arn}/*"]; principals { type="*"; identifiers=["*"] }; condition { test="Bool"; variable="aws:SecureTransport"; values=["false"] } } }
resource "aws_s3_bucket_policy" "this" { bucket=aws_s3_bucket.this.id; policy=data.aws_iam_policy_document.tls.json }
