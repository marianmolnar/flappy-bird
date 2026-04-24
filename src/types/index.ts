/** Game skin variants */
export type SkinId = 'yellow' | 'blue' | 'red' | 'rainbow';

/** Game difficulty levels */
export type Difficulty = 'easy' | 'normal' | 'hard';

/** Day cycle phases */
export type DayPhase = 'day' | 'sunset' | 'night' | 'dawn';

/** Medal types for game over screen */
export type MedalType = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

/** Achievement definition */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

/** Persistent game state */
export interface GameStore {
  highScore: number;
  totalGames: number;
  totalScore: number;
  unlockedSkins: SkinId[];
  selectedSkin: SkinId;
  achievements: Record<string, boolean>;
  longestStreak: number;
  setHighScore: (score: number) => void;
  incrementTotalGames: () => void;
  addTotalScore: (score: number) => void;
  unlockSkin: (skin: SkinId) => void;
  selectSkin: (skin: SkinId) => void;
  unlockAchievement: (id: string) => void;
  updateLongestStreak: (streak: number) => void;
  getAverageScore: () => number;
}

/** Settings state */
export interface SettingsStore {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

/** Score event data passed between Phaser scenes */
export interface ScoreEventData {
  score: number;
  isCombo: boolean;
}

/** Game over event data */
export interface GameOverEventData {
  score: number;
  medal: MedalType;
  isNewHighScore: boolean;
}

/** Skin configuration */
export interface SkinConfig {
  id: SkinId;
  name: string;
  color: number;
  wingColor: number;
  eyeColor: number;
  requiredScore: number;
  label: string;
}

/** Generated sound buffers cache */
export interface SoundBuffers {
  flap: AudioBuffer;
  score: AudioBuffer;
  hit: AudioBuffer;
  die: AudioBuffer;
  menuClick: AudioBuffer;
}

/** Debug info displayed in debug mode */
export interface DebugInfo {
  fps: number;
  birdVelocity: number;
  pipeSpeed: number;
  score: number;
}
