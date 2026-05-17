# PR Checklist

## What this changes
<!-- one or two sentences -->

## Type
- [ ] New question batch
- [ ] UI / component change
- [ ] Infrastructure / tooling
- [ ] Docs

## Question-batch checks (delete this section if not applicable)
- [ ] Schema validates (`npm run validate:schema`)
- [ ] Every `references[].url` returns 2xx (`npm run validate:urls`)
- [ ] Every wrong option has a `distractor_notes` entry
- [ ] `correct` is always an array
- [ ] Rationale is traceable to the linked doc — no inferences past what the doc says
- [ ] Voice: stems plain, rationales warm but not snarky, no anti-patterns
- [ ] Difficulty mix in this batch is roughly 50% recall / 35% application / 15% scenario
- [ ] No content lifted from dump sites

## Brand checks (delete if not applicable)
- [ ] Chrome stays dark (`#1B1B3F` top bar)
- [ ] Primary action color is `#0E8B9E` (deep teal), never anything else
- [ ] Magenta `#E91E63` used sparingly as cosmic spark only
