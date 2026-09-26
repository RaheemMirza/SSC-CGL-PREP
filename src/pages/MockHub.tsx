import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { PageHeader, Card, Button } from "../components/ui/Primitives";
import { useSessionStore } from "../store/useSessionStore";
import { useDataStore } from "../store/useDataStore";
import { TIER1_CONFIG } from "../data/examConfig";
import { getSubjectById } from "../data/syllabus";
import { colorClassesFor, iconFor } from "../lib/ui/subjectTheme";
import type { SubjectId } from "@/types";

export default function MockHub() {
  const navigate = useNavigate();
  const startMockTier1 = useSessionStore((s) => s.startMockTier1);
  const startMockSubject = useSessionStore((s) => s.startMockSubject);
  const mockResults = useDataStore((s) => s.mockResults);
  const [localError, setLocalError] = useState<string | null>(null);

  function launchFull() {
    startMockTier1();
    const err = useSessionStore.getState().error;
    if (err) setLocalError(err);
    else navigate("/mock/run");
  }

  function launchSubject(subjectId: SubjectId) {
    startMockSubject(subjectId);
    const err = useSessionStore.getState().error;
    if (err) setLocalError(err);
    else navigate("/mock/run");
  }

  const sorted = [...mockResults].sort((a, b) => b.completedAt - a.completedAt);

  return (
    <div>
      <PageHeader title="Mock Tests" description="Same section count, timing and marking scheme as the real Tier 1 paper — built fresh from your practice pool every time, so you can take it as many times as you want." />

      {localError && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{localError}</div>}

      <Card className="mb-6 flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Full Tier 1 mock</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Clock size={14} /> {TIER1_CONFIG.totalQuestions} questions · {TIER1_CONFIG.totalDurationMinutes} minutes · +2 / −0.5 marking · independent 15-min section locks
          </p>
        </div>
        <Button size="lg" onClick={launchFull}>
          Start mock <ArrowRight size={16} />
        </Button>
      </Card>

      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Single-subject drill</h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Same marking scheme as the full mock, just one section — good when you only have 15 minutes.</p>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIER1_CONFIG.sections.map((sec) => {
          const subject = getSubjectById(sec.subjectId);
          const colors = colorClassesFor(subject?.color ?? "brand");
          const Icon = iconFor(subject?.icon ?? "Calculator");
          return (
            <Card key={sec.id} className="p-4">
              <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bgSoft} ${colors.text}`}>
                <Icon size={13} />
                {subject?.shortName ?? sec.subjectId}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{sec.questions} questions · {sec.sectionalTimeMinutes} min</p>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => launchSubject(sec.subjectId as SubjectId)}>
                Start
              </Button>
            </Card>
          );
        })}
      </div>

      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">History</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No mocks taken yet.</p>
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {sorted.map((m) => (
            <Link key={m.id} to={`/mock/results/${m.id}`} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">{new Date(m.completedAt).toLocaleString()}</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {m.totalMarks}/{m.maxMarks}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{m.accuracy}% acc · {m.attemptRate}% attempted</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
