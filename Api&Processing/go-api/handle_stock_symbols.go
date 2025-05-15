package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func Handle_Stock_Symbols(w http.ResponseWriter, r *http.Request) {

	symbols, err := GetStockSymbolsFromDB(stockBucket)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch stock symbols: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the list of stock symbols as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(symbols)

}
func GetStockSymbolsFromDB(bucketName string) ([]string, error) {
	// List all objects in the bucket
	resp, err := s3Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list objects in bucket: %w", err)
	}

	var symbols []string
	for _, obj := range resp.Contents {
		// Assuming the object key is the stock symbol, you can refine this if needed
		symbols = append(symbols, *obj.Key)
	}

	log.Printf("Successfully fetched stock symbols from bucket: %s", bucketName)
	return symbols, nil
}
