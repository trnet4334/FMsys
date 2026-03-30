# FMsys — Personal Finance Dashboard

A personal finance platform for managing global assets, crypto portfolios, and wealth tracking. Built as a Node.js monorepo with OAuth + MFA authentication, financial snapshots, net-worth tracking, cashflow analysis, and asset allocation management.

## Architecture

```
apps/
├── api/       # Node.js HTTP server (port 4020)
├── web/       # Next.js 15 dashboard (port 4010)
└── worker/    # Async snapshot job processor
packages/
└── shared/    # Shared valuation, repository, and auth contracts
db/
└── migrations/ # PostgreSQL schema migrations
```

The web app calls the API for auth and analytics data. The API enqueues snapshot jobs that the worker processes asynchronously against PostgreSQL.

## Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Frontend    | Next.js, React, TypeScript, Tailwind CSS     |
| Backend     | Node.js (native `http` module), ES Modules   |
| Database    | PostgreSQL 12+                               |
| Auth        | OAuth 2.0 (Google/Apple), TOTP MFA, JWT      |
| Testing     | Node.js native `node:test`                   |
| Monorepo    | npm workspaces                               |

## Prerequisites

- Node.js 18+
- npm 8+
- PostgreSQL 12+ (production only; tests run without a DB)

## Setup

```bash
npm install

npm run api:dev        # http://127.0.0.1:4020
npm run web:dev        # http://127.0.0.1:4010  (separate terminal)

npm run demo:http      # HTTP integration demo
```

Open `http://localhost:4010/login` in your browser.

## Running Tests

```bash
npm test
```

No external services required — sessions and auth are in-memory during tests.

## Demo Accounts

See [CLAUDE.md](./CLAUDE.md) for dev credentials and helper endpoints.

## Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4020  # API base (web)
OAUTH_BASE_URL=                                  # OAuth provider base URL
OAUTH_GOOGLE_CLIENT_ID=                          # OAuth credentials
SESSION_SIGNING_KEY=                             # Session encryption key
MFA_ISSUER=FMsys                                 # TOTP issuer name
FEATURE_AUTH_GATEWAY=true                        # Enable auth system
```

## Key API Endpoints

**Auth (public)**

| Method | Path                          | Description             |
|--------|-------------------------------|-------------------------|
| GET    | `/api/v1/auth/oauth/start`    | Initiate OAuth flow     |
| GET    | `/api/v1/auth/oauth/callback` | OAuth callback          |
| POST   | `/api/v1/auth/recovery/login` | Recovery login          |
| POST   | `/api/v1/auth/mfa/verify`     | Verify TOTP code        |
| GET    | `/api/v1/auth/dev/mfa-code`   | Get MFA code (dev only) |

**Dashboard (authenticated)**

| Method | Path                      | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/net-worth/summary`  | Net worth cards          |
| GET    | `/api/trend`              | Net worth trend series   |
| GET    | `/api/allocation`         | Asset allocation         |
| GET    | `/api/alerts`             | Risk alerts              |
| GET    | `/api/cashflow/budget`    | Cashflow + budget alerts |
| POST   | `/api/snapshot/trigger`   | Enqueue snapshot job     |

## Auth Flow

```
/login → OAuth or Recovery → /mfa (TOTP) → /dashboard
```

Session states: `pre_mfa` → `authenticated`

## Documentation

- `docs/plans/` — Implementation plans and design docs
- `ops/runbooks/` — Operational runbooks (auth rollout, backup/restore)
- `ops/observability/` — Alert rules, monitoring dashboards
- `prototype/` — HTML prototypes for login/MFA UI
- `CLAUDE.md` — Coding conventions and architecture rules for AI assistance
