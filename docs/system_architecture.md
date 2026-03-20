# DandoEv — System Architecture & Backend Infrastructure Plan

> **Version:** 1.0 · **Date:** 2026-03-20
> **Status:** DRAFT — Pending stakeholder review

---

## 1. Executive Summary

DandoEv is a Nigerian e-bike marketplace with a BNPL (Buy Now, Pay Later) financial pipeline. The current codebase is a **Next.js 16 frontend with a flat-file JSON database** and minimal API routes. This document defines the **production-grade backend architecture** required to support payment processing, financial compliance, and operational resilience.

### Critical Gaps in Current Implementation

| Area | Current State | Required State |
|---|---|---|
| Database | Flat-file `db.json` | PostgreSQL with Prisma ORM |
| Auth tokens | Single JWT, 7-day, hardcoded secret | Access + Refresh token pair, env secrets |
| Rate limiting | None | Per-endpoint throttling |
| Input validation | None | Zod schemas on all routes |
| Webhooks | None | Paystack/Flutterwave webhook handler |
| Queue system | None | BullMQ + Redis |
| Idempotency | None | Idempotency keys on all mutations |
| Reconciliation | None | Scheduled reconciliation jobs |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│         Next.js Web App  ·  React Native Mobile App          │
└──────────────┬───────────────────────────┬───────────────────┘
               │ HTTPS only               │
               ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     API GATEWAY / EDGE                       │
│  • TLS termination   • Rate limiter   • CORS                 │
│  • Request ID injection   • IP filtering                     │
└──────────────┬───────────────────────────┬───────────────────┘
               │                          │
      ┌────────▼────────┐       ┌─────────▼─────────┐
      │  AUTH LAYER      │       │  WEBHOOK INGRESS   │
      │  JWT verify      │       │  Signature verify  │
      │  RBAC middleware │       │  Event dedup       │
      └────────┬─────────┘       └─────────┬─────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   APPLICATION SERVICES                       │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ User Svc │ │ Bike Svc │ │ Order Svc │ │ BNPL/Loan Svc │  │
│  └──────────┘ └──────────┘ └───────────┘ └───────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ KYC Svc  │ │ Pay Svc  │ │ Notif Svc │ │ Savings Svc   │  │
│  └──────────┘ └──────────┘ └───────────┘ └───────────────┘  │
└──────────────┬───────────────────────────┬───────────────────┘
               │                           │
    ┌──────────▼──────────┐     ┌──────────▼──────────┐
    │     PostgreSQL      │     │   Redis / BullMQ    │
    │  (Primary Store)    │     │  (Cache + Queues)   │
    └─────────────────────┘     └─────────────────────┘
```

---

## 3. Technology Stack Decisions

| Layer | Technology | Rationale |
|---|---|---|
| Runtime | Node.js 20 LTS | Stable, Next.js native |
| Framework | Next.js 16 (App Router) | Already in use, API Routes serve as backend |
| Database | **PostgreSQL 16** | ACID transactions, JSONB, Nigerian fintech standard |
| ORM | **Prisma 6** | Type-safe queries, migrations, schema-first |
| Cache / Queues | **Redis 7 + BullMQ** | Job queues, rate limiting, caching |
| Auth | **JWT (access + refresh)** | Stateless auth with rotation |
| Validation | **Zod** | Runtime schema validation, TypeScript-native |
| Payment Gateway | **Paystack** (primary) | Nigerian market leader, Naira-native |
| File Storage | **AWS S3 / Cloudinary** | KYC documents, bike images |
| Monitoring | **Sentry + Pino logger** | Error tracking + structured logging |
| Hosting | **Vercel** (app) + **Railway/Render** (DB/Redis) | Serverless edge + managed services |

---

## 4. Database Design

### 4.1 Migration from Flat-File to PostgreSQL

The existing `docs/schema.md` already defines the correct PostgreSQL schema. We will codify it using **Prisma** migrations.

### 4.2 New Tables Required

In addition to the existing schema tables (`users`, `bikes`, `orders`, `loans`, `repayments`, `guarantors`, `kyc_documents`, `audit_logs`, `notifications`), the following new tables are needed:

#### `refresh_tokens`
| Column | Type | Purpose |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | Owner |
| token_hash | VARCHAR(255) | bcrypt hash of refresh token |
| expires_at | TIMESTAMPTZ | Expiration |
| revoked | BOOLEAN | Rotation invalidation |
| family_id | UUID | Token family for reuse detection |
| created_at | TIMESTAMPTZ | |

#### `idempotency_keys`
| Column | Type | Purpose |
|---|---|---|
| id | UUID PK | |
| key | VARCHAR(255) UNIQUE | Client-provided idempotency key |
| user_id | UUID FK → users | Scoped to user |
| endpoint | VARCHAR(255) | Route path |
| response_code | INT | Stored response status |
| response_body | JSONB | Stored response body |
| created_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | TTL (24 hours) |

#### `webhook_events`
| Column | Type | Purpose |
|---|---|---|
| id | UUID PK | |
| provider | VARCHAR(50) | `paystack`, `flutterwave` |
| event_type | VARCHAR(100) | `charge.success`, etc. |
| event_id | VARCHAR(255) UNIQUE | Provider's event ID (dedup) |
| payload | JSONB | Raw webhook body |
| status | ENUM | `received`, `processing`, `processed`, `failed` |
| retry_count | INT DEFAULT 0 | |
| error_message | TEXT | Last error |
| processed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

#### `payment_transactions`
| Column | Type | Purpose |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| order_id | UUID FK nullable | |
| loan_id | UUID FK nullable | |
| repayment_id | UUID FK nullable | |
| provider | VARCHAR(50) | `paystack` |
| provider_ref | VARCHAR(255) | Paystack transaction ref |
| amount | DECIMAL(15,2) | |
| currency | VARCHAR(3) DEFAULT 'NGN' | |
| status | ENUM | `initiated`, `pending`, `success`, `failed`, `reversed` |
| idempotency_key | VARCHAR(255) | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `daily_savings`
| Column | Type | Purpose |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| loan_id | UUID FK | |
| date | DATE | The savings day |
| amount | DECIMAL(15,2) DEFAULT 1000 | |
| status | ENUM | `pending`, `collected`, `missed` |
| payment_ref | VARCHAR(255) | |
| created_at | TIMESTAMPTZ | |

#### `rate_limit_log` (optional, Redis-primary)
Used only for persistent analytics; Redis handles real-time enforcement.

---

## 5. Authentication & Security Architecture

### 5.1 Token Strategy

```
Login → Access Token (15 min) + Refresh Token (7 days, httpOnly cookie)

Access Token (JWT):
  - Header: Authorization: Bearer <token>
  - Payload: { sub, email, role, iat, exp }
  - Expiry: 15 minutes
  - Storage: In-memory (client)

Refresh Token:
  - Opaque random string, hashed with bcrypt in DB
  - Expiry: 7 days
  - Storage: httpOnly, Secure, SameSite=Strict cookie
  - Rotated on every use (old token revoked)
  - Family-based reuse detection (if revoked token reused → invalidate entire family)
```

### 5.2 Password Security
- **Hashing:** bcrypt with cost factor 12 (already using bcryptjs)
- **Minimum requirements:** 8 chars, 1 uppercase, 1 number, 1 special
- **Breach checking:** Optional HaveIBeenPwned k-anonymity API check

### 5.3 HTTP Status Codes
- **401 Unauthorized:** Missing/expired/invalid token (identity unknown)
- **403 Forbidden:** Valid token but insufficient role/permissions (identity known, access denied)

### 5.4 Rate Limiting Strategy

| Endpoint Group | Limit | Window | Identifier |
|---|---|---|---|
| `POST /api/auth/signin` | 5 requests | 15 min | IP + email |
| `POST /api/auth/signup` | 3 requests | 1 hour | IP |
| `POST /api/auth/refresh` | 10 requests | 15 min | User ID |
| `POST /api/webhooks/*` | 100 requests | 1 min | IP |
| General API (authenticated) | 60 requests | 1 min | User ID |
| General API (unauthenticated) | 30 requests | 1 min | IP |

**Implementation:** Redis sliding window using `ioredis` + custom middleware.

### 5.5 Input Validation & Sanitization
- **Zod schemas** on every API route for request body, query params, and path params
- **XSS prevention:** HTML entity encoding on all string outputs
- **SQL injection:** Prevented inherently by Prisma parameterized queries
- **HTTPS enforced:** `Strict-Transport-Security` header, redirect HTTP → HTTPS

### 5.6 RBAC Middleware

```typescript
// Middleware chain for protected routes
authenticate(req)          // Verify JWT → attach user to request
  → authorize(['admin'])   // Check role against allowed roles
  → rateLimit('api')       // Apply rate limit tier
  → validateInput(schema)  // Zod schema validation
  → handler(req)           // Route handler
```

---

## 6. Payment & Webhook Infrastructure

### 6.1 Payment Flow (Paystack)

```
1. Client → POST /api/payments/initialize
   - Validate amount, generate idempotency key
   - Create PaymentTransaction (status: initiated)
   - Call Paystack Initialize → get authorization_url
   - Return URL to client

2. Client → Redirect to Paystack checkout

3. Paystack → POST /api/webhooks/paystack  (async)
   - Verify HMAC-SHA512 signature
   - Dedup by event ID in webhook_events table
   - Enqueue to BullMQ payment queue
   - Return 200 immediately

4. Worker processes queue:
   - Verify transaction with Paystack GET /transaction/verify/:ref
   - Update PaymentTransaction status
   - Update Order/Repayment status in DB transaction
   - Trigger notification
```

### 6.2 Webhook Signature Verification

```typescript
function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}
```

### 6.3 Webhook Event Handling

```
POST /api/webhooks/paystack
  │
  ├─ Verify signature → 401 if invalid
  ├─ Parse event type
  ├─ Check webhook_events for event_id → 200 if duplicate
  ├─ Insert into webhook_events (status: received)
  ├─ Enqueue job to BullMQ
  └─ Return 200 OK (within 5 seconds)

BullMQ Worker:
  ├─ charge.success → process payment, update order/loan
  ├─ transfer.success → process disbursement
  ├─ refund.processed → handle refund
  └─ Unknown event → log and skip
```

---

## 7. Queue System & Retry Logic

### 7.1 BullMQ Queues

| Queue | Purpose | Concurrency | Retry |
|---|---|---|---|
| `payment-processing` | Webhook event processing | 5 | 3 retries, exponential backoff |
| `notification` | Email/SMS/Push dispatch | 10 | 3 retries, 30s delay |
| `kyc-verification` | Background KYC checks | 2 | 2 retries |
| `reconciliation` | Scheduled payment reconciliation | 1 | 1 retry |
| `repayment-reminder` | Daily savings & installment reminders | 5 | 2 retries |

### 7.2 Retry Policy

```typescript
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,  // 5s, 25s, 125s
  },
  removeOnComplete: 1000,
  removeOnFail: 5000,
};
```

### 7.3 Dead-Letter Queue (DLQ)

After all retries are exhausted, failed jobs move to a DLQ:
- Stored in `dead_letter_jobs` table with full payload and error stack
- Admin dashboard shows DLQ count with alerts
- Manual retry or acknowledge from admin UI
- Automatic Slack/email alert when DLQ size > 0

---

## 8. Idempotency

### Flow
```
Client includes header: Idempotency-Key: <uuid>

Middleware:
  1. Look up key in idempotency_keys table (scoped to user + endpoint)
  2. If found AND not expired → return stored response (replay)
  3. If not found → execute handler, store response, return
  4. Keys expire after 24 hours (cron cleanup)
```

### Required On
- `POST /api/payments/initialize`
- `POST /api/loans` (BNPL application)
- `POST /api/orders`
- `POST /api/repayments/:id/pay`

---

## 9. Transaction State Machine

### 9.1 Loan Lifecycle

```
pending → under_review → approved → active → completed
                ↓                      ↓
            rejected              defaulted
```

### 9.2 Payment Transaction Lifecycle

```
initiated → pending → success
                ↓
             failed → (retry) → pending
                ↓
            reversed
```

### 9.3 Order Lifecycle

```
pending → confirmed → processing → shipped → delivered
    ↓                                           
 cancelled
```

All state transitions are enforced server-side with allowed-transition maps. Invalid transitions return `409 Conflict`.

---

## 10. Reconciliation

### 10.1 Automated Daily Reconciliation (Cron Job)

| Job | Schedule | Action |
|---|---|---|
| Payment reconciliation | Every 6 hours | Compare `payment_transactions` against Paystack's transaction list API |
| Overdue detection | Daily 00:00 WAT | Mark unpaid repayments past due_date as `overdue`, apply late fee |
| Savings collection | Daily 08:00 WAT | Check daily_savings records, trigger auto-debit |
| Stale transaction cleanup | Daily 02:00 WAT | Mark `initiated` transactions older than 1 hour as `failed` |

### 10.2 Reconciliation Report

Discrepancies are logged to `reconciliation_reports` table and surfaced in admin dashboard with:
- Transactions in Paystack but not in DB (missed webhooks)
- Transactions in DB but not in Paystack (orphaned records)
- Amount mismatches

---

## 11. API Route Structure

```
src/app/api/
├── auth/
│   ├── signup/route.ts          POST - Register
│   ├── signin/route.ts          POST - Login
│   ├── signout/route.ts         POST - Logout (revoke refresh)
│   ├── refresh/route.ts         POST - Rotate refresh token
│   ├── me/route.ts              GET  - Current user profile
│   └── forgot-password/route.ts POST - Password reset flow
├── users/
│   └── [id]/route.ts            GET/PATCH - User profile
├── bikes/
│   ├── route.ts                 GET - List bikes (paginated)
│   └── [id]/route.ts            GET - Bike detail
├── orders/
│   ├── route.ts                 GET/POST - List/Create
│   └── [id]/route.ts            GET/PATCH - Detail/Update status
├── loans/
│   ├── route.ts                 GET/POST - List/Apply
│   ├── [id]/route.ts            GET/PATCH - Detail/Update
│   └── [id]/repayments/route.ts GET - Repayment schedule
├── payments/
│   ├── initialize/route.ts      POST - Start payment
│   └── verify/route.ts          GET  - Verify by reference
├── webhooks/
│   └── paystack/route.ts        POST - Paystack webhook
├── savings/
│   └── route.ts                 GET - User savings balance
├── admin/
│   ├── stats/route.ts           GET - Dashboard stats
│   ├── loans/route.ts           GET - All loan applications
│   ├── loans/[id]/route.ts      PATCH - Approve/Reject
│   ├── users/route.ts           GET - All users
│   ├── orders/route.ts          GET - All orders
│   └── dlq/route.ts             GET/POST - Dead letter queue
└── middleware.ts                 Auth + rate limit + validation
```

---

## 12. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dandoev?sslmode=require

# Redis
REDIS_URL=redis://host:6379

# Auth
JWT_ACCESS_SECRET=<random-64-char>
JWT_REFRESH_SECRET=<random-64-char>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Payment
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# Storage
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# App
NEXT_PUBLIC_APP_URL=https://dandoev.com
NODE_ENV=production
```

---

## 13. New Dependencies Required

```json
{
  "dependencies": {
    "@prisma/client": "^6.x",
    "bullmq": "^5.x",
    "ioredis": "^5.x",
    "zod": "^3.x",
    "pino": "^9.x",
    "pino-pretty": "^11.x"
  },
  "devDependencies": {
    "prisma": "^6.x"
  }
}
```

---

## 14. Implementation Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Set up PostgreSQL + Prisma schema + migrations
- [ ] Implement Zod validation middleware
- [ ] Refactor auth: access/refresh token pair, proper expiry
- [ ] Add rate limiting middleware (Redis)
- [ ] HTTPS enforcement + security headers

### Phase 2 — Payment Infrastructure (Week 3-4)
- [ ] Paystack integration (initialize, verify, webhook)
- [ ] Webhook signature verification + event dedup
- [ ] BullMQ queue setup + payment processing worker
- [ ] Idempotency middleware
- [ ] Payment transaction state machine

### Phase 3 — BNPL Pipeline Hardening (Week 5-6)
- [ ] Loan state machine with server-side enforcement
- [ ] Repayment schedule generation + auto-debit
- [ ] Daily savings tracking system
- [ ] Guarantor verification flow
- [ ] Dead-letter queue + admin DLQ dashboard

### Phase 4 — Reconciliation & Monitoring (Week 7-8)
- [ ] Cron-based reconciliation jobs
- [ ] Overdue detection + late fee application
- [ ] Audit logging on all admin actions
- [ ] Sentry integration + structured logging
- [ ] Admin reconciliation dashboard

---

## 15. Deployment Architecture

```
                    ┌─────────────┐
                    │  Cloudflare  │  DNS + CDN + WAF + DDoS protection
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Vercel    │  Next.js app (Edge + Serverless)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───┐ ┌──────▼──────┐
       │ PostgreSQL  │ │Redis │ │ Cloudinary  │
       │ (Railway)   │ │(Upst)│ │ (Media CDN) │
       └─────────────┘ └──────┘ └─────────────┘
```

---

## 16. Security Checklist

- [x] Passwords hashed with bcrypt (cost 12)
- [ ] HTTPS enforced on all endpoints
- [ ] JWT access token expiry: 15 minutes
- [ ] JWT refresh token: rotated on use, family-based reuse detection
- [ ] Rate limiting on auth endpoints (5 req/15min)
- [ ] 401 vs 403 used correctly per spec
- [ ] Input validated with Zod on all routes
- [ ] Input sanitized (HTML entities, trim, length limits)
- [ ] Webhook signatures verified with timing-safe comparison
- [ ] Sensitive data (BVN, NIN) encrypted at rest (AES-256)
- [ ] CORS restricted to known origins
- [ ] Security headers: HSTS, X-Frame-Options, CSP, X-Content-Type-Options
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] File upload validation (type, size, malware scan)
- [ ] Audit log on all privileged actions
