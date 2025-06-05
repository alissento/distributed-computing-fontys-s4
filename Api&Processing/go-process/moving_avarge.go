package main

import (
	"fmt"
	"sort"
	"strconv"
	"time"
)

var sum float64
var average float64
var jumpDays int

func movingAverage(stockData StockData, jumpDays int) map[string]map[string]string {

	dates := make([]string, 0, len(stockData.TimeSeriesDaily))
	for date := range stockData.TimeSeriesDaily {
		dates = append(dates, date)
	}

	sort.Sort(sort.Reverse(sort.StringSlice(dates)))
	numDays := 5

	for i := 0; i < numDays && i < len(dates); i++ {
		dayData := stockData.TimeSeriesDaily[dates[i]]
		closeStr := dayData["4. close"]
		closeVal, _ := strconv.ParseFloat(closeStr, 64)
		sum += closeVal
	}

	average := sum / float64(numDays)
	lastDate := dates[0]
	t, _ := time.Parse("2006-01-02", lastDate)

	predictions := make(map[string]map[string]string)

	for i := 1; i <= 5; i++ {
		predictedDate := t.AddDate(0, 0, i*jumpDays).Format("2006-01-02")
		value := fmt.Sprintf("%.2f", average)

		predictions[predictedDate] = map[string]string{
			"1. open":   value,
			"2. high":   value,
			"3. low":    value,
			"4. close":  value,
			"5. volume": "0",
		}
	}
	return predictions

}
