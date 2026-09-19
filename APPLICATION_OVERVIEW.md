# CampusSubmit — Application Overview

A from-the-code rundown of how CampusSubmit actually works: architecture, data flow, features, and the reasoning behind the notable design decisions. (The repo already has `README.md`, `DESIGN.md`, and `PRODUCT.md`, each with a narrower focus — this document ties the whole system together in one place, verified directly against the source rather than restated from those files.)

---

## 1. What it is

CampusSubmit is a two-role (student/admin) assignment-submission portal with a genuine client/server split:

- **Frontend**: React 18 + TypeScript, built with Vite, hosted as a static site on **GitHub Pages**.
- **Backend**: Node.js + Express + TypeScript API, hosted on **Render**, backed by a **PostgreSQL** database.

Nothing is simulated or browser-local except the session token. Assignments, submissions, and the files themselves live in Postgres, so state is genuinely shared across every device that logs in — an admin creating an assignment on a laptop is visible to a student on their phone.

## 2. Repository layout

```
src/            React frontend (deployed to GitHub Pages)
server/         Express API (deployed to Render, its own package.json/tsconfig)
.github/workflows/deploy.yml   CI: builds and pushes the frontend to Pages on every push to main
```

Two entirely independent Node projects living in one repo — `npm install` at the root only sets up the frontend; `server/` is installed and run separately. There's no shared `node_modules`, no monorepo tooling (no Turborepo/Nx/workspaces) — deliberately, given the project's size.

## 3. Backend architecture (`server/`)

### 3.1 Boot sequence (`src/index.ts`)

1. `initDatabase()` runs first and **blocks server startup** — it creates the three tables if missing, seeds/re-syncs the two demo users, and seeds four demo assignments only if the table is completely empty.
2. Express is configured with `cors()` (origin allowlist from `CORS_ORIGINS` env var) and `express.json()`.
3. A `/health` endpoint exists purely so the frontend (and a human) can check whether Render's free-tier instance has woken up from its idle sleep.
4. Four routers are mounted under `/api/auth`, `/api/assignments`, `/api/submissions`, `/api/admin`.
5. A single centralized `errorHandler` catches everything, with one special case: Multer's file-size-limit error is turned into a friendly 400 instead of falling through to a generic 500.

### 3.2 Data model (`src/db.ts`)

Three tables, created with `CREATE TABLE IF NOT EXISTS` (no migration framework — schema changes would currently require manual `ALTER TABLE`s or a fresh DB):

| Table | Notable columns | Notes |
|---|---|---|
| `users` | `username` (PK), `password_hash`, `role` (`admin`\|`student`, CHECK constraint), `display_name` | Only 2 rows ever exist — this is a fixed demo user table, not a real user system |
| `assignments` | `id`, `title`, `description`, `due_date`, `created_at`, `updated_at` | `id`s are app-generated strings (`assignment-<timestamp36>-<random>`), not DB serials |
| `submissions` | `id`, `assignment_id` (FK, `ON DELETE CASCADE`), `student_username` (FK), `status`, `submitted_at`, `file_name`, `file_type`, `file_size`, `file_data` (`BYTEA`) | `UNIQUE (assignment_id, student_username)` — a student can only have **one** submission per assignment; resubmitting **overwrites** it via `ON CONFLICT ... DO UPDATE` |

**Key decision: files are stored as bytes directly in Postgres (`bytea`), not on disk or in object storage.** This is explicitly because Render's free-tier web service disk is ephemeral (wiped on every redeploy), while the attached Postgres instance is not. For a demo-scale app this trades some query/storage efficiency for actual durability without needing S3 or similar. The README flags this as the first thing to change ("move file storage out of Postgres... once files get larger or more numerous") if this ever needed to scale.

### 3.3 Demo account seeding

`seedUsers()` in `db.ts` seeds two accounts — `admin` (role `admin`) and `crimbawa` / display name "Camille Rimbawa" (role `student`) — hashing each with bcrypt before writing it. **As of the credential-exposure remediation below, neither seed password is a string literal in source**: both come from `ADMIN_SEED_PASSWORD`/`STUDENT_SEED_PASSWORD` env vars (`config.ts`), set only in Render's dashboard in production.

It also **migrates forward**: any existing submissions under the old username `student` are reassigned to `crimbawa`, and the old `student` user row is deleted — every boot.

**Remediated: credentials were previously published in three places** — hardcoded in `server/src/db.ts` (the actual seed literals), in `src/config/credentials.ts` (a frontend "display hint" file), and surfaced live on the login page via a "Need demo credentials?" autofill disclosure. All three are now fixed: `db.ts` reads from env vars instead of literals, `credentials.ts` was deleted (nothing else imported it), and the login page's disclosure/autofill UI was removed entirely. `README.md`'s credentials table was also replaced — it no longer publishes real values. See §10 below for the full writeup of this fix, including the git-history scrub.

### 3.4 Authentication (`middleware/auth.ts`, `routes/auth.ts`)

- Passwords are hashed with **bcrypt** (`bcryptjs`, 10 salt rounds) — never stored or compared in plaintext (`utils/passwords.ts`).
- `POST /api/auth/login` looks up the user case-insensitively (`lower(username) = lower($1)`), verifies the password, and signs a **JWT** containing `{ username, displayName, role }` with a **12-hour expiry**.
- `requireAuth` middleware verifies the JWT on every protected route and attaches the decoded payload to `req.user`.
- `requireRole('admin' | 'student')` is layered on top for role-gated routes (e.g. only admins can create/edit/delete assignments; only students can submit).
- **The server is the actual security boundary.** The frontend's `ProtectedRoute` component (route redirects) is explicitly documented as a UX convenience only — every mutating/sensitive route independently re-checks the JWT and role server-side, so a student can't, say, `curl` their way into `POST /api/assignments` just because the UI hides that button.

### 3.5 Routes

| Route | Method | Auth | Behavior |
|---|---|---|---|
| `/api/auth/login` | POST | none | Validates credentials, returns `{ token, user }` |
| `/api/assignments` | GET | any logged-in user | All assignments, sorted by due date ascending |
| `/api/assignments` | POST | admin | Create (validated: title 1–120 chars, due date parseable, description ≤2000 chars) |
| `/api/assignments/:id` | PUT | admin | Update (same validation) |
| `/api/assignments/:id` | DELETE | admin | Delete (cascades to its submissions via FK) |
| `/api/submissions` | GET | any logged-in user | **Role-aware single endpoint**: admins get every submission (joined with assignment title + student display name); students get only their own |
| `/api/submissions` | POST | student | `multipart/form-data` upload via Multer (memory storage); validates extension server-side against `allowedExtensions`, computes late/on-time status from the **server's clock** vs. the assignment's `due_date`, upserts (overwrite-on-resubmit) |
| `/api/submissions/:id/file` | GET | owner or admin | Streams the stored bytes back with correct `Content-Type`/`Content-Disposition`; a student who isn't the owner gets 403 |
| `/api/admin/reset-demo-data` | POST | admin | Wipes `submissions` and `assignments`, re-seeds the four demo assignments — affects the **shared** database, i.e. every device |

Two design choices stand out:
- **One GET `/api/submissions` endpoint serves both roles**, branching server-side on `req.user.role` rather than exposing `/api/submissions/mine` and `/api/submissions/all` separately. Keeps the frontend's `submissionService.ts` to one function.
- **Late-vs-on-time is decided entirely server-side**, using `new Date()` compared to the DB's `due_date` at the moment of upload — a client with a wrong or manipulated clock can't misrepresent whether their submission was late. The frontend's `isPastDue()` (client-clock-based) is explicitly documented as "purely a display hint," e.g. for showing an "Overdue" badge before a submission exists.

## 4. Frontend architecture (`src/`)

### 4.1 Layering and the "services" boundary

```
pages/        Route-level views, composed from components + hooks
components/   ui/ (generic), layout/ (shell, route guard), assignments/, submission/
hooks/        useAssignmentsData (shared fetch pattern), useFocusTrap
context/      AuthContext (session), ToastContext (notifications)
services/     apiClient.ts + one file per resource — the ONLY layer allowed to call fetch()
config/       appConfig.ts (API URL, upload limits, storage keys), credentials.ts (demo-account UI hints)
utils/        formatting/validation helpers, confetti
types/        shared interfaces mirroring the backend's response shapes
```

**Enforced rule**: components and pages never call `fetch` directly. Everything funnels through `services/apiClient.ts`'s `request()` wrapper, which:
- attaches `Authorization: Bearer <token>` from `tokenStorage.ts`,
- serializes plain objects as JSON but passes `FormData` through untouched (so the browser sets the correct multipart boundary for file uploads),
- normalizes every failure into a single `ApiError` type,
- **auto-clears the session on a 401** rather than letting the app sit half-logged-in,
- gives a specific, friendly message ("Couldn't reach the server... it may take up to 30 seconds to wake up") when the fetch itself throws — a direct nod to Render's free-tier cold start.

### 4.2 Routing (`App.tsx`, `main.tsx`)

- **`HashRouter`, not `BrowserRouter`.** GitHub Pages is a static host with no server-side rewrites, so a `BrowserRouter` URL like `/assignments` would 404 on refresh or a shared link — `HashRouter` (`.../#/assignments`) needs no server cooperation at all.
- `vite.config.ts` sets `base: '/campus-submit/'` only for production builds (dev stays at `/`), since a GitHub Pages *project* site (not a user/org site) is served from a subpath.
- Route structure: `/login` is public; everything else sits behind `<ProtectedRoute>` (redirects to `/login` if not authenticated) inside `<AppShell>` (nav + header); admin-only pages (`/assignments/new`, `/submissions`) get a second nested `<ProtectedRoute allowedRoles={['admin']}>` that bounces non-admins back to `/dashboard`.
- `/dashboard` and `/assignments` are single routes that render **different components based on role** (`RoleAwareDashboard`/`RoleAwareAssignments` in `App.tsx`) — one URL, two views, rather than `/admin/dashboard` vs `/student/dashboard`.

### 4.3 State management — no library

There's no Redux/Zustand/React Query. State is handled with:
- **React Context** for genuinely global state: `AuthContext` (current user + login/logout) and `ToastContext` (notification queue, with hover/focus-pausable auto-dismiss timers).
- **A single shared hook, `useAssignmentsData`**, for the fetch-both-lists-with-loading pattern every page needs (assignments + submissions together, since submission status is always shown alongside its assignment). Used by all four dashboard/list pages instead of each re-implementing `useEffect` + `useState` + error toast.
- Everything else is local `useState` in the component that needs it (form fields, modal-open flags, etc).

This is a deliberate "don't over-engineer" choice consistent with the project's stated small scope — both README and DESIGN.md explicitly note "no state-management library... was added on either side — both apps are intentionally small enough not to need one."

### 4.4 Session persistence

`localStorage` holds **only** the JWT and the decoded user object (`tokenStorage.ts`, via a small `storage.ts` wrapper with try/catch and JSON-parse fallback). Assignments and submissions are never cached to `localStorage` — every page fetches fresh from the API on mount via `useAssignmentsData`. Refreshing the tab keeps you logged in (token still valid, verified against `localStorage`); a different browser/device starts logged out, same as any real session-based app.

## 5. Feature walkthrough

### Student
- **Dashboard** (`StudentDashboardPage`): stat tiles (total / submitted / pending / overdue, computed client-side from the two fetched lists) and a "Next up" card showing the soonest not-yet-submitted, not-yet-overdue assignment.
- **Assignments** (`StudentAssignmentsPage`): full list as `AssignmentCard`s, each showing a status badge (`Not Submitted` / `Overdue` / `Submitted` / `Submitted (Late)`) driven by combining the assignment's due date with whether a matching `Submission` exists.
- **Submission flow**: clicking "Submit Assignment" opens `SubmissionPanel` (a `Modal`) containing `FileDropzone` — click-to-browse or drag-and-drop, with immediate client-side validation (extension + size, `utils/fileUtils.ts`) shown inline, and a re-validation warning if the file is invalid before allowing submit. On success: the modal closes, data refetches, and `CelebrationOverlay` renders — a canvas confetti burst (`utils/confetti.ts`) plus an animated SVG checkmark and a details card (assignment, filename, timestamp). Resubmitting an already-submitted assignment is allowed and **overwrites** the previous submission (enforced by the DB's `UNIQUE (assignment_id, student_username)` + `ON CONFLICT DO UPDATE`).
- **Profile**: shows identity/role and a plain-language note about how the session is stored, plus logout.

### Admin
- **Dashboard** (`AdminDashboardPage`): counts (assignments created, submissions received — links through to the Submissions page, upcoming deadlines) and a "next deadline" card.
- **Assignments management** (`AdminAssignmentsPage`): list of `AdminAssignmentRow`s with submission counts per assignment, edit (opens `AssignmentForm` in a `Modal`), delete (behind a `ConfirmDialog` warning it also deletes every student's submissions for that assignment), and a **"Reset Demo Data"** action (also behind a confirm dialog) that wipes and re-seeds the shared database for every device.
- **Create Assignment** (`AdminCreateAssignmentPage`): `AssignmentForm` with title, optional description, and a split date+time input that defaults the time to 11:59 PM (`combineDateAndTime` in `utils/dateUtils.ts`) since deadlines are usually "end of day."
- **Submissions** (`AdminSubmissionsPage`): every submission across every student/assignment, each with a "Download" button that fetches the file as a `Blob` (with the auth header attached, since a plain `<a href>` can't send one) and triggers a browser download via an object URL.

## 6. Design system (see `DESIGN.md` for the full palette/rationale)

- **CSS Modules + CSS custom-property tokens** (`src/styles/variables.css`) — no styled-components/Tailwind/UI kit. Every component's `.module.css` references `var(--...)` tokens rather than hardcoded colors/spacing, with one historically-noted exception (`confetti.ts`'s canvas fills, which can't read CSS vars without JS — it now reads the live computed values at runtime instead of duplicating hex codes, so the confetti palette can never drift from the real theme).
- **"Modern kawaii" visual identity**: a cherry-blossom pink primary (`#C2255C` at 600-weight, chosen and verified for ≥4.5:1 contrast against white — DESIGN.md documents actual computed contrast ratios per token, not eyeballed), warm mauve neutrals (so grays read as part of the same color family instead of clashing with the pink), rounder radii, soft pink-tinted shadows, and the Nunito font (rounded, friendly, still highly legible — loaded from Google Fonts with a system-font fallback).
- **Accessibility work baked in, not bolted on**: a skip-to-content link (`AppShell`), a shared focus-trap hook (`useFocusTrap`) used by both `Modal` and `CelebrationOverlay` for consistent keyboard behavior (Tab cycling, Escape to close, focus restored to the trigger on close), `prefers-reduced-motion` support (global CSS collapses transition/animation durations; `confetti.ts` skips its burst entirely), and live-region (`role="alert"`/`aria-live`) error messaging for file-validation problems.
- Tone: the copy throughout is deliberately plain and encouraging ("You're all set — your submission was recorded", "Nothing pending — you're all caught up! 🎉") — celebratory moments (successful submission) get the most "kawaii" expression; day-to-day list/dashboard views stay legible-first per `PRODUCT.md`'s explicit brief ("playful, not childish").

## 7. Hosting & deployment

- **Frontend → GitHub Pages**, auto-deployed by `.github/workflows/deploy.yml` on every push to `main` (checkout → `npm ci` → `npm run build` → upload/deploy the `dist/` artifact via the official Pages actions). No manual deploy step.
- **Backend → Render**, a free Web Service running `server/` (build: `npm install && npm run build`; start: `npm start`), talking to a free Render Postgres instance. Three secrets are set only in Render's dashboard, never committed: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`.
- **Known cold-start caveat**: Render's free tier spins the API down after 15 minutes idle; the first request afterward can take ~30 seconds. Both the login page's UX copy and `apiClient.ts`'s fetch-failure message account for this directly rather than surfacing a generic network error.
- `.env.production` at the repo root holds only `VITE_API_URL` (no secrets — it's committed) so the production frontend build points at the deployed Render API rather than `localhost:4000`.

## 8. Notable code-level details / quirks worth knowing

- **Multer memory storage, not disk storage** — uploads never touch the server's local filesystem; the buffer goes straight from the multipart parser into the `bytea` column.
- **App-generated IDs**, not DB sequences/UUIDs — `assignment-<base36 timestamp>-<random>` / `submission-<...>` (see `generateId()` in `assignments.ts`/`submissions.ts`). Fine at demo scale/collision odds; not cryptographically unguessable.
- **No pagination anywhere** — `/api/submissions` and `/api/assignments` always return the full table. Explicitly called out in the README as a "fine at demo scale" limitation.
- **No rate limiting on `/api/auth/login`** and no audit log for admin deletes/resets — both explicitly documented as known gaps, not oversights.
- **Config duplication is manual, not shared** — file-size/extension limits are defined independently on the frontend (`src/config/appConfig.ts`) and backend (`server/src/config.ts`), each with comments telling a future editor to update the other side. There's no shared package/types between the two apps; `src/types/index.ts` is a hand-maintained mirror of `server/src/types.ts`.

## 9. Where this stands vs. "production"

Both README.md and PRODUCT.md are candid that this is a demo with real primitives (real bcrypt auth, real JWTs, real Postgres, real file storage) rather than a production system. The gaps that remain, in the codebase's own words: no self-service signup/password reset (two fixed seeded accounts only), no refresh-token rotation or login rate-limiting, no backed-up/durable hosting tier, files stored as DB blobs rather than object storage, and no structured logging/error tracking/audit trail. None of this is hidden — it's stated directly in the README's "Prototype & Security Limitations" section and mirrored by what's actually implemented in `server/`.

## 10. Credential-exposure remediation (applied)

A review of this app surfaced that the two demo account passwords were published in three places at once: hardcoded as string literals in `server/src/db.ts` (`seedUsers()`), duplicated as a "display hint" in `src/config/credentials.ts`, and surfaced live on the deployed login page via a "Need demo credentials?" autofill disclosure in `src/pages/LoginPage.tsx` — visible to anyone who opened the site, no repo access required. `README.md` also documented them in a table (itself stale — it didn't match the actual seeded username).

Fixed:
- **`server/src/db.ts`** no longer contains password literals — `seedUsers()` now hashes `config.adminSeedPassword`/`config.studentSeedPassword`, sourced from `ADMIN_SEED_PASSWORD`/`STUDENT_SEED_PASSWORD` env vars (added to `server/src/config.ts` as required vars, alongside the existing `DATABASE_URL`/`JWT_SECRET` pattern). Set only in Render's dashboard in production; `server/.env.example` documents them for local dev with placeholder values.
- **`src/config/credentials.ts`** deleted outright — nothing else imported it, so it was a pure liability with no functional purpose left once the login page no longer needs display hints.
- **`src/pages/LoginPage.tsx`** — `fillDemo()`, the "Need demo credentials?" `<details>` disclosure, and the now-orphaned "Demo access" divider were all removed, along with their dead CSS in `LoginPage.module.css`. The login page now only accepts typed credentials; it doesn't reveal or offer to autofill any.
- **`README.md`** — the credentials table was replaced with a "Demo Access" section explaining that credentials aren't published and pointing to how to reach the maintainer instead; every reference to `credentials.ts` and to the old literal passwords was updated to match the new env-var-based flow. A separate inaccurate claim (that the JWT secret was "visible in this README's history") was also corrected — `git log -p` confirms no real `JWT_SECRET` value was ever committed, only the env var name and a placeholder.
- **Git history** — the plaintext password strings that had been committed across prior commits (`***REMOVED-SEED-PASSWORD***`, `***REMOVED-SEED-PASSWORD***`, `***REMOVED-SEED-PASSWORD***`, plus two early SHA-256 digests of those same values from a pre-backend prototype phase) were scrubbed from every commit's blob content and the repo's history was rewritten and force-pushed. See the conversation/commit log for the exact tool and commit-hash-before/after record, since that's a one-time operational step rather than something this living doc needs to keep re-describing.
