package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func saveToS3(s3Client *s3.Client, bucketName, key, data string) error {
	_, err := s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &bucketName,
		Key:    &key,
		Body:   bytes.NewReader([]byte(data)),
	})
	if err != nil {
		return fmt.Errorf("failed to upload data to S3: %w", err)
	}

	log.Printf("Successfully uploaded data to S3: %s/%s", bucketName, key)
	return nil
}

func updateJobStatusToCompleted(s3Client *s3.Client, bucketName, key string) error {
	log.Printf("This is the bucket name: %s", bucketName)
	log.Printf("This is the key: %s", key+".json")
	key += ".json"
	getResp, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &bucketName,
		Key:    &key,
	})
	if err != nil {
		return fmt.Errorf("failed to get object from S3: %w", err)
	}
	defer getResp.Body.Close()

	bodyBytes, err := io.ReadAll(getResp.Body)
	if err != nil {
		return fmt.Errorf("failed to read object body: %w", err)
	}
	var job JobRequest
	err = json.Unmarshal(bodyBytes, &job)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	job.JobStatus = "completed"

	updatedJSON, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal updated job: %w", err)
	}
	err = saveToS3(s3Client, bucketName, key, string(updatedJSON))
	if err != nil {
		return fmt.Errorf("failed to save updated job to S3: %w", err)
	}

	log.Printf("Job %s marked as completed", job.JobID)
	return nil
}
