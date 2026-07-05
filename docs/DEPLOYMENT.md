# Deployment Guide

This document records the Version 2 public deployment strategy.

The project must use only completely free services:

- no paid plans
- no free trials
- no credit-card requirement
- no services that require upgrading for a personal portfolio deployment

The backend architecture remains unchanged. The public deployment uses external managed services for PostgreSQL and Redis while preserving the existing Express REST API.

## Selected Providers

| Layer | Provider | Plan | Reason |
| --- | --- | --- | --- |
| Frontend | Netlify | Free | Static Vite app hosting, HTTPS, CI/CD, environment variables, and a free plan described as `$0 forever`. |
| Backend | Render | Free Web Service | Supports Node.js web services, environment variables, managed TLS, custom domains, Docker/native deploys, and a `$0/month` free instance. |
| PostgreSQL | Neon | Free | Serverless PostgreSQL with no time limit and no credit card required. |
| Redis | Upstash Redis | Free | External Redis-compatible service with a free tier suitable for cache and rate-limiting usage. |

## Why These Providers

### Frontend

Netlify is the primary choice because the frontend is a static Vite build and Netlify's free tier is designed for long-lived static deployments. Vercel Hobby is also a good free option, but Netlify is the documented default for this project.

### Backend

Render Free Web Service is the best fit among currently available no-cost Node.js hosting options because it supports a long-running Express HTTP server with HTTPS, environment variables, and repo-based deploys.

Tradeoff:

- free web services spin down after idle periods
- first request after sleep can be slow
- free instances are single-instance

These tradeoffs are acceptable for a personal portfolio project.

### Database

Neon Free is preferred over Render Postgres Free because Render's free PostgreSQL databases expire after 30 days. This project needs sustainable long-term storage without recurring cost.

### Redis

Upstash Redis Free is preferred because Redis is an optimization in this architecture, not the source of truth. The free tier is enough for a personal deployment and supports the existing `REDIS_URL` contract.

## Rejected Alternatives

| Provider | Rejected For |
| --- | --- |
| Railway | Free tier is a 30-day trial that transitions to a paid monthly plan. |
| Fly.io | Current public pricing centers on pay-as-you-go and legacy free allowances; not a clean no-card forever-free choice for a new user. |
| Render Postgres Free | Free database expires after 30 days, which violates the long-term sustainability requirement. |
| Paid VPS providers | Paid service, violates project constraints. |

## Frontend Deployment: Netlify

Build settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Environment variables:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Google OAuth configuration:

- Add the Netlify production URL to Google OAuth Authorized JavaScript origins.
- Keep the same Google Client ID as the backend `GOOGLE_CLIENT_ID`.

## Backend Deployment: Render

Recommended Render settings:

```text
Runtime: Node
Build command: npm install && npm run prisma:generate && npm run build
Start command: npm run prisma:deploy && npm start
Health check path: /api/v1/health
```

Environment variables:

```text
NODE_ENV=production
PORT=3000
BASE_URL=https://your-render-service.onrender.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
REDIS_CACHE_ENABLED=true
BENCHMARK_MODE=false
LOG_LEVEL=info
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=at-least-32-characters
JWT_EXPIRES_IN=7d
```

The backend already uses permissive CORS. If a stricter CORS policy is introduced later, it must be implemented through validated environment variables and documented in `MEMORY.md`.

## PostgreSQL Deployment: Neon

1. Create a Neon Free project.
2. Copy the pooled or direct PostgreSQL connection string.
3. Set Render `DATABASE_URL`.
4. Deploy the backend so `npm run prisma:deploy` applies migrations.

## Redis Deployment: Upstash

1. Create an Upstash Redis Free database.
2. Copy the Redis connection string compatible with Node Redis.
3. Set Render `REDIS_URL`.
4. Keep `REDIS_CACHE_ENABLED=true`.

Redis remains optional. The backend must still function if caching is disabled.

## Public URLs

After deployment:

```text
Frontend: https://your-netlify-site.netlify.app
Backend:  https://your-render-service.onrender.com
Health:   https://your-render-service.onrender.com/api/v1/health
```

## Verification Checklist

- Frontend loads over HTTPS.
- Backend health endpoint returns healthy status.
- Google login returns an application JWT.
- Creating a URL succeeds from the dashboard.
- Short URL redirects publicly.
- Copy button copies the returned short URL.
- Analytics load for an owned URL.
- Deleting a URL removes it from the dashboard and invalidates Redis cache.
- Backend `npm run build` still passes.
- Frontend `npm run build` still passes.

## Architecture Notes

This deployment does not replace Docker, Docker Compose, or Kubernetes. Those remain part of the Version 1 backend architecture and continue to serve local orchestration and production-reference purposes.

The public free deployment is an additional deployment target optimized for portfolio accessibility.
