import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Button, EmptyState } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { useSessionStore } from "../store/useSessionStore";
import { resolveQuestion } from "../lib/questionResolver";
import { getTopicById } from "../data/syllabus";
import type { MistakeCategory } from "@/types";

const CATEGORIES: MistakeCategory[] = [
  "Conceptual mistake",
  "Calculation mistake",
  "Misread question",
  "Formula forgotten",
  "Guessing",
  "Time-pressure mistake",
  "Silly mistake",
];

export default function MistakeBook() {
  const navigate = useNavigate();
  const mistakes = useDataStore((s) => s.mistakes);
  const resolveMistake = useDataStore((s) => s.resolveMistake);
  const bumpMistakeRepractice = useDataStore((s) => s.bumpMistakeRepractice);
  const updateMistakeCategory = useDataStore((s) => s.updateMistakeCategory);
  const startFromQuestions = useSessionStore((s) => s.startFromQuestions);
  const [showResolved, setShowResolved] = useState(false);

  const list = mistakes.filter((m) => m.resolved === showResolved).sort((a, b) => b.createdAt - a.createdAt);

  function rePractice(mistakeId: string, questionId: string) {
    const q = resolveQuestion(questionId);
    if (!q) return;
    bumpMistakeRepractice(mistakeId);
    startFromQuestions([q], "Mistake re-practice", "custom");
    navigate("/practice/run");
  }

  return (
    <div>
      <PageHeader
        title="Mistake Book"
        description="Every question you've explicitly flagged as a mistake, categorized by why it went wrong."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant={!showResolved ? "primary" : "secondary"} onClick={() => setShowResolved(false)}>
              Open ({mistakes.filter((m) => !m.resolved).length})
            </Button>
            <Button size="sm" variant={showResolved ? "primary" : "secondary"} onClick={() => setShowResolved(true)}>
              Resolved ({mistakes.filter((m) => m.resolved).length})
            </Button>
          </div>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title={showResolved ? "Nothing resolved yet" : "No open mistakes"}
          description={showResolved ? "Mistakes you mark resolved will show up here." : "Log a mistake from any practice/mock review screen, or from a topic page, and it'll land here."}
          action={<Button onClick={() => navigate("/practice")}>Go practice</Button>}
        />
      ) : (
        <div className="space-y-3">
          {list.map((m) => {
            const q = resolveQuestion(m.questionId);
            const topic = getTopicById(m.topicId);
            return (
              <Card key={m.id} className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <select
                    value={m.category}
                    onChange={(e) => updateMistakeCategory(m.id, e.target.value as MistakeCategory)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {topic && (
                    <Link to={`/topic/${topic.id}`} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                      {topic.name}
                    </Link>
                  )}
                  <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  {m.timesRePracticed > 0 && <span className="text-xs text-slate-400">Re-practiced {m.timesRePracticed}×</span>}
                </div>
                {q ? <p className="text-sm text-slate-700 dark:text-slate-200">{q.question}</p> : <p className="text-sm italic text-slate-400">Original question no longer available.</p>}
                <div className="mt-3 flex gap-2">
                  {q && (
                    <Button size="sm" variant="secondary" onClick={() => rePractice(m.id, m.questionId)}>
                      Re-practice
                    </Button>
                  )}
                  {!m.resolved && (
                    <Button size="sm" variant="ghost" onClick={() => resolveMistake(m.id)}>
                      <CheckCircle2 size={14} /> Mark resolved
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
