import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Target, Shuffle, BookOpen } from "lucide-react";
import { PageHeader, Card, Button } from "../components/ui/Primitives";
import { useSessionStore } from "../store/useSessionStore";
import { SUBJECTS } from "../data/syllabus";
import { colorClassesFor, iconFor } from "../lib/ui/subjectTheme";

const COUNT_OPTIONS = [10, 15, 20, 30];

export default function PracticeHub() {
  const navigate = useNavigate();
  const [count, setCount] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const startPracticeAllMixed = useSessionStore((s) => s.startPracticeAllMixed);
  const startPracticeSubjectMixed = useSessionStore((s) => s.startPracticeSubjectMixed);
  const startWeakAreaPractice = useSessionStore((s) => s.startWeakAreaPractice);

  function run(action: () => void) {
    setError(null);
    action();
    const err = useSessionStore.getState().error;
    if (err) setError(err);
    else navigate("/practice/run");
  }

  return (
    <div>
      <PageHeader title="Practice" description="Untimed, no lock-out — blended from the static bank and the procedural generators so it never runs out." />

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

      <div className="mb-5 flex items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Question count:</span>
        {COUNT_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setCount(n)}
            className={`rounded-full px-3 py-1 font-medium ${count === n ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <Shuffle size={18} className="mb-2 text-brand-600" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Quick mixed quiz</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A blend across all four Tier 1 subjects — good as a daily warm-up or a diagnostic.</p>
          <Button className="mt-4 w-full" onClick={() => run(() => startPracticeAllMixed(count, "quick"))}>
            Start
          </Button>
        </Card>

        <Card className="p-5">
          <Target size={18} className="mb-2 text-rose-500" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Weak-area practice</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pulled straight from your dashboard's weak-topic list — nothing to configure.</p>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => run(() => startWeakAreaPractice(count))}>
            Start
          </Button>
        </Card>

        <Card className="p-5">
          <BookOpen size={18} className="mb-2 text-teal-600" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Pick a specific topic</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse the syllabus and practice one topic at a time.</p>
          <Link to="/syllabus">
            <Button className="mt-4 w-full" variant="secondary">
              Browse syllabus
            </Button>
          </Link>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 font-semibold text-slate-900 dark:text-slate-100">By subject</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SUBJECTS.filter((s) => s.tier === "Tier 1").map((subject) => {
          const colors = colorClassesFor(subject.color);
          const Icon = iconFor(subject.icon);
          return (
            <Card key={subject.id} className="p-4">
              <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bgSoft} ${colors.text}`}>
                <Icon size={13} />
                {subject.shortName}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subject.description}</p>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => run(() => startPracticeSubjectMixed(subject.id, count, "mixed"))}>
                Practice
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
