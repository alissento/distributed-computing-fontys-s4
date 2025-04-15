package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

const alphaVantageAPIKey = "" // Secure the key here
const alphaVantageBaseURL = "https://www.alphavantage.co/query"

// FetchStockData TIME_SERIES_DAILY API
func FetchStockData(symbol string) (string, error) {
	// (TODO check if this logic can be used for injection!) %s means it will replace it with the value that comes after it.
	url := fmt.Sprintf("%s?function=TIME_SERIES_DAILY&symbol=%s&apikey=%s", alphaVantageBaseURL, symbol, alphaVantageAPIKey)

	// Send the request
	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to fetch data from Alpha Vantage: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		//Note %w is used to wrap the error with additional context
		return "", fmt.Errorf("failed to response : %w", err)
	}

	// Check if the API returned an error
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Alpha Vantage API error: %s", string(body))
	}

	// Parsee JSON response
	var data map[string]interface{} //map to hold the JSON data
	if err := json.Unmarshal(body, &data); err != nil {
		return "", fmt.Errorf("failed to parse JSON: %w", err)
	}

	// Convert data to string or process as needed
	return string(body), nil
}
