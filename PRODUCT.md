# Product Context — CampusSubmit

_Extracted from README.md and the existing implementation (no `/impeccable extract` available in this environment)._

## What it is
An assignment-submission platform with a real client/server split (React frontend on GitHub Pages, Node/Express + Postgres backend on Render). Demonstrates the full submit workflow (create → see → attach → submit → celebrate) with real cross-device sync — an admin's changes on one device are visible to a student on another, and submitted files are actually stored and downloadable, not just simulated. See README.md for the full architecture.

## Audience
- **Prospective users of the prototype**: someone evaluating whether to build this into a real product, or a student/educator being shown a demo.
- **In-app personas**: `student` (submits work) and `admin` (creates assignments). Both are demo accounts, not real identities.

## Core jobs-to-be-done
1. Admin creates an assignment with a deadline → it's immediately visible to students.
2. Student sees what's due, attaches a file, submits, and gets unambiguous confirmation.
3. Both roles can trust the status they see (Not Submitted / Submitted / Submitted Late / Overdue) reflects the shared, server-side truth — not just what happens to be cached in the browser in front of them.
4. Admin can see, and download, exactly what a student submitted — the point of the backend build was making that possible across devices.

## Tone or voice implied by the existing copy
Encouraging, plain-language, no jargon ("You're all set — your submission was recorded", "Nothing pending — you're all caught up! 🎉"). Already slightly warm/friendly before this pass — the kawaii redesign is an amplification of an existing direction, not a reversal.

## Non-goals (explicit limitations, from README)
Real auth, real file storage, and real cross-device sync now exist — those are no longer non-goals. What's still explicitly out of scope: self-service signup (only two fixed demo accounts), password reset flows, backed-up/durable production infrastructure (free-tier Postgres, no automated backups), rate limiting, and malware scanning on uploads. Visual/UX work should reflect that files are genuinely uploaded now (e.g. the submission disclaimer says "Your instructor will be able to see and download this file," not "nothing leaves your browser").

## Why this matters for the redesign
- The "cute" treatment should stay legible and calm enough for a due-date/status-tracking tool — this is closer to a friendly study-planner app than a game. Playful, not childish (per the original build brief).
- Celebration/success moments (submission confirmed) are the natural place for the most kawaii expression; day-to-day list/dashboard views should stay readable first, cute second.
