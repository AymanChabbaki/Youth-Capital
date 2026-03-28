# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, React Query, Framer Motion

## Application: Youth CapitalCore

A bilingual (English/Arabic) digital civic governance simulation platform for youth to practice Moroccan government simulation and develop leadership skills.

### Key Features
- Bilingual (EN/AR) with full RTL support
- Two roles: user (simulation participant) and admin (platform manager)
- 9 pages: Home, Apply, Login, Community, Press, Events, Support, Dashboard, Admin
- Session-based authentication (cookie)
- Crisis scenario system
- Voting polls for simulated legislation
- Community forums categorized by Parliament, Ministry, Regional, General

### Demo Credentials
- Admin: `admin@youthcapitalcore.ma` / `admin123`
- User: `younes@example.ma` / `user123`
- New user: `sofia@example.ma` / `user123`

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── youth-capitalcore/  # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed.ts         # Database seeding script
```

## Database Schema

Tables: users, role_applications, forums, posts, polls, poll_options, poll_votes, articles, events, support_tickets, crises

## API Routes

All routes prefixed with `/api`:
- `GET/POST /auth/*` — Authentication (register, login, logout, me)
- `GET/PATCH/DELETE /users/*` — User management
- `GET/POST/PATCH /roles/applications/*` — Role applications
- `GET/POST /community/forums/*` — Forums & posts
- `GET/POST /polls/*`, `POST /polls/:id/vote` — Polling
- `GET/POST /press/*` — News articles
- `GET/POST /events` — Events
- `GET/POST/PATCH /support/tickets/*` — Support tickets
- `GET/POST /crises` — Crisis scenarios
- `GET /stats` — Platform statistics

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/scripts run seed` — Seed database with demo data
