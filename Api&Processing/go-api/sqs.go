package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

//How to make this dynamic for local and live access!
// SendMessageToSQS sends a message to the SQS queue

func SendMessageToSQS(message string) error {
	// Load AWS
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("eu-west-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
		config.WithEndpointResolverWithOptions(
			aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:           endpoint,
					SigningRegion: region,
				}, nil
			}),
		),
	)
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
	// Save job to S3
	SaveToS3(jobBucket, "job_info.json", message)

	log.Println("Message successfully sent to SQS")
	return nil
}
