// =========================================================================
// Central registry of every procedural ("Infinite Practice") generator.
// This is the single place that maps a real syllabus Topic.slug to the
// function that can conjure an unlimited stream of fresh, always-correct
// questions for it. Adding a new generator later is a one-line addition
// here — nothing else in the app needs to change.
// =========================================================================

import type { DifficultyLevel, Question } from "@/types";
import {
  generatePercentageQuestion,
  generateRatioProportionQuestion,
  generateAverageQuestion,
  generateProfitLossQuestion,
  generateSiCiQuestion,
  generateTimeWorkQuestion,
  generateNumberSystemQuestion,
  generateTsdQuestion,
} from "./quantGenerators";
import {
  generateSeriesQuestion,
  generateCodingDecodingQuestion,
  generateBloodRelationsQuestion,
  generateDirectionSenseQuestion,
} from "./reasoningGenerators";

export type Generator = (difficulty: DifficultyLevel) => Question;

/** topicSlug -> generator. Keys match Topic.slug in the syllabus data
 * exactly (see src/data/syllabus/*.ts), never a topicId, so this keeps
 * working even if id-building conventions ever change. */
export const GENERATORS: Record<string, Generator> = {
  percentage: generatePercentageQuestion,
  "ratio-and-proportion": generateRatioProportionQuestion,
  average: generateAverageQuestion,
  "profit-and-loss": generateProfitLossQuestion,
  "simple-compound-interest": generateSiCiQuestion,
  "time-and-work": generateTimeWorkQuestion,
  "number-system": generateNumberSystemQuestion,
  "time-speed-and-distance": generateTsdQuestion,
  "series-number-alphabet-mixed": generateSeriesQuestion,
  "coding-decoding": generateCodingDecodingQuestion,
  "blood-relations": generateBloodRelationsQuestion,
  "direction-sense": generateDirectionSenseQuestion,
};

export const GENERATOR_TOPIC_SLUGS = Object.keys(GENERATORS);

export function hasGenerator(topicSlug: string): boolean {
  return topicSlug in GENERATORS;
}

export function generateOne(topicSlug: string, difficulty: DifficultyLevel): Question | null {
  const gen = GENERATORS[topicSlug];
  return gen ? gen(difficulty) : null;
}

/** Generates `count` fresh questions for a topic, retrying on accidental
 * duplicate question text within the same batch (can happen by chance
 * with small parameter ranges at Easy difficulty) so a single practice
 * session never shows the same question twice. */
export function generateBatch(topicSlug: string, count: number, difficulty: DifficultyLevel): Question[] {
  const gen = GENERATORS[topicSlug];
  if (!gen) return [];
  const seenText = new Set<string>();
  const out: Question[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 20 + 50) {
    guard += 1;
    const q = gen(difficulty);
    if (seenText.has(q.question)) continue;
    seenText.add(q.question);
    out.push(q);
  }
  return out;
}

/** Mixed-difficulty batch — used when a session/mock wants variety rather
 * than a single fixed difficulty. Roughly 30% Easy / 45% Medium / 25% Hard
 * unless the caller asks for a different weighting. */
export function generateMixedBatch(
  topicSlug: string,
  count: number,
  weights: { easy: number; medium: number; hard: number } = { easy: 0.3, medium: 0.45, hard: 0.25 },
): Question[] {
  const gen = GENERATORS[topicSlug];
  if (!gen) return [];
  const seenText = new Set<string>();
  const out: Question[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 20 + 50) {
    guard += 1;
    const r = Math.random();
    const difficulty: DifficultyLevel = r < weights.easy ? "Easy" : r < weights.easy + weights.medium ? "Medium" : "Hard";
    const q = gen(difficulty);
    if (seenText.has(q.question)) continue;
    seenText.add(q.question);
    out.push(q);
  }
  return out;
}
