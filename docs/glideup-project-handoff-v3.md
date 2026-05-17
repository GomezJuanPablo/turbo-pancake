---
project: GlideUp.net
status: pre-build — mockup v3 (NE-accurate palette) ready for approval
owner: JP (kesilabs / Lumaisla)
created: 2026-05-16
updated: 2026-05-16
type: build-handoff
version: 3.0
tags: [glideup, servicenow, certifications, side-project, build-doc]
---

# GlideUp.net — Project Handoff (v3)

> **One-line context:** GlideUp.net is a free, community-built, doc-anchored ServiceNow certification practice site with gamified, goblin-encouraging UX, designed to feel native to ServiceNow practitioners using the actual Next Experience visual language. Sequential build — CSA → CAD → CIS-ITSM → CIS-DF — with ~240 questions per exam, each tied to verified docs.servicenow.com references.

> **v3 note:** Palette corrected after referencing actual NE workspace screenshots. Chrome is **midnight navy** (`#1B1B3F`), primary action color is **deep teal** (`#0E8B9E`), with **magenta cosmic accents** (`#E91E63`) reserved for hero illustrations and brand sparks. Bright lime green is NOT a NE chrome color — it appears in data viz only.

---

## 1. Why this exists

ServiceNow certification practice is dominated by paid Udemy courses, dump sites of varying quality, and ServiceNow's own MeasureUp practice tests. There is a real gap for a **free, community-built, documentation-anchored** resource with explanations that teach the *why*.

GlideUp closes that gap with:
- **Real exam blueprint alignment** (questions distributed by official domain weighting)
- **Every wrong answer explained** (not just "the correct answer is B")
- **Verified documentation links** on every question
- **Gamification** that rewards persistence and accuracy
- **No login, no PII, no ads** — anonymous progress via localStorage
- **NE-native UX** — the chrome, layout, and palette match what practitioners see daily in the Now Platform

---

## 2. Identity

- **Name:** GlideUp
- **Domain:** glideup.net (purchased May 2026)
- **Tagline (working):** *Level Up Your Now*
- **Mascot:** 🧌 (goblin) — used in achievements, footer, microcopy. NEVER in main chrome.
- **Etymology:** "GlideRecord" (ServiceNow's core query API) meets "level up" (RPG vocabulary).

### Visual Direction
- **Theme:** light content area + dark midnight navy chrome (mirrors NE workspace exactly)
- **Hero treatment:** cosmic — dark navy gradient background with subtle dot field (stars), magenta/teal/amber sparks, and a soft teal radial glow. Matches NE's space-themed hero illustrations.
- **Card style:** white surface, 1px `#E1E4E8` border, 10–12px radius, subtle `shadow-sm`, 18–24px padding.
- **Typography:** system UI stack (Inter / SF / Segoe UI fallback).

### Brand Palette (NE-Accurate)

| Token | Hex | Use |
|---|---|---|
| `--chrome` | `#1B1B3F` | **Top bar — midnight navy** (matches NE) |
| `--chrome-2` | `#252557` | Elevated chrome surfaces, hover states |
| `--chrome-border` | `#2E2E5F` | Chrome dividers |
| `--bg` | `#F4F6F8` | Light content background |
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--surface-2` | `#FBFCFD` | Elevated surfaces |
| `--border` | `#E1E4E8` | Card borders |
| `--border-strong` | `#C5CCD3` | Strong dividers, button borders |
| `--text` | `#1A1A2E` | Primary text |
| `--text-muted` | `#5C6C7C` | Secondary text |
| `--text-dim` | `#8B9AA8` | Tertiary text |
| `--primary` | `#0E8B9E` | **Deep teal — primary action color** (CTAs, active states) |
| `--primary-hover` | `#006B7F` | CTA hover |
| `--primary-dark` | `#00525E` | Strong text on light |
| `--primary-bg` | `rgba(14, 139, 158, 0.08)` | Active state fill |
| `--magenta` | `#E91E63` | **Cosmic accent** — sparingly in hero, gradient endpoints, brand sparkle |
| `--success` | `#16A75C` | Correct answer state |
| `--amber` | `#FF8C42` | Streaks, partial credit |
| `--rose` | `#E63946` | Incorrect answer state |
| `--bronze` | `#A77043` | Bronze tier |
| `--silver` | `#6B7A8A` | Silver tier |
| `--gold` | `#D4A017` | Gold tier |

### Color usage rules
- **Chrome stays dark.** Top bar is always `--chrome`. White text and muted-light navigation.
- **Action stays teal.** Buttons, active nav items, progress bars, links — all use `--primary` deep teal.
- **Cosmic accents stay sparse.** Magenta is a SPARK — one dot in the logo glow, one streak in a progress gradient, dots in the hero starfield. It is never a dominant color.
- **Light gives structure.** Content area is white-on-light-gray to feel like NE workspace. All real density sits on white cards.

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Astro** (static) | Best perf-per-effort; islands for interactive quiz logic |
| Hosting | **Cloudflare Pages** | Free, global CDN, automatic deploys from Git |
| State | **localStorage** (client-only) | No login, no PII |
| Content | **JSON files per exam** | Portable, diff-friendly |
| Styling | **CSS variables + plain CSS** | No build complexity |
| Repo | **GitHub** (public) | Community contributions possible |

---

## 4. Layout Pattern — Next Experience Workspace Shell

```
┌─────────────────────────────────────────────────────┐
│ TOP BAR (midnight navy #1B1B3F)                     │
│ [G] GlideUp  All  Favorites  History    🔥  ⚡      │
├──────────┬──────────────────────────────────────────┤
│          │ Practice › CSA › Dashboard               │
│ SIDE NAV │ Certified System Administrator           │
│ (white)  │ ─────────────────────────────────────────│
│          │ ┌──────────────────────────────────┐     │
│ Practice │ │ COSMIC HERO (navy gradient,      │     │
│ • CSA •  │ │ starfield, teal/magenta sparks)  │     │
│   CAD    │ │ Progress + CTA                   │     │
│   ITSM   │ └──────────────────────────────────┘     │
│   DF     │ [ stat ][ stat ][ stat ][ stat ]         │
│          │ [ Overview ] Domains  History  Blueprint │
│ Library  │ ─────────────────────────────────────────│
│ Daily    │ Domain Mastery                           │
│ Stats    │ ┌──────┐ ┌──────┐ ┌──────┐               │
│ Achiev.  │ │ card │ │ card │ │ card │               │
│ Resources│ └──────┘ └──────┘ └──────┘               │
│          │ Try a Question                           │
│ Community│ ┌──────────────────────────────────┐     │
│ Suggest  │ │ Q + options + feedback           │     │
│ About    │ └──────────────────────────────────┘     │
└──────────┴──────────────────────────────────────────┘
```

### Layout rules
- **Top bar height:** 52px, `--chrome` background, brand on left, top nav (All/Favorites/History) in middle, status pills on right.
- **Side nav width:** 240px, `--surface` (white), grouped sections (Practice / Library / Community).
- **Active nav item:** `--primary-bg` tint, 3px `--primary` left border.
- **Content max-width:** 1180px, padded 28–36px.
- **Hero card:** dark navy gradient background with cosmic accents — INTENTIONALLY mirrors the NE workspace hero pattern.
- **Stat cards:** NE-style metric cards with label / large number / delta indicator below the hero, before the tabs.
- **Tabs:** below stat cards, NE-style underline-on-active.

---

## 5. Question Schema (canonical JSON)

```json
{
  "id": "csa-pon-001",
  "exam": "CSA",
  "release": "Yokohama",
  "domain": "Platform Overview and Navigation",
  "subdomain": "Next Experience Unified Navigation",
  "difficulty": "recall",
  "type": "single_select",
  "stem": "Question text ending in a question mark.",
  "options": [
    {"id": "A", "text": "Option text."},
    {"id": "B", "text": "Option text."},
    {"id": "C", "text": "Option text."},
    {"id": "D", "text": "Option text."}
  ],
  "correct": ["B"],
  "rationale": "Why the correct answer is correct — goblin-encouraging voice, plain language.",
  "distractor_notes": {
    "A": "Why A is wrong, specific.",
    "C": "Why C is wrong, specific.",
    "D": "Why D is wrong, specific."
  },
  "references": [
    {"title": "Doc page title", "url": "https://docs.servicenow.com/..."}
  ],
  "tags": ["next-experience", "navigation", "unified-nav"]
}
```

### Field rules
- **`id`** — `{exam-lowercase}-{domain-slug}-{3-digit-sequence}`.
- **`difficulty`** — `recall` | `application` | `scenario`.
- **`type`** — `single_select` | `multi_select`.
- **`correct`** — always an array.
- **`distractor_notes`** — required for every wrong option.
- **`references`** — at least one verified docs.servicenow.com URL, fetched and confirmed live before ship.

---

## 6. Voice & Tone — Goblin-Encouraging Standard

The questions themselves are exam-accurate and unornamented. **Personality lives in the rationales, achievements, and UI copy.**

### Examples

**Correct:**
> ✅ Boom. Nailed it.
> The Unified Navigation sidebar is your persistent home base…

**Incorrect:**
> ⚠️ Not quite — but now you know.

**Distractor:**
> A — Application Navigator is the OG (classic UI). Still works, but it's context-specific to whatever app you're in. Useful, not the answer.

### Voice rules
- Warm, not condescending.
- Plain language over jargon.
- Light humor in metaphors only, never in question stems.
- No cynicism about the platform, exam, or user.
- No slang that ages badly.

### Anti-patterns
- ❌ Sarcasm aimed at the user
- ❌ "As an AI..." references
- ❌ "Great question!" filler
- ❌ Excessive emoji (max 1–2 per rationale, zero in stems)
- ❌ Anti-ServiceNow snark

---

## 7. Exam Build Sequence

| Order | Exam | Status |
|---|---|---|
| 1 | **CSA** | next up |
| 2 | **CAD** | queued |
| 3 | **CIS-ITSM** | queued |
| 4 | **CIS-DF** (Data Foundations) | queued |

---

## 8. CSA Blueprint & Batch Plan (Yokohama)

| Domain | Weight | Questions @ 240 | Batches |
|---|---|---|---|
| Platform Overview & Navigation | 6% | 14 | 1 |
| Instance Configuration | 10% | 24 | 2 |
| Configuring Apps for Collaboration | 19.5% | 47 | 4 |
| Self-Service & Automation | 19.5% | 47 | 4 |
| Database Mgmt & Platform Security | 30% | 72 | 5 |
| Data Migration & Integration | 15% | 36 | 3 |
| **Total** | **100%** | **240** | **~19** |

### Batch protocol
1. Generate batch (10–15 questions).
2. Fetch and verify each docs.servicenow.com URL.
3. Cross-check correct answers against source doc.
4. Hand back JSON for review.
5. JP signs off → commit → next batch.

### Difficulty distribution per batch
- ~50% recall
- ~35% application
- ~15% scenario

---

## 9. File / Repo Structure

```
glideup/
├── README.md
├── astro.config.mjs
├── package.json
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── components/
│   │   ├── TopBar.astro
│   │   ├── SideNav.astro
│   │   ├── Breadcrumb.astro
│   │   ├── CosmicHero.astro
│   │   ├── StatCard.astro
│   │   ├── DomainCard.astro
│   │   ├── QuestionCard.astro
│   │   ├── Feedback.astro
│   │   └── AchievementBadge.astro
│   ├── content/
│   │   ├── questions/
│   │   │   ├── csa.json
│   │   │   ├── cad.json
│   │   │   ├── cis-itsm.json
│   │   │   └── cis-df.json
│   │   ├── blueprints/
│   │   │   ├── csa.json
│   │   │   └── ...
│   │   └── achievements.json
│   ├── lib/
│   │   ├── progress.js
│   │   ├── scoring.js
│   │   └── selection.js
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [exam]/index.astro
│   │   ├── [exam]/practice.astro
│   │   └── about.astro
│   └── styles/
│       └── global.css
└── scripts/
    └── validate-questions.mjs
```

---

## 10. Gamification (v1 — anonymous)

### XP economy
- Correct (first try): **+25 XP**
- Correct after one wrong: **+10 XP**
- Wrong (read rationale): **+5 XP**
- Streak day bonus: **+50 XP**

### Tiers (per domain)
- **Locked** — fewer than 10 answered
- **🥉 Bronze** — 10+ answered, ≥65% accuracy
- **🥈 Silver** — all answered, ≥75% accuracy
- **🏆 Gold** — all answered, ≥90% accuracy

### Initial 12 achievements
🔥 Streak Goblin · 📚 Read the Distractor · 🎯 First Blood · ⚡ Speed Glider · 🧠 Goblin Brain · 🏆 Gold Standard · 💯 Perfect Run · 🔄 Comeback Kid · 🌅 Early Bird · 🦉 Night Owl · 🧌 Certified Goblin · 🎓 CSA Conqueror

---

## 11. Validation Requirements

1. **Schema check** — automated.
2. **URL liveness check** — every `references[].url` returns 2xx.
3. **Source verification** — rationale supported by linked doc.
4. **Voice check** — manual review.
5. **No dump origin** — generated from blueprint + documentation only.

---

## 12. Next Action

Generate first CSA batch: **Platform Overview & Navigation (14 questions)**.

Process: pull from blueprint subdomains → web-fetch corresponding docs.servicenow.com pages → author per schema + voice → verify URLs → hand back as `csa-platform-overview-batch.json` → review → commit → next batch.

---

## 13. References

- CSA Mainline Blueprint — ServiceNow University KB0011554
- CAD Blueprint — KB0011498
- CIS-ITSM Blueprint — KB0011560
- CIS-DF Blueprint — KB0012913
- ServiceNow Documentation — https://docs.servicenow.com
- ServiceNow Developer Site — https://developer.servicenow.com

---

## Memory Anchor (paste at top of any new session)

```
PROJECT: GlideUp.net
WHAT: Free community ServiceNow cert practice site (CSA → CAD → CIS-ITSM → CIS-DF, 240q each)
VOICE: Goblin-encouraging — warm/playful in rationales, accurate in stems
BRAND (v3, NE-accurate):
  - Chrome: midnight navy #1B1B3F (top bar)
  - Primary action: deep teal #0E8B9E (CTAs, active states, progress)
  - Cosmic accent: magenta #E91E63 (sparingly — hero stars, brand spark)
  - Light content area, white cards, dark text
  - NE workspace layout: top bar + side nav rail + content
  - Hero treatment: cosmic dark navy with starfield
MASCOT: 🧌 in achievements/microcopy only
STACK: Astro static + JSON banks + Cloudflare Pages + localStorage
STATUS: mockup v3 approved, generating CSA Platform Overview batch (14 questions) next
RULES: every question doc-anchored to verified docs.servicenow.com URL,
       distractor_notes required, no dumps
SCHEMA: see Section 5 of glideup-project-handoff-v3.md
LAYOUT: Section 4 of handoff
```
