# Architecture (Checkpoint 1)

Monorepo workspaces:

```text
frontend/   React + Vite + TypeScript + Tailwind + TanStack Query
backend/    Express + TypeScript + Prisma
shared/     Enums and pure status-expiry logic
docs/       Specification and setup notes
```

## Request flow (target)

Browser → `/api/v1/*` Express routes → controllers → services → Prisma repositories → PostgreSQL.

Public QR pages will call `GET /api/v1/qr/:token` in Checkpoint 3. Checkpoint 1 only exposes health and meta.

## Data rules already encoded in the schema

- One `professor_statuses` row per professor (`professor_id` unique).
- `status_history` is append-only.
- QR tokens are unique public identifiers with an `is_active` flag.
- Sessions store a token hash, not a raw secret in the faculty profile.
- Timestamps are UTC (`TIMESTAMP(3)` via Prisma).

## Status model

`shared/src/status.ts` resolves whether a published status is confidently current. Expired values remain readable but are marked stale. Status is self-reported.
