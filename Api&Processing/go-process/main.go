package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/joho/godotenv"
)

var (
	region              string
	endpoint            string
	accessKey           string
	secretKey           string
	queueURL            string
	stockBucket         string
	predictionBucket    string
	alphaVantageAPIKey  string
	awsname             string
	awspassword         string
	StockDataBucketName string
	s3Client            *s3.Client
	sqsClient           *sqs.Client
	jobBucket           string
)

type JobRequest struct {
	S3Key          string `json:"s3_key"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
	JobStatus      string `json:"job_status"`
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
	// Load .env file only if running locally (no APP_ENV or APP_ENV=local)
	if os.Getenv("APP_ENV") == "" || os.Getenv("APP_ENV") == "local" {
		envFile := ".env.dev"
		err := godotenv.Load(envFile)
		if err != nil {
			log.Printf("Warning: could not load %s: %v", envFile, err)
		}
	} else {
		log.Println("Running in production environment — skipping .env load")
	}

	region = os.Getenv("AWS_REGION")
	endpoint = os.Getenv("S3_ENDPOINT")
	accessKey = os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey = os.Getenv("AWS_SECRET_ACCESS_KEY")
	queueURL = os.Getenv("QUEUE_URL")
	stockBucket = os.Getenv("BUCKET_NAME")
	predictionBucket = os.Getenv("PREDICTION_BUCKET")
	StockDataBucketName = os.Getenv("STOCK_DATA_BUCKET")
	awsname = os.Getenv("AWS_NAME")
	awspassword = os.Getenv("AWS_PASSWORD")
	jobBucket = os.Getenv("JOB_BUCKET")

	var opts []func(*config.LoadOptions) error

	opts = append(opts, config.WithRegion(region))

	if endpoint != "" {

		opts = append(opts, config.WithEndpointResolver(
			aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
				if service == s3.ServiceID || service == sqs.ServiceID {
					return aws.Endpoint{
						URL:               endpoint,
						HostnameImmutable: true,
					}, nil
				}
				return aws.Endpoint{}, fmt.Errorf("unknown endpoint requested for service: %s", service)
			}),
		))
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(), opts...)
	if err != nil {
		log.Fatal("Failed to load AWS config:", err)
	}

	s3Client = s3.NewFromConfig(cfg)
	sqsClient = sqs.NewFromConfig(cfg)

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

		for _, msg := range out.Messages {
			log.Println("Processing:", *msg.Body)
			processJob(*msg.Body)
			//Todo check Loadbalancing behavior
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
