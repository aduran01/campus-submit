# Product Context — CampusSubmit

_Extracted from README.md and the existing implementation (no `/impeccable extract` available in this environment)._

## What it is
A front-end-only prototype of an assignment-submission platform. Demonstrates the full submit workflow (create → see → attach → submit → celebrate) without any real backend, file storage, or server-side auth.

## Audience
- **Prospective users of the prototype**: someone evaluating whether to build this into a real product, or a student/educator being shown a demo.
- **In-app personas**: `student` (submits work) and `admin` (creates assignments). Both are demo accounts, not real identities.

## Core jobs-to-be-done
1. Admin creates an assignment with a deadline → it's immediately visible to students.
2. Student sees what's due, attaches a file, submits, and gets unambiguous confirmation.
3. Both roles can trust the status they see (Not Submitted / Submitted / Submitted Late / Overdue) reflects reality within this browser's data.

## Tone or voice implied by the existing copy
Encouraging, plain-language, no jargon ("You're all set — your submission was recorded", "Nothing pending — you're all caught up! 🎉"). Already slightly warm/friendly before this pass — the kawaii redesign is an amplification of an existing direction, not a reversal.

## Non-goals (explicit prototype limitations, from README)
No real auth, no real file transmission, no multi-user sync, no production persistence. Any visual/UX work should not imply capabilities that don't exist (e.g., don't make the file upload look like it's syncing to a cloud — it never leaves the browser).

## Why this matters for the redesign
- The "cute" treatment should stay legible and calm enough for a due-date/status-tracking tool — this is closer to a friendly study-planner app than a game. Playful, not childish (per the original build brief).
- Celebration/success moments (submission confirmed) are the natural place for the most kawaii expression; day-to-day list/dashboard views should stay readable first, cute second.
