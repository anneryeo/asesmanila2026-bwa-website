# PRD — ASES Manila "Build with ASES" Standalone Site

## 1. Summary

Spin the `/build-with-ases` feature out of the main `asesmanila2026-website` repo into its own standalone Next.js site (this repo, `asesmanila2026-bwa-website`). The new site replicates the parent site's **grid layout** and **navigation bar** pixel-for-pixel, keeps the same **fonts and branding**, but flips the default surface from navy (`#0C143F`) to a **primarily white background**.

## 2. Background

`asesmanila2026-website` (`D:\Developer\Projects\asesmanila2026-website`) currently hosts Build with ASES as one route among several (`app/build-with-ases/page.tsx` → `components/pages/BuildWithASES.tsx`). It shares the homepage's `Nav`, `Footer`, blueprint-grid background system, and dark navy theme. This repo becomes the dedicated home for that feature, deployed and versioned independently of the main event site.

## 3. Goals

- Ship a standalone site whose **grid layout system** (blueprint grid background, section container widths, spacing scale) is visually identical to the parent site.
- Ship a **navigation bar** identical in structure, sizing, and behavior to `Nav.tsx` from the parent site, restyled to read correctly on white.
- Preserve brand fonts exactly: **Cocogoose** for all headings/display text and nav labels, **Montserrat** for body copy, subheadings, and *all numeric content* (dates, counts, form numbers, stats).
- Change the default page background from navy (`--bg-primary-dark` / `bg-navy-950`) to **white** as the primary surface, while keeping navy/red as accent colors.
- Migrate the existing Build with ASES form, intro overlay, and gallery functionality with no feature regressions.

## 4. Non-Goals

- No redesign of the form fields, validation logic, or copy — content/logic ports as-is.
- No change to the event content/data itself (sessions, dates) — out of scope for this PRD.
- Not modifying the parent site (`asesmanila2026-website`) — it keeps its own `/build-with-ases` route until cutover is decided separately.

## 5. Design Requirements

### 5.1 Typography (unchanged from parent)

| Role | Font | Notes |
|---|---|---|
| Headings / display / nav labels | **Cocogoose** (`--font-cocogoose`, local `next/font/local`, weights 100–900 + italics) | `font-display` Tailwind class |
| Body copy, subheadings | **Montserrat** (`--font-montserrat`, `next/font/google`) | `font-body` Tailwind class |
| **All numbers** (dates, counts, stats, form values) | **Montserrat** — never Cocogoose | Cocogoose's numeral glyphs are not used for numeric content anywhere in the UI |

Resolve the parent site's known gap before porting: `--font-subhead` currently points to an unloaded "Public Sans" and silently falls back to `system-ui`. This site should repoint `--font-subhead` to the Montserrat variable so subheadings render in-brand.

Font files already present in `public/fonts/` (Cocogoose trial `.ttf` set) — confirm license terms in `Cocogoose-Pro-Family-CC-BY-NCLicensepdf.pdf` before any commercial/production use, same open item as the parent repo.

### 5.2 Color System — White-Primary Variant

Reuse the parent's full navy/red/neutral palette and CSS-variable structure (`globals.css` `--color-*` tokens → `tailwind.config.ts` `theme.extend.colors`), but repoint the **semantic surface aliases**:

| Token | Parent (navy-primary) | This site (white-primary) |
|---|---|---|
| `--bg-primary` | `navy-5` (#F6F7FC) | **`#FFFFFF`** (true white, primary background) |
| Default `<body>` background | `bg-navy-950` (#0C143F) | **`bg-white`** |
| `--text-primary` | `navy-900` | `navy-900` (unchanged — dark text now reads correctly on white by default) |
| `--accent` / `--accent-hover` | `red-500` / `red-600` | unchanged — red remains the CTA/alert accent |
| `--bg-blueprint` (grid overlay surface, e.g. dropdown, mobile drawer) | `navy-800` | unchanged — retained as a dark accent surface for nav dropdown, mobile drawer, footer |
| Blueprint grid line color on primary surface | `rgba(163,205,254,0.12)` (light lines on navy) | `rgba(7,31,107,0.06)` (dark-navy lines on white — this is already the parent's existing "light section" variant, e.g. `About.tsx`, `TheLine.tsx`) |
| `viewport.colorScheme` | `dark` | `light` |
| `themeColor` meta | `#030E3D` | `#FFFFFF` |

Net effect: this site behaves like the parent's `data-nav-theme="light"` sections applied globally, rather than as the exception. Navy and red remain fully available for accents, cards, dropdowns, footer, and CTAs — this is a background-primary change, not a full palette swap.

### 5.3 Grid Layout

Port the parent's layout system as-is:

- **Blueprint grid background**: same repeating `linear-gradient`, `48px 48px` cell size, `backgroundAttachment: fixed`, using the light-surface line color above so it reads correctly on white.
- **Section container widths**: preserve per-section max-widths from the parent (`1280px` hero/primary sections, `1152px` CTA/footer, `840–880px` copy-heavy sections) rather than forcing one global container.
- **Spacing scale**: same 8px-based scale (`4,8,12,16,24,32,48,64,96,128px`).
- **Breakpoints**: Tailwind v4 defaults, no custom `screens` override (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`).

### 5.4 Navigation Bar

Port `Nav.tsx` structure and behavior exactly, restyled for white-primary:

- Fixed to top, full width, `76px` height (`NAV_SIZES.headerHeight`).
- Transparent over hero; `backdropFilter: blur(16px)` + hairline border once scrolled, same as parent.
- **Default color theme flips**: since the page is white-primary by default, the nav's `light` color set (`#112F7F` text, blue wordmark logo `ases-logotext-blue.png`) becomes the default state instead of the exception. The `dark` set (`#ffffff` text, white wordmark) remains available for any navy sections (e.g. hero, if it stays navy) via the existing `data-nav-theme` mechanism.
- Desktop links (`≥1024px`): same set relevant to this standalone site — at minimum the Build with ASES-specific anchors (sessions, form, gallery) in place of `Events/Community/FAQs`; font `font-display` (Cocogoose) `16px`/300, `50px` gap.
- CTA dropdown behavior, mobile hamburger → full-screen drawer (navy `#0C143F` background, same blueprint grid at reduced opacity, staggered link fade-in) — ported unchanged, since the drawer is a dark surface by design regardless of page background.
- `usePathname()`-based link resolution simplifies since this repo has fewer routes — evaluate whether the parent's `isHomePage` branching is still needed or can be flattened.

### 5.5 Branding Assets

Already seeded in this repo's `public/`:
- Wordmark: `ases-logotext-blue.png` (now primary, used on white default state), `ases-logotext-white.png` (for dark surfaces: drawer, footer, dropdown).
- Icon mark: `ases-logoplain-white.svg`, app icons (`apple-touch-icon.png`, `icon-32.png`, `icon-192.png`, `icon-512.png`).
- Mascot "Ace" set: `ace-fly.svg`, `ace-stand.svg`, `blueprint-ace*.svg`, etc.
- Blueprint grid assets: `blueprint-blue.svg`, `blueprint-white.svg`.
- Gallery source photos: `public/images/build with ases/*` (raw, includes `.HEIC` — needs conversion to web-friendly `.jpg`/`.webp` before use, matching the parent's already-processed `bwa-01.jpg`…`bwa-09.jpg` pattern).
- Fonts: `public/fonts/Cocogoose-Pro-*-trial.ttf` set, already present.

## 6. Functional Scope — What Gets Migrated

From the parent repo, port and adapt:

1. `components/sections/Nav.tsx` → restyle per §5.4.
2. `components/sections/Footer.tsx` → port as-is (dark surface, unaffected by background flip).
3. `components/pages/BuildWithASES.tsx` (main form: track selection, session picker, validation, success states) → port logic unchanged, restyle surfaces from navy-card-on-navy-page to navy-or-white-card-on-white-page as appropriate per component.
4. `components/sections/BwaIntro.tsx` (intro/explainer overlay) → port, restyle background.
5. `app/build-with-ases/page.tsx` → becomes this site's root `app/page.tsx`; carry over SEO metadata, OpenGraph/Twitter cards, and the three JSON-LD schemas (`BreadcrumbList`, `EventSeries`, `WebPage`), updating canonical URLs to the new site's domain.
6. Gallery images: process `public/images/build with ases/*.HEIC` into optimized `.jpg`/`.webp`, matching parent's `bwa-01.jpg`…`bwa-09.jpg` convention.

## 7. Tech Stack (match parent)

- Next.js `^16.2.6`, App Router, React `^19.2.6`
- Tailwind CSS `^4.3.0` (`@import "tailwindcss"` + `@config` pattern)
- TypeScript `^6.0.3`
- `framer-motion` for nav/drawer/form animations
- `lucide-react` for icons
- `clsx` + `tailwind-merge` for className composition
- Deployment: Cloudflare via `@opennextjs/cloudflare` + `wrangler` (same CSP/security header setup as `next.config.mjs` in parent)

## 8. Open Questions

- Font licensing: are the Cocogoose trial `.ttf` files cleared for this site's production use, or does a licensed set need to be purchased?
- Does the hero/top section on this site stay navy (using `data-nav-theme="dark"` nav state) or go full white-primary including the fold? Affects whether the nav ever needs its dark color state at all.
- Domain/deploy target for this standalone site (subdomain of asesmanila.com vs. separate domain) — needed for canonical URL and OG metadata in the ported `page.tsx`.
- Cutover plan: once this site is live, does the parent site's `/build-with-ases` route redirect here, or get removed?

## 9. Success Criteria

- Visual diff of grid background, container widths, and nav against parent site shows only the background-color change and its cascading text/theme flips — no layout drift.
- All Cocogoose usage confined to headings/display/nav text; all numeric UI (dates, counts, stats) renders in Montserrat.
- Build with ASES form (both "I'm presenting" and "I'm watching" tracks) functions with no regressions versus the parent site's current behavior.
- Lighthouse/contrast check passes on white background for all text/accent color pairs carried over from the navy palette.
