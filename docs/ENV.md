# Environment Variables

Local development only. Both devs use the same variable names; each creates their own `.env` from the examples.

## Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret for signing auth tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry |
| `PORT` | No | `3001` | Express server port |
| `NODE_ENV` | No | `development` | Keep as `development` |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Used for CORS |

### Example

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter"
JWT_SECRET="your-long-random-secret-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:3001` | Backend API base URL |

### Example

```env
VITE_API_URL=http://localhost:3001
```

With Vite proxy configured, frontend can also call `/api/...` directly without the full URL.

## Local PostgreSQL setup

**Option A — Postgres.app (macOS, easiest)**

1. Download [Postgres.app](https://postgresapp.com/)
2. Create a database named `globetrotter`
3. Use: `postgresql://postgres@localhost:5432/globetrotter`

**Option B — Docker**

```bash
docker run -d \
  --name globetrotter-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=globetrotter \
  -p 5432:5432 \
  postgres:16
```

Then use: `postgresql://postgres:postgres@localhost:5432/globetrotter`

**Option C — Homebrew**

```bash
brew install postgresql@16
brew services start postgresql@16
createdb globetrotter
```

## Setup checklist (backend dev)

- [ ] Postgres running locally
- [ ] Copy `backend/.env.example` → `backend/.env` and fill values
- [ ] Run `npx prisma migrate dev` in backend
- [ ] Run `npm run seed` in backend
- [ ] Confirm API responds at http://localhost:3001

## Setup checklist (frontend dev)

- [ ] Copy `frontend/.env.example` → `frontend/.env`
- [ ] Confirm backend is running on port 3001
- [ ] Run `npm run dev` in frontend
- [ ] Confirm app loads at http://localhost:5173
