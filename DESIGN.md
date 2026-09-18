# Design System — CampusSubmit

_Extracted from the existing `src/styles/variables.css` / `global.css` (no `/impeccable extract` available), then evolved for the "modern kawaii" pass. This file is the source of truth — component CSS must reference these tokens, never hardcode a new color/radius/shadow/spacing value._

## v1 baseline (as found, pre-redesign)
Cool slate neutrals, indigo primary (`#4f46e5`), 6/10/16px radii, plain slate-tinted shadows, system-font stack, `cubic-bezier(0.16,1,0.3,1)` for entrances. Fully token-driven already — audit found zero one-off colors outside `variables.css` (one legitimate exception: `confetti.ts`'s canvas fill colors, which can't read CSS custom properties without JS, and are now fixed to read them at runtime instead of duplicating hex — see Step 3 of the changelog below).

## v2 — kawaii/modern tokens (current)

### Color
Primary hue moved from indigo to an accessible cherry-blossom pink; neutrals warmed from slate-blue-gray to a soft mauve so they read as one family with the primary hue instead of clashing. **All interactive text-on-solid-color pairings below were verified against WCAG 2.1 relative-luminance contrast math, not eyeballed:**

| Token | Value | Verified contrast vs white | Usage |
|---|---|---|---|
| `--color-primary-600` | `#C2255C` | **5.65:1** | Default solid-button bg / link / focus ring core |
| `--color-primary-700` | `#A61E4D` | **7.21:1** | Hover/active state |
| `--color-danger-600` | `#C92A2A` | **5.46:1** | Destructive solid-button bg |
| `--color-neutral-500` | `#7A5D69` | **5.83:1** | Secondary/muted text (subtitles, meta) — must stay ≥4.5:1 since it's real content text |
| `--color-neutral-800` / `-900` | `#2E2129` / `#1A1015` | >10:1 (darker than -500, monotonic) | Body text / headings |

Lighter tints (`-50` to `-400`) are backgrounds/borders/decorative only and are exempt from text-contrast rules by design — never put body text in a `-50`…`-400` color.

Full scale — `src/styles/variables.css`:
- **Primary (pink):** 50 `#FFF0F6` · 100 `#FFDEEB` · 200 `#FCC2D7` · 300 `#FAA2C1` · 400 `#F783AC` · 500 `#F06595` · 600 `#C2255C` · 700 `#A61E4D` · 800 `#862142`
- **Success (mint):** 50 `#EBFBEE` · 100 `#D3F9D8` · 500 `#40C057` · 700 `#2B8A3E` · 800 `#216E39`
- **Warning (peach):** 50 `#FFF4E6` · 100 `#FFE8CC` · 500 `#FD9A44` · 700 `#D9480F` · 800 `#B23A0C`
- **Danger (cherry):** 50 `#FFF0F0` · 100 `#FFE3E3` · 500 `#FF6B6B` · 600 `#C92A2A` · 700 `#9A2020`
- **Neutral (warm mauve):** 0 `#FFFFFF` · 50 `#FFF9FB` · 100 `#FCEEF3` · 200 `#F5DCE5` · 300 `#E6C4D2` · 400 `#C9A0B1` · 500 `#7A5D69` · 600 `#5C4650` · 700 `#46333C` · 800 `#2E2129` · 900 `#1A1015`

### Typography
`--font-sans` is now **Nunito** (rounded, friendly, highly legible — a standard, accessible choice for a "cute" UI, not a decorative display face that sacrifices readability), loaded via Google Fonts in `index.html` with `font-display: swap`, falling back to the original system-font stack. Same family for both headings and body — one font, not two, to keep this simple per the "don't over-engineer" brief.

**Caveat:** this introduces a network dependency on first load (cached after). If this ever needs to run fully offline, self-host the two woff2 files instead of the Google Fonts `<link>`.

### Radius (rounder across the board)
`--radius-sm` 6→**8px**, `--radius-md` 10→**14px**, `--radius-lg` 16→**22px**, `--radius-full` unchanged (999px, pills).

### Shadow (soft, tinted — not flat black/slate)
Shadows now tint warm/pink instead of neutral slate (`rgb(120 40 70 / …)` instead of `rgb(15 23 42 / …)`), which is what makes soft-UI "kawaii" shadows read as soft rather than just low-opacity gray. Added `--shadow-glow-primary`, a soft pink focus/hover glow used on primary CTAs and the celebration card.

### Motion
Added `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot) and repointed `--transition-slow` to it, so dialogs/toasts/the celebration card pop in with a playful bounce instead of a flat ease-out. **Gated behind `prefers-reduced-motion`**: `global.css` now collapses all animation/transition durations to ~0ms for users who request reduced motion, and `confetti.ts` skips the particle burst entirely for the same preference (see audit finding P1-#5).

## Component patterns this system assumes
- Every color/radius/shadow/spacing/motion value in component CSS is a `var(--...)` reference. No inline styles, no literal hex/px sprinkled in component files.
- Solid-background interactive elements (buttons) use `-600`/`-700` weights only, never a `-500` or lighter tint, to preserve the verified contrast above.
- Dialogs (`Modal`, `CelebrationOverlay`) share one focus-trap implementation (`src/hooks/useFocusTrap.ts`) rather than each re-implementing keyboard handling.

## Changelog
- **v2 (kawaii pass):** full palette/radius/shadow/motion/font overhaul (this document); added `useFocusTrap`, skip link, reduced-motion support, live-region file-validation errors, pausable toasts; `confetti.ts` now reads live CSS custom properties instead of a hardcoded duplicate palette.
