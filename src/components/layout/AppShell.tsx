import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardCheck,
  BookOpen,
  Archive,
  AlertTriangle,
  Bookmark,
  CalendarClock,
  Sigma,
  LineChart,
  CalendarDays,
  Settings as SettingsIcon,
  Search,
  Flame,
  MoreHorizontal,
} from "lucide-react";
import { useDataStore } from "../../store/useDataStore";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: Dumbbell },
  { to: "/mock", label: "Mock Tests", icon: ClipboardCheck },
  { to: "/syllabus", label: "Syllabus", icon: BookOpen },
  { to: "/pyq", label: "PYQ Bank", icon: Archive },
  { to: "/mistakes", label: "Mistake Book", icon: AlertTriangle },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/revision", label: "Revision", icon: CalendarClock },
  { to: "/formulas", label: "Formulas", icon: Sigma },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/planner", label: "Study Planner", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_PRIMARY = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: Dumbbell },
  { to: "/mock", label: "Mock", icon: ClipboardCheck },
  { to: "/analytics", label: "Progress", icon: LineChart },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const gamification = useDataStore((s) => s.gamification);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">SC</div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">SSC CGL Prep</p>
            <p className="text-xs leading-tight text-slate-400">2026 · Tier 1 & 2</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
          <Flame size={16} className="text-amber-500" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{gamification.streakDays}-day streak</span>
          <span className="ml-auto text-slate-400">{gamification.xp} XP</span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
          <button
            onClick={() => navigate("/search")}
            className="flex flex-1 max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
          >
            <Search size={16} />
            Search topics, formulas, PYQs…
          </button>
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 lg:hidden">
            <Flame size={16} className="text-amber-500" />
            {gamification.streakDays}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        {MOBILE_PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/more"
          className={({ isActive }) => `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive ? "text-brand-600" : "text-slate-400"}`}
        >
          <MoreHorizontal size={20} />
          More
        </NavLink>
      </nav>
    </div>
  );
}

export { NAV_ITEMS };
