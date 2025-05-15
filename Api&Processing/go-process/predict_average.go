package main

import (
	"fmt"

	"log"
	"math/rand"

	"strconv"
	"time"
)

// LinearRegressionPredict predicts future stock closing prices based on historical data
func LinearRegressionPredict(historicalData []float64, futureDates []string) map[string]map[string]string {
	// Calculate the linear regression slope (m) and intercept (b)
	n := float64(len(historicalData))
	if n == 0 {
		log.Println("No historical data for regression.")
		return nil
	}

	// Calculate mean of x and y
	var sumX, sumY, sumXY, sumX2 float64
	for i := 0; i < len(historicalData); i++ {
		x := float64(i + 1) // x is just an index from 1 to n
		y := historicalData[i]
		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	// Calculate slope (m) and intercept (b)
	m := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	b := (sumY - m*sumX) / n

	// Use the regression formula y = mx + b to predict future prices
	predictedData := make(map[string]map[string]string)
	for i, date := range futureDates {
		// Using regression formula: y = mx + b
		predictedClose := m*float64(i+len(historicalData)) + b
		open := predictedClose * (1 + (rand.Float64()/50 - 0.01)) // Open price, +/- 1%
		high := predictedClose * (1 + (rand.Float64()/50 + 0.01)) // High price, 1-2% higher
		low := predictedClose * (1 - (rand.Float64()/50 + 0.01))  // Low price, 1-2% lower
		volume := rand.Intn(1000000) + 500000                     // Random volume between 500k and 1.5M

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

// PredictAverage generates the predicted stock data based on job request and historical data
func PredictAverage(stockData StockData, job JobRequest) (map[string]map[string]string, error) {
	// Convert start and end dates
	startDate, err := time.Parse("2006-01-02", job.StartDate)
	if err != nil {
		log.Println("Invalid start date:", err)
		return nil, err
	}

	endDate, err := time.Parse("2006-01-02", job.EndDate)
	if err != nil {
		log.Println("Invalid end date:", err)
		return nil, err
	}

	// Get historical close prices
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
