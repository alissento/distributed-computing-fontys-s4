package main

import (
	"fmt"
	"net/http"
	// "encoding/json"
	// "strings"
)

func getJobPdf(w http.ResponseWriter, r *http.Request) {
	jobID, err := getURLParam(r, "job_id")
	if err != nil {
		http.Error(w, "Failed to get job ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	pdfData, err := DownloadS3Pdf(predictionBucket, jobID+".pdf")
	if err != nil {
		http.Error(w, "Failed to download job data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Set content type to PDF
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s.pdf\"", jobID))
	w.WriteHeader(http.StatusOK)

	// Write binary data directly
	w.Write(pdfData)
}
