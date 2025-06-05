package main

import (
	"encoding/json"
	"net/http"
)

func getJobStatus(w http.ResponseWriter, r *http.Request) {
	jobID, err := getURLParam(r, "job_id")
	if err != nil {
		http.Error(w, "Failed to download job data: "+err.Error(), http.StatusBadRequest)
		return
	}

	jobDataStr, err := DownloadS3Object("jobs", jobID+".json")
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
