package main

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"strconv"
	"time"
)

func QuadraticRegressionPredict(stockData StockData, job JobRequest) map[string]map[string]string {
	// Parse start and end dates as before (validate them)
	startDate, err := time.Parse("2006-01-02", job.StartDate)
	if err != nil {
		log.Println("Invalid start date:", err)
		return nil
	}

	endDate, err := time.Parse("2006-01-02", job.EndDate)
	if err != nil {
		log.Println("Invalid end date:", err)
		return nil
	}

	// Collect all historical close prices (ignore startDate and endDate here)
	var historicalClosePrices []float64
	for _, dayData := range stockData.TimeSeriesDaily {
		closeStr := dayData["4. close"]
		closeVal, err := strconv.ParseFloat(closeStr, 64)
		if err != nil {
			continue
		}
		historicalClosePrices = append(historicalClosePrices, closeVal)
	}

	if len(historicalClosePrices) < 3 {
		log.Println("Not enough data for quadratic regression.")
		return nil
	}

	// Build future dates including endDate (use !currentDate.After(endDate))
	var futureDates []string
	currentDate := startDate
	for !currentDate.After(endDate) {
		futureDates = append(futureDates, currentDate.Format("2006-01-02"))
		currentDate = currentDate.AddDate(0, 0, job.JumpDays)
	}

	// Regression logic unchanged ...
	n := len(historicalClosePrices)
	var sumX, sumY, sumX2, sumX3, sumX4, sumXY, sumX2Y float64
	for i := 0; i < n; i++ {
		x := float64(i)
		y := historicalClosePrices[i]
		sumX += x
		sumY += y
		sumX2 += x * x
		sumX3 += x * x * x
		sumX4 += x * x * x * x
		sumXY += x * y
		sumX2Y += x * x * y
	}

	A := [][]float64{
		{float64(n), sumX, sumX2},
		{sumX, sumX2, sumX3},
		{sumX2, sumX3, sumX4},
	}
	B := []float64{sumY, sumXY, sumX2Y}

	a, b, c := solve3x3(A, B)

	predictedData := make(map[string]map[string]string)
	for i, date := range futureDates {
		x := float64(i + n)
		predictedClose := a + b*x + c*x*x

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

func solve3x3(A [][]float64, B []float64) (float64, float64, float64) {

	for i := 0; i < 3; i++ {

		maxRow := i
		for k := i + 1; k < 3; k++ {
			if math.Abs(A[k][i]) > math.Abs(A[maxRow][i]) {
				maxRow = k
			}
		}
		A[i], A[maxRow] = A[maxRow], A[i]
		B[i], B[maxRow] = B[maxRow], B[i]

		// Eliminate
		for k := i + 1; k < 3; k++ {
			f := A[k][i] / A[i][i]
			for j := i; j < 3; j++ {
				A[k][j] -= f * A[i][j]
			}
			B[k] -= f * B[i]
		}
	}

	// Back-substitution
	x := make([]float64, 3)
	for i := 2; i >= 0; i-- {
		x[i] = B[i]
		for j := i + 1; j < 3; j++ {
			x[i] -= A[i][j] * x[j]
		}
		x[i] /= A[i][i]
	}
	return x[0], x[1], x[2]
}
