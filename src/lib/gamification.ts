// =========================================================================
// Every XP point and badge here traces back to something you actually
// did (an attempt, a completed session, a streak day) — never a
// vanity counter that increments on its own.
// =========================================================================

import type { AttemptRecord, GamificationState, SessionType, TopicProgress } from "@/types";

export const XP_RULES = {
  correctAnswer: 5,
  wrongAttempt: 1, // small credit just for attempting rather than skipping
  mockCompleted: 60,
  topicMastered: 100,
};

function todayIso(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function isoDaysAgo(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return todayIso(d);
}

export function xpForAttempts(attempts: AttemptRecord[]): number {
  return attempts.reduce((sum, a) => {
    if (a.correct === true) return sum + XP_RULES.correctAnswer;
    if (a.correct === false) return sum + XP_RULES.wrongAttempt;
    return sum;
  }, 0);
}

/** Advances streakDays/lastActiveDate for "today". Call this once per
 * completed session/attempt-batch, not per question — multiple sessions
 * in the same day shouldn't multiply the streak. */
export function bumpStreak(g: GamificationState, now: Date = new Date()): GamificationState {
  const today = todayIso(now);
  if (g.lastActiveDate === today) return g;
  const yesterday = isoDaysAgo(1, now);
  const streakDays = g.lastActiveDate === yesterday ? g.streakDays + 1 : 1;
  return { ...g, streakDays, lastActiveDate: today };
}

export interface SessionOutcome {
  attempts: AttemptRecord[];
  sessionType: SessionType;
  newlyMasteredTopicCount?: number;
}

/** Applies one completed session's worth of XP/streak/counters to the
 * gamification state. Badge-checking is separate (checkNewBadges) since
 * it also needs the topic progress map. */
export function applySessionOutcome(g: GamificationState, outcome: SessionOutcome, now: Date = new Date()): GamificationState {
  const attempted = outcome.attempts.filter((a) => a.correct !== null);
  let xp = g.xp + xpForAttempts(attempted);
  if (outcome.sessionType.startsWith("mock-")) xp += XP_RULES.mockCompleted;
  if (outcome.newlyMasteredTopicCount) xp += outcome.newlyMasteredTopicCount * XP_RULES.topicMastered;

  const bumped = bumpStreak(g, now);
  return {
    ...bumped,
    xp,
    questionsSolved: g.questionsSolved + attempted.length,
    topicsMastered: g.topicsMastered + (outcome.newlyMasteredTopicCount ?? 0),
  };
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  check: (g: GamificationState, progressMap: Record<string, TopicProgress>) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: "first-steps", name: "First Steps", description: "Solved your first question.", check: (g) => g.questionsSolved >= 1 },
  { id: "century", name: "Century", description: "Solved 100 questions.", check: (g) => g.questionsSolved >= 100 },
  { id: "half-thousand", name: "500 Club", description: "Solved 500 questions.", check: (g) => g.questionsSolved >= 500 },
  { id: "thousand", name: "Grinder", description: "Solved 1,000 questions.", check: (g) => g.questionsSolved >= 1000 },
  { id: "streak-3", name: "On a Roll", description: "3-day practice streak.", check: (g) => g.streakDays >= 3 },
  { id: "streak-7", name: "Week Strong", description: "7-day practice streak.", check: (g) => g.streakDays >= 7 },
  { id: "streak-30", name: "Unstoppable", description: "30-day practice streak.", check: (g) => g.streakDays >= 30 },
  { id: "first-topic-mastered", name: "Topic Mastered", description: "Fully mastered your first topic.", check: (g) => g.topicsMastered >= 1 },
  { id: "five-topics-mastered", name: "Building Momentum", description: "Mastered 5 topics.", check: (g) => g.topicsMastered >= 5 },
  {
    id: "no-weak-topics",
    name: "Clean Sheet",
    description: "No topic currently flagged weak or needing revision.",
    check: (_g, progressMap) => {
      const values = Object.values(progressMap);
      return values.length >= 5 && values.every((p) => p.status !== "weak" && p.status !== "needs-revision");
    },
  },
];

/** Returns badge ids newly earned this update (present now, absent from
 * `previouslyEarned`) — the caller decides how to surface them (toast,
 * banner) and appends them to gamification.badgesEarned. */
export function checkNewBadges(g: GamificationState, progressMap: Record<string, TopicProgress>, previouslyEarned: string[]): string[] {
  const earnedSet = new Set(previouslyEarned);
  return BADGES.filter((b) => !earnedSet.has(b.id) && b.check(g, progressMap)).map((b) => b.id);
}
