import type { DifficultyLevel, ExamTier, Question, QuestionType, SubjectId } from "@/types";
import { quantQuestions } from "./quant";
import { reasoningQuestions } from "./reasoning";
import { englishQuestions } from "./english";
import { gaQuestions } from "./ga";

export const ALL_QUESTIONS: Question[] = [
  ...quantQuestions,
  ...reasoningQuestions,
  ...englishQuestions,
  ...gaQuestions,
];

export const QUESTIONS_BY_ID: Record<string, Question> = ALL_QUESTIONS.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as Record<string, Question>,
);

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS_BY_ID[id];
}

export function getQuestionsByTopic(topicId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topicId === topicId);
}

export function getQuestionsBySubject(subjectId: SubjectId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.subjectId === subjectId);
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.chapterId === chapterId);
}

export interface QuestionFilter {
  subjectId?: SubjectId;
  topicId?: string;
  chapterId?: string;
  tier?: ExamTier;
  difficulty?: DifficultyLevel;
  type?: QuestionType | QuestionType[];
  year?: number;
  tags?: string[];
}

/** Central filter used by the PYQ Bank, Practice Engine and Mock Test question
 * selection — every screen that needs "questions matching X" goes through
 * this so filtering logic never drifts between screens. */
export function filterQuestions(filter: QuestionFilter, pool: Question[] = ALL_QUESTIONS): Question[] {
  return pool.filter((q) => {
    if (filter.subjectId && q.subjectId !== filter.subjectId) return false;
    if (filter.topicId && q.topicId !== filter.topicId) return false;
    if (filter.chapterId && q.chapterId !== filter.chapterId) return false;
    if (filter.tier && q.tier !== filter.tier) return false;
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      if (!types.includes(q.type)) return false;
    }
    if (filter.year && q.year !== filter.year) return false;
    if (filter.tags && filter.tags.length > 0) {
      if (!q.tags || !filter.tags.some((t) => q.tags!.includes(t))) return false;
    }
    return true;
  });
}

/** Any question type that counts as "a PYQ" in the PYQ Bank UI — both the
 * (currently empty, by design — see content-quality rules) verified bucket
 * and the source-needs-verification bucket. Practice/AI-generated questions
 * never show up here, even though they may be SSC-style. */
export const PYQ_TYPES: QuestionType[] = ["verified-pyq", "unverified-pyq"];

export function getPyqBank(pool: Question[] = ALL_QUESTIONS): Question[] {
  return pool.filter((q) => PYQ_TYPES.includes(q.type));
}

export function getYearsAvailable(pool: Question[] = ALL_QUESTIONS): number[] {
  const years = new Set<number>();
  pool.forEach((q) => {
    if (q.year) years.add(q.year);
  });
  return Array.from(years).sort((a, b) => b - a);
}

/** Fisher-Yates shuffle — used by Quick/Mixed/Timed practice to avoid always
 * serving questions in authoring order. */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom(pool: Question[], count: number): Question[] {
  return shuffle(pool).slice(0, count);
}
