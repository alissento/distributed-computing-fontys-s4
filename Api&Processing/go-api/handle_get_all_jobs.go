package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func getAllJobs(w http.ResponseWriter, r *http.Request) {
	log.Println("This is the jobBucket:", jobBucket)
	allJobsData, err := ListS3Keys(jobBucket)
	if err != nil {
		http.Error(w, "Failed to fetch jobs: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	// Remove ".json" suffix from each filename
	for i, key := range allJobsData {
		allJobsData[i] = strings.TrimSuffix(key, ".json")
	}

	json.NewEncoder(w).Encode(allJobsData)
}
