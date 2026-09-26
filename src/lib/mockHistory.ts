import type { MockTestResult, PracticeSession, Question } from "@/types";
import { ALL_PAPERS } from "../data/examConfig";
import { resolveQuestions } from "./questionResolver";
import { computeMockTopicBreakdown, getMockFocusAreas, type MockFocusArea, type MockTopicStat } from "./scoring";
import { getTopicById } from "../data/syllabus";

export interface SectionTimeUsageView {
  sectionId: string;
  name: string;
  timeLimitSeconds: number;
  timeUsedSeconds: number;
  utilisation: number;
}

export interface MockAnalysisView {
  result: MockTestResult;
  session: PracticeSession;
  breakdown: MockTopicStat[];
  focusAreas: MockFocusArea[];
  timeUsage: SectionTimeUsageView[];
  questions: Record<string, Question>;
}

function findSectionConfig(sectionId: string) {
  for (const paper of ALL_PAPERS) {
    const sc = paper.sections.find((s) => s.id === sectionId);
    if (sc) return sc;
  }
  return null;
}

/** The section's own subjectId, name & time limit are looked up from
 * examConfig.ts by sectionId rather than re-derived — that's the single
 * source of truth for the exam's real shape, and it means a past mock's
 * review page stays accurate even if you never kept the original
 * blueprint object around. */
export function reconstructMockAnalysis(result: MockTestResult, session: PracticeSession): MockAnalysisView {
  const questionsArr = resolveQuestions(session.questionIds);
  const questions: Record<string, Question> = {};
  for (const q of questionsArr) questions[q.id] = q;

  const attempts = Object.values(session.attempts);
  const breakdown = computeMockTopicBreakdown(attempts, questions, (id) => getTopicById(id)?.name ?? id);
  const focusAreas = getMockFocusAreas(breakdown);

  const timeUsage: SectionTimeUsageView[] = result.sectionResults.map((sr) => {
    const cfg = findSectionConfig(sr.sectionId);
    const timeLimitSeconds = (cfg?.sectionalTimeMinutes ?? 0) * 60;
    return {
      sectionId: sr.sectionId,
      name: cfg?.name ?? sr.sectionId,
      timeLimitSeconds,
      timeUsedSeconds: sr.timeSpentSeconds,
      utilisation: timeLimitSeconds > 0 ? Math.round((sr.timeSpentSeconds / timeLimitSeconds) * 100) : 0,
    };
  });

  return { result, session, breakdown, focusAreas, timeUsage, questions };
}
