# GlobeTrotter

Personalized multi-city travel planning — create itineraries, explore cities and activities, track budgets, and share trips.

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React, Vite, JavaScript       |
| Backend  | Express, JavaScript           |
| Database | PostgreSQL + Prisma           |

**Team:** 2 devs — one backend, one frontend. **Local only**, no deployment.

## Quick start

```bash
# Backend
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run dev            # http://localhost:3001

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

## Documentation

Start with **[docs/HANDBOOK.md](./docs/HANDBOOK.md)** — it links to everything else.

| Doc | Purpose |
|-----|---------|
| [HANDBOOK.md](./docs/HANDBOOK.md) | Entry point for all developers |
| [PROJECT.md](./docs/PROJECT.md) | Vision, mission, glossary |
| [FEATURES.md](./docs/FEATURES.md) | Screen specs and acceptance criteria |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design and request flow |
| [DATABASE.md](./docs/DATABASE.md) | Schema and relationships |
| [api/](./docs/api/) | API contracts (request/response) |
| [TASKS.md](./docs/TASKS.md) | Milestones and ownership |
| [INTEGRATION.md](./docs/INTEGRATION.md) | Branch checklists — what to test before merge |

## Mockup reference

Design wireframe: https://link.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1

Screen-level requirements are documented in [FEATURES.md](./docs/FEATURES.md) from the product spec.
