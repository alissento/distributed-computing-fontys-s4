package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/joho/godotenv"
)

var (
	region              = os.Getenv("AWS_REGION")
	endpoint            = os.Getenv("S3_ENDPOINT") // optional, for local dev
	accessKey           = os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey           = os.Getenv("AWS_SECRET_ACCESS_KEY")
	queueURL            = os.Getenv("QUEUE_URL")
	stockBucket         = os.Getenv("BUCKET_NAME")
	predictionBucket    = os.Getenv("PREDICTION_BUCKET")
	alphaVantageAPIKey  = os.Getenv("ALPHAVANTAGE_KEY")
	awsname             = os.Getenv("AWS_NAME")
	awspassword         = os.Getenv("AWS_PASSWORD")
	StockDataBucketName = os.Getenv("STOCK_DATA_BUCKET")
	s3Client            *s3.Client
	sqsClient           *sqs.Client
)

type JobRequest struct {
	S3Key          string `json:"s3_key"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
}

type StockData struct {
	MetaData        map[string]interface{}       `json:"Meta Data"`
	TimeSeriesDaily map[string]map[string]string `json:"Time Series (Daily)"`
}
type JobResult struct {
	JobID       string `json:"job_id"`
	Status      string `json:"status"`
	ResultS3Key string `json:"result_s3_key"`
}

func main() {
	// Load enviroment variables
	envFile := ".env.dev"
	if os.Getenv("APP_ENV") == "production" {
		envFile = ".env.aws"
	}

	err := godotenv.Load(envFile)
	if err != nil {
		log.Fatalf("Error loading env file %s: %v", envFile, err)
	}

	// Load the AWS SDK configuration with correct LocalStack endpoint for both SQS and S3
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(
			aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(awsname, awspassword, ""))),
		config.WithEndpointResolver(aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
			if service == s3.ServiceID {
				// Explicitly set the endpoint for S3
				return aws.Endpoint{
					URL:               endpoint,
					HostnameImmutable: true, // Prevents host rewriting
				}, nil
			}
			if service == sqs.ServiceID {
				// Explicitly set the endpoint for SQS
				return aws.Endpoint{
					URL:               endpoint,
					HostnameImmutable: true, // Prevents host rewriting
				}, nil
			}
			return aws.Endpoint{}, fmt.Errorf("unknown endpoint requested for service: %s", service)
		})),
	)
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	s3Client = s3.NewFromConfig(cfg)
	sqsClient = sqs.NewFromConfig(cfg)

	// Create the SQS queue if it doesn't exist
	for {
		out, err := sqsClient.ReceiveMessage(context.TODO(), &sqs.ReceiveMessageInput{
			QueueUrl:            &queueURL,
			MaxNumberOfMessages: 1,
			WaitTimeSeconds:     5,
		})
		time.Sleep(10 * time.Second) // anti spamming
		if err != nil {
			log.Println("SQS error:", err)
			continue
		}
		// Check if there are any messages in the queue
		for _, msg := range out.Messages {
			log.Println("Processing:", *msg.Body)
			processJob(*msg.Body)
			// Delete the message after processing
			// This is important to prevent the message from being processed again
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
