resource "aws_ecr_repository" "admin" {
  name                 = "edmp-gdxp-admin-ecr"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
