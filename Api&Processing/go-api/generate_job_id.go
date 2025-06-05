package main

import (
	"github.com/google/uuid"
)

func GenerateJobID() string {
	jobID := uuid.New().String()
	return jobID
}
