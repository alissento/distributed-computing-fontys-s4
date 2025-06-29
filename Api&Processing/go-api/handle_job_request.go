package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
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
		http.Error(w, "Failed to decode request body: ", http.StatusBadRequest)
		log.Println("Error decoding request body:", err)
		return
	}

	requestDataPredict.StockSymbol = strings.ToUpper(requestDataPredict.StockSymbol)
	stockdata, err := FetchStockData(requestDataPredict.StockSymbol)
	if err != nil {
		http.Error(w, "Failed to fetch stock data: ", http.StatusInternalServerError)
		log.Println("Error fetching stock data:", err)
		return
	}

	if errMsgRaw, found := stockdata["Error Message"]; found {
		if errMsg, ok := errMsgRaw.(string); ok {
			http.Error(w, "API error: "+errMsg, http.StatusBadRequest)
			log.Println("API error:", errMsg)
			return
		}
	}

	stockDataJson, err := json.Marshal(stockdata)
	if err != nil {
		http.Error(w, "Failed to marshal stock data: ", http.StatusInternalServerError)
		log.Println("Error marshalling stock data:", err)
		return
	}
	var jobID = GenerateJobID()

	err = SaveToS3(StockDataBucketName, requestDataPredict.StockSymbol, string(stockDataJson))
	if err != nil {
		http.Error(w, "Failed to save to S3: ", http.StatusInternalServerError)
		log.Println("Error saving to S3:", err)
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
		http.Error(w, "Failed to marshal job request: ", http.StatusInternalServerError)
		log.Println("Error marshalling job request:", err)
		return
	}
	log.Println("Job request:", string(messageBody))
	err = SendMessageToSQS(string(messageBody))
	if err != nil {
		http.Error(w, "Failed to send to SQS: ", http.StatusInternalServerError)
		log.Println("Error sending to SQS:", err)
		return
	}
	log.Println("Job request sent to SQS:", jobID)
	SaveJobRequestToS3(jobID, jobRequest)
	if err != nil {
		http.Error(w, "Failed to save job request to S3: ", http.StatusInternalServerError)
		log.Println("Error saving job request to S3:", err)
		return
	}
	fmt.Fprint(w, jobID)

}
