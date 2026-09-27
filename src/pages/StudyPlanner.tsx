import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { PageHeader, Card, Button } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { useSessionStore } from "../store/useSessionStore";
import { SUBJECTS, getSubjectById } from "../data/syllabus";
import type { PlanItem, StudyPlanInputs, SubjectId } from "@/types";

const TIER1_IDS: SubjectId[] = ["quant", "reasoning", "english", "ga"];
const ACTION_LABEL: Record<PlanItem["action"], string> = {
  learn: "Learn",
  practice: "Practice",
  revise: "Revise",
  test: "Full mock",
  "mixed-quiz": "Mixed quiz",
  pyq: "PYQ practice",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function StudyPlanner() {
  const navigate = useNavigate();
  const studyPlan = useDataStore((s) => s.studyPlan);
  const planItems = useDataStore((s) => s.planItems);
  const setStudyPlanInputs = useDataStore((s) => s.setStudyPlanInputs);
  const regeneratePlan = useDataStore((s) => s.regeneratePlan);
  const togglePlanItemDone = useDataStore((s) => s.togglePlanItemDone);

  const startPracticeSubjectMixed = useSessionStore((s) => s.startPracticeSubjectMixed);
  const startMockTier1 = useSessionStore((s) => s.startMockTier1);

  const [examDate, setExamDate] = useState(studyPlan?.examDate ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(studyPlan?.dailyMinutes ?? 60);
  const [level, setLevel] = useState<StudyPlanInputs["level"]>(studyPlan?.level ?? "intermediate");
  const [weakSubjects, setWeakSubjects] = useState<SubjectId[]>(studyPlan?.weakSubjects ?? []);
  const [justRegenerated, setJustRegenerated] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, PlanItem[]>();
    for (const item of planItems) map.set(item.date, [...(map.get(item.date) ?? []), item]);
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [planItems]);

  function toggleWeak(id: SubjectId) {
    setWeakSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function submit() {
    setStudyPlanInputs({ examDate: examDate || null, dailyMinutes, level, targetScore: null, strongSubjects: TIER1_IDS.filter((id) => !weakSubjects.includes(id)), weakSubjects });
  }

  function regenerate() {
    regeneratePlan();
    setJustRegenerated(true);
    setTimeout(() => setJustRegenerated(false), 2000);
  }

  /** Every plan item type gets a real action — not just topic-linked ones.
   * This is what "opening" a plan item actually does. */
  function startItem(item: PlanItem) {
    if (item.topicId) {
      navigate(`/topic/${item.topicId}`);
      return;
    }
    if (item.action === "test") {
      startMockTier1();
      const err = useSessionStore.getState().error;
      if (!err) navigate("/mock/run");
      return;
    }
    // mixed-quiz / practice / pyq with no specific topic — a subject drill.
    startPracticeSubjectMixed(item.subjectId, Math.max(10, Math.round(item.minutesAllocated / 1.2)), "mixed");
    const err = useSessionStore.getState().error;
    if (!err) navigate("/practice/run");
  }

  const today = todayIso();

  return (
    <div>
      <PageHeader title="Study Planner" description="A real rolling calendar — up to 14 days, or however many are left until your exam if that's sooner. Regenerate any time to pull in your latest progress." />

      <Card className="mb-6 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-slate-500 dark:text-slate-400">Exam date (optional)</span>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500 dark:text-slate-400">Daily minutes available</span>
            <input type="number" min={15} step={15} value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500 dark:text-slate-400">Level</span>
            <select value={level} onChange={(e) => setLevel(e.target.value as StudyPlanInputs["level"])} className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <div className="text-sm">
            <span className="mb-1 block text-slate-500 dark:text-slate-400">Subjects you'd call weak</span>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.filter((s) => TIER1_IDS.includes(s.id)).map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleWeak(s.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${weakSubjects.includes(s.id) ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                >
                  {s.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button className="mt-4" onClick={submit}>
          {studyPlan ? "Update plan" : "Generate plan"}
        </Button>
      </Card>

      {byDate.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Your plan ({byDate.length} day{byDate.length > 1 ? "s" : ""})
            </h2>
            <Button size="sm" variant="secondary" onClick={regenerate}>
              <RefreshCw size={14} /> {justRegenerated ? "Regenerated ✓" : "Regenerate"}
            </Button>
          </div>

          <div className="space-y-3">
            {byDate.map(([date, items]) => {
              const isToday = date === today;
              const totalMinutes = items.reduce((s, i) => s + i.minutesAllocated, 0);
              const doneCount = items.filter((i) => i.done).length;
              return (
                <details key={date} open={isToday} className="rounded-xl2 border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <summary className="flex cursor-pointer items-center gap-3 px-4 py-3">
                    <span className={`text-sm font-semibold ${isToday ? "text-brand-600 dark:text-brand-400" : "text-slate-800 dark:text-slate-100"}`}>
                      {isToday ? "Today" : new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="text-xs text-slate-400">
                      {items.length} item{items.length > 1 ? "s" : ""} · {totalMinutes} min · {doneCount}/{items.length} done
                    </span>
                  </summary>
                  <div className="space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                        <button onClick={() => togglePlanItemDone(item.id)} className="mt-0.5 shrink-0">
                          {item.done ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.done ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"}`}>
                            {ACTION_LABEL[item.action]} · {item.topicName ?? getSubjectById(item.subjectId)?.shortName ?? item.subjectId}{" "}
                            <span className="text-xs font-normal text-slate-400">({item.minutesAllocated}m)</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                        </div>
                        <Button size="sm" variant="secondary" className="shrink-0" onClick={() => startItem(item)}>
                          <PlayCircle size={14} /> Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
