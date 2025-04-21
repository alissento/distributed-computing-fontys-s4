package main

import (
	"encoding/json"

	// "fmt"
	"log"
)

// process the job met operation
func processJob(key string) {

	var job JobRequest
	err := json.Unmarshal([]byte(key), &job)
	if err != nil {
		log.Println("Error undoing json job request:", err)
		return
	}

	// Download the stock data
	data, err := downloadStockData(job.S3Key)
	if err != nil {
		log.Println("Error downloading stock data:", err)
		return
	}
	// Add to stockdata struct
	var stockData StockData
	err = json.Unmarshal([]byte(data), &stockData)
	if err != nil {
		log.Println("Failed to unmarshal stock data:", err)
		return
	}
	// Process the stock data based on the processing type ADD MORE HERE IF U WANT
	switch job.ProcessingType {
	case "moving_average":
		predictions := movingAverage(stockData, job.JumpDays)

		err := savePredictionsToS3(job.JobID, predictions, "results/")
		if err != nil {
			log.Println("Error saving predictions:", err)
			return
		}
		// send result to SQS (move to seperate file later geen tijd)
		// result := JobResult{
		// 	JobID:       job.JobID,
		// 	Status:      "completed",
		// 	ResultS3Key: fmt.Sprintf("results/%s.json", job.JobID),
		// }
		// if err := sendResultToSQS(result); err != nil {
		// 	log.Println("Error sending result to SQS:", err)
		// }

	default:
		log.Println("Unknown processing type:", job.ProcessingType)
		return

	}

}
