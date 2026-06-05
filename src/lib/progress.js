// GlideUp — progress.js

const STORAGE_KEY = 'glideup:progress:v1';

const empty = () => ({
  version: 1,
  createdAt: new Date().toISOString(),
  xp: 0,
  streak: { count: 0, lastDay: null },
  byQuestion: {},
  byDomain: {},
  achievements: {},
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
  } catch { return empty(); }
}

export function save(state) {
  if (!isBrowser()) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function reset() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function recordAnswer({ questionId, exam, domain, correct }) {
  const state = load();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const prev = state.byQuestion[questionId] || { attempts: 0, firstTryCorrect: null, lastAt: null, correct: false };
  const firstAttempt = prev.attempts === 0;
  state.byQuestion[questionId] = {
    attempts: prev.attempts + 1,
    firstTryCorrect: firstAttempt ? correct : prev.firstTryCorrect,
    lastAt: now,
    correct: prev.correct || correct,
  };

  const key = `${exam}::${domain}`;
  const dom = state.byDomain[key] || { answered: 0, correct: 0 };
  if (firstAttempt) dom.answered += 1;
  if (correct && !prev.correct) dom.correct += 1;
  state.byDomain[key] = dom;

  if (state.streak.lastDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak.count = state.streak.lastDay === yesterday ? state.streak.count + 1 : 1;
    state.streak.lastDay = today;
    state.xp += 50;
  }

  if (firstAttempt && correct)       state.xp += 25;
  else if (!firstAttempt && correct) state.xp += 10;
  else if (!correct)                  state.xp += 5;

  save(state);
  return state;
}

export function domainSummary(exam, domain, totalInBank) {
  const state = load();
  const key = `${exam}::${domain}`;
  const dom = state.byDomain[key] || { answered: 0, correct: 0 };
  const accuracy = dom.answered > 0 ? Math.round((dom.correct / dom.answered) * 100) : 0;

  // Domains are never locked — all accessible from question 1
  let tier = 'new';
  if (dom.answered > 0) tier = 'bronze';
  if (totalInBank > 0 && dom.answered >= totalInBank) {
    if (accuracy >= 90)      tier = 'gold';
    else if (accuracy >= 75) tier = 'silver';
  }

  return { answered: dom.answered, correct: dom.correct, accuracy, tier, total: totalInBank };
}

export function unlockAchievement(id) {
  const state = load();
  if (state.achievements[id]) return state;
  state.achievements[id] = new Date().toISOString();
  save(state);
  return state;
}
