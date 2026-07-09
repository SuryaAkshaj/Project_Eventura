# Eventura Architecture Documentation

Welcome to the Eventura architectural documentation. This directory provides an end-to-end, entity-based view of the system, including data models, boundaries, and critical flows.

## Table of Contents

### 1. High-Level Overviews
- [Database Schema & ERD](./database-schema.md)

### 2. Entity Domains
- [Users & Roles](./entities/users-roles.md) - Global users, roles, and the Multi-Tier RBAC system.
- [Organizations](./entities/organizations.md) - Colleges, Clubs, and the federated multi-tenant system.
- [Events & Sessions](./entities/events.md) - Event templates, sessions, fests, and readiness checks.
- [Registrations & Payments](./entities/registrations-payments.md) - Ticketing queues, waitlists, and Razorpay splits.
- [Security & Audits](./entities/security-audits.md) - Event feedback, scanning logs, audits, and PDF certificates.

### 3. Core System Flows
- [QR Check-in Flow](./flows/qr-checkin.md) - The rotating nonce mechanism for fraud-proof check-ins.
- [Tenant Isolation](./flows/tenant-isolation.md) - Multi-tenancy logic using `AsyncLocalStorage` and Prisma extensions.

## System Context
Eventura consists of:
1. **Next.js Frontend (App Router)**: Client and server components, heavily utilizing Tailwind and Zustand.
2. **Express Backend API**: RESTful, modular Node.js/TypeScript backend processing domain logic.
3. **PostgreSQL**: The relational database source of truth.
4. **Redis**: In-memory store for rate limiting, JWT blacklisting, and QR check-in rotating nonces.
5. **PgBouncer**: Transaction-mode connection pooling for PostgreSQL.
