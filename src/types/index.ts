// =========================================================================
// Core data model. Kept intentionally close to the schema requested in the
// spec (section 22) so it maps 1:1 onto an import file or a future backend.
// =========================================================================

export type ExamTier = "Tier 1" | "Tier 2";

export type SubjectId =
  | "quant"
  | "reasoning"
  | "english"
  | "ga"
  | "tier2-math"
  | "tier2-reasoning"
  | "tier2-english"
  | "tier2-ga"
  | "tier2-computer"
  | "tier2-statistics"
  | "tier2-finance-economics";

export interface Subject {
  id: SubjectId;
  name: string;
  shortName: string;
  tier: ExamTier | "Both";
  color: string; // tailwind color token used across the UI for this subject
  icon: string; // lucide-react icon name, resolved in a small lookup map
  description: string;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  name: string;
  order: number;
  description?: string;
}

export type TopicStatus = "not-started" | "in-progress" | "strong" | "weak" | "needs-revision" | "mastered";
export type SpeedRating = "fast" | "good" | "average" | "slow" | "unknown";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  order: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  subjectId: SubjectId;
  name: string;
  slug: string;
  order: number;
  difficultyTag: DifficultyLevel;
  tags: string[];
  subtopics: Subtopic[];
  /** Whether this topic has a full authored lesson (concept notes, formulas,
   *  examples, common mistakes, revision notes). If false, the Topic page
   *  still renders (never a dead link) but shows a lighter "coming soon"
   *  view with whatever structure/summary is available. */
  hasFullContent: boolean;
  /** 1-2 sentence summary always available, even for light topics. */
  summary: string;
}

// -------------------------------------------------------------------------
// Questions
// -------------------------------------------------------------------------

/** Content-quality classification — see spec sections 5, 22, 26.
 * "verified-pyq"   -> genuine official SSC CGL PYQ, source+year+shift confirmed
 * "unverified-pyq" -> claimed PYQ whose exact source/year/shift could not be confirmed
 * "practice"       -> SSC-style practice question, written to match the pattern
 * "ai-generated"   -> generated on demand (e.g. by the AI tutor), never mixed
 *                      into the verified PYQ bank
 */
export type QuestionType = "verified-pyq" | "unverified-pyq" | "practice" | "ai-generated";

export type QuestionCategory = "MCQ" | "Fill in the Blank" | "Match the Following" | "Assertion-Reason";

export interface Question {
  id: string;
  question: string;
  options: string[];
  answerIndex: number; // index into options
  explanation: string;
  subjectId: SubjectId;
  chapterId: string;
  topicId: string;
  subtopicId?: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  category: QuestionCategory;
  tier: ExamTier;
  year?: number;
  shift?: string;
  /** Only set (and trusted) when type === "verified-pyq" */
  sourceVerified: boolean;
  sourceReference?: string;
  expectedTimeSeconds: number;
  tags?: string[];
}

// -------------------------------------------------------------------------
// User progress & attempts
// -------------------------------------------------------------------------

export interface AttemptRecord {
  id: string;
  questionId: string;
  topicId: string;
  subjectId: SubjectId;
  selectedIndex: number | null; // null = unattempted
  correct: boolean | null;
  timeTakenSeconds: number;
  timestamp: number;
  sessionId: string;
  sessionType: SessionType;
}

export type SessionType =
  | "quick"
  | "topic"
  | "pyq"
  | "weak-area"
  | "mixed"
  | "timed"
  | "custom"
  | "mock-full"
  | "mock-subject"
  | "mock-topic"
  | "mock-pyq-simulation";

export interface PracticeSession {
  id: string;
  type: SessionType;
  startedAt: number;
  completedAt?: number;
  questionIds: string[];
  attempts: Record<string, AttemptRecord>;
  markedForReview: string[];
  durationSeconds?: number; // for timed sessions
  label: string;
  tier?: ExamTier;
}

export interface TopicProgress {
  topicId: string;
  subjectId: SubjectId;
  attempted: number;
  correct: number;
  totalTimeSeconds: number;
  lastPracticedAt?: number;
  status: TopicStatus;
  speed: SpeedRating;
  learned: boolean;
  learnedAt?: number;
  masteryScore: number; // 0-100, blends accuracy + speed + recency
}

export type MistakeCategory =
  | "Conceptual mistake"
  | "Calculation mistake"
  | "Misread question"
  | "Formula forgotten"
  | "Guessing"
  | "Time-pressure mistake"
  | "Silly mistake";

export interface Mistake {
  id: string;
  questionId: string;
  topicId: string;
  subjectId: SubjectId;
  category: MistakeCategory;
  note?: string;
  createdAt: number;
  resolved: boolean;
  resolvedAt?: number;
  timesRePracticed: number;
}

export type BookmarkKind = "question" | "concept" | "formula" | "fact";

export interface Bookmark {
  id: string;
  kind: BookmarkKind;
  refId: string; // questionId, or a content-slug for concept/formula/fact
  subjectId?: SubjectId;
  topicId?: string;
  title: string;
  note?: string;
  createdAt: number;
}

// -------------------------------------------------------------------------
// Revision (spaced repetition)
// -------------------------------------------------------------------------

export type RevisionStage = "learn" | "quick-revision" | "practice" | "revision" | "test" | "final-revision";

export interface RevisionSchedule {
  topicId: string;
  subjectId: SubjectId;
  learnedAt: number;
  stages: {
    stage: RevisionStage;
    dueAt: number;
    completedAt?: number;
    skipped?: boolean;
  }[];
}

// -------------------------------------------------------------------------
// Mock tests
// -------------------------------------------------------------------------

export type MockTestKind = "tier1-full" | "tier2-paper1-full" | "subject-wise" | "topic-wise" | "pyq-simulation";

export interface MockTestSection {
  id: string;
  name: string;
  subjectId: SubjectId;
  questionIds: string[];
  timeLimitSeconds: number; // sectional timer, 0 = shared pool
  marksCorrect: number;
  marksWrong: number;
  qualifyingOnly?: boolean;
}

export interface MockTestBlueprint {
  id: string;
  kind: MockTestKind;
  title: string;
  description: string;
  tier: ExamTier;
  sections: MockTestSection[];
  totalDurationSeconds: number;
}

export interface MockTestResult {
  id: string;
  blueprintId: string;
  startedAt: number;
  completedAt: number;
  sectionResults: {
    sectionId: string;
    correct: number;
    incorrect: number;
    unattempted: number;
    marksScored: number;
    timeSpentSeconds: number;
  }[];
  totalMarks: number;
  maxMarks: number;
  accuracy: number;
  attemptRate: number;
  averageTimePerQuestion: number;
}

// -------------------------------------------------------------------------
// Study plan
// -------------------------------------------------------------------------

export interface StudyPlanInputs {
  examDate: string | null; // ISO date
  dailyMinutes: number;
  level: "beginner" | "intermediate" | "advanced";
  targetScore: number | null;
  strongSubjects: SubjectId[];
  weakSubjects: SubjectId[];
}

export interface PlanItem {
  id: string;
  date: string; // ISO yyyy-mm-dd — which day of the plan this item belongs to
  subjectId: SubjectId;
  topicId?: string;
  topicName?: string;
  action: "learn" | "pyq" | "practice" | "revise" | "test" | "mixed-quiz";
  description: string;
  minutesAllocated: number;
  done: boolean;
}

// -------------------------------------------------------------------------
// Gamification
// -------------------------------------------------------------------------

export interface GamificationState {
  xp: number;
  streakDays: number;
  lastActiveDate: string | null; // ISO date (yyyy-mm-dd)
  topicsMastered: number;
  questionsSolved: number;
  badgesEarned: string[];
}

// -------------------------------------------------------------------------
// Learning Mode (spec section 4) — the structured lesson shown before a
// topic's questions. Only authored for hero (hasFullContent) topics; breadth
// topics fall back to their Topic.summary plus a "coming soon" notice.
// -------------------------------------------------------------------------

export interface WorkedExample {
  problem: string;
  solution: string;
  difficulty: DifficultyLevel;
}

export interface FormulaNote {
  formula: string;
  note: string;
}

export interface LessonContent {
  topicId: string; // matches Topic.id
  whatIsIt: string[]; // paragraphs, plain-language explanation
  keyFormulas?: FormulaNote[];
  workedExamples?: WorkedExample[]; // progressively harder
  sscShortcuts?: string[];
  commonTraps?: string[];
  quickRevision: string[]; // bullet points for the "quick revision" step
}

// -------------------------------------------------------------------------
// Formulas & shortcuts
// -------------------------------------------------------------------------

export interface FormulaEntry {
  id: string;
  subjectId: SubjectId;
  category: string; // e.g. "Percentage", "Series shortcuts", "Idioms"
  title: string;
  formula?: string;
  explanation: string;
  example?: string;
  tags: string[];
}

// -------------------------------------------------------------------------
// GA / current affairs
// -------------------------------------------------------------------------

export interface GaNote {
  id: string;
  categoryId: string;
  title: string;
  body: string;
  monthTag?: string; // e.g. "2026-09" for current affairs
  isCurrentAffairs: boolean;
  addedAt: number;
}

// -------------------------------------------------------------------------
// Search
// -------------------------------------------------------------------------

export type SearchResultKind = "topic" | "note" | "pyq" | "practice" | "mistake" | "bookmark" | "formula";

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  title: string;
  subtitle?: string;
  route: string;
}
