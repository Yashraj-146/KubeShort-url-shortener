# PostgreSQL Benchmark Report

## Benchmark Environment

| Item | Value |
|------|-------|
| Application | URL Shortener Backend |
| Cache | Disabled |
| Database | PostgreSQL |
| Redis | Running (Cache Disabled) |
| Benchmark Tool | Autocannon |
| Duration | 30 seconds |
| Connections | 100 |
| Pipelining | 10 |

---

## Benchmark Command

```bash
./benchmarks/benchmark.sh <SHORT_CODE>
```

Example:

```bash
./benchmarks/benchmark.sh KgBQXpR
```

---

## Results

| Metric | Value |
|---------|------:|
| Requests/sec | |
| Average Latency | |
| P50 | |
| P75 | |
| P90 | |
| P95 | |
| P99 | |
| Throughput | |
| Total Requests | |

---

## Database Observations

| Observation | Result |
|-------------|--------|
| Redis Cache Hits | 0 |
| PostgreSQL Reads | |
| Click Inserts | |
| Cache Misses | 100% |

---

## Analysis

_To be completed after running the benchmark._

---

## Conclusion

_To be completed after comparing with the Redis benchmark._