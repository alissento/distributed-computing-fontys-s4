package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func getJobStatus(w http.ResponseWriter, r *http.Request) {
	fmt.Print("\033[H\033[2J") // Clear the console (optional in production)

	vars := mux.Vars(r)
	jobID, ok := vars["job_id"]
	if !ok {
		http.Error(w, "Missing job_id parameter", http.StatusBadRequest)
		return
	}

	// Download the job data from S3
	jobDataStr, err := DownloadStockDataFromS3(jobBucket, jobID)
	if err != nil {
		http.Error(w, "Failed to download job data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse the job data
	var jobStatus JobStatusResponse
	err = json.Unmarshal([]byte(jobDataStr), &jobStatus)
	if err != nil {
		http.Error(w, "Failed to parse job data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the job status as JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobStatus)
}
