# Local setup (Checkpoint 1)

## Requirements

- Node.js 20+
- Docker Desktop (for local PostgreSQL), or another PostgreSQL 16 instance
- npm 10+

## Steps

1. Copy environment templates:

```powershell
copy .env.example .env
copy .env.example backend\.env
copy .env.example frontend\.env
```

2. Start PostgreSQL:

```powershell
npm run db:up
```

3. Install dependencies from the repo root:

```powershell
npm install
npx prisma generate --schema backend/prisma/schema.prisma
```

4. Apply migrations and seed fictional demo data:

```powershell
npm run db:migrate
npm run db:seed
```

5. Run API and web app:

```powershell
npm run dev
```

- Frontend: http://localhost:5173
- API health: http://localhost:4000/api/v1/health
- API meta: http://localhost:4000/api/v1/meta

6. Run unit/API tests that do not need a browser:

```powershell
npm test
```

## Demo accounts

All seeded passwords are `DemoPass123!`. These are fictional local accounts only.

See [demo-accounts.md](demo-accounts.md).
