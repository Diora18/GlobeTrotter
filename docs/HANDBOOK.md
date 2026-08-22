# Developer Handbook

This is the entry point for anyone working on GlobeTrotter. Read this first, then follow links to the docs you need for your area.

## What we're building

GlobeTrotter is a travel planning app where users create multi-city trips, add stops and activities, see budget breakdowns, visualize itineraries on a calendar/timeline, and share plans publicly.

## Repository layout

```
globetrotter/
├── backend/          Express API, Prisma, PostgreSQL  ← Backend dev
├── frontend/         React + Vite SPA                 ← Frontend dev
└── docs/             Product and technical documentation
    └── api/          Fixed API contracts (shared — both devs reference this)
```

## Team (2 people)

| Role | Folder | Responsibility |
|------|--------|----------------|
| **Backend** | `backend/` | API, database, seed data, keeps `docs/api/` accurate |
| **Frontend** | `frontend/` | All UI/pages, calls backend via `docs/api/` contracts |

**Workflow:** Backend ships endpoints → frontend integrates. If either side needs an API change, update `docs/api/` first and sync with the other person.

**Scope:** Local development only. No deployment.

## Where to look

| If you're working on… | Read these |
|-----------------------|------------|
| Understanding the product | [PROJECT.md](./PROJECT.md), [FEATURES.md](./FEATURES.md) |
| Backend / database | [BACKEND.md](./BACKEND.md), [DATABASE.md](./DATABASE.md), [api/](./api/) |
| Frontend / UI | [FRONTEND.md](./FRONTEND.md), [FEATURES.md](./FEATURES.md), [api/](./api/) |
| Environment setup | [ENV.md](./ENV.md) |
| Code style & git workflow | [CONVENTIONS.md](./CONVENTIONS.md) |
| Who owns what | [TASKS.md](./TASKS.md) |
| Branch status & test checklists | [INTEGRATION.md](./INTEGRATION.md) |

## Local development

1. Clone the repo and install dependencies in both `backend/` and `frontend/`.
2. Copy `.env.example` → `.env` in each app (see [ENV.md](./ENV.md)).
3. Run Postgres locally (see [ENV.md](./ENV.md)).
4. Backend dev runs migrations: `cd backend && npx prisma migrate dev`.
5. Backend dev runs seed: `cd backend && npm run seed`.
6. Start backend on port **3001**, frontend on port **5173** (two terminals).

## Important rules

1. **API contracts are fixed.** Any endpoint change must update the matching file in `docs/api/` in the same PR.
2. **Backend stays in `backend/`, frontend in `frontend/`.** Don't mix concerns.
3. **All database access goes through Prisma.** No raw SQL unless documented in [DATABASE.md](./DATABASE.md).
4. **Auth uses JWT in httpOnly cookies.** See [api/auth.md](./api/auth.md).
5. **JavaScript only** — no TypeScript unless the team agrees to migrate together.

## User flows (quick reference)

See [USER_FLOWS.md](./USER_FLOWS.md) for diagrams. Core loop:

```
Sign up → Dashboard → Create Trip → Add Stops (cities) → Add Activities
  → View Itinerary → Check Budget → Share publicly
```

## Getting help

- Product questions → [PROJECT.md](./PROJECT.md) and [FEATURES.md](./FEATURES.md)
- "What should this endpoint return?" → `docs/api/<domain>.md`
- "What tables exist?" → [DATABASE.md](./DATABASE.md) and `backend/prisma/schema.prisma`
