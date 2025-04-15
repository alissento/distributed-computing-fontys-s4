package main

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const region = "us-east-1" // Replace

// GetFromS3 fetches data from S3
func GetFromS3(bucketName, key string) (string, error) {
	// Load AWS SDK configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region)) //(TODO: check if this logic can be used for injection!)
	if err != nil {
		return "", fmt.Errorf("unable to load SDK config, %v", err)
	}

	// Initialize S3
	s3Client := s3.NewFromConfig(cfg)

	// Fetch the object from S3
	resp, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &bucketName,
		Key:    &key,
	})
	if err != nil {
		return "", fmt.Errorf("failed to fetch data from S3: %w", err)
	}
	defer resp.Body.Close()

	// Read the data from the S3 object
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read S3 object body: %w", err)
	}

	return string(data), nil
}

// SaveToS3 uploads the stock data to an S3 bucket
func SaveToS3(bucketName, key, data string) error {
	// Load AWS SDK configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		return fmt.Errorf("unable to load SDK config, %v", err)
	}

	// Initialize S3 client
	s3Client := s3.NewFromConfig(cfg)

	// Upload data to S3
	_, err = s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
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
