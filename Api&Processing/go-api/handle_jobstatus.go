package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func getJobStatus(w http.ResponseWriter, r *http.Request) {
	jobID, err := getURLParam(r, "job_id")
	if err != nil {
		log.Println("Failed to get job ID from URL:", err)
		http.Error(w, "Failed to download job data: ", http.StatusBadRequest)
		return
	}

	jobDataStr, err := DownloadS3Object(jobBucket, jobID+".json")
	if err != nil {
		log.Println("Failed to download job data from S3:", err)
		http.Error(w, "Failed to download job data: ", http.StatusInternalServerError)
		return
	}

	var jobStatus JobStatusResponse
	err = json.Unmarshal([]byte(jobDataStr), &jobStatus)
	if err != nil {
		log.Println("Failed to parse job data:", err)
		http.Error(w, "Failed to parse job data: ", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobStatus)
}
