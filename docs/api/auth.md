# Auth API

Authentication via JWT in httpOnly cookie (`token`).

---

## POST /api/auth/register

Create a new account.

**Auth required:** No

### Request body

```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "Jane Doe"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| email | string | yes | Valid email format |
| password | string | yes | Min 8 characters |
| name | string | yes | Min 1 character |

### Success response — 201

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatarUrl": null,
      "language": "en"
    }
  }
}
```

Sets `token` cookie (httpOnly, sameSite=lax).

### Error responses

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid email or short password |
| 409 | `EMAIL_EXISTS` | Email already registered |

---

## POST /api/auth/login

Log in with existing credentials.

**Auth required:** No

### Request body

```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

### Success response — 200

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatarUrl": null,
      "language": "en"
    }
  }
}
```

Sets `token` cookie.

### Error responses

| Status | Code | When |
|--------|------|------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |

---

## POST /api/auth/logout

Clear session.

**Auth required:** No (clears cookie regardless)

### Request body

None

### Success response — 200

```json
{
  "success": true,
  "data": { "message": "Logged out" }
}
```

Clears `token` cookie.

---

## GET /api/auth/me

Get current logged-in user.

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
      "language": "en"
    }
  }
}
```

### Error responses

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | No valid cookie |

---

## User object shape

Used across auth and user endpoints:

```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "avatarUrl": "string | null",
  "language": "string"
}
```

Password hash is **never** returned in responses.
