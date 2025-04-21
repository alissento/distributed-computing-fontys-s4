provider "aws" {
  region = "eu-west-1"
}

resource "aws_sqs_queue" "my_sqs_queue" {
  name                      = "ApplicationQueue"
  delay_seconds             = 10
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_message_wait_time_seconds = 10
  visibility_timeout_seconds = 30

  tags = {
    Environment = "production"
    Project     = "Distrubted computing"
  }
}

output "sqs_queue_url" {
  value = aws_sqs_queue.my_sqs_queue.id
}

output "sqs_queue_arn" {
  value = aws_sqs_queue.my_sqs_queue.arn
}
