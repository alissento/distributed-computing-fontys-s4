package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// SaveToS3 uploads the stock data to an S3 bucket
func SaveToS3(bucketName, key, data string) error {
	// Upload data to S3
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

func DownloadStockDataFromS3(bucketName, key string) (string, error) {
	// Download data from S3
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", fmt.Errorf("failed to download data from S3: %w", err)
	}
	defer obj.Body.Close()

	body, err := io.ReadAll(obj.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read object body: %w", err)
	}

	log.Printf("Successfully downloaded data from S3: %s/%s", bucketName, key)
	return string(body), nil
}

func GetAllStocksInBucket(bucketName string) ([]string, error) { //TODO kijk even of dit geabused kan worden door een andere bucketname te injecten !! anders hardcode the bucketname
	// List all objects in the bucket
	resp, err := s3Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list objects in bucket: %w", err)
	}

	var keys []string
	for _, obj := range resp.Contents {
		keys = append(keys, *obj.Key)
	}

	log.Printf("Successfully listed objects in bucket: %s", bucketName)
	return keys, nil
}
