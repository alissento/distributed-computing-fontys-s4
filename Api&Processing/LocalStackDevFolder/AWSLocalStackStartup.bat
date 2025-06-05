@echo off
aws sqs create-queue --queue-name stock-job-queue --endpoint-url http://localhost:4566
aws --endpoint-url=http://localhost:4566 s3 mb s3://stock-data-bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://stock-prediction-dump-bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://jobs
