#!/bin/bash

set -e

NAMESPACE="url-shortener"

echo "=========================================="
echo "Stopping URL Shortener"
echo "=========================================="

kubectl scale deployment url-shortener \
    --replicas=0 \
    -n $NAMESPACE

kubectl scale deployment redis \
    --replicas=0 \
    -n $NAMESPACE

kubectl scale deployment postgres \
    --replicas=0 \
    -n $NAMESPACE

echo

sleep 5

kubectl get pods -n $NAMESPACE

echo
echo "=========================================="
echo "Everything has been scaled to zero."
echo "=========================================="