import { createStore } from 'zustand/vanilla';
import { storageGet, storageSet } from '../utils/storage.ts';
import { STORAGE_KEYS } from '../config/constants.ts';
import type { SettingsStore, Difficulty } from '../types/index.ts';

interface PersistedSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
}

const defaultSettings: PersistedSettings = {
  soundEnabled: true,
  musicEnabled: true,
  difficulty: 'normal',
};

function loadSettings(): PersistedSettings {
  return storageGet<PersistedSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
}

function persistSettings(state: PersistedSettings): void {
  storageSet(STORAGE_KEYS.SETTINGS, state);
}

/** Zustand vanilla store for user settings */
export const settingsStore = createStore<SettingsStore>((set) => {
  const initial = loadSettings();

  return {
    ...initial,

    setSoundEnabled(enabled: boolean) {
      set((s) => {
        const next = { ...s, soundEnabled: enabled };
        persistSettings(next);
        return next;
      });
    },

    setMusicEnabled(enabled: boolean) {
      set((s) => {
        const next = { ...s, musicEnabled: enabled };
        persistSettings(next);
        return next;
      });
    },

    setDifficulty(difficulty: Difficulty) {
      set((s) => {
        const next = { ...s, difficulty };
        persistSettings(next);
        return next;
      });
    },
  };
});

/** Convenience accessor */
export const getSettings = () => settingsStore.getState();
