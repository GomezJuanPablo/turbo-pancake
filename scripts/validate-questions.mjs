#!/usr/bin/env node
/**
 * GlideUp — validate-questions.mjs
 *
 * Validates every question bank under src/content/questions/{exam}/ against
 * the canonical schema (per CLAUDE.md §"Question schema"), scans for voice
 * anti-patterns (CLAUDE.md §"Voice"), and verifies that every
 * references[].url returns 2xx on docs.servicenow.com /
 * www.servicenow.com/docs / developer.servicenow.com.
 *
 * Usage:
 *   node scripts/validate-questions.mjs              # schema + voice + URL liveness
 *   node scripts/validate-questions.mjs --schema-only
 *   node scripts/validate-questions.mjs --urls-only
 *   node scripts/validate-questions.mjs --voice-only
 *   node scripts/validate-questions.mjs --file path/to/file.json
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const QUESTIONS_DIR = join(ROOT, 'src', 'content', 'questions');
const BLUEPRINTS_DIR = join(ROOT, 'src', 'content', 'blueprints');

const argv = process.argv.slice(2);
const schemaOnly = argv.includes('--schema-only');
const urlsOnly = argv.includes('--urls-only');
const voiceOnly = argv.includes('--voice-only');
const fileArg = argv.includes('--file') ? argv[argv.indexOf('--file') + 1] : null;

const runSchema = !urlsOnly && !voiceOnly;
const runVoice = !schemaOnly && !urlsOnly;
const runUrls = !schemaOnly && !voiceOnly;

const ALLOWED_DIFFICULTY = new Set(['recall', 'application', 'scenario']);
const ALLOWED_TYPE = new Set(['single_select', 'multi_select']);
const ALLOWED_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'F']);
const ID_PATTERN = /^[a-z]+-[a-z0-9-]+-\d{3}$/;

// Voice anti-patterns from CLAUDE.md §"Voice"
const VOICE_PATTERNS = [
  { rx: /\bas an ai\b/i, label: '"As an AI..." (anti-pattern)' },
  { rx: /\bgreat question!?/i, label: '"Great question!" filler' },
  { rx: /\bI'm just an? (?:large )?language model\b/i, label: '"I\'m just a language model"' },
  { rx: /^\s*sorry,?\s*but\b/i, label: 'apologetic opener' },
];

let errorCount = 0;
let warnCount = 0;
const errors = [];

function err(file, qid, msg)  { errorCount++; errors.push({ level: 'ERROR', file, qid, msg }); }
function warn(file, qid, msg) { warnCount++;  errors.push({ level: 'WARN',  file, qid, msg }); }

/* ---------- Schema validation ---------- */

function validateQuestion(q, file) {
  const qid = q?.id || '(missing id)';

  const required = [
    'id','exam','domain','difficulty','type','stem',
    'options','correct','rationale','distractor_notes','references',
  ];
  for (const f of required) if (!(f in q)) err(file, qid, `missing required field: ${f}`);

  if (q.id && !ID_PATTERN.test(q.id)) err(file, qid, `id "${q.id}" doesn't match pattern {exam}-{slug}-{NNN}`);
  if (q.difficulty && !ALLOWED_DIFFICULTY.has(q.difficulty)) {
    err(file, qid, `difficulty must be one of: ${[...ALLOWED_DIFFICULTY].join(', ')} (got "${q.difficulty}")`);
  }
  if (q.type && !ALLOWED_TYPE.has(q.type)) {
    err(file, qid, `type must be one of: ${[...ALLOWED_TYPE].join(', ')} (got "${q.type}")`);
  }

  if (typeof q.stem === 'string') {
    if (!q.stem.trim().endsWith('?')) warn(file, qid, 'stem does not end with "?"');
    if (/🧌|😀|😂|🔥|⚡/.test(q.stem)) err(file, qid, 'stem contains emoji — voice rule: zero emoji in stems');
  }

  if (!Array.isArray(q.options) || q.options.length < 2) {
    err(file, qid, 'options must be an array of at least 2 items');
  } else {
    const ids = new Set();
    for (const opt of q.options) {
      if (!opt || typeof opt.id !== 'string' || typeof opt.text !== 'string') {
        err(file, qid, 'each option must have string id + text');
      } else if (!ALLOWED_LETTERS.has(opt.id)) {
        err(file, qid, `option id "${opt.id}" must be a single uppercase letter A-F`);
      } else if (ids.has(opt.id)) {
        err(file, qid, `duplicate option id "${opt.id}"`);
      } else {
        ids.add(opt.id);
      }
    }
  }

  if (!Array.isArray(q.correct)) err(file, qid, '`correct` must be an array');
  else if (q.correct.length === 0) err(file, qid, '`correct` must have at least one entry');
  else if (q.type === 'single_select' && q.correct.length !== 1) {
    err(file, qid, `single_select must have exactly one correct answer (has ${q.correct.length})`);
  } else if (Array.isArray(q.options)) {
    const optIds = new Set(q.options.map((o) => o?.id).filter(Boolean));
    for (const c of q.correct) if (!optIds.has(c)) err(file, qid, `correct answer "${c}" not found in options`);
  }

  if (typeof q.rationale !== 'string' || q.rationale.trim().length < 20) {
    err(file, qid, 'rationale must be a non-trivial string (>= 20 chars)');
  }

  if (!q.distractor_notes || typeof q.distractor_notes !== 'object') {
    err(file, qid, 'distractor_notes must be an object');
  } else if (Array.isArray(q.options) && Array.isArray(q.correct)) {
    const correctSet = new Set(q.correct);
    for (const opt of q.options) {
      if (!opt?.id) continue;
      const isCorrect = correctSet.has(opt.id);
      const hasNote =
        typeof q.distractor_notes[opt.id] === 'string' && q.distractor_notes[opt.id].trim().length > 0;
      if (!isCorrect && !hasNote) err(file, qid, `missing distractor_notes for wrong option "${opt.id}"`);
      if (isCorrect && hasNote) {
        warn(file, qid, `distractor_notes includes correct option "${opt.id}" — should only document wrong options`);
      }
    }
  }

  if (!Array.isArray(q.references) || q.references.length === 0) {
    err(file, qid, 'references must be a non-empty array');
  } else {
    for (const r of q.references) {
      if (!r || typeof r.url !== 'string' || typeof r.title !== 'string') {
        err(file, qid, 'each reference needs string url + title');
        continue;
      }
      const ok =
        /^https:\/\/docs\.servicenow\.com\//.test(r.url) ||
        /^https:\/\/www\.servicenow\.com\/docs\//.test(r.url) ||
        /^https:\/\/developer\.servicenow\.com\//.test(r.url);
      if (!ok) {
        err(file, qid, `reference URL must be on docs.servicenow.com, www.servicenow.com/docs, or developer.servicenow.com (got ${r.url})`);
      }
    }
  }

  if (q.tags && !Array.isArray(q.tags)) err(file, qid, 'tags, if present, must be an array of strings');
}

/* ---------- Voice anti-pattern scan ---------- */

function checkAnswerLength(q, file) {
    // answer-length balance: warn when the correct option is a large length outlier
    const opts = Array.isArray(q.options) ? q.options : [];
    const correct = new Set(Array.isArray(q.correct) ? q.correct : []);
    if (opts.length < 2 || correct.size === 0) return;
    const cor = opts.filter((o) => correct.has(o.id)).map((o) => (o.text || '').length);
    const dis = opts.filter((o) => !correct.has(o.id)).map((o) => (o.text || '').length);
    if (!cor.length || !dis.length) return;
    const maxAll = Math.max(...opts.map((o) => (o.text || '').length));
    const avgDis = dis.reduce((a, b) => a + b, 0) / dis.length;
    const maxDis = Math.max(...dis);
    const maxCor = Math.max(...cor);
    if (maxCor >= maxAll && maxCor >= 1.6 * avgDis && maxCor >= 1.3 * maxDis) {
      warn(file, q.id || '(?)', `answer-length balance: correct option (${maxCor} chars) is a length outlier vs distractors (avg ${Math.round(avgDis)})`);
    }
  }

function scanVoice(q, file) {
  const qid = q?.id || '(missing id)';
  const corpus = [q.stem, q.rationale, ...(Object.values(q.distractor_notes || {}) || [])]
    .filter((s) => typeof s === 'string')
    .join('\n');
  for (const { rx, label } of VOICE_PATTERNS) {
    if (rx.test(corpus)) err(file, qid, `voice anti-pattern: ${label}`);
  }
}

/* ---------- URL liveness ---------- */

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status >= 200 && res.status < 400) return { ok: true, status: res.status };
    const res2 = await fetch(url, { method: 'GET', redirect: 'follow' });
    return { ok: res2.status >= 200 && res2.status < 400, status: res2.status };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function validateUrls(banks) {
  const seen = new Map();
  // Collect every unique URL first
  const allUrls = new Set();
  for (const { questions } of banks) {
    for (const q of questions) {
      if (!Array.isArray(q.references)) continue;
      for (const r of q.references) if (r?.url) allUrls.add(r.url);
    }
  }
  console.log(`  fetching ${allUrls.size} unique reference URL(s) in parallel…`);
  // Resolve in parallel (capped) to keep this from sitting forever
  const urls = [...allUrls];
  const BATCH = 12;
  for (let i = 0; i < urls.length; i += BATCH) {
    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(urls.slice(i, i + BATCH).map((u) => checkUrl(u).then((r) => [u, r])));
    for (const [u, r] of results) seen.set(u, r);
  }
  // Re-walk to attribute failures to question IDs
  for (const { file, questions } of banks) {
    for (const q of questions) {
      if (!Array.isArray(q.references)) continue;
      for (const r of q.references) {
        const result = seen.get(r.url);
        if (result && !result.ok) {
          err(file, q.id, `reference URL not 2xx: ${r.url} (status ${result.status}${result.error ? `, ${result.error}` : ''})`);
        }
      }
    }
  }
  const failed = [...seen.values()].filter((r) => !r.ok).length;
  console.log(`  ${allUrls.size - failed}/${allUrls.size} URLs returned 2xx`);
}

/* ---------- File discovery ---------- */

async function* walkJsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walkJsonFiles(full);
    else if (e.isFile() && e.name.endsWith('.json')) yield full;
  }
}

async function loadBanks() {
  if (fileArg) {
    const file = resolve(fileArg);
    const raw = await readFile(file, 'utf-8');
    const data = JSON.parse(raw);
    return [{ file, questions: Array.isArray(data) ? data : [data] }];
  }

  const banks = [];
  try {
    await stat(QUESTIONS_DIR);
  } catch {
    console.log(`No question directory at ${QUESTIONS_DIR.replace(ROOT + '/', '')}`);
    return [];
  }
  for await (const file of walkJsonFiles(QUESTIONS_DIR)) {
    const raw = await readFile(file, 'utf-8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      err(file, '(file)', `JSON parse error: ${e.message}`);
      continue;
    }
    if (!Array.isArray(data)) {
      err(file, '(file)', 'top-level value must be a JSON array of question objects');
      continue;
    }
    // Skip empty/orphaned files (legacy batch files emptied during reshape)
    if (data.length === 0) continue;
    banks.push({ file, questions: data });
  }
  return banks;
}

/* ---------- Cross-bank structural checks ---------- */
async function loadBlueprintDomains() {
  // exam (e.g. "CIS-ITSM") -> Set of valid domain names
  const map = {};
  let files = [];
  try { files = await readdir(BLUEPRINTS_DIR); } catch { return map; }
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    try {
      const bp = JSON.parse(await readFile(join(BLUEPRINTS_DIR, f), 'utf-8'));
      const exam = (bp.exam || f.replace('.json', '')).toUpperCase();
      map[exam] = new Set((bp.domains || []).map((d) => d.name));
    } catch { /* ignore */ }
  }
  return map;
}

async function crossBankChecks(banks) {
  const bpDomains = await loadBlueprintDomains();
  const idSeen = new Map();   // id -> file
  const stemSeen = new Map(); // normalized stem -> {file, id}
  for (const { file, questions } of banks) {
    for (const q of questions) {
      if (!q || typeof q !== 'object') continue;
      // cross-file duplicate id
      if (q.id) {
        if (idSeen.has(q.id) && idSeen.get(q.id) !== file) {
          err(file, q.id, `duplicate question id also in ${idSeen.get(q.id).replace(ROOT + '/', '')}`);
        } else if (!idSeen.has(q.id)) {
          idSeen.set(q.id, file);
        }
      }
      // domain must exist in the exam blueprint
      const exam = (q.exam || '').toUpperCase();
      if (exam && bpDomains[exam] && q.domain && !bpDomains[exam].has(q.domain)) {
        err(file, q.id || '(?)', `domain "${q.domain}" not in ${exam} blueprint`);
      }
      // duplicate stem (warn only; cross-exam repeats are acceptable but flagged)
      if (typeof q.stem === 'string') {
        const norm = q.stem.trim().toLowerCase();
        if (stemSeen.has(norm)) {
          const prev = stemSeen.get(norm);
          warn(file, q.id || '(?)', `duplicate stem of ${prev.id} (${prev.file.replace(ROOT + '/', '')})`);
        } else {
          stemSeen.set(norm, { file, id: q.id || '(?)' });
        }
      }
    }
  }
}

/* ---------- Main ---------- */

async function main() {
  console.log('GlideUp — validating question banks');
  console.log('-----------------------------------');

  const banks = await loadBanks();
  if (banks.length === 0) {
    console.log('No question banks found.');
    return;
  }

  let phase = 1;
  const phases = (runSchema ? 1 : 0) + (runVoice ? 1 : 0) + (runUrls ? 1 : 0);

  if (runSchema) {
    console.log(`\n[${phase}/${phases}] Schema check`);
    for (const { file, questions } of banks) {
      const rel = file.replace(ROOT + '/', '');
      console.log(`  ${rel} — ${questions.length} question${questions.length === 1 ? '' : 's'}`);
      const ids = new Set();
      for (const q of questions) {
        if (q?.id) {
          if (ids.has(q.id)) err(file, q.id, 'duplicate question id within file');
          else ids.add(q.id);
        }
        validateQuestion(q, file);
      }
    }
    await crossBankChecks(banks);
    phase++;
  }

  if (runVoice) {
    console.log(`\n[${phase}/${phases}] Voice anti-pattern scan`);
    let scanned = 0;
    for (const { file, questions } of banks) {
      for (const q of questions) {
        scanVoice(q, file);
        checkAnswerLength(q, file);
        scanned++;
      }
    }
    console.log(`  scanned ${scanned} questions`);
    phase++;
  }

  if (runUrls) {
    console.log(`\n[${phase}/${phases}] URL liveness check`);
    await validateUrls(banks);
  }

  console.log('\n-----------------------------------');
  if (errorCount === 0 && warnCount === 0) {
    console.log('✓ All checks passed.');
    process.exit(0);
  }

  for (const e of errors) {
    const where = e.qid && e.qid !== '(file)' ? `[${e.qid}]` : '';
    console.log(`${e.level === 'ERROR' ? '✗' : '⚠'} ${e.level}  ${e.file.replace(ROOT + '/', '')}  ${where}  ${e.msg}`);
  }
  console.log(`\n${errorCount} error${errorCount === 1 ? '' : 's'}, ${warnCount} warning${warnCount === 1 ? '' : 's'}.`);
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('validator crashed:', e);
  process.exit(2);
});
