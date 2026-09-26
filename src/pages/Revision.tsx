import { useNavigate, Link } from "react-router-dom";
import { CalendarClock, SkipForward } from "lucide-react";
import { PageHeader, Card, Button, EmptyState } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { useSessionStore } from "../store/useSessionStore";
import { getDueRevisions, getUpcomingRevisions, REVISION_STAGE_LABEL } from "../lib/revisionScheduler";
import { getTopicById } from "../data/syllabus";

export default function Revision() {
  const navigate = useNavigate();
  const revisionSchedules = useDataStore((s) => s.revisionSchedules);
  const advanceRevisionStage = useDataStore((s) => s.advanceRevisionStage);
  const skipRevisionStage = useDataStore((s) => s.skipRevisionStage);
  const startPracticeTopic = useSessionStore((s) => s.startPracticeTopic);

  const due = getDueRevisions(revisionSchedules);
  const upcoming = getUpcomingRevisions(revisionSchedules, 7);
  const scheduled = Object.values(revisionSchedules);

  function revise(topicId: string) {
    const topic = getTopicById(topicId);
    if (!topic) return;
    startPracticeTopic(topic, 10);
    const err = useSessionStore.getState().error;
    if (!err) navigate("/practice/run");
  }

  if (scheduled.length === 0) {
    return (
      <EmptyState
        title="Nothing on your revision schedule yet"
        description="Mark a topic as learned (from its topic page) to put it on a 1 / 3 / 7 / 14 / 30-day spaced revision schedule."
        action={<Button onClick={() => navigate("/syllabus")}>Browse syllabus</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader title="Revision" description="Spaced-repetition staging: quick revision → practice → full revision → test → final revision." />

      <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <CalendarClock size={16} className="text-rose-500" /> Due now ({due.length})
      </h2>
      {due.length === 0 ? (
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Nothing overdue.</p>
      ) : (
        <div className="mb-6 space-y-2">
          {due.map((d) => {
            const topic = getTopicById(d.topicId);
            return (
              <Card key={d.topicId} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <Link to={`/topic/${d.topicId}`} className="text-sm font-medium text-slate-800 hover:underline dark:text-slate-100">
                    {topic?.name ?? d.topicId}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {REVISION_STAGE_LABEL[d.stage]} · {d.daysOverdue > 0 ? `${d.daysOverdue}d overdue` : "due today"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => skipRevisionStage(d.topicId)}>
                    <SkipForward size={14} /> Skip
                  </Button>
                  <Button size="sm" onClick={() => revise(d.topicId)}>
                    Revise now
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Coming up (next 7 days)</h2>
      {upcoming.length === 0 ? (
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Nothing scheduled in the next week.</p>
      ) : (
        <Card className="mb-6 divide-y divide-slate-100 dark:divide-slate-800">
          {upcoming.map((u) => {
            const topic = getTopicById(u.topicId);
            return (
              <div key={u.topicId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-700 dark:text-slate-200">{topic?.name ?? u.topicId}</span>
                <span className="text-slate-400">
                  {REVISION_STAGE_LABEL[u.stage]} · {new Date(u.dueAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </Card>
      )}

      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">All scheduled topics ({scheduled.length})</h2>
      <Card className="divide-y divide-slate-100 dark:divide-slate-800">
        {scheduled.map((s) => {
          const topic = getTopicById(s.topicId);
          const completedStages = s.stages.filter((st) => st.completedAt || st.skipped).length;
          return (
            <div key={s.topicId} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <Link to={`/topic/${s.topicId}`} className="text-slate-700 hover:underline dark:text-slate-200">
                {topic?.name ?? s.topicId}
              </Link>
              <span className="text-slate-400">{completedStages}/{s.stages.length} stages</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
