# Integration Checklist

Track what's on each branch, how to test it, and when it's safe to merge to `main`.

**Update this file whenever you push a new branch.**

Status key: `🟡 in progress` · `🔵 ready for review` · `✅ merged to main`

---

## How to use this

1. **Backend dev** — when a branch is ready, fill in a new section below and set status to `🔵 ready for review`
2. **Frontend dev** — pull that branch, run the backend checks, then do the frontend verification steps
3. **Both** — once everything passes, backend merges first → frontend rebases and merges
4. **After merge** — change status to `✅ merged to main`

---

## Branch log

| Branch | Owner | Status | Merge order |
|--------|-------|--------|-------------|
| `feat/be-foundation` | Backend | 🔵 ready for review | Merge 1st |
| `feat/fe-setup` | Frontend | 🟡 not started | Merge 2nd (after be-foundation) |
| `feat/be-activities` | Backend | 🔵 ready for review | Merge after be-foundation |
| `feat/fe-builder` | Frontend | 🟡 not started | — |

---

## `feat/be-foundation` — Backend foundation

**Status:** 🔵 ready for review  
**Owner:** Backend  
**Merge order:** Merge to `main` first, before any frontend branch

### What's included

- Express app setup (`backend/src/`)
- Prisma schema + migration
- Seed data (12 cities, activities, demo user + trip)
- Auth API: register, login, logout, me
- Trips API: list, create, get, update, delete
- Stops API: add, update, delete, reorder
- Cities API: list/search, get by id

### API docs to reference

- [auth.md](./api/auth.md)
- [trips.md](./api/trips.md)
- [stops.md](./api/stops.md)
- [cities.md](./api/cities.md)

---

### Backend — setup & verify

```bash
git fetch origin
git checkout feat/be-foundation

cd backend
cp .env.example .env
# Homebrew Postgres: DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/globetrotter"
npm install
npx prisma migrate dev
npm run seed
npm run dev    # http://localhost:3001
```

**Backend checks (run in another terminal):**

- [ ] Health check works
  ```bash
  curl http://localhost:3001/api/health
  # Expected: {"success":true,"data":{"status":"ok"}}
  ```

- [ ] Login works
  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@globetrotter.com","password":"password123"}' \
    -c cookies.txt
  # Expected: success + user object, cookie saved
  ```

- [ ] Get current user works
  ```bash
  curl http://localhost:3001/api/auth/me -b cookies.txt
  # Expected: demo user details
  ```

- [ ] List trips works
  ```bash
  curl http://localhost:3001/api/trips -b cookies.txt
  # Expected: "Europe Summer" trip with stopCount: 2
  ```

- [ ] Get trip detail works
  ```bash
  # Copy trip id from above, then:
  curl http://localhost:3001/api/trips/TRIP_ID -b cookies.txt
  # Expected: trip with Paris + Rome stops and activities
  ```

- [ ] Cities list works (no auth)
  ```bash
  curl "http://localhost:3001/api/cities?limit=5"
  # Expected: list of cities with name, country, costIndex
  ```

- [ ] Register works
  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password123","name":"Test User"}'
  # Expected: 201 + user object
  ```

---

### Frontend — what to build / verify on this branch

Frontend doesn't exist yet on this branch. Partner can **start `feat/fe-setup` branched off this branch**.

Once frontend shell exists, verify:

- [ ] `VITE_API_URL=http://localhost:3001` in `frontend/.env`
- [ ] API client sends `credentials: 'include'` on all requests
- [ ] Login page calls `POST /api/auth/login` and redirects on success
- [ ] App calls `GET /api/auth/me` on load to check session
- [ ] Logout calls `POST /api/auth/logout` and clears session

**Not expected on this branch yet:** dashboard, trip list UI, itinerary builder

---

### Merge checklist

- [ ] All backend checks above pass
- [ ] Frontend dev has reviewed (or tested via curl)
- [ ] No `.env` files in the commit
- [ ] `feat/be-foundation` → merge to `main`
- [ ] Tell partner: *"Merged to main — pull and start feat/fe-setup"*
- [ ] Update branch log table above to ✅

---

## `feat/fe-setup` — Frontend shell + auth pages

**Status:** 🟡 not started  
**Owner:** Frontend  
**Depends on:** `feat/be-foundation` merged to `main` (or branch off `feat/be-foundation` while waiting)  
**Merge order:** Merge to `main` after `feat/be-foundation`

### What to include

- Vite + React + Tailwind setup
- React Router
- API client (`src/api/client.js`)
- AuthContext
- Login page (`/login`)
- Signup page (`/signup`)
- Protected route wrapper

### Frontend — setup & verify

```bash
git checkout feat/fe-setup   # branched from main or feat/be-foundation
cd frontend
cp .env.example .env
npm install
npm run dev    # http://localhost:5173

# Backend must be running in another terminal on :3001
```

**Frontend checks:**

- [ ] App loads at http://localhost:5173
- [ ] Can navigate to `/login` and `/signup`
- [ ] Login with `demo@globetrotter.com` / `password123` works
- [ ] After login, redirects to dashboard (even if dashboard is empty)
- [ ] Refreshing page keeps session (cookie persists)
- [ ] Logout clears session and redirects to login
- [ ] Signup creates new account and logs in

### Merge checklist

- [ ] Login/signup flow works end-to-end with backend
- [ ] Backend dev has tested the integration locally
- [ ] `feat/fe-setup` → merge to `main`
- [ ] Update branch log table above to ✅

---

## `feat/be-activities` — Activities + budget API

**Status:** 🔵 ready for review  
**Owner:** Backend  
**Depends on:** `feat/be-foundation`  
**Merge order:** Merge after `feat/be-foundation` is on `main`

### What's included

- `GET /api/activities` — list/filter catalog activities
- `GET /api/activities/:id` — single activity
- `POST /api/stops/:stopId/activities` — add activity to stop
- `PATCH /api/stop-activities/:id` — update time/cost/order
- `DELETE /api/stop-activities/:id` — remove from stop
- `GET /api/trips/:id/budget` — full budget breakdown

### API docs

- [activities.md](./api/activities.md)
- [stop-activities.md](./api/stop-activities.md)
- [budget.md](./api/budget.md)

### Backend checks

```bash
git checkout feat/be-activities
cd backend && npm run dev
```

Login first (save cookies.txt), then:

- [ ] List activities for Paris city
  ```bash
  curl "http://localhost:3001/api/activities?cityId=CITY_ID&type=sightseeing"
  ```

- [ ] Add activity to a stop
  ```bash
  curl -X POST http://localhost:3001/api/stops/STOP_ID/activities \
    -H "Content-Type: application/json" -b cookies.txt \
    -d '{"activityId":"ACTIVITY_ID"}'
  ```

- [ ] Get budget breakdown
  ```bash
  curl http://localhost:3001/api/trips/TRIP_ID/budget -b cookies.txt
  # Expected: totalEstimated, byCategory, byDay, byStop, alerts
  ```

- [ ] Remove activity from stop
  ```bash
  curl -X DELETE http://localhost:3001/api/stop-activities/STOP_ACTIVITY_ID -b cookies.txt
  ```

### Frontend — what to verify

- [ ] Activity picker loads activities for stop's city
- [ ] Can filter by type and max cost
- [ ] Adding activity updates itinerary view
- [ ] Budget page shows charts from `byCategory` data

### Merge checklist

- [ ] All backend checks pass
- [ ] `feat/be-foundation` already merged to `main`
- [ ] Rebase this branch on `main` before merging
- [ ] Merge to `main`

---

## Template — copy for new branches

```markdown
## `feat/branch-name` — Short description

**Status:** 🟡 in progress  
**Owner:** Backend / Frontend  
**Depends on:** branch or feature name  
**Merge order:** 1st / 2nd

### What's included

- ...

### Backend checks

- [ ] ...

### Frontend checks

- [ ] ...

### Merge checklist

- [ ] All checks pass
- [ ] Other person reviewed
- [ ] Merged to `main`
- [ ] Updated branch log table
```

---

## Merge order rules

1. **Backend branch merges before frontend branch** that depends on it
2. **Always pull `main`** before starting a new branch
3. **Update this file** when status changes
4. **Never merge to `main`** without the other person checking their section
