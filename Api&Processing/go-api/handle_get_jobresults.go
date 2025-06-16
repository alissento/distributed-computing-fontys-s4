package main

import (
	"fmt"
	"net/http"
)

var predictions map[string]map[string]string

func getJobResult(w http.ResponseWriter, r *http.Request) {
	jobID, err := getURLParam(r, "job_id")
	if err != nil {
		http.Error(w, "Failed to get job ID: "+err.Error(), http.StatusBadRequest)
		return
	}
	jobDataStr, err := DownloadS3Object(predictionBucket, "results/"+jobID+".json")
	if err != nil {
		http.Error(w, "Failed to download job data: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, string(jobDataStr))

}
