package main

var predictions map[string]map[string]string

// func Handle_Get_JobResults(w http.ResponseWriter, r *http.Request){
// 	jobID, err := get(r, "job_id")
// 	if err != nil {
// 		http.Error(w, "Failed to get job ID: "+err.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	predictions, err = G(jobID)
// 	if err != nil {
// 		http.Error(w, "Failed to get predictions: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	responseData, err := json.Marshal(predictions)
// 	if err != nil {
// 		http.Error(w, "Failed to marshal predictions: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)
// 	fmt.Fprint(w, string(responseData))

// }
