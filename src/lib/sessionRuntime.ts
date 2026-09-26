// =========================================================================
// The state machine behind both a practice session and a full mock test.
// A mock is just a session with multiple sections, each carrying its own
// sectional timer that locks independently — exactly how Tier 1 behaves
// for real. A practice session is the same machine with one section and
// (usually) no lock. Kept as plain functions with no zustand/React import
// so the logic itself can be tested in isolation.
// =========================================================================

import type { ExamTier, Question, SessionType, SubjectId } from "@/types";

export interface RuntimeAnswer {
  selectedIndex: number | null;
  markedForReview: boolean;
  timeSpentSeconds: number;
  visited: boolean;
}

export interface RuntimeSectionInput {
  id: string;
  name: string;
  subjectId: SubjectId;
  questionIds: string[];
  timeLimitSeconds: number; // 0 = shared/untimed pool, no sectional lock
  marksCorrect: number;
  marksWrong: number;
  qualifyingOnly?: boolean;
}

export interface RuntimeSection extends RuntimeSectionInput {
  timeRemainingSeconds: number;
  locked: boolean;
}

export interface SessionRuntime {
  id: string;
  mode: "practice" | "mock";
  sessionType: SessionType;
  tier?: ExamTier;
  label: string;
  sections: RuntimeSection[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, RuntimeAnswer>;
  startedAt: number;
  submitted: boolean;
  /** For untimed/shared-pool practice (no sectional lock at all), null.
   * For a timed practice quiz with one shared clock, a countdown. */
  sharedTimeRemainingSeconds: number | null;
}

export type TickEvent =
  | { type: "section-locked"; sectionId: string }
  | { type: "advanced-section"; sectionIndex: number }
  | { type: "time-up" };

let idCounter = 0;
export function nextRuntimeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function createRuntime(
  sections: RuntimeSectionInput[],
  opts: { mode: "practice" | "mock"; sessionType: SessionType; tier?: ExamTier; label: string; sharedTimeLimitSeconds?: number | null },
): SessionRuntime {
  const answers: Record<string, RuntimeAnswer> = {};
  for (const s of sections) {
    for (const qid of s.questionIds) {
      answers[qid] = { selectedIndex: null, markedForReview: false, timeSpentSeconds: 0, visited: false };
    }
  }
  return {
    id: nextRuntimeId(opts.mode),
    mode: opts.mode,
    sessionType: opts.sessionType,
    tier: opts.tier,
    label: opts.label,
    sections: sections.map((s) => ({ ...s, timeRemainingSeconds: s.timeLimitSeconds, locked: false })),
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    answers,
    startedAt: Date.now(),
    submitted: false,
    sharedTimeRemainingSeconds: opts.sharedTimeLimitSeconds ?? null,
  };
}

export function currentSection(runtime: SessionRuntime): RuntimeSection | null {
  return runtime.sections[runtime.currentSectionIndex] ?? null;
}

export function currentQuestionId(runtime: SessionRuntime): string | null {
  const section = currentSection(runtime);
  if (!section) return null;
  return section.questionIds[runtime.currentQuestionIndex] ?? null;
}

function markVisited(runtime: SessionRuntime, questionId: string | null): SessionRuntime {
  if (!questionId) return runtime;
  const existing = runtime.answers[questionId];
  if (!existing || existing.visited) return runtime;
  return { ...runtime, answers: { ...runtime.answers, [questionId]: { ...existing, visited: true } } };
}

/** One second of wall-clock time passing. Adds a second to the currently
 * viewed question's time-on-screen, counts down the active section's
 * sectional lock (mock) or the shared clock (timed practice), and
 * auto-advances/locks/flags time-up as those timers expire. Returns the
 * next runtime plus whatever notable things happened this tick, so the
 * caller (the store) can react — e.g. play a sound on section-locked,
 * or trigger the real submit flow on time-up. */
export function tick(runtime: SessionRuntime): { runtime: SessionRuntime; events: TickEvent[] } {
  if (runtime.submitted) return { runtime, events: [] };
  const events: TickEvent[] = [];

  const qid = currentQuestionId(runtime);
  let next = runtime;
  if (qid) {
    const a = next.answers[qid];
    next = { ...next, answers: { ...next.answers, [qid]: { ...a, timeSpentSeconds: a.timeSpentSeconds + 1, visited: true } } };
  }

  const section = currentSection(next);
  if (section && section.timeLimitSeconds > 0 && !section.locked) {
    const remaining = section.timeRemainingSeconds - 1;
    if (remaining <= 0) {
      const lockedSections = next.sections.map((s, i) => (i === next.currentSectionIndex ? { ...s, timeRemainingSeconds: 0, locked: true } : s));
      events.push({ type: "section-locked", sectionId: section.id });
      const nextUnlockedIndex = lockedSections.findIndex((s, i) => i > next.currentSectionIndex && !s.locked);
      if (nextUnlockedIndex === -1) {
        events.push({ type: "time-up" });
        next = { ...next, sections: lockedSections };
      } else {
        events.push({ type: "advanced-section", sectionIndex: nextUnlockedIndex });
        next = { ...next, sections: lockedSections, currentSectionIndex: nextUnlockedIndex, currentQuestionIndex: 0 };
      }
    } else {
      next = { ...next, sections: next.sections.map((s, i) => (i === next.currentSectionIndex ? { ...s, timeRemainingSeconds: remaining } : s)) };
    }
  }

  if (next.sharedTimeRemainingSeconds !== null) {
    const remaining = next.sharedTimeRemainingSeconds - 1;
    next = { ...next, sharedTimeRemainingSeconds: Math.max(0, remaining) };
    if (remaining <= 0) events.push({ type: "time-up" });
  }

  return { runtime: next, events };
}

export function selectAnswer(runtime: SessionRuntime, questionId: string, index: number): SessionRuntime {
  const section = runtime.sections.find((s) => s.questionIds.includes(questionId));
  if (!section || section.locked) return runtime;
  const a = runtime.answers[questionId];
  if (!a) return runtime;
  return { ...runtime, answers: { ...runtime.answers, [questionId]: { ...a, selectedIndex: index, visited: true } } };
}

export function clearAnswer(runtime: SessionRuntime, questionId: string): SessionRuntime {
  const section = runtime.sections.find((s) => s.questionIds.includes(questionId));
  if (!section || section.locked) return runtime;
  const a = runtime.answers[questionId];
  if (!a) return runtime;
  return { ...runtime, answers: { ...runtime.answers, [questionId]: { ...a, selectedIndex: null } } };
}

export function toggleMarkForReview(runtime: SessionRuntime, questionId: string): SessionRuntime {
  const a = runtime.answers[questionId];
  if (!a) return runtime;
  return { ...runtime, answers: { ...runtime.answers, [questionId]: { ...a, markedForReview: !a.markedForReview } } };
}

/** Moves within the CURRENT section only — real sectional-timed exams
 * don't let you jump ahead into a future section early or back into a
 * locked one, so cross-section movement only happens via
 * advanceToNextSection(). */
export function goToQuestion(runtime: SessionRuntime, questionIndex: number): SessionRuntime {
  const section = currentSection(runtime);
  if (!section || questionIndex < 0 || questionIndex >= section.questionIds.length) return runtime;
  const withVisit = markVisited({ ...runtime, currentQuestionIndex: questionIndex }, section.questionIds[questionIndex]);
  return withVisit;
}

export function nextQuestion(runtime: SessionRuntime): SessionRuntime {
  return goToQuestion(runtime, runtime.currentQuestionIndex + 1);
}

export function prevQuestion(runtime: SessionRuntime): SessionRuntime {
  return goToQuestion(runtime, runtime.currentQuestionIndex - 1);
}

/** Locks the current section (as if its time had expired) and moves to
 * the next unlocked one — used by the explicit "Submit section & continue"
 * button, same effect as the timer running out. Returns null section
 * index change (stays put) if this is the last section, since that's a
 * signal for the caller to submit the whole test instead. */
export function advanceToNextSection(runtime: SessionRuntime): { runtime: SessionRuntime; isLastSection: boolean } {
  const lockedSections = runtime.sections.map((s, i) => (i === runtime.currentSectionIndex ? { ...s, locked: true } : s));
  const nextUnlockedIndex = lockedSections.findIndex((s, i) => i > runtime.currentSectionIndex && !s.locked);
  if (nextUnlockedIndex === -1) {
    return { runtime: { ...runtime, sections: lockedSections }, isLastSection: true };
  }
  return {
    runtime: { ...runtime, sections: lockedSections, currentSectionIndex: nextUnlockedIndex, currentQuestionIndex: 0 },
    isLastSection: false,
  };
}

export function markSubmitted(runtime: SessionRuntime): SessionRuntime {
  return { ...runtime, submitted: true, sections: runtime.sections.map((s) => ({ ...s, locked: true })) };
}

// -------------------------------------------------------------------------
// Turning a finished run into plain attempt data (the store adds real
// AttemptRecord ids/timestamps/sessionId on top of this).
// -------------------------------------------------------------------------

export interface PendingAttempt {
  questionId: string;
  topicId: string;
  subjectId: SubjectId;
  selectedIndex: number | null;
  correct: boolean | null;
  timeTakenSeconds: number;
}

export function buildPendingAttempts(runtime: SessionRuntime, questions: Record<string, Question>): PendingAttempt[] {
  const out: PendingAttempt[] = [];
  for (const section of runtime.sections) {
    for (const qid of section.questionIds) {
      const q = questions[qid];
      if (!q) continue;
      const a = runtime.answers[qid];
      const selectedIndex = a?.selectedIndex ?? null;
      const correct = selectedIndex === null ? null : selectedIndex === q.answerIndex;
      out.push({ questionId: qid, topicId: q.topicId, subjectId: q.subjectId, selectedIndex, correct, timeTakenSeconds: a?.timeSpentSeconds ?? 0 });
    }
  }
  return out;
}

export function allQuestionIds(runtime: SessionRuntime): string[] {
  return runtime.sections.flatMap((s) => s.questionIds);
}

export function markedForReviewIds(runtime: SessionRuntime): string[] {
  return Object.entries(runtime.answers)
    .filter(([, a]) => a.markedForReview)
    .map(([id]) => id);
}

export interface QuestionPaletteEntry {
  questionId: string;
  status: "not-visited" | "unanswered" | "answered" | "marked-for-review" | "answered-and-marked";
}

/** Drives the classic exam "question palette" grid — the coloured-square
 * navigator every SSC-style mock shows. */
export function buildPalette(runtime: SessionRuntime, section: RuntimeSection): QuestionPaletteEntry[] {
  return section.questionIds.map((qid) => {
    const a = runtime.answers[qid];
    let status: QuestionPaletteEntry["status"] = "not-visited";
    if (a) {
      if (a.markedForReview && a.selectedIndex !== null) status = "answered-and-marked";
      else if (a.markedForReview) status = "marked-for-review";
      else if (a.selectedIndex !== null) status = "answered";
      else if (a.visited) status = "unanswered";
    }
    return { questionId: qid, status };
  });
}
