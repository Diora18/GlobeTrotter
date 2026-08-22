# Admin API

Platform analytics. **Stretch goal (P3)** — implement only if core MVP is complete.

---

## Access control

Admin endpoints require:
1. Valid auth cookie
2. User with `isAdmin: true` on the user record

Add `isAdmin` boolean field to User model (default `false`). Set `true` for admin user in seed script.

---

## GET /api/admin/stats

Aggregate platform statistics.

**Auth required:** Yes (admin only)

### Success response — 200

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 42,
      "totalTrips": 128,
      "publicTrips": 15,
      "totalStops": 384,
      "topCities": [
        {
          "cityId": "city-uuid-paris",
          "name": "Paris",
          "country": "France",
          "stopCount": 45
        },
        {
          "cityId": "city-uuid-rome",
          "name": "Rome",
          "country": "Italy",
          "stopCount": 38
        }
      ],
      "topActivities": [
        {
          "activityId": "act-uuid-eiffel",
          "name": "Eiffel Tower Visit",
          "cityName": "Paris",
          "usageCount": 22
        }
      ],
      "tripsCreatedByMonth": [
        { "month": "2026-03", "count": 12 },
        { "month": "2026-04", "count": 28 },
        { "month": "2026-05", "count": 45 }
      ]
    }
  }
}
```

### Error responses

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | User is not admin |

---

## GET /api/admin/users

List all users (basic info only).

**Auth required:** Yes (admin only)  
**Priority:** P3

### Query params

| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 20 |

### Success response — 200

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid-1",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "tripCount": 3,
        "createdAt": "2026-01-15T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

---

## Admin user in seed

```javascript
// prisma/seed.js
await prisma.user.upsert({
  where: { email: 'admin@globetrotter.com' },
  update: {},
  create: {
    email: 'admin@globetrotter.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    name: 'Admin',
    isAdmin: true,
  },
});
```

---

## Frontend

Route `/admin` — protected by admin check. Redirect non-admins to dashboard.

Show charts (Recharts) for:
- Trips over time (bar chart)
- Top cities (horizontal bar)
- User/trip counts (stat cards)
