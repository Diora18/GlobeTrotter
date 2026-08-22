# Backend Guide

Express API structure, middleware, and patterns. **Owned by the backend dev.**

Runs locally on port **3001**. Frontend dev consumes these endpoints — keep `docs/api/` in sync when anything changes.

## Folder structure

```
backend/
├── src/
│   ├── server.js            Entry: starts HTTP server
│   ├── app.js               Express app (middleware + routes)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── trips.routes.js
│   │   ├── stops.routes.js
│   │   ├── cities.routes.js
│   │   ├── activities.routes.js
│   │   ├── budget.routes.js
│   │   ├── share.routes.js
│   │   ├── users.routes.js
│   │   └── admin.routes.js
│   ├── controllers/         Same names as routes
│   ├── services/            Business logic
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── validators/          Zod schemas
│   └── utils/
│       ├── jwt.js
│       └── budget.js        Budget calculation helpers
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── .env.example
└── package.json
```

## App setup (`app.js`)

Middleware order:

```javascript
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/cities', optionalAuth, cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/public', publicRoutes);   // no auth
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.use(errorMiddleware);               // last
```

## Route → controller → service pattern

```javascript
// routes/trips.routes.js
router.get('/', tripController.list);
router.post('/', validate(createTripSchema), tripController.create);

// controllers/tripController.js
async function create(req, res, next) {
  try {
    const trip = await tripService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: trip });
  } catch (err) { next(err); }
}

// services/tripService.js
async function create(userId, data) {
  return prisma.trip.create({ data: { ...data, userId } });
}
```

## Auth middleware

```javascript
// Reads JWT from cookie `token`
// Sets req.user = { id, email, name }
// Returns 401 if missing/invalid
```

## Validation

Use Zod schemas in `validators/` with a reusable middleware:

```javascript
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: result.error.message },
      });
    }
    req.body = result.data;
    next();
  };
}
```

## Ownership checks

Before any trip/stop mutation:

```javascript
const trip = await prisma.trip.findUnique({ where: { id: tripId } });
if (!trip) throw notFound('Trip not found');
if (trip.userId !== req.user.id) throw forbidden();
```

## Error middleware

Maps thrown errors to consistent responses:

| Error type | Status | Code |
|------------|--------|------|
| Not found | 404 | `NOT_FOUND` |
| Forbidden | 403 | `FORBIDDEN` |
| Validation | 400 | `VALIDATION_ERROR` |
| Conflict | 409 | `CONFLICT` |
| Unauthorized | 401 | `UNAUTHORIZED` |
| Default | 500 | `INTERNAL_ERROR` |

## Budget service

`services/budgetService.js` — see [api/budget.md](./api/budget.md) and [DATABASE.md](./DATABASE.md) for calculation logic. Called by `GET /api/trips/:id/budget`.

## Share service

- `enableShare(tripId)` — sets `isPublic=true`, generates unique `shareSlug`
- `getPublicTrip(slug)` — returns trip with stops/activities, no user data
- `duplicateTrip(tripId, newUserId)` — deep copy for "Copy Trip"

## Seed script

`prisma/seed.js` — populates cities, activities, demo user + trip. Run with `npm run seed`.

## Scripts

```json
{
  "dev": "node --watch src/server.js",
  "start": "node src/server.js",
  "seed": "node prisma/seed.js"
}
```

## API documentation

All endpoint contracts live in [docs/api/](./api/). Implement exactly those shapes.

## NPM dependencies (expected)

```
express, cors, cookie-parser, bcryptjs, jsonwebtoken, zod, @prisma/client
prisma (dev)
```
