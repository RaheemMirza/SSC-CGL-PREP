// =========================================================================
// Small, dependency-free randomness + numeric-MCQ helpers shared by every
// procedural question generator (src/lib/generators/*). Kept in one place
// so every generator builds options the same way — no per-topic drift in
// how distractors are produced.
// =========================================================================

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Random float in [min, max], rounded to `decimals` places. */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function round(v: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

export function shuffleArray<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let seq = 0;
/** Collision-proof id for a generated (non-authored) question. Distinct
 * prefix ("gen-") so nothing ever confuses a procedurally generated
 * question with a hand-authored one that happens to reuse an id shape. */
export function makeGeneratedId(topicSlug: string): string {
  seq += 1;
  return `gen-${topicSlug}-${Date.now().toString(36)}-${seq}-${Math.floor(Math.random() * 1e6)}`;
}

export interface NumericOptionsResult {
  options: string[];
  answerIndex: number;
}

/** Builds 4 distinct MCQ options around a correct numeric answer: the
 * correct value plus up to 3 distractors (optionally forcing specific
 * "common mistake" values to appear as distractors), formatted and
 * shuffled. Guarantees no duplicate option strings. */
export function makeNumericOptions(
  correct: number,
  opts: {
    decimals?: number;
    spreadPercent?: number; // how far distractors roam from the correct value
    minDelta?: number; // minimum absolute gap from the correct value
    forcedTraps?: number[]; // specific "common mistake" values to try to include
    suffix?: string; // e.g. "%", " km/h"
    prefix?: string; // e.g. "₹"
    allowNegative?: boolean;
    indianGrouping?: boolean; // use en-IN thousands grouping (₹ figures)
  } = {},
): NumericOptionsResult {
  const {
    decimals = 0,
    spreadPercent = 18,
    minDelta = decimals > 0 ? 0.5 : 1,
    forcedTraps = [],
    suffix = "",
    prefix = "",
    allowNegative = false,
    indianGrouping = false,
  } = opts;

  const correctR = round(correct, decimals);
  const values = new Set<number>([correctR]);
  const distractors: number[] = [];

  // Try forced "common mistake" traps first — these are pedagogically the
  // most valuable wrong options because they're the mistake a real
  // candidate is likely to make.
  for (const trap of forcedTraps) {
    const t = round(trap, decimals);
    if (distractors.length >= 3) break;
    if (values.has(t)) continue;
    if (!allowNegative && t < 0) continue;
    values.add(t);
    distractors.push(t);
  }

  let guard = 0;
  while (distractors.length < 3 && guard < 200) {
    guard += 1;
    const spread = Math.max(minDelta, Math.abs(correctR) * (spreadPercent / 100));
    const delta = round((Math.random() < 0.5 ? -1 : 1) * (minDelta + Math.random() * spread), decimals);
    const candidate = round(correctR + delta, decimals);
    if (!allowNegative && candidate < 0) continue;
    if (values.has(candidate)) continue;
    if (Math.abs(candidate - correctR) < minDelta) continue;
    values.add(candidate);
    distractors.push(candidate);
  }

  // Extremely defensive fallback in case the loop above ever can't find 3
  // distinct values (shouldn't happen in practice, but never emit <4 opts).
  let fallback = 1;
  while (distractors.length < 3) {
    const candidate = round(correctR + fallback * (minDelta + 1), decimals);
    if (!values.has(candidate) && (allowNegative || candidate >= 0)) {
      values.add(candidate);
      distractors.push(candidate);
    }
    fallback += 1;
  }

  const format = (v: number) => {
    const num = indianGrouping ? v.toLocaleString("en-IN", { maximumFractionDigits: decimals }) : decimals > 0 ? v.toFixed(decimals) : v.toString();
    return `${prefix}${num}${suffix}`;
  };

  const allValues = shuffleArray([correctR, ...distractors]);
  const options = allValues.map(format);
  const answerIndex = allValues.indexOf(correctR);
  return { options, answerIndex };
}

/** Builds MCQ options for a non-numeric correct answer (e.g. a word or a
 * short phrase) given a pool of plausible-but-wrong alternatives. */
export function makeChoiceOptions(correct: string, wrongPool: readonly string[]): NumericOptionsResult {
  const wrongUnique = shuffleArray(Array.from(new Set(wrongPool.filter((w) => w !== correct)))).slice(0, 3);
  const all = shuffleArray([correct, ...wrongUnique]);
  return { options: all, answerIndex: all.indexOf(correct) };
}
