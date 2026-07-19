# HiMe OS - Session Memory

## Project Overview
**Name:** HiMe OS - AI Operating System
**Repo:** Ayu5h576/HiMe-OS
**Current Phase:** 2 (Backend Setup)
**Last Updated:** [UPDATE THIS DAILY]

## Architecture Summary
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Fastify + PostgreSQL + Prisma + Redis
- **AI Models:** Claude, OpenAI, Gemini
- **Mobile:** Flutter (Phase 6)
- **Desktop:** Rust/Node.js (Phase 5)
- **IoT:** MQTT Protocol (Phase 7)

## Recent Progress
✅ **Completed:**
- Frontend MVP (all 12 pages)
- Dashboard design
- Chat interface UI
- Navigation system
- Responsive layout

🟡 **In Progress:**
- Backend Setup (#2)
- Authentication System (#1)
- Chat API (#3)

⏳ **Planned:**
- Memory Service (#4)
- Desktop Agent (#5)
- Android App (#6)
- Voice Assistant (#7)
- IoT Integration (#8)

## Current Working Tasks
**Issue #2: Backend Setup**
- Status: 70% Complete
- Files Modified:
  - backend/src/config/database.ts
  - backend/prisma/schema.prisma
  - backend/.env.example
  - backend/package.json

**Issue #1: Authentication**
- Status: 30% Complete
- Next: Implement JWT middleware

## Technical Stack Details
### Database
- PostgreSQL 15+
- Prisma ORM
- pgvector for embeddings

### Cache
- Redis 7+
- Used for sessions & rate limiting

### API
- Fastify web framework
- REST endpoints
- WebSocket support

### Authentication
- JWT tokens
- Password hashing (bcrypt)
- OAuth2 (planned)

## Critical Configuration Files
- `backend/.env.example` - Environment template
- `backend/prisma/schema.prisma` - Database schema
- `backend/package.json` - Dependencies
- `backend/tsconfig.json` - TypeScript config

## Key Decisions Made
1. **Framework:** Fastify (not Express) - for speed & modern features
2. **Database:** PostgreSQL - for scalability & pgvector support
3. **ORM:** Prisma - for type safety
4. **Auth:** JWT + Redis sessions - for distributed systems
5. **AI Models:** Multi-model routing - not locked to one provider

## Known Issues & Blockers
- None currently

## Next Session Checklist
- [ ] Review updated schema
- [ ] Implement password hashing
- [ ] Create JWT middleware
- [ ] Test auth endpoints

## Questions for Next Session
1. Should OAuth be implemented now or later?
2. What should be the JWT expiry time?
3. Should we add 2FA from start?

## Code Snippets (Reference)
### Database Connection
```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "fastify": "^4.25.0",
    "@prisma/client": "^5.7.0",
    "jsonwebtoken": "^9.1.0",
    "bcrypt": "^5.1.1",
    "redis": "^4.6.0"
  }
}
```
