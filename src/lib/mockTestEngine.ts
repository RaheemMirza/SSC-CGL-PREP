// =========================================================================
// Builds a full mock test blueprint whose shape is read entirely from
// examConfig.ts — question counts, max marks, +/- marking, and sectional
// timers are never hard-coded here a second time. That's what makes this
// an "exact replica": change a number in examConfig.ts (because SSC
// changed the pattern) and every mock built from it changes too.
// =========================================================================

import type { ExamPaperConfig, ExamSectionConfig } from "../data/examConfig";
import { TIER1_CONFIG, TIER2_PAPER1_CONFIG } from "../data/examConfig";
import type { ExamTier, MockTestBlueprint, MockTestKind, MockTestSection, Question, SubjectId } from "@/types";
import { selectQuestionsForSubject } from "./questionSelector";

export interface SkippedSection {
  section: ExamSectionConfig;
  reason: string;
}

export interface BuiltMockTest {
  blueprint: MockTestBlueprint;
  /** Every Question used anywhere in the blueprint, keyed by id — static
   * and generated alike — so the exam runner never needs a second lookup
   * path while the test is in progress. */
  questions: Record<string, Question>;
  /** Sections that exist in the real exam but aren't simulated as MCQs
   * here (currently just the DEST typing test) — surfaced so the UI can
   * say so honestly instead of silently dropping them. */
  skippedSections: SkippedSection[];
}

/** A "section" with fewer than 2 questions and 0 marks is a qualifying
 * typing/data-entry test (DEST), not something an MCQ engine can
 * simulate. Everything else is a normal MCQ section. */
function isMcqSection(section: ExamSectionConfig): boolean {
  return !(section.questions < 2 && section.maxMarks === 0);
}

/** Pure blueprint construction — no localStorage side effects. The caller
 * (a store action) is responsible for calling registerMockQuestions()
 * with the returned `questions` right after building, so generated
 * questions get cached and everything used gets marked as seen. Keeping
 * this function pure is what makes it possible to unit-test directly. */
export function buildMockTest(
  paper: ExamPaperConfig,
  kind: MockTestKind,
  recentlySeen: Record<string, number>,
  opts?: { generatorBias?: number },
): BuiltMockTest {
  const usedIds = new Set<string>();
  const sections: MockTestSection[] = [];
  const questions: Record<string, Question> = {};
  const skippedSections: SkippedSection[] = [];

  for (const sc of paper.sections) {
    if (!isMcqSection(sc)) {
      skippedSections.push({
        section: sc,
        reason: "This is a qualifying typing/data-entry test, not a multiple-choice section, so it isn't simulated here.",
      });
      continue;
    }
    const picked = selectQuestionsForSubject(sc.subjectId as SubjectId, sc.questions, {
      recentlySeen,
      excludeIds: usedIds,
      generatorBias: opts?.generatorBias,
    });
    if (picked.length === 0) {
      // No static or generated content exists yet for this subject (e.g.
      // the Tier 2 subjects, which don't have a question bank of their
      // own yet) — skip honestly rather than shipping an empty section.
      skippedSections.push({ section: sc, reason: "No question content is available for this subject yet." });
      continue;
    }
    picked.forEach((q) => {
      usedIds.add(q.id);
      questions[q.id] = q;
    });
    sections.push({
      id: sc.id,
      name: sc.name,
      subjectId: sc.subjectId as SubjectId,
      questionIds: picked.map((q) => q.id),
      timeLimitSeconds: (sc.sectionalTimeMinutes ?? 0) * 60,
      marksCorrect: sc.marksPerCorrect,
      marksWrong: sc.marksPerWrong,
      qualifyingOnly: sc.qualifyingOnly,
    });
  }

  const tier: ExamTier = paper.id.startsWith("tier2") ? "Tier 2" : "Tier 1";
  const hasSectionalTimers = sections.every((s) => s.timeLimitSeconds > 0);
  const totalDurationSeconds = hasSectionalTimers
    ? sections.reduce((s, sec) => s + sec.timeLimitSeconds, 0)
    : paper.totalDurationMinutes * 60;

  const blueprint: MockTestBlueprint = {
    id: `mock-${paper.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    title: `${paper.name} — Full-Length Mock`,
    description: `${sections.reduce((s, sec) => s + sec.questionIds.length, 0)} questions across ${sections.length} sections, exact marking scheme and section timing of the real ${paper.name} paper.`,
    tier,
    sections,
    totalDurationSeconds,
  };

  return { blueprint, questions, skippedSections };
}

export function buildTier1Mock(recentlySeen: Record<string, number>, opts?: { generatorBias?: number }): BuiltMockTest {
  return buildMockTest(TIER1_CONFIG, "tier1-full", recentlySeen, opts);
}

export function buildTier2Paper1Mock(recentlySeen: Record<string, number>, opts?: { generatorBias?: number }): BuiltMockTest {
  return buildMockTest(TIER2_PAPER1_CONFIG, "tier2-paper1-full", recentlySeen, opts);
}

/** A single-subject mock — same marking scheme and per-question time
 * budget as the full paper's section for that subject, just without the
 * other three sections. Handy for "I only have 15 minutes, drill GA". */
export function buildSubjectMock(
  paper: ExamPaperConfig,
  subjectId: SubjectId,
  recentlySeen: Record<string, number>,
  opts?: { generatorBias?: number },
): BuiltMockTest | null {
  const sc = paper.sections.find((s) => s.subjectId === subjectId);
  if (!sc || !isMcqSection(sc)) return null;
  const singleSubjectPaper: ExamPaperConfig = {
    ...paper,
    id: `${paper.id}-${subjectId}`,
    totalQuestions: sc.questions,
    totalMarks: sc.maxMarks,
    totalDurationMinutes: sc.sectionalTimeMinutes ?? Math.ceil(sc.questions * 0.6),
    sections: [sc],
  };
  return buildMockTest(singleSubjectPaper, "subject-wise", recentlySeen, opts);
}
