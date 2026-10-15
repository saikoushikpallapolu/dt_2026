# Where Is My Professor?

Mobile-first faculty availability and office-status platform for campus life.

Students scan a permanent office QR code (or search the directory) to see a professor's latest **published** availability. Professors update their own status. Administrators manage offices, faculty assignments, and QR identifiers.

This product reports self-reported status. It does not claim automatic location tracking.

## Status: Complete Implementation (Checkpoints 1 – 7)

The complete product implementation is finished and verified across all phases:
- **Checkpoint 1 (Foundation)**: Monorepo layout, schema, seed accounts, and configuration.
- **Checkpoint 2 (Authentication)**: Secure cookie sessions, role-based authorization (Student, Professor, Admin).
- **Checkpoint 3 (Core MVP)**: Permanent QR placards, atomic status updates, expiry & freshness logic, mobile-first placard page, and printable door signs.
- **Checkpoint 4 (Discovery)**: Searchable faculty directory, campus building/office management, and QR revocation/reissuance.
- **Checkpoint 5 (Student Features)**: Consultation requests, conflict detection, bookmarks/favorites, and posted office hours.
- **Checkpoint 6 (Notifications & Analytics)**: In-app consultation notifications, status history timelines, and aggregate privacy-preserving analytics.
- **Checkpoint 7 (Quality & Tests)**: Automated integration test suite passing (14/14 tests) and end-to-end user workflows.

## Specification

- [Implementation specification and review checkpoints](docs/implementation-specification.md)
- [Local setup](docs/setup.md)
- [Demo accounts](docs/demo-accounts.md)
- [Architecture](docs/architecture.md)

## Quick start

```powershell
copy .env.example .env
copy .env.example backend\.env
copy .env.example frontend\.env
npm install
npm run db:up
npx prisma generate --schema backend/prisma/schema.prisma
npm run db:migrate
npm run db:seed
npm run dev
```

Then open http://localhost:5173 and http://localhost:4000/api/v1/health.

## Planned layout

```text
/frontend
/backend
/shared
/docs
```
