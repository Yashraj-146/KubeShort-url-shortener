# MEMORY.md

This document is the canonical engineering memory of the project. Whenever a significant architectural decision is made, this document must be updated before the change is considered complete.

> **Purpose**
>
> This document preserves the complete engineering memory of the URL Shortener project.
>
> It is intended to be given to future AI coding assistants (Codex, ChatGPT, Claude, Cursor, etc.) or future developers so they can continue development without rediscovering architectural decisions.
>
> This document is intentionally verbose.
>
> Never replace this document with summaries.
>
> Always append new architectural decisions.
>
> Every major implementation decision must be recorded here.

---

# 1. Project Overview

## Project Name

Production-ready URL Shortener

---

## Primary Goal

Build a production-grade backend system that demonstrates modern backend engineering practices rather than only implementing URL shortening.

The project intentionally covers the complete software lifecycle:

- API Development
- Authentication
- Database Design
- Caching
- Rate Limiting
- Benchmarking
- Docker
- Docker Compose
- Kubernetes
- Horizontal Scaling

The repository is intended to serve as a portfolio-quality backend engineering project.

---

# Engineering Philosophy

The following principles have been followed throughout the project.

## 1. Keep business logic independent

Controllers should remain thin.

Business logic belongs inside services.

Repositories only communicate with the database.

---

## 2. Infrastructure should be replaceable

Redis, PostgreSQL, Docker and Kubernetes should never leak into business logic more than necessary.

Business logic should not know deployment details.

---

## 3. Configuration must come from environment variables

No hardcoded credentials.

Every configurable behavior is controlled through `.env`.

---

## 4. Fail Fast

Configuration errors should stop the application immediately.

Examples:

- Missing JWT secret
- Missing DATABASE_URL
- Invalid BASE_URL

This is implemented using Zod validation.

---

## 5. Production-first design

Every feature should be implemented as if the application will eventually run in production.

Examples:

- Redis cache
- Redis rate limiting
- Health endpoints
- Docker
- Kubernetes
- HPA
- Secrets
- ConfigMaps

---

# Current Project Status

Current implementation includes:

- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Google OAuth
- JWT Authentication
- URL Shortening
- Custom Aliases
- URL Expiration
- Analytics
- Click Tracking
- Redis Cache
- Redis-backed Rate Limiting
- Performance Benchmarking
- Docker
- Docker Compose
- Kubernetes
- ConfigMaps
- Secrets
- PVC
- HPA
- Metrics Server
- Operational Scripts

Project is considered feature complete for Version 1.

---

# High-Level Architecture

                     Browser
                        │
                        ▼
              Express REST API
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
      PostgreSQL                   Redis
         │                             │
         ▼                             ▼
     Persistent Data            Cache + Rate Limiting

Application is containerized using Docker.

Multiple services are orchestrated using Docker Compose.

Production deployment is demonstrated using Kubernetes.

---

# Repository Structure

(Current structure)

url-shortener/

src/

prisma/

benchmarks/

docs/

k8s/

scripts/

Dockerfile

docker-compose.yml

package.json

README.md

---

# Important Technologies

Language

- TypeScript

Runtime

- Node.js 22

Framework

- Express 5

Validation

- Zod

Authentication

- Google OAuth
- JWT

Database

- PostgreSQL

ORM

- Prisma

Cache

- Redis

Rate Limiting

- express-rate-limit
- rate-limit-redis

Benchmarking

- autocannon

Containerization

- Docker

Orchestration

- Docker Compose
- Kubernetes

Scaling

- Horizontal Pod Autoscaler

---

# Non-goals

The project intentionally does NOT include:

- Frontend
- RabbitMQ
- Kafka
- Elasticsearch
- Microservices
- GraphQL

These may be future enhancements.

---

# Coding Standards

Controllers

Responsibilities:

- Parse Request
- Validate Request
- Call Service
- Return Response

Controllers should NEVER contain business logic.

---

Services

Responsibilities:

- Business Logic
- Redis
- Cache Decisions
- Validation
- Analytics
- Authorization

Services own application behavior.

---

Repositories

Responsibilities:

Only communicate with Prisma.

Repositories should NEVER contain business rules.

---

Utilities

Only pure helper functions.

No database access.

No Redis.

No HTTP.

---

Middleware

Cross-cutting concerns only.

Examples:

- Authentication
- Rate Limiting
- Error Handling

---

Configuration

All configuration belongs under

src/config

No hardcoded values.

---

# Project Lifecycle

The architecture evolved in phases.

Phase 1

Express API

↓

Phase 2

TypeScript

↓

Phase 3

Prisma

↓

Phase 4

PostgreSQL

↓

Phase 5

Authentication

↓

Phase 6

Redis Cache

↓

Phase 7

Redis Rate Limiting

↓

Phase 8

Benchmarking

↓

Phase 9

Docker

↓

Phase 10

Docker Compose

↓

Phase 11

Kubernetes

↓

Phase 12

Horizontal Pod Autoscaler

↓

Phase 13

Metrics Server

↓

Phase 14

Operational Scripts

Every phase is documented later in this file.

---

# Assumptions

Current assumptions that future developers must preserve unless intentionally changing architecture.

## Authentication

Authenticated users create URLs.

Anonymous users may redirect.

---

## Cache

Redis is optional.

Business logic continues working if Redis caching is disabled.

---

## Benchmarking

Benchmark mode intentionally disables click tracking.

Reason:

Click writes would distort benchmark numbers.

---

## Deployment

Docker Compose is intended for local orchestration.

Kubernetes demonstrates production deployment.

---

## Future AI Instructions

When modifying this repository:

DO

- Preserve layered architecture.
- Preserve controller/service/repository separation.
- Preserve Redis cache abstraction.
- Preserve Prisma repository pattern.
- Preserve operational scripts.

DO NOT

- Move business logic into controllers.
- Remove BENCHMARK_MODE.
- Remove REDIS_CACHE_ENABLED.
- Hardcode secrets.
- Introduce circular dependencies.

Every new architectural decision must be appended to this document.

---

# 2. Architecture Evolution (Engineering Decision Record)

This section records every major architectural phase of the project in chronological order.

The purpose is to preserve design rationale so future developers or AI assistants understand *why* the architecture exists as it does.

---

# Phase 1 — Express REST API

## Objective

Create a clean REST backend for URL shortening.

## Initial Architecture

Client

↓

Express

↓

Business Logic

↓

Database

The project started intentionally simple.

No authentication.

No caching.

No containers.

No Kubernetes.

The focus was establishing a clean REST API.

---

# Phase 2 — TypeScript

## Why

The project was intended to demonstrate production-grade engineering.

JavaScript was rejected because:

- weak typing
- poor IDE support
- runtime errors

TypeScript provides:

- compile-time safety
- refactoring confidence
- better maintainability

Decision:

Entire project uses strict TypeScript.

---

# Phase 3 — Layered Architecture

The project intentionally adopted a layered architecture.

Request

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

Responsibilities:

Controller

- HTTP only

Service

- business logic

Repository

- database access only

Utility

- pure helper functions

Middleware

- cross-cutting concerns

Future contributors should preserve this architecture.

Business logic must never move into controllers.

---

# Phase 4 — Prisma ORM

Prisma was selected over:

- Sequelize
- TypeORM

Reasons

- Type safety
- Excellent TypeScript integration
- Migration support
- Better developer experience

Repository layer wraps Prisma.

Application code should not call Prisma directly.

---

# Phase 5 — PostgreSQL

Chosen because:

- production-ready
- relational
- ACID
- excellent Prisma support

Initial data model

User

↓

ShortLink

↓

Click

Relationships

User

1

↓

Many

ShortLink

↓

1

↓

Many

Click

Analytics are based on Click records.

---

# Phase 6 — Google Authentication

Anonymous users can:

- redirect URLs

Authenticated users can:

- create URLs
- list URLs
- analytics
- delete URLs

Decision:

Creation requires authentication.

Redirection does not.

Reason:

Public URL shorteners should not require login to redirect.

---

# JWT Authentication

Google login exchanges identity for JWT.

Subsequent requests use:

Authorization:

Bearer TOKEN

JWT secret stored in environment.

Never hardcoded.

---

# Phase 7 — URL Shortener

Creation flow

Request

↓

Validate

↓

Generate short code

↓

Check uniqueness

↓

Persist

↓

Return short URL

Custom aliases supported.

Collision prevention implemented.

---

# Expiration Support

Short URLs may expire.

Redirect validates expiration.

Expired links return HTTP 410.

Decision:

410 Gone is semantically correct.

---

# Analytics

Each redirect normally writes:

Click

containing

- IP
- User Agent
- Timestamp

Analytics endpoint aggregates Clicks.

---

# Phase 8 — Redis Cache

Problem

Every redirect queried PostgreSQL.

High traffic would overload database.

Decision

Introduce Redis.

Architecture

Redirect

↓

Redis GET

↓

Cache Hit?

YES

↓

Return

NO

↓

PostgreSQL

↓

Redis SET

↓

Return

---

Cache Key

shortlink:{shortCode}

TTL configurable.

---

Environment Variable

REDIS_CACHE_ENABLED

Purpose

Enable or disable caching.

Important

Application must continue functioning when cache disabled.

---

Engineering Decision

Redis is an optimization.

Never a source of truth.

PostgreSQL remains authoritative.

---

Cache Invalidation

Deleting a URL

↓

Delete PostgreSQL

↓

Delete Redis key

Failure to invalidate cache causes stale redirects.

---

# Phase 9 — Benchmark Mode

Problem

Benchmarks created thousands of Click rows.

Results became meaningless.

Decision

Introduce

BENCHMARK_MODE

When enabled

Do NOT write analytics.

Redirect performance only measures:

- cache
- database
- application

Not write amplification.

---

Edge Case

Future contributors must never remove BENCHMARK_MODE.

Benchmark numbers depend on it.

---

# Phase 10 — Redis-backed Rate Limiting

Initial thought

Memory store.

Rejected.

Reason

Memory store fails with multiple application replicas.

Decision

Redis-backed rate limiting.

Benefits

Shared across replicas.

Production-ready.

Horizontal scaling compatible.

---

Redis Keys

Rate limiting introduces keys such as

rl:::/56

These are expected.

Do not confuse them with cache keys.

---

# Phase 11 — Benchmarking

Tool

autocannon

Benchmark scenarios

1.

Redis disabled

↓

PostgreSQL only

2.

Redis enabled

↓

Cache warm

3.

Redis flushed

↓

Cold cache

Goal

Measure latency

Requests/sec

Throughput

---

Observed behavior

Cold cache

↓

One PostgreSQL read

↓

Redis populated

↓

Subsequent requests

↓

Redis hit

This validated cache correctness.

---

# Phase 12 — Docker

Reason

Consistent runtime.

Application packaged independently.

Benefits

Works identically on every machine.

---

Initial Dockerfile

Single-stage build.

Worked correctly.

Image size

~942 MB

Rejected.

---

Improved Dockerfile

Multi-stage build.

Non-root execution.

Production dependencies only.

Final image

~636 MB

Decision

Use multi-stage builds going forward.

---

Non-root User

Container runs as

node

Never root.

Security improvement.

---

# Docker Compose

Purpose

Run locally

Services

Application

↓

PostgreSQL

↓

Redis

All networking internal.

Application references

postgres

redis

instead of localhost.

---

Health Check

Health endpoint

/api/v1/health

Used to verify

- application
- database connectivity

---

# Phase 13 — Kubernetes

Purpose

Demonstrate orchestration.

Namespace

url-shortener

Resources

Deployment

Service

ConfigMap

Secret

PVC

HPA

Ingress

---

Deployment Strategy

PostgreSQL

1 replica

Redis

1 replica

Application

2 replicas

Reason

Demonstrate horizontal scaling.

---

Service Type

ClusterIP

Reason

Internal communication.

Local development uses

kubectl port-forward

instead of LoadBalancer.

---

ConfigMap

Contains

- BASE_URL
- DATABASE_URL (non-secret pieces if applicable)
- REDIS_URL
- feature flags

---

Secret

Contains

- JWT_SECRET
- GOOGLE_CLIENT_ID

Secrets never committed.

---

Persistent Volume

PostgreSQL data stored in PVC.

Deleting deployment should not remove data.

Deleting namespace may remove PVC depending on StorageClass.

Use caution.

---

# Metrics Server

Initially missing.

Result

kubectl top

failed.

HPA showed

cpu:

<unknown>

Solution

Install Metrics Server.

Patch

--kubelet-insecure-tls

After installation

kubectl top

worked.

HPA became functional.

---

# Horizontal Pod Autoscaler

Configuration

Minimum replicas

2

Maximum replicas

5

Target CPU

70%

Observed

Autocannon

↓

CPU increased

↓

HPA

↓

Replica count increased

2

↓

3

Autoscaling validated successfully.

---

# Ingress

Ingress manifest created.

Development continued using

kubectl port-forward

Decision

Port forwarding is simpler for local development.

Ingress remains available for future production deployment.

---

# Operational Scripts

Scripts introduced

start-k8s.sh

stop-k8s.sh

status-k8s.sh

Purpose

Avoid remembering kubectl commands.

Scale workloads instead of deleting them.

---

Engineering Decision

Scaling to zero preferred over deleting namespace.

Reasons

- preserves PVC
- preserves ConfigMaps
- preserves Secrets
- preserves Services
- much faster startup

Workflow

Morning

↓

Enable Kubernetes

↓

start-k8s.sh

↓

port-forward

Evening

↓

Ctrl+C

↓

stop-k8s.sh

↓

Disable Kubernetes

↓

Quit Docker Desktop

---

# Important Lessons Learned

Redis cache appearing empty usually indicates one of:

- cache disabled
- cache expired
- application never reached Redis
- wrong Redis namespace
- redirect never executed

---

302 responses are expected.

Autocannon reports them as non-2xx.

This is not an application failure.

---

Kubernetes ClusterIP services are NOT externally reachable.

Use:

kubectl port-forward

for local development.

---

Docker Desktop may show multiple application containers.

This is expected.

Replica count equals Pod count.

Pods contain containers.

Deployment replicas determine container count.

---

Metrics Server installation may require waiting for rollout before HPA begins reporting CPU utilization.

This behavior is expected.

---

Never benchmark through a broken network path.

Always verify

/api/v1/health

before running autocannon.

---

Never benchmark with analytics enabled.

Enable

BENCHMARK_MODE=true

for reproducible measurements.

---

This architecture is now considered Version 1.

Future enhancements should extend this design rather than replacing it.

---

# 3. Repository Structure & Module Responsibilities

This section documents every important directory and file in the repository.

Future contributors should read this section before modifying the codebase.

---

# Repository Layout

```
url-shortener/

benchmarks/
docs/
k8s/
prisma/
scripts/
src/

Dockerfile
docker-compose.yml
package.json
tsconfig.json
README.md
```

Each directory has a single responsibility.

Do not mix responsibilities.

---

# benchmarks/

Purpose

Contains all benchmark-related artifacts.

Examples

- benchmark.sh
- commands.md
- postgres.md

Responsibilities

- benchmark commands
- benchmark methodology
- benchmark documentation

Should NEVER contain application code.

Likely to Change

Medium

---

# docs/

Purpose

Project documentation.

Current documents

- MEMORY.md
- KUBERNETES.md

Future documents

- API.md
- ARCHITECTURE.md
- DEPLOYMENT.md

Likely to Change

High

---

# k8s/

Purpose

Entire Kubernetes deployment.

Contains

Namespace

↓

ConfigMap

↓

Secret

↓

PostgreSQL

↓

Redis

↓

Application

↓

Ingress

↓

HPA

Each resource is isolated.

Never merge all manifests into one file.

Likely to Change

Medium

---

# prisma/

Purpose

Database schema.

Contains

schema.prisma

migrations/

Responsibilities

- schema definition
- migrations

Never manually edit generated Prisma Client.

Likely to Change

Medium

---

# scripts/

Purpose

Operational helpers.

Current scripts

- start-k8s.sh
- stop-k8s.sh
- status-k8s.sh

Future

- redeploy.sh

These scripts should remain idempotent.

Likely to Change

Medium

---

# src/

Contains all application code.

No infrastructure manifests belong here.

---

# src/app.ts

Purpose

Express application initialization.

Responsibilities

- middleware
- routes
- error handling

Should NEVER contain business logic.

Likely to Change

Low

---

# src/server.ts

Purpose

Application entry point.

Responsibilities

- start Express
- connect Redis
- health startup logs

Should remain extremely small.

Likely to Change

Low

---

# src/config/

Purpose

Configuration.

Contains

env.ts

Responsibilities

- validate environment variables
- expose typed config

Must fail fast.

Likely to Change

Medium

---

# src/errors/

Contains

AppError

Purpose

Custom application exceptions.

Future

Global error types may be added.

Likely to Change

Low

---

# src/lib/

Contains

prisma.ts

redis.ts

logger.ts

Responsibilities

Initialize external services.

Should NEVER contain business logic.

Likely to Change

Medium

---

# src/middleware/

Contains

authentication

rate limiting

error handler

Responsibilities

Cross-cutting concerns.

Middleware must never query business data directly.

Likely to Change

Medium

---

# src/routes/

Purpose

Route registration.

Responsibilities

Map endpoints to controllers.

No business logic.

Likely to Change

Low

---

# src/utils/

Contains

Pure helper functions.

Example

generateShortCode()

Rules

No Prisma

No Redis

No Express

Pure functions only.

Likely to Change

Medium

---

# src/modules/

Every business feature lives here.

Current modules

auth/

url/

Future modules

admin/

qr/

billing/

notifications/

Every module should follow the same structure.

```
module/

controller.ts

service.ts

repository.ts

schema.ts

types.ts

routes.ts

constants.ts
```

Never violate this structure.

---

# Auth Module

Purpose

Google OAuth

JWT

Responsibilities

- login
- callback
- JWT generation

Dependencies

- Google OAuth
- JWT
- Prisma

Likely to Change

Medium

Future

- refresh tokens
- logout
- email verification

---

# URL Module

Purpose

Core business module.

Responsibilities

- create URL
- redirect
- analytics
- delete
- list

Dependencies

- Redis
- Prisma
- Auth

Highest complexity module.

Likely to Change

Very High

Future features should extend this module.

---

# url/controller.ts

Responsibilities

Receive HTTP requests.

Validate.

Call service.

Return response.

Must remain thin.

Never move business logic here.

---

# url/service.ts

This is the heart of the application.

Responsibilities

- business rules
- Redis cache
- analytics
- benchmark mode
- expiration
- redirects

Most future work will modify this file.

Likely to Change

Very High

---

# url/repository.ts

Responsibilities

Prisma only.

Contains database queries.

No business logic.

Likely to Change

Medium

---

# url/schema.ts

Purpose

Zod validation.

Every request should validate here.

Likely to Change

Medium

---

# url/types.ts

Purpose

Shared DTOs.

Avoid duplicated interfaces elsewhere.

Likely to Change

Medium

---

# url/constants.ts

Purpose

Module constants.

Examples

TTL

Cache prefix

Short code length

Avoid magic numbers.

Likely to Change

Low

---

# Files Most Likely To Change

Very High

- url/service.ts
- README.md
- MEMORY.md

High

- repository.ts
- schema.ts
- routes.ts
- KUBERNETES.md

Medium

- env.ts
- redis.ts
- prisma.ts
- middleware

Low

- server.ts
- app.ts
- Dockerfile

Very Low

- migrations
- benchmark history

---

# Extension Points

When adding features

QR Codes

↓

Create new module

↓

Reuse URL service

---

Admin Dashboard

↓

New module

↓

Reuse repositories

---

Email Notifications

↓

notifications/

↓

Do not modify URL service unnecessarily.

---

Custom Domains

↓

Modify redirect logic

↓

Preserve cache abstraction.

---

OpenTelemetry

↓

middleware

↓

logger

↓

Avoid touching business logic.

---

Prometheus

↓

new metrics middleware

↓

No controller changes.

---

Kafka

↓

event publisher

↓

Called from services

↓

Never repositories.

---

Redis Cluster

↓

replace redis.ts

↓

Business logic unchanged.

---

Multi-region

↓

configuration

↓

cache abstraction

↓

repository abstraction

Service layer should remain unchanged.

---

# Files Future AI Should Read First

When starting work:

1.

MEMORY.md

2.

README.md

3.

url/service.ts

4.

env.ts

5.

docker-compose.yml

6.

k8s/

Reading these files first preserves architectural consistency.

---

# Files Future AI Should Avoid Editing Unless Necessary

- migrations/
- generated Prisma client
- benchmark history

Changes here may break reproducibility.

---

# Engineering Rule

Every new feature should answer:

Can this be implemented without violating

Controller

↓

Service

↓

Repository

If the answer is "no",

the design should be reconsidered.

---

# 4. Runtime Architecture, API Design & Operational Knowledge

This section documents the runtime behavior of the application.

Unlike previous sections, this chapter focuses on **how the application behaves after it starts**, rather than how the repository is organized.

---

# Application Startup Sequence

Current startup order:

```
Node Process

↓

Load .env

↓

Validate Environment Variables (Zod)

↓

Initialize Prisma

↓

Initialize Redis Client

↓

Create Express App

↓

Register Middleware

↓

Register Routes

↓

Register Error Handler

↓

Start HTTP Server
```

If any required environment variable is missing, startup must fail immediately.

---

# Environment Variables

The following environment variables are considered part of the public architecture.

Changing their meaning requires updating this document.

---

## NODE_ENV

Purpose

Application mode.

Supported values

- development
- test
- production

Effects

- logging
- Prisma query logging
- diagnostics

---

## PORT

Purpose

Express server port.

Default

3000

---

## BASE_URL

Purpose

Construct returned short URLs.

Example

```
https://short.example.com
```

Never hardcode URLs elsewhere.

---

## DATABASE_URL

Purpose

Prisma PostgreSQL connection.

Used only by Prisma.

---

## REDIS_URL

Purpose

Redis connection string.

Used only by redis.ts.

---

## REDIS_CACHE_ENABLED

Purpose

Enable or disable Redis caching.

true

```
Redirect

↓

Redis

↓

PostgreSQL on cache miss
```

false

```
Redirect

↓

PostgreSQL only
```

Application behavior must remain identical.

Only performance changes.

---

## BENCHMARK_MODE

Purpose

Disable analytics writes during benchmarking.

Reason

Click inserts distort benchmark numbers.

When enabled

Redirects

↓

NO Click insertion

↓

Benchmark only cache/database performance

Never remove.

---

## JWT_SECRET

Purpose

JWT signing.

Required.

Application intentionally crashes if missing.

---

## JWT_EXPIRES_IN

Purpose

JWT lifetime.

---

## GOOGLE_CLIENT_ID

Purpose

Google OAuth verification.

---

## LOG_LEVEL

Purpose

Logging verbosity.

---

# HTTP Request Lifecycle

Normal request

```
HTTP Request

↓

Express

↓

Middleware

↓

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Controller

↓

Response
```

Redis requests bypass PostgreSQL when possible.

---

# Authentication Flow

```
Google Login

↓

Google verifies identity

↓

Application creates JWT

↓

JWT returned

↓

Client stores token

↓

Subsequent requests

Authorization: Bearer TOKEN

↓

Authentication middleware

↓

req.user

↓

Controllers
```

Controllers never parse JWT manually.

---

# Redirect Flow

Most important runtime path.

Current implementation

```
Incoming shortCode

↓

Redis enabled?

↓

NO

↓

PostgreSQL

↓

Redirect

------------------------

YES

↓

Redis GET

↓

Hit?

↓

YES

↓

Redirect

↓

NO

↓

PostgreSQL

↓

Redis SET

↓

Redirect
```

---

# Cache Design

Current cache key

```
shortlink:{shortCode}
```

TTL

Configured in

url/constants.ts

---

## Cache Contents

Each cached object contains

```
id

originalUrl

expiresAt
```

Only necessary fields.

Avoid caching unnecessary database columns.

---

## Cache Invalidation

Current invalidation occurs on

Delete URL

↓

Delete PostgreSQL

↓

Delete Redis key

Future update endpoints must also invalidate cache.

---

# Analytics Flow

Normal mode

```
Redirect

↓

Create Click

↓

Return Redirect
```

Benchmark mode

```
Redirect

↓

Skip Click

↓

Return Redirect
```

---

# Rate Limiting

Architecture

```
Client

↓

express-rate-limit

↓

Redis Store

↓

Allow?

↓

YES

↓

Controller

↓

NO

↓

429 Too Many Requests
```

Reason Redis store chosen

Multiple application replicas.

Memory store would not synchronize counters.

---

# Health Endpoint

Endpoint

```
GET /api/v1/health
```

Purpose

Verify

- Express
- PostgreSQL
- Kubernetes readiness

Used by

- Docker
- Kubernetes
- Developers

Future enhancements

May include

- Redis status
- Version
- Git SHA
- Uptime

---

# Error Handling Strategy

Application uses centralized error handling.

Flow

```
Throw AppError

↓

Express Error Middleware

↓

HTTP Response
```

Controllers should never manually build error responses.

---

# Logging Strategy

Current logging

Pino

Startup

Redis

Health

Errors

Future

Structured JSON logs.

OpenTelemetry integration possible.

---

# Database Model

Current relationships

```
User

1

↓

Many

ShortLink

1

↓

Many

Click
```

No circular relationships.

---

# URL Ownership

Every ShortLink belongs to exactly one User.

Analytics require ownership verification.

Anonymous users never access analytics.

---

# URL Deletion

Current process

```
Verify Owner

↓

Delete Redis Cache

↓

Delete PostgreSQL

↓

Return 204
```

Changing order may introduce stale cache.

---

# Expiration Logic

Current behavior

```
Expired?

↓

YES

↓

410 Gone

↓

NO

↓

Redirect
```

Never redirect expired URLs.

---

# Benchmark Methodology

Three benchmark modes

---

## Mode 1

Redis disabled

Measures

Pure PostgreSQL performance.

---

## Mode 2

Redis enabled

Cold cache.

Measures

Initial database read.

Redis population.

---

## Mode 3

Warm cache.

Measures

Redis-only redirect performance.

---

Expected sequence

```
Redis MISS

↓

Database

↓

Redis SET

↓

Redis HIT

↓

Redis HIT

↓

Redis HIT
```

---

# Kubernetes Runtime

Current namespace

```
url-shortener
```

Current deployments

- postgres
- redis
- url-shortener

Current services

- postgres
- redis
- url-shortener

---

# HPA Behavior

Configured

Minimum

2 replicas

Maximum

5 replicas

Target

70% CPU

Observed during testing

```
2 replicas

↓

CPU exceeded target

↓

3 replicas

↓

Load removed

↓

Eventually returned to 2 replicas
```

This behavior validated successful autoscaling.

---

# Operational Workflow

Morning

```
Docker Desktop

↓

Enable Kubernetes

↓

start-k8s.sh

↓

Port Forward

↓

Development
```

Evening

```
Ctrl+C

↓

stop-k8s.sh

↓

Disable Kubernetes

↓

Quit Docker Desktop
```

Preferred over deleting namespace.

---

# Common Failure Modes

## JWT_SECRET missing

Symptoms

Application crashes during startup.

Cause

Secret missing.

Fix

Update Kubernetes Secret.

---

## Redis not connected

Symptoms

Redis cache disabled.

Cause

Docker stopped.

Wrong REDIS_URL.

Fix

Start Redis.

Verify redis.ts.

---

## HPA shows <unknown>

Cause

Metrics Server missing.

Fix

Install Metrics Server.

Verify

```
kubectl top pods
```

---

## Redirect returns 404

Possible causes

- URL does not exist
- Wrong PostgreSQL instance
- Fresh Kubernetes deployment

---

## Cache appears empty

Possible causes

- Cache disabled
- First request not executed
- TTL expired
- Wrong Redis instance

Verify

```
redis-cli KEYS "*"
```

or

```
docker exec -it <redis-container> redis-cli
```

---

## Docker shows multiple application containers

Expected.

Reason

Deployment replicas > 1.

Not a bug.

---

## Google OAuth fails

Possible causes

- Invalid Client ID
- Missing environment variable
- Redirect URI mismatch
- JavaScript origin mismatch

---

# Assumptions Future Contributors Must Preserve

Controllers remain thin.

Repositories remain database-only.

Redis remains an optimization.

PostgreSQL remains source of truth.

Environment variables remain validated with Zod.

Redis cache must always be invalidated after destructive operations.

BENCHMARK_MODE must continue disabling analytics writes.

Authentication required for create, delete, list and analytics.

Authentication NOT required for redirects.

---

# Files Most Sensitive To Architectural Changes

Highest Risk

- url/service.ts
- auth/service.ts
- middleware/rate-limit.ts
- redis.ts
- env.ts

Changes here affect multiple systems.

Modify cautiously.

---

End of Runtime Architecture.

---

# 5. Future Roadmap

The Version 1 backend is considered complete.

Future work should focus on improving the user experience and deploying the application publicly rather than introducing additional backend complexity.

The project intentionally avoids adding technologies that do not provide meaningful value.

---

# Current Version

Status

✅ Backend Complete

Implemented

- REST API
- Authentication
- URL Shortening
- Analytics
- Redis Cache
- Rate Limiting
- Benchmarking
- Docker
- Docker Compose
- Kubernetes
- Horizontal Pod Autoscaler

Current architecture should remain the foundation for all future work.

---

# Next Major Milestone

Version 2

Frontend Application

Goal

Build a modern responsive frontend that consumes the existing REST API.

The backend should require minimal changes.

The frontend should be a separate application.

---

## Planned Frontend Stack

Preferred

- React
- TypeScript
- Vite

Possible UI Libraries

- Tailwind CSS
- shadcn/ui

Authentication

Reuse existing Google OAuth backend.

Frontend should simply consume JWT returned by the backend.

---

## Planned Frontend Features

Landing Page

- Project introduction
- Hero section
- Call-to-action
- Sign in with Google

Dashboard

Authenticated users should be able to:

- Create short URLs
- Use custom aliases
- Set expiration dates
- Copy generated URLs
- Delete URLs
- View analytics

Analytics

Display

- Total clicks
- Recent clicks
- Created date
- Expiration
- Original URL

Future charts may visualize click history.

Profile

Display

- User information
- Logout

Responsive Design

Frontend should support

- Desktop
- Tablet
- Mobile

---

# API Compatibility

The backend API should remain backward compatible.

Avoid changing endpoint contracts unnecessarily.

Frontend should consume the existing API without requiring architectural changes.

---

# Deployment

The next major objective is a public deployment.

Preferred architecture

Frontend

↓

Hosting Platform

↓

Backend API

↓

PostgreSQL

↓

Redis

Deployment providers may change over time.

Current preferred options

Frontend

- Vercel
- Netlify

Backend

- Railway
- Render
- Fly.io

Database

- Neon
- Supabase PostgreSQL
- Railway PostgreSQL

Redis

- Upstash Redis
- Railway Redis

The exact provider is less important than preserving the current architecture.

---

# Deployment Principles

Application should remain stateless.

Database should remain external.

Redis should remain external.

Environment variables should continue to configure the application.

Docker support should be preserved.

Kubernetes manifests should remain available as the reference production deployment.

---

# Version 2 Success Criteria

Backend

No architectural regressions.

Frontend

Professional user experience.

Deployment

Publicly accessible.

Authentication

Google OAuth functional.

Database

Persistent.

Redis

Functional.

Health endpoint

Operational.

Docker

Still builds successfully.

Kubernetes

Still deploys successfully.

---

# Intentional Non-Goals

The project intentionally does not plan to add

- Kafka
- RabbitMQ
- Elasticsearch
- GraphQL
- Microservices
- Event Sourcing
- CQRS

Reason

The project already demonstrates strong backend engineering practices.

Additional infrastructure would increase complexity without improving the primary learning objectives.

Future enhancements should prioritize usability over additional technologies.

---

# Maintenance Checklist

Before implementing any future feature

- Preserve Controller → Service → Repository architecture.
- Preserve Prisma repository abstraction.
- Preserve Redis cache abstraction.
- Preserve Zod validation.
- Preserve environment-based configuration.
- Preserve Docker compatibility.
- Preserve Kubernetes manifests.
- Update MEMORY.md for any architectural change.
- Update README.md if setup or behavior changes.

---

# Code Review Checklist

Every pull request should verify

- Business logic is not added to controllers.
- Database access remains inside repositories.
- New environment variables are validated in env.ts.
- Redis cache invalidation is considered.
- Benchmark mode behavior is preserved.
- Docker image still builds.
- Kubernetes manifests remain valid.
- Existing API contracts are not broken.

---

# Project Completion Summary

Version 1 demonstrates

- Clean Architecture
- Layered Backend Design
- Authentication
- Database Modeling
- Caching
- Performance Optimization
- Benchmarking
- Containerization
- Container Orchestration
- Horizontal Scaling

Future work should improve presentation and accessibility rather than fundamentally changing the backend architecture.

This document should continue evolving alongside the project.

Every significant engineering decision should be appended rather than replacing previous decisions, preserving the historical context of the system.

---

# 6. Version 2 Frontend & Public Free Deployment Decision

Date

2026-07-05

Status

Implemented

---

# Objective

Version 2 adds a modern frontend and a public free deployment strategy while preserving the Version 1 backend architecture.

The backend remains stable and production-ready.

No backend controller, service, repository, Prisma, Redis, Docker, Docker Compose, or Kubernetes architecture was redesigned.

---

# Frontend Architecture

Decision

Create a separate frontend application under

```
frontend/
```

Reason

The frontend is a client application and should not be mixed into backend modules.

The backend remains an Express REST API.

The frontend consumes the existing API instead of changing backend contracts.

---

# Frontend Stack

Selected stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style local components
- lucide-react icons

Reason

This stack provides a modern, maintainable, accessible frontend while keeping complexity low.

Vite was selected for fast local development and static production builds.

Tailwind CSS and shadcn/ui-style components were selected for a polished SaaS interface without introducing a heavy component framework.

---

# Frontend Responsibilities

The frontend owns:

- Landing page
- Google login UI
- Authenticated dashboard
- Create URL form
- Custom alias input
- Expiration date input
- Copy short URL action
- Delete URL action
- My URLs view
- Analytics view
- User profile view
- JWT storage in browser local storage
- REST API consumption

The frontend does NOT own:

- authentication verification
- JWT signing
- URL creation business logic
- alias collision logic
- expiration enforcement
- analytics persistence
- Redis cache decisions
- rate limiting

Those remain backend responsibilities.

---

# Authentication Integration

Frontend flow:

```
Google Identity Services

↓

Google ID token

↓

POST /api/v1/auth/google

↓

Backend verifies Google token

↓

Backend returns application JWT

↓

Frontend stores JWT

↓

Authenticated API requests use Authorization: Bearer TOKEN
```

Decision

The frontend does not implement its own authentication backend.

It reuses the existing Google OAuth and JWT flow.

Reason

The backend authentication architecture is already complete and should remain the source of truth.

---

# API Compatibility

The frontend consumes these existing endpoints:

```
POST /api/v1/auth/google
GET /api/v1/urls
POST /api/v1/urls
DELETE /api/v1/urls/:id
GET /api/v1/urls/:id/analytics
GET /:shortCode
```

No backend API contract changes were required for Version 2 frontend implementation.

This preserves Version 1 compatibility.

---

# Frontend Configuration

Frontend configuration uses Vite environment variables:

```
VITE_API_BASE_URL
VITE_GOOGLE_CLIENT_ID
```

These are separate from backend environment variables.

Reason

Browser-visible configuration must be explicitly prefixed with `VITE_`.

Secrets must never be placed in frontend environment variables.

Google Client ID is safe to expose.

JWT secret remains backend-only.

---

# Public Free Deployment Strategy

Selected providers:

Frontend

```
Netlify Free
```

Backend

```
Render Free Web Service
```

PostgreSQL

```
Neon Free
```

Redis

```
Upstash Redis Free
```

---

# Provider Rationale

Netlify Free was selected for frontend hosting because the frontend is a static Vite application and Netlify supports long-lived free static deployments with HTTPS and environment variables.

Render Free Web Service was selected for the backend because it supports Node.js web services, HTTPS, environment variables, repository deploys, and free web instances suitable for personal portfolio projects.

Neon Free was selected for PostgreSQL because it provides a sustainable free PostgreSQL tier with no time limit and no credit card requirement.

Upstash Redis Free was selected because Redis is an optimization in this architecture and the free tier is sufficient for cache and rate-limiting usage in a personal deployment.

---

# Rejected Deployment Alternatives

Railway was rejected because its free offering is a 30-day trial that transitions to a paid monthly plan.

Fly.io was rejected because the current public pricing model is not a clean forever-free no-card option for new users.

Render Postgres Free was rejected because free databases expire after 30 days, which violates the long-term sustainability requirement.

Paid VPS providers were rejected because they violate the zero-cost constraint.

---

# Deployment Architecture

```
Browser

↓

Netlify Static Frontend

↓

Render Express API

├── Neon PostgreSQL

└── Upstash Redis
```

This deployment is an additional public target.

It does not replace Docker, Docker Compose, or Kubernetes.

Kubernetes remains the production-reference orchestration architecture.

Docker support remains required.

---

# Version 2 Files Added

```
frontend/
docs/DEPLOYMENT.md
```

README.md was updated with frontend and deployment instructions.

MEMORY.md was appended with this decision.

---

# Preservation Rules After Version 2

Future frontend work should prefer adapting to the existing REST API.

Backend API changes require strong justification.

Business logic must remain in backend services.

Repositories remain database-only.

Controllers remain thin.

Redis remains an optimization.

PostgreSQL remains the source of truth.

Frontend environment variables must not contain secrets.

Treat this project as a production-grade engineering portfolio. Favor incremental improvements over rewrites, preserve architectural consistency, and keep the repository easy for future contributors to understand.
