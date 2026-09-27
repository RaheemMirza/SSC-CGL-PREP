import { useNavigate, useParams, Link } from "react-router-dom";
import { Sparkles, BookmarkPlus, PlayCircle, CalendarClock, Lightbulb, ListChecks, AlertOctagon, Zap } from "lucide-react";
import { PageHeader, Card, Button, Badge, StatTile, EmptyState } from "../components/ui/Primitives";
import { getTopicById, getChapterById, getSubjectById } from "../data/syllabus";
import { hasGenerator } from "../lib/generators";
import { getLessonContent } from "../data/content";
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
  const lesson = getLessonContent(topic.id);

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
        <Badge
          className={
            topic.priority === "must"
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              : topic.priority === "should"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }
        >
          {topic.priority === "must" ? "Must-do" : topic.priority === "should" ? "Should-do" : "Could-do"}
        </Badge>
        {infinite && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Sparkles size={12} /> Infinite practice
          </Badge>
        )}
        {!lesson && <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Light content — full lesson not authored yet</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {lesson && (
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-brand-600" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">What this topic is</h2>
              </div>
              <div className="space-y-2">
                {lesson.whatIsIt.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {para}
                  </p>
                ))}
              </div>

              {lesson.quickRevision.length > 0 && (
                <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-900/20">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                    <ListChecks size={13} /> Key points to remember
                  </p>
                  <ul className="space-y-1.5">
                    {lesson.quickRevision.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm text-brand-900 dark:text-brand-100">
                        <span className="text-brand-400">•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lesson.keyFormulas && lesson.keyFormulas.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Key formulas &amp; facts</p>
                  <div className="space-y-2">
                    {lesson.keyFormulas.map((f, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                        <p className="font-mono text-xs text-slate-800 dark:text-slate-100">{f.formula}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.workedExamples && lesson.workedExamples.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Worked example</p>
                  {lesson.workedExamples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <p className="text-sm text-slate-800 dark:text-slate-100">{ex.problem}</p>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{ex.solution}</p>
                    </div>
                  ))}
                </div>
              )}

              {lesson.sscShortcuts && lesson.sscShortcuts.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Zap size={13} /> SSC shortcuts
                  </p>
                  <ul className="space-y-1">
                    {lesson.sscShortcuts.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-emerald-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lesson.commonTraps && lesson.commonTraps.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <AlertOctagon size={13} /> Common traps
                  </p>
                  <ul className="space-y-1">
                    {lesson.commonTraps.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-rose-500">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

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
