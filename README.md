# CampusSubmit

**Live demo:** https://aduran01.github.io/campus-submit/ (deployed automatically from `main` via GitHub Actions — see `.github/workflows/deploy.yml`)

CampusSubmit is a **front-end prototype** of an assignment submission platform. It demonstrates the full student/admin submission workflow — creating assignments, attaching a file, submitting, and seeing a success state — entirely in the browser, with no backend server.

> **This is a demo, not a production system.** No file is ever uploaded anywhere, there is no real authentication server, and all data lives in your browser's `localStorage`. See [Prototype & Security Limitations](#prototype--security-limitations) below before using any part of this as-is in production.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Application Architecture](#application-architecture)
5. [Mock Authentication](#mock-authentication)
6. [Demo Credentials](#demo-credentials)
7. [Data Persistence](#data-persistence)
8. [Installing Dependencies](#installing-dependencies)
9. [Running Locally](#running-locally)
10. [Building for Production](#building-for-production)
11. [Hosting (GitHub Pages)](#hosting-github-pages)
12. [Prototype & Security Limitations](#prototype--security-limitations)
13. [What Would Need to Change for Production](#what-would-need-to-change-for-production)
14. [Project Structure](#project-structure)

---

## Project Overview

CampusSubmit simulates a small academic submission portal with two roles:

- **Students** see assignments an admin has created, each with a due date and status, and can attach a file and submit it.
- **Admins** can create, edit, and delete assignments, and see how many submissions each one has received.

The entire demo — the exact flow it's built to showcase — looks like this:

```
Admin logs in → creates an assignment with a deadline → logs out
Student logs in → sees the new assignment and its deadline → attaches a file
→ clicks "Submit Assignment" → sees a success animation → status updates to "Submitted"
```

## Features

- Role-based login (student / admin) with a centralized demo-credentials config
- Session persistence across page refreshes (but not across browser restarts)
- Admin: create, edit, delete assignments; see submission counts per assignment
- Student: dashboard with quick stats, full assignment list with due dates and status
- Realistic file-attachment UI: click-to-browse or drag-and-drop, file name/type/size preview, remove/re-select
- Front-end validation: required fields, file type allow-list, file size limit, empty files, duplicate/invalid dates
- Simulated submission with a brief loading state, then a polished success celebration (confetti + animated checkmark + success card)
- Late-submission detection ("Overdue" badge, "Submitted (Late)" status) — toggleable via config
- "Reset Demo Data" admin action to restore the seeded assignments and clear submissions
- Toast notifications, empty states, confirm dialogs, and responsive layout throughout

## Technology Stack

| Concern | Choice | Why |
|---|---|---|
| UI framework | React 18 + TypeScript | Modern, well-supported, typed — a reasonable base to grow into a real app |
| Build tool | Vite | Fast dev server, minimal config, first-class TS/JSX support |
| Routing | React Router v6 | Standard client-side routing for an SPA |
| Styling | CSS Modules + a small CSS-variable design system | Zero extra runtime dependencies, fully scoped styles, easy to theme |
| Password hashing | Web Crypto API (`crypto.subtle.digest`) | Native to the browser — no crypto library needed |
| Persistence | `localStorage` / `sessionStorage` behind a service layer | No backend needed for a prototype; the service layer is what would be swapped for real API calls |
| Celebration effect | ~60 lines of hand-rolled `<canvas>` confetti | Avoids pulling in a whole animation/confetti dependency for one effect |

No state-management library, CSS framework, or UI kit was added — the app is intentionally small enough not to need one.

## Application Architecture

```
src/
  config/       Centralized, documented configuration (credentials, file limits, storage keys)
  types/        Shared TypeScript interfaces (Assignment, Submission, AuthenticatedUser, ...)
  services/     Pure functions wrapping localStorage — the ONLY layer that touches storage
  context/      React context providers: auth session, toast notifications
  utils/        Formatting/validation helpers, confetti effect
  components/   Reusable UI (ui/), layout (layout/), and feature components (assignments/, submission/)
  pages/        Route-level views composed from the pieces above
```

**Data flow rule:** UI components and pages never call `localStorage` directly — they call functions in `services/*`. This keeps persistence in one place. If this prototype ever grows a real backend, `services/authService.ts`, `services/assignmentService.ts`, and `services/submissionService.ts` are the only files whose *internals* need to change (swapping storage calls for `fetch`/API calls); every component and page above them can stay exactly as it is, because they only depend on the services' function signatures.

## Mock Authentication

There is no authentication server. Login works like this:

1. `src/config/credentials.ts` defines a list of demo users, each with a username, a **SHA-256 hash of their password** (never the plaintext password), a role, and a display name.
2. When someone submits the login form, `src/services/authService.ts` hashes what they typed (using the browser's native `crypto.subtle.digest('SHA-256', ...)`) and compares the resulting hex string to the stored hash.
3. On success, the user's `{ username, displayName, role }` is written to `sessionStorage` — this is the "session." It survives a page refresh (so reloading the app doesn't log you out) but not a browser restart or a new private window, matching the behavior of a typical session cookie.
4. `AuthContext` (`src/context/AuthContext.tsx`) reads that session on load and exposes `user`, `login()`, and `logout()` to the rest of the app. `ProtectedRoute` (`src/components/layout/ProtectedRoute.tsx`) redirects unauthenticated visitors to `/login` and can additionally restrict a route to specific roles (used for the admin-only "Create Assignment" page).

**This is not real security** — see [Prototype & Security Limitations](#prototype--security-limitations).

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| Student | `student` | `***REMOVED-SEED-PASSWORD***` |
| Admin | `admin` | `***REMOVED-SEED-PASSWORD***` |

The login page has a "Need demo credentials?" disclosure that shows both and can autofill the form.

**To change them:** edit `src/config/credentials.ts` — it's the single, clearly-documented place these live. Since passwords are stored as hashes, changing a password means generating a new hash:

1. Run the app in dev mode (`npm run dev`).
2. Open the browser DevTools console on the login page and run:
   ```js
   await window.__hashPassword('your-new-password')
   ```
3. Copy the 64-character hex string it prints and paste it into the matching user's `passwordHash` field in `credentials.ts`.

(`window.__hashPassword` only exists in dev builds — it's stripped out of production builds.)

## Data Persistence

All application data lives in the browser via `localStorage`, wrapped by `src/services/storage.ts`:

- **Assignments** and **submissions** are stored as JSON arrays under versioned keys (see `src/config/appConfig.ts`'s `STORAGE_KEYS`).
- On first run, `ensureDemoDataSeeded()` (`src/services/demoData.ts`) seeds three upcoming demo assignments plus one intentionally overdue one, so the app is immediately usable.
- Every create/edit/delete/submit action reads the current array, mutates it, and writes it back — there's no separate "database," just these arrays.
- An admin can click **Reset Demo Data** (on the Assignments page) to restore the original seeded assignments and clear all submissions — handy before a fresh demo run.

Because this is `localStorage`, data is:
- Scoped to one browser (no sync across devices/browsers)
- Cleared if the user clears site data, or permanently if they use a different browser/profile
- Fully readable/writable via DevTools by anyone using the app — there is no server enforcing what's "real"

## Installing Dependencies

> **Note:** This repository was authored in an environment without Node.js, npm, or Git installed, so the commands below could not be executed here to verify the install/build. The code was written and reviewed carefully by hand, but please run these commands yourself and let me know if anything comes up.

Requires [Node.js](https://nodejs.org/) 18+ (LTS recommended) and npm.

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

This starts the Vite dev server (default: `http://localhost:5173`). Open it in a browser and log in with either demo account above.

## Building for Production

```bash
npm run build
```

This type-checks the project (`tsc -b`) and produces an optimized static build in `dist/`. Preview that build locally with:

```bash
npm run preview
```

## Hosting (GitHub Pages)

This repo deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml` (build with `npm run build`, then `actions/deploy-pages`). Two things specifically account for GitHub Pages being a static host with no server-side rewrites:

- **`vite.config.ts`** sets `base: '/campus-submit/'` for production builds only (local `npm run dev` still serves from `/`), since a GitHub Pages project site is served from a subpath, not the domain root.
- **`src/main.tsx`** uses React Router's `HashRouter` instead of `BrowserRouter`, so routes look like `.../#/login`. A `BrowserRouter` would 404 on a refreshed or shared deep link (e.g. `.../assignments`) because GitHub Pages has no server to rewrite unknown paths back to `index.html`.

To point this at a different static host (Netlify, Vercel, S3, etc.) instead: change `base` back to `/`, and switch back to `BrowserRouter` if that host supports SPA fallback/rewrites (most do).

## Prototype & Security Limitations

This app is a **client-side prototype** built to demonstrate a workflow, not to run in production. Specifically, it does **not** provide:

- **Real authentication security** — credentials and hashes live in the client bundle; anyone can read `credentials.ts` in the shipped JavaScript or bypass the check entirely via DevTools. There's no salting, no server-side secret, and no rate limiting.
- **Real authorization/security boundaries** — "admin" vs. "student" is enforced only by client-side routing (`ProtectedRoute`). Nothing stops someone from editing `sessionStorage` in DevTools to grant themselves the admin role.
- **Server-side file storage or transmission** — the "attached" file is held as an in-memory `File` object only for the current interaction; it is never uploaded, read, or persisted anywhere. Only its name/type/size are recorded.
- **Real assignment submission processing** — "submitting" simulates a short delay and writes a status/timestamp to `localStorage`. No actual grading, storage, or notification happens.
- **Multi-user synchronization** — every browser has its own isolated copy of the data. Two people "using the same demo" on different machines will not see each other's changes.
- **Production-grade data persistence** — `localStorage` is not a database: no backups, no transactions, no schema migrations, and it can be wiped by the browser or the user at any time.
- **Protection against client-side tampering** — since all logic and data run in the browser, a user can inspect or modify anything (submission status, due dates, even their own role) via DevTools.

## What Would Need to Change for Production

To turn this into a real product, at minimum:

1. **Real backend & database** — an API (e.g., Node/Express, Django, etc.) backed by a real database (Postgres, etc.) to own assignments, submissions, and users. `services/*` would be rewritten to call this API instead of `localStorage`.
2. **Real authentication** — server-issued sessions or JWTs, passwords hashed server-side with a proper algorithm (bcrypt/argon2) and per-user salts, and a real login endpoint. Client-side hashing would be removed entirely — it offers no protection once a server exists.
3. **Real authorization** — role checks enforced on the server for every request, not just hidden in client-side routing.
4. **Real file uploads** — actual multipart upload to object storage (e.g., S3) with server-side validation of type/size/contents, virus scanning as appropriate, and signed URLs for retrieval.
5. **Multi-user, multi-device sync** — data fetched from the shared backend rather than a per-browser `localStorage` copy.
6. **Production hardening** — HTTPS, CSRF/XSS protections, input validation on the server, audit logging, rate limiting, and monitoring.

The component/page layer of this app was intentionally kept unaware of *how* data is persisted, so a well-scoped migration could focus almost entirely on the `services/` folder and a new auth flow, without a full UI rewrite.

## Project Structure

```
campus-submit/
├── index.html                  Vite entry HTML
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── .gitignore
├── README.md
└── src/
    ├── main.tsx                 App bootstrap, router, dev-only hash helper
    ├── App.tsx                  Route definitions, providers, demo-data seeding
    ├── vite-env.d.ts
    ├── styles/
    │   ├── variables.css        Design tokens (color, spacing, radius, shadow, motion)
    │   └── global.css           Reset + base element styles
    ├── config/
    │   ├── credentials.ts       ⭐ Demo users & password hashes — edit here to change logins
    │   └── appConfig.ts         ⭐ File limits, deadline enforcement, storage keys
    ├── types/
    │   └── index.ts             Shared TypeScript interfaces
    ├── services/                Persistence & business logic — no React, no UI
    │   ├── storage.ts           localStorage/sessionStorage wrapper
    │   ├── authService.ts       Hashing, login/logout, session lookup
    │   ├── assignmentService.ts CRUD for assignments
    │   ├── submissionService.ts Recording/reading submissions, overdue checks
    │   └── demoData.ts          Seeding & resetting demo assignments
    ├── utils/
    │   ├── dateUtils.ts         Date formatting/parsing helpers
    │   ├── fileUtils.ts         File size formatting & validation
    │   ├── validation.ts        Assignment form validation
    │   └── confetti.ts          Canvas confetti effect
    ├── context/
    │   ├── AuthContext.tsx      Current user, login/logout
    │   └── ToastContext.tsx     Toast notifications
    ├── components/
    │   ├── ui/                  Button, Card, FormField, Badge, Modal, ConfirmDialog, EmptyState, Spinner
    │   ├── layout/               AppShell (nav + shell), ProtectedRoute (auth/role guard)
    │   ├── assignments/          AssignmentCard (student), AssignmentForm, AdminAssignmentRow
    │   └── submission/           FileDropzone, SubmissionPanel, CelebrationOverlay
    └── pages/
        ├── LoginPage.tsx
        ├── StudentDashboardPage.tsx / StudentAssignmentsPage.tsx / ProfilePage.tsx
        ├── AdminDashboardPage.tsx / AdminAssignmentsPage.tsx / AdminCreateAssignmentPage.tsx
        └── NotFoundPage.tsx
```

---

Built as a demo/prototype. Contributions, forks, and adaptations are welcome — just don't ship the auth layer as-is.
