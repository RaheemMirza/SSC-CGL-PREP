import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, Sparkles, Award } from "lucide-react";
import { PageHeader, Card, Button, StatTile, ProgressBar, EmptyState } from "../components/ui/Primitives";
import { useSessionStore } from "../store/useSessionStore";
import { useDataStore } from "../store/useDataStore";
import { reconstructMockAnalysis, type MockAnalysisView } from "../lib/mockHistory";
import { BADGES } from "../lib/gamification";

export default function MockResults() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const liveResult = useSessionStore((s) => s.lastMockResult);
  const sessions = useDataStore((s) => s.sessions);
  const mockResults = useDataStore((s) => s.mockResults);
  const addMistake = useDataStore((s) => s.addMistake);
  const addBookmark = useDataStore((s) => s.addBookmark);

  let analysis: MockAnalysisView | null = null;
  let xpEarned: number | null = null;
  let newBadgeIds: string[] = [];

  if (resultId) {
    const result = mockResults.find((m) => m.id === resultId);
    const session = result ? sessions.find((s) => s.id === result.blueprintId) : undefined;
    if (result && session) analysis = reconstructMockAnalysis(result, session);
  } else if (liveResult) {
    analysis = liveResult;
    xpEarned = liveResult.xpEarned;
    newBadgeIds = liveResult.newBadgeIds;
  }

  if (!analysis) {
    return (
      <EmptyState
        title="No result to show"
        description="Finish a mock, or open one from your history, to see its results here."
        action={
          <Button onClick={() => navigate("/mock")}>Go to Mock Tests</Button>
        }
      />
    );
  }

  const { result, breakdown, focusAreas, timeUsage, questions, session } = analysis;

  return (
    <div>
      <PageHeader
        title="Mock results"
        description={new Date(result.completedAt).toLocaleString()}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/mock")}>
              Back to Mock Tests
            </Button>
          </>
        }
      />

      {xpEarned !== null && (
        <Card className="mb-6 flex items-center gap-3 border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
          <Sparkles size={18} className="text-brand-600" />
          <p className="text-sm font-medium text-brand-800 dark:text-brand-200">+{xpEarned} XP earned this attempt.</p>
          {newBadgeIds.length > 0 && (
            <div className="ml-auto flex gap-2">
              {newBadgeIds.map((id) => {
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
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Marks" value={`${result.totalMarks}/${result.maxMarks}`} />
        <StatTile label="Accuracy" value={`${result.accuracy}%`} />
        <StatTile label="Attempted" value={`${result.attemptRate}%`} />
        <StatTile label="Avg time / Q" value={`${result.averageTimePerQuestion}s`} />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Section breakdown</h2>
        <div className="space-y-3">
          {result.sectionResults.map((sr) => {
            const usage = timeUsage.find((u) => u.sectionId === sr.sectionId);
            return (
              <div key={sr.sectionId} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">{usage?.name ?? sr.sectionId}</span>
                  <span className="text-slate-500 dark:text-slate-400">{sr.marksScored} marks</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} /> {sr.correct}</span>
                  <span className="flex items-center gap-1 text-rose-500"><XCircle size={12} /> {sr.incorrect}</span>
                  <span className="flex items-center gap-1 text-slate-400"><MinusCircle size={12} /> {sr.unattempted}</span>
                  {usage && usage.timeLimitSeconds > 0 && (
                    <span className="ml-auto">
                      {Math.round(usage.timeUsedSeconds / 60)}m / {Math.round(usage.timeLimitSeconds / 60)}m ({usage.utilisation}%)
                    </span>
                  )}
                </div>
                {usage && usage.timeLimitSeconds > 0 && <ProgressBar value={usage.utilisation} className={usage.utilisation > 100 ? "bg-rose-500" : "bg-brand-500"} />}
              </div>
            );
          })}
        </div>
      </Card>

      {focusAreas.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Focus on next</h2>
          <div className="space-y-2">
            {focusAreas.map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm dark:border-slate-800">
                <div>
                  <span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${f.kind === "accuracy" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>
                    {f.kind === "accuracy" ? "Accuracy" : "Speed"}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{f.topicName}</span>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{f.reason}</p>
                </div>
                <Link to={`/topic/${f.topicId}`} className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Practice →
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Topic breakdown</h2>
        <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {breakdown.map((t) => (
            <div key={t.topicId} className="flex items-center justify-between text-sm">
              <Link to={`/topic/${t.topicId}`} className="text-slate-700 hover:underline dark:text-slate-200">
                {t.topicName}
              </Link>
              <span className="text-slate-500 dark:text-slate-400">
                {t.correct}/{t.attempted} · {t.avgTimeSeconds}s ({t.speedFlag})
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Full review</h2>
        <div className="space-y-2">
          {session.questionIds.map((qid, i) => {
            const q = questions[qid];
            if (!q) return null;
            const a = session.attempts[qid];
            const status = !a || a.selectedIndex === null ? "unattempted" : a.correct ? "correct" : "incorrect";
            return (
              <details key={qid} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <summary className="flex cursor-pointer items-center gap-2 text-sm">
                  <span className="text-slate-400">{i + 1}.</span>
                  {status === "correct" && <CheckCircle2 size={14} className="text-emerald-500" />}
                  {status === "incorrect" && <XCircle size={14} className="text-rose-500" />}
                  {status === "unattempted" && <MinusCircle size={14} className="text-slate-400" />}
                  <span className="line-clamp-1 text-slate-700 dark:text-slate-200">{q.question}</span>
                </summary>
                <div className="mt-3 space-y-1.5 text-sm">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`rounded px-2 py-1 ${
                        oi === q.answerIndex
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : a?.selectedIndex === oi
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{q.explanation}</p>
                  {a && <p className="text-xs text-slate-400">Time taken: {a.timeTakenSeconds}s</p>}
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
