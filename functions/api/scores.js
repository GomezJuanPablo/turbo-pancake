/**
 * GlideUp Leaderboard API — Cloudflare Pages Function
 * KV binding: LEADERBOARD (bind in CF Pages dashboard)
 *
 * POST /api/scores  { username, exam, mode, score, total }
 * GET  /api/scores?exam=CSA
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

const TOP_N   = 25;
const EXAMS   = ['CSA','CAD','CIS-ITSM','CIS-DF','CIS-SM'];
const BAD_NAMES = /[<>&"'`]/; // basic XSS guard

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  // ── GET /api/scores?exam=CSA ───────────────────────────────────────
  if (request.method === 'GET') {
    const exam = (url.searchParams.get('exam') || '').toUpperCase();
    if (!EXAMS.includes(exam)) return json({ error: 'Unknown exam' }, 400);

    const raw = await env.LEADERBOARD.get(`top:${exam}`);
    const board = raw ? JSON.parse(raw) : [];
    return json({ exam, scores: board });
  }

  // ── POST /api/scores ───────────────────────────────────────────────
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

    const { username, exam, mode, score, total } = body;

    if (!username || typeof username !== 'string' || username.length < 1 || username.length > 24)
      return json({ error: 'Username must be 1–24 characters' }, 400);
    if (BAD_NAMES.test(username))
      return json({ error: 'Username contains invalid characters' }, 400);
    if (!EXAMS.includes((exam || '').toUpperCase()))
      return json({ error: 'Unknown exam' }, 400);
    if (typeof score !== 'number' || typeof total !== 'number' || total <= 0 || score < 0 || score > total)
      return json({ error: 'Invalid score' }, 400);

    const entry = {
      username: username.trim(),
      exam: exam.toUpperCase(),
      mode: mode || 'Practice',
      score,
      total,
      pct: Math.round((score / total) * 100),
      at: new Date().toISOString(),
    };

    // Update the top-N list for this exam
    const key = `top:${entry.exam}`;
    const raw = await env.LEADERBOARD.get(key);
    const board = raw ? JSON.parse(raw) : [];

    board.push(entry);
    board.sort((a, b) => b.pct - a.pct || b.score - a.score);
    const trimmed = board.slice(0, TOP_N);

    await env.LEADERBOARD.put(key, JSON.stringify(trimmed));
    return json({ ok: true, rank: trimmed.findIndex(e => e.at === entry.at) + 1 });
  }

  return json({ error: 'Method not allowed' }, 405);
}
