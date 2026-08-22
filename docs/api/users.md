# Users API

Profile management for authenticated users.

---

## GET /api/users/me

Get current user profile.

**Auth required:** Yes

### Success response — 200

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "language": "en",
      "createdAt": "2026-01-15T08:00:00.000Z"
    }
  }
}
```

Note: Same shape as `GET /api/auth/me`. Either endpoint works; prefer `/api/auth/me` for session checks, `/api/users/me` for profile page.

---

## PATCH /api/users/me

Update profile fields.

**Auth required:** Yes

### Request body

All fields optional:

```json
{
  "name": "Jane Smith",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "language": "fr"
}
```

| Field | Type | Rules |
|-------|------|-------|
| name | string | 1–100 chars |
| avatarUrl | string | Valid URL or null |
| language | string | ISO code: `en`, `fr`, `es`, etc. |

Email change is out of scope for MVP.

### Success response — 200

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "Jane Smith",
      "avatarUrl": "https://example.com/new-avatar.jpg",
      "language": "fr"
    }
  }
}
```

---

## DELETE /api/users/me

Delete account and all associated data (trips, stops, saved destinations).

**Auth required:** Yes

### Request body

Optional confirmation:

```json
{
  "confirm": true
}
```

### Success response — 200

```json
{
  "success": true,
  "data": { "message": "Account deleted" }
}
```

Clears auth cookie.

---

## GET /api/users/me/saved-destinations

List cities saved by the user.

**Auth required:** Yes  
**Priority:** P2

### Success response — 200

```json
{
  "success": true,
  "data": {
    "savedDestinations": [
      {
        "id": "saved-uuid-1",
        "city": {
          "id": "city-uuid-tokyo",
          "name": "Tokyo",
          "country": "Japan",
          "region": "Asia",
          "costIndex": 7,
          "imageUrl": "https://example.com/tokyo.jpg"
        },
        "savedAt": "2026-04-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

## POST /api/users/me/saved-destinations

Save a city to user's list.

**Auth required:** Yes  
**Priority:** P2

### Request body

```json
{
  "cityId": "city-uuid-tokyo"
}
```

### Success response — 201

```json
{
  "success": true,
  "data": {
    "savedDestination": {
      "id": "saved-uuid-1",
      "cityId": "city-uuid-tokyo",
      "savedAt": "2026-04-01T12:00:00.000Z"
    }
  }
}
```

---

## DELETE /api/users/me/saved-destinations/:cityId

Remove a saved city.

**Auth required:** Yes  
**Priority:** P2

### Success response — 200

```json
{
  "success": true,
  "data": { "message": "Destination removed" }
}
```
