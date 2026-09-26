// =========================================================================
// Turns the raw attempt log into the things a real aspirant actually
// wants to know: "which topics am I weak in", "where am I too slow",
// "has my speed actually improved this week". Every number here is
// derived only from the person's own stored attempts — nothing is
// simulated or pre-filled.
// =========================================================================

import type { AttemptRecord, Question, SpeedRating, SubjectId, TopicProgress, TopicStatus } from "@/types";

/** Derives a benchmarkSecondsByTopic map from a question pool's own
 * authored expectedTimeSeconds (set per question, scaled to difficulty).
 * Passed straight into recomputeAllProgress so "fast/slow" is judged
 * against realistic per-topic pace rather than one flat number for the
 * whole syllabus. Topics with zero entries in `questions` simply aren't
 * in the returned map — recomputeAllProgress's own defaultBenchmark
 * parameter covers those. */
export function computeTopicBenchmarks(questions: Question[]): Record<string, number> {
  const byTopic = new Map<string, number[]>();
  for (const q of questions) {
    const list = byTopic.get(q.topicId) ?? [];
    list.push(q.expectedTimeSeconds);
    byTopic.set(q.topicId, list);
  }
  const out: Record<string, number> = {};
  for (const [topicId, list] of byTopic.entries()) {
    out[topicId] = Math.round(list.reduce((s, n) => s + n, 0) / list.length);
  }
  return out;
}

export interface MasteryInput {
  attempted: number;
  correct: number;
  totalTimeSeconds: number;
  lastPracticedAt?: number;
}

export interface MasteryResult {
  masteryScore: number; // 0-100
  status: TopicStatus;
  speed: SpeedRating;
}

/** Converts raw attempt counts for one topic into a 0-100 mastery score
 * plus a status/speed label. Blends accuracy (70%) and speed relative to
 * the SSC-pace benchmark for that topic (30%), then applies a small decay
 * for topics that haven't been touched in a while — mastery you haven't
 * exercised recently is treated as less reliable, same as real recall. */
export function computeMastery(input: MasteryInput, benchmarkSeconds: number): MasteryResult {
  if (input.attempted === 0) {
    return { masteryScore: 0, status: "not-started", speed: "unknown" };
  }
  const accuracy = (input.correct / input.attempted) * 100;
  const avgTime = input.totalTimeSeconds / Math.max(1, input.attempted);
  const speedRatio = benchmarkSeconds > 0 ? avgTime / benchmarkSeconds : 1;

  let speed: SpeedRating;
  let speedScore: number;
  if (speedRatio <= 0.75) {
    speed = "fast";
    speedScore = 100;
  } else if (speedRatio <= 1.05) {
    speed = "good";
    speedScore = 85;
  } else if (speedRatio <= 1.4) {
    speed = "average";
    speedScore = 60;
  } else {
    speed = "slow";
    speedScore = 35;
  }

  const daysSincePractice = input.lastPracticedAt ? (Date.now() - input.lastPracticedAt) / 86_400_000 : 999;
  const recencyPenalty = Math.min(20, daysSincePractice / 3);
  const raw = Math.max(0, accuracy * 0.7 + speedScore * 0.3 - recencyPenalty);
  const masteryScore = Math.round(Math.min(100, raw));

  let status: TopicStatus;
  if (input.attempted < 4) {
    status = "in-progress";
  } else if (masteryScore >= 80 && accuracy >= 80) {
    status = "mastered";
  } else if (masteryScore >= 65) {
    status = "strong";
  } else if (accuracy < 50 || speed === "slow") {
    status = daysSincePractice > 21 ? "needs-revision" : "weak";
  } else {
    status = "in-progress";
  }

  return { masteryScore, status, speed };
}

/** Rebuilds the entire TopicProgress map from scratch from the attempt
 * log. Called after every attempt (cheap — attempts per topic stay small
 * enough that a full recompute is simpler and less bug-prone than trying
 * to incrementally patch a running aggregate). */
export function recomputeAllProgress(
  attempts: AttemptRecord[],
  benchmarkSecondsByTopic: Record<string, number>,
  defaultBenchmark = 60,
): Record<string, TopicProgress> {
  const byTopic = new Map<string, AttemptRecord[]>();
  for (const a of attempts) {
    if (a.correct === null) continue; // unattempted question, doesn't count toward progress
    const list = byTopic.get(a.topicId) ?? [];
    list.push(a);
    byTopic.set(a.topicId, list);
  }

  const out: Record<string, TopicProgress> = {};
  for (const [topicId, list] of byTopic.entries()) {
    const attempted = list.length;
    const correct = list.filter((a) => a.correct).length;
    const totalTimeSeconds = list.reduce((sum, a) => sum + a.timeTakenSeconds, 0);
    const lastPracticedAt = Math.max(...list.map((a) => a.timestamp));
    const benchmark = benchmarkSecondsByTopic[topicId] ?? defaultBenchmark;
    const { masteryScore, status, speed } = computeMastery({ attempted, correct, totalTimeSeconds, lastPracticedAt }, benchmark);
    out[topicId] = {
      topicId,
      subjectId: list[0].subjectId,
      attempted,
      correct,
      totalTimeSeconds,
      lastPracticedAt,
      status,
      speed,
      learned: attempted > 0,
      masteryScore,
    };
  }
  return out;
}

export function getWeakTopics(progressMap: Record<string, TopicProgress>, limit = 6): TopicProgress[] {
  return Object.values(progressMap)
    .filter((p) => p.attempted >= 3 && (p.status === "weak" || p.status === "needs-revision"))
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, limit);
}

export function getSlowTopics(progressMap: Record<string, TopicProgress>, limit = 6): TopicProgress[] {
  return Object.values(progressMap)
    .filter((p) => p.attempted >= 3 && (p.speed === "slow" || p.speed === "average"))
    .sort((a, b) => {
      const rank = (s: SpeedRating) => (s === "slow" ? 0 : 1);
      return rank(a.speed) - rank(b.speed) || a.masteryScore - b.masteryScore;
    })
    .slice(0, limit);
}

export function getStrongTopics(progressMap: Record<string, TopicProgress>, limit = 6): TopicProgress[] {
  return Object.values(progressMap)
    .filter((p) => p.status === "mastered" || p.status === "strong")
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .slice(0, limit);
}

export function getDueForRevision(progressMap: Record<string, TopicProgress>, minDaysStale = 10): TopicProgress[] {
  const now = Date.now();
  return Object.values(progressMap)
    .filter((p) => p.learned && p.lastPracticedAt && (now - p.lastPracticedAt) / 86_400_000 >= minDaysStale)
    .sort((a, b) => (a.lastPracticedAt ?? 0) - (b.lastPracticedAt ?? 0));
}

// -------------------------------------------------------------------------
// Speed analytics
// -------------------------------------------------------------------------

export interface SpeedTrend {
  recentAvgSeconds: number;
  priorAvgSeconds: number;
  deltaSeconds: number; // negative = getting faster
  improving: boolean;
  sampleSize: number;
}

/** Compares your average time-per-question over your most recent attempts
 * against the batch before that, so "am I actually getting faster" has a
 * real, current-data-backed answer instead of a vibe. */
export function computeSpeedTrend(attempts: AttemptRecord[], subjectId?: SubjectId, windowSize = 25): SpeedTrend | null {
  const filtered = (subjectId ? attempts.filter((a) => a.subjectId === subjectId) : attempts)
    .filter((a) => a.correct !== null)
    .sort((a, b) => a.timestamp - b.timestamp);
  if (filtered.length < 10) return null;

  const recent = filtered.slice(-windowSize);
  const prior = filtered.slice(Math.max(0, filtered.length - windowSize * 2), filtered.length - windowSize);
  if (prior.length === 0) return null;

  const avg = (arr: AttemptRecord[]) => arr.reduce((s, a) => s + a.timeTakenSeconds, 0) / arr.length;
  const recentAvgSeconds = Math.round(avg(recent));
  const priorAvgSeconds = Math.round(avg(prior));
  const deltaSeconds = recentAvgSeconds - priorAvgSeconds;
  return { recentAvgSeconds, priorAvgSeconds, deltaSeconds, improving: deltaSeconds < 0, sampleSize: recent.length };
}

export interface SubjectAccuracy {
  subjectId: SubjectId;
  attempted: number;
  correct: number;
  accuracy: number;
  avgTimeSeconds: number;
}

export function computeSubjectBreakdown(attempts: AttemptRecord[]): SubjectAccuracy[] {
  const bySubject = new Map<SubjectId, AttemptRecord[]>();
  for (const a of attempts) {
    if (a.correct === null) continue;
    const list = bySubject.get(a.subjectId) ?? [];
    list.push(a);
    bySubject.set(a.subjectId, list);
  }
  return Array.from(bySubject.entries()).map(([subjectId, list]) => {
    const attempted = list.length;
    const correct = list.filter((a) => a.correct).length;
    const avgTimeSeconds = Math.round(list.reduce((s, a) => s + a.timeTakenSeconds, 0) / attempted);
    return { subjectId, attempted, correct, accuracy: Math.round((correct / attempted) * 100), avgTimeSeconds };
  });
}

// -------------------------------------------------------------------------
// Recommendations
// -------------------------------------------------------------------------

export type RecommendationKind = "weak-topic" | "slow-topic" | "revision-due" | "keep-momentum" | "get-started";

export interface Recommendation {
  kind: RecommendationKind;
  topicId?: string;
  title: string;
  reason: string;
}

/** The short "what should I do next" list shown on the Dashboard. Every
 * entry traces back to a real number above — there's no generic filler
 * ("practice more!") when there's no data to support it yet. */
export function generateRecommendations(progressMap: Record<string, TopicProgress>, topicNameLookup: (topicId: string) => string): Recommendation[] {
  const recs: Recommendation[] = [];
  const totalAttempted = Object.values(progressMap).reduce((s, p) => s + p.attempted, 0);

  if (totalAttempted === 0) {
    return [{ kind: "get-started", title: "Take a quick diagnostic", reason: "You haven't logged any practice yet — a short mixed quiz across all four subjects will give the dashboard something real to work with." }];
  }

  for (const t of getWeakTopics(progressMap, 3)) {
    recs.push({ kind: "weak-topic", topicId: t.topicId, title: `Revisit ${topicNameLookup(t.topicId)}`, reason: `Accuracy is running at ${Math.round((t.correct / t.attempted) * 100)}% over your last ${t.attempted} questions here — this is your lowest-scoring active topic.` });
  }
  for (const t of getSlowTopics(progressMap, 2)) {
    if (recs.some((r) => r.topicId === t.topicId)) continue;
    recs.push({ kind: "slow-topic", topicId: t.topicId, title: `Speed drill: ${topicNameLookup(t.topicId)}`, reason: `You're averaging noticeably longer than the SSC pace benchmark here — a short timed drill (not a new concept) is what will move this fastest.` });
  }
  const due = getDueForRevision(progressMap, 10).slice(0, 2);
  for (const t of due) {
    if (recs.some((r) => r.topicId === t.topicId)) continue;
    const days = t.lastPracticedAt ? Math.round((Date.now() - t.lastPracticedAt) / 86_400_000) : 0;
    recs.push({ kind: "revision-due", topicId: t.topicId, title: `Quick revision: ${topicNameLookup(t.topicId)}`, reason: `It's been ${days} days since you last practiced this — a 5-minute revision pass now is cheaper than relearning it later.` });
  }
  if (recs.length === 0) {
    recs.push({ kind: "keep-momentum", title: "Take a full-length mock", reason: "Your active topics are all in good shape right now — a full Tier 1 mock will tell you if that holds up under real exam timing." });
  }
  return recs.slice(0, 6);
}
