# GlideUp.net

> Free, community-built, doc-anchored ServiceNow certification practice — with gamified, goblin-encouraging UX.

GlideUp is a free study site for ServiceNow certifications (CSA → CAD → CIS-ITSM → CIS-DF). Every question is anchored to verified documentation on docs.servicenow.com. Every wrong answer comes with a `distractor_notes` explanation of *why* it's wrong. No login, no PII, no ads — anonymous progress via `localStorage`.

---

## Stack

- **Framework:** [Astro](https://astro.build) (static, with islands for quiz interactivity)
- **Hosting:** Cloudflare Pages
- **State:** `localStorage` (client-only, anonymous)
- **Content:** JSON files, one per exam
- **Styling:** CSS variables + plain CSS (no preprocessor)

## Getting started

```bash
npm install
npm run dev          # local dev server
npm run build        # static build → dist/
npm run preview      # preview the built site
npm run validate     # schema + URL liveness check on all question banks
```

## Repo structure

```
glideup/
├── docs/                                # project handoff, mockup, image prompts
├── scripts/
│   └── validate-questions.mjs           # schema + URL liveness validator
├── src/
│   ├── components/                      # TopBar, SideNav, CosmicHero, QuestionCard, …
│   ├── content/
│   │   ├── questions/                   # csa.json, cad.json, cis-itsm.json, cis-df.json
│   │   ├── blueprints/                  # per-exam blueprint JSON
│   │   └── achievements.json
│   ├── lib/                             # progress.js, scoring.js, selection.js
│   ├── pages/                           # index, [exam]/index, [exam]/practice, about
│   └── styles/global.css                # v3 NE-accurate tokens
├── public/                              # favicon, og-image
├── astro.config.mjs
├── package.json
├── CLAUDE.md                            # project instructions (Claude-readable)
└── README.md
```

## Brand (v3 — NE-accurate)

GlideUp's chrome mirrors ServiceNow's Next Experience workspace. Dark midnight-navy top bar, white side rail, light gray content area, deep teal as the primary action color, magenta sparks for cosmic accent.

| Token | Hex | Role |
|---|---|---|
| Chrome | `#1B1B3F` | Top bar (midnight navy) |
| Primary | `#0E8B9E` | Deep teal — CTAs, active states, progress |
| Magenta | `#E91E63` | Cosmic spark, sparing use |
| Background | `#F4F6F8` | Light content area |
| Surface | `#FFFFFF` | Cards |

Full token table and usage rules: [`CLAUDE.md`](./CLAUDE.md) and [`docs/glideup-project-handoff-v3.md`](./docs/glideup-project-handoff-v3.md).

## Question schema

Every question in `src/content/questions/*.json` follows this shape:

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
    { "id": "A", "text": "Option text." },
    { "id": "B", "text": "Option text." },
    { "id": "C", "text": "Option text." },
    { "id": "D", "text": "Option text." }
  ],
  "correct": ["B"],
  "rationale": "Why the correct answer is correct — goblin-encouraging voice.",
  "distractor_notes": {
    "A": "Why A is wrong, specific.",
    "C": "Why C is wrong, specific.",
    "D": "Why D is wrong, specific."
  },
  "references": [
    { "title": "Doc page title", "url": "https://docs.servicenow.com/..." }
  ],
  "tags": ["next-experience", "navigation"]
}
```

Validator enforces: required fields present, `correct` is always an array, every wrong option has a `distractor_notes` entry, every `references[].url` returns 2xx.

## Contributing questions

1. Pick a domain from the exam blueprint (see `docs/glideup-project-handoff-v3.md` §8).
2. Author 10–15 questions following the schema and the voice rules (see `CLAUDE.md`).
3. Anchor every question to a verified `docs.servicenow.com` page.
4. Run `npm run validate` and fix any failures.
5. Open a PR.

## License

MIT — see [LICENSE](./LICENSE). Question content is offered under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) so the community can fork and extend.

