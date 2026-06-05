/**
 * GlideUp Leaderboard API — Cloudflare Pages Function
 * Handles: GET /api/scores?exam=CSA  |  POST /api/scores
 * KV binding: leaderboard (set in CF Pages → Settings → Bindings)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_EXAMS = new Set(['CSA','CAD','CIS-ITSM','CIS-DF','CIS-SM']);
const TOP_N = 25;

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Verify KV binding exists
  if (!env.leaderboard) {
    return respond({ error: 'Leaderboard storage not configured. Check KV binding.' }, 503);
  }

  const url = new URL(request.url);

  // ── GET ────────────────────────────────────────────────────────────
  if (method === 'GET') {
    const exam = (url.searchParams.get('exam') || '').toUpperCase();
    if (!VALID_EXAMS.has(exam)) {
      return respond({ error: `Unknown exam. Valid: ${[...VALID_EXAMS].join(', ')}` }, 400);
    }
    try {
      const raw = await env.leaderboard.get(`top:${exam}`);
      const scores = raw ? JSON.parse(raw) : [];
      return respond({ exam, scores });
    } catch (err) {
      return respond({ error: 'Failed to read scores', detail: String(err) }, 500);
    }
  }

  // ── POST ───────────────────────────────────────────────────────────
  if (method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return respond({ error: 'Invalid JSON body' }, 400); }

    const { username, exam, mode, score, total } = body ?? {};
    const examUpper = (exam ?? '').toUpperCase();

    if (!username || typeof username !== 'string' || username.length < 1 || username.length > 24) {
      return respond({ error: 'Username must be 1-24 characters' }, 400);
    }
    if (/[<>&"'`]/.test(username)) {
      return respond({ error: 'Username contains invalid characters' }, 400);
    }
    if (!VALID_EXAMS.has(examUpper)) {
      return respond({ error: 'Unknown exam' }, 400);
    }
    if (typeof score !== 'number' || typeof total !== 'number' || total <= 0 || score < 0 || score > total) {
      return respond({ error: 'Invalid score values' }, 400);
    }

    const entry = {
      username: username.trim(),
      exam: examUpper,
      mode: typeof mode === 'string' ? mode.slice(0, 40) : 'Practice',
      score,
      total,
      pct: Math.round((score / total) * 100),
      at: new Date().toISOString(),
    };

    try {
      const key = `top:${examUpper}`;
      const existing = await env.leaderboard.get(key);
      const board = existing ? JSON.parse(existing) : [];
      board.push(entry);
      board.sort((a, b) => b.pct - a.pct || b.score - a.score);
      const trimmed = board.slice(0, TOP_N);
      await env.leaderboard.put(key, JSON.stringify(trimmed));
      const rank = trimmed.findIndex(e => e.at === entry.at) + 1;
      return respond({ ok: true, rank });
    } catch (err) {
      return respond({ error: 'Failed to save score', detail: String(err) }, 500);
    }
  }

  // ── PUT (temporary seed) ───────────────────────────────────────────
  if (method === 'PUT') {
    let body;
    try { body = await request.json(); }
    catch { return respond({ error: 'Invalid JSON body' }, 400); }
    if (!body || body.key !== 'seed_osNTUgSo8tVfNRRynIt7WH9o5nJ2M3g0') return respond({ error: 'Unauthorized' }, 401);
    const examUpper = (body.exam ?? '').toUpperCase();
    if (!VALID_EXAMS.has(examUpper)) return respond({ error: 'Unknown exam' }, 400);
    if (!Array.isArray(body.scores) || body.scores.length === 0) return respond({ error: 'bad scores' }, 400);
    const board = [];
    for (const r of body.scores) {
      const score = Number(r.score), total = Number(r.total);
      if (!r.username || typeof r.username !== 'string' || r.username.length > 24) continue;
      if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) continue;
      board.push({
        username: r.username.trim(), exam: examUpper,
        mode: typeof r.mode === 'string' ? r.mode.slice(0, 40) : 'Exam Sim 1',
        score, total, pct: Math.round((score / total) * 100),
        at: typeof r.at === 'string' ? r.at : new Date().toISOString(),
      });
    }
    board.sort((a, b) => b.pct - a.pct || b.score - a.score);
    const trimmed = board.slice(0, TOP_N);
    await env.leaderboard.put(`top:${examUpper}`, JSON.stringify(trimmed));
    return respond({ ok: true, count: trimmed.length });
  }

  return respond({ error: 'Method not allowed' }, 405);
}
