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
└── backend/         # Laravel API (Dockerfile → Railway + Neon)
    ├── Dockerfile
    ├── railway.toml
    └── docker/
```

## Tech Stack

| App | Stack |
|---|---|
| User Frontend | Next.js, React, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Lucide |
| Admin Frontend | Next.js, React, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Lucide |
| Backend | Laravel, Sanctum, PostgreSQL |
| Media | Cloudinary (product images) |

## Prerequisites

- Node.js 20+
- PHP 8.4+ (required by Laravel 13)
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

### Local vs production

| Concern | Local | Production |
|---|---|---|
| Database | PostgreSQL on `127.0.0.1` (`v2005_data`) via `backend/.env` | [Neon](https://neon.tech) via host env / `backend/.env.production` |
| Images / media | Cloudinary (`v2005`) | Same Cloudinary cloud |

Keep secrets out of git. Templates: `backend/.env.example` (local) and `backend/.env.production.example` (Neon).

### user-frontend / admin-frontend

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### backend (local)

```text
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=v2005_data
DB_USERNAME=postgres
DB_PASSWORD=
DB_SSLMODE=prefer
CLOUDINARY_CLOUD_NAME=v2005
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=v2005/products
```

### backend (production / Neon)

Set these on your host (or copy from `.env.production.example`):

```text
DB_CONNECTION=pgsql
DB_URL=postgresql://neondb_owner:PASSWORD@HOST/neondb?sslmode=require
DB_SSLMODE=require
CLOUDINARY_CLOUD_NAME=v2005
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=v2005/products
```

After first deploy: `php artisan migrate --force` against Neon.

### Deploy backend to Railway (Dockerfile)

Files in `backend/`:

- `Dockerfile` — PHP 8.3 + Composer image
- `railway.toml` — health check `/up`
- `docker/entrypoint.sh` — migrate + serve on `$PORT`

**Steps**

1. Push the repo to GitHub (already done).
2. In [Railway](https://railway.app): **New Project** → **Deploy from GitHub** → select `v2005`.
3. Service settings:
   - **Root Directory:** `backend`
   - Builder uses `Dockerfile` automatically (`railway.toml`).
4. Add a public domain under **Settings → Networking**.
5. Set variables (Variables tab) — use Neon + Cloudinary, not local Postgres:

```text
APP_NAME=V2005
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATE_WITH_php_artisan_key_generate_--show
APP_URL=https://YOUR-SERVICE.up.railway.app
LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_URL=postgresql://neondb_owner:PASSWORD@ep-....neon.tech/neondb?sslmode=require
DB_HOST=ep-divine-hill-b3dw3jxr.c-4.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=YOUR_NEON_PASSWORD
DB_SSLMODE=require

CLOUDINARY_CLOUD_NAME=v2005
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=v2005/products

FRONTEND_USER_URL=https://your-storefront.vercel.app
FRONTEND_ADMIN_URL=https://your-admin.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-storefront.vercel.app,your-admin.vercel.app
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

6. Redeploy. Entrypoint runs `php artisan migrate --force` then serves the API.
7. Health: `https://YOUR-SERVICE.up.railway.app/up` and `/api/v1/health`.

Generate `APP_KEY` locally: `cd backend && php artisan key:generate --show`.

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
