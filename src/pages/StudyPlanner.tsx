import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { PageHeader, Card, Button } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { SUBJECTS } from "../data/syllabus";
import type { StudyPlanInputs, SubjectId } from "@/types";

const TIER1_IDS: SubjectId[] = ["quant", "reasoning", "english", "ga"];

export default function StudyPlanner() {
  const studyPlan = useDataStore((s) => s.studyPlan);
  const planItems = useDataStore((s) => s.planItems);
  const setStudyPlanInputs = useDataStore((s) => s.setStudyPlanInputs);
  const regeneratePlan = useDataStore((s) => s.regeneratePlan);
  const togglePlanItemDone = useDataStore((s) => s.togglePlanItemDone);

  const [examDate, setExamDate] = useState(studyPlan?.examDate ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(studyPlan?.dailyMinutes ?? 60);
  const [level, setLevel] = useState<StudyPlanInputs["level"]>(studyPlan?.level ?? "intermediate");
  const [weakSubjects, setWeakSubjects] = useState<SubjectId[]>(studyPlan?.weakSubjects ?? []);

  function toggleWeak(id: SubjectId) {
    setWeakSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function submit() {
    setStudyPlanInputs({ examDate: examDate || null, dailyMinutes, level, targetScore: null, strongSubjects: TIER1_IDS.filter((id) => !weakSubjects.includes(id)), weakSubjects });
  }

  return (
    <div>
      <PageHeader title="Study Planner" description="Regenerate any time — it always reads your latest weak topics and due revisions." />

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

      {planItems.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Today's plan ({planItems.reduce((s, i) => s + i.minutesAllocated, 0)} min)</h2>
            <Button size="sm" variant="secondary" onClick={regeneratePlan}>
              <RefreshCw size={14} /> Regenerate
            </Button>
          </div>
          <div className="space-y-2">
            {planItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <button onClick={() => togglePlanItemDone(item.id)} className="mt-0.5 shrink-0">
                  {item.done ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.done ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"}`}>
                    {item.action} · {item.topicName ?? item.subjectId} <span className="text-xs font-normal text-slate-400">({item.minutesAllocated}m)</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
                {item.topicId && (
                  <Link to={`/topic/${item.topicId}`} className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                    Go →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
