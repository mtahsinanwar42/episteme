# Episteme

International Conference on Open Science and Knowledge Sharing.

## What This Web App Does

Episteme is a role-based conference/content platform for managing the full submission and review workflow.

### Public capabilities
- Browse conferences, trainings, activities, announcements, and blogs
- Read conference details and publication-style content pages
- View organization pages (mission, ethics, sustainability, executive, policies, career, contact)

### Authenticated user capabilities (`USER`)
- Register/login and manage account/profile/password
- Create and submit conference papers
- Upload new submission versions
- Track submission statuses (for example: pending approval, approved, rejected)
- Exchange messages with admins/reviewers on a submission thread
- Receive in-app notifications related to submissions

### Reviewer capabilities (`REVIEWER`)
- View assigned review tasks
- Accept/decline/update review assignment status
- Open submission versions and submit review decisions/comments
- Participate in review-related message/notification flow

### Admin capabilities (`ADMIN`)
- Full user management (create users, update status/roles)
- Manage conferences, trainings, activities, announcements, and blogs
- Manage files/assets and metadata-backed content
- Manage submissions: assign reviewers, update statuses, track reviews
- Access review assignment management and notification workflows

## Tech Stack
- Frontend: React + TypeScript + Vite (port `3000`)
- Backend: Node.js + Express + Sequelize (port `5000`)
- Database: PostgreSQL (schema `EPISTEME`)
- Messaging: Kafka (optional outside Docker; included in Docker Compose)
- File storage: local filesystem (`./storage`)

## Prerequisites

### Docker path
- Docker Desktop (with Compose)

### Non-Docker path
- Node.js `>=24.12.0`
- npm
- PostgreSQL
- `psql` CLI (for applying SQL migrations)

## Environment Setup

1. Backend env:
   - Copy `.env.example` to `.env`
   - Update DB credentials and other values if needed
2. Frontend env:
   - Ensure `frontend/.env` exists with:
   - `VITE_BACKEND_BASE_URL=http://localhost:5000`

## Run With Docker

1. Prepare env files:
   - `.env` (backend) and `frontend/.env` (frontend)
2. Start all services:
   - `docker compose up -d --build`
   - or `sh docker-start.sh`
3. Open app:
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:5000/health`
4. Stop:
   - `docker compose down --remove-orphans`
   - or `sh docker-stop.sh`
5. Destroy project containers + Kafka volume:
   - `sh docker-destroy.sh`

Notes:
- Compose runs `backend`, `frontend`, and `kafka`.
- Backend in Docker connects to PostgreSQL via `host.docker.internal`, so PostgreSQL should be running on your host machine.

## Run Without Docker

### 1) Install dependencies

From project root:

```bash
npm install
cd frontend
npm install
cd ..
```

### 2) Configure PostgreSQL and run migrations

Create schema/tables/indexes with the provided SQL files:

```bash
psql -U postgres -f backend/migrations/2026/1.0.0/init.sql
psql -U postgres -f backend/migrations/2026/1.0.0/pre-ddl.sql
psql -U postgres -f backend/migrations/2026/1.0.0/post-ddl.sql
```

If your PostgreSQL user/db differs, update the command flags and `.env` accordingly.

### 3) Start backend

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 4) Start frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Seed Demo Data (Optional)

After migrations are applied and backend env is configured:

```bash
npm run data:import
```

This imports sample users/content/submissions and creates a default admin:
- Email: `admin@episteme.org`
- Password: `admin`

To wipe seeded records:

```bash
npm run data:destroy
```

## API Base

- Base URL: `http://localhost:5000/api/v1`
- Route groups include: `auth`, `users`, `conferences`, `trainings`, `blogs`, `activities`, `announcements`, `submissions`, `review-assignments`, `notifications`, `files`, `reference-data`, `contact-support`

## Useful Scripts

From root:
- `npm run dev` - start backend with nodemon
- `npm run start` - start backend with node
- `npm run data:import` - seed demo data
- `npm run data:destroy` - destroy seeded data

From `frontend/`:
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
