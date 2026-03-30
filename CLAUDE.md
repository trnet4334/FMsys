# FMsys — Claude Code Guidelines

See [README.md](./README.md) for project overview, architecture, and setup commands.

## Testing

- **Framework:** Node.js native `node:test` — do not add Jest, Vitest, or Mocha.
- **Location:** All test files are in `tests/` (not co-located with source files).
- **Naming:** `*.test.js` — keep ES Module syntax (`import`/`export`).
- **Coverage target:** 80%+ across unit, integration, and E2E.
- **No DB required:** Auth and sessions are in-memory; tests run without PostgreSQL.
- **TDD:** Write tests first (RED → GREEN → REFACTOR).

## Code Style

### Backend (`apps/api`, `apps/worker`, `packages/shared`)

- Pure ES Modules (`"type": "module"` in all package.json files).
- No TypeScript — plain JavaScript with JSDoc where helpful.
- No Express, Fastify, or other HTTP frameworks — use Node.js `http` module directly.
- Follow the existing routing pattern in `server.js`: URL-based dispatch with a shared `handleRequest` pattern.
- Prefer named exports over default exports.
- Max ~400 lines per file; extract into focused modules when files grow.

### Frontend (`apps/web`)

- TypeScript strict mode — no `any` types unless absolutely unavoidable.
- App Router only (`app/` directory) — no `pages/` directory additions.
- Tailwind CSS for all styles — no inline styles or separate CSS files unless extending design tokens.
- Design tokens are CSS custom properties defined in `src/styles/tokens.css` and mapped to Tailwind utilities. See `docs/design/color-system.md` for the full token table.
  - Backgrounds: `--bg-0`, `--bg-1`, `--card`, `--line`
  - Text: `--ink-0`, `--ink-1`, `--ink-disabled`
  - Brand & semantic: `--brand`, `--brand-weak`, `--success`, `--danger`, `--info`, `--warn`
  - Geometry: `--radius-lg`, `--radius-md`, `--shadow-soft`
- Components live in `src/components/`; utilities/clients in `src/lib/`.
- Lucide React for icons (`import { IconName } from 'lucide-react'`). Use the `size` prop for sizing.

### All Code

- Immutable patterns — never mutate existing objects; return new copies.
- Handle errors explicitly at every level; never silently swallow exceptions.
- No hardcoded secrets, API keys, or credentials anywhere in source.
- Validate all external inputs at system boundaries.

## Architecture Rules

### Auth Flow

Session states follow a strict machine: `pre_mfa` → `authenticated`.

- `apps/api/src/authService.js` owns all session state transitions.
- `apps/api/src/security.js` owns crypto primitives (JWT, OTP, AES-256).
- Frontend auth logic lives exclusively in `apps/web/src/lib/auth-client.js`.
- Middleware (`apps/web/src/middleware.ts`) enforces route protection; do not add auth logic to page components.

### Data Flow

```
Web → API (auth + analytics) → Worker (async jobs) → Shared (valuation)
                                     ↓
                               PostgreSQL (schema in db/migrations/)
```

- Analytics endpoints in `analyticsRoutes.js` — currently return seed data; future versions will query PostgreSQL.
- Snapshot jobs are enqueued via `POST /api/snapshot/trigger` and processed by the worker.
- All DB queries use parameterized SQL (see `packages/shared/src/snapshotRepository.js` for the pattern).

### Ports — never change without updating CORS

| Service | Port |
|---------|------|
| Web     | 4010 |
| API     | 4020 |

CORS in `apps/api/src/server.js` allows `localhost:4010` and `127.0.0.1:4010` only. Changing either port requires updating both the CORS allowlist and `NEXT_PUBLIC_API_BASE_URL`.

## File Organization

```
apps/api/src/
├── server.js              # Routing entry point — keep lean
├── auth*.js               # Auth domain files
├── analyticsRoutes.js     # Dashboard data endpoints
└── snapshotRoutes.js      # Snapshot trigger

apps/web/src/
├── app/                   # Pages (App Router)
├── components/            # UI components — one component per file
└── lib/                   # Clients and utilities — no React here

packages/shared/src/       # Framework-agnostic business logic only
tests/                     # All test files (mirrors app structure)
```

## Commit Conventions

```
feat|fix|refactor|docs|test|chore: short description
```

Do not include Claude attribution in commits.

## What NOT to Do

- Do not add an ORM (no Prisma, Sequelize, Drizzle) — queries are hand-written parameterized SQL.
- Do not add a mock for PostgreSQL in tests — the in-memory session store is the test boundary.
- Do not store secrets in source files or `.env` committed to the repo.
- Do not use `any` in TypeScript without a comment explaining why.

## Demo & Dev Helpers

- Recovery login: `recovery@fmsys.local` / `recovery-only`
- OAuth mock: pass `code=demo-code` in the callback
- Dev MFA code: `GET /api/v1/auth/dev/mfa-code?sessionId=<id>` (dev only)
- Demo user ID: `demo-user`
