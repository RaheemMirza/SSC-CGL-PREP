import { Link, useNavigate } from "react-router-dom";
import { Flame, Trophy, Target, Clock, ArrowRight, TrendingDown, TrendingUp, Sparkles } from "lucide-react";
import { PageHeader, Card, Button, StatTile, EmptyState, ProgressBar } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { useSessionStore } from "../store/useSessionStore";
import {
  getWeakTopics,
  getSlowTopics,
  computeSpeedTrend,
  computeSubjectBreakdown,
  generateRecommendations,
} from "../lib/adaptiveEngine";
import { getDueRevisions } from "../lib/revisionScheduler";
import { getTopicById, getSubjectById } from "../data/syllabus";
import { colorClassesFor, iconFor } from "../lib/ui/subjectTheme";

export default function Dashboard() {
  const navigate = useNavigate();
  const { attempts, topicProgress, gamification, mockResults, revisionSchedules } = useDataStore();
  const startWeakAreaPractice = useSessionStore((s) => s.startWeakAreaPractice);

  const totalAttempted = attempts.filter((a) => a.correct !== null).length;
  const nameOf = (topicId: string) => getTopicById(topicId)?.name ?? topicId;

  if (totalAttempted === 0) {
    return (
      <div>
        <PageHeader title="Welcome" description="Nothing logged yet — start with a quick mixed quiz or jump straight into a full mock, and this page will fill in with your real numbers." />
        <EmptyState
          title="No practice data yet"
          description="Every stat on this dashboard is built from questions you've actually answered. Take a short diagnostic to get started."
          action={
            <div className="flex gap-2">
              <Button onClick={() => navigate("/practice")}>Start a quick quiz</Button>
              <Button variant="secondary" onClick={() => navigate("/mock")}>
                Take a full mock
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const weak = getWeakTopics(topicProgress, 5);
  const slow = getSlowTopics(topicProgress, 4);
  const due = getDueRevisions(revisionSchedules);
  const subjectBreakdown = computeSubjectBreakdown(attempts);
  const speedTrend = computeSpeedTrend(attempts);
  const recommendations = generateRecommendations(topicProgress, nameOf);
  const recentMocks = [...mockResults].sort((a, b) => b.completedAt - a.completedAt).slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Built entirely from your own logged attempts — nothing here is a placeholder."
        actions={
          <Button onClick={() => navigate("/mock")}>
            Take a mock <ArrowRight size={16} />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Streak" value={<span className="flex items-center gap-1.5"><Flame size={18} className="text-amber-500" />{gamification.streakDays}d</span>} />
        <StatTile label="XP" value={gamification.xp} sub={`${gamification.badgesEarned.length} badges`} />
        <StatTile label="Questions solved" value={gamification.questionsSolved} />
        <StatTile label="Topics mastered" value={gamification.topicsMastered} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">What to do next</h2>
            </div>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.reason}</p>
                  </div>
                  {r.topicId ? (
                    <Link to={`/topic/${r.topicId}`} className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                      Go →
                    </Link>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => navigate(r.kind === "get-started" ? "/practice" : "/mock")}>
                      Go
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Subject accuracy</h2>
            <div className="space-y-4">
              {subjectBreakdown.map((s) => {
                const subject = getSubjectById(s.subjectId);
                const colors = colorClassesFor(subject?.color ?? "brand");
                const Icon = iconFor(subject?.icon ?? "Calculator");
                return (
                  <div key={s.subjectId}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                        <Icon size={14} className={colors.text} /> {subject?.shortName ?? s.subjectId}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {s.accuracy}% · {s.attempted} solved · {s.avgTimeSeconds}s avg
                      </span>
                    </div>
                    <ProgressBar value={s.accuracy} className={colors.bg} />
                  </div>
                );
              })}
            </div>
          </Card>

          {recentMocks.length > 0 && (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent mocks</h2>
                <Link to="/mock" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {recentMocks.map((m) => (
                  <Link
                    key={m.id}
                    to={`/mock/results/${m.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm dark:border-slate-800"
                  >
                    <span className="text-slate-500 dark:text-slate-400">{new Date(m.completedAt).toLocaleDateString()}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {m.totalMarks}/{m.maxMarks} marks
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{m.accuracy}% accuracy</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target size={16} className="text-rose-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Weak topics</h2>
            </div>
            {weak.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No topic is currently flagged weak — nice.</p>
            ) : (
              <div className="space-y-2">
                {weak.map((t) => (
                  <Link key={t.topicId} to={`/topic/${t.topicId}`} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{nameOf(t.topicId)}</span>
                    <span className="font-medium text-rose-500">{Math.round((t.correct / t.attempted) * 100)}%</span>
                  </Link>
                ))}
                <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => {
                  startWeakAreaPractice(20);
                  if (!useSessionStore.getState().error) navigate("/practice/run");
                }}>
                  Drill weak topics
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Speed</h2>
            </div>
            {speedTrend ? (
              <div className="flex items-center gap-2 text-sm">
                {speedTrend.improving ? <TrendingDown size={16} className="text-emerald-500" /> : <TrendingUp size={16} className="text-rose-500" />}
                <span className="text-slate-700 dark:text-slate-200">
                  {speedTrend.recentAvgSeconds}s avg now vs {speedTrend.priorAvgSeconds}s before
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Answer a few more questions to see a speed trend.</p>
            )}
            {slow.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                {slow.map((t) => (
                  <Link key={t.topicId} to={`/topic/${t.topicId}`} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{nameOf(t.topicId)}</span>
                    <span className="text-amber-500">{t.speed}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-brand-600" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Revision due</h2>
            </div>
            {due.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nothing due right now.</p>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">{due.length} topic(s) due for revision.</p>
                <Link to="/revision">
                  <Button size="sm" variant="secondary" className="mt-2 w-full">
                    Go to revision
                  </Button>
                </Link>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
