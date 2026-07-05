#!/bin/bash

set -e

echo "Rebuilding Docker image..."

docker compose build

echo
echo "Restarting deployment..."

kubectl rollout restart deployment/url-shortener \
-n url-shortener

kubectl rollout status deployment/url-shortener \
-n url-shortener

echo
echo "Deployment updated successfully."