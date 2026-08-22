# Trips API

Manage user trips. All endpoints require authentication unless noted.

---

## GET /api/trips

List trips for the logged-in user.

**Auth required:** Yes

### Query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| sort | string | `upcoming` | `upcoming`, `recent`, `created` |
| limit | number | all | Max trips to return |

### Success response — 200

```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "trip-uuid-1",
        "name": "Europe Summer",
        "startDate": "2026-06-01",
        "endDate": "2026-06-15",
        "description": "Two week adventure",
        "coverPhotoUrl": "https://example.com/cover.jpg",
        "isPublic": false,
        "shareSlug": null,
        "stopCount": 3,
        "createdAt": "2026-05-01T10:00:00.000Z",
        "updatedAt": "2026-05-10T12:00:00.000Z"
      }
    ]
  }
}
```

---

## POST /api/trips

Create a new trip.

**Auth required:** Yes

### Request body

```json
{
  "name": "Europe Summer",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "description": "Two week adventure",
  "coverPhotoUrl": "https://example.com/cover.jpg"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| name | string | yes | 1–100 chars |
| startDate | string | yes | ISO date |
| endDate | string | yes | ISO date, >= startDate |
| description | string | no | Max 2000 chars |
| coverPhotoUrl | string | no | Valid URL |

### Success response — 201

```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trip-uuid-1",
      "name": "Europe Summer",
      "startDate": "2026-06-01",
      "endDate": "2026-06-15",
      "description": "Two week adventure",
      "coverPhotoUrl": "https://example.com/cover.jpg",
      "isPublic": false,
      "shareSlug": null,
      "stops": [],
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-01T10:00:00.000Z"
    }
  }
}
```

---

## GET /api/trips/:id

Get trip detail with stops and activities.

**Auth required:** Yes (must be owner)

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
      "description": "Two week adventure",
      "coverPhotoUrl": "https://example.com/cover.jpg",
      "isPublic": true,
      "shareSlug": "europe-summer-a1b2",
      "stops": [
        {
          "id": "stop-uuid-1",
          "cityId": "city-uuid-paris",
          "city": {
            "id": "city-uuid-paris",
            "name": "Paris",
            "country": "France",
            "region": "Europe",
            "costIndex": 8,
            "imageUrl": "https://example.com/paris.jpg"
          },
          "arrivalDate": "2026-06-01",
          "departureDate": "2026-06-05",
          "orderIndex": 0,
          "estimatedStayCost": 600,
          "estimatedTransportCost": 120,
          "activities": [
            {
              "id": "stop-act-uuid-1",
              "activityId": "act-uuid-eiffel",
              "activity": {
                "id": "act-uuid-eiffel",
                "name": "Eiffel Tower Visit",
                "type": "sightseeing",
                "estimatedCost": 30,
                "durationMinutes": 120,
                "imageUrl": "https://example.com/eiffel.jpg"
              },
              "scheduledAt": "2026-06-02T10:00:00.000Z",
              "costOverride": null,
              "orderIndex": 0
            }
          ]
        }
      ],
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-10T12:00:00.000Z"
    }
  }
}
```

### Error responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | Trip does not exist |
| 403 | `FORBIDDEN` | Not the owner |

---

## PATCH /api/trips/:id

Update trip metadata.

**Auth required:** Yes (owner)

### Request body

All fields optional:

```json
{
  "name": "Updated Trip Name",
  "startDate": "2026-06-02",
  "endDate": "2026-06-16",
  "description": "Updated description",
  "coverPhotoUrl": "https://example.com/new-cover.jpg"
}
```

### Success response — 200

Returns updated trip object (same shape as GET, without nested stops if not loaded).

```json
{
  "success": true,
  "data": {
    "trip": { }
  }
}
```

---

## DELETE /api/trips/:id

Delete a trip and all its stops/activities (cascade).

**Auth required:** Yes (owner)

### Success response — 200

```json
{
  "success": true,
  "data": { "message": "Trip deleted" }
}
```

---

## POST /api/trips/:id/duplicate

Copy a trip to the logged-in user's account. Used for "Copy Trip" from public view.

**Auth required:** Yes

### Request body

None (or optional override):

```json
{
  "name": "Copy of Europe Summer"
}
```

If `name` omitted, defaults to `"Copy of {originalName}"`.

### Success response — 201

```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "new-trip-uuid",
      "name": "Copy of Europe Summer",
      "startDate": "2026-06-01",
      "endDate": "2026-06-15",
      "isPublic": false,
      "shareSlug": null,
      "stops": []
    }
  }
}
```

Note: duplicated trip is **private** with a new ID. Stops and activities are deep-copied.

### Error responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | Source trip not found |
| 403 | `FORBIDDEN` | Source trip is private and not owned by user |

For public trips, any authenticated user may duplicate.
