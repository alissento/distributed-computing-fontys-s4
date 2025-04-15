package main

import (
	"log"
	"net/http"
)

// initialize the request
type JobRequest struct {
	StockSymbol    string `json:"stock_symbol"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"` // The number of jumps (like weeks or months)
	EndDate        string `json:"end_date"`  // End date for the stock data request
	JobID          string `json:"job_id"`
}

func main() {
	// Start the HTTP server with the submit handler
	http.HandleFunc("/submit", HandleSubmit)
	log.Println("API server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
