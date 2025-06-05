package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func SaveToS3(bucketName, key, data string) error {

	_, err := s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      &bucketName,
		Key:         &key,
		Body:        bytes.NewReader([]byte(data)),
		ContentType: aws.String("application/json"),
	})
	if err != nil {
		return fmt.Errorf("failed to upload data to S3: %w", err)
	}

	log.Printf("Successfully uploaded data to S3: %s/%s", bucketName, key)
	return nil
}
func DownloadS3Object(bucketName, key string) (string, error) {
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", fmt.Errorf("failed to get object: %w", err)
	}
	defer obj.Body.Close()

	data, err := io.ReadAll(obj.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read object body: %w", err)
	}

	log.Printf("Downloaded object from S3: %s/%s", bucketName, key)
	return string(data), nil
}

func ListS3Keys(bucketName string) ([]string, error) {
	resp, err := s3Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list objects in bucket: %w", err)
	}

	keys := make([]string, 0, len(resp.Contents))
	for _, obj := range resp.Contents {
		keys = append(keys, *obj.Key)
	}

	log.Printf("Listed %d objects in bucket: %s", len(keys), bucketName)
	return keys, nil
}
func GetJobResultInMap(jobID string) (map[string]string, error) {
	data, err := DownloadS3Object("jobs", jobID)
	if err != nil {
		return nil, fmt.Errorf("failed to download job result: %w", err)
	}

	var result map[string]string
	err = json.Unmarshal([]byte(data), &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal job result: %w", err)
	}

	log.Printf("Retrieved job result for job ID: %s", jobID)
	return result, nil
}

func SaveJobRequestToS3(JobID string, job JobRequest) error {
	jsonBytes, err := json.MarshalIndent(job, "", "  ") // Indented for readability
	if err != nil {
		return fmt.Errorf("failed to marshal job to JSON: %w", err)
	}
	key := fmt.Sprintf("%s.json", job.JobID)
	_, err = s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String("jobs"),
		Key:         aws.String(key),
		Body:        bytes.NewReader(jsonBytes),
		ContentType: aws.String("application/json"),
	})
	if err != nil {
		return fmt.Errorf("failed to upload JSON to S3: %w", err)
	}

	log.Printf("Successfully uploaded job JSON to S3: %s/%s", "jobs", key)
	return nil
}
