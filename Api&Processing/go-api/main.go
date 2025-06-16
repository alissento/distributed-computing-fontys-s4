package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
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
	S3Key          string `json:"s3_key"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
	JobStatus      string `json:"job_status"`
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
	endpoint = os.Getenv("S3_ENDPOINT")
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

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region), // You can still specify region if needed
		config.WithEndpointResolver(aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
			if service == s3.ServiceID || service == sqs.ServiceID {
				return aws.Endpoint{
					URL:               endpoint,
					HostnameImmutable: true,
				}, nil
			}
			return aws.Endpoint{}, fmt.Errorf("unknown endpoint requested for service: %s", service)
		})),
	)
	if err != nil {
		log.Fatal("Failed to load AWS config:", err)
	}

	s3Client = s3.NewFromConfig(cfg)
	sqsClient = sqs.NewFromConfig(cfg)

	// Start the HTTP server with the submit handler

	r := mux.NewRouter()

	r.HandleFunc("/stocks", Handle_Stock_Symbols).Methods("GET")                      //Return all stock symbols
	r.HandleFunc("/stocks/{stock_name}/history", Handle_Stock_History).Methods("GET") //fetch stock history data

	r.HandleFunc("/jobs", Handle_Job_Request).Methods("POST")          //submit job request for stock data processing
	r.HandleFunc("/jobs/{job_id}/status", getJobStatus).Methods("GET") //return job status by job_id
	r.HandleFunc("/jobs", getAllJobs).Methods("GET")                   //return all jobs
	r.HandleFunc("/jobs/{job_id}/result", getJobResult).Methods("GET") //return job result by job_id
	r.HandleFunc("/jobs/{job_id}/pdf", getJobPdf).Methods("GET")       //return job pdf.
	log.Println("API server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
