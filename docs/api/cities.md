# Cities API

Search and browse the city catalog (seed data).

---

## GET /api/cities

Search and list cities.

**Auth required:** No

### Query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | — | Search by city name (case-insensitive) |
| country | string | — | Filter by country name |
| region | string | — | Filter by region (e.g. `Europe`, `Asia`) |
| sort | string | `popularity` | `popularity`, `name`, `costIndex` |
| limit | number | 20 | Max results |

### Example request

```
GET /api/cities?q=paris&region=Europe&limit=10
```

### Success response — 200

```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "id": "city-uuid-paris",
        "name": "Paris",
        "country": "France",
        "region": "Europe",
        "costIndex": 8,
        "popularity": 95,
        "imageUrl": "https://example.com/paris.jpg"
      },
      {
        "id": "city-uuid-rome",
        "name": "Rome",
        "country": "Italy",
        "region": "Europe",
        "costIndex": 7,
        "popularity": 90,
        "imageUrl": "https://example.com/rome.jpg"
      }
    ]
  }
}
```

---

## GET /api/cities/:id

Get a single city by ID.

**Auth required:** No

### Success response — 200

```json
{
  "success": true,
  "data": {
    "city": {
      "id": "city-uuid-paris",
      "name": "Paris",
      "country": "France",
      "region": "Europe",
      "costIndex": 8,
      "popularity": 95,
      "imageUrl": "https://example.com/paris.jpg"
    }
  }
}
```

### Error responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | City not found |

---

## City object shape

```json
{
  "id": "uuid",
  "name": "string",
  "country": "string",
  "region": "string",
  "costIndex": "number (1-10)",
  "popularity": "number (0-100)",
  "imageUrl": "string | null"
}
```

**costIndex:** Relative expense rating. Higher = more expensive. Used for stay cost estimates.

**popularity:** Used for dashboard recommendations and sorting.
