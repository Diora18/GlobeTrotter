# Share & Public API

Public trip sharing and copy functionality.

---

## POST /api/trips/:id/share

Enable public sharing for a trip. Generates a unique share slug.

**Auth required:** Yes (trip owner)

### Request body

None

### Success response — 200

```json
{
  "success": true,
  "data": {
    "shareUrl": "http://localhost:5173/share/europe-summer-a1b2",
    "shareSlug": "europe-summer-a1b2",
    "isPublic": true
  }
}
```

If already shared, returns existing slug (idempotent).

### Slug generation

Format: `{slugified-trip-name}-{4-char-random}`

Example: `"Europe Summer"` → `europe-summer-a1b2`

---

## DELETE /api/trips/:id/share

Make a trip private again.

**Auth required:** Yes (trip owner)

### Success response — 200

```json
{
  "success": true,
  "data": {
    "isPublic": false,
    "shareSlug": null
  }
}
```

---

## GET /api/public/trips/:slug

View a public trip. **No authentication required.**

### Success response — 200

```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trip-uuid-1",
      "name": "Europe Summer",
      "startDate": "2026-06-01",
      "endDate": "2026-06-15",
      "description": "Two week adventure through Europe",
      "coverPhotoUrl": "https://example.com/cover.jpg",
      "shareSlug": "europe-summer-a1b2",
      "ownerName": "Jane Doe",
      "stops": [
        {
          "id": "stop-uuid-1",
          "city": {
            "name": "Paris",
            "country": "France",
            "imageUrl": "https://example.com/paris.jpg"
          },
          "arrivalDate": "2026-06-01",
          "departureDate": "2026-06-05",
          "orderIndex": 0,
          "activities": [
            {
              "id": "stop-act-uuid-1",
              "activity": {
                "name": "Eiffel Tower Visit",
                "type": "sightseeing",
                "estimatedCost": 30,
                "durationMinutes": 120,
                "imageUrl": "https://example.com/eiffel.jpg"
              },
              "scheduledAt": "2026-06-02T10:00:00.000Z",
              "effectiveCost": 30
            }
          ]
        }
      ]
    }
  }
}
```

**Privacy notes:**
- Does NOT expose owner email or user ID
- Only `ownerName` (display name) is shown
- Only trips with `isPublic: true` are accessible

### Error responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | Slug not found or trip is private |

---

## POST /api/trips/:id/duplicate

Copy a trip to the logged-in user's account.

Documented in [trips.md](./trips.md).

**Auth required:** Yes

Used from public view: viewer clicks "Copy Trip" → calls this with the public trip's ID.

---

## Frontend routes

| Route | API |
|-------|-----|
| `/share/:slug` | `GET /api/public/trips/:slug` |
| Share button (owner) | `POST /api/trips/:id/share` |
| Copy trip button (viewer) | `POST /api/trips/:id/duplicate` |

---

## Social sharing (P2 — frontend only)

No backend needed. Frontend uses Web Share API or copies URL to clipboard:

```javascript
const url = `${window.location.origin}/share/${shareSlug}`;
await navigator.clipboard.writeText(url);
```
