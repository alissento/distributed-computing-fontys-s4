package main

import (
	"log"
	"net/http"
	"os"

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
	alphaVantageBaseURL = os.Getenv("ALPHAVANTAGE_BASE_URL")
	StockDataBucketName = os.Getenv("STOCK_DATA_BUCKET")
)

// initialize the request
type JobRequest struct {
	S3Key          string `json:"s3_key"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
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
	// Start the HTTP server with the submit handler

	http.HandleFunc("/submit", HandleSubmit)
	log.Println("API server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
