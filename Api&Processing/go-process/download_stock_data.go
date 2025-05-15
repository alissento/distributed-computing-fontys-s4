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
	// Debug log delete later aub(TODO)
	log.Printf("Looking for file: %s in bucket: %s", s3Key, StockDataBucketName)

	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{ // Get the object from S3
		Bucket: &StockDataBucketName, // Specify the bucket name
		Key:    aws.String(s3Key),    // Specify the key (file name) of the object to retrieve
	})
	if err != nil {
		// Log the error if we fail to get the object
		return "", fmt.Errorf("failed to get object from S3: %w", err)
	}
	defer obj.Body.Close()

	// FILE SIZE DEBUG LOG (TODO) delete LATER
	log.Printf("Successfully retrieved object from S3, size: %d bytes", obj.ContentLength)

	// Read the content of the object
	body, err := io.ReadAll(obj.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read object body: %w", err)
	}

	// Return the content as a string
	return string(body), nil
}
