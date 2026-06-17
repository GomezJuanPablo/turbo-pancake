/**
 * GlideUp Feedback API — Cloudflare Pages Function
 * POST /api/feedback           submit feedback (type, message, page, question)
 * GET  /api/feedback?key=...   read submissions (gated by FEEDBACK_KEY env var)
 *
 * Storage: reuses the existing `leaderboard` KV binding under a feedback:* key
 * (zero config). If a GITHUB_TOKEN env secret is set, each submission also
 * opens a GitHub issue in the repo for triage.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TYPES = { feature: 'Feature request', bug: 'Bug report', question: 'Question feedback' };
const LIST_KEY = 'feedback:list';
const MAX_KEEP = 500;
const REPO = 'GomezJuanPablo/turbo-pancake';

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function clean(s, max) {
  return String(s == null ? '' : s).trim().slice(0, max);
}

async function openGithubIssue(env, entry) {
  if (!env.GITHUB_TOKEN) return null;
  const snip = entry.message.length > 70 ? entry.message.slice(0, 70) + '…' : entry.message;
  const title = `[${TYPES[entry.type]}] ${snip}`;
  const body = [
    `**Type:** ${TYPES[entry.type]}`,
    `**Page:** ${entry.page || '(unknown)'}`,
    entry.question ? `**Question:** ${entry.question}` : '',
    `**Submitted:** ${entry.at}`,
    '', '---', '',
    entry.message,
    '', '_Submitted via the in-app feedback widget._',
  ].filter(Boolean).join('\n');
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'glideup-feedback',
      },
      body: JSON.stringify({ title, body }),
    });
    if (res.ok) { const d = await res.json(); return d.html_url || null; }
  } catch { /* best-effort */ }
  return null;
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (!env.leaderboard) return respond({ error: 'Feedback storage not configured. Check KV binding.' }, 503);

  const url = new URL(request.url);

  if (method === 'GET') {
    if (!env.FEEDBACK_KEY) return respond({ error: 'Reading is disabled until FEEDBACK_KEY is set.' }, 503);
    if (url.searchParams.get('key') !== env.FEEDBACK_KEY) return respond({ error: 'Unauthorized' }, 401);
    try {
      const raw = await env.leaderboard.get(LIST_KEY);
      return respond({ items: raw ? JSON.parse(raw) : [] });
    } catch (err) {
      return respond({ error: 'Failed to read feedback', detail: String(err) }, 500);
    }
  }

  if (method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return respond({ error: 'Invalid JSON body' }, 400); }

    const type = clean(body.type, 20);
    const message = clean(body.message, 2000);
    if (!TYPES[type]) return respond({ error: 'Invalid feedback type' }, 400);
    if (message.length < 2) return respond({ error: 'Message is required' }, 400);

    const entry = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      type,
      message,
      page: clean(body.page, 300),
      question: clean(body.question, 400),
      at: new Date().toISOString(),
    };

    try {
      const raw = await env.leaderboard.get(LIST_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      await env.leaderboard.put(LIST_KEY, JSON.stringify(list.slice(0, MAX_KEEP)));
    } catch (err) {
      return respond({ error: 'Failed to save feedback', detail: String(err) }, 500);
    }

    const issueUrl = await openGithubIssue(env, entry);
    return respond({ ok: true, issue: issueUrl });
  }

  return respond({ error: 'Method not allowed' }, 405);
}
