package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

const bucketName = "stock-data-bucket"

// HandleSubmit
func HandleSubmit(w http.ResponseWriter, r *http.Request) {
	var requestData struct { //this is the request data structure
		StockSymbol    string `json:"stockSymbol"`
		ProcessingType string `json:"processingType"`
		JumpDays       int    `json:"jumpDays"`
		EndDate        string `json:"endDate"`
		JobID          string `json:"jobID"`
	}

	// Decode jsoon
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	//Check if stock data is already in S3
	stockData, err := GetFromS3(bucketName, requestData.StockSymbol+".json")
	if err != nil {
		// If not in S3 fetch from api
		log.Printf("Fetching data for stock symbol: %s", requestData.StockSymbol)
		stockData, err = FetchStockData(requestData.StockSymbol) // (TODo double ceck logic here)
		if err != nil {
			http.Error(w, "Failed to fetch stock data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Save stock data
		err = SaveToS3(stockData, requestData.StockSymbol+".json", stockData)
		if err != nil {
			http.Error(w, "Failed to save: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Create a JobRequest to send to SQS
	jobRequest := JobRequest{
		StockSymbol:    requestData.StockSymbol,
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
