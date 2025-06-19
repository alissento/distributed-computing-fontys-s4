package main

import (
	"fmt"
	"log"
	"net/http"
)

func Handle_Stock_History(w http.ResponseWriter, r *http.Request) {
	stockSymbol, err := getURLParam(r, "stock_name")
	if err != nil {
		http.Error(w, "Failed to download job data: ", http.StatusBadRequest)
		return
	}

	stockData, err := DownloadS3Object(stockBucket, stockSymbol)
	if err != nil {
		log.Println("Failed to download stock data from S3:", err)
		http.Error(w, fmt.Sprintf("Stock data not found:", stockSymbol), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(stockData))
}
