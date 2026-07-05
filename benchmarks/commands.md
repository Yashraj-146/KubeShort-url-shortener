# Benchmark Commands

This document contains the commands used to benchmark the URL Shortener backend.

---

## 1. PostgreSQL Only (Redis Cache Disabled)

Run the benchmark script:

```bash
./benchmarks/benchmark.sh <SHORT_CODE>
```

Example:

```bash
./benchmarks/benchmark.sh KgBQXpR
```

---

## 2. Redis Cache Enabled

Run the same benchmark after enabling Redis cache.

```bash
./benchmarks/benchmark.sh <SHORT_CODE>
```

---

## 3. Custom Benchmark

Run Autocannon directly.

```bash
autocannon \
  --connections 100 \
  --duration 30 \
  --pipelining 10 \
  http://localhost:3000/<SHORT_CODE>
```

---

## 4. Heavy Load Test

Increase the number of concurrent connections.

```bash
autocannon \
  --connections 300 \
  --duration 60 \
  --pipelining 10 \
  http://localhost:3000/<SHORT_CODE>
```

---

## 5. Extreme Load Test

Stress the server.

```bash
autocannon \
  --connections 500 \
  --duration 120 \
  --pipelining 10 \
  http://localhost:3000/<SHORT_CODE>
```

---

## Notes

- Keep the application running with `npm run dev`.
- Ensure PostgreSQL and Redis are running.
- Use the same short code for all benchmark runs.
- Restart the application after changing cache settings.
- Record results in `postgres.md` and `redis.md`.