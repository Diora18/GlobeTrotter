# Stop Activities API

Link catalog activities to a trip stop.

---

## POST /api/stops/:stopId/activities

Add an activity to a stop.

**Auth required:** Yes (trip owner)

### Request body

```json
{
  "activityId": "act-uuid-eiffel",
  "scheduledAt": "2026-06-02T10:00:00.000Z",
  "costOverride": null
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| activityId | string | yes | Must exist; should belong to stop's city |
| scheduledAt | string | no | ISO datetime; defaults to stop arrival date 09:00 |
| costOverride | number | no | Overrides catalog activity cost |

### Success response — 201

```json
{
  "success": true,
  "data": {
    "stopActivity": {
      "id": "stop-act-uuid-1",
      "stopId": "stop-uuid-1",
      "activityId": "act-uuid-eiffel",
      "activity": {
        "id": "act-uuid-eiffel",
        "name": "Eiffel Tower Visit",
        "description": "Iconic landmark with city views",
        "type": "sightseeing",
        "estimatedCost": 30,
        "durationMinutes": 120,
        "imageUrl": "https://example.com/eiffel.jpg"
      },
      "scheduledAt": "2026-06-02T10:00:00.000Z",
      "costOverride": null,
      "effectiveCost": 30,
      "orderIndex": 0
    }
  }
}
```

`effectiveCost` = `costOverride ?? activity.estimatedCost`

### Error responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | Stop or activity not found |
| 403 | `FORBIDDEN` | Not trip owner |
| 409 | `CONFLICT` | Activity already added to this stop |

---

## PATCH /api/stop-activities/:id

Update scheduled time, cost override, or order.

**Auth required:** Yes (trip owner)

### Request body

```json
{
  "scheduledAt": "2026-06-02T14:00:00.000Z",
  "costOverride": 25,
  "orderIndex": 1
}
```

All fields optional.

### Success response — 200

```json
{
  "success": true,
  "data": {
    "stopActivity": { }
  }
}
```

---

## DELETE /api/stop-activities/:id

Remove an activity from a stop.

**Auth required:** Yes (trip owner)

### Success response — 200

```json
{
  "success": true,
  "data": { "message": "Activity removed from stop" }
}
```

---

## Activity types (catalog filter values)

| Type | Description |
|------|-------------|
| `sightseeing` | Landmarks, museums, tours |
| `food` | Restaurants, food tours |
| `adventure` | Sports, outdoor activities |
| `culture` | Theatre, local events |
| `nightlife` | Bars, clubs, evening entertainment |
