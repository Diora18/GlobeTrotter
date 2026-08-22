# Activities API

Browse the activity catalog (seed data), filtered by city and preferences.

---

## GET /api/activities

List activities with optional filters.

**Auth required:** No

### Query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cityId | string | — | **Required for builder** — filter by city |
| type | string | — | Activity type (see below) |
| maxCost | number | — | Max estimated cost in USD |
| minDuration | number | — | Min duration in minutes |
| maxDuration | number | — | Max duration in minutes |
| q | string | — | Search by name |
| limit | number | 50 | Max results |

### Example request

```
GET /api/activities?cityId=city-uuid-paris&type=sightseeing&maxCost=50
```

### Success response — 200

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act-uuid-eiffel",
        "cityId": "city-uuid-paris",
        "name": "Eiffel Tower Visit",
        "description": "Visit the iconic Eiffel Tower with optional summit access",
        "type": "sightseeing",
        "estimatedCost": 30,
        "durationMinutes": 120,
        "imageUrl": "https://example.com/eiffel.jpg"
      },
      {
        "id": "act-uuid-louvre",
        "cityId": "city-uuid-paris",
        "name": "Louvre Museum",
        "description": "World-famous art museum",
        "type": "culture",
        "estimatedCost": 20,
        "durationMinutes": 180,
        "imageUrl": "https://example.com/louvre.jpg"
      }
    ]
  }
}
```

---

## GET /api/activities/:id

Get a single activity.

**Auth required:** No

### Success response — 200

```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "act-uuid-eiffel",
      "cityId": "city-uuid-paris",
      "name": "Eiffel Tower Visit",
      "description": "Visit the iconic Eiffel Tower",
      "type": "sightseeing",
      "estimatedCost": 30,
      "durationMinutes": 120,
      "imageUrl": "https://example.com/eiffel.jpg"
    }
  }
}
```

---

## Activity types

| Value | Description |
|-------|-------------|
| `sightseeing` | Landmarks, viewpoints, walking tours |
| `food` | Restaurants, food tours, cooking classes |
| `adventure` | Hiking, water sports, extreme activities |
| `culture` | Museums, theatre, local performances |
| `nightlife` | Bars, clubs, evening entertainment |

---

## Activity object shape

```json
{
  "id": "uuid",
  "cityId": "uuid",
  "name": "string",
  "description": "string",
  "type": "sightseeing | food | adventure | culture | nightlife",
  "estimatedCost": "number (USD)",
  "durationMinutes": "number",
  "imageUrl": "string | null"
}
```
