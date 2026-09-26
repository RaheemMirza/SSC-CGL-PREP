import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader, Card } from "../components/ui/Primitives";
import { NAV_ITEMS } from "../components/layout/AppShell";

export default function MorePage() {
  const items = NAV_ITEMS.filter((i) => !["/", "/practice", "/mock", "/analytics"].includes(i.to));
  return (
    <div>
      <PageHeader title="More" description="Everything else, in one place." />
      <Card className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <item.icon size={18} className="text-slate-400" />
            {item.label}
            <ChevronRight size={16} className="ml-auto text-slate-300" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
