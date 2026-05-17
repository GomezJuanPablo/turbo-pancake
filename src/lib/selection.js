// GlideUp — selection.js
// Pick a next question from a bank, weighted by domain blueprint and
// user history (prefers unseen and previously-incorrect).

import { load } from './progress.js';

/**
 * Pick a question from a bank for a given exam.
 * @param {object[]} bank         All questions across the exam.
 * @param {object} blueprint      { domain: weight } map, weights sum to 100.
 * @param {string} exam           e.g. "CSA"
 * @returns {object|null}
 */
export function pickNext(bank, blueprint, exam) {
  if (!Array.isArray(bank) || bank.length === 0) return null;
  const state = load();

  // Score each question: lower score = higher priority.
  const seen = state.byQuestion || {};
  const scored = bank.map((q) => {
    const record = seen[q.id];
    let score = 0;
    if (!record) score = 0;                    // never seen — highest priority
    else if (!record.correct) score = 1;       // seen and wrong
    else score = 3 + (record.attempts || 1);   // seen and correct — deprioritize
    return { q, score };
  });

  // Bucket by score, then weighted-random by blueprint within the lowest bucket.
  scored.sort((a, b) => a.score - b.score);
  const lowest = scored[0].score;
  const pool = scored.filter((s) => s.score === lowest).map((s) => s.q);

  // Domain-weighted random
  const weights = blueprint || {};
  const totalWeight = pool.reduce((sum, q) => sum + (weights[q.domain] || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const q of pool) {
    roll -= (weights[q.domain] || 1);
    if (roll <= 0) return q;
  }
  return pool[pool.length - 1];
}

/**
 * Filter a bank to a specific domain.
 */
export function forDomain(bank, domain) {
  return bank.filter((q) => q.domain === domain);
}
