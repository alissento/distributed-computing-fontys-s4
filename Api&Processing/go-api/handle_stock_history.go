package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func Handle_Stock_History(w http.ResponseWriter, r *http.Request) {
	// Get the stock symbol from the URL parameter
	stockSymbol := mux.Vars(r)["stock_name"]
	// Attempt to download the stock data from S3
	stockData, err := DownloadStockDataFromS3(stockBucket, stockSymbol)
	if err != nil {
		// If there's an error, return a 404 (not found) with the error message
		http.Error(w, fmt.Sprintf("Stock data for %s not found: %v", stockSymbol, err), http.StatusNotFound)
		return
	}

	// Return the stock data in the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(stockData)) // Return the actual data
}
