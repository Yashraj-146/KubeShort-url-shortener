#!/bin/bash

set -e

NAMESPACE="url-shortener"

echo "=========================================="
echo "Starting URL Shortener"
echo "=========================================="

echo
echo "Scaling PostgreSQL..."
kubectl scale deployment postgres \
    --replicas=1 \
    -n $NAMESPACE

echo
echo "Scaling Redis..."
kubectl scale deployment redis \
    --replicas=1 \
    -n $NAMESPACE

echo
echo "Scaling Application..."
kubectl scale deployment url-shortener \
    --replicas=2 \
    -n $NAMESPACE

echo
echo "Waiting for deployments..."

kubectl rollout status deployment/postgres \
    -n $NAMESPACE

kubectl rollout status deployment/redis \
    -n $NAMESPACE

kubectl rollout status deployment/url-shortener \
    -n $NAMESPACE

echo
echo "Pods"

kubectl get pods -n $NAMESPACE

echo
echo "Services"

kubectl get svc -n $NAMESPACE

echo
echo "=========================================="
echo "Application started."
echo
echo "Run:"
echo
echo "kubectl port-forward service/url-shortener 3000:3000 -n url-shortener"
echo
echo "=========================================="