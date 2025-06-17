package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func downloadStockData(s3Key string) (string, error) {
	log.Printf("Downloading stock data from S3 with key: %s", s3Key)
	log.Printf("Using bucket name: %s", StockDataBucketName)
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &StockDataBucketName,
		Key:    aws.String(s3Key),
	})
	if err != nil {
		return "", fmt.Errorf("failed to get object from S3: %w", err)
	}
	defer obj.Body.Close()

	body, err := io.ReadAll(obj.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read object body: %w", err)
	}
	//Log the size of the downloaded data
	log.Printf("Downloaded %d bytes from S3", len(body))
	return string(body), nil
}
func DownloadS3ObjectAsJSON(bucketName, key string) (map[string]interface{}, error) {
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get object: %w", err)
	}
	defer obj.Body.Close()

	data, err := io.ReadAll(obj.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read object body: %w", err)
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}

	return jsonData, nil
}
