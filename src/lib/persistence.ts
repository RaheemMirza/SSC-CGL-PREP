// =========================================================================
// The ONE place that talks to localStorage. Every zustand store in
// src/store/* reads its initial state from here and writes back through
// here after every mutation — nothing else in the app touches
// window.localStorage directly. That keeps the whole app's data:
//   1. Versioned (so a future schema change can migrate old data instead
//      of silently losing it),
//   2. Exportable/importable as one JSON file (Settings > Export Data),
//   3. Easy to swap for IndexedDB or a real backend later — everything
//      else in the app only ever calls the functions below, never
//      localStorage directly.
// =========================================================================

import type {
  AttemptRecord,
  Bookmark,
  GamificationState,
  Mistake,
  MockTestResult,
  PracticeSession,
  Question,
  RevisionSchedule,
  StudyPlanInputs,
  TopicProgress,
} from "@/types";

const STORAGE_KEY = "ssc-cgl-prep:data";
const SCHEMA_VERSION = 1;

export interface AppData {
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  attempts: AttemptRecord[];
  sessions: PracticeSession[];
  topicProgress: Record<string, TopicProgress>;
  mistakes: Mistake[];
  bookmarks: Bookmark[];
  revisionSchedules: Record<string, RevisionSchedule>;
  mockResults: MockTestResult[];
  studyPlan: StudyPlanInputs | null;
  planItems: import("@/types").PlanItem[];
  gamification: GamificationState;
  settings: AppSettings;
  /** questionId -> last-seen timestamp, used so practice/mock question
   * selection can avoid repeating whatever you just saw recently. */
  recentlySeenQuestions: Record<string, number>;
  /** Every procedurally-generated question you've ever been served, keyed
   * by its "gen-..." id. The static bank lives in code and can always be
   * looked up by id, but a generated question exists only at the moment
   * it's created — this cache is what lets your Mistake Book, Bookmarks,
   * and mock-review screens still show the exact question (with its exact
   * numbers) weeks later instead of a broken reference. Capped so it can't
   * grow forever on a very long-lived install. */
  questionCache: Record<string, Question>;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  reducedMotion: boolean;
  aiApiKey: string | null; // BYO Anthropic API key, kept in localStorage only, never sent anywhere but api.anthropic.com
  aiFeaturesEnabled: boolean;
}

function defaultData(): AppData {
  const now = Date.now();
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    attempts: [],
    sessions: [],
    topicProgress: {},
    mistakes: [],
    bookmarks: [],
    revisionSchedules: {},
    mockResults: [],
    studyPlan: null,
    planItems: [],
    gamification: {
      xp: 0,
      streakDays: 0,
      lastActiveDate: null,
      topicsMastered: 0,
      questionsSolved: 0,
      badgesEarned: [],
    },
    settings: {
      theme: "system",
      soundEnabled: true,
      reducedMotion: false,
      aiApiKey: null,
      aiFeaturesEnabled: false,
    },
    recentlySeenQuestions: {},
    questionCache: {},
  };
}

let cache: AppData | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Runs any future schema migrations in sequence. Currently a no-op since
 * we're still on v1 — this is the seam a v2 change would hook into rather
 * than silently discarding anyone's saved progress. */
function migrate(raw: any): AppData {
  if (!raw || typeof raw !== "object") return defaultData();
  if (raw.schemaVersion === SCHEMA_VERSION) return { ...defaultData(), ...raw };
  // Unknown/older version: merge onto defaults so new fields always exist,
  // rather than throwing away everything the person has already logged.
  return { ...defaultData(), ...raw, schemaVersion: SCHEMA_VERSION };
}

export function loadAll(): AppData {
  if (cache) return cache;
  if (!isBrowser()) {
    cache = defaultData();
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? migrate(JSON.parse(raw)) : defaultData();
  } catch (err) {
    console.error("[persistence] failed to read localStorage, starting fresh", err);
    cache = defaultData();
  }
  return cache;
}

function persist(data: AppData) {
  cache = data;
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, updatedAt: Date.now() }));
  } catch (err) {
    console.error("[persistence] failed to write localStorage — is storage full or private-mode?", err);
  }
}

/** Every store action funnels through this: read the current snapshot,
 * apply a pure update function, persist, return the new snapshot. Keeps
 * "update + save" atomic from the app's point of view. */
export function update(updater: (data: AppData) => AppData): AppData {
  const next = updater(loadAll());
  persist(next);
  return next;
}

export function exportData(): string {
  return JSON.stringify(loadAll(), null, 2);
}

export interface ImportResult {
  ok: boolean;
  error?: string;
}

export function importData(json: string, mode: "replace" | "merge" = "replace"): ImportResult {
  try {
    const parsed = JSON.parse(json);
    if (mode === "replace") {
      persist(migrate(parsed));
      return { ok: true };
    }
    const current = loadAll();
    const incoming = migrate(parsed);
    const merged: AppData = {
      ...current,
      attempts: [...current.attempts, ...incoming.attempts.filter((a) => !current.attempts.some((c) => c.id === a.id))],
      sessions: [...current.sessions, ...incoming.sessions.filter((s) => !current.sessions.some((c) => c.id === s.id))],
      topicProgress: { ...current.topicProgress, ...incoming.topicProgress },
      mistakes: [...current.mistakes, ...incoming.mistakes.filter((m) => !current.mistakes.some((c) => c.id === m.id))],
      bookmarks: [...current.bookmarks, ...incoming.bookmarks.filter((b) => !current.bookmarks.some((c) => c.id === b.id))],
      revisionSchedules: { ...current.revisionSchedules, ...incoming.revisionSchedules },
      mockResults: [...current.mockResults, ...incoming.mockResults.filter((m) => !current.mockResults.some((c) => c.id === m.id))],
      gamification: incoming.gamification.xp > current.gamification.xp ? incoming.gamification : current.gamification,
    };
    persist(merged);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not parse that file as SSC CGL Prep data." };
  }
}

export function resetAll(): void {
  persist(defaultData());
}

export function markQuestionSeen(questionId: string): void {
  update((data) => ({ ...data, recentlySeenQuestions: { ...data.recentlySeenQuestions, [questionId]: Date.now() } }));
}

/** Same as markQuestionSeen but for a whole session/mock's worth of
 * questions at once — one write instead of N. */
export function markQuestionsSeen(questionIds: string[]): void {
  if (questionIds.length === 0) return;
  update((data) => {
    const now = Date.now();
    const next = { ...data.recentlySeenQuestions };
    for (const id of questionIds) next[id] = now;
    return { ...data, recentlySeenQuestions: next };
  });
}

const QUESTION_CACHE_LIMIT = 4000;

/** Persists procedurally-generated questions so they can be resolved by id
 * later (mock review, mistake book, bookmarks). Only ids not already cached
 * are written. If the cache grows past its limit, the oldest-seen entries
 * (by recentlySeenQuestions timestamp, falling back to insertion order) are
 * dropped first — this is a cache, not a permanent question bank. */
export function cacheGeneratedQuestions(questions: Question[]): void {
  const fresh = questions.filter((q) => q.id.startsWith("gen-"));
  if (fresh.length === 0) return;
  update((data) => {
    const nextCache = { ...data.questionCache };
    for (const q of fresh) {
      if (!nextCache[q.id]) nextCache[q.id] = q;
    }
    const ids = Object.keys(nextCache);
    if (ids.length > QUESTION_CACHE_LIMIT) {
      const sorted = ids.sort((a, b) => (data.recentlySeenQuestions[a] ?? 0) - (data.recentlySeenQuestions[b] ?? 0));
      for (const id of sorted.slice(0, ids.length - QUESTION_CACHE_LIMIT)) delete nextCache[id];
    }
    return { ...data, questionCache: nextCache };
  });
}

export function getCachedQuestion(id: string): Question | undefined {
  return loadAll().questionCache[id];
}

/** Appends a batch of attempts (and optionally a session record) in one
 * atomic write — used when a practice session or mock test is submitted,
 * so logging 25-150 attempts never costs 25-150 separate localStorage
 * writes. */
export function recordAttempts(attempts: AttemptRecord[], session?: PracticeSession): void {
  update((data) => ({
    ...data,
    attempts: [...data.attempts, ...attempts],
    sessions: session ? [...data.sessions, session] : data.sessions,
  }));
}

export function saveMockResult(result: MockTestResult): void {
  update((data) => ({ ...data, mockResults: [...data.mockResults, result] }));
}

export function setTopicProgress(next: Record<string, TopicProgress>): void {
  update((data) => ({ ...data, topicProgress: next }));
}

export function setGamification(next: GamificationState): void {
  update((data) => ({ ...data, gamification: next }));
}

export function addMistake(mistake: Mistake): void {
  update((data) => ({ ...data, mistakes: [...data.mistakes, mistake] }));
}

export function updateMistake(id: string, patch: Partial<Mistake>): void {
  update((data) => ({ ...data, mistakes: data.mistakes.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
}

export function addBookmark(bookmark: Bookmark): void {
  update((data) => ({ ...data, bookmarks: [...data.bookmarks, bookmark] }));
}

export function removeBookmark(id: string): void {
  update((data) => ({ ...data, bookmarks: data.bookmarks.filter((b) => b.id !== id) }));
}

export function setStudyPlan(plan: StudyPlanInputs, items: import("@/types").PlanItem[]): void {
  update((data) => ({ ...data, studyPlan: plan, planItems: items }));
}

export function updatePlanItem(id: string, patch: Partial<import("@/types").PlanItem>): void {
  update((data) => ({ ...data, planItems: data.planItems.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
}

export function setRevisionSchedule(schedule: RevisionSchedule): void {
  update((data) => ({ ...data, revisionSchedules: { ...data.revisionSchedules, [schedule.topicId]: schedule } }));
}

export function updateSettings(patch: Partial<AppSettings>): void {
  update((data) => ({ ...data, settings: { ...data.settings, ...patch } }));
}
