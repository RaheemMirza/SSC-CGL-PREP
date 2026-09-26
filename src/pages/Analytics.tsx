import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { PageHeader, Card, EmptyState, Button } from "../components/ui/Primitives";
import { useDataStore } from "../store/useDataStore";
import { useNavigate } from "react-router-dom";
import { computeSubjectBreakdown, computeSpeedTrend } from "../lib/adaptiveEngine";
import { getSubjectById } from "../data/syllabus";

const STATUS_ORDER = ["mastered", "strong", "in-progress", "weak", "needs-revision", "not-started"] as const;
const STATUS_FILL: Record<string, string> = {
  mastered: "#10b981",
  strong: "#34d399",
  "in-progress": "#3d56f5",
  weak: "#e0526b",
  "needs-revision": "#e0972d",
  "not-started": "#cbd5e1",
};

export default function Analytics() {
  const navigate = useNavigate();
  const { attempts, topicProgress, mockResults } = useDataStore();

  if (attempts.filter((a) => a.correct !== null).length === 0) {
    return (
      <EmptyState title="Nothing to chart yet" description="Analytics fills in once you've logged some practice or a mock." action={<Button onClick={() => navigate("/practice")}>Start practicing</Button>} />
    );
  }

  const breakdown = computeSubjectBreakdown(attempts).map((s) => ({ name: getSubjectById(s.subjectId)?.shortName ?? s.subjectId, accuracy: s.accuracy, avgTime: s.avgTimeSeconds }));
  const speedTrend = computeSpeedTrend(attempts);

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: Object.values(topicProgress).filter((p) => p.status === status).length,
  })).filter((s) => s.count > 0);

  const mockHistory = [...mockResults]
    .sort((a, b) => a.completedAt - b.completedAt)
    .map((m, i) => ({ attempt: i + 1, marks: m.totalMarks, date: new Date(m.completedAt).toLocaleDateString() }));

  return (
    <div>
      <PageHeader title="Analytics" description="Deeper cuts of the same real data behind your dashboard." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Accuracy by subject</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#3d56f5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Average time per question (s)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avgTime" fill="#e0972d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {mockHistory.length > 1 && (
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Mock score history</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mockHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="attempt" tick={{ fontSize: 12 }} label={{ value: "Attempt #", position: "insideBottom", offset: -5, fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="marks" stroke="#3d56f5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Topic status distribution</h2>
          <div className="space-y-2">
            {statusCounts.map((s) => (
              <div key={s.status} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded" style={{ backgroundColor: STATUS_FILL[s.status] }} />
                <span className="w-32 text-slate-600 dark:text-slate-300">{s.status}</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Speed trend</h2>
          {speedTrend ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your last {speedTrend.sampleSize} questions averaged <strong>{speedTrend.recentAvgSeconds}s</strong>, vs <strong>{speedTrend.priorAvgSeconds}s</strong> before that —{" "}
              {speedTrend.improving ? "you're getting faster." : "a bit slower than before."}
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Need at least 20 logged questions to show a trend.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
