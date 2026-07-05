# Production-Ready URL Shortener

A portfolio-grade URL shortener built with a stable Version 1 backend and a modern Version 2 frontend.

## Stack

Backend:

- Express 5
- TypeScript
- Prisma
- PostgreSQL
- Google OAuth
- JWT authentication
- Redis cache
- Redis-backed rate limiting
- Docker, Docker Compose, Kubernetes, HPA

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style local components

## Repository Structure

```text
src/          Express backend
prisma/       Prisma schema and migrations
k8s/          Kubernetes manifests
scripts/      Kubernetes operational scripts
benchmarks/   autocannon benchmark notes and scripts
docs/         Engineering memory and deployment docs
frontend/     Version 2 React application
```

## Backend Setup

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

Install and run:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

## Frontend Setup

Create `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Install and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Frontend Features

- Landing page
- Google login
- Authenticated dashboard
- Create short URL
- Custom alias
- Expiration date
- Copy short URL
- Delete URL
- My URLs
- Analytics
- User profile
- Responsive layout

## API Contract

The frontend consumes the existing REST API without backend contract changes:

```text
POST   /api/v1/auth/google
GET    /api/v1/urls
POST   /api/v1/urls
DELETE /api/v1/urls/:id
GET    /api/v1/urls/:id/analytics
GET    /:shortCode
```

Authenticated requests use:

```text
Authorization: Bearer <JWT>
```

## Docker Compose

```bash
docker compose up --build
```

Docker Compose is intended for local orchestration of the backend, PostgreSQL, and Redis.

## Kubernetes

Kubernetes manifests live in `k8s/`.

Operational scripts:

```bash
./scripts/start-k8s.sh
./scripts/status-k8s.sh
./scripts/stop-k8s.sh
```

Kubernetes remains the production-reference deployment for the backend architecture.

## Public Free Deployment

The selected Version 2 free deployment target is:

- Frontend: Netlify Free
- Backend: Render Free Web Service
- PostgreSQL: Neon Free
- Redis: Upstash Redis Free

See [docs/DEPLOYMENT.md](/Users/yashraj146/Documents/url-shortener/docs/DEPLOYMENT.md) for the provider evaluation, tradeoffs, and deployment checklist.

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

## Engineering Memory

[docs/MEMORY.md](/Users/yashraj146/Documents/url-shortener/docs/MEMORY.md) is the canonical engineering memory and must be read before significant changes.

Major architecture decisions must be appended there, not replaced.
