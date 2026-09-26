import { create } from "zustand";
import * as persistence from "../lib/persistence";
import type {
  AttemptRecord,
  Bookmark,
  GamificationState,
  Mistake,
  MistakeCategory,
  MockTestResult,
  PlanItem,
  PracticeSession,
  RevisionSchedule,
  StudyPlanInputs,
  SubjectId,
  TopicProgress,
} from "@/types";
import { createRevisionSchedule, completeNextStage, skipNextStage } from "../lib/revisionScheduler";
import { generateStudyPlan } from "../lib/studyPlanGenerator";
import { getTopicById } from "../data/syllabus";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface DataState {
  attempts: AttemptRecord[];
  sessions: PracticeSession[];
  topicProgress: Record<string, TopicProgress>;
  mistakes: Mistake[];
  bookmarks: Bookmark[];
  revisionSchedules: Record<string, RevisionSchedule>;
  mockResults: MockTestResult[];
  studyPlan: StudyPlanInputs | null;
  planItems: PlanItem[];
  gamification: GamificationState;
  recentlySeenQuestions: Record<string, number>;

  refresh: () => void;

  addMistake: (input: { questionId: string; topicId: string; subjectId: SubjectId; category: MistakeCategory; note?: string }) => void;
  resolveMistake: (id: string) => void;
  bumpMistakeRepractice: (id: string) => void;
  updateMistakeCategory: (id: string, category: MistakeCategory) => void;

  addBookmark: (input: { kind: Bookmark["kind"]; refId: string; subjectId?: SubjectId; topicId?: string; title: string; note?: string }) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (refId: string) => boolean;

  markTopicLearned: (topicId: string, subjectId: SubjectId) => void;
  advanceRevisionStage: (topicId: string) => void;
  skipRevisionStage: (topicId: string) => void;

  setStudyPlanInputs: (inputs: StudyPlanInputs) => void;
  regeneratePlan: () => void;
  togglePlanItemDone: (id: string) => void;

  exportData: () => string;
  importData: (json: string, mode: "replace" | "merge") => persistence.ImportResult;
  resetAll: () => void;
}

export const useDataStore = create<DataState>((set, get) => {
  function snapshot() {
    const d = persistence.loadAll();
    return {
      attempts: d.attempts,
      sessions: d.sessions,
      topicProgress: d.topicProgress,
      mistakes: d.mistakes,
      bookmarks: d.bookmarks,
      revisionSchedules: d.revisionSchedules,
      mockResults: d.mockResults,
      studyPlan: d.studyPlan,
      planItems: d.planItems,
      gamification: d.gamification,
      recentlySeenQuestions: d.recentlySeenQuestions,
    };
  }

  return {
    ...snapshot(),

    refresh: () => set(snapshot()),

    addMistake: (input) => {
      const mistake: Mistake = { id: newId("mistake"), createdAt: Date.now(), resolved: false, timesRePracticed: 0, ...input };
      persistence.addMistake(mistake);
      get().refresh();
    },
    resolveMistake: (id) => {
      persistence.updateMistake(id, { resolved: true, resolvedAt: Date.now() });
      get().refresh();
    },
    bumpMistakeRepractice: (id) => {
      const m = get().mistakes.find((x) => x.id === id);
      if (!m) return;
      persistence.updateMistake(id, { timesRePracticed: m.timesRePracticed + 1 });
      get().refresh();
    },
    updateMistakeCategory: (id, category) => {
      persistence.updateMistake(id, { category });
      get().refresh();
    },

    addBookmark: (input) => {
      if (get().bookmarks.some((b) => b.refId === input.refId && b.kind === input.kind)) return;
      const bookmark: Bookmark = { id: newId("bm"), createdAt: Date.now(), ...input };
      persistence.addBookmark(bookmark);
      get().refresh();
    },
    removeBookmark: (id) => {
      persistence.removeBookmark(id);
      get().refresh();
    },
    isBookmarked: (refId) => get().bookmarks.some((b) => b.refId === refId),

    markTopicLearned: (topicId, subjectId) => {
      if (get().revisionSchedules[topicId]) return;
      persistence.setRevisionSchedule(createRevisionSchedule(topicId, subjectId));
      get().refresh();
    },
    advanceRevisionStage: (topicId) => {
      const existing = get().revisionSchedules[topicId];
      if (!existing) return;
      persistence.setRevisionSchedule(completeNextStage(existing));
      get().refresh();
    },
    skipRevisionStage: (topicId) => {
      const existing = get().revisionSchedules[topicId];
      if (!existing) return;
      persistence.setRevisionSchedule(skipNextStage(existing));
      get().refresh();
    },

    setStudyPlanInputs: (inputs) => {
      const items = generateStudyPlan(inputs, get().topicProgress, (id) => getTopicById(id)?.name ?? id);
      persistence.setStudyPlan(inputs, items);
      get().refresh();
    },
    regeneratePlan: () => {
      const inputs = get().studyPlan;
      if (!inputs) return;
      const items = generateStudyPlan(inputs, get().topicProgress, (id) => getTopicById(id)?.name ?? id);
      persistence.setStudyPlan(inputs, items);
      get().refresh();
    },
    togglePlanItemDone: (id) => {
      const item = get().planItems.find((p) => p.id === id);
      if (!item) return;
      persistence.updatePlanItem(id, { done: !item.done });
      get().refresh();
    },

    exportData: () => persistence.exportData(),
    importData: (json, mode) => {
      const result = persistence.importData(json, mode);
      get().refresh();
      return result;
    },
    resetAll: () => {
      persistence.resetAll();
      get().refresh();
    },
  };
});
