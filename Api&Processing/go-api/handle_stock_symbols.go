package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func Handle_Stock_Symbols(w http.ResponseWriter, r *http.Request) {
	symbols, err := ListS3Keys(stockBucket)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch stock symbols: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(symbols)

}
