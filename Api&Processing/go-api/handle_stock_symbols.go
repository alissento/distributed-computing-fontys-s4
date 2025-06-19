package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func Handle_Stock_Symbols(w http.ResponseWriter, r *http.Request) {
	symbols, err := ListS3Keys(stockBucket)
	if err != nil {
		log.Println("Failed to fetch stock symbols from S3:", err)
		http.Error(w, fmt.Sprintf("Failed to fetch stock symbols: %v"), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(symbols)

}
