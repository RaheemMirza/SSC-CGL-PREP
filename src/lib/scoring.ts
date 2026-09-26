// =========================================================================
// Pure functions only — no persistence, no randomness. Given a finished
// mock's attempts and the blueprint it was built from, work out exactly
// what the real exam's marking scheme would award, then break that down
// by topic so "which topics cost me marks" and "where was I too slow"
// have real, numeric answers instead of a gut feeling.
// =========================================================================

import type { AttemptRecord, MockTestBlueprint, MockTestResult, Question, SubjectId } from "@/types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Computes the official-style MockTestResult: correct/incorrect/
 * unattempted and marks scored per section, using that section's own
 * +marksCorrect/-marksWrong (so Tier 1's +2/-0.5 and Tier 2's +3/-1 both
 * score correctly from the same function), plus the overall accuracy,
 * attempt rate and average time per question. */
export function scoreMockTest(
  blueprint: MockTestBlueprint,
  attempts: Record<string, AttemptRecord>,
  startedAt: number,
  completedAt: number,
): MockTestResult {
  const sectionResults = blueprint.sections.map((section) => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let marksScored = 0;
    let timeSpentSeconds = 0;
    for (const qid of section.questionIds) {
      const a = attempts[qid];
      if (!a || a.selectedIndex === null || a.correct === null) {
        unattempted += 1;
        continue;
      }
      timeSpentSeconds += a.timeTakenSeconds;
      if (a.correct) {
        correct += 1;
        marksScored += section.marksCorrect;
      } else {
        incorrect += 1;
        marksScored -= section.marksWrong;
      }
    }
    return { sectionId: section.id, correct, incorrect, unattempted, marksScored: round2(marksScored), timeSpentSeconds };
  });

  const totalMarks = round2(sectionResults.reduce((s, r) => s + r.marksScored, 0));
  const maxMarks = blueprint.sections.reduce((s, sec) => s + sec.questionIds.length * sec.marksCorrect, 0);
  const totalQuestions = blueprint.sections.reduce((s, sec) => s + sec.questionIds.length, 0);
  const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0);
  const totalAttempted = sectionResults.reduce((s, r) => s + r.correct + r.incorrect, 0);
  const totalTimeSpent = sectionResults.reduce((s, r) => s + r.timeSpentSeconds, 0);

  return {
    id: `result-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    blueprintId: blueprint.id,
    startedAt,
    completedAt,
    sectionResults,
    totalMarks,
    maxMarks,
    accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
    attemptRate: totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0,
    averageTimePerQuestion: totalAttempted > 0 ? Math.round(totalTimeSpent / totalAttempted) : 0,
  };
}

// -------------------------------------------------------------------------
// Topic-level breakdown — scoped to just this one mock attempt, so it
// answers "in THIS attempt, what cost me marks" rather than your
// all-time running average (that's what the Dashboard/adaptiveEngine is
// for; this is the mock's own results page).
// -------------------------------------------------------------------------

export type SpeedFlag = "fast" | "on-pace" | "slow";

export interface MockTopicStat {
  topicId: string;
  subjectId: SubjectId;
  topicName: string;
  attempted: number;
  correct: number;
  accuracy: number; // 0-100, over attempted (not total)
  avgTimeSeconds: number;
  expectedTimeSeconds: number;
  speedRatio: number;
  speedFlag: SpeedFlag;
}

/** Groups this mock's attempts by topic, comparing your actual average
 * time against each question's own expectedTimeSeconds (authored per
 * question, reflecting realistic SSC pace for that difficulty) so speed
 * feedback isn't one blanket benchmark for the whole exam. */
export function computeMockTopicBreakdown(
  attempts: AttemptRecord[],
  questions: Record<string, Question>,
  topicNameLookup: (topicId: string) => string,
): MockTopicStat[] {
  const byTopic = new Map<string, AttemptRecord[]>();
  for (const a of attempts) {
    if (a.correct === null) continue; // unattempted
    const list = byTopic.get(a.topicId) ?? [];
    list.push(a);
    byTopic.set(a.topicId, list);
  }

  const out: MockTopicStat[] = [];
  for (const [topicId, list] of byTopic.entries()) {
    const attempted = list.length;
    const correct = list.filter((a) => a.correct).length;
    const avgTimeSeconds = Math.round(list.reduce((s, a) => s + a.timeTakenSeconds, 0) / attempted);
    const expected = list.reduce((s, a) => s + (questions[a.questionId]?.expectedTimeSeconds ?? 45), 0) / attempted;
    const expectedTimeSeconds = Math.round(expected);
    const speedRatio = expectedTimeSeconds > 0 ? avgTimeSeconds / expectedTimeSeconds : 1;
    const speedFlag: SpeedFlag = speedRatio <= 0.85 ? "fast" : speedRatio <= 1.2 ? "on-pace" : "slow";
    out.push({
      topicId,
      subjectId: list[0].subjectId,
      topicName: topicNameLookup(topicId),
      attempted,
      correct,
      accuracy: Math.round((correct / attempted) * 100),
      avgTimeSeconds,
      expectedTimeSeconds,
      speedRatio: Math.round(speedRatio * 100) / 100,
      speedFlag,
    });
  }
  return out.sort((a, b) => a.accuracy - b.accuracy);
}

export interface MockFocusArea {
  kind: "accuracy" | "speed";
  topicId: string;
  topicName: string;
  reason: string;
}

/** The "focus on this next" list shown right on the mock's results page —
 * every line traces back to a number from computeMockTopicBreakdown, and
 * only topics with at least 2 attempts in this mock are named (so one
 * unlucky guess doesn't get singled out as a "weak topic"). */
export function getMockFocusAreas(breakdown: MockTopicStat[], limit = 6): MockFocusArea[] {
  const eligible = breakdown.filter((t) => t.attempted >= 2);
  const focus: MockFocusArea[] = [];

  const byAccuracy = [...eligible].filter((t) => t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  for (const t of byAccuracy.slice(0, Math.ceil(limit / 2))) {
    focus.push({
      kind: "accuracy",
      topicId: t.topicId,
      topicName: t.topicName,
      reason: `${t.correct}/${t.attempted} correct (${t.accuracy}%) in this attempt.`,
    });
  }

  const bySpeed = [...eligible]
    .filter((t) => t.speedFlag === "slow" && !focus.some((f) => f.topicId === t.topicId))
    .sort((a, b) => b.speedRatio - a.speedRatio);
  for (const t of bySpeed.slice(0, limit - focus.length)) {
    focus.push({
      kind: "speed",
      topicId: t.topicId,
      topicName: t.topicName,
      reason: `Averaging ${t.avgTimeSeconds}s vs an expected ~${t.expectedTimeSeconds}s per question (${t.speedRatio}x).`,
    });
  }

  return focus.slice(0, limit);
}

/** Section-level time usage — "you used 12:40 of your 15:00 in GA" — for
 * the results page's per-section timing summary. */
export function computeSectionTimeUsage(blueprint: MockTestBlueprint, result: MockTestResult) {
  return blueprint.sections.map((section) => {
    const r = result.sectionResults.find((sr) => sr.sectionId === section.id);
    return {
      sectionId: section.id,
      name: section.name,
      timeLimitSeconds: section.timeLimitSeconds,
      timeUsedSeconds: r?.timeSpentSeconds ?? 0,
      utilisation: section.timeLimitSeconds > 0 ? Math.round(((r?.timeSpentSeconds ?? 0) / section.timeLimitSeconds) * 100) : 0,
    };
  });
}
