package main

import (
	"fmt"
	"net/http"
)

func Handle_Stock_History(w http.ResponseWriter, r *http.Request) {
	stockSymbol, err := getURLParam(r, "stock_name")
	if err != nil {
		http.Error(w, "Failed to download job data: "+err.Error(), http.StatusBadRequest)
		return
	}

	stockData, err := DownloadS3Object(stockBucket, stockSymbol)
	if err != nil {
		http.Error(w, fmt.Sprintf("Stock data for %s not found: %v", stockSymbol, err), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(stockData))
}
