#!/bin/bash

AWS_ACCOUNT_ID="657026912035"
REGION="eu-west-1"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
ECR_PASSWORD=$(aws ecr get-login-password --region "${REGION}")

echo "Deleting existing secrets of ECR registry..."
kubectl delete secret ecr-registry-secret -n webapp
kubectl delete secret ecr-registry-secret -n process-stack 

echo "Creating ECR registry secret for webapp namespace..."
kubectl create secret docker-registry ecr-registry-secret -n webapp \
--docker-server="${ECR_REGISTRY}" \
--docker-username=AWS \
--docker-password="${ECR_PASSWORD}" \
--docker-email=no-reply@example.com

echo "Creating ECR registry secret for process-stack namespace..."
kubectl create secret docker-registry ecr-registry-secret -n process-stack \
--docker-server="${ECR_REGISTRY}" \
--docker-username=AWS \
--docker-password="${ECR_PASSWORD}" \
--docker-email=no-reply@example.com

echo "Creating other secrets..."
kubectl create secret generic jwt-secret -n webapp \
--from-literal=JWT_SECRET=1P3BtzxdaWrueOgdLcXIJLUUhP6RA3BlPF128PYrZzF2JBQ2pzB2WWMuGQc0BSg6

kubectl create secret generic db-secret -n webapp \
--from-literal=DB_HOST=main-rds-instance.cmanmhnqgtfn.eu-west-1.rds.amazonaws.com \
--from-literal=DB_PORT=5432 \
--from-literal=DB_NAME=postgresdb \
--from-literal=DB_USER=db_admin \
--from-literal=DB_PASSWORD=password

kubectl create secret generic go-api-secret -n webapp \
--from-literal=GO_API_TOKEN=75984379543790a

kubectl create secret generic alphavantage-secret -n process-stack \
--from-literal=ALPHAVANTAGE_KEY=HKAJUSEOTSJ2ID11

kubectl create secret generic grafana-secret -n monitoring  \
--from-literal=ADMIN_PASSWORD=devDEV123$