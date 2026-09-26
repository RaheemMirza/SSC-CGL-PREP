// =========================================================================
// Classic spaced-repetition staging (1 / 3 / 7 / 14 / 30 days) applied to
// SSC CGL topics rather than flashcards. "Learning" a topic (opening its
// lesson, or just practicing it enough) starts its schedule; each later
// stage becomes "due" on its own day and going through it again pushes
// the topic further into long-term memory.
// =========================================================================

import type { RevisionSchedule, RevisionStage, SubjectId } from "@/types";

export const REVISION_STAGE_ORDER: RevisionStage[] = ["learn", "quick-revision", "practice", "revision", "test", "final-revision"];

export const REVISION_STAGE_OFFSET_DAYS: Record<RevisionStage, number> = {
  learn: 0,
  "quick-revision": 1,
  practice: 3,
  revision: 7,
  test: 14,
  "final-revision": 30,
};

export const REVISION_STAGE_LABEL: Record<RevisionStage, string> = {
  learn: "First learn",
  "quick-revision": "Quick revision (next day)",
  practice: "Practice pass (day 3)",
  revision: "Full revision (day 7)",
  test: "Topic test (day 14)",
  "final-revision": "Final revision (day 30)",
};

const DAY_MS = 86_400_000;

export function createRevisionSchedule(topicId: string, subjectId: SubjectId, learnedAt: number = Date.now()): RevisionSchedule {
  return {
    topicId,
    subjectId,
    learnedAt,
    stages: REVISION_STAGE_ORDER.map((stage) => ({
      stage,
      dueAt: learnedAt + REVISION_STAGE_OFFSET_DAYS[stage] * DAY_MS,
      completedAt: stage === "learn" ? learnedAt : undefined,
    })),
  };
}

export function getNextStage(schedule: RevisionSchedule) {
  return schedule.stages.find((s) => !s.completedAt && !s.skipped) ?? null;
}

export function isStageDue(schedule: RevisionSchedule, now: number = Date.now()): boolean {
  const next = getNextStage(schedule);
  return !!next && now >= next.dueAt;
}

export function completeNextStage(schedule: RevisionSchedule, now: number = Date.now()): RevisionSchedule {
  const next = getNextStage(schedule);
  if (!next) return schedule;
  return { ...schedule, stages: schedule.stages.map((s) => (s.stage === next.stage ? { ...s, completedAt: now } : s)) };
}

export function skipNextStage(schedule: RevisionSchedule): RevisionSchedule {
  const next = getNextStage(schedule);
  if (!next) return schedule;
  return { ...schedule, stages: schedule.stages.map((s) => (s.stage === next.stage ? { ...s, skipped: true } : s)) };
}

export function isScheduleComplete(schedule: RevisionSchedule): boolean {
  return schedule.stages.every((s) => s.completedAt || s.skipped);
}

export interface DueRevisionEntry {
  topicId: string;
  subjectId: SubjectId;
  stage: RevisionStage;
  dueAt: number;
  daysOverdue: number;
}

/** Every topic whose next revision stage has come due, across the whole
 * schedule map — sorted most-overdue first. This is what feeds the
 * "Due today" revision list. */
export function getDueRevisions(schedules: Record<string, RevisionSchedule>, now: number = Date.now()): DueRevisionEntry[] {
  const out: DueRevisionEntry[] = [];
  for (const schedule of Object.values(schedules)) {
    const next = getNextStage(schedule);
    if (next && now >= next.dueAt) {
      out.push({
        topicId: schedule.topicId,
        subjectId: schedule.subjectId,
        stage: next.stage,
        dueAt: next.dueAt,
        daysOverdue: Math.floor((now - next.dueAt) / DAY_MS),
      });
    }
  }
  return out.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/** Topics that will come due within the next `withinDays` — for an
 * "upcoming" preview under the "due today" list. */
export function getUpcomingRevisions(schedules: Record<string, RevisionSchedule>, withinDays = 3, now: number = Date.now()): DueRevisionEntry[] {
  const horizon = now + withinDays * DAY_MS;
  const out: DueRevisionEntry[] = [];
  for (const schedule of Object.values(schedules)) {
    const next = getNextStage(schedule);
    if (next && next.dueAt > now && next.dueAt <= horizon) {
      out.push({ topicId: schedule.topicId, subjectId: schedule.subjectId, stage: next.stage, dueAt: next.dueAt, daysOverdue: 0 });
    }
  }
  return out.sort((a, b) => a.dueAt - b.dueAt);
}
