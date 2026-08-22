# GlobeTrotter

GlobeTrotter is a full-stack travel planning application that helps users create multi-city itineraries, add stops and activities, keep track of budget spend, and share trip plans publicly. The app supports user authentication, trip management, itinerary building, budget tracking, and a public trip view.

This README documents the complete `feature/globetrotter-full-app` implementation and includes the exact stack, setup instructions, and steps to run the app locally or on a remote laptop.

## Overview

GlobeTrotter lets travelers:

- Create and manage trips with date ranges and trip metadata
- Add multiple destinations/stops to a single trip
- Search and add cities and activities to each stop
- Reorder itinerary items and build a full trip plan
- Review budget summaries and cost breakdowns
- Share a public version of a trip with others
- Sign up, log in, and manage a profile securely

## Tech stack

| Layer | Technologies used |
| --- | --- |
| Frontend | React 19, Vite 8, JavaScript, React Router, TanStack Query, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express 5, JWT, bcryptjs, Zod, Cookie Parser, CORS, Nodemailer |
| Database | PostgreSQL, Prisma ORM |
| Dev tooling | npm, Prisma Studio, Vite dev server, dotenv |
| Auth | JWT stored in secure HTTP-only cookies |
| API design | REST API with structured JSON responses |

### Key libraries

Frontend dependencies:
- `react`, `react-dom`, `react-router-dom`
- `@tanstack/react-query`
- `@hello-pangea/dnd` for drag-and-drop itinerary reordering
- `recharts` for budget and activity summaries
- `lucide-react` for icons
- `tailwindcss` + `@tailwindcss/vite` for styling

Backend dependencies:
- `express`
- `@prisma/client`
- `prisma`
- `postgresql` via connection string in `DATABASE_URL`
- `bcryptjs` for password hashing
- `jsonwebtoken` for auth tokens
- `cookie-parser` and `cors` for session/cross-origin handling
- `nodemailer` for email flows
- `zod` for validation

## Product features

- User authentication and profile access
- Dashboard with trip overview and city inspiration
- Trip creation, editing, and deletion
- Multi-stop itinerary builder
- City and activity search
- Day-wise itinerary and calendar view
- Budget calculator and category breakdowns
- Public share URL for trip viewing
- Admin dashboard support

## Project structure

```text
GlobeTrotter/
├── backend/                 # Express API, Prisma schema, seed data, auth, and business logic
│   ├── prisma/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/                # React + Vite frontend app
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── docs/                    # Product specs, architecture, API contracts, and developer docs
│   ├── api/
│   └── ...
├── .gitignore
├── README.md
└── .env.example (not used directly in app; each app has its own .env)
```

## Prerequisites

Before starting, install:

- Git
- Node.js 18+ or 20+
- npm
- PostgreSQL 16 (or a local Postgres instance via Docker)
- A browser for the frontend

## Clone the repository

```bash
git clone https://github.com/Diora18/GlobeTrotter.git
cd GlobeTrotter
git checkout feature/globetrotter-full-app
```

If you are already on the correct branch, skip the checkout step.

## Set up PostgreSQL

You can use either Docker or a local Postgres installation.

### Option A: Docker (recommended)

```bash
docker run -d \
  --name globetrotter-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=globetrotter \
  -p 5432:5432 \
  postgres:16
```

This gives you a DB that can be accessed with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter"
```

### Option B: Local Postgres

Create a database called `globetrotter` and use a matching connection string for your local setup.

## Backend setup

1. Open a terminal in the repo root.
2. Move into the backend folder.
3. Copy the environment example file and configure values.

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set values similar to:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter"
JWT_SECRET="replace-with-a-long-random-secret-at-least-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Then install dependencies and initialize the database:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

The backend runs on:

- `http://localhost:3001`

Useful backend commands:

```bash
npm run dev
npm run start
npm run seed
npx prisma studio
```

### Demo login

After the seed runs, you can sign in with:

- Email: `demo@globetrotter.com`
- Password: `password123`

## Frontend setup

Open a second terminal and run:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev -- --host 0.0.0.0
```

The frontend runs on:

- `http://localhost:5173`

The frontend `.env` file should contain:

```env
VITE_API_URL=http://localhost:3001
```

## Start both servers together

In separate terminals:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api/health`

## Open the app on a remote laptop or remote machine

If you are running the project on a remote machine, laptop, VM, or cloud dev environment, bind the servers to all interfaces and expose the ports.

### 1. Run the servers on the remote machine

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### 2. Configure the environment for remote access

Update the backend `.env`:

```env
FRONTEND_URL="http://<REMOTE_MACHINE_IP>:5173"
```

Update the frontend `.env`:

```env
VITE_API_URL=http://<REMOTE_MACHINE_IP>:3001
```

Replace `<REMOTE_MACHINE_IP>` with the machine's LAN IP or the host machine IP.

### 3. Expose the ports

If you are using VS Code Remote-SSH, GitHub Codespaces, or a cloud VM:

- Forward port `5173` for the frontend
- Forward port `3001` for the backend
- Open the forwarded frontend URL in your local browser

If you are accessing from another laptop on the same network, you can open:

```text
http://<REMOTE_MACHINE_IP>:5173
```

### 4. SSH tunnel example

From your local machine, if the remote machine is reachable over SSH:

```bash
ssh -L 5173:localhost:5173 -L 3001:localhost:3001 user@remote-machine-ip
```

Then open these URLs locally:

```text
http://localhost:5173
http://localhost:3001/api/health
```

This is a simple method for viewing the app from a local browser while the app itself runs on the remote laptop.

## API overview

The backend exposes a REST API under `/api`.

Main endpoints include:

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Trips: `/api/trips`
- Stops: `/api/trips/:id/stops`, `/api/stops/:id`
- Cities and activities: `/api/cities`, `/api/activities`
- Budget: `/api/trips/:id/budget`
- Share/public view: `/api/share/:slug`
- Admin: `/api/admin/*`

The API contract documentation is in:

- `docs/api/README.md`
- `docs/api/auth.md`
- `docs/api/trips.md`
- `docs/api/stops.md`
- `docs/api/cities.md`
- `docs/api/budget.md`
- `docs/api/share.md`

## Documentation index

Start with the development docs in `docs/`:

- [docs/HANDBOOK.md](./docs/HANDBOOK.md)
- [docs/PROJECT.md](./docs/PROJECT.md)
- [docs/FEATURES.md](./docs/FEATURES.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/DATABASE.md](./docs/DATABASE.md)
- [docs/ENV.md](./docs/ENV.md)
- [docs/TASKS.md](./docs/TASKS.md)

## Common troubleshooting

### Prisma migration issues

```bash
npx prisma migrate dev
npx prisma generate
```

### Frontend cannot reach backend

Check that:

- backend is running on `http://localhost:3001`
- `frontend/.env` has the correct `VITE_API_URL`
- CORS and `FRONTEND_URL` in backend `.env` match the used hostnames

### PostgreSQL connection problems

- Confirm Postgres is running
- Ensure the database `globetrotter` exists
- Check that username/password in `DATABASE_URL` are correct

## License

This project is currently developed for local use and demo purposes as part of the GlobeTrotter application workflow.

## Notes

- The project is intended for local development and demo purposes, not production deployment.
- The app is designed as a two-person workflow: one developer handles backend/database work and the other handles frontend experience.
- Full product and flow details are documented in the `docs/` directory.
