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

resource "aws_s3_object" "ansible_worker_node_script" {
  bucket = aws_s3_bucket.kubernetes_bucket.id
  key    = "ansible/k8_worker.yml"
  source = "ansible/workerplaybook.yml"
}

resource "aws_s3_object" "ansible_master_node_script" {
  bucket = aws_s3_bucket.kubernetes_bucket.id
  key    = "ansible/k8_master.yml"
  source = "ansible/k8book.yml"
}