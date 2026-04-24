import { createStore } from 'zustand/vanilla';
import { storageGet, storageSet } from '../utils/storage.ts';
import { STORAGE_KEYS } from '../config/constants.ts';
import type { GameStore, SkinId } from '../types/index.ts';

interface PersistedGameState {
  highScore: number;
  totalGames: number;
  totalScore: number;
  unlockedSkins: SkinId[];
  selectedSkin: SkinId;
  achievements: Record<string, boolean>;
  longestStreak: number;
}

const defaultState: PersistedGameState = {
  highScore: 0,
  totalGames: 0,
  totalScore: 0,
  unlockedSkins: ['yellow'],
  selectedSkin: 'yellow',
  achievements: {},
  longestStreak: 0,
};

/** Load persisted state from localStorage */
function loadState(): PersistedGameState {
  return storageGet<PersistedGameState>(STORAGE_KEYS.GAME_STATE, defaultState);
}

/** Persist state slice to localStorage */
function persistState(state: PersistedGameState): void {
  storageSet(STORAGE_KEYS.GAME_STATE, state);
}

/** Zustand vanilla store for game progress and persistence */
export const gameStore = createStore<GameStore>((set, get) => {
  const initial = loadState();

  return {
    ...initial,

    setHighScore(score: number) {
      set((s) => {
        if (score <= s.highScore) return s;
        const next = { ...s, highScore: score };
        persistState(next);
        return next;
      });
    },

    incrementTotalGames() {
      set((s) => {
        const next = { ...s, totalGames: s.totalGames + 1 };
        persistState(next);
        return next;
      });
    },

    addTotalScore(score: number) {
      set((s) => {
        const next = { ...s, totalScore: s.totalScore + score };
        persistState(next);
        return next;
      });
    },

    unlockSkin(skin: SkinId) {
      set((s) => {
        if (s.unlockedSkins.includes(skin)) return s;
        const next = { ...s, unlockedSkins: [...s.unlockedSkins, skin] };
        persistState(next);
        return next;
      });
    },

    selectSkin(skin: SkinId) {
      set((s) => {
        if (!s.unlockedSkins.includes(skin)) return s;
        const next = { ...s, selectedSkin: skin };
        persistState(next);
        return next;
      });
    },

    unlockAchievement(id: string) {
      set((s) => {
        if (s.achievements[id]) return s;
        const next = { ...s, achievements: { ...s.achievements, [id]: true } };
        persistState(next);
        return next;
      });
    },

    updateLongestStreak(streak: number) {
      set((s) => {
        if (streak <= s.longestStreak) return s;
        const next = { ...s, longestStreak: streak };
        persistState(next);
        return next;
      });
    },

    getAverageScore() {
      const { totalScore, totalGames } = get();
      return totalGames === 0 ? 0 : Math.round(totalScore / totalGames);
    },
  };
});

/** Convenience accessor */
export const getGameState = () => gameStore.getState();
