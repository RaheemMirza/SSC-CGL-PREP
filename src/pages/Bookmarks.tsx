import { useNavigate, Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { PageHeader, Card, Button, EmptyState, Badge } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { resolveQuestion } from "../lib/questionResolver";

const KIND_LABEL: Record<string, string> = { question: "Question", concept: "Concept", formula: "Formula", fact: "Fact" };
const KIND_ROUTE: Record<string, (refId: string, topicId?: string) => string> = {
  question: (_refId, topicId) => (topicId ? `/topic/${topicId}` : "/practice"),
  concept: (refId) => `/topic/${refId}`,
  formula: (refId) => `/formulas?highlight=${refId}`,
  fact: (refId, topicId) => (topicId ? `/topic/${topicId}` : "/syllabus"),
};

export default function Bookmarks() {
  const navigate = useNavigate();
  const bookmarks = useDataStore((s) => s.bookmarks);
  const removeBookmark = useDataStore((s) => s.removeBookmark);

  return (
    <div>
      <PageHeader title="Bookmarks" description="Anything you've saved from a practice session, mock review, or topic page." />

      {bookmarks.length === 0 ? (
        <EmptyState title="No bookmarks yet" description="Tap Bookmark on any question or topic to save it here." action={<Button onClick={() => navigate("/practice")}>Go practice</Button>} />
      ) : (
        <div className="space-y-2">
          {[...bookmarks].sort((a, b) => b.createdAt - a.createdAt).map((b) => {
            const question = b.kind === "question" ? resolveQuestion(b.refId) : null;
            return (
              <Card key={b.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <Badge className="mb-1.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{KIND_LABEL[b.kind]}</Badge>
                  <Link to={KIND_ROUTE[b.kind](b.refId, b.topicId)} className="block text-sm font-medium text-slate-800 hover:underline dark:text-slate-100">
                    {question ? question.question : b.title}
                  </Link>
                  {b.note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{b.note}</p>}
                  <p className="mt-1 text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => removeBookmark(b.id)} className="shrink-0 text-slate-300 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
