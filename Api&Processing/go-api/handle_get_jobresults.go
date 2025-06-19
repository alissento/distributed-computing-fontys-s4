package main

import (
	"fmt"
	"log"
	"net/http"
)

var predictions map[string]map[string]string

func getJobResult(w http.ResponseWriter, r *http.Request) {
	jobID, err := getURLParam(r, "job_id")
	if err != nil {
		log.Println("Failed to get job ID from URL:", err)
		http.Error(w, "Failed to get job ID: ", http.StatusBadRequest)
		return
	}
	jobDataStr, err := DownloadS3Object(predictionBucket, "results/"+jobID+".json")
	if err != nil {
		log.Println("Failed to download job data from S3:", err)
		http.Error(w, "Failed to download job data: ", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, string(jobDataStr))

}
