import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { PageHeader, Badge } from "../components/ui/Primitives";
import { getTier1Subjects, getTier2Subjects, getChaptersBySubject, getTopicsByChapter } from "../data/syllabus";
import { hasGenerator } from "../lib/generators";
import { useDataStore } from "../store/useDataStore";
import { colorClassesFor, iconFor } from "../lib/ui/subjectTheme";
import type { SubjectId, TopicPriority } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  mastered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  strong: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  "in-progress": "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400",
  weak: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "needs-revision": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "not-started": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const PRIORITY_BADGE: Record<TopicPriority, string> = {
  must: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  should: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  could: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};
const PRIORITY_LABEL: Record<TopicPriority, string> = { must: "Must", should: "Should", could: "Could" };

export default function Syllabus() {
  const tier1 = getTier1Subjects();
  const tier2 = getTier2Subjects();
  const [activeSubject, setActiveSubject] = useState<SubjectId>(tier1[0].id);
  const [priorityFilter, setPriorityFilter] = useState<TopicPriority | "all">("all");
  const topicProgress = useDataStore((s) => s.topicProgress);

  const allSubjects = [...tier1, ...tier2];
  const subject = allSubjects.find((s) => s.id === activeSubject) ?? tier1[0];
  const chapters = getChaptersBySubject(subject.id);

  return (
    <div>
      <PageHeader title="Syllabus" description="Every topic links straight into practice — topics with a lightning bolt have literally infinite procedurally-generated questions." />

      <div className="mb-4 flex flex-wrap gap-2">
        {allSubjects.map((s) => {
          const colors = colorClassesFor(s.color);
          const Icon = iconFor(s.icon);
          const active = s.id === activeSubject;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSubject(s.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? `${colors.bg} text-white` : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Icon size={13} />
              {s.shortName}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Priority:</span>
        {(["all", "must", "should", "could"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              priorityFilter === p ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => {
          const topics = getTopicsByChapter(chapter.id).filter((t) => priorityFilter === "all" || t.priority === priorityFilter);
          if (topics.length === 0) return null;
          return (
            <details key={chapter.id} open className="rounded-xl2 border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{chapter.name}</summary>
              <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {topics.map((topic) => {
                  const progress = topicProgress[topic.id];
                  return (
                    <Link key={topic.id} to={`/topic/${topic.id}`} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <span className="flex-1 text-slate-700 dark:text-slate-200">{topic.name}</span>
                      {hasGenerator(topic.slug) && <Sparkles size={13} className="text-amber-500" />}
                      <Badge className={PRIORITY_BADGE[topic.priority]}>{PRIORITY_LABEL[topic.priority]}</Badge>
                      {progress ? (
                        <Badge className={STATUS_BADGE[progress.status]}>{progress.status}</Badge>
                      ) : (
                        <Badge className={STATUS_BADGE["not-started"]}>not started</Badge>
                      )}
                      <ChevronRight size={16} className="text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
