#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack"
sleep 5

# Create S3 buckets
awslocal s3 mb s3://stock-data-bucket
awslocal s3 mb s3://stock-prediction-dump-bucket

# Create SQS queue
awslocal sqs create-queue --queue-name stock-job-queue

echo "success"
