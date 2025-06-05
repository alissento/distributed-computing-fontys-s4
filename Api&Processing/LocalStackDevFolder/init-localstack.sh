#!/bin/bash
set -e

echo "Waiting for LocalStack to be ready..."
until awslocal s3 ls > /dev/null 2>&1; do
  sleep 2
done

echo "Creating SQS queue..."
aws sqs create-queue --queue-name stock-job-queue --endpoint-url http://localhost:4566

echo "Creating S3 buckets..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://stock-data-bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://stock-prediction-dump-bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://jobs

echo "Resources created successfully."