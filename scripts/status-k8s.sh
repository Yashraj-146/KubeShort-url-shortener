#!/bin/bash

NAMESPACE="url-shortener"

echo
echo "========== Namespace =========="
kubectl get ns $NAMESPACE

echo
echo "========== Deployments =========="
kubectl get deployments -n $NAMESPACE

echo
echo "========== Pods =========="
kubectl get pods -n $NAMESPACE

echo
echo "========== Services =========="
kubectl get svc -n $NAMESPACE

echo
echo "========== HPA =========="
kubectl get hpa -n $NAMESPACE

echo
echo "========== PVC =========="
kubectl get pvc -n $NAMESPACE

echo
echo "========== Ingress =========="
kubectl get ingress -n $NAMESPACE