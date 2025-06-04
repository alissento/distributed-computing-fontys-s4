package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/gorilla/mux"
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
	alphaVantageBaseURL string
	StockDataBucketName string
	s3Client            *s3.Client
	sqsClient           *sqs.Client
	awsname             string
	awspassword         string
	jobBucket           string
)

// initialize the request
type JobStatusResponse struct {
	JobID     string `json:"job_id"`
	Status    string `json:"status"`
	JobName   string `json:"job_name"`
	CreatedAt string `json:"created_at"`
}
type JobRequest struct {
	S3Key          string `json:"s3_key"`
	ProcessingType string `json:"processing_type"`
	StartDate      string `json:"start_date"`
	JumpDays       int    `json:"jump_days"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
	JobStatus      string `json:"job_status"` // Initial status of the job
}
type RequestData struct {
	StockSymbol    string `json:"stock_symbol"`
	ProcessingType string `json:"processing_type"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
	JumpDays       int    `json:"jump_days"`
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

	region = os.Getenv("AWS_REGION")
	endpoint = os.Getenv("S3_ENDPOINT") // optional, for local dev
	accessKey = os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey = os.Getenv("AWS_SECRET_ACCESS_KEY")
	queueURL = os.Getenv("QUEUE_URL")
	stockBucket = os.Getenv("BUCKET_NAME")
	predictionBucket = os.Getenv("PREDICTION_BUCKET")
	alphaVantageAPIKey = os.Getenv("ALPHAVANTAGE_KEY")
	alphaVantageBaseURL = os.Getenv("ALPHAVANTAGE_BASE_URL")
	StockDataBucketName = os.Getenv("STOCK_DATA_BUCKET")
	awsname = os.Getenv("AWS_NAME")
	awspassword = os.Getenv("AWS_PASSWORD")
	jobBucket = os.Getenv("JOB_BUCKET")

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

	// Start the HTTP server with the submit handler

	r := mux.NewRouter()
	// Exact match for /stocks
	r.HandleFunc("/stocks", Handle_Stock_Symbols).Methods("GET")

	// Match with path parameter
	r.HandleFunc("/stocks/{stock_name}", Handle_Stock_Request).Methods("GET")

	// Historical data route (replace "stocknaam" with actual param if needed)
	r.HandleFunc("/stocks/{stock_name}/history", Handle_Stock_History).Methods("GET")
	r.HandleFunc("/jobs/{job_id}/status/", getJobStatus).Methods("GET")
	r.HandleFunc("/jobs", getAllJobs) //return all jobs
	// // Job status route
	// r.HandleFunc("/job/jobstatus", Handle_Job_Status).Methods("GET")

	log.Println("API server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
