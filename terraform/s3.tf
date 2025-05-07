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

# Uncomment when playbooks are ready
# resource "aws_s3_object" "ansible_worker_node_script" {
#   bucket = aws_s3_bucket.kubernetes_bucket.id
#   key    = "ansible/masternode-playbook.yml"
#   source = "ansible/masternode-playbook.yml"
# }

# resource "aws_s3_object" "ansible_master_node_script" {
#   bucket = aws_s3_bucket.kubernetes_bucket.id
#   key    = "ansible/workernode-playbook.yml"
#   source = "ansible/workernode-playbook.yml"
# }

# Delete this after the playbooks are ready
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