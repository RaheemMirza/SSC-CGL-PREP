// =========================================================================
// Everything the app knows how to search is passed in rather than
// imported directly, so this stays a pure function the store can call
// with whatever it already has in memory — no duplicate data loading.
// =========================================================================

import type { Bookmark, FormulaEntry, Mistake, Question, SearchResult, Topic } from "@/types";

export interface SearchIndexInput {
  topics: Topic[];
  formulas: FormulaEntry[];
  bookmarks: Bookmark[];
  mistakes: Mistake[];
  pyqQuestions: Question[];
  topicNameLookup: (topicId: string) => string;
}

function norm(s: string): string {
  return s.toLowerCase();
}

export function search(query: string, input: SearchIndexInput, limit = 20): SearchResult[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const results: SearchResult[] = [];

  for (const t of input.topics) {
    if (norm(t.name).includes(q) || norm(t.summary).includes(q) || t.tags.some((tag) => norm(tag).includes(q))) {
      results.push({ kind: "topic", id: t.id, title: t.name, subtitle: t.summary, route: `/topic/${t.id}` });
    }
  }
  for (const f of input.formulas) {
    if (norm(f.title).includes(q) || norm(f.category).includes(q) || norm(f.explanation).includes(q)) {
      results.push({ kind: "formula", id: f.id, title: f.title, subtitle: f.category, route: `/formulas?highlight=${f.id}` });
    }
  }
  for (const b of input.bookmarks) {
    if (norm(b.title).includes(q)) {
      results.push({ kind: "bookmark", id: b.id, title: b.title, subtitle: b.note, route: `/bookmarks?highlight=${b.id}` });
    }
  }
  for (const m of input.mistakes) {
    const topicName = input.topicNameLookup(m.topicId);
    if (norm(topicName).includes(q) || norm(m.category).includes(q) || (m.note && norm(m.note).includes(q))) {
      results.push({ kind: "mistake", id: m.id, title: `${m.category} — ${topicName}`, subtitle: m.note, route: `/mistakes?highlight=${m.id}` });
    }
  }
  for (const pq of input.pyqQuestions) {
    if (norm(pq.question).includes(q)) {
      results.push({
        kind: "pyq",
        id: pq.id,
        title: pq.question.length > 90 ? `${pq.question.slice(0, 90)}…` : pq.question,
        subtitle: [pq.year, pq.shift].filter(Boolean).join(" · ") || undefined,
        route: `/pyq?highlight=${pq.id}`,
      });
    }
  }

  return results.slice(0, limit);
}
