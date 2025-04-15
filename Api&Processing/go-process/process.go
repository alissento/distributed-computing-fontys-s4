package main

import (
	"context"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func processJob(key string) {
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &bucketName,
		Key:    aws.String(key),
	})
	if err != nil {
		log.Println("Failed to download from S3:", err)
		return
	}
	defer obj.Body.Close()

	body, _ := io.ReadAll(obj.Body)
	log.Println("Downloaded Data:", string(body))

	// Fake prediction logic
	log.Println("Predicted: BUY")
}
