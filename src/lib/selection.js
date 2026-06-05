// GlideUp — selection.js

import { load } from './progress.js';

export function pickNext(bank, blueprint, exam) {
  if (!Array.isArray(bank) || bank.length === 0) return null;
  const state = load();
  const seen = state.byQuestion || {};
  const scored = bank.map((q) => {
    const record = seen[q.id];
    let score = 0;
    if (!record)             score = 0;
    else if (!record.correct) score = 1;
    else score = 3 + (record.attempts || 1);
    return { q, score };
  });

  scored.sort((a, b) => a.score - b.score);
  const lowest = scored[0].score;
  const pool = scored.filter((s) => s.score === lowest).map((s) => s.q);

  const weights = blueprint || {};
  const totalWeight = pool.reduce((sum, q) => sum + (weights[q.domain] || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const q of pool) {
    roll -= (weights[q.domain] || 1);
    if (roll <= 0) return q;
  }
  return pool[pool.length - 1];
}

export function forDomain(bank, domain) {
  return bank.filter((q) => q.domain === domain);
}

/**
 * Build one of 4 non-overlapping 60-question exam simulation sets.
 * Each domain contributes questions proportional to its blueprint weight.
 * Sets 1-4 pick different slices so together they cover all 240 questions.
 * @param {object[]} bank       Full question bank for the exam
 * @param {object}   weights    { domainName: weight }
 * @param {number}   setNum     1 | 2 | 3 | 4
 */
export function buildExamSet(bank, weights, setNum) {
  const TARGET = 60;
  const domains = [...new Set(bank.map(q => q.domain))];
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;

  const result = [];
  for (const domain of domains) {
    const domainQs = bank.filter(q => q.domain === domain);
    const w = weights[domain] || 1;
    // How many from this domain in a 60Q set
    const count = Math.max(1, Math.round((w / totalWeight) * TARGET));
    // Offset by setNum so each set gets a different slice
    const offset = ((setNum - 1) * count) % domainQs.length;
    for (let i = 0; i < count; i++) {
      result.push(domainQs[(offset + i) % domainQs.length]);
    }
  }

  // Random shuffle every session — prevents question order memorization
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, TARGET);
}
