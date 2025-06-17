package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

func SendMessageToSQS(message string) error {
	if sqsClient == nil {
		return fmt.Errorf("sqsClient is not initialized")
	}

	_, err := sqsClient.SendMessage(context.TODO(), &sqs.SendMessageInput{
		QueueUrl:    aws.String(queueURL),
		MessageBody: aws.String(message),
	})

	if err != nil {
		return fmt.Errorf("failed to send message to SQS: %v", err)
	}

	log.Println("Message successfully sent to SQS")
	return nil
}
