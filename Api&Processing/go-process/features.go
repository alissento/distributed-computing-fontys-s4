package main

import (
	"log"
	"sort"
	"strconv"
	"time"
)

func ExtractDates(data StockData) ([]time.Time, error) {
	var dateList []time.Time
	for dateStr := range data.TimeSeriesDaily {
		t, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			log.Println("Skipping invalid date:", dateStr)
			continue
		}
		dateList = append(dateList, t)
	}
	sort.Slice(dateList, func(i, j int) bool {
		return dateList[i].Before(dateList[j])
	})

	return dateList, nil
}

type FeatureRow struct {
	PrevClose  float64
	MA5        float64
	MA10       float64
	Volume     float64
	PriceRange float64
	NextClose  float64
}

func ExtractFeatures(data StockData, dateList []time.Time) ([]FeatureRow, error) {
	var featureRows []FeatureRow

	for i := 10; i < len(dateList)-1; i++ {
		currentDate := dateList[i]
		prevDate := dateList[i-1]
		nextDate := dateList[i+1]

		currentDayData := data.TimeSeriesDaily[currentDate.Format("2006-01-02")]
		prevDayData := data.TimeSeriesDaily[prevDate.Format("2006-01-02")]
		nextDayData := data.TimeSeriesDaily[nextDate.Format("2006-01-02")]

		prevClose, _ := strconv.ParseFloat(prevDayData["4. close"], 64)
		volume, _ := strconv.ParseFloat(currentDayData["5. volume"], 64)
		high, _ := strconv.ParseFloat(currentDayData["2. high"], 64)
		low, _ := strconv.ParseFloat(currentDayData["3. low"], 64)
		nextClose, _ := strconv.ParseFloat(nextDayData["4. close"], 64)

		ma5 := calculateMA(data, dateList, i, 5)
		ma10 := calculateMA(data, dateList, i, 10)

		priceRange := high - low

		featureRows = append(featureRows, FeatureRow{
			PrevClose:  prevClose,
			MA5:        ma5,
			MA10:       ma10,
			Volume:     volume,
			PriceRange: priceRange,
			NextClose:  nextClose,
		})
	}

	return featureRows, nil
}

func calculateMA(data StockData, dateList []time.Time, index, period int) float64 {
	sum := 0.0
	count := 0

	for i := index - period; i < index; i++ {
		dateStr := dateList[i].Format("2006-01-02")
		dayData := data.TimeSeriesDaily[dateStr]
		close, _ := strconv.ParseFloat(dayData["4. close"], 64)
		sum += close
		count++
	}

	if count == 0 {
		return 0
	}

	return sum / float64(count)
}
