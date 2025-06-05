package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func savePredictionsToS3(jobID string, result map[string]map[string]string, prefix string) error {
	jsonBytes, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	key := fmt.Sprintf("%s%s.json", prefix, jobID)

	err = saveToS3(s3Client, predictionBucket, key, string(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to save result to S3: %w", err)
	}

	log.Printf("Successfully saved predictions for job %s to %s", jobID, key)
	return nil
}
