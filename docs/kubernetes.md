# Kubernetes Development Guide

This document explains how to start, stop and manage the local Kubernetes deployment.

---

# Initial Deployment

Only required once.

```bash
kubectl apply -f k8s/namespace.yaml

kubectl apply -f k8s/configmap.yaml

kubectl apply -f k8s/secret.yaml

kubectl apply -f k8s/postgres/

kubectl apply -f k8s/redis/

kubectl apply -f k8s/app/

kubectl apply -f k8s/ingress.yaml

kubectl apply -f k8s/hpa.yaml
```

---

# Daily Development Workflow

## 1. Start Docker Desktop

Wait until Docker is running.

---

## 2. Enable Kubernetes

Settings

↓

Kubernetes

↓

Enable Kubernetes

Wait until:

```
Kubernetes is running
```

---

## 3. Start the project

```bash
./scripts/start-k8s.sh
```

---

## 4. Port Forward

```bash
kubectl port-forward service/url-shortener \
3000:3000 \
-n url-shortener
```

Application:

```
http://localhost:3000
```

---

## 5. Check status

```bash
./scripts/status-k8s.sh
```

---

# Benchmark

Example

```bash
autocannon \
-c 100 \
-d 120 \
http://localhost:3000/<shortCode>
```

Watch autoscaling

```bash
kubectl get hpa \
-n url-shortener \
--watch
```

Watch Pods

```bash
kubectl get pods \
-n url-shortener \
--watch
```

---

# Stop Development

Stop port forwarding

```
Ctrl + C
```

Scale workloads to zero

```bash
./scripts/stop-k8s.sh
```

Disable Kubernetes in Docker Desktop.

Quit Docker Desktop.

---

# Resume Tomorrow

1. Open Docker Desktop.
2. Enable Kubernetes.
3. Wait until Kubernetes starts.
4. Run

```bash
./scripts/start-k8s.sh
```

5. Port forward

```bash
kubectl port-forward service/url-shortener \
3000:3000 \
-n url-shortener
```

---

# Delete Everything

Only if you intentionally want a clean cluster.

```bash
kubectl delete namespace url-shortener
```

---

# Useful Commands

Pods

```bash
kubectl get pods -n url-shortener
```

Deployments

```bash
kubectl get deployments -n url-shortener
```

Logs

```bash
kubectl logs deployment/url-shortener \
-n url-shortener
```

Describe

```bash
kubectl describe pod <pod-name> \
-n url-shortener
```

HPA

```bash
kubectl get hpa \
-n url-shortener
```

Metrics

```bash
kubectl top pods \
-n url-shortener
```

Port Forward

```bash
kubectl port-forward service/url-shortener \
3000:3000 \
-n url-shortener
```