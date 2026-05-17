# GlideUp.net — Project Instructions

Free, community-built, doc-anchored ServiceNow certification practice site with gamified, goblin-encouraging UX. NE-native visual language. Status: pre-build, mockup v3 approved, generating CSA Platform Overview batch next.

**Always open `docs/glideup-project-handoff-v3.md` for the authoritative spec.** This file is a summary anchor for fast orientation; the handoff markdown is the source of truth.

---

## Memory anchor (paste-safe summary)

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

---

## Files in this folder

- `docs/glideup-project-handoff-v3.md` — full handoff (authoritative spec)
- `docs/glideup-mockup-v3.html` — NE-accurate HTML mockup (visual reference)
- `docs/glideup-image-prompts-v3.md` — logo / banner / mascot image prompts
- `CLAUDE.md` — this file

When the codebase exists, expected structure:

```
glideup/
├── src/
│   ├── components/   TopBar, SideNav, Breadcrumb, CosmicHero, StatCard,
│   │                 DomainCard, QuestionCard, Feedback, AchievementBadge
│   ├── content/
│   │   ├── questions/   csa.json, cad.json, cis-itsm.json, cis-df.json
│   │   ├── blueprints/  per-exam blueprint JSON
│   │   └── achievements.json
│   ├── lib/   progress.js, scoring.js, selection.js
│   ├── pages/ index, [exam]/index, [exam]/practice, about
│   └── styles/global.css
├── scripts/validate-questions.mjs
├── public/
└── astro.config.mjs, package.json, README.md
```

---

## Brand rules (v3 — non-negotiable)

| Token | Hex | Role |
|---|---|---|
| Chrome | `#1B1B3F` | Top bar (midnight navy) |
| Chrome-2 | `#252557` | Elevated chrome / hover |
| Chrome border | `#2E2E5F` | Chrome dividers |
| Background | `#F4F6F8` | Light content area |
| Surface | `#FFFFFF` | Cards |
| Border | `#E1E4E8` | Card borders |
| Text | `#1A1A2E` | Primary text |
| Primary | `#0E8B9E` | **Deep teal — all CTAs, active states, progress** |
| Primary hover | `#006B7F` | CTA hover |
| Magenta | `#E91E63` | **Cosmic spark — sparing use only** |
| Success | `#16A75C` | Correct state |
| Amber | `#FF8C42` | Streaks |
| Rose | `#E63946` | Incorrect state |
| Bronze / Silver / Gold | `#A77043` / `#6B7A8A` / `#D4A017` | Tier badges |

**Color usage rules:**
- Chrome stays dark. Top bar = `--chrome`, white text, muted-light nav.
- Action stays teal. Every button, active nav item, progress bar, link uses `--primary`.
- Magenta is a SPARK, not a color. One dot in logo glow, one streak in a progress gradient, dots in hero starfield. Never dominant.
- Light gives structure. White cards on `#F4F6F8` background. Density on cards.
- Bright lime green is NOT NE chrome. It appears in data viz only.

**Layout (NE workspace shell):**
- Top bar 52px, midnight navy. Brand left · top nav middle · status pills right.
- Side nav 240px, white, grouped (Practice / Library / Community).
- Active nav: `--primary-bg` tint + 3px `--primary` left border.
- Content max-width 1180px, padded 28–36px.
- Hero card: dark navy gradient + subtle starfield + teal/magenta sparks + soft teal radial glow.
- Stat cards (NE metric pattern) below hero, before tabs.
- Tabs: underline-on-active, NE style.

---

## Voice (goblin-encouraging)

Stems are exam-accurate and unornamented. Personality lives in **rationales, achievements, and microcopy only**.

- ✅ Correct opener: short affirmation ("Boom. Nailed it.")
- ⚠️ Incorrect opener: gentle ("Not quite — but now you know.")
- Distractor notes: specific about *why*, can be playful, always informative.
- Mascot: 🧌 in achievements/footer/microcopy. Never in chrome. Never in stems.

**Anti-patterns:** sarcasm at the user, "As an AI...", "Great question!", >2 emoji per rationale, emoji in stems, anti-ServiceNow snark, slang that ages badly.

---

## Question schema (canonical)

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
  "rationale": "Why the correct answer is correct.",
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

**Required:** id slug pattern · `correct` always an array · `distractor_notes` for every wrong option · at least one verified docs.servicenow.com URL.

---

## Batch generation protocol

Sequential, sign-off-per-batch. **Never run two batches in one pass without JP's sign-off in between.**

1. **Scope** — pull subdomains from the exam blueprint (see `docs/glideup-project-handoff-v3.md` §8 for CSA).
2. **Fetch** — `WebFetch` each relevant docs.servicenow.com page. Read, don't skim.
3. **Author** — write 10–15 questions per batch, NE-accurate stems, goblin-encouraging rationales, distractor notes for every wrong option.
4. **Mix difficulty** — ~50% recall, ~35% application, ~15% scenario.
5. **Verify URLs** — every `references[].url` must return 2xx. Re-fetch to confirm.
6. **Hand back** — output as a JSON file in `src/content/questions/` (or `outputs/` if pre-code) named `csa-{domain-slug}-batch.json`.
7. **Wait for JP sign-off** before starting the next batch.

**Validation checklist before any hand-back:**
- Schema valid (all required fields present, types correct).
- Every wrong option has a `distractor_notes` entry.
- Every URL was fetched and returned 2xx in this session.
- Rationale is traceable to the linked doc (no inferences past what the doc says).
- Voice check: stems plain, rationales warm but not snarky, no anti-patterns.
- No content lifted from dump sites — all generated from blueprint + ServiceNow documentation.

---

## CSA batch plan (Yokohama, 240 questions)

| Domain | Weight | Questions | Batches |
|---|---|---|---|
| Platform Overview & Navigation | 6% | 14 | 1 |
| Instance Configuration | 10% | 24 | 2 |
| Configuring Apps for Collaboration | 19.5% | 47 | 4 |
| Self-Service & Automation | 19.5% | 47 | 4 |
| Database Mgmt & Platform Security | 30% | 72 | 5 |
| Data Migration & Integration | 15% | 36 | 3 |
| **Total** | **100%** | **240** | **~19** |

---

## Gamification (v1, anonymous, localStorage)

**XP:** correct first try +25 · correct after one wrong +10 · wrong (read rationale) +5 · streak day +50.

**Tiers per domain:** Locked (<10 answered) · 🥉 Bronze (10+ answered, ≥65%) · 🥈 Silver (all answered, ≥75%) · 🏆 Gold (all answered, ≥90%).

**Initial 12 achievements:** 🔥 Streak Goblin · 📚 Read the Distractor · 🎯 First Blood · ⚡ Speed Glider · 🧠 Goblin Brain · 🏆 Gold Standard · 💯 Perfect Run · 🔄 Comeback Kid · 🌅 Early Bird · 🦉 Night Owl · 🧌 Certified Goblin · 🎓 CSA Conqueror.

---

## Next action

**Generate CSA batch 1: Platform Overview & Navigation (14 questions).**

Do NOT start this batch until JP signals go. When JP says "start the batch" or similar:
1. Pull the Platform Overview & Navigation subdomains from blueprint KB0011554.
2. WebFetch each corresponding docs.servicenow.com page.
3. Author 14 questions per schema + voice + difficulty mix.
4. Verify every URL live.
5. Hand back as `csa-platform-overview-batch.json` in `outputs/` (since the Astro codebase doesn't exist yet).
6. Wait for JP review.

---

## External references

- ServiceNow Documentation — https://docs.servicenow.com
- ServiceNow Developer Site — https://developer.servicenow.com
- CSA Blueprint — KB0011554 · CAD Blueprint — KB0011498 · CIS-ITSM Blueprint — KB0011560 · CIS-DF Blueprint — KB0012913
