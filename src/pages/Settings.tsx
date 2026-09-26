import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader, Card, Button } from "../components/ui/Primitives";
import { useSettingsStore } from "../store/useSettingsStore";
import { useDataStore } from "../store/useDataStore";

export default function Settings() {
  const settings = useSettingsStore();
  const exportData = useDataStore((s) => s.exportData);
  const importData = useDataStore((s) => s.importData);
  const resetAll = useDataStore((s) => s.resetAll);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ssc-cgl-prep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importData(String(reader.result), "merge");
      setImportMessage(result.ok ? "Imported and merged successfully." : `Import failed: ${result.error}`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm text-slate-500 dark:text-slate-400">Theme</label>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => settings.setTheme(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${settings.theme === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={settings.soundEnabled} onChange={settings.toggleSound} /> Sound effects
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={settings.reducedMotion} onChange={settings.toggleReducedMotion} /> Reduce motion
        </label>
      </Card>

      <Card className="mb-6 p-5">
        <h2 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">AI features (optional, bring your own key)</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Not wired to any feature in this build yet — this just stores a key locally for a future AI tutor / current-affairs generator. If you ever add that
          feature, remember a key entered here would be called directly from the browser, which is fine for a personal local tool but isn't safe to deploy publicly
          as-is.
        </p>
        <input
          type="password"
          placeholder="sk-ant-…"
          value={settings.aiApiKey ?? ""}
          onChange={(e) => settings.setAiApiKey(e.target.value || null)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={settings.aiFeaturesEnabled} onChange={(e) => settings.setAiFeaturesEnabled(e.target.checked)} disabled={!settings.aiApiKey} />
          Enable AI features
        </label>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Your data</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Everything lives in this browser's local storage — nothing is sent anywhere. Back it up, move it to another browser, or wipe it.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={14} /> Export backup
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Import backup
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          {!confirmingReset ? (
            <Button variant="danger" onClick={() => setConfirmingReset(true)}>
              <Trash2 size={14} /> Reset all data
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm dark:border-rose-900 dark:bg-rose-950/40">
              <AlertTriangle size={14} className="text-rose-500" />
              <span className="text-rose-700 dark:text-rose-300">Delete everything?</span>
              <Button size="sm" variant="danger" onClick={() => { resetAll(); setConfirmingReset(false); }}>
                Yes, delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingReset(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        {importMessage && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{importMessage}</p>}
      </Card>
    </div>
  );
}
