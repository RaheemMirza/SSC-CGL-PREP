import { useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader, Card, Badge } from "../components/ui/Primitives";
import { search } from "../lib/search";
import { ALL_TOPICS, getTopicById } from "../data/syllabus";
import { FORMULAS } from "../data/formulas";
import { ALL_QUESTIONS, getPyqBank } from "../data/questions";
import { useDataStore } from "../store/useDataStore";

const KIND_LABEL: Record<string, string> = { topic: "Topic", formula: "Formula", bookmark: "Bookmark", mistake: "Mistake", pyq: "PYQ", note: "Note", practice: "Practice" };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const bookmarks = useDataStore((s) => s.bookmarks);
  const mistakes = useDataStore((s) => s.mistakes);

  const results = search(query, {
    topics: ALL_TOPICS,
    formulas: FORMULAS,
    bookmarks,
    mistakes,
    pyqQuestions: getPyqBank(ALL_QUESTIONS),
    topicNameLookup: (id) => getTopicById(id)?.name ?? id,
  });

  return (
    <div>
      <PageHeader title="Search" />
      <div className="mb-6 flex items-center gap-2 rounded-xl2 border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <SearchIcon size={18} className="text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, formulas, bookmarks, mistakes…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {query.length >= 2 && (
        <div className="space-y-2">
          {results.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No matches.</p>}
          {results.map((r) => (
            <Link key={`${r.kind}-${r.id}`} to={r.route} className="block">
              <Card className="p-4">
                <Badge className="mb-1.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{KIND_LABEL[r.kind]}</Badge>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.title}</p>
                {r.subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.subtitle}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
