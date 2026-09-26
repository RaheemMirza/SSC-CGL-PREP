import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, Card } from "../components/ui/Primitives";
import { FORMULAS, getFormulaCategories } from "../data/formulas";
import { SUBJECTS } from "../data/syllabus";
import { colorClassesFor, iconFor } from "../lib/ui/subjectTheme";
import type { SubjectId } from "@/types";

export default function Formulas() {
  const [params] = useSearchParams();
  const highlight = params.get("highlight");
  const [subjectId, setSubjectId] = useState<SubjectId | "all">("all");

  const categories = getFormulaCategories(subjectId === "all" ? undefined : subjectId);
  const list = FORMULAS.filter((f) => subjectId === "all" || f.subjectId === subjectId);

  return (
    <div>
      <PageHeader title="Formulas & Shortcuts" description="A quick-recall reference — not a substitute for working through the topic pages." />

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setSubjectId("all")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${subjectId === "all" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
          All
        </button>
        {SUBJECTS.filter((s) => ["quant", "reasoning", "english"].includes(s.id)).map((s) => {
          const colors = colorClassesFor(s.color);
          const Icon = iconFor(s.icon);
          const active = subjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSubjectId(s.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${active ? `${colors.bg} text-white` : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
            >
              <Icon size={13} /> {s.shortName}
            </button>
          );
        })}
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.filter((f) => f.category === category).map((f) => (
              <Card key={f.id} id={f.id} className={`p-4 ${highlight === f.id ? "ring-2 ring-brand-500" : ""}`}>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{f.title}</p>
                {f.formula && <p className="mt-1.5 rounded bg-slate-50 px-2 py-1 font-mono text-xs text-brand-700 dark:bg-slate-800 dark:text-brand-300">{f.formula}</p>}
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{f.explanation}</p>
                {f.example && <p className="mt-1.5 text-xs italic text-slate-400">{f.example}</p>}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
