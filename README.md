# CampusSubmit

**Live demo:** https://aduran01.github.io/campus-submit/ (frontend deployed automatically from `main` via GitHub Actions; backend API runs on Render at `https://campus-submit-api.onrender.com`)

CampusSubmit is a small assignment-submission platform with a real client/server split: a React frontend and a Node/Express API backed by Postgres. Assignments an admin creates, and files a student submits, are shared across every device that signs in — not just the browser you happened to use.

> **This is a demo app on free-tier hosting**, not a production system for real coursework. It has real authentication, a real database, and real file storage — but it also has the limitations of a small side project (a handful of fixed demo accounts, a free database with no backups, a server that sleeps when idle). See [Prototype & Security Limitations](#prototype--security-limitations) before using this for anything that matters.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Application Architecture](#application-architecture)
5. [How Authentication Works](#how-authentication-works)
6. [Demo Credentials](#demo-credentials)
7. [Data Persistence](#data-persistence)
8. [Installing Dependencies](#installing-dependencies)
9. [Running Locally](#running-locally)
10. [Building for Production](#building-for-production)
11. [Hosting](#hosting)
12. [Prototype & Security Limitations](#prototype--security-limitations)
13. [What Would Need to Change for Production](#what-would-need-to-change-for-production)
14. [Project Structure](#project-structure)

---

## Project Overview

CampusSubmit is a small academic submission portal with two roles:

- **Students** see assignments an admin has created, each with a due date and status, and can attach and submit a file — from any device, as long as they log in.
- **Admins** can create, edit, and delete assignments, and see (and download) every submission any student has sent in, from any device.

The core flow this is built to showcase:

```
Admin logs in on Device A → creates an assignment with a deadline → logs out
Student logs in on Device B → sees that assignment and its deadline → attaches a file
→ clicks "Submit Assignment" → sees a success animation → status updates to "Submitted"
Admin logs back in on Device A → opens Submissions → downloads the file the student sent
```

## Features

- Real login (student / admin) — passwords are bcrypt-hashed server-side, sessions are signed JWTs
- Assignments and submissions are shared across every device/browser that signs in
- Admin: create, edit, delete assignments; see every submission across all students, with a download link for the actual file
- Student: dashboard with quick stats, full assignment list with due dates and status
- Realistic file-attachment UI: click-to-browse or drag-and-drop, file name/type/size preview, remove/re-select — the file is genuinely uploaded and stored (client-side validation for fast feedback, re-validated server-side since a client can't be trusted)
- Simulated-feeling but real submission flow: a loading state while it actually uploads, then a polished success celebration (confetti + animated checkmark + success card)
- Late-submission detection ("Overdue" badge, "Submitted (Late)" status), decided by the server's clock, not the client's
- "Reset Demo Data" admin action that resets the shared database for everyone, not just the browser that clicked it
- Toast notifications, empty states, confirm dialogs, and a responsive, accessible layout throughout (see `DESIGN.md`)

## Technology Stack

| Concern | Choice | Why |
|---|---|---|
| Frontend framework | React 18 + TypeScript | Modern, well-supported, typed |
| Frontend build tool | Vite | Fast dev server, minimal config, first-class TS/JSX support |
| Routing | React Router v6 (`HashRouter`) | `HashRouter` specifically because the frontend is hosted on GitHub Pages — see [Hosting](#hosting) |
| Frontend styling | CSS Modules + a small CSS-variable design system | Zero extra runtime dependencies, fully scoped styles, easy to theme — see `DESIGN.md` |
| Backend framework | Node.js + Express + TypeScript | Small, unopinionated, easy to read end-to-end for a project this size |
| Database | PostgreSQL | A real relational database; submitted files are stored as `bytea` columns rather than on disk, since Render's free web-service disk is wiped on every redeploy — Postgres data isn't |
| Auth | bcrypt (password hashing) + JWT (session tokens) | Standard, well-understood primitives; no custom crypto |
| File uploads | `multer` (memory storage) | Reads the upload into memory just long enough to write it into Postgres — nothing touches local disk |
| Celebration effect | ~70 lines of hand-rolled `<canvas>` confetti | Avoids a whole animation dependency for one effect; reads its colors from the live CSS design tokens instead of a duplicated palette |

No state-management library, ORM, or UI kit was added on either side — both apps are intentionally small enough not to need one.

## Application Architecture

Two separate apps in one repo, deployed independently:

```
src/            React frontend (deployed to GitHub Pages)
  config/       Centralized config: API base URL, file limits, demo-account display hints
  types/        Shared TypeScript interfaces, mirroring the API's response shapes
  services/     apiClient.ts (fetch wrapper) + one file per resource — the ONLY layer that talks to the network
  hooks/        useAssignmentsData (shared fetch-both-lists-with-loading pattern), useFocusTrap
  context/      React context providers: auth session, toast notifications
  utils/        Formatting/validation helpers, confetti effect
  components/   Reusable UI (ui/), layout (layout/), and feature components (assignments/, submission/)
  pages/        Route-level views composed from the pieces above

server/         Node/Express backend (deployed to Render)
  src/
    db.ts               Postgres pool, schema creation, demo-data seeding
    config.ts           Env var loading
    middleware/          JWT auth check, role check, error handling
    routes/              auth, assignments, submissions, admin — one file per resource
    utils/               bcrypt wrapper, demo assignment data
```

**Data flow rule (frontend):** components and pages never call `fetch` directly — they call functions in `src/services/*`, which all go through `apiClient.ts`. This is the layer that would change if the API's shape ever changed; every component and page above it only depends on the services' function signatures, not on how the network call is made.

**Data flow rule (backend):** routes never touch `req`/`res` bodies without going through a shared row→DTO mapper, and every mutating route is behind `requireAuth` (valid JWT) and, where relevant, `requireRole('admin')` — enforced server-side, not just hidden by frontend routing.

## How Authentication Works

1. `server/src/db.ts` seeds two demo accounts into the `users` table on first boot, each with a **bcrypt hash** of their password (never plaintext) — see `server/src/utils/passwords.ts`.
2. `POST /api/auth/login` (`server/src/routes/auth.ts`) looks up the username, verifies the password against the stored bcrypt hash, and — on success — signs a JWT containing `{ username, displayName, role }` with a 12-hour expiry (`server/src/middleware/auth.ts`).
3. The frontend stores that token in `localStorage` (`src/services/tokenStorage.ts`) and sends it as `Authorization: Bearer <token>` on every subsequent request (`src/services/apiClient.ts`).
4. Every protected route on the server re-verifies the token itself (`requireAuth`) and, for admin-only actions, checks the decoded role (`requireRole('admin')`) — the frontend's `ProtectedRoute` component also redirects unauthenticated/wrong-role visitors, but that's a UX convenience, not the actual security boundary. The boundary is server-side.

This is real authentication, not a simulation — but see [Prototype & Security Limitations](#prototype--security-limitations) for what's still not production-grade about it (fixed demo accounts, a shared JWT secret you can see in this README's history, no rate limiting, etc.).

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| Student | `student` | `***REMOVED-SEED-PASSWORD***` |
| Admin | `admin` | `***REMOVED-SEED-PASSWORD***` |

The login page has a "Need demo credentials?" disclosure that shows both and can autofill the form. These are display hints only now — `src/config/credentials.ts` documents them for the UI, but the accounts themselves live in the `users` table on the server.

**To change a password:** you need to update it in the database, since that's the source of truth now. The simplest way for this demo-sized user table:
1. Update the display hint in `src/config/credentials.ts` (so the login page shows the new value).
2. Generate a new bcrypt hash and update the corresponding row in the `users` table (e.g. via Render's Postgres dashboard's SQL console, or `psql`):
   ```sql
   UPDATE users SET password_hash = '<new bcrypt hash>' WHERE username = 'student';
   ```
   Generate the hash locally with: `node -e "require('bcryptjs').hash('new-password', 10).then(console.log)"` (run from inside `server/`, after `npm install`).

## Data Persistence

Assignments, submissions, and users live in a **PostgreSQL database**, not in the browser:

- `server/src/db.ts` creates three tables (`users`, `assignments`, `submissions`) on boot if they don't exist, and seeds the two demo users plus four demo assignments the very first time the database is empty.
- **Submitted files are stored as bytes directly in the `submissions.file_data` column** (Postgres `bytea`), not on the server's local disk. This is a deliberate choice: Render's free-tier web service disk is wiped on every redeploy, but the Postgres database is not — so storing files in the database is what makes them actually durable across deploys on this hosting setup.
- The frontend holds only the signed-in session (a JWT) in `localStorage` — see `src/services/tokenStorage.ts`. Refreshing the page keeps you logged in (the token is still valid); a different browser or device has no session until it logs in itself, same as any real app.
- An admin can click **Reset Demo Data** to restore the four seeded assignments and clear every submission — this affects the shared database, so it resets the app for every device, not just the one that clicked it.

## Installing Dependencies

This is two separate Node projects — install each independently.

**Frontend** (repo root):
```bash
npm install
```

**Backend** (`server/`):
```bash
cd server
npm install
```

## Running Locally

**Backend first** — copy `server/.env.example` to `server/.env` and fill in a real `DATABASE_URL` (a free Postgres instance from [Render](https://render.com) or similar works fine) and a random `JWT_SECRET`, then:
```bash
cd server
npm run dev
```
This starts the API on `http://localhost:4000` (or whatever `PORT` you set) and creates/seeds its tables automatically on first boot.

**Frontend** (repo root, in a separate terminal):
```bash
npm run dev
```
This starts the Vite dev server (default `http://localhost:5173`, or the next free port) and talks to `http://localhost:4000` by default — see `VITE_API_URL` in `src/config/appConfig.ts` if you need to point it elsewhere.

Log in with either demo account from the table above.

## Building for Production

**Frontend:**
```bash
npm run build
```
Type-checks (`tsc -b`) and produces a static build in `dist/`, using `.env.production`'s `VITE_API_URL` so the build talks to the deployed backend. Preview it locally with `npm run preview`.

**Backend:**
```bash
cd server
npm run build   # compiles to server/dist
npm start        # runs the compiled output
```

## Hosting

**Frontend → GitHub Pages.** Deploys automatically on every push to `main` via `.github/workflows/deploy.yml`. Two things account for GitHub Pages being a static host with no server-side rewrites and no backend of its own:
- `vite.config.ts` sets `base: '/campus-submit/'` for production builds only, since a GitHub Pages project site is served from a subpath.
- `src/main.tsx` uses `HashRouter` instead of `BrowserRouter`, so routes look like `.../#/login` — a `BrowserRouter` would 404 on a refreshed or shared deep link, since GitHub Pages has no server to rewrite unknown paths back to `index.html`.

**Backend → Render.** A free Render Web Service runs `server/` (root directory `server`, build `npm install && npm run build`, start `npm start`), talking to a free Render Postgres instance. Three environment variables are set in Render's dashboard (never committed): `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` (set to `https://aduran01.github.io`, matching the frontend's origin).

**Known free-tier limitation:** Render's free web services spin down after 15 minutes of inactivity. The first request after that can take up to ~30 seconds while it wakes back up — the login page shows a hint about this while a login is in flight. The database itself doesn't sleep.

To move either half elsewhere: the frontend just needs `VITE_API_URL` pointed at wherever the API lives (and `base`/router swapped back if the new static host supports SPA rewrites); the backend just needs `DATABASE_URL`/`JWT_SECRET`/`CORS_ORIGINS` set on whatever Node host you choose.

## Prototype & Security Limitations

This has a real backend, real auth, and real file storage — but it's still a small demo project, not a production system. Specifically:

- **Fixed demo accounts only** — there's no signup flow; the two accounts are seeded once and that's the entire user base. Anyone with the demo credentials (published in this README) has full access.
- **Secrets are static and never rotated** — the JWT signing secret lives only in Render's environment variables (not committed), but has no rotation policy; the two demo passwords are intentionally published in this README. Don't reuse either for anything real.
- **No rate limiting or brute-force protection** on the login endpoint.
- **No audit logging** — deletions and resets are irreversible with no history of who did what.
- **Free-tier hosting caveats** — the API server sleeps when idle (see [Hosting](#hosting)); the free Postgres instance has no automated backups and (per Render's free-tier policy) may be subject to retention limits — don't treat this database as durable long-term storage without upgrading it.
- **No malware/content scanning** on uploaded files — they're type/size-checked, not scanned.
- **No pagination** on the submissions list — fine at demo scale, would need it for real usage.

## What Would Need to Change for Production

Most of the "what would need to change" list from the original prototype is now actually built — real auth, real database, real file storage, real cross-device sync. What's left to go from "demo" to "production":

1. **Real user management** — self-service signup/invites, password reset flows, more than two fixed accounts, per-course or per-section scoping.
2. **Stronger auth** — short-lived access tokens with refresh tokens instead of one 12-hour JWT, rate limiting on login, secrets rotated and stored in a real secrets manager rather than a hosting dashboard's env vars.
3. **Durable, backed-up infrastructure** — a paid database tier with automated backups/point-in-time recovery, and a hosting plan without a sleep/cold-start window.
4. **File handling at scale** — move file storage out of Postgres and into object storage (e.g. S3) once files get larger or more numerous than a small-blob-in-Postgres approach comfortably handles; add virus/malware scanning.
5. **Observability** — structured logging, error tracking, uptime monitoring, and audit logs for admin actions (deletes, resets).
6. **Production hardening** — HTTPS everywhere (already true on both Render and GitHub Pages), stricter CORS if multiple frontends ever exist, input validation hardening, and dependency/security scanning in CI.

## Project Structure

```
campus-submit/
├── index.html                  Vite entry HTML (frontend)
├── package.json                Frontend
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── .env.production             VITE_API_URL for the deployed backend (no secrets)
├── .github/workflows/deploy.yml   Frontend → GitHub Pages, on every push to main
├── DESIGN.md / PRODUCT.md / README.md
├── src/                         React frontend — see "Application Architecture" above
│   ├── main.tsx / App.tsx
│   ├── styles/                  variables.css (design tokens), global.css
│   ├── config/                  appConfig.ts (API URL, file limits), credentials.ts (demo-account hints)
│   ├── types/index.ts
│   ├── services/                apiClient.ts, tokenStorage.ts, authService.ts, assignmentService.ts,
│   │                            submissionService.ts, adminService.ts
│   ├── hooks/                   useAssignmentsData.ts, useFocusTrap.ts
│   ├── context/                 AuthContext.tsx, ToastContext.tsx
│   ├── components/              ui/, layout/, assignments/, submission/
│   └── pages/                   LoginPage, Student{Dashboard,Assignments}Page, ProfilePage,
│                                 Admin{Dashboard,Assignments,CreateAssignment,Submissions}Page, NotFoundPage
└── server/                      Node/Express backend — deployed separately to Render
    ├── package.json
    ├── tsconfig.json
    ├── .env.example             Template for local DATABASE_URL/JWT_SECRET/CORS_ORIGINS
    └── src/
        ├── index.ts             App bootstrap, CORS, route mounting
        ├── config.ts            Env var loading
        ├── db.ts                Postgres pool, schema creation, demo-data seeding
        ├── types.ts
        ├── middleware/          auth.ts (JWT sign/verify, role check), errorHandler.ts
        ├── routes/              auth.ts, assignments.ts, submissions.ts, admin.ts
        └── utils/               passwords.ts (bcrypt), demoAssignments.ts (seed data)
```

---

Built as a demo project with a real (if small) backend. Contributions, forks, and adaptations are welcome — just rotate the secrets and add real user management before pointing this at anything that matters.
