# IYA Platform — idea revision v2

Supersedes the jiha-centric structure in `README-IDEA.md` /
`PLATFORM-SECTIONS.md` on the points below. This is a raw capture of the
revision as dictated — **nothing here is built yet**. We go section by
section from here, confirming scope and rights for one item at a time before
touching code.

## 0. The pivot: department replaces jiha as the functional axis

- No more stats/scoping by city (Casablanca, Rabat, ...).
- **Departments** (Tech, Marketing, ...) are now the primary structural axis
  — this is what roles, boards, and review stages key off of.
- Jiha/city is **not removed** — it stays as a simple UI-level tag/helper
  (e.g. a label shown on a profile or project card), not as functional logic.
  It does not gate visibility, does not define a role tier, does not drive
  any routing or review stage.

## 1. Core entity: Projects

- A project can be **global** (cross-department) or **scoped to one
  department**.
- A project is either **intern** or **extern**. Both types need rules to be
  approved:
  - at least one sponsor, and
  - a limit on how many members can work on it.
- Fields on a project:
  - idea / description
  - document
  - things needed for it (requirements)
  - members
  - sponsors
  - status
  - owners
- Status lifecycle: the last stage is *approved* — at that point the project
  moves onto another board (mirrors the old Submitted → Approved split, just
  without the jiha dimension). A project also tracks **progress stages**
  (مراحل الإنجاز) and a **progress percentage** (نسبة التقدم) — this is the
  in-flight progress tracking, separate from the approval status itself.

## 2. Second domain: Finance / financement management

Lives underneath/alongside a project once it exists.

- **Entries**: money in / money out — tracked as invoices.
- Each project (or program) carries its **own budget**.
- **Bourses** (grants/funding): who gave it, when, how, and why — each backed
  by an approval document (facture or a simpler supporting doc) so the
  record is safe/verifiable. Grant sources named so far: **INDH**,
  **communes/جماعات** (local government bodies), and **donors** generally.
- Save factures and documents against the project.
- Generate a money/finance document (report) filtered by **status** and
  **time period**, exportable as **PDF and Excel**.

## 3. Visibility: authenticated vs not

- **Not authenticated**: no payments/invoices/finance data shown at all —
  the entire finance domain is hidden pre-login.
- **Not authenticated**: Projects *are* visible — overview of projects,
  their fields, project-making status, owners and members, sponsors, and the
  project's own status (approved / in review / intern / extern).

## 4. Events

Noted as a missing piece — projects tie into events (surfaced there, same
way the old idea lifecycle mentioned events as where things get presented).
Not detailed yet.

## 5. The three platform pillars

1. **Projects** (+ Events)
2. **Money / Invoices** and everything connected to it
3. **AI** — not now, later

Build order: start with 1 and 2, leave 3 for later.

## 6. First build target: the public entry experience

### Header

- Two states: **before login** and **after login** — protected sections are
  hidden in the before-login state.
- Two separate header components:
  1. **Primary header**, rendered on the pen artwork itself — top-level
     section navigation.
  2. **Secondary header**, *not* on the pen, living inside each section to
     give more detailed sub-navigation for that section. Example: inside
     Invoices/Payments, this second header exposes sub-nav for money in,
     money out, project-raised money, etc.

### Page elements (KPIs, charts, stats)

- Also have before-login / after-login variants.
- **Teaser-snapshot pattern**: this applies to main UI elements (KPI tiles,
  charts) — **not** to the header. These elements show a live snapshot
  pulled from the corresponding protected/hidden route even when logged
  out; clicking one for full detail requires login. Header nav items are
  simpler — protected ones are just hidden when logged out, no teaser
  behavior there.
- Candidate KPI set for the **authenticated** dashboard (post-login):
  current balance, total income, total expenses, active projects, grants,
  payment/due notifications. Since §3 hides all finance data pre-login, the
  balance/income/expense tiles are post-login only — the public teaser set
  would draw from the project-side KPIs instead (still to be picked, see
  open questions).

## 7. Process note

This is a planning pass, not a build request. We stop at each item above to
pin down its exact scope and rights before writing any code.

## Note on a pasted feature list (Arabic)

A broader feature dump was pasted mid-session, covering financial mgmt,
project mgmt, member mgmt, documents, dashboard, AI, and international/
security standards. Only the pieces that clarified sections already agreed
above were folded in (budgets-per-project, grant sources, PDF/Excel export,
progress %, candidate KPI list). **Deliberately left out** as not yet part
of what we've actually scoped together:

- Member management as its own domain (member cards, subscriptions,
  attendance, committees) — we've only ever talked about members as a field
  on a project.
- A standalone Documents domain (bylaws, meeting minutes, contracts) beyond
  the project document + finance factures already listed.
- AI feature details (expense analysis, deficit prediction, auto-written
  reports) — AI is pillar 3, explicitly deferred.
- International-standards/security block (Président/Trésorier/Comptable
  role set, audit log, backups, encryption, 2FA) — this role model conflicts
  with the Member/Coordinator/National-lead model from `README-IDEA.md` and
  needs its own explicit reconciliation, not a silent merge.

## Open questions to define next

- Exact status lifecycle stages for a project (what comes before "approved",
  who moves it between stages).
- The member-limit number(s) and who sets them (global default vs
  per-project).
- Sponsor-approval rule specifics — one sponsor sufficient, or does
  intern/extern change the requirement?
- How Events relate to Projects structurally (does an event contain
  projects, reference them, both?).
- The exact set of KPIs/charts that get the teaser-snapshot treatment on the
  public entry page.
