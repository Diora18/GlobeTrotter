# API Reference

Base URL: `http://localhost:3001/api`

Both devs run locally. Frontend points to this via Vite proxy or `VITE_API_URL`.

## Response format

All responses use this envelope:

### Success

```json
{
  "success": true,
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

## HTTP status codes

| Status | When |
|--------|------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Validation error, bad input |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Server error |

## Error codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body failed validation |
| `UNAUTHORIZED` | Missing or invalid auth |
| `FORBIDDEN` | Not owner of resource |
| `NOT_FOUND` | Resource does not exist |
| `EMAIL_EXISTS` | Email already registered |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `INVALID_DATES` | Stop dates outside trip range |
| `CONFLICT` | General conflict |
| `INTERNAL_ERROR` | Unexpected server error |

## Authentication

Auth uses **JWT stored in an httpOnly cookie** named `token`.

- Login/register responses set the cookie automatically
- Send cookies with every request: `credentials: 'include'` (frontend)
- Protected endpoints return `401` if cookie is missing or expired
- Logout clears the cookie

## Pagination (optional)

List endpoints may support:

```
GET /api/cities?page=1&limit=20
```

Response includes:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

Not all list endpoints require pagination in MVP — cities/activities may return all matches up to a limit.

## Date format

All dates in JSON: ISO 8601

- Date only: `"2026-08-22"`
- DateTime: `"2026-08-22T14:00:00.000Z"`

## Money format

All costs in **USD whole dollars** (integer or decimal, e.g. `150` or `49.99`).

## Endpoint index

| Domain | File |
|--------|------|
| Auth | [auth.md](./auth.md) |
| Trips | [trips.md](./trips.md) |
| Stops | [stops.md](./stops.md) |
| Stop activities | [stop-activities.md](./stop-activities.md) |
| Cities | [cities.md](./cities.md) |
| Activities catalog | [activities.md](./activities.md) |
| Budget | [budget.md](./budget.md) |
| Share / public | [share.md](./share.md) |
| Users | [users.md](./users.md) |
| Admin | [admin.md](./admin.md) |
