resource "aws_s3_bucket" "kubernetes_bucket" {
  bucket        = "kubernetes-bucket-dc-group"
  force_destroy = true
  tags = {
    Name        = "Kubernetes-Bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket" "stock-data-bucket" {
  bucket        = "stock-data-bucket-dc-group"
  force_destroy = true
  tags = {
    Name        = "Stock-Data-Bucket"
    Environment = "Dev"
  }
}
resource "aws_s3_bucket" "stock-prediction-dump-bucket" {
  bucket        = "stock-prediction-dump-bucket-dc-group"
  force_destroy = true
  tags = {
    Name        = "Stock-Prediction-Dump-Bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket" "stock-jobs-bucket" {
  bucket        = "stock-jobs-bucket-dc-group"
  force_destroy = true
  tags = {
    Name        = "Stock-Jobs-Bucket"
    Environment = "Dev"
  }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "kubernetes_bucket_encryption" {
  bucket = aws_s3_bucket.kubernetes_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.kubernetes_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_object" "worker_node_script" {
  bucket = aws_s3_bucket.kubernetes_bucket.id
  key    = "ansible/masternode.sh"
  source = "ansible/masternode.sh"
}

resource "aws_s3_object" "master_node_script" {
  bucket = aws_s3_bucket.kubernetes_bucket.id
  key    = "ansible/workernode.sh"
  source = "ansible/workernode.sh"
}
