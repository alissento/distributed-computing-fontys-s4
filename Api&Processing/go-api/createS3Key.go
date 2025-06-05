package main

import (
	"fmt"
)

func SaveToS3WithJobKey(requestData struct{ JobID string }, stockDataJson []byte) (string, error) {

	s3Key := "raw-data/" + requestData.JobID + ".json"
	err := SaveToS3(StockDataBucketName, s3Key, string(stockDataJson))
	if err != nil {
		return "", fmt.Errorf("failed to save to S3: %w", err)
	}
	return s3Key, nil
}
