import { create } from "zustand";
import type { AttemptRecord, PracticeSession, Question, SessionType, SubjectId, Topic } from "@/types";
import * as R from "../lib/sessionRuntime";
import * as persistence from "../lib/persistence";
import { buildTier1Mock, buildSubjectMock, type BuiltMockTest } from "../lib/mockTestEngine";
import { TIER1_CONFIG } from "../data/examConfig";
import { selectQuestionsForSubject, selectQuestionsForTopic, selectQuestionsForTopics } from "../lib/questionSelector";
import { scoreMockTest } from "../lib/scoring";
import { reconstructMockAnalysis, type MockAnalysisView } from "../lib/mockHistory";
import { recomputeAllProgress, computeTopicBenchmarks, getWeakTopics } from "../lib/adaptiveEngine";
import { applySessionOutcome, checkNewBadges } from "../lib/gamification";
import { createRevisionSchedule } from "../lib/revisionScheduler";
import { ALL_QUESTIONS } from "../data/questions";
import { getTopicById } from "../data/syllabus";
import { useDataStore } from "./useDataStore";

export interface PracticeResultSummary {
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
  avgTimeSeconds: number;
  xpEarned: number;
  newBadgeIds: string[];
}

export interface MockResultSummary extends MockAnalysisView {
  xpEarned: number;
  newBadgeIds: string[];
}

interface SessionState {
  active: R.SessionRuntime | null;
  questions: Record<string, Question>;
  activeBlueprintPaperId: string | null; // which examConfig paper this mock run was built from
  skippedSections: { name: string; reason: string }[];
  lastMockResult: MockResultSummary | null;
  lastPracticeSummary: PracticeResultSummary | null;
  error: string | null;

  startMockTier1: () => void;
  startMockSubject: (subjectId: SubjectId) => void;
  startPracticeTopic: (topic: Topic, count?: number) => void;
  startPracticeSubjectMixed: (subjectId: SubjectId, count: number, sessionType?: SessionType) => void;
  startPracticeAllMixed: (count: number, sessionType?: SessionType) => void;
  startWeakAreaPractice: (count: number) => void;
  startFromQuestions: (questions: Question[], label: string, sessionType: SessionType) => void;

  selectAnswer: (questionId: string, index: number) => void;
  clearAnswer: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishSection: () => void;
  tick: () => void;
  submit: () => void;
  discard: () => void;
  clearResults: () => void;
}

const TIER1_SUBJECTS: SubjectId[] = ["reasoning", "ga", "quant", "english"];

function mergeQuestionsIn(existing: Record<string, Question>, fresh: Question[]): Record<string, Question> {
  const next = { ...existing };
  for (const q of fresh) next[q.id] = q;
  return next;
}

function registerQuestions(questions: Question[]) {
  persistence.cacheGeneratedQuestions(questions);
  persistence.markQuestionsSeen(questions.map((q) => q.id));
}

export const useSessionStore = create<SessionState>((set, get) => {
  function startBuiltMock(built: BuiltMockTest, paperId: string) {
    if (built.blueprint.sections.length === 0) {
      set({ error: "No question content is available to build this mock yet." });
      return;
    }
    registerQuestions(Object.values(built.questions));
    const sectionsInput = built.blueprint.sections.map((s) => ({
      id: s.id,
      name: s.name,
      subjectId: s.subjectId,
      questionIds: s.questionIds,
      timeLimitSeconds: s.timeLimitSeconds,
      marksCorrect: s.marksCorrect,
      marksWrong: s.marksWrong,
      qualifyingOnly: s.qualifyingOnly,
    }));
    const runtime = R.createRuntime(sectionsInput, {
      mode: "mock",
      sessionType: built.blueprint.kind === "subject-wise" ? "mock-subject" : "mock-full",
      tier: built.blueprint.tier,
      label: built.blueprint.title,
    });
    set({
      active: runtime,
      questions: built.questions,
      activeBlueprintPaperId: paperId,
      skippedSections: built.skippedSections.map((s) => ({ name: s.section.name, reason: s.reason })),
      lastMockResult: null,
      lastPracticeSummary: null,
      error: null,
    });
  }

  function startPracticeFromQuestions(questions: Question[], label: string, sessionType: SessionType) {
    if (questions.length === 0) {
      set({ error: "No questions are available for this yet — try a broader practice set." });
      return;
    }
    registerQuestions(questions);
    const bySubject = questions[0]?.subjectId ?? "quant";
    const sectionsInput = [
      { id: "practice", name: label, subjectId: bySubject, questionIds: questions.map((q) => q.id), timeLimitSeconds: 0, marksCorrect: 2, marksWrong: 0.5 },
    ];
    const runtime = R.createRuntime(sectionsInput, { mode: "practice", sessionType, label });
    set({
      active: runtime,
      questions: mergeQuestionsIn({}, questions),
      activeBlueprintPaperId: null,
      skippedSections: [],
      lastMockResult: null,
      lastPracticeSummary: null,
      error: null,
    });
  }

  return {
    active: null,
    questions: {},
    activeBlueprintPaperId: null,
    skippedSections: [],
    lastMockResult: null,
    lastPracticeSummary: null,
    error: null,

    startMockTier1: () => {
      const recentlySeen = useDataStore.getState().recentlySeenQuestions;
      startBuiltMock(buildTier1Mock(recentlySeen), TIER1_CONFIG.id);
    },

    startMockSubject: (subjectId) => {
      const recentlySeen = useDataStore.getState().recentlySeenQuestions;
      const built = buildSubjectMock(TIER1_CONFIG, subjectId, recentlySeen);
      if (!built) {
        set({ error: "That subject isn't part of this paper." });
        return;
      }
      startBuiltMock(built, TIER1_CONFIG.id);
    },

    startPracticeTopic: (topic, count = 15) => {
      const recentlySeen = useDataStore.getState().recentlySeenQuestions;
      const qs = selectQuestionsForTopic(topic, count, { recentlySeen });
      startPracticeFromQuestions(qs, `Practice — ${topic.name}`, "topic");
    },

    startPracticeSubjectMixed: (subjectId, count, sessionType = "mixed") => {
      const recentlySeen = useDataStore.getState().recentlySeenQuestions;
      const qs = selectQuestionsForSubject(subjectId, count, { recentlySeen });
      startPracticeFromQuestions(qs, `${sessionType === "quick" ? "Quick" : "Mixed"} practice`, sessionType);
    },

    startPracticeAllMixed: (count, sessionType = "mixed") => {
      const recentlySeen = useDataStore.getState().recentlySeenQuestions;
      const per = Math.floor(count / TIER1_SUBJECTS.length);
      let remainder = count - per * TIER1_SUBJECTS.length;
      const all: Question[] = [];
      for (const subjectId of TIER1_SUBJECTS) {
        const share = per + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder -= 1;
        all.push(...selectQuestionsForSubject(subjectId, share, { recentlySeen }));
      }
      startPracticeFromQuestions(all, sessionType === "quick" ? "Quick mixed practice" : "Mixed practice — all subjects", sessionType);
    },

    startWeakAreaPractice: (count) => {
      const progressMap = useDataStore.getState().topicProgress;
      const recentlySeen = useDataStore.getState().recentlySeenQuestions;
      const weak = getWeakTopics(progressMap, 8);
      if (weak.length === 0) {
        set({ error: "No weak topics identified yet — practice a bit more, or run a mixed diagnostic quiz first." });
        return;
      }
      const topics = weak.map((t) => getTopicById(t.topicId)).filter((t): t is Topic => !!t);
      const qs = selectQuestionsForTopics(topics, count, { recentlySeen });
      startPracticeFromQuestions(qs, "Weak-area practice", "weak-area");
    },

    startFromQuestions: (questions, label, sessionType) => startPracticeFromQuestions(questions, label, sessionType),

    selectAnswer: (questionId, index) => {
      const { active } = get();
      if (!active) return;
      set({ active: R.selectAnswer(active, questionId, index) });
    },
    clearAnswer: (questionId) => {
      const { active } = get();
      if (!active) return;
      set({ active: R.clearAnswer(active, questionId) });
    },
    toggleMarkForReview: (questionId) => {
      const { active } = get();
      if (!active) return;
      set({ active: R.toggleMarkForReview(active, questionId) });
    },
    goToQuestion: (index) => {
      const { active } = get();
      if (!active) return;
      set({ active: R.goToQuestion(active, index) });
    },
    nextQuestion: () => {
      const { active } = get();
      if (!active) return;
      set({ active: R.nextQuestion(active) });
    },
    prevQuestion: () => {
      const { active } = get();
      if (!active) return;
      set({ active: R.prevQuestion(active) });
    },
    finishSection: () => {
      const { active } = get();
      if (!active) return;
      const { runtime, isLastSection } = R.advanceToNextSection(active);
      if (isLastSection) {
        set({ active: runtime });
        get().submit();
      } else {
        set({ active: runtime });
      }
    },
    tick: () => {
      const { active } = get();
      if (!active || active.submitted) return;
      const { runtime, events } = R.tick(active);
      set({ active: runtime });
      if (events.some((e) => e.type === "time-up")) get().submit();
    },

    submit: () => {
      const { active, questions, activeBlueprintPaperId } = get();
      if (!active || active.submitted) return;
      const submittedRuntime = R.markSubmitted(active);
      const pending = R.buildPendingAttempts(submittedRuntime, questions);
      const now = Date.now();
      const attempts: AttemptRecord[] = pending.map((p, i) => ({
        id: `attempt-${submittedRuntime.id}-${i}`,
        questionId: p.questionId,
        topicId: p.topicId,
        subjectId: p.subjectId,
        selectedIndex: p.selectedIndex,
        correct: p.correct,
        timeTakenSeconds: p.timeTakenSeconds,
        timestamp: now,
        sessionId: submittedRuntime.id,
        sessionType: submittedRuntime.sessionType,
      }));

      const session: PracticeSession = {
        id: submittedRuntime.id,
        type: submittedRuntime.sessionType,
        startedAt: submittedRuntime.startedAt,
        completedAt: now,
        questionIds: R.allQuestionIds(submittedRuntime),
        attempts: Object.fromEntries(attempts.map((a) => [a.questionId, a])),
        markedForReview: R.markedForReviewIds(submittedRuntime),
        durationSeconds: Math.round((now - submittedRuntime.startedAt) / 1000),
        label: submittedRuntime.label,
        tier: submittedRuntime.tier,
      };

      persistence.recordAttempts(attempts, session);

      const allAttempts = persistence.loadAll().attempts;
      const benchmarks = computeTopicBenchmarks(ALL_QUESTIONS);
      const oldProgress = useDataStore.getState().topicProgress;
      const newProgress = recomputeAllProgress(allAttempts, benchmarks);
      persistence.setTopicProgress(newProgress);

      const touchedTopicIds = new Set(attempts.map((a) => a.topicId));
      let newlyMastered = 0;
      for (const tid of touchedTopicIds) {
        const was = oldProgress[tid]?.status === "mastered";
        const is = newProgress[tid]?.status === "mastered";
        if (is && !was) newlyMastered += 1;
      }

      const oldGami = useDataStore.getState().gamification;
      const bumpedGami = applySessionOutcome(oldGami, { attempts, sessionType: submittedRuntime.sessionType, newlyMasteredTopicCount: newlyMastered });
      const newBadgeIds = checkNewBadges(bumpedGami, newProgress, oldGami.badgesEarned);
      const finalGami = { ...bumpedGami, badgesEarned: [...bumpedGami.badgesEarned, ...newBadgeIds] };
      persistence.setGamification(finalGami);
      const xpEarned = finalGami.xp - oldGami.xp;

      const schedules = useDataStore.getState().revisionSchedules;
      for (const tid of touchedTopicIds) {
        if (schedules[tid]) continue;
        const cumulativeAttempted = newProgress[tid]?.attempted ?? 0;
        if (cumulativeAttempted >= 5) {
          const subjectId = attempts.find((a) => a.topicId === tid)?.subjectId;
          if (subjectId) persistence.setRevisionSchedule(createRevisionSchedule(tid, subjectId));
        }
      }

      let lastMockResult: MockResultSummary | null = null;
      let lastPracticeSummary: PracticeResultSummary | null = null;

      if (submittedRuntime.mode === "mock" && activeBlueprintPaperId) {
        const result = scoreMockTest(
          {
            id: submittedRuntime.id,
            kind: "tier1-full",
            title: submittedRuntime.label,
            description: "",
            tier: submittedRuntime.tier ?? "Tier 1",
            sections: submittedRuntime.sections.map((s) => ({
              id: s.id,
              name: s.name,
              subjectId: s.subjectId,
              questionIds: s.questionIds,
              timeLimitSeconds: s.timeLimitSeconds,
              marksCorrect: s.marksCorrect,
              marksWrong: s.marksWrong,
              qualifyingOnly: s.qualifyingOnly,
            })),
            totalDurationSeconds: 0,
          },
          session.attempts,
          submittedRuntime.startedAt,
          now,
        );
        persistence.saveMockResult(result);
        const analysis = reconstructMockAnalysis(result, session);
        lastMockResult = { ...analysis, xpEarned, newBadgeIds };
      } else {
        const attempted = attempts.filter((a) => a.correct !== null);
        const correct = attempted.filter((a) => a.correct).length;
        lastPracticeSummary = {
          total: attempts.length,
          attempted: attempted.length,
          correct,
          accuracy: attempted.length > 0 ? Math.round((correct / attempted.length) * 100) : 0,
          avgTimeSeconds: attempted.length > 0 ? Math.round(attempted.reduce((s, a) => s + a.timeTakenSeconds, 0) / attempted.length) : 0,
          xpEarned,
          newBadgeIds,
        };
      }

      useDataStore.getState().refresh();
      set({ active: submittedRuntime, lastMockResult, lastPracticeSummary });
    },

    discard: () => set({ active: null, questions: {}, activeBlueprintPaperId: null, skippedSections: [], error: null }),
    clearResults: () =>
      set({ active: null, questions: {}, activeBlueprintPaperId: null, skippedSections: [], lastMockResult: null, lastPracticeSummary: null, error: null }),
  };
});
