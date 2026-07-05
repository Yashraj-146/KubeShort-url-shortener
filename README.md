# KubeShort

A full-stack URL shortener built as a production-style systems project: Google OAuth, JWT auth, PostgreSQL persistence, Redis cache/rate limiting, Docker, Kubernetes, HPA, and a React dashboard layered over a stable Express REST API.

## Problem & Approach

Shortening a URL is the easy part. The harder problem is making the redirect path fast without letting cache state become the source of truth, while keeping authenticated management, analytics, and deployment concerns separated from business logic.

KubeShort solves that with a layered TypeScript backend: controllers stay HTTP-only, services own business behavior, repositories wrap Prisma, PostgreSQL remains authoritative, and Redis is used only for redirect acceleration and shared rate-limit counters. The frontend is a separate Vite application that consumes the existing REST API instead of forcing backend contract changes.

## Architecture

```mermaid
flowchart TD
  Browser["Browser / React frontend"] --> Netlify["Static frontend hosting\n(Netlify target)"]
  Netlify --> API["Express REST API\nRender target / Docker / Kubernetes"]

  API --> Middleware["Helmet, CORS, auth middleware,\nRedis-backed rate limits"]
  Middleware --> Controllers["Thin controllers"]
  Controllers --> Services["Services\nbusiness logic, ownership, cache decisions"]
  Services --> Repositories["Repositories\nPrisma-only database access"]
  Repositories --> Postgres["PostgreSQL\nUsers, ShortLinks, Clicks"]
  Services --> Redis["Redis\nredirect cache + rate-limit store"]
  Browser --> Redirect["GET /:shortCode"]
  Redirect --> API
```

Request flow:

- Google login starts in the React frontend through Google Identity Services. The frontend sends the Google ID token to `POST /api/v1/auth/google`; the backend verifies it and returns an application JWT.
- Authenticated URL operations use `Authorization: Bearer <token>` against `/api/v1/urls`.
- Public redirects hit `GET /:shortCode`. If Redis caching is enabled, the service checks `shortlink:{shortCode}` first, falls back to PostgreSQL on a miss, and then repopulates Redis.
- Analytics are written as `Click` rows during redirects unless `BENCHMARK_MODE=true`, which intentionally disables click inserts for cleaner redirect benchmarks.

## Key Technical Decisions

- **Controller -> Service -> Repository architecture**: controllers parse/return HTTP, services own rules, repositories only call Prisma. This keeps business behavior testable and prevents Express or Prisma concerns from spreading through the codebase.
- **PostgreSQL as source of truth, Redis as optimization**: redirects can be served from Redis, but URL ownership, expiration, deletion, and analytics remain backed by PostgreSQL. Redis can be disabled through `REDIS_CACHE_ENABLED` without changing user-facing behavior.
- **Redis-backed rate limiting instead of in-memory counters**: `express-rate-limit` uses `rate-limit-redis`, so limits are shared across multiple app replicas. A memory store was rejected because it breaks once Kubernetes runs more than one pod.
- **Google OAuth exchanged for first-party JWTs**: the backend verifies Google ID tokens, creates or updates users, and issues its own JWT. The frontend stores only the returned application session.
- **Benchmark mode is explicit**: `BENCHMARK_MODE=true` skips click writes during redirect tests, avoiding benchmark results dominated by analytics insert volume.
- **Frontend as a sibling app, not a backend rewrite**: React/Vite lives in `frontend/` and adapts to existing REST contracts. No backend controller, service, repository, Prisma, Docker, Compose, or Kubernetes redesign was required for Version 2.

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 18, TypeScript, Vite | Dashboard, Google login UI, URL management, analytics views |
| Styling | Tailwind CSS, shadcn/ui-style local components, lucide-react | Responsive SaaS-style interface without a heavy component framework |
| API | Express 5, TypeScript | REST API, redirect endpoint, middleware pipeline |
| Validation | Zod | Request and environment validation with fail-fast startup |
| Auth | Google Auth Library, JWT | Google identity verification and first-party API sessions |
| Database | PostgreSQL, Prisma | Persistent users, short links, and click analytics |
| Cache / Rate limits | Redis, express-rate-limit, rate-limit-redis | Redirect cache and shared rate-limit counters |
| Logging | Pino | Structured application logging |
| Benchmarking | autocannon | Redirect performance testing |
| Local orchestration | Docker Compose | App, PostgreSQL, and Redis for local integration |
| Production reference | Kubernetes, HPA, Metrics Server | Multi-replica backend deployment with CPU-based autoscaling |

## Deployment

The repository supports three deployment paths, each backed by actual config files.

### Public Free Deployment Target

`docs/DEPLOYMENT.md` records the selected end-to-end public deployment architecture:

| Layer | Provider | Why |
| --- | --- | --- |
| Frontend | Netlify Free | Static Vite build, HTTPS, environment variables |
| Backend | Render Free Web Service | Node.js web service, HTTPS, environment variables, repo-based deploys |
| PostgreSQL | Neon Free | Long-lived free PostgreSQL, preferred over expiring free database trials |
| Redis | Upstash Redis Free | External Redis-compatible service for cache/rate-limit usage |

Required frontend environment variables:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Recommended Render backend commands from `docs/DEPLOYMENT.md`:

```text
Build command: npm install && npm run prisma:generate && npm run build
Start command: npm run prisma:deploy && npm start
Health check path: /api/v1/health
```

Live public URLs are not committed in this repository. `docs/DEPLOYMENT.md` intentionally uses placeholders for the Netlify and Render URLs.

### Docker Compose

`docker-compose.yml` runs:

- `app` on port `3000`
- `postgres:16-alpine` on port `5432`
- `redis:7-alpine` on port `6379`

The app container waits for PostgreSQL and Redis health checks, runs `npx prisma migrate deploy`, then starts the compiled backend.

### Kubernetes

The `k8s/` directory defines:

- namespace: `url-shortener`
- app deployment: 2 replicas, rolling updates, readiness/liveness probes on `/api/v1/health`
- PostgreSQL deployment with a `5Gi` PVC
- Redis deployment
- ClusterIP services for app, PostgreSQL, and Redis
- HPA: min 2 replicas, max 5 replicas, target 70% CPU
- Ingress manifest for `url-shortener.local`

Operational scripts in `scripts/` scale workloads up/down instead of deleting the namespace, preserving the PVC and configuration between local Kubernetes sessions.

No CI workflow files are currently present under `.github/`.

## Notable Engineering Challenges

- **Redirect performance versus analytics correctness**: click tracking writes a row on every redirect, which is useful for analytics but distorts redirect benchmarks. The solution is `BENCHMARK_MODE`, documented in `MEMORY.md`, which skips click writes only during benchmark runs.
- **Cache invalidation after deletion**: Redis caches only `id`, `originalUrl`, and `expiresAt`, and the delete path removes the Redis key for the short code before deleting the PostgreSQL record. This avoids serving stale redirects after destructive operations.
- **Rate limiting in a horizontally scaled backend**: in-memory rate limiting would give each replica its own counter. The project uses Redis-backed rate limiting so Kubernetes replicas share the same limit state.
- **Kubernetes HPA visibility**: early HPA checks showed CPU as `<unknown>` until Metrics Server was installed and patched with `--kubelet-insecure-tls` for the local Docker Desktop environment.
- **Container hardening and size reduction**: the Dockerfile moved from a single-stage image to a multi-stage Node 22 Alpine build, prunes dev dependencies, and runs the runtime image as the non-root `node` user.

## Getting Started

### Prerequisites

- Node.js `22.x`
- Docker Desktop, for PostgreSQL and Redis via Compose
- A Google OAuth Client ID for login flows

### 1. Configure the backend

Create `.env` in the repository root:

```text
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/url_shortener
REDIS_URL=redis://localhost:6379
REDIS_CACHE_ENABLED=true
BENCHMARK_MODE=false
LOG_LEVEL=info
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=replace-with-at-least-32-characters
JWT_EXPIRES_IN=7d
```

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

Install dependencies, generate Prisma Client, and apply migrations:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
```

Start the backend:

```bash
npm run dev
```

Verify:

```bash
curl http://localhost:3000/api/v1/health
```

### 2. Configure the frontend

Create `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

For local Google login, add the exact frontend origin you use, such as `http://localhost:5173` or `http://127.0.0.1:5173`, to Google OAuth Authorized JavaScript origins.

### Docker Compose Alternative

Run the backend stack through Compose:

```bash
docker compose up --build
```

Compose starts the backend, PostgreSQL, Redis, applies Prisma migrations, and exposes the API on `http://localhost:3000`.

### Kubernetes Local Workflow

Initial deployment:

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

Daily start:

```bash
./scripts/start-k8s.sh
kubectl port-forward service/url-shortener 3000:3000 -n url-shortener
```

Daily stop:

```bash
./scripts/stop-k8s.sh
```

## API Surface

```text
GET    /api/v1/health
POST   /api/v1/auth/google
GET    /api/v1/urls
POST   /api/v1/urls
GET    /api/v1/urls/:id
DELETE /api/v1/urls/:id
GET    /api/v1/urls/:id/analytics
GET    /:shortCode
```

Authenticated endpoints require:

```text
Authorization: Bearer <JWT>
```

## Verification

Backend:

```bash
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

Benchmark a redirect path:

```bash
./benchmarks/benchmark.sh <SHORT_CODE>
```

## Project Status

Version 1 backend is complete and considered stable in `docs/MEMORY.md`: Express, TypeScript, Prisma, PostgreSQL, Google OAuth, JWT, Redis caching, Redis-backed rate limiting, benchmarking, Docker, Docker Compose, Kubernetes, HPA, Metrics Server, and operational scripts.

Version 2 frontend is implemented in `frontend/`: React, TypeScript, Vite, Tailwind CSS, shadcn/ui-style components, Google login, dashboard, URL creation, copy/delete actions, analytics, and profile view.

The documented public deployment target is Netlify + Render + Neon + Upstash. Public runtime URLs are environment-specific and are not stored in the repository.

Next likely work, based on `docs/MEMORY.md`, should prioritize user experience and deployment polish over adding new infrastructure such as Kafka, RabbitMQ, Elasticsearch, GraphQL, microservices, CQRS, or event sourcing.

## Engineering Memory

`docs/MEMORY.md` is the canonical engineering record for this project. Read it before significant changes, and append new architectural decisions instead of replacing history.
