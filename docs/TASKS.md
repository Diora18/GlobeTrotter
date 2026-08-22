# Task Breakdown

Milestones and ownership for a **2-person team**. Local development only — no deployment.

## Team

| Person | Role | Owns | Primary docs |
|--------|------|------|--------------|
| **You** | Backend | Express API, Prisma, PostgreSQL, seed data, `docs/api/` | BACKEND.md, DATABASE.md, docs/api/ |
| **Partner** | Frontend | React + Vite, all pages, UI, API client | FRONTEND.md, FEATURES.md, docs/api/ |

## How you work together

1. **API-first.** Backend implements endpoints per `docs/api/` → frontend integrates against those contracts.
2. **Same PR when touching contracts.** If an endpoint shape changes, update `docs/api/*.md` and tell your partner.
3. **Unblock early.** Backend should ship auth + trip list before frontend builds dashboard. Frontend can use mock data briefly but switch to real API ASAP.
4. **Both run locally.** Backend `:3001`, frontend `:5173`, Postgres on your machine.
5. **Quick sync points.** After each phase below, do a 10-min demo: backend shows API in Postman/curl, frontend shows the screen.
6. **Update [INTEGRATION.md](./INTEGRATION.md)** when a branch is ready for review or merged.

---

## Phases

### Phase 0 — Foundation
**Goal:** Both apps run locally, auth works end-to-end.

| Task | Owner | Depends on |
|------|-------|------------|
| Init backend (Express, Prisma, Postgres) | Backend | — |
| Prisma schema + first migration | Backend | Backend init |
| Seed cities + activities + demo user | Backend | Schema |
| Auth endpoints (register, login, logout, me) | Backend | Schema |
| Init frontend (Vite, React Router, Tailwind) | Frontend | — |
| Auth pages + AuthContext | Frontend | Auth API |
| Vite proxy + API client setup | Frontend | Backend running |

### Phase 1 — Core trip flow (P0)
**Goal:** Create a trip, add stops, view itinerary.

| Task | Owner | Depends on |
|------|-------|------------|
| Trip CRUD API | Backend | Auth |
| Stops CRUD + reorder API | Backend | Trips API |
| Cities search API | Backend | Seed data |
| Dashboard page | Frontend | Trips + cities API |
| Create trip page | Frontend | Trip create API |
| My trips list page | Frontend | Trips list API |
| Itinerary builder page + city search UI | Frontend | Stops + cities API |
| Itinerary view page | Frontend | Trip detail API |

### Phase 2 — Activities + budget (P1)
**Goal:** Activities on stops, budget visibility.

| Task | Owner | Depends on |
|------|-------|------------|
| Activities catalog API | Backend | Seed data |
| Stop-activities link API | Backend | Stops API |
| Budget calculation endpoint | Backend | Stop-activities |
| Activity picker in builder | Frontend | Activities API |
| Budget page with charts | Frontend | Budget API |
| Calendar/timeline page | Frontend | Trip detail API |

### Phase 3 — Share + profile (P1–P2)
**Goal:** Public sharing and user settings.

| Task | Owner | Depends on |
|------|-------|------------|
| Share + public trip API | Backend | Trips API |
| Duplicate trip API | Backend | Share API |
| Users profile API | Backend | Auth |
| Public itinerary page | Frontend | Public API |
| Share button + copy link | Frontend | Share API |
| Profile page | Frontend | Users API |
| Copy trip from public view | Frontend | Duplicate API |

### Phase 4 — Polish (P2–P3)
**Goal:** Demo-ready for hackathon presentation.

| Task | Owner | Depends on |
|------|-------|------------|
| Empty/loading/error states on all pages | Frontend | Pages done |
| Responsive mobile layout | Frontend | Pages done |
| Admin stats API (stretch) | Backend | All data |
| Admin dashboard (stretch) | Frontend | Admin API |

---

## Backend priority order

Build in this sequence so frontend is never blocked long:

1. Auth (register, login, logout, me)
2. Trips CRUD
3. Stops CRUD + reorder
4. Cities list/search
5. Activities list + stop-activities
6. Budget endpoint
7. Share + public + duplicate
8. Users profile
9. Admin (if time)

---

## Demo script

Run locally on one machine (or two laptops pointing at same backend):

1. Log in as demo user (`demo@globetrotter.com`)
2. Show dashboard with existing trip
3. Create new trip "Europe Summer"
4. Add stops: Paris (5 days), Rome (4 days)
5. Add activities to each stop
6. Show itinerary view (list + calendar toggle)
7. Show budget breakdown with charts
8. Generate share link → open in incognito → copy trip
9. Show copied trip in account

---

## Definition of done (MVP)

- [ ] All P0 screens functional
- [ ] Data persists in local PostgreSQL
- [ ] Auth works with cookie session
- [ ] P1 done: activities + budget + share
- [ ] API matches `docs/api/` contracts
- [ ] Both devs can run the full app locally from README steps
