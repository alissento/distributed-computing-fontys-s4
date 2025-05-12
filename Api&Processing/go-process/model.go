// package main

// import (
// 	"fmt"
// 	"strconv"

// 	"github.com/sjwhitworth/golearn/base"
// 	"github.com/sjwhitworth/golearn/ensemble"
// )

// // TrainModel trains a Random Forest model on the provided features.
// func TrainModel(features []FeatureRow) (*ensemble.RandomForest, error) {
// 	// Create a new GoLearn dataset
// 	instances := base.NewDenseInstances()

// 	// Add attributes (features) to the dataset
// 	prevCloseAttr := base.NewFloatAttribute("PrevClose")
// 	ma5Attr := base.NewFloatAttribute("MA5")
// 	ma10Attr := base.NewFloatAttribute("MA10")
// 	volumeAttr := base.NewFloatAttribute("Volume")
// 	priceRangeAttr := base.NewFloatAttribute("PriceRange")
// 	nextCloseAttr := base.NewFloatAttribute("NextClose")

// 	instances.AddAttribute(prevCloseAttr)
// 	instances.AddAttribute(ma5Attr)
// 	instances.AddAttribute(ma10Attr)
// 	instances.AddAttribute(volumeAttr)
// 	instances.AddAttribute(priceRangeAttr)

// 	// The target attribute (what we want to predict)
// 	instances.AddClassAttribute(nextCloseAttr)

// 	// Fill the dataset with the feature rows
// 	for i, row := range features {
// 		// Create a new instance with the feature data and target (NextClose)
// 		newInstance := base.New(instances.AllAttributes())
// 		newInstance.Set(prevCloseAttr, row.PrevClose)
// 		newInstance.Set(ma5Attr, row.MA5)
// 		newInstance.Set(ma10Attr, row.MA10)
// 		newInstance.Set(volumeAttr, row.Volume)
// 		newInstance.Set(priceRangeAttr, row.PriceRange)
// 		newInstance.Set(nextCloseAttr, row.NextClose)

// 		// Add the instance to the dataset
// 		instances.SetRow(i, newInstance)
// 	}

// 	// Train a Random Forest model on the dataset
// 	rf := ensemble.NewRandomForest(10) // Reduced to 10 trees for example
// 	err := rf.Fit(instances)
// 	if err != nil {
// 		return nil, err
// 	}

// 	fmt.Println("Model trained successfully!")
// 	return rf, nil
// }

// // PredictFuture predicts the next closing price using the trained model and recent data.
// func PredictFuture(rf *ensemble.RandomForest, lastData StockData, dateList []time.Time) (float64, error) {
// 	// Get the most recent date
// 	mostRecentDate := dateList[len(dateList)-1]

// 	// Access the stock data for the most recent date
// 	currentDayData := lastData.TimeSeriesDaily[mostRecentDate.Format("2006-01-02")]

// 	// Parse the values from the current day's data
// 	prevClose, err := strconv.ParseFloat(currentDayData["4. close"], 64)
// 	if err != nil {
// 		return 0, fmt.Errorf("error parsing previous close: %w", err)
// 	}
// 	volume, err := strconv.ParseFloat(currentDayData["5. volume"], 64)
// 	if err != nil {
// 		return 0, fmt.Errorf("error parsing volume: %w", err)
// 	}
// 	high, err := strconv.ParseFloat(currentDayData["2. high"], 64)
// 	if err != nil {
// 		return 0, fmt.Errorf("error parsing high: %w", err)
// 	}
// 	low, err := strconv.ParseFloat(currentDayData["3. low"], 64)
// 	if err != nil {
// 		return 0, fmt.Errorf("error parsing low: %w", err)
// 	}

// 	priceRange := high - low

// 	// Calculate moving averages using helper function
// 	ma5 := calculateMA(lastData, dateList, len(dateList)-1, 5)
// 	ma10 := calculateMA(lastData, dateList, len(dateList)-1, 10)

// 	// Create a new GoLearn dataset for prediction (one instance)
// 	instances := base.NewDenseInstances()

// 	//Add attributes
// 	prevCloseAttr := base.NewFloatAttribute("PrevClose")
// 	ma5Attr := base.NewFloatAttribute("MA5")
// 	ma10Attr := base.NewFloatAttribute("MA10")
// 	volumeAttr := base.NewFloatAttribute("Volume")
// 	priceRangeAttr := base.NewFloatAttribute("PriceRange")

// 	instances.AddAttribute(prevCloseAttr)
// 	instances.AddAttribute(ma5Attr)
// 	instances.AddAttribute(ma10Attr)
// 	instances.AddAttribute(volumeAttr)
// 	instances.AddAttribute(priceRangeAttr)
// 	// Add an empty class attribute (we don't know the NextClose yet)
// 	instances.AddClassAttribute(base.NewFloatAttribute("NextClose"))

// 	// Create a FeatureRow for the last day's data (used for prediction)
// 	lastFeatureRow := FeatureRow{
// 		PrevClose:  prevClose,
// 		MA5:        ma5,
// 		MA10:       ma10,
// 		Volume:     volume,
// 		PriceRange: priceRange,
// 	}
// 	newInstance := base.New(instances.AllAttributes())

// 	newInstance.Set(prevCloseAttr, lastFeatureRow.PrevClose)
// 	newInstance.Set(ma5Attr, lastFeatureRow.MA5)
// 	newInstance.Set(ma10Attr, lastFeatureRow.MA10)
// 	newInstance.Set(volumeAttr, lastFeatureRow.Volume)
// 	newInstance.Set(priceRangeAttr, lastFeatureRow.PriceRange)
// 	newInstance.Set(instances.GetClassAttribute(), 0.0)

// 	instances.Add(newInstance)

// 	// Predict the 'NextClose' value
// 	predictions, err := rf.Predict(instances)
// 	if err != nil {
// 		return 0, fmt.Errorf("error during prediction: %w", err)
// 	}

// // Extract the predicted price
// predictedPrice := predictions.Get(0, 0) // Get the value from the first row and column
// return predictedPrice, nil
package main
