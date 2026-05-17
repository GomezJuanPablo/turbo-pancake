// GlideUp — progress.js
// Anonymous client-side progress tracking via localStorage.
// Schema is intentionally small and forward-compatible.

const STORAGE_KEY = 'glideup:progress:v1';

const empty = () => ({
  version: 1,
  createdAt: new Date().toISOString(),
  xp: 0,
  streak: { count: 0, lastDay: null },
  byQuestion: {},   // qid -> { attempts, firstTryCorrect, lastAt, correct }
  byDomain: {},     // "CSA::Platform Overview and Navigation" -> { answered, correct }
  achievements: {}, // achievementId -> unlockedAt ISO string
});

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function load() {
  if (!isBrowser()) return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return empty();
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

export function save(state) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / privacy mode — fail silently.
  }
}

export function reset() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Record a single answer.
 * @param {object} args
 * @param {string} args.questionId
 * @param {string} args.exam            e.g. "CSA"
 * @param {string} args.domain          e.g. "Platform Overview and Navigation"
 * @param {boolean} args.correct
 * @returns {object} updated state
 */
export function recordAnswer({ questionId, exam, domain, correct }) {
  const state = load();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // Per-question record
  const prev = state.byQuestion[questionId] || {
    attempts: 0,
    firstTryCorrect: null,
    lastAt: null,
    correct: false,
  };
  const firstAttempt = prev.attempts === 0;
  const next = {
    attempts: prev.attempts + 1,
    firstTryCorrect: firstAttempt ? correct : prev.firstTryCorrect,
    lastAt: now,
    correct: prev.correct || correct,
  };
  state.byQuestion[questionId] = next;

  // Per-domain rollup
  const key = `${exam}::${domain}`;
  const dom = state.byDomain[key] || { answered: 0, correct: 0 };
  if (firstAttempt) dom.answered += 1;
  if (correct && !prev.correct) dom.correct += 1;
  state.byDomain[key] = dom;

  // Streak
  if (state.streak.lastDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak.count = state.streak.lastDay === yesterday ? state.streak.count + 1 : 1;
    state.streak.lastDay = today;
    state.xp += 50;   // streak day bonus
  }

  // XP
  if (firstAttempt && correct)       state.xp += 25;
  else if (!firstAttempt && correct) state.xp += 10;
  else if (!correct)                  state.xp += 5;

  save(state);
  return state;
}

/**
 * Per-domain summary for UI rendering.
 * @param {string} exam   e.g. "CSA"
 * @param {string} domain
 * @param {number} totalInBank   total available questions in that domain
 */
export function domainSummary(exam, domain, totalInBank) {
  const state = load();
  const key = `${exam}::${domain}`;
  const dom = state.byDomain[key] || { answered: 0, correct: 0 };
  const accuracy = dom.answered > 0 ? Math.round((dom.correct / dom.answered) * 100) : 0;

  let tier = 'locked';
  if (dom.answered >= 10) tier = 'bronze';
  if (totalInBank > 0 && dom.answered >= totalInBank) {
    if (accuracy >= 90)      tier = 'gold';
    else if (accuracy >= 75) tier = 'silver';
  }
  if (tier === 'bronze' && accuracy < 65) tier = 'locked';

  return { answered: dom.answered, correct: dom.correct, accuracy, tier, total: totalInBank };
}

export function unlockAchievement(id) {
  const state = load();
  if (state.achievements[id]) return state;
  state.achievements[id] = new Date().toISOString();
  save(state);
  return state;
}
