package main

import (
	"encoding/json"
	"fmt"
	"log"

	// "log"
	"net/http"
)

const bucketName = "stock-data-bucket"

// HandleSubmit
func HandleSubmit(w http.ResponseWriter, r *http.Request) {
	fmt.Print("\033[H\033[2J") // Clear the console.

	var requestData struct { //this is the request data structure
		StockSymbol    string `json:"stock_symbol"`
		ProcessingType string `json:"processing_type"`
		JumpDays       int    `json:"jump_days"`
		EndDate        string `json:"end_date"`
		JobID          string `json:"job_id"`
	}
	log.Println(requestData) // check hoe het hier aankomt! (ToDo)
	// Decode jsoon
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	// S3 logic (TODO activate if needed) !
	// //Check if stock data is already in S3
	// stockData, err := GetFromS3(bucketName, requestData.StockSymbol+".json")
	// if err != nil {
	// 	// If not in S3 fetch from api
	// 	log.Printf("Fetching data for stock symbol: %s", requestData.StockSymbol)

	var stockdata map[string]interface{}
	stockdata, err := FetchStockData(requestData.StockSymbol)
	if err != nil {
		http.Error(w, "Failed to fetch stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 	// Save stock data
	// 	err = SaveToS3(stockData, requestData.StockSymbol+".json", stockData)
	// 	if err != nil {
	// 		http.Error(w, "Failed to save: "+err.Error(), http.StatusInternalServerError)
	// 		return
	// 	}
	// }

	// Create a JobRequest to send to SQS
	jobRequest := JobRequest{
		prosessingData: stockdata,
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
