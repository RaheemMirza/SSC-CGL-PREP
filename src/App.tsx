import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useSettingsStore } from "./store/useSettingsStore";

import Dashboard from "./pages/Dashboard";
import PracticeHub from "./pages/PracticeHub";
import PracticeRunner from "./pages/PracticeRunner";
import PracticeResults from "./pages/PracticeResults";
import MockHub from "./pages/MockHub";
import MockRunner from "./pages/MockRunner";
import MockResults from "./pages/MockResults";
import Syllabus from "./pages/Syllabus";
import TopicPage from "./pages/TopicPage";
import PyqBank from "./pages/PyqBank";
import MistakeBook from "./pages/MistakeBook";
import Bookmarks from "./pages/Bookmarks";
import Revision from "./pages/Revision";
import Formulas from "./pages/Formulas";
import Analytics from "./pages/Analytics";
import StudyPlanner from "./pages/StudyPlanner";
import Settings from "./pages/Settings";
import SearchPage from "./pages/SearchPage";
import MorePage from "./pages/MorePage";
import NotFound from "./pages/NotFound";

export default function App() {
  const theme = useSettingsStore((s) => s.theme);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    apply(theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/practice" element={<PracticeHub />} />
        <Route path="/practice/run" element={<PracticeRunner />} />
        <Route path="/practice/results" element={<PracticeResults />} />
        <Route path="/mock" element={<MockHub />} />
        <Route path="/mock/run" element={<MockRunner />} />
        <Route path="/mock/results" element={<MockResults />} />
        <Route path="/mock/results/:resultId" element={<MockResults />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/pyq" element={<PyqBank />} />
        <Route path="/mistakes" element={<MistakeBook />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/revision" element={<Revision />} />
        <Route path="/formulas" element={<Formulas />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/planner" element={<StudyPlanner />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
