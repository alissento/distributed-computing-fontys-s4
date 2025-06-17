package main

import (
	"encoding/json"

	"log"
)

func processJob(key string) {

	var job JobRequest
	err := json.Unmarshal([]byte(key), &job)
	if err != nil {
		log.Println("Error undoing json job request:", err)
		return
	}

	data, err := downloadStockData(job.S3Key)
	if err != nil {
		log.Println("Error downloading stock data:", err)
		return
	}
	var stockData StockData
	err = json.Unmarshal([]byte(data), &stockData)
	if err != nil {
		log.Println("Failed to unmarshal stock data:", err)
		return
	}

	switch job.ProcessingType {
	case "Predict_Regression":
		predictions := QuadraticRegressionPredict(stockData, job)
		handlePredictionResult(job, predictions, nil)

	case "Predict_Average":
		predictions, err := PredictAverage(stockData, job)
		handlePredictionResult(job, predictions, err)

	default:
		log.Println("Unknown processing type:", job.ProcessingType)
		return
	}

}
func handlePredictionResult[T map[string]map[string]string](job JobRequest, predictions T, err error) {
	if err != nil {
		log.Println("Error during prediction:", err)
		return
	}
	err = savePredictionsToS3(job.JobID, predictions, "results/")
	if err != nil {
		log.Println("Error saving predictions:", err)
		return
	}

	updateJobStatusToCompleted(s3Client, "jobs", job.JobID)
}

// func makePredictionSeries(start time.Time, value float64, jumpDays, count int) map[string]map[string]string {
// 	predictions := make(map[string]map[string]string)

// 	valStr := fmt.Sprintf("%.2f", value)

// 	for i := 1; i <= count; i++ {

// 		date := start.AddDate(0, 0, i*jumpDays).Format("2006-01-02")

// 		predictions[date] = map[string]string{
// 			"1. open":   valStr,
// 			"2. high":   valStr,
// 			"3. low":    valStr,
// 			"4. close":  valStr,
// 			"5. volume": "0",
// 		}
// 	}

// 	return predictions
// }
