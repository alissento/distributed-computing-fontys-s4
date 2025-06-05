package main

import (
	"encoding/json"
	"net/http"
)

func getAllJobs(w http.ResponseWriter, r *http.Request) {
	allJobsData, err := ListS3Keys("jobs") //Todo: hardcode bucket name
	if err != nil {
		http.Error(w, "Failed to fetch jobs: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(allJobsData)
}
