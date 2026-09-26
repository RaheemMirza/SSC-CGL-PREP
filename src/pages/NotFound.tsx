import { Link } from "react-router-dom";
import { Button } from "../components/ui/Primitives";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-5xl font-bold text-slate-200 dark:text-slate-700">404</p>
      <p className="text-slate-500 dark:text-slate-400">That page doesn't exist.</p>
      <Link to="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
