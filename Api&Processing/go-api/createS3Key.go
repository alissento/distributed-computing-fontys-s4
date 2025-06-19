package main

import (
	"fmt"
	"log"
)

func SaveToS3WithJobKey(requestData struct{ JobID string }, stockDataJson []byte) (string, error) {

	s3Key := "raw-data/" + requestData.JobID + ".json"
	err := SaveToS3(StockDataBucketName, s3Key, string(stockDataJson))
	if err != nil {
		log.Println("Failed to save stock data to S3:", err)
		return "", fmt.Errorf("failed to save to S3")
	}
	return s3Key, nil
}
