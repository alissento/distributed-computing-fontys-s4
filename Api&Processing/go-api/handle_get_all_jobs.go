// filepath: c:\Users\ownvn\Documents\GitRepos\GroupProject CS4\distributed-computing-fontys-s4\Api&Processing\go-api\handle_get_all_jobs.go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func getAllJobs(w http.ResponseWriter, r *http.Request) {
	// Clear the console (optional in production)
	fmt.Print("\033[H\033[2J")

	// Fetch all job data from S3
	allJobsData, err := ListAllJobsFromS3("jobs")
	if err != nil {
		http.Error(w, "Failed to fetch jobs: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse the job data

	json.NewEncoder(w).Encode(allJobsData)
}
