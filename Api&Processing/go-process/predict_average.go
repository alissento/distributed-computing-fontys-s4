package main

import (
	"fmt"

	"log"
	"math/rand"

	"strconv"
	"time"
)

func LinearRegressionPredict(historicalData []float64, futureDates []string) map[string]map[string]string {

	n := float64(len(historicalData))
	if n == 0 {
		log.Println("No historical data for regression.")
		return nil
	}

	var sumX, sumY, sumXY, sumX2 float64
	for i := 0; i < len(historicalData); i++ {
		x := float64(i + 1)
		y := historicalData[i]
		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	m := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	b := (sumY - m*sumX) / n

	predictedData := make(map[string]map[string]string)
	for i, date := range futureDates {
		predictedClose := m*float64(i+len(historicalData)) + b
		open := predictedClose * (1 + (rand.Float64()/50 - 0.01))
		high := predictedClose * (1 + (rand.Float64()/50 + 0.01))
		low := predictedClose * (1 - (rand.Float64()/50 + 0.01))
		volume := rand.Intn(1000000) + 500000

		predictedData[date] = map[string]string{
			"1. open":   fmt.Sprintf("%.4f", open),
			"2. high":   fmt.Sprintf("%.4f", high),
			"3. low":    fmt.Sprintf("%.4f", low),
			"4. close":  fmt.Sprintf("%.4f", predictedClose),
			"5. volume": fmt.Sprintf("%d", volume),
		}
	}

	return predictedData
}

func PredictAverage(stockData StockData, job JobRequest) (map[string]map[string]string, error) {

	startDate, err := time.Parse("2006-01-02", job.StartDate) //TODO maak een functie
	if err != nil {
		log.Println("Invalid start date:", err)
		return nil, err
	}

	endDate, err := time.Parse("2006-01-02", job.EndDate)
	if err != nil {
		log.Println("Invalid end date:", err)
		return nil, err
	}

	var historicalClosePrices []float64
	for dateStr, dayData := range stockData.TimeSeriesDaily {
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil || date.After(endDate) || date.Before(startDate) {
			continue
		}

		closeStr := dayData["4. close"]
		closeVal, err := strconv.ParseFloat(closeStr, 64)
		if err != nil {
			continue
		}

		historicalClosePrices = append(historicalClosePrices, closeVal)
	}

	// Generate the list of future dates based on JumpDays
	var futureDates []string
	currentDate := startDate
	for currentDate.Before(endDate) {
		futureDates = append(futureDates, currentDate.Format("2006-01-02"))
		currentDate = currentDate.AddDate(0, 0, job.JumpDays)
	}

	// Predict future stock prices
	predictedData := LinearRegressionPredict(historicalClosePrices, futureDates)

	// Return the predicted stock data in the required format
	return predictedData, nil
}
