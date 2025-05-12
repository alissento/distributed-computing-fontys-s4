package main

import (
	"fmt"
	"log"
	"sort"
	"strconv"
)

// Get dates sorted from oldest to newest
func getSortedDates(data map[string]map[string]string) []string {
	var dates []string
	for dateStr := range data {
		dates = append(dates, dateStr)
	}
	sort.Strings(dates)
	return dates
}

// Extract closing prices in sorted order
func getClosingPrices(data map[string]map[string]string, sortedDates []string) []float64 {
	var prices []float64
	for _, date := range sortedDates {
		dayData := data[date]
		closeStr := dayData["4. close"]
		closeVal, err := strconv.ParseFloat(closeStr, 64)
		if err != nil {
			log.Printf("invalid close price on %s: %v\n", date, err)
			continue
		}
		prices = append(prices, closeVal)
	}
	return prices
}

// Compute EMA
func calculateEMA(prices []float64, period int) []float64 {
	ema := make([]float64, len(prices))
	alpha := 2.0 / float64(period+1)

	// Seed first EMA with simple average
	var sum float64
	for i := 0; i < period && i < len(prices); i++ {
		sum += prices[i]
	}
	ema[period-1] = sum / float64(period)

	// Compute rest of EMA
	for i := period; i < len(prices); i++ {
		ema[i] = (prices[i] * alpha) + (ema[i-1] * (1 - alpha))
	}
	return ema
}

// Detect crossovers and return buy/sell signal dates
func PredictWithEMACrossover(data StockData, shortPeriod, longPeriod int) []string {
	sortedDates := getSortedDates(data.TimeSeriesDaily)
	prices := getClosingPrices(data.TimeSeriesDaily, sortedDates)

	if len(prices) < longPeriod {
		log.Println("Not enough data for EMA calculation")
		return nil
	}

	shortEMA := calculateEMA(prices, shortPeriod)
	longEMA := calculateEMA(prices, longPeriod)

	var signals []string
	for i := longPeriod; i < len(prices); i++ {
		prevShort := shortEMA[i-1]
		prevLong := longEMA[i-1]
		currShort := shortEMA[i]
		currLong := longEMA[i]

		date := sortedDates[i]

		if prevShort < prevLong && currShort > currLong {
			signals = append(signals, fmt.Sprintf("%s: BUY", date))
		} else if prevShort > prevLong && currShort < currLong {
			signals = append(signals, fmt.Sprintf("%s: SELL", date))
		}
	}

	return signals
}
