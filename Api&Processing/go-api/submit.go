package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

var requestData struct { //this is the request data structure
	StockSymbol    string `json:"stock_symbol"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
}
var stockdata map[string]interface{}

// HandleSubmit
func HandleSubmit(w http.ResponseWriter, r *http.Request) {
	fmt.Print("\033[H\033[2J") // Clear the console.

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	log.Println(requestData) // check hoe het hier aankomt! (ToDo)

	stockdata, err := FetchStockData(requestData.StockSymbol)
	if err != nil {
		http.Error(w, "Failed to fetch stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	//Convert stockdata to JSON
	stockDataJson, err := json.Marshal(stockdata)
	if err != nil {
		http.Error(w, "Failed to marshal stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	//Create S3 key (e.g., use job ID)
	s3Key := "raw-data/" + requestData.JobID + ".json"

	err = SaveToS3(StockDataBucketName, s3Key, string(stockDataJson))
	if err != nil {
		http.Error(w, "Failed to save to S3: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a JobRequest to send to SQS
	jobRequest := JobRequest{
		S3Key:          s3Key,
		ProcessingType: requestData.ProcessingType,
		JumpDays:       requestData.JumpDays,
		EndDate:        requestData.EndDate,
		JobID:          requestData.JobID,
	}

	// Conver to json
	messageBody, err := json.Marshal(jobRequest) //(TODO what is json.Marshal?)
	if err != nil {
		http.Error(w, "Failed to marshal job request: "+err.Error(), http.StatusInternalServerError)
		return
	}
	//Send the message to SQS
	err = SendMessageToSQS(string(messageBody))
	if err != nil {
		http.Error(w, "Failed to send to SQS: "+err.Error(), http.StatusInternalServerError)
		return
	}
	//Send a successful response back
	fmt.Fprintln(w, "Stock data processed successfully")
}
