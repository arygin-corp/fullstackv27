resource "aws_s3_bucket" "this" {bucket=var.bucket_name;force_destroy=false;tags=merge(var.tags,{"tmna:environment"=var.environment});lifecycle{prevent_destroy=true}}
resource "aws_s3_bucket_versioning" "this" {bucket=aws_s3_bucket.this.id;versioning_configuration{status="Enabled"}}
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {bucket=aws_s3_bucket.this.id;rule{apply_server_side_encryption_by_default{sse_algorithm="AES256"}}}
resource "aws_s3_bucket_public_access_block" "this" {bucket=aws_s3_bucket.this.id;block_public_acls=true;block_public_policy=true;ignore_public_acls=true;restrict_public_buckets=true}
resource "aws_s3_bucket_ownership_controls" "this" {bucket=aws_s3_bucket.this.id;rule{object_ownership="BucketOwnerEnforced"}}
data "aws_iam_policy_document" "bucket" {
 statement {sid="DenyInsecureTransport";effect="Deny";actions=["s3:*"];resources=[aws_s3_bucket.this.arn,"${aws_s3_bucket.this.arn}/*"];principals{type="*";identifiers=["*"]};condition{test="Bool";variable="aws:SecureTransport";values=["false"]}}
 statement {sid="TaskRoleAccess";actions=["s3:ListBucket"];resources=[aws_s3_bucket.this.arn];principals{type="AWS";identifiers=[var.task_role_arn]}}
 statement {sid="TaskRoleObjectAccess";actions=["s3:GetObject","s3:PutObject","s3:DeleteObject"];resources=["${aws_s3_bucket.this.arn}/media/*","${aws_s3_bucket.this.arn}/data/*"];principals{type="AWS";identifiers=[var.task_role_arn]}}
}
resource "aws_s3_bucket_policy" "this" {bucket=aws_s3_bucket.this.id;policy=data.aws_iam_policy_document.bucket.json}
