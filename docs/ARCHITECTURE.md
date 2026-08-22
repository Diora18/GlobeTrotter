# Architecture

## Stack

| Layer | Technology | Version notes |
|-------|------------|---------------|
| Frontend | React + Vite | JavaScript, React 18+ |
| Routing | React Router | v6 |
| Server state | TanStack React Query | Data fetching + cache |
| Styling | Tailwind CSS | Utility-first |
| Backend | Express | JavaScript, v4 |
| ORM | Prisma | Schema + migrations |
| Database | PostgreSQL | 14+ |
| Validation | Zod | Request body validation |
| Auth | JWT | Stored in httpOnly cookie |
| Charts | Recharts | Budget breakdown |
| Calendar | react-big-calendar or similar | Timeline view |

## System diagram

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Browser   │ ──────► │  Vite Dev   │ ──────► │   Express    │
│  React SPA  │  /api/* │   Proxy     │  HTTP   │   :3001      │
└─────────────┘         └─────────────┘         └──────┬───────┘
                                                       │
                                                       ▼
                                                ┌──────────────┐
                                                │   Prisma     │
                                                └──────┬───────┘
                                                       │
                                                       ▼
                                                ┌──────────────┐
                                                │  PostgreSQL  │
                                                └──────────────┘
```

## Request flow

1. User interacts with React page
2. Page calls function in `frontend/src/api/`
3. API client sends request to `VITE_API_URL/api/...` with credentials (cookies)
4. Vite dev server proxies `/api` → Express on localhost
5. Express middleware: CORS → JSON parser → auth (if protected) → route handler
6. Controller validates input (Zod), calls service
7. Service uses Prisma to read/write PostgreSQL
8. Response returned as `{ success, data }` or `{ success, error }`

## Auth flow

- **Register/Login:** Backend validates credentials, signs JWT, sets `httpOnly` cookie named `token`
- **Protected routes:** Middleware reads cookie, verifies JWT, attaches `req.user`
- **Logout:** Clears cookie
- **Frontend:** `AuthContext` calls `GET /api/auth/me` on load to check session

See [api/auth.md](./api/auth.md) for details.

## Frontend ↔ Backend boundary

| Concern | Owner |
|---------|-------|
| UI, routing, form state | Frontend |
| Validation for UX (optional) | Frontend |
| Authorization, business rules | Backend |
| Data persistence | Backend + Prisma |
| API contract | `docs/api/` (shared) |

## Vite proxy (development)

```javascript
// frontend/vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

With this, frontend can call `/api/trips` without CORS issues in dev.

## Error handling

Central Express error middleware catches all thrown errors:

```javascript
// Expected shape
res.status(404).json({
  success: false,
  error: { code: 'NOT_FOUND', message: 'Trip not found' },
});
```

## File uploads (cover photos, avatars)

**MVP approach:** Store image URL as a string field. Users paste a URL or upload to a free service (Cloudinary/Uploadthing) from the frontend, then save the returned URL.

If time allows, add `POST /api/upload` with multer + Cloudinary.

## Local-only setup

This project runs entirely on your machines for the hackathon demo. No deployment needed.

| Service | Local URL |
|---------|-----------|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

Both developers run the same stack locally. Backend person owns the database and seed data.

## Security notes

- Passwords hashed with bcrypt (cost factor 10+)
- JWT in httpOnly cookie — not accessible to JavaScript
- CORS restricted to `FRONTEND_URL`
- All trip mutations verify `trip.userId === req.user.id`
- Public share routes (`/api/public/*`) require no auth but only return public trips
