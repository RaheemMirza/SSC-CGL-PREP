import { useNavigate, useParams, Link } from "react-router-dom";
import { Sparkles, BookmarkPlus, PlayCircle, CalendarClock } from "lucide-react";
import { PageHeader, Card, Button, Badge, StatTile, EmptyState } from "../components/ui/Primitives";
import { getTopicById, getChapterById, getSubjectById } from "../data/syllabus";
import { hasGenerator } from "../lib/generators";
import { useDataStore } from "../store/useDataStore";
import { useSessionStore } from "../store/useSessionStore";
import { getFormulasBySubject } from "../data/formulas";
import { getNextStage, REVISION_STAGE_LABEL } from "../lib/revisionScheduler";
import { colorClassesFor, iconFor } from "../lib/ui/subjectTheme";

export default function TopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topic = topicId ? getTopicById(topicId) : undefined;
  const topicProgress = useDataStore((s) => s.topicProgress);
  const revisionSchedules = useDataStore((s) => s.revisionSchedules);
  const mistakes = useDataStore((s) => s.mistakes);
  const isBookmarked = useDataStore((s) => s.isBookmarked);
  const addBookmark = useDataStore((s) => s.addBookmark);
  const markTopicLearned = useDataStore((s) => s.markTopicLearned);
  const advanceRevisionStage = useDataStore((s) => s.advanceRevisionStage);
  const startPracticeTopic = useSessionStore((s) => s.startPracticeTopic);

  if (!topic) {
    return (
      <EmptyState title="Topic not found" description="That topic doesn't exist in the syllabus." action={<Button onClick={() => navigate("/syllabus")}>Back to syllabus</Button>} />
    );
  }

  const chapter = getChapterById(topic.chapterId);
  const subject = getSubjectById(topic.subjectId);
  const colors = colorClassesFor(subject?.color ?? "brand");
  const Icon = iconFor(subject?.icon ?? "Calculator");
  const progress = topicProgress[topic.id];
  const schedule = revisionSchedules[topic.id];
  const nextStage = schedule ? getNextStage(schedule) : null;
  const relatedFormulas = getFormulasBySubject(topic.subjectId).filter((f) => f.tags.some((t) => topic.tags.includes(t) || topic.slug === t));
  const relatedMistakes = mistakes.filter((m) => m.topicId === topic.id && !m.resolved);
  const bookmarked = isBookmarked(topic.id);
  const infinite = hasGenerator(topic.slug);

  function practice() {
    if (!topic) return;
    startPracticeTopic(topic, 15);
    const err = useSessionStore.getState().error;
    if (!err) navigate("/practice/run");
  }

  return (
    <div>
      <p className="mb-2 text-xs text-slate-400">
        {subject?.name} {chapter && <>· {chapter.name}</>}
      </p>
      <PageHeader
        title={topic.name}
        description={topic.summary}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => addBookmark({ kind: "concept", refId: topic.id, subjectId: topic.subjectId, topicId: topic.id, title: topic.name })} disabled={bookmarked}>
              <BookmarkPlus size={14} /> {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button size="sm" onClick={practice}>
              <PlayCircle size={14} /> Practice this topic
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bgSoft} ${colors.text}`}>
          <Icon size={13} /> {subject?.shortName}
        </span>
        <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{topic.difficultyTag}</Badge>
        {infinite && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Sparkles size={12} /> Infinite practice
          </Badge>
        )}
        {!topic.hasFullContent && <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Light content — full lesson not authored yet</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Your progress</h2>
            {!progress ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">You haven't practiced this topic yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Attempted" value={progress.attempted} />
                <StatTile label="Accuracy" value={`${Math.round((progress.correct / progress.attempted) * 100)}%`} />
                <StatTile label="Mastery" value={progress.masteryScore} />
                <StatTile label="Speed" value={progress.speed} />
              </div>
            )}
          </Card>

          {relatedFormulas.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Related formulas</h2>
              <div className="space-y-3">
                {relatedFormulas.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{f.title}</p>
                    {f.formula && <p className="mt-1 font-mono text-xs text-brand-600 dark:text-brand-400">{f.formula}</p>}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {relatedMistakes.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Open mistakes on this topic</h2>
              <div className="space-y-1.5">
                {relatedMistakes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{m.category}</span>
                    <span className="text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <Link to="/mistakes" className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                Open Mistake Book →
              </Link>
            </Card>
          )}
        </div>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock size={16} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Revision</h2>
          </div>
          {!schedule ? (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">Not on your revision schedule yet.</p>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => markTopicLearned(topic.id, topic.subjectId)}>
                Mark as learned
              </Button>
            </>
          ) : nextStage ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">{REVISION_STAGE_LABEL[nextStage.stage]}</p>
              <p className="text-xs text-slate-400">Due {new Date(nextStage.dueAt).toLocaleDateString()}</p>
              <Button size="sm" className="mt-3 w-full" onClick={() => advanceRevisionStage(topic.id)}>
                Mark this stage done
              </Button>
            </>
          ) : (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Revision schedule complete for this topic.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
