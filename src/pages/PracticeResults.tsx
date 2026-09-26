import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, Sparkles, Award } from "lucide-react";
import { PageHeader, Card, Button, StatTile, EmptyState } from "../components/ui/Primitives";
import { useSessionStore } from "../store/useSessionStore";
import { useDataStore } from "../store/useDataStore";
import { getTopicById } from "../data/syllabus";
import { BADGES } from "../lib/gamification";

export default function PracticeResults() {
  const navigate = useNavigate();
  const summary = useSessionStore((s) => s.lastPracticeSummary);
  const active = useSessionStore((s) => s.active);
  const questions = useSessionStore((s) => s.questions);
  const addMistake = useDataStore((s) => s.addMistake);
  const addBookmark = useDataStore((s) => s.addBookmark);

  if (!summary || !active) {
    return (
      <EmptyState
        title="No practice result to show"
        description="Finish a practice session to see your score and review here."
        action={<Button onClick={() => navigate("/practice")}>Go to Practice</Button>}
      />
    );
  }

  const questionIds = active.sections.flatMap((s) => s.questionIds);

  return (
    <div>
      <PageHeader
        title={active.label}
        description="Practice session results"
        actions={
          <Button variant="secondary" onClick={() => navigate("/practice")}>
            Back to Practice
          </Button>
        }
      />

      <Card className="mb-6 flex items-center gap-3 border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
        <Sparkles size={18} className="text-brand-600" />
        <p className="text-sm font-medium text-brand-800 dark:text-brand-200">+{summary.xpEarned} XP earned.</p>
        {summary.newBadgeIds.length > 0 && (
          <div className="ml-auto flex gap-2">
            {summary.newBadgeIds.map((id) => {
              const b = BADGES.find((x) => x.id === id);
              return (
                <span key={id} className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-brand-700 shadow-card dark:bg-slate-900 dark:text-brand-300">
                  <Award size={12} /> {b?.name ?? id}
                </span>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Correct" value={`${summary.correct}/${summary.attempted}`} />
        <StatTile label="Accuracy" value={`${summary.accuracy}%`} />
        <StatTile label="Attempted" value={`${summary.attempted}/${summary.total}`} />
        <StatTile label="Avg time / Q" value={`${summary.avgTimeSeconds}s`} />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Review</h2>
        <div className="space-y-2">
          {questionIds.map((qid, i) => {
            const q = questions[qid];
            if (!q) return null;
            const a = active.answers[qid];
            const status = a.selectedIndex === null ? "unattempted" : a.selectedIndex === q.answerIndex ? "correct" : "incorrect";
            const topic = getTopicById(q.topicId);
            return (
              <details key={qid} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <summary className="flex cursor-pointer items-center gap-2 text-sm">
                  <span className="text-slate-400">{i + 1}.</span>
                  {status === "correct" && <CheckCircle2 size={14} className="text-emerald-500" />}
                  {status === "incorrect" && <XCircle size={14} className="text-rose-500" />}
                  {status === "unattempted" && <MinusCircle size={14} className="text-slate-400" />}
                  <span className="line-clamp-1 text-slate-700 dark:text-slate-200">{q.question}</span>
                  <Link to={`/topic/${q.topicId}`} className="ml-auto shrink-0 text-xs text-brand-600 hover:underline dark:text-brand-400">
                    {topic?.name}
                  </Link>
                </summary>
                <div className="mt-3 space-y-1.5 text-sm">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`rounded px-2 py-1 ${
                        oi === q.answerIndex
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : a.selectedIndex === oi
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{q.explanation}</p>
                  <div className="flex gap-2 pt-1">
                    {status === "incorrect" && (
                      <Button size="sm" variant="ghost" onClick={() => addMistake({ questionId: q.id, topicId: q.topicId, subjectId: q.subjectId, category: "Conceptual mistake" })}>
                        Add to Mistake Book
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => addBookmark({ kind: "question", refId: q.id, subjectId: q.subjectId, topicId: q.topicId, title: q.question.slice(0, 60) })}>
                      Bookmark
                    </Button>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
