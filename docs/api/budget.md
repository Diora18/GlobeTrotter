# Budget API

Computed budget breakdown for a trip. Nothing is stored — calculated on each request.

---

## GET /api/trips/:id/budget

Get full budget breakdown for a trip.

**Auth required:** Yes (trip owner)

### Success response — 200

```json
{
  "success": true,
  "data": {
    "budget": {
      "tripId": "trip-uuid-1",
      "totalEstimated": 2450,
      "tripDays": 15,
      "averagePerDay": 163,
      "byCategory": {
        "transport": 350,
        "stay": 1200,
        "activities": 450,
        "meals": 450
      },
      "byDay": [
        {
          "date": "2026-06-01",
          "amount": 180,
          "breakdown": {
            "transport": 120,
            "stay": 40,
            "activities": 0,
            "meals": 20
          }
        },
        {
          "date": "2026-06-02",
          "amount": 95,
          "breakdown": {
            "transport": 0,
            "stay": 40,
            "activities": 30,
            "meals": 25
          }
        }
      ],
      "byStop": [
        {
          "stopId": "stop-uuid-1",
          "cityName": "Paris",
          "total": 950,
          "nights": 4,
          "breakdown": {
            "transport": 120,
            "stay": 600,
            "activities": 130,
            "meals": 100
          }
        }
      ],
      "alerts": [
        {
          "date": "2026-06-10",
          "message": "Daily spend exceeds $200",
          "amount": 220
        }
      ]
    }
  }
}
```

### Field notes

| Field | Description |
|-------|-------------|
| totalEstimated | Sum of all categories |
| tripDays | Inclusive days from startDate to endDate |
| averagePerDay | totalEstimated / tripDays (rounded) |
| byCategory | Totals across entire trip |
| byDay | Per-day breakdown for calendar/chart |
| byStop | Per-city breakdown |
| alerts | Days where spend exceeds threshold (default $200/day) — P2 feature, can return `[]` in MVP |

---

## Calculation rules

Constants (define in `backend/src/utils/budget.js`):

```javascript
const MEALS_PER_DAY = 50;        // USD
const DAILY_BUDGET_ALERT = 200;  // USD
const STAY_COST_PER_INDEX = 50;  // USD per night per costIndex point
```

### Transport
```
transport = sum(stop.estimatedTransportCost) for all stops
```

### Stay
```
stay = sum(stop.estimatedStayCost) for all stops

// If estimatedStayCost not set on create:
nights = departureDate - arrivalDate (in days)
estimatedStayCost = nights × city.costIndex × STAY_COST_PER_INDEX
```

### Activities
```
activities = sum(stopActivity.effectiveCost) for all stops
effectiveCost = stopActivity.costOverride ?? activity.estimatedCost
```

### Meals
```
meals = tripDays × MEALS_PER_DAY
```

### Per-day allocation

For `byDay`:
- **Transport:** assigned to stop's arrival day
- **Stay:** spread evenly across stop's nights
- **Activities:** assigned to activity's scheduledAt date (or stop arrival date if no scheduledAt)
- **Meals:** spread evenly across all trip days

### Error responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | Trip not found |
| 403 | `FORBIDDEN` | Not trip owner |

---

## Category chart data

Frontend can map `byCategory` directly to Recharts:

```javascript
const chartData = Object.entries(budget.byCategory).map(([name, value]) => ({
  name: name.charAt(0).toUpperCase() + name.slice(1),
  value,
}));
```
