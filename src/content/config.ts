// GlideUp — Astro content collection config + Zod schemas
// These schemas mirror the canonical shape in CLAUDE.md §"Question schema"
// and the validator in scripts/validate-questions.mjs. Keep all three in sync.

import { defineCollection, z } from 'astro:content';

/* ============================================================
   Question schema
   ============================================================ */

const ID_PATTERN = /^[a-z]+-[a-z0-9-]+-\d{3}$/;

// Accept either docs.servicenow.com (legacy) or www.servicenow.com/docs (current)
// or developer.servicenow.com.
const DOC_URL = z
  .string()
  .url()
  .refine(
    (u) =>
      /^https:\/\/docs\.servicenow\.com\//.test(u) ||
      /^https:\/\/www\.servicenow\.com\/docs\//.test(u) ||
      /^https:\/\/developer\.servicenow\.com\//.test(u),
    {
      message:
        'reference URL must be on docs.servicenow.com, www.servicenow.com/docs, or developer.servicenow.com',
    }
  );

export const optionSchema = z.object({
  id: z.string().regex(/^[A-F]$/, 'option id must be a single uppercase letter A-F'),
  text: z.string().min(1),
});

export const referenceSchema = z.object({
  title: z.string().min(1),
  url: DOC_URL,
});

export const questionSchema = z
  .object({
    id: z.string().regex(ID_PATTERN, 'id must match {exam}-{slug}-{NNN}'),
    exam: z.string().min(1),
    release: z.string().optional(),
    domain: z.string().min(1),
    subdomain: z.string().optional(),
    difficulty: z.enum(['recall', 'application', 'scenario']),
    type: z.enum(['single_select', 'multi_select', 'matching']),
    stem: z
      .string()
      .min(10)
      .refine((s) => s.trim().endsWith('?'), {
        message: 'stem should end with "?"',
      })
      .refine((s) => !/🧌|😀|😂|🔥|⚡/.test(s), {
        message: 'voice rule: zero emoji in stems',
      }),
    options: z.array(optionSchema).optional(),
    correct: z.array(z.string()).optional(),
    pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).optional(),
    rationale: z.string().min(20),
    distractor_notes: z.record(z.string(), z.string()).optional(),
    references: z.array(referenceSchema).min(1),
    tags: z.array(z.string()).optional(),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'matching') {
      const pairs = q.pairs || [];
      if (pairs.length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'matching needs at least 3 pairs', path: ['pairs'] });
      }
      const lefts = pairs.map((p) => p.left);
      const rights = pairs.map((p) => p.right);
      if (new Set(lefts).size !== lefts.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'matching left values must be unique', path: ['pairs'] });
      }
      if (new Set(rights).size !== rights.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'matching right values must be unique', path: ['pairs'] });
      }
      return;
    }
    if (!q.options || q.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'options must have at least 2 items', path: ['options'] });
      return;
    }
    if (!q.correct || q.correct.length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'correct must have at least one entry', path: ['correct'] });
      return;
    }
    const optionIds = new Set(q.options.map((o) => o.id));
    for (const c of q.correct) {
      if (!optionIds.has(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `correct answer "${c}" not found in options`,
          path: ['correct'],
        });
      }
    }
    if (q.type === 'single_select' && q.correct.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `single_select must have exactly one correct answer (has ${q.correct.length})`,
        path: ['correct'],
      });
    }
    const correctSet = new Set(q.correct);
    const dnotes = q.distractor_notes || {};
    for (const opt of q.options) {
      const hasNote = typeof dnotes[opt.id] === 'string' && dnotes[opt.id].trim().length > 0;
      if (!correctSet.has(opt.id) && !hasNote) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `missing distractor_notes for wrong option "${opt.id}"`,
          path: ['distractor_notes', opt.id],
        });
      }
    }
  });

export type Question = z.infer<typeof questionSchema>;

const questionsCollection = defineCollection({
  type: 'data',
  schema: z.array(questionSchema),
});

/* ============================================================
   Blueprint schema
   ============================================================ */

export const blueprintDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().nonnegative(),
  target: z.number().int().nonnegative(),
});

export const blueprintSchema = z.object({
  exam: z.string(),
  name: z.string(),
  release: z.string().optional(),
  kb: z.string().optional(),
  totalQuestions: z.number().int().nonnegative(),
  domains: z.array(blueprintDomainSchema),
});

export type Blueprint = z.infer<typeof blueprintSchema>;

const blueprintsCollection = defineCollection({
  type: 'data',
  schema: blueprintSchema,
});

/* ============================================================
   Achievement schema
   ============================================================ */

export const achievementSchema = z.object({
  id: z.string(),
  icon: z.string(),
  label: z.string(),
  description: z.string(),
});

export type Achievement = z.infer<typeof achievementSchema>;

const achievementsCollection = defineCollection({
  type: 'data',
  schema: z.array(achievementSchema),
});

export const collections = {
  questions: questionsCollection,
  blueprints: blueprintsCollection,
  achievements: achievementsCollection,
};
