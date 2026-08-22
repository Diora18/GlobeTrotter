# GlobeTrotter Backend

Express + Prisma + PostgreSQL API.

## Setup

```bash
cd backend
cp .env.example .env    # edit DATABASE_URL and JWT_SECRET if needed
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev             # http://localhost:3001
```

## Demo credentials

After seeding:

- Email: `demo@globetrotter.com`
- Password: `password123`

## Quick test (curl)

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@globetrotter.com","password":"password123"}' \
  -c cookies.txt

# List trips
curl http://localhost:3001/api/trips -b cookies.txt

# List cities (no auth)
curl "http://localhost:3001/api/cities?limit=5"
```

## Implemented endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | /api/health | No |
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| POST | /api/auth/logout | No |
| GET | /api/auth/me | Yes |
| GET | /api/trips | Yes |
| POST | /api/trips | Yes |
| GET | /api/trips/:id | Yes |
| PATCH | /api/trips/:id | Yes |
| DELETE | /api/trips/:id | Yes |
| POST | /api/trips/:tripId/stops | Yes |
| PATCH | /api/trips/:tripId/stops/reorder | Yes |
| PATCH | /api/stops/:id | Yes |
| DELETE | /api/stops/:id | Yes |
| GET | /api/cities | No |
| GET | /api/cities/:id | No |
| GET | /api/activities | No |
| GET | /api/activities/:id | No |
| POST | /api/stops/:stopId/activities | Yes |
| PATCH | /api/stop-activities/:id | Yes |
| DELETE | /api/stop-activities/:id | Yes |
| GET | /api/trips/:id/budget | Yes |

See `../docs/api/` for full request/response contracts.
