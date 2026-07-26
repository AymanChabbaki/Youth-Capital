# IYA Ideas Platform — Setup

Monorepo layout:

```
iya-platform/
├── README-IDEA.md              ← the concept doc (roles, lifecycle, lock rules)
├── README-SETUP.md             ← this file
├── frontend/                   ← React + Vite + TypeScript
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── assets/images/      ← Higgsfield-generated visuals go here
│       ├── styles/             ← tokens.css (palette), global.css
│       ├── components/
│       │   ├── layout/         ← Header
│       │   ├── ui/             ← shared primitives (grow as needed)
│       │   └── idea/           ← IdeaCard, CollabRequestButton
│       ├── pages/              ← Board, IdeaDetail, NewIdea, Login
│       ├── hooks/              ← useIdeas
│       ├── lib/                ← supabaseClient, api
│       ├── context/            ← AuthContext
│       ├── routes/             ← router
│       └── types/              ← idea types + status labels
└── backend/                    ← Node + Express + TypeScript
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── server.ts / app.ts
        ├── config/             ← env, supabase (service role)
        ├── routes/             ← ideas.routes, collab.routes
        ├── controllers/        ← ideas, collab
        ├── services/           ← ideas.service (lock logic), collab.service
        ├── middlewares/        ← auth, role (4-tier), error
        ├── types/              ← domain types
        └── db/migrations/      ← 001 public schema, 002 per-jiha schema fn, 003 RLS example
```

## 1. Supabase

1. Create a Supabase project.
2. Run the migrations in order in the SQL editor: `001_init.sql`, `002_jiha_schema_function.sql`, then per jiha:
   ```sql
   select public.create_jiha_schema('casablanca', 'الدار البيضاء', 'Casablanca-Settat');
   select public.create_jiha_schema('rabat', 'الرباط', 'Rabat-Salé-Kénitra');
   ```
3. Seed the department catalog (tech, entrepreneuriat, ...).
4. Apply `003_rls_policies_example.sql` per jiha schema.
5. Create a **private** Storage bucket named `idea-pdfs`. Do not make it public — the backend generates 1-hour signed URLs only for unlocked users.
6. In API settings → "Exposed schemas", add each `jiha_*` schema so the backend can query them via `.schema()`.

## 2. Backend

```bash
cd backend
cp .env.example .env   # fill in Supabase URL + service role key
npm install
npm run dev            # http://localhost:4000
```

The service-role key stays server-side only. Every access decision (the PDF/contact lock, the 4-role hierarchy) is enforced in `ideas.service.ts` + `role.middleware.ts`, with RLS as the second layer of defense.

## 3. Frontend

```bash
cd frontend
cp .env.example .env   # Supabase URL + ANON key + API base
npm install
npm run dev            # http://localhost:5173
```

## 4. Visual assets (Higgsfield + invideo)

The palette in `src/styles/tokens.css` is the brief for all generated assets:

- Base: obsidian `#0b0b12` / surfaces `#15151f`
- Brand accent: Istiqlal rose `#e91e8c` (from IYA's real theme color) — one loud accent, used sparingly
- Approved/earned: Maghreb gold `#c9a227`
- In-review: signal cyan `#2dd4bf`
- Type: Fraunces (display) + IBM Plex Sans Arabic (body) + JetBrains Mono (status badges)

Suggested Higgsfield prompts (drop outputs into `frontend/src/assets/images/`):
- Hero: "abstract constellation of glowing rose-magenta nodes connected by thin gold threads over deep near-black space, minimal, premium, wide banner" → `hero.png`
- Empty state: "single glowing rose seed sprouting a circuit-like sprout, dark background, minimal" → `empty-board.png`
- Approved badge texture: "subtle brushed gold geometric zellige pattern, dark, tileable" → `gold-pattern.png`

invideo: use the connected MCP to generate the pitch/demo video for the competition — script it around the member → coordinator → national → leadership journey of one idea.

## 5. What's intentionally not built yet

- Department picker in the NewIdea form (currently a raw ID input)
- Coordinator/national review dashboards (endpoints exist for the role guard; UI pending)
- Notifications when a collab request arrives / is decided
- The `idea_index` sync on status changes (only synced at creation for now)
