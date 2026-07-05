# KubeShort

> **A production-style URL shortener engineered from the ground up to explore scalable backend architecture, distributed caching, cloud deployment, and modern DevOps-not just URL shortening.**

KubeShort is a full-stack application that evolved incrementally from a local Express REST API into a publicly deployed system running on modern cloud infrastructure. Rather than optimizing for the shortest implementation, the project prioritizes **clean architecture, maintainability, production readiness, and operational correctness**.

The application demonstrates how common backend concerns-authentication, persistence, caching, rate limiting, observability, containerization, orchestration, and deployment-fit together in a cohesive system while keeping business logic isolated from infrastructure.

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://kube-short-url-shortener.vercel.app/` |
| **Backend API (Render)** | `https://kubeshort-url-shortener.onrender.com` |
| **Health Endpoint** | `https://kubeshort-url-shortener.onrender.com/api/v1/health` |


---

## Features

### Authentication

- Google OAuth 2.0 Sign-In
- Backend-issued JWT sessions
- Protected REST endpoints
- Stateless authentication

### URL Management

- Create short URLs
- Custom aliases
- Expiration dates
- Delete URLs
- Copy-to-clipboard
- Personal dashboard

### Redirect System

- High-performance redirects
- Redis-backed cache
- PostgreSQL as source of truth
- Automatic cache invalidation

### Analytics

- Click tracking
- Per-link analytics
- Redirect timestamps
- Benchmark mode for performance testing

### Infrastructure

- Docker
- Docker Compose
- Kubernetes
- Horizontal Pod Autoscaler (HPA)
- Metrics Server
- Health checks
- Multi-stage Docker builds
- Non-root containers

### Cloud Deployment

- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- PostgreSQL hosted on **Neon**
- Redis hosted on **Upstash Redis**

---

# Why this project exists

Building a URL shortener is relatively straightforward.

Building one that remains maintainable as infrastructure grows is significantly more challenging.

This project intentionally focuses on the engineering decisions that appear after the first working version:

- Where should business logic live?
- Should Redis become the source of truth?
- How should authentication work with Google OAuth?
- How do multiple Kubernetes replicas share rate limits?
- How should Docker images be hardened for production?
- How should the application evolve without breaking API contracts?
- How should cloud deployment differ from local development?

KubeShort answers those questions by treating infrastructure as a first-class engineering concern rather than an afterthought.

---

# Project Evolution

The repository was intentionally developed in multiple stages instead of building everything at once.

```text
Phase 1
────────────────────────────────────
Express REST API
TypeScript
Prisma ORM
PostgreSQL

        │
        ▼

Phase 2
────────────────────────────────────
Google OAuth
JWT Authentication
Redis Cache
Redis-backed Rate Limiting

        │
        ▼

Phase 3
────────────────────────────────────
Benchmarking
Structured Logging
Docker
Docker Compose

        │
        ▼

Phase 4
────────────────────────────────────
Kubernetes
Health Checks
Horizontal Pod Autoscaler
Metrics Server

        │
        ▼

Phase 5
────────────────────────────────────
React
TypeScript
Vite
Tailwind CSS

        │
        ▼

Phase 6
────────────────────────────────────
Public Cloud Deployment

Frontend → Vercel

Backend → Render

Database → Neon

Redis → Upstash
```

Each phase intentionally preserved the architecture established in previous phases instead of introducing unnecessary rewrites.

For example, the React frontend was implemented **without changing backend API contracts**, demonstrating how frontend evolution can happen independently of backend business logic.

---

# What makes this project different?

Many URL shortener tutorials stop after implementing CRUD operations.

KubeShort intentionally continues beyond that point by exploring topics commonly encountered in production systems:

- Layered backend architecture
- JWT-based authentication
- Google Identity integration
- Redis caching
- Shared rate limiting
- Docker image optimization
- Kubernetes deployment
- Horizontal autoscaling
- Production cloud deployment
- Infrastructure documentation
- Operational scripts
- Engineering decision records

The objective is not to build the smallest URL shortener-it is to demonstrate how backend systems evolve as complexity increases while remaining maintainable.

# System Architecture

KubeShort follows a layered architecture that separates HTTP concerns, business logic, persistence, and infrastructure.

Instead of allowing controllers to access the database directly, every request flows through clearly defined layers with a single responsibility.

```text
                        Browser
                           │
                           ▼
                React + Vite Frontend
                           │
                    HTTPS REST API
                           │
                           ▼
                   Express Application
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Authentication      URL Management      Public Redirect
        │                  │                  │
        ▼                  ▼                  ▼
                 Controller Layer
        (HTTP parsing & response formatting)
                           │
                           ▼
                    Service Layer
        (Business rules & orchestration)
                           │
                           ▼
                 Repository Layer
          (Prisma database abstraction)
                           │
                           ▼
                     PostgreSQL
                 Source of Truth
                           ▲
                           │
                    Redis Cache
            (Performance Optimization)
```

The architecture intentionally enforces one-way dependencies.

- Controllers never contain business rules.
- Services never depend on Express.
- Repositories never contain business decisions.
- Redis never becomes the primary datastore.
- PostgreSQL always remains authoritative.

This separation makes each layer independently testable and prevents infrastructure concerns from leaking into business logic.

---

# Request Lifecycle

Every incoming request follows the same execution path.

```text
Client Request
      │
      ▼
Express Middleware

Helmet
CORS
Logging
Authentication
Rate Limiting

      │
      ▼

Controller

Validate Request
Extract Parameters
Return HTTP Response

      │
      ▼

Service

Business Rules
Ownership Checks
Caching Decisions
Expiration Checks

      │
      ▼

Repository

Prisma Queries

      │
      ▼
PostgreSQL
```

By keeping controllers intentionally thin, the application avoids coupling business behavior to Express, making future framework changes significantly easier.

---

# Redirect Lifecycle

The redirect path is the most performance-sensitive operation in the application.

Rather than querying PostgreSQL on every request, Redis is used as a cache while PostgreSQL remains the authoritative datastore.

```text
GET /:shortCode
        │
        ▼
Controller
        │
        ▼
Redirect Service
        │
        ▼
Redis Cache Lookup
        │
   ┌────┴─────┐
   │          │
Hit          Miss
   │          │
   ▼          ▼
Return     PostgreSQL
Cached      Lookup
URL           │
              ▼
        Store in Redis
              │
              ▼
       HTTP Redirect
```

This design provides:

- Low-latency redirects
- Reduced database load
- Predictable cache invalidation
- Correct behavior even when Redis is unavailable

If Redis is disabled, the application still functions correctly because PostgreSQL remains the source of truth.

---

# Authentication Flow

Authentication uses **Google Identity Services** for user identity while maintaining application sessions using first-party JWTs.

```text
User
 │
 ▼
Google Sign-In
 │
 ▼
Google Identity Services
 │
 ▼
ID Token
 │
 ▼
POST /api/v1/auth/google
 │
 ▼
Backend Verification
 │
 ▼
Find or Create User
 │
 ▼
Generate JWT
 │
 ▼
Frontend Stores JWT
 │
 ▼
Authenticated Requests

Authorization: Bearer <token>
```

This approach provides several advantages over using Google access tokens directly:

- Backend owns application sessions.
- JWT expiration can be controlled independently.
- Future authentication providers can be added without changing protected endpoints.
- Authorization logic remains internal to the application.

---

# Data Ownership

One architectural rule is intentionally enforced throughout the system:

> **Redis accelerates reads. PostgreSQL owns data.**

The responsibilities are clearly separated.

## PostgreSQL

Responsible for:

- Users
- Short URLs
- Click Analytics
- Ownership
- Expiration
- Persistence

Losing Redis never causes permanent data loss.

---

## Redis

Responsible for:

- Redirect cache
- Shared rate-limit counters

Redis stores only temporary performance data.

Cache entries are invalidated whenever URLs are updated or deleted to prevent stale redirects.

---

# Deployment Architecture

The production deployment intentionally separates responsibilities across cloud providers.

```text
                    Internet
                        │
                        ▼
              Vercel (React Frontend)
                        │
                        ▼
         Render (Express REST API)
              │                  │
              ▼                  ▼
     Neon PostgreSQL      Upstash Redis
```

Each component has a single responsibility.

| Component | Responsibility |
|------------|----------------|
| Vercel | Static frontend hosting |
| Render | Express REST API |
| Neon | Persistent PostgreSQL database |
| Upstash | Redis cache and shared rate limiting |

This separation keeps the application stateless and allows each service to scale independently.

# Engineering Decisions

Every significant component in KubeShort exists because it solves a specific engineering problem.

Rather than selecting technologies first, the architecture evolved by identifying constraints and choosing the simplest solution that remained maintainable as the project grew.

---

## Layered Backend Architecture

### Problem

As backend applications grow, controllers often accumulate validation, business rules, database queries, logging, and authorization logic.

This quickly makes the HTTP layer responsible for concerns it should not own.

### Decision

The backend follows a layered architecture:

```text
Controller
    │
    ▼
Service
    │
    ▼
Repository
```

### Responsibilities

| Layer | Responsibility |
|--------|----------------|
| Controller | HTTP parsing, request validation, response formatting |
| Service | Business rules, orchestration, ownership checks, caching decisions |
| Repository | Prisma queries only |
| Database | Persistent storage |

### Why?

This keeps Express isolated from business logic.

Business behavior can evolve without changing routing code, while persistence can change without affecting services.

---

## PostgreSQL as the Source of Truth

### Problem

Redis is significantly faster than PostgreSQL.

It might seem attractive to treat Redis as the application's primary datastore.

Doing so would introduce consistency problems.

### Decision

Redis is **never** the source of truth.

Only PostgreSQL owns persistent application state.

Redis exists solely to improve performance.

```text
PostgreSQL

Users
URLs
Analytics
Ownership
Expiration

        │
        ▼

Redis

Cached Redirects
Rate Limit Counters
```

### Benefits

- Cache can be cleared safely.
- No permanent data loss.
- Database always remains authoritative.
- Application still works without cache.

---

## Redis-backed Rate Limiting

### Problem

The default in-memory rate limiter works only while a single backend instance exists.

Once Kubernetes starts multiple replicas:

```text
Replica A

100 Requests
```

```text
Replica B

100 Requests
```

each replica maintains its own counter.

Rate limiting becomes inconsistent.

### Decision

Move rate-limit state into Redis.

```text
Replica A
        │
        ▼

      Redis

        ▲
        │

Replica B
```

All backend replicas share identical counters.

### Trade-off

Every request requires an additional Redis operation.

The consistency benefits outweigh the additional network hop.

---

## Google OAuth + First-party JWT

### Problem

Google verifies user identity.

It should not become the application's session manager.

### Decision

Google is used only for identity verification.

The backend then creates its own JWT.

```text
Google

↓

Identity Verified

↓

Backend

↓

Application JWT

↓

Protected API
```

### Benefits

- Backend controls session lifetime.
- Authorization remains internal.
- Future authentication providers can be added easily.
- API remains independent from Google's token lifecycle.

---

## Repository Pattern

### Problem

Direct Prisma usage inside controllers or services tightly couples business logic to the ORM.

Changing persistence later becomes difficult.

### Decision

Repositories own every Prisma query.

```text
Controller

↓

Service

↓

Repository

↓

Prisma
```

Business logic never imports Prisma directly.

---

## Benchmark Mode

### Problem

Redirect benchmarking becomes misleading when every redirect also inserts analytics into PostgreSQL.

The benchmark measures:

```text
Redirect

+

Database Write
```

instead of redirect performance alone.

### Decision

Introduce

```text
BENCHMARK_MODE=true
```

During benchmarking:

- Redirects continue to function.
- Analytics writes are skipped.
- Redirect latency becomes easier to evaluate.

The feature exists purely for engineering validation and is never intended for production analytics.

---

## Docker Image Optimization

The first Docker image exceeded **900 MB**.

Rather than accepting the default output, the image was optimized using:

- Multi-stage builds
- Production dependency pruning
- Alpine Linux
- Non-root execution

The final production image is significantly smaller while following container security best practices.

---

## Kubernetes Design

The application intentionally remains stateless.

```text
Pods

↓

Services

↓

External PostgreSQL

External Redis
```

Application replicas never own persistent state.

This enables horizontal scaling without introducing replication concerns.

Persistent data remains outside the application layer.

---

## Horizontal Pod Autoscaler

Autoscaling was introduced after the application functioned correctly.

The objective was to validate operational behavior rather than simply enable Kubernetes features.

The deployment includes:

- CPU-based autoscaling
- Readiness probes
- Liveness probes
- Metrics Server integration

Load testing with `autocannon` verified that multiple replicas behaved correctly while sharing Redis-backed rate limits.

---

## Cloud Deployment Strategy

Rather than deploying everything to a single provider, the production system intentionally separates responsibilities.

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon |
| Cache | Upstash Redis |

This approach demonstrates how independent cloud services can be composed into a cohesive production system.

Each provider performs one task well instead of forcing the application into a single ecosystem.

---

# Trade-offs

No architecture is free.

Several conscious trade-offs were made throughout the project.

| Decision | Benefit | Cost |
|-----------|---------|------|
| Redis Cache | Faster redirects | Cache invalidation required |
| Repository Pattern | Cleaner architecture | More abstraction |
| JWT Sessions | Backend controls authentication | Token management |
| Kubernetes | Production orchestration | Higher operational complexity |
| Separate Frontend | Independent deployment | Cross-origin configuration |
| External Redis | Shared rate limiting | Additional network latency |

The objective was never to eliminate complexity.

The objective was to place complexity where it provides the greatest long-term benefit.

# Technology Stack

Every technology in the project was selected to solve a specific problem rather than simply increase the number of frameworks used.

| Layer | Technology | Purpose |
|--------|------------|---------|
| Frontend | React 18 + TypeScript | Single Page Application |
| Build Tool | Vite | Fast development and production builds |
| Styling | Tailwind CSS | Utility-first responsive UI |
| Components | shadcn/ui-style components + Lucide Icons | Consistent user interface |
| Backend | Express 5 + TypeScript | REST API and redirect service |
| Validation | Zod | Runtime request and environment validation |
| Authentication | Google Identity Services + JWT | User authentication and session management |
| ORM | Prisma | Database access and migrations |
| Database | PostgreSQL (Neon) | Persistent application data |
| Cache | Redis (Upstash) | Redirect caching and distributed rate limiting |
| Logging | Pino | Structured JSON logging |
| Benchmarking | autocannon | Redirect performance testing |
| Local Development | Docker Compose | Local infrastructure orchestration |
| Containerization | Docker | Portable application packaging |
| Orchestration | Kubernetes | Production-style deployment |
| Autoscaling | Horizontal Pod Autoscaler | CPU-based scaling |
| Cloud Frontend | Vercel | Static frontend hosting |
| Cloud Backend | Render | Backend hosting |
| Version Control | Git + GitHub | Source control and deployments |

---

# Production Deployment

The application is fully deployed using managed cloud services.

```text
                    Internet
                         │
                         ▼
               Vercel (React Frontend)
                         │
                HTTPS REST Requests
                         │
                         ▼
              Render (Express Backend)
                  │               │
                  ▼               ▼
        Neon PostgreSQL     Upstash Redis
```

Each component is responsible for a single concern.

| Service | Responsibility |
|----------|----------------|
| Vercel | Hosts the React frontend |
| Render | Hosts the Express API |
| Neon | Stores persistent application data |
| Upstash Redis | Provides caching and distributed rate limiting |

Separating responsibilities across providers keeps the backend stateless while allowing each component to scale independently.

---

# Repository Structure

```text
KubeShort
│
├── frontend/                 React + Vite frontend
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── server.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── k8s/
│   ├── app/
│   ├── postgres/
│   ├── redis/
│   ├── namespace.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
│
├── scripts/
│
├── docs/
│   ├── MEMORY.md
│   └── DEPLOYMENT.md
│
├── benchmarks/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

The repository intentionally keeps the frontend and backend independent.

The React application consumes the existing REST API without requiring changes to backend business logic or API contracts.

---

# Local Development

## Prerequisites

- Node.js **22.x**
- Docker Desktop
- Google OAuth Client ID

Clone the repository:

```bash
git clone https://github.com/Yashraj-146/KubeShort-url-shortener.git

cd KubeShort-url-shortener
```

---

## Backend Configuration

Create a `.env` file in the project root.

```text
NODE_ENV=development

PORT=3000

BASE_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/url_shortener

REDIS_URL=redis://localhost:6379

REDIS_CACHE_ENABLED=true

BENCHMARK_MODE=false

LOG_LEVEL=info

GOOGLE_CLIENT_ID=<your-google-client-id>

JWT_SECRET=<minimum-32-character-secret>

JWT_EXPIRES_IN=7d
```

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
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

---

## Frontend Configuration

Create:

```text
frontend/.env
```

```text
VITE_API_BASE_URL=http://localhost:3000

VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

Install dependencies:

```bash
cd frontend

npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Google OAuth requires the frontend origin to be registered in the Google Cloud Console.

For local development, register either:

```text
http://localhost:5173
```

or

```text
http://127.0.0.1:5173
```

depending on which URL you use.

---

# Docker

The project includes both a production-ready Dockerfile and Docker Compose configuration.

The Docker image incorporates several production-oriented improvements:

- Multi-stage builds
- Alpine Linux
- Non-root execution
- Production dependency pruning
- Health checks

Run the entire backend stack locally:

```bash
docker compose up --build
```

Services started:

| Service | Port |
|----------|------|
| Express API | 3000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

The application automatically waits for PostgreSQL and Redis to become healthy before running database migrations and starting the server.

---

# Kubernetes

The repository includes a complete Kubernetes deployment used during development to validate production-style infrastructure.

The deployment includes:

- Namespace isolation
- ConfigMaps
- Secrets
- PostgreSQL Deployment
- Redis Deployment
- Express Deployment
- Services
- Persistent Volume Claims
- Horizontal Pod Autoscaler
- Ingress
- Readiness probes
- Liveness probes

Deploy the application:

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

Rather than deleting the namespace after each session, helper scripts scale workloads down to zero while preserving persistent volumes and configuration.

Daily startup:

```bash
./scripts/start-k8s.sh
```

Daily shutdown:

```bash
./scripts/stop-k8s.sh
```

This approach significantly reduces startup time while keeping the Kubernetes environment intact between development sessions.

# REST API

The frontend communicates exclusively through a REST API. Business logic is never duplicated between the frontend and backend.

## Authentication

```
POST /api/v1/auth/google
```

Authenticates a user using a Google ID token and returns an application JWT.

---

## URL Management

```
GET    /api/v1/urls
POST   /api/v1/urls
GET    /api/v1/urls/:id
DELETE /api/v1/urls/:id
GET    /api/v1/urls/:id/analytics
```

All endpoints require:

```
Authorization: Bearer <JWT>
```

---

## Public Endpoints

```
GET /:shortCode
```

Resolves a short URL and redirects the client to the original destination.

```
GET /api/v1/health
```

Returns application health information and verifies database connectivity.

---

# Example Request Flow

Creating a shortened URL follows the lifecycle below.

```text
React Dashboard
        │
        ▼
POST /api/v1/urls
        │
        ▼
Authentication Middleware
        │
        ▼
Controller
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
PostgreSQL
        │
        ▼
Response
        │
        ▼
Dashboard Updated
```

Every layer owns a single responsibility.

---

# Verification

The project includes several ways to validate correctness.

## Backend

Compile the backend.

```bash
npm run build
```

---

## Frontend

Compile the frontend.

```bash
cd frontend

npm run build
```

---

## Health Check

Verify the backend.

```bash
curl http://localhost:3000/api/v1/health
```

Production:

```text
https://kubeshort-url-shortener.onrender.com/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## Docker

Verify containers.

```bash
docker compose up --build
```

Check:

- Express API
- PostgreSQL
- Redis

are healthy before testing the application.

---

## Kubernetes

Verify workloads.

```bash
kubectl get pods -n url-shortener
```

```bash
kubectl get deployments -n url-shortener
```

```bash
kubectl get services -n url-shortener
```

```bash
kubectl get hpa -n url-shortener
```

The deployment should report:

- Running Pods
- Ready Deployments
- Healthy Services
- Active Horizontal Pod Autoscaler

---

# Performance Testing

Redirect performance can be evaluated independently using **autocannon**.

```bash
./benchmarks/benchmark.sh <SHORT_CODE>
```

Benchmark mode intentionally disables analytics writes.

```
BENCHMARK_MODE=true
```

This allows redirect performance to be measured without PostgreSQL insert latency affecting results.

---

# Observability

The backend uses **Pino** for structured logging.

Typical startup log:

```text
Connected to PostgreSQL
Connected to Redis
Server running on port 3000
```

Health endpoints, structured logs, and Kubernetes probes together provide visibility into application status during development and deployment.

---

# Security

Several security practices are incorporated throughout the project.

### Authentication

- Google OAuth
- JWT-based API sessions

### HTTP Security

- Helmet
- CORS
- Input validation using Zod

### Infrastructure

- Non-root Docker containers
- Multi-stage Docker builds
- Environment variable validation
- Secrets managed separately from source code

### Rate Limiting

Redis-backed distributed rate limiting protects public endpoints across multiple application replicas.

---

# Operational Workflow

The project intentionally supports multiple development workflows.

## Local Development

```text
React

↓

Express

↓

PostgreSQL

↓

Redis
```

Fast feedback while building features.

---

## Docker

```text
Docker Compose

↓

Express

↓

PostgreSQL

↓

Redis
```

Integration testing using containers.

---

## Kubernetes

```text
Ingress

↓

Service

↓

Multiple Express Pods

↓

Redis

↓

PostgreSQL
```

Production-style orchestration with autoscaling.

---

## Public Deployment

```text
Vercel

↓

Render

↓

Neon

↓

Upstash
```

Cloud-native deployment using managed services.

Each workflow builds upon the previous one without requiring architectural changes.

---

# Documentation

The repository intentionally separates operational documentation from project documentation.

| Document | Purpose |
|-----------|----------|
| README.md | Project overview |
| docs/MEMORY.md | Engineering history and architectural decisions |
| docs/DEPLOYMENT.md | Cloud deployment guide |

This separation keeps the README focused while preserving implementation details and historical context.

# Lessons Learned

KubeShort began as a straightforward URL shortener but gradually evolved into a study of backend architecture, distributed systems, and production deployment.

Throughout development, several engineering lessons became apparent.

---

## 1. Architecture matters more than frameworks

Express, React, Docker, and Kubernetes are only tools.

The maintainability of a system depends far more on how responsibilities are separated than on which framework is chosen.

Keeping controllers thin, isolating business logic in services, and restricting Prisma access to repositories made the codebase easier to extend without introducing coupling.

---

## 2. Caching should improve performance, not correctness

Redis was intentionally introduced as a performance optimization rather than as the application's primary datastore.

This decision simplified failure scenarios considerably.

If Redis becomes unavailable:

- URLs still resolve.
- Users can still authenticate.
- Analytics continue working.
- Only performance is temporarily affected.

The application remains correct because PostgreSQL continues to own the data.

---

## 3. Stateless services scale more naturally

Keeping application state outside the backend allows multiple replicas to behave identically.

Instead of relying on local memory:

- sessions are represented by JWTs,
- cache lives in Redis,
- persistent data lives in PostgreSQL.

This made Kubernetes scaling significantly simpler.

---

## 4. Infrastructure changes should not require application rewrites

The project intentionally evolved through multiple deployment models:

```
Local Development

↓

Docker

↓

Docker Compose

↓

Kubernetes

↓

Public Cloud Deployment
```

At no point did business logic require redesign.

Only deployment configuration changed.

---

## 5. Frontend and backend should evolve independently

The React frontend was implemented after the backend had already reached a stable architecture.

Rather than modifying backend contracts, the frontend adapted to the existing REST API.

This demonstrates how independent teams could evolve each layer without introducing breaking API changes.

---

## 6. Operational knowledge is part of software engineering

Building the application was only part of the project.

Operating it introduced additional considerations:

- environment variables
- Google OAuth configuration
- Docker image optimization
- Kubernetes health probes
- Metrics Server
- Horizontal Pod Autoscaler
- cloud deployment
- HTTPS
- Redis connectivity
- deployment debugging

Those operational concerns are now documented alongside the source code rather than existing only as tribal knowledge.

---

# Future Roadmap

The project is intentionally feature-complete from a backend perspective.

Future work focuses on improving user experience rather than increasing architectural complexity.

## Planned Improvements

- Custom domains for shortened URLs
- QR code generation
- Enhanced analytics dashboards
- Better mobile responsiveness
- Additional authentication providers
- Dark mode
- Progressive Web App (PWA)
- Improved frontend animations and UX polish

---

## Potential Infrastructure Improvements

Future iterations may explore:

- CI/CD with GitHub Actions
- Automated testing pipeline
- Distributed tracing
- OpenTelemetry
- Prometheus metrics
- Grafana dashboards
- Custom domain with HTTPS
- CDN caching strategies

These additions would improve operational maturity without changing the core architecture.

---

# Non-goals

This project intentionally avoids introducing technologies solely for resume value.

The following were deliberately excluded:

- Microservices
- Kafka
- RabbitMQ
- Elasticsearch
- GraphQL
- Event Sourcing
- CQRS
- Service Mesh
- Serverless Functions

While each of these technologies is valuable in the appropriate context, they would add operational complexity without meaningfully improving the architecture of a URL shortener.

The objective of this project is to demonstrate sound engineering decisions rather than maximize the number of technologies used.

---

# Engineering Memory

Large engineering projects accumulate architectural context that cannot always be inferred from the source code.

For that reason, the repository includes:

```
docs/MEMORY.md
```

This document records:

- architectural decisions,
- deployment history,
- implementation notes,
- Kubernetes evolution,
- frontend integration,
- production deployment,
- future enhancement plans.

Future changes should extend this document rather than replacing historical context.

---

# Acknowledgements

This project would not exist without the excellent open-source ecosystem built around:

- React
- Vite
- Express
- Prisma
- PostgreSQL
- Redis
- Docker
- Kubernetes
- Tailwind CSS
- Google Identity Services

Their documentation, tooling, and communities make projects like this possible.

---

# Final Thoughts

KubeShort was never intended to be the shortest implementation of a URL shortener.

Instead, it was built as a practical exploration of how software systems evolve from a local development environment into a production deployment while remaining maintainable.

The project intentionally emphasizes engineering trade-offs over framework usage, architecture over abstraction, and operational correctness over unnecessary complexity.

If this repository communicates one idea, it is this:
