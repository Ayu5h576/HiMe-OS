# HiMe OS Authentication System Architecture

Production-ready, layered authentication system for **HiMe OS**.

---

## 🏛️ Architectural Overview

The authentication module follows a clean 4-tier layered architecture enforcing SOLID principles:

```
[ HTTP Request ]
       │
       ▼
1. Routes (Fastify Route & Swagger OpenAPI Definitions)
       │
       ▼
2. Controllers (Zod Validation & HTTP Orchestration)
       │
       ▼
3. Services (Domain Business Logic & Bcrypt / JWT Hashing)
       │
       ▼
4. Repositories (Prisma Client Encapsulation)
       │
       ▼
[ PostgreSQL Database ]
```

---

## 🔐 Token Architecture & Refresh Token Extension Point

### Access & Refresh Token Pair Structure
Authentication responses return a user object and token pair:

```json
{
  "user": {
    "id": "c61b2d07-88d4-4a47-a89e-21ef65b9d365",
    "name": "Ayush",
    "email": "ayush@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2026-07-23T11:45:00.000Z",
    "updatedAt": "2026-07-23T11:45:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Environment Configuration
- `JWT_SECRET`: Secret key used for signing access tokens.
- `JWT_EXPIRES_IN`: Short-lived access token duration (default: `15m`).
- `JWT_REFRESH_SECRET`: Secret key for refresh token verification.
- `JWT_REFRESH_EXPIRES_IN`: Long-lived refresh token duration (default: `7d`).

### Extension Point for Statefulness / Session Persistence
To persist refresh tokens in PostgreSQL or Redis in future iterations, extend `schema.prisma` with a `RefreshToken` model (`id`, `userId`, `token`, `expiresAt`, `revoked`) and inject token persistence inside `AuthService.generateTokens()`. The API contract (`accessToken` + `refreshToken`) remains 100% stable and client-compatible.

---

## 🚦 API Endpoints

### 1. Register User Account
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "name": "Ayush",
    "email": "ayush@example.com",
    "password": "Password123"
  }
  ```
- **Response**: HTTP 201 Created with `{ user, accessToken, refreshToken }`.
- **Errors**:
  - `400 Bad Request`: Validation failure (short password, invalid email format).
  - `409 Conflict`: Email already registered.

### 2. Login User Account
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "ayush@example.com",
    "password": "Password123"
  }
  ```
- **Response**: HTTP 200 OK with `{ user, accessToken, refreshToken }`.
- **Errors**:
  - `401 Unauthorized`: Invalid credentials or deactivated account.

### 3. Get Current User Profile (Protected Route)
- **Endpoint**: `GET /auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: HTTP 200 OK with `{ user }`.
- **Errors**:
  - `401 Unauthorized`: Missing, expired, or malformed JWT token.

---

## 🔮 Future Module Extension Plan

The authentication system lays the foundation for all upcoming HiMe OS domain modules:

1. **Users Module** (`/users`): Role-based access control (RBAC) utilizing `UserRole.ADMIN` and `UserRole.USER`.
2. **Projects Module** (`/projects`): User-owned AI & engineering projects mapped to `user.id`.
3. **Tasks Module** (`/tasks`): Automated task queues associated with projects and user context.
4. **Memory Engine Module** (`/memory`): Vector embeddings and semantic memory logs attached to `user.id`.
5. **AI Conversations Module** (`/ai/chats`): Chat sessions and contextual prompts scoped to authenticated users.
6. **Devices & IoT Module** (`/devices`): Device telemetry, MQTT access tokens, and smart home node management.
7. **Automations Module** (`/automations`): Node-RED / trigger-action automation flows guarded by JWT authentication.
8. **Notifications Module** (`/notifications`): Push notifications and webhooks per user context.
9. **Settings Module** (`/settings`): User preferences, API key management, and system theme configurations.
