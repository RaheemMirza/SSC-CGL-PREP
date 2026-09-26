import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useSessionStore } from "../../store/useSessionStore";
import { useDataStore } from "../../store/useDataStore";
import { Button } from "../ui/Primitives";
import { buildPalette, currentQuestionId, currentSection } from "../../lib/sessionRuntime";
import { getTopicById } from "../../data/syllabus";
import { colorClassesFor, SUBJECT_FALLBACK_COLOR } from "../../lib/ui/subjectTheme";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamRunner({ resultsPath }: { resultsPath: string }) {
  const navigate = useNavigate();
  const active = useSessionStore((s) => s.active);
  const questions = useSessionStore((s) => s.questions);
  const skippedSections = useSessionStore((s) => s.skippedSections);
  const tick = useSessionStore((s) => s.tick);
  const selectAnswer = useSessionStore((s) => s.selectAnswer);
  const clearAnswer = useSessionStore((s) => s.clearAnswer);
  const toggleMarkForReview = useSessionStore((s) => s.toggleMarkForReview);
  const goToQuestion = useSessionStore((s) => s.goToQuestion);
  const nextQuestion = useSessionStore((s) => s.nextQuestion);
  const prevQuestion = useSessionStore((s) => s.prevQuestion);
  const finishSection = useSessionStore((s) => s.finishSection);
  const submit = useSessionStore((s) => s.submit);
  const addBookmark = useDataStore((s) => s.addBookmark);
  const addMistake = useDataStore((s) => s.addMistake);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || active.submitted) return;
    intervalRef.current = window.setInterval(() => tick(), 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.submitted]);

  useEffect(() => {
    if (active?.submitted) navigate(resultsPath);
  }, [active?.submitted, navigate, resultsPath]);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="text-slate-400" />
        <p className="text-slate-500 dark:text-slate-400">No session is running right now.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const section = currentSection(active);
  const qid = currentQuestionId(active);
  const question = qid ? questions[qid] : null;
  const answer = qid ? active.answers[qid] : null;
  const topic = question ? getTopicById(question.topicId) : null;
  const subjectColor = colorClassesFor(question ? SUBJECT_FALLBACK_COLOR[question.subjectId] : "brand");
  const isMock = active.mode === "mock";

  return (
    <div>
      {skippedSections.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
          Not simulated here: {skippedSections.map((s) => s.name).join(", ")}.
        </div>
      )}

      {/* Section bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl2 border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        {active.sections.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
              i === active.currentSectionIndex
                ? "bg-brand-600 text-white"
                : s.locked
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {s.name}
            {s.timeLimitSeconds > 0 && (
              <span className="tabular">{i === active.currentSectionIndex ? formatTime(s.timeRemainingSeconds) : s.locked ? "done" : formatTime(s.timeLimitSeconds)}</span>
            )}
          </div>
        ))}
        <Button size="sm" variant="danger" className="ml-auto" onClick={submit}>
          Submit test
        </Button>
      </div>

      {!question || !section ? (
        <p className="text-slate-500">This section has no questions.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-xl2 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${subjectColor.bgSoft} ${subjectColor.text}`}>
                {topic?.name ?? question.subjectId} · {question.difficulty}
              </span>
              <button
                onClick={() => qid && toggleMarkForReview(qid)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  answer?.markedForReview ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                <Flag size={12} />
                {answer?.markedForReview ? "Marked" : "Mark for review"}
              </button>
            </div>

            <p className="mb-5 text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">{question.question}</p>

            <div className="space-y-2">
              {question.options.map((opt, i) => {
                const selected = answer?.selectedIndex === i;
                return (
                  <button
                    key={i}
                    disabled={section.locked}
                    onClick={() => qid && selectAnswer(qid, i)}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
                        : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${selected ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 text-slate-400"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={prevQuestion} disabled={active.currentQuestionIndex === 0}>
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button size="sm" variant="secondary" onClick={nextQuestion} disabled={active.currentQuestionIndex === section.questionIds.length - 1}>
                Next <ChevronRight size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => qid && clearAnswer(qid)} disabled={section.locked}>
                Clear response
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => question && addBookmark({ kind: "question", refId: question.id, subjectId: question.subjectId, topicId: question.topicId, title: question.question.slice(0, 60) })}
              >
                Bookmark
              </Button>
              {!isMock && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => question && addMistake({ questionId: question.id, topicId: question.topicId, subjectId: question.subjectId, category: "Conceptual mistake" })}
                >
                  Log as mistake
                </Button>
              )}
              <Button size="sm" className="ml-auto" onClick={finishSection}>
                {active.currentSectionIndex === active.sections.length - 1 ? "Submit test" : "Submit section & continue"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl2 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-medium text-slate-400">{section.name} · question palette</p>
            <div className="grid grid-cols-5 gap-1.5">
              {buildPalette(active, section).map((entry, i) => {
                const styles: Record<string, string> = {
                  "not-visited": "bg-slate-100 text-slate-400 dark:bg-slate-800",
                  unanswered: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
                  answered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                  "marked-for-review": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
                  "answered-and-marked": "bg-violet-200 text-violet-800 dark:bg-violet-800/50 dark:text-violet-200",
                };
                return (
                  <button
                    key={entry.questionId}
                    onClick={() => goToQuestion(i)}
                    className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium ${styles[entry.status]} ${
                      i === active.currentQuestionIndex ? "ring-2 ring-brand-500" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Legend swatch="bg-emerald-100 dark:bg-emerald-900/40" label="Answered" />
              <Legend swatch="bg-rose-100 dark:bg-rose-900/40" label="Visited, unanswered" />
              <Legend swatch="bg-violet-100 dark:bg-violet-900/40" label="Marked for review" />
              <Legend swatch="bg-slate-100 dark:bg-slate-800" label="Not visited" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${swatch}`} />
      {label}
    </div>
  );
}
