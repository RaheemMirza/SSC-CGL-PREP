import { create } from "zustand";
import * as persistence from "../lib/persistence";
import type { AppSettings } from "../lib/persistence";

interface SettingsState extends AppSettings {
  setTheme: (theme: AppSettings["theme"]) => void;
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  setAiApiKey: (key: string | null) => void;
  setAiFeaturesEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = persistence.loadAll().settings;
  return {
    ...initial,
    setTheme: (theme) => {
      persistence.updateSettings({ theme });
      set({ theme });
    },
    toggleSound: () => {
      const soundEnabled = !get().soundEnabled;
      persistence.updateSettings({ soundEnabled });
      set({ soundEnabled });
    },
    toggleReducedMotion: () => {
      const reducedMotion = !get().reducedMotion;
      persistence.updateSettings({ reducedMotion });
      set({ reducedMotion });
    },
    setAiApiKey: (aiApiKey) => {
      persistence.updateSettings({ aiApiKey });
      set({ aiApiKey });
    },
    setAiFeaturesEnabled: (aiFeaturesEnabled) => {
      persistence.updateSettings({ aiFeaturesEnabled });
      set({ aiFeaturesEnabled });
    },
  };
});
