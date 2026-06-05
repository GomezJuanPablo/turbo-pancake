// GlideUp — scoring.js

export function isCorrect(given, correct) {
  if (!Array.isArray(given) || !Array.isArray(correct)) return false;
  if (given.length !== correct.length) return false;
  const g = [...given].sort();
  const c = [...correct].sort();
  return g.every((v, i) => v === c[i]);
}

export function xpFor({ correct, firstTry }) {
  if (correct && firstTry)  return 25;
  if (correct && !firstTry) return 10;
  return 5;
}

/** Tier is never "locked" — all domains are open from the start. */
export function tierFor({ answered, total, accuracy }) {
  if (answered === 0) return 'new';
  if (total > 0 && answered >= total) {
    if (accuracy >= 90) return 'gold';
    if (accuracy >= 75) return 'silver';
  }
  return 'bronze';
}
