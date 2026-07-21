# HiMe OS Backend Architecture Foundation

Production-grade, modular, scalable, and secure backend foundation for **HiMe OS**.

---

## Tech Stack & Libraries

- **Runtime**: Node.js LTS
- **Language**: TypeScript (Strict Mode)
- **Framework**: Fastify v4
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication Foundation**: JWT (`@fastify/jwt`) & bcrypt (`bcrypt`)
- **Validation**: Zod
- **Logging**: Pino (`pino` & `pino-pretty`)
- **Environment Management**: dotenv & Zod schema validation
- **Testing**: Vitest
- **API Documentation**: Swagger / OpenAPI (`@fastify/swagger` & `@fastify/swagger-ui`)

---

## Folder Structure

```
backend/
├── src/
│   ├── config/             # Environment validation, Logger, DB connection singletons
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── logger.ts
│   │
│   ├── plugins/            # Fastify plugins (Prisma lifecycle, JWT, Swagger)
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   └── swagger.ts
│   │
│   ├── routes/             # REST Route aggregators and route modules
│   │   ├── index.ts
│   │   ├── health.route.ts
│   │   └── auth.route.ts
│   │
│   ├── controllers/        # Future HTTP Controllers
│   │   └── .gitkeep
│   │
│   ├── services/           # Future Business Logic Services
│   │   └── .gitkeep
│   │
│   ├── repositories/       # Future Database Access Repositories
│   │   └── .gitkeep
│   │
│   ├── middleware/         # Authentication, Global Error, & 404 Handlers
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   │
│   ├── schemas/            # Zod validation schemas
│   │   └── health.schema.ts
│   │
│   ├── types/              # TypeScript interfaces & Fastify type extensions
│   │   └── index.ts
│   │
│   ├── utils/              # Helper utilities (bcrypt hashing)
│   │   └── hash.ts
│   │
│   ├── app.ts              # Fastify App Builder function
│   └── server.ts           # Server Listener & Graceful Shutdown entry point
│
├── prisma/                 # Prisma ORM Schemas & Migrations
│   ├── schema.prisma
│   └── migrations/
│
├── tests/                  # Vitest API Unit and Integration Tests
│   └── health.test.ts
│
├── .env.example            # Environment template
├── .env                    # Local environment variables
├── .gitignore              # Git ignore configuration
├── package.json            # Dependencies & Scripts
├── tsconfig.json           # Strict TypeScript configuration
├── eslint.config.js        # ESLint 9+ flat configuration
├── prettier.config.js      # Prettier formatting rules
└── README.md               # Architecture documentation
```

---

## Architectural Decisions

1. **Fastify Framework**: Chosen for its industry-leading throughput, low memory footprint, strict encapsulation plugin architecture, and native JSON schema integration.
2. **Repository & Service Pattern**: Clean separation of database access, business rules, and HTTP presentation layers, allowing easy expansion as AI/IoT modules are added.
3. **Zod Environment Parsing**: Guarantees that the backend will refuse to start if essential environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) are missing or malformed.
4. **Pino Logging**: Asynchronous JSON logger providing structured telemetry without blocking the main event loop.
5. **Prisma ORM**: Provides compile-time type safety for PostgreSQL queries and seamless migration management.
6. **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to close open database pools and HTTP connections safely.

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:4000`.
Open API documentation is available at `http://localhost:4000/docs`.

### 4. Run Tests
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
npm start
```
