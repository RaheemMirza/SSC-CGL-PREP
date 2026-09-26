// =========================================================================
// A study plan is just today's todo list, regenerated from whatever your
// data says right now — due revisions first, then your own weak topics,
// then genuinely new ground in the subjects you flagged as weak, filling
// up to your stated daily-minutes budget. As the exam date approaches, a
// full mock gets scheduled automatically regardless of the above.
// =========================================================================

import type { PlanItem, StudyPlanInputs, SubjectId, TopicProgress } from "@/types";
import { getWeakTopics, getSlowTopics, getDueForRevision } from "./adaptiveEngine";
import { getTopicsBySubject } from "../data/syllabus";

const MINUTES_BY_ACTION: Record<PlanItem["action"], number> = {
  revise: 10,
  practice: 20,
  learn: 25,
  test: 20,
  "mixed-quiz": 15,
  pyq: 20,
};

let counter = 0;
function nextId(): string {
  counter += 1;
  return `plan-${Date.now().toString(36)}-${counter}`;
}

function mkItem(subjectId: SubjectId, action: PlanItem["action"], description: string, topicId?: string, topicName?: string): PlanItem {
  return { id: nextId(), subjectId, topicId, topicName, action, description, minutesAllocated: MINUTES_BY_ACTION[action], done: false };
}

function daysUntil(examDate: string | null): number | null {
  if (!examDate) return null;
  const ms = new Date(examDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Regenerates today's plan. Deterministic given the same inputs/progress
 * (aside from item ids), so calling this again after logging more
 * practice will naturally reprioritise — there's no separate "replan"
 * button needed, just "regenerate". */
export function generateStudyPlan(
  inputs: StudyPlanInputs,
  progressMap: Record<string, TopicProgress>,
  topicNameLookup: (topicId: string) => string,
): PlanItem[] {
  const items: PlanItem[] = [];
  const budget = Math.max(15, inputs.dailyMinutes);
  const daysLeft = daysUntil(inputs.examDate);

  const withinBudget = () => items.reduce((s, i) => s + i.minutesAllocated, 0) < budget;

  // Exam is close: a full mock takes priority over everything else today,
  // on a roughly twice-a-week cadence once inside the final two weeks.
  if (daysLeft !== null && daysLeft <= 14 && daysLeft % 3 === 0) {
    items.push(mkItem("quant", "test", "Full Tier 1 mock — with 2 weeks or less to go, regular full-length practice under real timing matters more than any single topic."));
  }

  // 1. Revisions that are due, most-overdue first.
  for (const t of getDueForRevision(progressMap, 7).slice(0, 4)) {
    if (!withinBudget()) break;
    items.push(mkItem(t.subjectId, "revise", `Due for revision — it's been a while since you last touched ${topicNameLookup(t.topicId)}.`, t.topicId, topicNameLookup(t.topicId)));
  }

  // 2. Your own weak topics.
  for (const t of getWeakTopics(progressMap, 4)) {
    if (!withinBudget()) break;
    if (items.some((i) => i.topicId === t.topicId)) continue;
    const acc = Math.round((t.correct / t.attempted) * 100);
    items.push(mkItem(t.subjectId, "practice", `Weak spot — ${acc}% accuracy over your last ${t.attempted} questions here.`, t.topicId, topicNameLookup(t.topicId)));
  }

  // 3. Topics you're slow on, even if accuracy is fine.
  for (const t of getSlowTopics(progressMap, 2)) {
    if (!withinBudget()) break;
    if (items.some((i) => i.topicId === t.topicId)) continue;
    items.push(mkItem(t.subjectId, "practice", `Speed drill — running slower than SSC pace here.`, t.topicId, topicNameLookup(t.topicId)));
  }

  // 4. New ground in subjects you named as weak (beginners get more of
  // this; advanced users get less since they've likely covered basics).
  const learnSlots = inputs.level === "beginner" ? 3 : inputs.level === "intermediate" ? 2 : 1;
  for (const subjectId of inputs.weakSubjects) {
    let added = 0;
    for (const topic of getTopicsBySubject(subjectId)) {
      if (!withinBudget() || added >= learnSlots) break;
      const progress = progressMap[topic.id];
      if (progress && progress.attempted > 0) continue; // already started
      items.push(mkItem(subjectId, "learn", `New topic in a subject you flagged as weak.`, topic.id, topic.name));
      added += 1;
    }
  }

  // 5. Nothing else to say yet (brand-new plan, no data): a mixed
  // diagnostic quiz across all Tier 1 subjects.
  if (items.length === 0) {
    items.push(mkItem("quant", "mixed-quiz", "Diagnostic mixed quiz across all four subjects — gives the plan real data to work with tomorrow."));
  }

  return items;
}
