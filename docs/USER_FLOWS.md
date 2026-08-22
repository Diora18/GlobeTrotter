# User Flows

Visual flows for the main journeys through the app.

## Authentication

```mermaid
flowchart TD
    A[Landing / Login] --> B{Has account?}
    B -->|No| C[Sign up form]
    B -->|Yes| D[Login form]
    C --> E[POST /api/auth/register]
    D --> F[POST /api/auth/login]
    E --> G[Set cookie, redirect to Dashboard]
    F --> G
    G --> H[GET /api/auth/me on app load]
```

## Create and build a trip

```mermaid
flowchart TD
    A[Dashboard] --> B[Click Plan New Trip]
    B --> C[Create Trip form]
    C --> D[POST /api/trips]
    D --> E[Itinerary Builder]
    E --> F[Search & add cities]
    F --> G[POST /api/trips/:id/stops]
    G --> H[Browse activities for stop]
    H --> I[POST /api/stops/:id/activities]
    I --> J{More stops?}
    J -->|Yes| F
    J -->|No| K[View Itinerary]
    K --> L[Check Budget]
    L --> M[View Calendar]
```

## Share a trip

```mermaid
flowchart TD
    A[Trip detail / Itinerary View] --> B[Click Share]
    B --> C[POST /api/trips/:id/share]
    C --> D[Receive public URL with slug]
    D --> E[Copy link / share on social]
    E --> F[Viewer opens /share/:slug]
    F --> G[GET /api/public/trips/:slug]
    G --> H[Read-only itinerary view]
    H --> I{Viewer logged in?}
    I -->|Yes| J[Click Copy Trip]
    I -->|No| K[Prompt to sign up]
    J --> L[POST /api/trips/:id/duplicate]
    L --> M[New trip in viewer's account]
```

## Trip ownership and access



| Action | Required auth | Ownership check |
|--------|---------------|-----------------|
| Create trip | Yes | Auto-assigned to user |
| View own trip | Yes | `trip.userId === user.id` |
| Edit/delete trip | Yes | Owner only |
| View public trip | No | `trip.isPublic === true` |
| Copy public trip | Yes | Any public trip |



## Error paths

| Scenario | HTTP status | Code |
|----------|-------------|------|
| Not logged in | 401 | `UNAUTHORIZED` |
| Trip not found | 404 | `NOT_FOUND` |
| Trip belongs to another user | 403 | `FORBIDDEN` |
| Validation failure | 400 | `VALIDATION_ERROR` |
| Stop dates outside trip range | 400 | `INVALID_DATES` |
| Duplicate email on register | 409 | `EMAIL_EXISTS` |
