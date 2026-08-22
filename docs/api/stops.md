# Stops API

Manage cities/stops within a trip.

---

## POST /api/trips/:tripId/stops

Add a city stop to a trip.

**Auth required:** Yes (trip owner)

### Request body

```json
{
  "cityId": "city-uuid-paris",
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-05",
  "estimatedTransportCost": 120,
  "estimatedStayCost": 600
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| cityId | string | yes | Must exist in cities table |
| arrivalDate | string | yes | Within trip date range |
| departureDate | string | yes | >= arrivalDate, within trip range |
| estimatedTransportCost | number | no | Default 0 |
| estimatedStayCost | number | no | Auto-calculated from city costIndex × nights if omitted |

### Success response — 201

```json
{
  "success": true,
  "data": {
    "stop": {
      "id": "stop-uuid-1",
      "tripId": "trip-uuid-1",
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
      "activities": []
    }
  }
}
```

`orderIndex` is auto-assigned as last position.

### Error responses

| Status | Code | When |
|--------|------|------|
| 400 | `INVALID_DATES` | Dates outside trip range |
| 404 | `NOT_FOUND` | Trip or city not found |
| 403 | `FORBIDDEN` | Not trip owner |

---

## PATCH /api/stops/:id

Update a stop.

**Auth required:** Yes (trip owner)

### Request body

All fields optional:

```json
{
  "arrivalDate": "2026-06-02",
  "departureDate": "2026-06-06",
  "estimatedTransportCost": 150,
  "estimatedStayCost": 720
}
```

Cannot change `cityId` in MVP — delete and re-add stop instead.

### Success response — 200

```json
{
  "success": true,
  "data": {
    "stop": { }
  }
}
```

---

## DELETE /api/stops/:id

Remove a stop and its linked activities.

**Auth required:** Yes (trip owner)

### Success response — 200

```json
{
  "success": true,
  "data": { "message": "Stop deleted" }
}
```

---

## PATCH /api/trips/:tripId/stops/reorder

Reorder stops within a trip.

**Auth required:** Yes (trip owner)

### Request body

```json
{
  "orderedIds": ["stop-uuid-2", "stop-uuid-1", "stop-uuid-3"]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| orderedIds | string[] | yes | All stop IDs for this trip, new order |

### Success response — 200

```json
{
  "success": true,
  "data": {
    "stops": [
      { "id": "stop-uuid-2", "orderIndex": 0 },
      { "id": "stop-uuid-1", "orderIndex": 1 },
      { "id": "stop-uuid-3", "orderIndex": 2 }
    ]
  }
}
```

### Error responses

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | IDs don't match trip's stops |
