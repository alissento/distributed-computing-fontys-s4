package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func FetchStockData(symbol string) (map[string]interface{}, error) {
	// (TODO check if this logic can be used for injection!) %s means it will replace it with the value that comes after it.
	var data map[string]interface{}

	data, err := FetchStockDataFromS3(StockDataBucketName, symbol)
	if err != nil {
		log.Println("Error fetching data from S3:", err)
	}
	if err == nil {
		return data, nil
	}

	// If not found, fetch from Alpha Vantage

	url := fmt.Sprintf("%ssymbol=%s&exchange=&outputsize=full&datatype=json&function=TIME_SERIES_DAILY&apikey=%s", alphaVantageBaseURL, symbol, alphaVantageAPIKey)
	log.Println("Fetching data from URL:", url) // check hoe het hier aankomt! (ToDo)
	// Send the request
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data from Alpha Vantage: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body) // Verender naar log! (TODO)
	if err != nil {
		//Note van Owen :D %w is used to wrap the error with additional context
		return nil, fmt.Errorf("failed to response : %w", err)
	}

	// Check if the API returned an error
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Alpha Vantage API error: %s", string(body))
	}

	log.Println("Response Body:", string(body)) // check hoe het hier aankomt! (ToDo)
	if !json.Valid(body) {
		return nil, fmt.Errorf("invalid JSON response: %s", string(body))
	}

	// Parsee json response
	//map to hold the JsoN data
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}
	return (data), nil
}
func FetchStockDataFromS3(bucketName, symbol string) (map[string]interface{}, error) {
	jsonString, err := DownloadStockDataFromS3(bucketName, symbol)
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
