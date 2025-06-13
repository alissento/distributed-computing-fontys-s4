package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var requestDataPredict struct {
	StockSymbol    string `json:"stock_symbol"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
}

func Handle_Job_Request(w http.ResponseWriter, r *http.Request) {
	if err := json.NewDecoder(r.Body).Decode(&requestDataPredict); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	stockdata, err := FetchStockData(requestDataPredict.StockSymbol)
	if err != nil {
		http.Error(w, "Failed to fetch stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if errMsgRaw, found := stockdata["Error Message"]; found {
		if errMsg, ok := errMsgRaw.(string); ok {
			http.Error(w, "API error: "+errMsg, http.StatusBadRequest)
			return
		}
	}

	stockDataJson, err := json.Marshal(stockdata)
	if err != nil {
		http.Error(w, "Failed to marshal stock data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var jobID = GenerateJobID()

	err = SaveToS3(StockDataBucketName, requestDataPredict.StockSymbol, string(stockDataJson))
	if err != nil {
		http.Error(w, "Failed to save to S3: "+err.Error(), http.StatusInternalServerError)
		return
	}
	jobRequest := JobRequest{
		S3Key:          requestDataPredict.StockSymbol,
		ProcessingType: requestDataPredict.ProcessingType,
		JumpDays:       requestDataPredict.JumpDays,
		EndDate:        requestDataPredict.EndDate,
		StartDate:      requestDataPredict.StartDate,
		JobID:          jobID,
		JobStatus:      "pending",
	}

	messageBody, err := json.Marshal(jobRequest)
	if err != nil {
		http.Error(w, "Failed to marshal job request: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = SendMessageToSQS(string(messageBody), jobID)
	if err != nil {
		http.Error(w, "Failed to send to SQS: "+err.Error(), http.StatusInternalServerError)
		return
	}
	SaveJobRequestToS3(jobID, jobRequest)
	fmt.Fprint(w, jobID)

}
