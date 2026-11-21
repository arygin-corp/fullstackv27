data "aws_s3_bucket" "app" {
  bucket = var.bucket
}

resource "aws_ecr_repository" "repo" {
  name                 = var.repo
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = var.standard_tags
}
resource "aws_ecr_lifecycle_policy" "lifecycle" {
  repository = aws_ecr_repository.repo.name
  policy = jsonencode({
    rules : [{ rulePriority : 1, description : "keep last 30", selection : { tagStatus : "any", countType : "imageCountMoreThan", countNumber : 30 }, action : { type : "expire" } }]
  })
}

output "ecr_repo_url" { value = "${var.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${aws_ecr_repository.repo.name}" }

data "aws_region" "current" {}
