// =========================================================================
// Turns "give me N good questions for this topic/subject" into an actual
// list, by blending three sources in priority order:
//   1. Static bank questions you haven't seen recently (freshest first)
//   2. Procedurally-generated questions, for topics that have a generator
//      — these are literally infinite, so they're what keeps a subject
//      from ever feeling like "the same 40 questions on repeat"
//   3. Static bank questions you HAVE seen before, least-recent first
//      — the fallback for topics with no generator and a small bank
//      (GA, vocabulary, classification-style content), so a request for
//      N questions is always satisfiable, forever, just with graceful
//      degradation instead of a hard failure.
// =========================================================================

import type { DifficultyLevel, Question, SubjectId, Topic } from "@/types";
import { filterQuestions } from "../data/questions";
import { generateOne, hasGenerator } from "./generators";
import { getTopicsBySubject } from "../data/syllabus";

const DIFFICULTY_WEIGHTS: Record<DifficultyLevel, number> = { Easy: 0.3, Medium: 0.45, Hard: 0.25 };

function weightedDifficulty(): DifficultyLevel {
  const r = Math.random();
  if (r < DIFFICULTY_WEIGHTS.Easy) return "Easy";
  if (r < DIFFICULTY_WEIGHTS.Easy + DIFFICULTY_WEIGHTS.Medium) return "Medium";
  return "Hard";
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Sorts a static pool "freshest first": never-seen questions (shuffled
 * among themselves, so it's not always the same authoring-order subset),
 * then seen-before questions oldest-seen first. */
export function rankByFreshness(pool: Question[], recentlySeen: Record<string, number>): Question[] {
  const unseen = shuffle(pool.filter((q) => !recentlySeen[q.id]));
  const seen = pool
    .filter((q) => recentlySeen[q.id])
    .sort((a, b) => (recentlySeen[a.id] ?? 0) - (recentlySeen[b.id] ?? 0));
  return [...unseen, ...seen];
}

/** Generates up to `count` fresh procedural questions for one topic slug,
 * with weighted-random difficulty and de-duplication by question text
 * within this call (guards against the rare small-parameter-space repeat
 * at Easy difficulty). Returns fewer than `count` only if the generator
 * itself is missing (it never is, once hasGenerator(slug) is checked). */
export function generateForTopic(topicSlug: string, count: number): Question[] {
  if (count <= 0 || !hasGenerator(topicSlug)) return [];
  const seenText = new Set<string>();
  const out: Question[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 25 + 50) {
    guard += 1;
    const q = generateOne(topicSlug, weightedDifficulty());
    if (!q || seenText.has(q.question)) continue;
    seenText.add(q.question);
    out.push(q);
  }
  return out;
}

export interface TopicSlotPlan {
  topic: Topic;
  slots: number;
}

/** Splits `total` question slots across an arbitrary list of topics
 * (possibly spanning several subjects — e.g. a weak-area drill). Topics
 * with a full authored lesson (hero topics) get 1.6x the weight of
 * breadth topics, on the reasoning that they're the syllabus's
 * higher-weightage chapters — but every topic gets at least some
 * representation, and the largest-remainder method guarantees the slots
 * sum to exactly `total`. */
export function allocateSlotsAcrossTopics(topics: Topic[], total: number): TopicSlotPlan[] {
  if (topics.length === 0 || total <= 0) return [];
  const weight = (t: Topic) => (t.hasFullContent ? 1.6 : 1);
  const totalWeight = topics.reduce((s, t) => s + weight(t), 0);
  const raw = topics.map((t) => ({ topic: t, exact: (weight(t) / totalWeight) * total }));
  const base = raw.map((r) => ({ topic: r.topic, slots: Math.floor(r.exact), remainder: r.exact - Math.floor(r.exact) }));
  let assigned = base.reduce((s, b) => s + b.slots, 0);
  const byRemainder = [...base].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (assigned < total && byRemainder.length > 0) {
    byRemainder[i % byRemainder.length].slots += 1;
    assigned += 1;
    i += 1;
  }
  return base.map((b) => ({ topic: b.topic, slots: b.slots })).filter((b) => b.slots > 0);
}

/** Splits `total` question slots across a single subject's topics — the
 * common case (a mock section, a subject-wise drill). */
export function allocateTopicSlots(subjectId: SubjectId, total: number): TopicSlotPlan[] {
  return allocateSlotsAcrossTopics(getTopicsBySubject(subjectId), total);
}

export interface TopicSelectionOptions {
  generatorBias?: number;
  recentlySeen: Record<string, number>;
  excludeIds?: Set<string>;
  excludeText?: Set<string>;
}

/** Selects up to `count` questions for a single topic, blending static +
 * generated the same way the subject-level allocator does. Used directly
 * by the Practice Engine (topic practice) and internally by
 * selectQuestionsForSubject for each topic's slice of a mock section. May
 * return fewer than `count` if this exact topic's static bank runs out
 * and it has no generator — the caller decides how to backfill (the
 * subject allocator backfills from generators/other topics; a solo topic
 * practice session should just tell the person "that's everything we have
 * on this topic right now" rather than silently substituting a different
 * topic's questions). */
export function selectQuestionsForTopic(topic: Topic, count: number, opts: TopicSelectionOptions): Question[] {
  const generatorBias = opts.generatorBias ?? 0.55;
  const excludeIds = opts.excludeIds ?? new Set<string>();
  const excludeText = opts.excludeText ?? new Set<string>();

  const staticPool = filterQuestions({ subjectId: topic.subjectId, topicId: topic.id }).filter(
    (q) => !excludeIds.has(q.id) && !excludeText.has(q.question),
  );
  const rankedStatic = rankByFreshness(staticPool, opts.recentlySeen);

  if (!hasGenerator(topic.slug)) {
    return rankedStatic.slice(0, count);
  }

  const genCount = Math.round(count * generatorBias);
  const staticCount = count - genCount;
  const staticPicked = rankedStatic.slice(0, staticCount);
  const stillNeeded = count - staticPicked.length;
  const localExcludeText = new Set([...excludeText, ...staticPicked.map((q) => q.question)]);
  const generated = generateForTopic(topic.slug, stillNeeded * 2).filter((q) => !localExcludeText.has(q.question));
  return [...staticPicked, ...generated.slice(0, stillNeeded)];
}

export interface SubjectSelectionOptions {
  /** Fraction of a generator-covered topic's slots that should come from
   * the generator rather than the static bank, 0-1. Higher = more variety
   * per attempt, lower = more authentic PYQ-style flavour. Default 0.55. */
  generatorBias?: number;
  recentlySeen: Record<string, number>;
  /** ids that must not appear in the result even if otherwise eligible —
   * used to guarantee no question repeats twice within the same test. */
  excludeIds?: Set<string>;
}

/** Shared engine behind selectQuestionsForSubject and
 * selectQuestionsForTopics: walk a topic-slot plan, blend static+
 * generated per topic, then backfill any shortfall first from any
 * generator-covered topic in the plan, then from `fallbackPool` (already
 * seen questions, oldest-first) so the exact count is always hit. */
function selectFromPlan(plan: TopicSlotPlan[], count: number, opts: SubjectSelectionOptions, fallbackPool: Question[]): Question[] {
  const generatorBias = opts.generatorBias ?? 0.55;
  const exclude = opts.excludeIds ?? new Set<string>();
  const result: Question[] = [];
  const usedIds = new Set<string>(exclude);
  const usedText = new Set<string>();

  let shortfall = 0;
  for (const { topic, slots } of plan) {
    const picked = selectQuestionsForTopic(topic, slots, { generatorBias, recentlySeen: opts.recentlySeen, excludeIds: usedIds, excludeText: usedText });
    picked.forEach((q) => {
      usedIds.add(q.id);
      usedText.add(q.question);
    });
    result.push(...picked);
    shortfall += slots - picked.length;
  }

  // Backfill pass 1: any topic in the plan with a generator can absorb
  // the shortfall — this is what makes a section/drill always exactly
  // full even if one topic's static pool ran dry.
  if (shortfall > 0) {
    const generatorTopics = plan.map((p) => p.topic).filter((t) => hasGenerator(t.slug));
    let i = 0;
    let guard = 0;
    while (shortfall > 0 && generatorTopics.length > 0 && guard < shortfall * 10 + 50) {
      guard += 1;
      const topic = generatorTopics[i % generatorTopics.length];
      const extra = generateForTopic(topic.slug, 2).filter((q) => !usedText.has(q.question)).slice(0, 1);
      if (extra.length > 0) {
        usedText.add(extra[0].question);
        result.push(...extra);
        shortfall -= 1;
      }
      i += 1;
    }
  }

  // Backfill pass 2: no generator coverage anywhere in the plan (English,
  // GA, or a weak-area drill that happens to be all non-generator topics)
  // falls back to reusing already-seen questions from the same pool,
  // oldest-seen first — never a literal duplicate within this result,
  // just not guaranteed "never seen before" once the bank is exhausted.
  if (shortfall > 0) {
    const remaining = fallbackPool.filter((q) => !usedIds.has(q.id) && !usedText.has(q.question));
    const ranked = rankByFreshness(remaining, opts.recentlySeen);
    const extra = ranked.slice(0, shortfall);
    extra.forEach((q) => {
      usedIds.add(q.id);
      usedText.add(q.question);
    });
    result.push(...extra);
    shortfall -= extra.length;
  }

  return shuffle(result).slice(0, count);
}

/** The core subject-level allocator: given a subject and how many
 * questions it needs, returns exactly that many Questions (barring a
 * subject with literally zero content anywhere, which never happens for
 * the four Tier 1 subjects). */
export function selectQuestionsForSubject(subjectId: SubjectId, count: number, opts: SubjectSelectionOptions): Question[] {
  const plan = allocateTopicSlots(subjectId, count);
  return selectFromPlan(plan, count, opts, filterQuestions({ subjectId }));
}

/** Same idea, but for an explicit, possibly cross-subject topic list —
 * used for weak-area drills and custom multi-topic practice, where the
 * topics come from your own progress data rather than "everything in
 * one subject". */
export function selectQuestionsForTopics(topics: Topic[], count: number, opts: SubjectSelectionOptions): Question[] {
  const plan = allocateSlotsAcrossTopics(topics, count);
  const fallbackPool = topics.flatMap((t) => filterQuestions({ subjectId: t.subjectId, topicId: t.id }));
  return selectFromPlan(plan, count, opts, fallbackPool);
}
