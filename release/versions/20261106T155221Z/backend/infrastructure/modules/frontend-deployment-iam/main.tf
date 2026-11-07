data "aws_iam_policy_document" "this" {
 statement { sid="ListBuckets"; actions=["s3:ListBucket","s3:GetBucketLocation"]; resources=[for b in var.bucket_names:"arn:aws:s3:::${b}"] }
 statement { sid="ManageObjects"; actions=["s3:GetObject","s3:PutObject","s3:DeleteObject"]; resources=[for b in var.bucket_names:"arn:aws:s3:::${b}/*"] }
}
resource "aws_iam_policy" "this" { name=var.policy_name; policy=data.aws_iam_policy_document.this.json; tags=merge(var.tags,{"tmna:environment"=var.environment}) }
data "aws_iam_role" "existing" { count=var.attach_enabled?1:0; name=var.role_name }
resource "aws_iam_role_policy_attachment" "this" { count=var.attach_enabled?1:0; role=data.aws_iam_role.existing[0].name; policy_arn=aws_iam_policy.this.arn }
