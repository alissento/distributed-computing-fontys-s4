package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

const queueURL = "http://localhost:4566/000000000000/stock-job-queue" // Replace with your actual queue URL
// SendMessageToSQS sends a message to the SQS queue
func SendMessageToSQS(message string) error {
	// Load AWS SDK configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-1"))
	if err != nil {
		return fmt.Errorf("unable to load SDK config, %v", err)
	}

	// Initialize SQS client
	sqsClient := sqs.NewFromConfig(cfg)

	// Send message to SQS
	_, err = sqsClient.SendMessage(context.TODO(), &sqs.SendMessageInput{
		QueueUrl:    aws.String(queueURL),
		MessageBody: aws.String(message),
	})
	if err != nil {
		return fmt.Errorf("failed to send message to SQS: %w", err)
	}

	log.Println("Message successfully sent to SQS")
	return nil
}
