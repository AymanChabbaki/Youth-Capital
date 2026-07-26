# منصة الأفكار — IYA Ideas & Projects Platform

**Pitch context:** internal project for Istiqlal Youth Academy (IYA), proposed by the Tech department of جهة الدار البيضاء (Casablanca-Settat), as an entry in the human-vs-AI idea competition.

## 1. The problem

Right now, projects inside IYA surface only at events. Nobody outside that room knows:
- who actually owns the project,
- where the idea came from,
- who is supposed to decide on it,
- or where a member is even supposed to submit a new idea.

There's no visible pipeline and no shared record of what each department, in each jiha, is working on — nationally or locally.

## 2. The solution

A single internal platform where every project idea has a traceable owner, a clear department + jiha tag, and a visible status from the moment it's created until it's adopted. Ideas can stay local (one department, one jiha) or be opened up for collaboration across departments and across jihat.

## 3. Roles (4 total)

Roles are organizational tiers. "Founder" is **not** a 5th role — it's a per-project attribute (see §5).

| # | Role | Scope | How assigned |
|---|------|-------|--------------|
| 1 | **Member** | one department, one jiha | joins a department |
| 2 | **Regional coordinator** (منسق) | one department, one jiha | appointed or elected within that jiha's department |
| 3 | **National department lead** (ممثل) | one department, all jihat | chosen by the department's members nationally |
| 4 | **National leadership** | everything | existing party/academy senior structure |

## 4. Idea lifecycle (5 stages)

1. **Idea created** — a member creates it; it's auto-tagged with their department + jiha.
2. **Local board** — visible to members of that department + jiha; others can join or request to collaborate.
3. **Coordinator review** — the regional coordinator can merge duplicates, endorse it, keep it local-only, or escalate it.
4. **National department view** — the national lead sees it alongside every other jiha's ideas for that department; this is where cross-jiha matches happen.
5. **Leadership decision** — national leadership adopts (or rejects) it, assigns an official owner, and decides where it's presented.

An idea does **not** have to reach stage 5 — a coordinator can deliberately keep something as a local pilot.

## 5. Idea fields (what a member fills in)

| Field | Required | Visibility |
|---|---|---|
| Name (internal short name) | yes | public |
| Title (public headline) | yes | public |
| Description (short summary) | yes | public |
| Founder(s) | auto (creator) + can add co-founders | public |
| Open to collaboration? (yes/no) | yes | public |
| Department + jiha tag(s) | yes | public |
| **Project PDF** (full explanation) | yes, required to submit | **locked** |
| **Contact info** | yes | **locked** |

### The lock, exactly as specified

- Regular members see only the public fields + a "request to collaborate" button.
- A collaboration request goes to the founder(s). If approved, the requester becomes a collaborator and the PDF + contact unlock **for them**.
- The PDF + contact are **always** visible to: the founder(s), the regional coordinator of that department + jiha, the national department lead, and national leadership — they need the full picture to review, with or without the founder's approval.
- **Decision for now: this stays locked even after a project is approved.** No public-facing version is auto-generated at approval — revisit later if leadership wants a public case-study mode.

## 6. The two board sections

- **Submitted** — anything past creation but not yet decided by leadership. Each card shows its current stage (local / regional review / national review) so people can see it's moving.
- **Approved / in progress** — leadership has adopted it, it has an official owner, and it's actively being worked on.

## 7. Tech stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL via Supabase — **schema-per-jiha** (`jiha_casablanca`, `jiha_rabat`, ...), each containing that jiha's `departments`, `members`, `ideas`, `idea_collaborators`, and `collab_requests` tables. Shared/national-level data (users, the jiha registry, the department catalog, national roles, and a cross-jiha idea index for national leads) lives in the `public` schema.
- **Design system:** see `frontend/src/styles/tokens.css` — palette grounded in IYA's actual brand pink (`#e91e8c`, pulled from the live site's theme color) plus a deep obsidian base, a Maghreb-gold accent for premium/approved states, and a signal-cyan accent for in-review status.

## 8. Open decision to revisit

Should the "Submitted" vs "Approved" split also change who can *see* an idea exists at all (e.g. hide submitted-but-rejected ideas from the public board), or only change what actions are available? Worth deciding before the review/rejection flow is built.
