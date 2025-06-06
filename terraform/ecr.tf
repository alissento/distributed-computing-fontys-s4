resource "aws_ecr_repository" "container-repo" {
  name                 = "dc-container-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}