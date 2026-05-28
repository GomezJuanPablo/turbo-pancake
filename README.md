# GlideUp.net

> Free, community-built, doc-anchored ServiceNow certification practice — with gamified, goblin-encouraging UX.

GlideUp is a free study site for ServiceNow certifications (CSA → CAD → CIS-ITSM → CIS-DF). Every question is anchored to verified documentation on docs.servicenow.com. Every wrong answer comes with a `distractor_notes` explanation of *why* it's wrong. No login, no PII, no ads — anonymous progress via `localStorage`.

---

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
└── README.md
```
## License

MIT — see [LICENSE](./LICENSE). Question content is offered under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) so the community can fork and extend.

