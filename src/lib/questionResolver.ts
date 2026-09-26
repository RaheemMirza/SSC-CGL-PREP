// =========================================================================
// A generated question ("gen-...") only exists at the moment it's created —
// it's not in the static bank, so anything that wants to show it again
// later (mock review, mistake book, bookmarks) needs to check the
// persisted question cache instead. This module is the one place that
// knows to check both, so the rest of the app can just call
// resolveQuestion(id) and not think about where a question came from.
// =========================================================================

import type { Question } from "@/types";
import { getQuestionById } from "../data/questions";
import { getCachedQuestion } from "./persistence";

export function resolveQuestion(id: string): Question | undefined {
  if (id.startsWith("gen-")) return getCachedQuestion(id);
  return getQuestionById(id) ?? getCachedQuestion(id);
}

export function resolveQuestions(ids: string[]): Question[] {
  const out: Question[] = [];
  for (const id of ids) {
    const q = resolveQuestion(id);
    if (q) out.push(q);
  }
  return out;
}
