import type {
  DifficultyLevel, ExamTier, Question, QuestionCategory, QuestionType, SubjectId, Topic,
} from "@/types";

let counter = 0;

export interface QSpec {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  tier?: ExamTier;
  expectedTimeSeconds?: number;
  tags?: string[];
  category?: QuestionCategory;
  subtopicName?: string; // resolved against topic.subtopics by name
}

/** Builds a full Question[] for one topic from compact specs, resolving
 * chapterId/subjectId/subtopicId from the actual Topic object so IDs can
 * never drift out of sync with the syllabus data. */
export function buildQuestions(topic: Topic, specs: QSpec[]): Question[] {
  return specs.map((spec) => {
    counter += 1;
    const subtopic = spec.subtopicName
      ? topic.subtopics.find((s) => s.name === spec.subtopicName)
      : undefined;
    return {
      id: `${topic.id}-q${counter}`,
      question: spec.question,
      options: spec.options,
      answerIndex: spec.answerIndex,
      explanation: spec.explanation,
      subjectId: topic.subjectId as SubjectId,
      chapterId: topic.chapterId,
      topicId: topic.id,
      subtopicId: subtopic?.id,
      difficulty: spec.difficulty ?? "Medium",
      type: spec.type ?? "practice",
      category: spec.category ?? "MCQ",
      tier: spec.tier ?? "Tier 1",
      sourceVerified: false,
      expectedTimeSeconds: spec.expectedTimeSeconds ?? 60,
      tags: spec.tags,
    };
  });
}

export function findTopic(topics: Topic[], slug: string): Topic {
  const found = topics.find((t) => t.slug === slug);
  if (!found) {
    throw new Error(`[questions] Topic with slug "${slug}" not found — check syllabus data.`);
  }
  return found;
}
