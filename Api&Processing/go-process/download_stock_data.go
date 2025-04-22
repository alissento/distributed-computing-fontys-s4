package main

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func downloadStockData(s3Key string) (string, error) {
	// Debug log to see the file and bucket name you're looking for
	log.Printf("Looking for file: %s in bucket: %s", s3Key, StockDataBucketName)

	// ing the s3Client configured with LocalStack
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &StockDataBucketName,
		Key:    aws.String(s3Key),
	})
	if err != nil {
		// Log the error if we fail to get the object
		return "", fmt.Errorf("failed to get object from S3: %w", err)
	}
	defer obj.Body.Close()

	// Log the size of the file retrieved
	log.Printf("Successfully retrieved object from S3, size: %d bytes", obj.ContentLength)

	// Read the content of the object
	body, err := io.ReadAll(obj.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read object body: %w", err)
	}

	// Return the content as a string
	return string(body), nil
}
