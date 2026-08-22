# Conventions

Shared rules for code, git, and documentation. Two devs — one backend, one frontend.

## Git workflow

### Branches

```
main              stable, demo-ready
feat/<name>       new features
fix/<name>        bug fixes
docs/<name>       documentation only
```

Examples: `feat/itinerary-builder`, `fix/budget-total`, `docs/trips-api`

### Commits

Use clear, imperative messages:

```
Add trip stop reorder endpoint
Fix budget calculation for empty stops
Update trips API response shape
```

### Pull requests

- One feature or fix per PR
- Update `docs/api/` if any endpoint changes
- Include manual test steps in the PR description
- **Always get a review from the other person** — backend changes affect frontend and vice versa

### Handoff between backend and frontend

| When backend… | Also do… |
|---------------|----------|
| Adds a new endpoint | Update matching `docs/api/*.md`, tell frontend dev it's ready |
| Changes response shape | Update docs + notify frontend before merging |
| Adds seed data | Mention what's available (cities, demo user credentials) |

| When frontend… | Also do… |
|----------------|----------|
| Needs a new field in API | Discuss first, update `docs/api/` together, then backend implements |
| Finds API mismatch | Flag it — fix docs or code, don't work around silently |

## Backend conventions

### Structure

```
backend/
├── src/
│   ├── app.js              Express app setup
│   ├── server.js           Entry point
│   ├── routes/             Route definitions
│   ├── controllers/        Request handlers
│   ├── services/           Business logic
│   ├── middleware/         Auth, error handler, validation
│   ├── validators/         Zod schemas
│   └── utils/              Helpers
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── package.json
```

### Patterns

- Routes are thin — delegate to controllers
- Controllers call services; services use Prisma
- Validate all inputs with Zod in `validators/`
- Use async/await; pass errors to central error middleware
- Return responses matching `docs/api/` shapes exactly

### Naming

- Files: `camelCase.js` (e.g. `tripController.js`)
- Functions: `camelCase`
- Database columns: `snake_case` (via Prisma `@map` if needed)
- API JSON fields: `camelCase`

## Frontend conventions

### Structure

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── pages/              Route-level components
│   ├── components/         Reusable UI
│   │   ├── ui/             Generic (Button, Modal, Input)
│   │   └── trip/           Trip-specific
│   ├── hooks/              Custom hooks
│   ├── api/                API client + per-domain calls
│   ├── context/            AuthContext, etc.
│   └── utils/              Formatters, constants
└── package.json
```

### Patterns

- One page component per route in `pages/`
- API calls live in `src/api/` — pages don't fetch directly with raw fetch
- Use React Query for server state (trips, cities, activities)
- Auth state in React Context
- Handle loading, error, and empty states on every data-fetching page

### Naming

- Components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- CSS: Tailwind utility classes; extract repeated patterns to components

## API documentation

When changing any endpoint:

1. Update the matching file in `docs/api/`
2. Update frontend `src/api/` if response shape changed
3. Mention the change in your PR

## Environment variables

- Never commit `.env` files
- Always update `.env.example` when adding new vars
- Document new vars in [ENV.md](./ENV.md)

## Error handling

### Backend

```javascript
// Standard error response
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Trip not found" } }
```

### Frontend

- Show user-friendly messages for 4xx errors
- Log 5xx errors to console; show generic "Something went wrong"

## Dates and money

- **Dates:** ISO 8601 strings in API (`"2026-08-22"`, `"2026-08-22T14:00:00.000Z"`)
- **Money:** Numbers in USD cents or whole dollars — pick one and stay consistent (we use **whole USD dollars** as integers/decimals in API responses)
