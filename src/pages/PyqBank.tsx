import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { PageHeader, Card, Button, EmptyState } from "../components/ui/Primitives";
import { ALL_QUESTIONS, getPyqBank, getYearsAvailable, filterQuestions } from "../data/questions";
import { SUBJECTS } from "../data/syllabus";
import type { SubjectId } from "@/types";

export default function PyqBank() {
  const navigate = useNavigate();
  const [subjectId, setSubjectId] = useState<SubjectId | "all">("all");
  const [year, setYear] = useState<number | "all">("all");

  const bank = getPyqBank(ALL_QUESTIONS);
  const years = getYearsAvailable(bank);
  const filtered = filterQuestions(
    { subjectId: subjectId === "all" ? undefined : subjectId, year: year === "all" ? undefined : year, type: ["verified-pyq", "unverified-pyq"] },
    ALL_QUESTIONS,
  );

  return (
    <div>
      <PageHeader title="PYQ Bank" description="Genuine, source-checked previous-year questions only." />

      <Card className="mb-6 flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
        <ShieldAlert size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">This bank is empty by design, not by accident.</p>
          <p className="mt-1 text-amber-700 dark:text-amber-400">
            To keep this section trustworthy, a question only appears here once its exact wording, year and shift have been checked against a real source — this app never
            labels a written-to-match-the-pattern practice question as a genuine PYQ. Right now, none have been added. Once real, sourced questions are added with
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50"> type: "verified-pyq"</code> (or <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">"unverified-pyq"</code> if the source can't be fully confirmed), they'll show up here automatically.
          </p>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value as SubjectId | "all")} className="rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
          <option value="all">All subjects</option>
          {SUBJECTS.filter((s) => s.tier === "Tier 1").map((s) => (
            <option key={s.id} value={s.id}>
              {s.shortName}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))} className="rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No PYQs match yet"
          description="In the meantime, the Practice Engine has SSC-style questions (clearly labeled as practice, not PYQs) plus literally unlimited procedurally-generated ones for the higher-weightage Quant & Reasoning topics."
          action={<Button onClick={() => navigate("/practice")}>Go to Practice</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <Card key={q.id} className="p-4 text-sm">
              <p className="text-slate-800 dark:text-slate-100">{q.question}</p>
              <p className="mt-1 text-xs text-slate-400">
                {q.year} {q.shift} · {q.sourceReference ?? "source pending"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
