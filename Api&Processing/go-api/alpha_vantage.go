package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

func FetchStockData(symbol string) (map[string]interface{}, error) {
	var data map[string]interface{}
	data, err := FetchStockDataFromS3(StockDataBucketName, symbol)
	if err != nil {
		log.Println("An error with S3 has happened:", err)
	}
	if err == nil {
		return data, nil
	}
	//ToDo:Implement input validation for the symbol
	url := fmt.Sprintf("%ssymbol=%s&exchange=&outputsize=full&datatype=json&function=TIME_SERIES_DAILY&apikey=%s", alphaVantageBaseURL, symbol, alphaVantageAPIKey)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Alpha Vantage: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		//ToDo: make centralized error handling
		return nil, fmt.Errorf("failed to response : %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Alpha Vantage API error: %s", string(body))
	}

	if !json.Valid(body) {
		return nil, fmt.Errorf("invalid JSON response: %s", string(body))
	}

	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}
	return (data), nil
}

func FetchStockDataFromS3(bucketName, symbol string) (map[string]interface{}, error) {
	jsonString, err := DownloadS3Object(bucketName, symbol)
	if err != nil {
		return nil, err
	}

	var data map[string]interface{}
	err = json.Unmarshal([]byte(jsonString), &data)
	if err != nil {
		return nil, fmt.Errorf("failed to parse stock data JSON: %w", err)
	}

	return data, nil
}
