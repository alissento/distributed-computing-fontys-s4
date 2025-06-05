package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func getURLParam(r *http.Request, key string) (string, error) {
	vars := mux.Vars(r)
	value, ok := vars[key]
	if !ok {
		return "", fmt.Errorf("missing URL parameter: %s", key)
	}
	return value, nil
}
func getQueryParam(r *http.Request, key string) (string, error) {
	value := r.URL.Query().Get(key)
	if value == "" {
		return "", fmt.Errorf("missing query parameter: %s", key)
	}
	return value, nil
}
