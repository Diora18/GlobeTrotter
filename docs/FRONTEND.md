# Frontend Guide

React + Vite application structure, routing, and patterns. **Owned by the frontend dev.**

Runs locally on port **5173**. All API calls go through `src/api/` and must match `docs/api/` contracts.

## Routes

| Path | Page component | Priority |
|------|----------------|----------|
| `/login` | `LoginPage` | P0 |
| `/signup` | `SignupPage` | P0 |
| `/dashboard` | `DashboardPage` | P0 |
| `/trips` | `TripsPage` | P0 |
| `/trips/new` | `CreateTripPage` | P0 |
| `/trips/:id` | `ItineraryViewPage` | P0 |
| `/trips/:id/build` | `ItineraryBuilderPage` | P0 |
| `/trips/:id/budget` | `BudgetPage` | P1 |
| `/trips/:id/calendar` | `CalendarPage` | P1 |
| `/share/:slug` | `PublicTripPage` | P1 |
| `/profile` | `ProfilePage` | P2 |
| `/admin` | `AdminPage` | P3 |

## Folder structure

```
frontend/src/
├── main.jsx                 React entry
├── App.jsx                  Router + providers
├── pages/                   One file per route
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── TripsPage.jsx
│   ├── CreateTripPage.jsx
│   ├── ItineraryViewPage.jsx
│   ├── ItineraryBuilderPage.jsx
│   ├── BudgetPage.jsx
│   ├── CalendarPage.jsx
│   ├── PublicTripPage.jsx
│   └── ProfilePage.jsx
├── components/
│   ├── ui/                  Button, Input, Modal, Card, Spinner
│   ├── layout/              Navbar, Sidebar, PageHeader
│   └── trip/                TripCard, StopList, ActivityPicker, BudgetChart
├── api/
│   ├── client.js            Axios/fetch wrapper with credentials
│   ├── auth.js
│   ├── trips.js
│   ├── stops.js
│   ├── cities.js
│   ├── activities.js
│   └── budget.js
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useTrips.js
└── utils/
    ├── dates.js             Format/display helpers
    └── currency.js          Format USD
```

## API client

```javascript
// src/api/client.js
const BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // send auth cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw json.error || { message: 'Request failed' };
  return json.data;
}
```

All domain files (`trips.js`, etc.) use this client. Shapes match `docs/api/`.

## State management

| State type | Tool |
|------------|------|
| Auth (user, logged in?) | React Context (`AuthContext`) |
| Server data (trips, cities) | TanStack React Query |
| Form state | Local `useState` or React Hook Form |
| UI state (modals, toggles) | Local `useState` |

## Protected routes

Wrap authenticated pages in a guard:

```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
}
```

Public routes: `/login`, `/signup`, `/share/:slug`

## Page patterns

Every data-fetching page should handle three states:

1. **Loading** — spinner or skeleton
2. **Error** — message + retry button
3. **Empty** — helpful CTA (e.g. "No trips yet — plan your first trip")

## Key components

| Component | Used in | Notes |
|-----------|---------|-------|
| `TripCard` | Dashboard, Trips list | Name, dates, stop count, actions |
| `StopList` | Builder, Itinerary view | Ordered stops with edit/remove |
| `CitySearchModal` | Builder | Search + filter + add |
| `ActivityPicker` | Builder | Filtered list for a stop's city |
| `BudgetChart` | Budget page | Recharts pie/bar |
| `TripCalendar` | Calendar page | react-big-calendar wrapper |
| `ItineraryTimeline` | Itinerary view | Day-wise grouped list |

## Styling

- Tailwind CSS for all styling
- Mobile-first responsive design
- Consistent spacing: `p-4`, `gap-4`, `rounded-lg`
- Color palette TBD — pick once and document here

## Vite config

Proxy `/api` to backend in development (see [ARCHITECTURE.md](./ARCHITECTURE.md)). Backend runs at `http://localhost:3001`.

## Screen → API map

| Page | Primary API calls |
|------|-------------------|
| Dashboard | `GET /api/trips`, `GET /api/cities` |
| Create Trip | `POST /api/trips` |
| Trips list | `GET /api/trips`, `DELETE /api/trips/:id` |
| Builder | Full trip CRUD + stops + activities |
| Itinerary view | `GET /api/trips/:id` |
| Budget | `GET /api/trips/:id/budget` |
| Calendar | `GET /api/trips/:id` |
| Public share | `GET /api/public/trips/:slug` |
| Profile | `GET/PATCH /api/users/me` |

See [FEATURES.md](./FEATURES.md) for full acceptance criteria per screen.
