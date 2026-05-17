// GlideUp — scoring.js
// Pure functions for grading a response. No DOM, no storage.

/**
 * Compare a user's answer array against the correct array.
 * Order does not matter. Both must be arrays of option letters (e.g. ['A','C']).
 * @param {string[]} given
 * @param {string[]} correct
 * @returns {boolean}
 */
export function isCorrect(given, correct) {
  if (!Array.isArray(given) || !Array.isArray(correct)) return false;
  if (given.length !== correct.length) return false;
  const g = [...given].sort();
  const c = [...correct].sort();
  return g.every((v, i) => v === c[i]);
}

/**
 * XP awarded for an answer, per CLAUDE.md gamification spec.
 * @param {object} opts
 * @param {boolean} opts.correct
 * @param {boolean} opts.firstTry
 */
export function xpFor({ correct, firstTry }) {
  if (correct && firstTry)  return 25;
  if (correct && !firstTry) return 10;
  return 5; // wrong but at least read the rationale
}

/**
 * Tier for a domain given counts + accuracy.
 * Mirrors the spec in CLAUDE.md.
 */
export function tierFor({ answered, total, accuracy }) {
  if (answered < 10) return 'locked';
  if (total > 0 && answered >= total) {
    if (accuracy >= 90) return 'gold';
    if (accuracy >= 75) return 'silver';
  }
  if (accuracy >= 65) return 'bronze';
  return 'locked';
}
