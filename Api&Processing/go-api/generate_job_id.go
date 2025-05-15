package main

import (
	"github.com/google/uuid"
)

// GenerateJobID generates a unique job ID using UUID
func GenerateJobID() string {
	// Generate a new UUID
	jobID := uuid.New().String()
	return jobID
}
