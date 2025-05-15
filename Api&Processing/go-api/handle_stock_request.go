package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

var requestDataPredict struct { //this is the request data structure
	StockSymbol    string `json:"stock_symbol"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
}

func Handle_Stock_Request(w http.ResponseWriter, r *http.Request) {
	fmt.Print("\033[H\033[2J") // Clear the console.

	if err := json.NewDecoder(r.Body).Decode(&requestDataPredict); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	log.Println(requestDataPredict) // check hoe het hier aankomt! (ToDo)

	//Mux is een router for HTTP requests. It matches the URL path and HTTP method to a handler function.
	vars := mux.Vars(r)
	stock_symbol, ok := vars["stock_name"]
	if !ok {
		fmt.Println("id is missing in parameters")
	}
	stockdata, err := FetchStockData(stock_symbol)
	if err != nil {
		http.Error(w, "Failed to fetch stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	stockDataJson, err := json.Marshal(stockdata)
	if err != nil {
		http.Error(w, "Failed to marshal stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var jobID = GenerateJobID()
	// s3Key := "raw-data/" + jobID + ".json"

	err = SaveToS3(StockDataBucketName, stock_symbol, string(stockDataJson))
	if err != nil {
		http.Error(w, "Failed to save to S3: "+err.Error(), http.StatusInternalServerError)
		return
	}
	jobRequest := JobRequest{
		S3Key:          stock_symbol, //TODO change to s3Key
		ProcessingType: requestDataPredict.ProcessingType,
		JumpDays:       requestDataPredict.JumpDays,
		EndDate:        requestDataPredict.EndDate,
		StartDate:      requestDataPredict.StartDate,
		JobID:          jobID,
	}
	messageBody, err := json.Marshal(jobRequest) //(TODO what is json.Marshal?)
	if err != nil {
		http.Error(w, "Failed to marshal job request: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = SendMessageToSQS(string(messageBody))
	if err != nil {
		http.Error(w, "Failed to send to SQS: "+err.Error(), http.StatusInternalServerError)
		return
	}
	//Send a successful response back
	fmt.Fprintln(w, "Stock data processed successfully")

}
