package main

import (
	"encoding/json"

	"net/http"

	"github.com/gorilla/mux"
)

func getJobStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID, ok := vars["job_id"]
	if !ok {
		http.Error(w, "Missing job_id parameter", http.StatusBadRequest)
		return
	}

	jobDataStr, err := DownloadStockDataFromS3("jobs", jobID)
	if err != nil {
		http.Error(w, "Failed to download job data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var jobStatus JobStatusResponse
	err = json.Unmarshal([]byte(jobDataStr), &jobStatus)
	if err != nil {
		http.Error(w, "Failed to parse job data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobStatus)
}
