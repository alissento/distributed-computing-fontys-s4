// main.go (go-processor)
package main

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

var s3Client *s3.Client
var sqsClient *sqs.Client
var queueURL = "http://localhost:4566/000000000000/stock-job-queue"
var bucketName = "stock-data-bucket"

const region = "us-east-1"

func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(
			aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider("test", "test", ""))),
		config.WithEndpointResolver(aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
			return aws.Endpoint{URL: "http://localhost:4566", SigningRegion: region}, nil
		})),
	)
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	s3Client = s3.NewFromConfig(cfg)
	sqsClient = sqs.NewFromConfig(cfg)

	for {
		out, err := sqsClient.ReceiveMessage(context.TODO(), &sqs.ReceiveMessageInput{
			QueueUrl:            &queueURL,
			MaxNumberOfMessages: 1,
			WaitTimeSeconds:     5,
		})
		if err != nil {
			log.Println("SQS error:", err)
			continue
		}

		for _, msg := range out.Messages {
			log.Println("Processing:", *msg.Body)
			processJob(*msg.Body)

			_, err = sqsClient.DeleteMessage(context.TODO(), &sqs.DeleteMessageInput{
				QueueUrl:      &queueURL,
				ReceiptHandle: msg.ReceiptHandle,
			})
			if err != nil {
				log.Println("Failed to delete message:", err)
			}
		}
	}
}
