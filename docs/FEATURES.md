# Feature Specifications

Screen-by-screen requirements from the product spec. Each section includes route, components, API dependencies, and acceptance criteria.

**Priority key:** P0 = MVP required, P1 = MVP if time allows, P2 = post-MVP, P3 = stretch

---

## 1. Login / Signup Screen

**Priority:** P0  
**Routes:** `/login`, `/signup`

### Description
Entry point for creating or accessing an account.

### Purpose
Authenticate users so they can manage personal travel plans.

### Components
- Email and password input fields
- Login button
- Link to signup (and vice versa)
- "Forgot password" link (P2 — can show "coming soon" in MVP)
- Basic client-side validation (email format, password min length)

### API calls
- `POST /api/auth/login`
- `POST /api/auth/register`

### Acceptance criteria
- [ ] User can register with email + password (min 8 chars)
- [ ] User can log in with valid credentials
- [ ] Invalid credentials show error message
- [ ] Successful auth redirects to Dashboard
- [ ] Session persists on page refresh (cookie-based)

---

## 2. Dashboard / Home Screen

**Priority:** P0  
**Route:** `/` or `/dashboard`

### Description
Central hub showing upcoming trips, popular cities, and quick actions.

### Purpose
Navigate to trips and explore inspiration.

### Components
- Welcome message with user's name
- List of recent/upcoming trips (cards with name, dates, destination count)
- **"Plan New Trip"** button → Create Trip screen
- Recommended/popular destinations section (from seed cities)
- Budget highlights (e.g. total planned spend across trips) — optional summary

### API calls
- `GET /api/trips?limit=5&sort=upcoming`
- `GET /api/cities?sort=popularity&limit=6`

### Acceptance criteria
- [ ] Shows user's recent trips or empty state with CTA
- [ ] "Plan New Trip" navigates to create form
- [ ] Clicking a trip card opens trip detail / itinerary
- [ ] Popular cities displayed with name, country, image

---

## 3. Create Trip Screen

**Priority:** P0  
**Route:** `/trips/new`

### Description
Form to start a new trip with name, dates, and description.

### Purpose
Begin the personalized travel plan.

### Components
- Trip name input (required)
- Start and end date pickers (required, end >= start)
- Trip description textarea (optional)
- Cover photo upload or URL input (optional)
- Save button → creates trip and redirects to Itinerary Builder

### API calls
- `POST /api/trips`

### Acceptance criteria
- [ ] Validates required fields before submit
- [ ] End date cannot be before start date
- [ ] On success, redirects to `/trips/:id/build`
- [ ] Cover photo URL saved if provided

---

## 4. My Trips (Trip List) Screen

**Priority:** P0  
**Route:** `/trips`

### Description
List of all trips created by the user.

### Purpose
Access and manage existing or upcoming trips.

### Components
- Trip cards: name, date range, destination count, cover thumbnail
- Actions per card: View, Edit, Delete
- Empty state: "No trips yet" with CTA to create
- Optional: filter by upcoming/past

### API calls
- `GET /api/trips`
- `DELETE /api/trips/:id`

### Acceptance criteria
- [ ] Lists all user's trips sorted by start date
- [ ] Delete asks for confirmation, removes trip on confirm
- [ ] View opens itinerary; Edit opens builder or edit form
- [ ] Shows destination count per trip

---

## 5. Itinerary Builder Screen

**Priority:** P0  
**Route:** `/trips/:id/build`

### Description
Interactive interface to add cities, dates, and activities for each stop.

### Purpose
Construct the full day-wise trip plan.

### Components
- **"Add Stop"** button → opens city search modal/panel
- Select city and set arrival/departure dates per stop
- Assign activities to each stop (link to Activity Search)
- Reorder cities (drag or up/down buttons)
- Remove stop
- Save/auto-save changes
- Link to Itinerary View and Budget

### API calls
- `GET /api/trips/:id` (with stops and activities)
- `POST /api/trips/:id/stops`
- `PATCH /api/stops/:id`
- `DELETE /api/stops/:id`
- `PATCH /api/trips/:id/stops/reorder`
- `POST /api/stops/:stopId/activities`
- `DELETE /api/stop-activities/:id`

### Acceptance criteria
- [ ] Can add multiple stops with city and date range
- [ ] Stop dates must fall within trip start/end dates
- [ ] Can reorder stops; order persists after refresh
- [ ] Can add/remove activities per stop
- [ ] Shows running list of stops with city names and dates

---

## 6. Itinerary View Screen

**Priority:** P0  
**Route:** `/trips/:id`

### Description
Structured read view of the completed itinerary.

### Purpose
Review the full plan grouped by cities or days.

### Components
- Day-wise layout with date headers
- City headers under each day
- Activity blocks: name, time, estimated cost
- View mode toggle: **calendar view** vs **list view**
- Links to Edit (builder), Budget, Share

### API calls
- `GET /api/trips/:id`

### Acceptance criteria
- [ ] Displays all stops in order with activities
- [ ] Toggle switches between list and calendar layout
- [ ] Empty stops show placeholder ("No activities yet")
- [ ] Shows trip name, dates, description at top

---

## 7. City Search

**Priority:** P0  
**Route:** Embedded in builder (modal/panel) — `/trips/:id/build`

### Description
Search and discover cities to add to a trip.

### Purpose
Find relevant cities with metadata before adding to itinerary.

### Components
- Search bar (query by name)
- Filter by country/region
- City list items: name, country, cost index, popularity, image
- **"Add to Trip"** button per city → creates stop, prompts for dates

### API calls
- `GET /api/cities?q=&country=&region=`

### Acceptance criteria
- [ ] Search filters cities by name (debounced)
- [ ] Country/region filter works
- [ ] Add to Trip creates a new stop and opens date picker
- [ ] Cannot add duplicate city to same trip (or warn user)

---

## 8. Activity Search

**Priority:** P1  
**Route:** Embedded in builder per stop — `/trips/:id/build`

### Description
Browse and select things to do at each stop.

### Purpose
Enrich trips with sightseeing, food tours, adventure, etc.

### Components
- Activity list for selected city/stop
- Filters: type, max cost, duration
- Add / remove buttons
- Quick view: description, image, estimated cost, duration

### API calls
- `GET /api/activities?cityId=&type=&maxCost=`
- `POST /api/stops/:stopId/activities`
- `DELETE /api/stop-activities/:id`

### Acceptance criteria
- [ ] Shows activities for the stop's city
- [ ] Filters update results
- [ ] Add attaches activity to stop; remove detaches
- [ ] Added activities appear in itinerary view

---

## 9. Trip Budget & Cost Breakdown Screen

**Priority:** P1  
**Route:** `/trips/:id/budget`

### Description
Financial summary with estimated total and category breakdowns.

### Purpose
Help travelers stay informed and within budget.

### Components
- Total estimated cost (prominent)
- Breakdown by category: transport, stay, activities, meals
- Pie chart and/or bar chart (Recharts)
- Average cost per day
- Alerts for over-budget days (if daily estimate exceeds threshold — P2)

### API calls
- `GET /api/trips/:id/budget`

### Acceptance criteria
- [ ] Total matches sum of categories
- [ ] Charts render with correct proportions
- [ ] Average per day = total / trip days
- [ ] Updates when stops/activities change (refetch on navigation)

---

## 10. Trip Calendar / Timeline Screen

**Priority:** P1  
**Route:** `/trips/:id/calendar`

### Description
Calendar or vertical timeline of the full itinerary.

### Purpose
Visualize the journey and daily plan flow.

### Components
- Calendar component spanning trip dates
- Expandable day views showing activities
- Drag-to-reorder activities (P2 — use up/down in MVP if drag is slow)
- Quick edit: remove activity, change time

### API calls
- `GET /api/trips/:id`
- `PATCH /api/stop-activities/:id` (for time/order changes)

### Acceptance criteria
- [ ] Calendar shows trip date range
- [ ] Each day lists activities scheduled for that day
- [ ] Clicking a day expands detail
- [ ] Activities without scheduledAt appear on arrival day of their stop

---

## 11. Shared / Public Itinerary View

**Priority:** P1  
**Route:** `/share/:slug` (public, no auth required to view)

### Description
Read-only public page for a shared itinerary.

### Purpose
Let others view, get inspired, or copy the trip.

### Components
- Public URL display (for owner on share action)
- Itinerary summary: trip name, dates, stops, activities
- **"Copy Trip"** button (requires login)
- Social share buttons (copy link, optional Twitter/WhatsApp — P2)
- Read-only — no edit controls

### API calls
- `POST /api/trips/:id/share` (owner enables sharing)
- `GET /api/public/trips/:slug`
- `POST /api/trips/:id/duplicate` (copy to own account)

### Acceptance criteria
- [ ] Owner can generate share link; trip marked public
- [ ] Public URL works without login
- [ ] Copy Trip creates duplicate in logged-in user's account
- [ ] Private trips return 404 on public URL

---

## 12. User Profile / Settings Screen

**Priority:** P2  
**Route:** `/profile`

### Description
Update profile information and preferences.

### Purpose
Control personal data and preferences.

### Components
- Editable: name, profile photo URL, email (read-only or change with verification — P2)
- Language preference dropdown
- Saved destinations list
- Delete account button (with confirmation)
- Logout button

### API calls
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`
- `GET /api/users/me/saved-destinations`

### Acceptance criteria
- [ ] Profile loads current user data
- [ ] Save updates name and avatar
- [ ] Delete account removes user and their trips (cascade)
- [ ] Logout clears session and redirects to login

---

## 13. Admin / Analytics Dashboard (Optional)

**Priority:** P3 (stretch)  
**Route:** `/admin`

### Description
Admin-only view of platform usage trends.

### Purpose
Monitor adoption, popular cities, and user behavior.

### Components
- Tables/charts: trips created over time, top cities, top activities
- User count, engagement stats
- User management (list users — view only for hackathon)

### API calls
- `GET /api/admin/stats`

### Acceptance criteria
- [ ] Only accessible to users with admin role
- [ ] Shows aggregate stats from database
- [ ] Top cities ranked by stop count

---

## Route summary

| Route | Screen | Priority |
|-------|--------|----------|
| `/login` | Login | P0 |
| `/signup` | Signup | P0 |
| `/dashboard` | Dashboard | P0 |
| `/trips/new` | Create Trip | P0 |
| `/trips` | My Trips | P0 |
| `/trips/:id/build` | Itinerary Builder | P0 |
| `/trips/:id` | Itinerary View | P0 |
| `/trips/:id/budget` | Budget | P1 |
| `/trips/:id/calendar` | Calendar | P1 |
| `/share/:slug` | Public Itinerary | P1 |
| `/profile` | Profile / Settings | P2 |
| `/admin` | Admin Dashboard | P3 |
