package main

import (
	"context"
	"io"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// process the job met operation
func processJob(key string) {
	log.Println("Processing job for key:", key)
	obj, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &bucketName,
		Key:    aws.String(key),
	})
	log.Println("Object:", obj) // check hoe het hier aankomt! (ToDo)

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
