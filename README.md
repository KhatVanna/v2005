# V2005 E-Commerce Platform

Modern, professional e-commerce monorepo with a customer storefront, admin dashboard, and Laravel REST API.

## Architecture

```text
user-frontend (Next.js :3000)
        │
        │ REST /api/v1
        ▼
     backend (Laravel :8000)
        │
        ▼
   PostgreSQL (v2005_data)

admin-frontend (Next.js :3001)
        │
        │ REST /api/v1
        ▼
     backend (Laravel :8000)
```

## Project Structure

```text
V2005/
├── user-frontend/   # Public customer storefront
├── admin-frontend/  # Admin dashboard (separate Next.js app)
└── backend/         # Laravel API + PostgreSQL
```

## Tech Stack

| App | Stack |
|---|---|
| User Frontend | Next.js, React, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Lucide |
| Admin Frontend | Next.js, React, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Lucide |
| Backend | Laravel, Sanctum, PostgreSQL |

## Prerequisites

- Node.js 20+
- PHP 8.3+ (8.4 recommended)
- Composer 2+
- PostgreSQL 14+ with database `v2005_data`
- PHP extensions: `pdo_pgsql`, `pgsql`

## Phase 1 Status

Completed:

- Monorepo scaffold (`user-frontend`, `admin-frontend`, `backend`)
- Tailwind design tokens (light/dark)
- Environment variable templates
- Laravel Sanctum installed
- Versioned API (`/api/v1/health`)
- CORS configured for both frontends
- PostgreSQL connection targeting `v2005_data`

## Setup

### 1. PostgreSQL

Create the database in pgAdmin (or psql) if it does not already exist:

```sql
CREATE DATABASE v2005_data;
```

### 2. Backend

```bash
cd backend
copy .env.example .env   # Windows
# Set DB_USERNAME / DB_PASSWORD to match your PostgreSQL credentials
php artisan key:generate
php artisan migrate
php artisan serve
```

API health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 3. User Frontend

```bash
cd user-frontend
copy .env.example .env.local
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### 4. Admin Frontend

```bash
cd admin-frontend
copy .env.example .env.local
npm install
npm run dev
```

App: [http://localhost:3001](http://localhost:3001)

### Root helper scripts

From the repository root:

```bash
npm run dev:user
npm run dev:admin
npm run dev:api
```

## Environment Variables

### user-frontend / admin-frontend

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### backend

```text
APP_NAME=V2005
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=v2005_data
DB_USERNAME=postgres
DB_PASSWORD=
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001,127.0.0.1:3000,127.0.0.1:3001
```

Never commit real secrets.

## Development Phases

1. **Phase 1** — Project initialization *(current)*
2. Phase 2 — Database & Laravel foundation
3. Phase 3 — Authentication
4. Phase 4 — Product system
5. Phase 5 — User frontend catalog/cart
6. Phase 6 — Checkout & orders
7. Phase 7 — Admin frontend
8. Phase 8 — Advanced features
9. Phase 9 — Polish
10. Phase 10 — Testing & deployment

## Design System (V2005)

| Token | Light | Dark |
|---|---|---|
| Background | `#F8FAFC` | `#0F172A` |
| Card | `#FFFFFF` | `#1E293B` |
| Text | `#0F172A` | `#F8FAFC` |
| Primary | `#2563EB` | `#60A5FA` |
| Accent (sale) | `#F97316` | `#F97316` |
| Navy | `#0F172A` | — |

## License

Private project — V2005.
