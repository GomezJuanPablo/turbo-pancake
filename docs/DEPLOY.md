---
title: GlideUp.net — Cloudflare Pages deploy
version: 1.0
target: Tuesday ship
---

# GlideUp.net — Deploy guide

This walks JP through getting `glideup.net` live on Cloudflare Pages. Everything below is one-time setup — after the first deploy, every push to `main` rebuilds automatically.

Estimated total time: **20–30 minutes** end to end.

---

## 0. Prereqs (5 min)

- [ ] You're on macOS with `git` installed (`git --version` should work).
- [ ] You have a Cloudflare account that owns the `glideup.net` zone (or you'll move the domain there in step 4).
- [ ] You have a GitHub account with permission to push to `github.com/GomezJuanPablo/turbo-pancake`.

If any of these are missing, do them first.

---

## 1. Push the repo to GitHub (5 min)

From the project root (`/Users/kesilabs/Documents/Claude/Projects/GlideUp`):

```bash
# Initialize if not already a git repo
git init
git branch -M main

# Stage everything (the .gitignore already excludes node_modules, dist, .archive)
git add .
git commit -m "Initial commit: GlideUp.net v3 — CSA bank + Astro site"

# Create the GitHub repo. Either:
#   (a) gh repo create GomezJuanPablo/turbo-pancake --public --source=. --push
#   (b) Create empty repo on github.com, then:
git remote add origin https://github.com/GomezJuanPablo/turbo-pancake.git
git push -u origin main
```

**Verify:** the repo on github.com shows `src/`, `scripts/`, `package.json`, `astro.config.mjs`, and `.github/workflows/validate.yml`. The `.archive/` folder should NOT appear in the repo — confirm `.gitignore` is excluding it.

> If `.archive/` slipped in, run `git rm -r --cached .archive && git commit -m "exclude archive" && git push`.

---

## 2. Connect Cloudflare Pages (10 min)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize Cloudflare to read your GitHub account if you haven't already.
3. Select the **`GomezJuanPablo/turbo-pancake`** repository.
4. **Set up builds and deployments:**
   - **Project name:** `glideup`
   - **Production branch:** `main`
   - **Framework preset:** Astro (Cloudflare auto-detects; if not, pick Astro from the dropdown)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leave blank)*
   - **Environment variables:** *(none needed for v1)*
5. Click **Save and Deploy**.

The first deploy takes 1–2 minutes. When it's done you'll get a preview URL like `glideup-abc.pages.dev`. Open it. Confirm:

- [ ] Homepage loads with cosmic banner + 4 exam cards (CSA Live, three Coming soon).
- [ ] `/csa/` loads with domain mastery cards.
- [ ] `/csa/practice/` shows a question, the option buttons work, submitting reveals the feedback panel.
- [ ] `/about/` and `/roadmap/` load.

If anything is broken at the preview URL, **fix it before binding the custom domain** — once `glideup.net` points at this, every visitor sees whatever's there.

---

## 3. Bind glideup.net (5 min)

1. Inside the Pages project: **Custom domains** → **Set up a custom domain** → enter `glideup.net`.
2. Cloudflare will detect that the zone is already on your account and offer to create the CNAME automatically. Accept.
3. Repeat for `www.glideup.net` (so both `glideup.net` and `www.glideup.net` resolve).
4. Wait ~1–2 minutes for the DNS to propagate and Cloudflare to provision the cert.

**Force HTTPS:** Pages does this by default — confirm by visiting `http://glideup.net` and verifying it redirects to `https://glideup.net`.

> If `glideup.net` is registered elsewhere (Namecheap/Google Domains/etc.), you'll need to point its nameservers at Cloudflare first. Cloudflare → **Websites** → **Add a site** → walk through the nameserver swap, wait for propagation (5 min to 24 hr), then come back here.

---

## 4. Enable Web Analytics (2 min)

1. Cloudflare → **Analytics & Logs** → **Web Analytics** → **Add a site**.
2. Hostname: `glideup.net`. **Automatic Setup**: ON (it injects the snippet via Cloudflare's network — no code change needed).
3. Save.

You'll start seeing pageviews within an hour. No cookies, no banner needed, no GDPR consent flow.

---

## 5. Security headers + redirects (already in repo)

The build already ships these in `public/_headers` and `public/_redirects`. Cloudflare Pages picks them up automatically. After your first deploy, verify with:

```bash
curl -sI https://glideup.net/ | grep -iE 'x-frame|content-type|referrer|permissions'
```

You should see:
```
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
```

---

## 6. Production smoke test (5 min)

Once `https://glideup.net` is live, run through this list. Don't skip it — half the bugs only surface in production.

### Functional

- [ ] **Homepage** at `https://glideup.net/` — banner image renders, CTA "Start CSA" works.
- [ ] **CSA dashboard** at `/csa/` — 6 domain cards visible, weights correct (6 / 10 / 19.5 / 19.5 / 30 / 15).
- [ ] **Practice page** at `/csa/practice/` —
  - [ ] Question loads, all 4 options clickable
  - [ ] Submit reveals correct/incorrect state + rationale + distractor notes + doc reference link
  - [ ] Doc reference link opens `docs.servicenow.com` (or `www.servicenow.com/docs/...`) in a new tab and returns 200
  - [ ] "Next question →" advances to a different question
  - [ ] Top-bar XP and 🔥 streak counters increment as you answer
- [ ] **About** at `/about/` — mascot bust renders, "Reset local progress" button works.
- [ ] **Roadmap** at `/roadmap/` — 4 phase cards visible.
- [ ] **Mobile** — open `https://glideup.net/` on your phone. Side nav collapses cleanly, hero is readable, practice page is usable.

### Network / metadata

- [ ] **Console errors:** Open DevTools → Console. Should be empty (no red).
- [ ] **OG card preview:** Paste `https://glideup.net/` into [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). Expected: title "GlideUp.net — Free ServiceNow Cert Practice", description visible, image renders. If image is missing, drop `banner-og-1200x630.png` into `public/brand/` and redeploy.
- [ ] **Sitemap:** `https://glideup.net/sitemap-index.xml` returns 200 and lists 5 routes.
- [ ] **robots.txt:** `https://glideup.net/robots.txt` returns 200 and points at the sitemap.
- [ ] **Web Analytics is receiving hits:** Refresh the Pages → Web Analytics view. You should see at least 1 pageview from your smoke test (it may take 5–10 min to surface).

### Doc reference spot-checks

Pick 5 random reference URLs from `src/content/questions/csa/*.json` and `curl -sI` them. All should return `HTTP/2 200`. The CI workflow already runs URL liveness on every push.

---

## 7. After ship — first-week monitoring

- **Day 1**: Check Web Analytics for pageview spikes; spot-check 3 random questions per domain for typos.
- **Day 3**: Read the first few rows of `analytics > top pages` — confirm `/csa/practice/` is the second-most-visited route after `/`.
- **Day 7**: Re-run the full URL liveness check (`npm run validate:urls`) locally. ServiceNow occasionally reshuffles their docs URLs at release boundaries.

---

## Rollback

If a deploy breaks production:

1. Cloudflare → **Workers & Pages** → `glideup` → **Deployments**.
2. Find the last known-good deploy → **⋯** → **Rollback to this deployment**.
3. Fix forward in a branch, open a PR, merge when green.

---

## Useful commands (local)

```bash
npm install              # one time
npm run dev              # local dev server at http://localhost:4321
npm run validate         # schema + URL liveness + voice scan (slow — does 98 fetches)
npm run validate:schema  # fast — schema check only
npm run validate:voice   # fast — voice anti-pattern scan only
npm run build            # production build → dist/
npm run preview          # serve the production build locally
```

---

## Open follow-ups (post-launch)

- [ ] Drop the three missing brand variants into `public/brand/`: `logo-white.svg`, `banner-og-1200x630.png`, `mascot-bust.png`. The site already references them by filename, so they'll appear automatically on next deploy.
- [ ] Add a real domain certificate exception for `developer.servicenow.com` references if any are added later.
- [ ] Consider Plausible or a self-hosted analytics page for richer per-domain stats once Web Analytics' free tier limits become visible.

---

**Ship checklist (Tuesday morning):**
1. [ ] Repo on GitHub
2. [ ] Cloudflare Pages connected + first deploy green
3. [ ] glideup.net + www.glideup.net resolve over HTTPS
4. [ ] Web Analytics enabled
5. [ ] All 6 smoke-test checks pass
6. [ ] You've personally answered at least one question end-to-end on production

When all six are checked, GlideUp is live. 🧌
