// =========================================================================
// A study plan is a rolling calendar, not a single todo list. Every item
// has a real `date`. Ids are built deterministically from
// (date, action, subject, topic) rather than a random/time-based id, so
// regenerating the plan after you've done more practice can recognise
// "this is the same logical item as before" and keep it marked done
// instead of silently resetting your checkmarks (that merge happens in
// useDataStore.ts, right after calling generateStudyPlan).
// =========================================================================

import type { PlanItem, RevisionSchedule, StudyPlanInputs, SubjectId, TopicProgress } from "@/types";
import { getWeakTopics, getSlowTopics } from "./adaptiveEngine";
import { getNextStage } from "./revisionScheduler";
import { getTopicsBySubject } from "../data/syllabus";

const DAY_MS = 86_400_000;
const TIER1_SUBJECTS: SubjectId[] = ["quant", "reasoning", "english", "ga"];

const MINUTES_BY_ACTION: Record<PlanItem["action"], number> = {
  revise: 10,
  practice: 20,
  learn: 25,
  test: 60, // a full Tier 1 mock, not a quick quiz — see TIER1_CONFIG.totalDurationMinutes
  "mixed-quiz": 15,
  pyq: 20,
};

let counter = 0;
function nextSuffix(): string {
  counter += 1;
  return counter.toString(36);
}

function mkItem(
  date: string,
  subjectId: SubjectId,
  action: PlanItem["action"],
  description: string,
  topicId?: string,
  topicName?: string,
  minutesOverride?: number,
): PlanItem {
  return {
    id: `plan-${date}-${action}-${subjectId}-${topicId ?? "x"}-${nextSuffix()}`,
    date,
    subjectId,
    topicId,
    topicName,
    action,
    description,
    minutesAllocated: minutesOverride ?? MINUTES_BY_ACTION[action],
    done: false,
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysUntil(examDate: string | null): number | null {
  if (!examDate) return null;
  const ms = new Date(examDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / DAY_MS));
}

/** Regenerates the whole rolling plan. Deterministic given the same
 * inputs/progress/schedules (aside from the disambiguating suffix on each
 * id), so calling this again after logging more practice naturally
 * reprioritises — there's no separate "replan" button needed, just
 * "regenerate". */
export function generateStudyPlan(
  inputs: StudyPlanInputs,
  progressMap: Record<string, TopicProgress>,
  revisionSchedules: Record<string, RevisionSchedule>,
  topicNameLookup: (topicId: string) => string,
): PlanItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeftTotal = daysUntil(inputs.examDate);
  // A rolling 2-week window by default; if the exam is sooner than that,
  // the plan naturally shrinks to exactly however many days are left.
  const horizon = Math.max(1, Math.min(daysLeftTotal ?? 14, 14));
  const budget = Math.max(15, inputs.dailyMinutes);
  const hasAnyProgress = Object.keys(progressMap).length > 0;

  const weak = getWeakTopics(progressMap, 10);
  const slowRaw = getSlowTopics(progressMap, 10);
  const weakIds = weak.map((t) => t.topicId);
  const slow = slowRaw.filter((t) => !weakIds.includes(t.topicId));

  // Project each topic's *real* next revision-schedule date onto this
  // window, so "revise X" lands on the exact day your spaced-repetition
  // schedule says it's due — not a guess.
  const revisionsByDate = new Map<string, { topicId: string; subjectId: SubjectId }[]>();
  for (const schedule of Object.values(revisionSchedules)) {
    const next = getNextStage(schedule);
    if (!next) continue;
    const due = new Date(next.dueAt);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / DAY_MS);
    const clampedDay = Math.max(0, diffDays); // anything overdue lands on today
    if (clampedDay >= horizon) continue;
    const key = isoDate(new Date(today.getTime() + clampedDay * DAY_MS));
    const list = revisionsByDate.get(key) ?? [];
    list.push({ topicId: schedule.topicId, subjectId: schedule.subjectId });
    revisionsByDate.set(key, list);
  }

  // Not-yet-started topics in whichever subjects you flagged as weak —
  // rotated across the week rather than always the same 1-3 topics.
  const notStarted: { topicId: string; topicName: string; subjectId: SubjectId }[] = [];
  for (const subjectId of inputs.weakSubjects) {
    for (const topic of getTopicsBySubject(subjectId)) {
      const p = progressMap[topic.id];
      if (!p || p.attempted === 0) notStarted.push({ topicId: topic.id, topicName: topic.name, subjectId });
    }
  }
  const learnSlotsPerDay = inputs.level === "beginner" ? 2 : inputs.level === "intermediate" ? 1 : 0;

  const items: PlanItem[] = [];

  for (let dayIndex = 0; dayIndex < horizon; dayIndex++) {
    const date = isoDate(new Date(today.getTime() + dayIndex * DAY_MS));
    const daysLeftHere = daysLeftTotal !== null ? Math.max(0, daysLeftTotal - dayIndex) : null;
    const isFinalStretch = daysLeftHere !== null && daysLeftHere <= 3;
    const dayItems: PlanItem[] = [];
    const within = () => dayItems.reduce((s, i) => s + i.minutesAllocated, 0) < budget;
    const already = (topicId?: string) => !!topicId && dayItems.some((i) => i.topicId === topicId);

    // 1. Full mock cadence — every other day in the final stretch,
    // otherwise every 4th day once there's at least some practice history
    // to make a mock meaningful (never cold-open day one with a full exam).
    const mockDue = isFinalStretch ? dayIndex % 2 === 0 : hasAnyProgress && dayIndex % 4 === 0;
    if (mockDue && within()) {
      dayItems.push(
        mkItem(
          date,
          "quant",
          "test",
          isFinalStretch
            ? "Final stretch — a full timed mock matters more right now than drilling any one topic."
            : "Regular full-length practice under real sectional timing.",
        ),
      );
    }

    // 2. Revisions actually due today, from your real schedule.
    for (const r of revisionsByDate.get(date) ?? []) {
      if (!within() || already(r.topicId)) continue;
      dayItems.push(mkItem(date, r.subjectId, "revise", "Due for spaced revision.", r.topicId, topicNameLookup(r.topicId)));
    }

    // 3 & 4. Weak/slow topic practice, rotated day-by-day so every flagged
    // topic gets covered across the week instead of piling onto day one.
    if (!isFinalStretch) {
      if (weakIds.length > 0) {
        const topicId = weakIds[dayIndex % weakIds.length];
        if (within() && !already(topicId)) {
          const t = weak.find((w) => w.topicId === topicId)!;
          const acc = Math.round((t.correct / t.attempted) * 100);
          dayItems.push(mkItem(date, t.subjectId, "practice", `Weak spot — ${acc}% accuracy over your last ${t.attempted} questions.`, topicId, topicNameLookup(topicId)));
        }
      }
      if (slow.length > 0) {
        const topicId = slow[dayIndex % slow.length].topicId;
        if (within() && !already(topicId)) {
          const t = slow.find((s) => s.topicId === topicId)!;
          dayItems.push(mkItem(date, t.subjectId, "practice", "Speed drill — running slower than SSC pace here.", topicId, topicNameLookup(topicId)));
        }
      }
    }

    // 5. New ground in subjects you flagged as weak, rotated.
    if (!isFinalStretch && learnSlotsPerDay > 0 && notStarted.length > 0) {
      for (let i = 0; i < learnSlotsPerDay; i += 1) {
        if (!within()) break;
        const candidate = notStarted[(dayIndex * learnSlotsPerDay + i) % notStarted.length];
        if (already(candidate.topicId)) continue;
        dayItems.push(mkItem(date, candidate.subjectId, "learn", "New topic in a subject you flagged as weak.", candidate.topicId, candidate.topicName));
      }
    }

    // 6. Whatever's left of today's budget gets filled with rotating
    // subject practice, sized to close the remaining gap exactly across
    // up to 4 distinct subjects — this is what guarantees every single
    // day is genuinely full (even day one with zero history, or a taper
    // day with nothing else scheduled) without ever showing two
    // identical-looking "general practice" cards for the same subject.
    const usedSoFar = dayItems.reduce((s, i) => s + i.minutesAllocated, 0);
    const remaining = budget - usedSoFar;
    if (remaining > 0) {
      const perSubjectMinutes = Math.max(10, Math.round(remaining / TIER1_SUBJECTS.length));
      const numFillItems = Math.max(1, Math.min(TIER1_SUBJECTS.length, Math.ceil(remaining / perSubjectMinutes)));
      let minutesLeft = remaining;
      for (let i = 0; i < numFillItems; i += 1) {
        const subjectId = TIER1_SUBJECTS[(dayIndex + i) % TIER1_SUBJECTS.length];
        const isLast = i === numFillItems - 1;
        const minutes = isLast ? minutesLeft : Math.min(perSubjectMinutes, minutesLeft);
        minutesLeft -= minutes;
        dayItems.push(mkItem(date, subjectId, "mixed-quiz", "General practice to build volume and speed.", undefined, undefined, Math.max(10, minutes)));
      }
    }

    items.push(...dayItems);
  }

  return items;
}
