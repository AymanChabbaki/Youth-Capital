# Platform structure — sections & shell

Companion to `README-IDEA.md` (the concept: roles, lifecycle, lock rules) and
`README-SETUP.md` (the repo layout). This doc is the bridge between the two:
it maps the concept onto an actual app shell, the way the inspiration
dashboards (sidebar + topbar + routed content) are structured, instead of the
current flat marketing-site layout (`Home`, `About`, `Board` as independent
pages).

No code yet — this is the section breakdown to agree on before building.

## 1. The pivot

Current frontend: a set of standalone pages, each rendering its own header.
Target: one persistent **shell** (sidebar + topbar) that wraps a **routed
content area**. Nav items in the sidebar show/hide based on the viewer's role
tier. This matches how both reference dashboards are built — the sidebar and
topbar never unmount; only the center content swaps per route.

- **Public pages** — `Login`, optionally a slim `Home`/`About` — live outside
  the shell, no sidebar, pre-authentication.
- **Platform shell** — everything else, post-authentication.

Open question: does `Home`/`About` survive as a marketing pair, or does the
whole thing become the authenticated platform with no public landing? Not
decided yet.

## 2. Shell components

- **Sidebar** — logo, nav grouped by scope, current user's department + jiha
  badge, settings/logout pinned at the bottom.
- **Topbar** — search ideas, notifications bell, language toggle (backed by
  the existing `LanguageContext`), profile menu (backed by `AuthContext`).

## 3. Sections (routed inside the shell)

| # | Section | Route | Purpose | Visible to | Existing file / status |
|---|---|---|---|---|---|
| 1 | Overview | `/` | Role-aware home: stat cards + a **section shortcut row** (one small card per section visible to this role, each showing a mini-summary — e.g. "Board — 4 new in your dept", "Local Review — 2 pending" — click-through to that route) | All | new |
| 2 | Ideas Board | `/board` | Two-section board: Submitted / Approved-in-progress, filterable by dept/jiha/stage | All | `Board.tsx` |
| 3 | Idea Detail | `/ideas/:id` | Public fields + locked PDF/contact (conditional unlock per README-IDEA §5), 5-stage progress tracker, collaborators, role-gated actions | All (fields vary by lock rules) | `IdeaDetail.tsx` |
| 4 | Submit Idea | `/ideas/new` | Creation form, auto-tagged with creator's dept + jiha | Member+ | `NewIdea.tsx` |
| 5 | My Requests | `/requests` | Outgoing collab requests sent + incoming ones if founder | All | `CollabRequestButton.tsx` has the action; no list view yet |
| 6 | Local Review | `/review/local` | Coordinator queue: merge duplicates, endorse, keep local, escalate | Regional coordinator+ | backend role guard exists, no UI |
| 7 | National Department View | `/review/national` | Cross-jiha idea index for one department — cross-jiha matching | National department lead+ | not built |
| 8 | Leadership Decisions | `/review/leadership` | Adopt/reject, assign official owner, decide presentation venue | National leadership only | not built |
| 9 | Notifications | `/notifications` | Collab request updates, stage changes | All | not built (noted in README-SETUP §5) |
| 10 | Profile & Settings | `/settings` | Own info, department/jiha membership, language | All | `AuthContext.tsx` backs this |

Proposed, **not** in `README-IDEA.md` — confirm before building:

| # | Section | Route | Purpose | Visible to |
|---|---|---|---|---|
| 11 | Directory | `/directory` | Browse departments × jihat × members | All | Answers the "nobody knows who owns what" problem (README-IDEA §1) but wasn't explicitly specced.

## 3a. Overview section-shortcut cards

Like the small tiles row in the Coursue reference ("2/8 watched UI/UX Design",
"3/8 watched Branding") — Overview shows one compact card per section the
viewer's role can access (from the table above), each with a one-line live
summary and a click-through to that route. The set of cards therefore differs
per role: a Member sees a Board/Submit Idea/My Requests/Directory row; a
Coordinator's row also includes a Local Review card with a pending count;
Leadership's row includes the Leadership Decisions card, etc.

## 4. Role → section visibility

| Role | Sees |
|---|---|
| Member | Overview, Board, Idea Detail, Submit Idea, My Requests, Notifications, Settings |
| Regional coordinator | + Local Review |
| National department lead | + National Department View |
| National leadership | + Leadership Decisions, full visibility everywhere |

## 5. Next step

Once the section list + shell shape are confirmed, start with the shell
(sidebar/topbar layout + route wiring) before rebuilding individual section
content, since every other page mounts inside it.
