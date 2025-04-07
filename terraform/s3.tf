resource "aws_s3_bucket" "kubernetes_bucket" {
  bucket        = "kubernetes-bucket-dc-group"
  force_destroy = true
  tags = {
    Name        = "Kubernetes-Bucket"
    Environment = "Dev"
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.kubernetes_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}