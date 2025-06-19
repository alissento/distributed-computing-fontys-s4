package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/go-pdf/fpdf"
	"github.com/wcharczuk/go-chart/v2"
)

type JobMeta struct {
	S3Key          string `json:"s3_key"`
	ProcessingType string `json:"processing_type"`
	JumpDays       int    `json:"jump_days"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
	JobID          string `json:"job_id"`
}

func GenerateJobPdf(result map[string]map[string]string, jobId string) error {

	jsonJobMetaData, err := DownloadS3ObjectAsJSON(jobBucket, jobId+".json")
	if err != nil {
		return fmt.Errorf("job metadata was not loaded: %w", err)
	}
	jsonBytes, err := json.Marshal(jsonJobMetaData)
	if err != nil {
		return fmt.Errorf("failed to marshal job metadata: %w", err)
	}
	var jobMeta JobMeta
	if err := json.Unmarshal(jsonBytes, &jobMeta); err != nil {
		return fmt.Errorf("failed to unmarshal into JobMeta: %w", err)
	}

	var dates []time.Time
	for dateStr := range result {
		t, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return fmt.Errorf("invalid date format in result: %w", err)
		}
		dates = append(dates, t)
	}
	sort.Slice(dates, func(i, j int) bool {
		return dates[i].Before(dates[j])
	})

	var xValues []time.Time
	var yValues []float64
	for _, date := range dates {
		dateStr := date.Format("2006-01-02")
		y, err := strconv.ParseFloat(result[dateStr]["4. close"], 64)
		if err != nil {
			return fmt.Errorf("invalid float value for date %s: %w", dateStr, err)
		}
		xValues = append(xValues, date)
		yValues = append(yValues, y)
	}
	const maxDataPoints = 5000
	if len(xValues) > maxDataPoints {
		return fmt.Errorf("chart data exceeds %d data points", maxDataPoints)
	}
	var imgBuf bytes.Buffer
	graph := chart.Chart{
		Title: "Stock Prediction (Close Price)",
		XAxis: chart.XAxis{
			Name:           "Date",
			ValueFormatter: chart.TimeDateValueFormatter,
		},
		YAxis: chart.YAxis{Name: "Price"},
		Series: []chart.Series{
			chart.TimeSeries{
				XValues: xValues,
				YValues: yValues,
			},
		},
	}
	if err := graph.Render(chart.PNG, &imgBuf); err != nil {
		return fmt.Errorf("failed to render chart to buffer: %w", err)
	}
	if imgBuf.Len() > 25*1024*1024 {
		return fmt.Errorf("chart image exceeds 25 MB size limit")
	}

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "", 12)

	pdf.Cell(0, 10, fmt.Sprintf("Job ID: %s", jobMeta.JobID))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("S3 Key: %s", jobMeta.S3Key))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("Processing Type: %s", jobMeta.ProcessingType))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("Jump Days: %d", jobMeta.JumpDays))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("Date Range: %s → %s", jobMeta.StartDate, jobMeta.EndDate))
	pdf.Ln(10)

	imageOptions := fpdf.ImageOptions{
		ImageType: "PNG",
		ReadDpi:   true,
	}
	imgName := "chart.png"
	pdf.RegisterImageOptionsReader(imgName, imageOptions, &imgBuf)
	pdf.ImageOptions(imgName, 15, pdf.GetY(), 180, 0, false, imageOptions, 0, "")

	var pdfBuf bytes.Buffer
	if err := pdf.Output(&pdfBuf); err != nil {
		return fmt.Errorf("failed to generate PDF: %w", err)
	}
	if pdfBuf.Len() > 25*1024*1024 {
		return fmt.Errorf("generated PDF exceeds size limit")
	}
	err = savePDFToS3(s3Client, predictionBucket, jobId+".pdf", bytes.NewReader(pdfBuf.Bytes()))
	if err != nil {
		return fmt.Errorf("failed to upload PDF to S3: %w", err)
	}
	return nil
}
