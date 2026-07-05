#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage:"
  echo "./benchmarks/benchmark.sh <SHORT_CODE>"
  exit 1
fi

URL="http://localhost:3000/$1"

echo "=========================================="
echo "URL Shortener Benchmark"
echo "=========================================="
echo ""
echo "Target:"
echo "$URL"
echo ""

autocannon \
  --connections 100 \
  --duration 30 \
  --pipelining 10 \
  "$URL"