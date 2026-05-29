# Eventura Monorepo

A multi-tenant college event management platform. This monorepo contains the Next.js frontend and the Node.js + Express backend.

---

## 📁 Monorepo Structure

```
eventura-monorepo/
├── eventura/              ← Next.js 14 frontend (App Router, TypeScript, Tailwind CSS)
├── eventura-api/          ← Node.js + Express + TypeScript backend API
│   ├── src/
│   │   ├── config/        ← Prisma client, Redis client, env validation
│   │   ├── middleware/    ← Auth, RBAC, rate limiting, tenant isolation
│   │   ├── modules/       ← Feature modules (health check + future missions)
│   │   └── shared/        ← Utilities, types, constants
│   ├── prisma/
│   │   ├── schema.prisma  ← Complete schema with all models
│   │   ├── migrations/    ← Auto-generated Prisma migrations
│   │   └── seed.ts        ← Realistic test data
│   ├── .env               ← Local environment variables (do not commit)
│   └── .env.example       ← Template for required env vars
├── docker-compose.yml     ← PostgreSQL 16 + PgBouncer + Redis 7
└── docker-compose.prod.yml
```

---

## ✅ Prerequisites

- **Node.js** v20+ — [https://nodejs.org](https://nodejs.org)
- **Docker Desktop** — [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **npm** v9+

---

## 🚀 Getting Started

### 1. Start Docker services (PostgreSQL + PgBouncer + Redis)

From the monorepo root:

```bash
npm run docker:up
```

Wait until all 3 containers are healthy (check with `docker ps`).

### 2. Run database migrations

```bash
cd eventura-api && npm run db:migrate
```

### 3. Seed the database with test data

```bash
npm run db:seed
```

### 4. Start the backend API (port 4000)

```bash
npm run dev
```

Verify the backend is running: `GET http://localhost:4000/health`

### 5. Start the frontend (port 3000)

In a separate terminal:

```bash
cd ../eventura && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Useful Commands

| Command | Description |
|---|---|
| `npm run docker:up` | Start all Docker containers |
| `npm run docker:down` | Stop all Docker containers |
| `npm run docker:logs` | Tail Docker container logs |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (database browser) |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run dev` | Start API dev server with hot-reload |

---

## 🌐 Architecture Overview

- **Database**: PostgreSQL 16 via PgBouncer (connection pooler, transaction mode)
- **Cache / Sessions**: Redis 7 — JWT blacklist, rate limiting, QR nonces
- **Multi-tenancy**: Row-Level Security (RLS) + AsyncLocalStorage tenant context
- **Auth**: JWT (access + refresh tokens), Redis-backed blacklist, Google OAuth ready
- **Payments**: Razorpay Route for college-level fund splits
- **Media**: Cloudinary for event banners and certificate storage
- **Email**: Resend for transactional emails

---

## 📋 Environment Variables

Copy `eventura-api/.env.example` to `eventura-api/.env` and fill in all required values before starting the backend.
