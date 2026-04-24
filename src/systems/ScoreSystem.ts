import {
  GAME_CONFIG,
  DIFFICULTY_SETTINGS,
  MEDAL_THRESHOLDS,
} from '../config/constants.ts';
import { getSettings } from '../store/settingsStore.ts';
import type { MedalType } from '../types/index.ts';

/**
 * Manages score counting, speed scaling, and medal calculation.
 * Scoring matches the original: exactly +1 per pipe passed.
 */
export class ScoreSystem {
  private _score = 0;
  private _pipeSpeed: number;
  private readonly _baseSpeed: number;

  constructor() {
    const settings = getSettings();
    const diffMult = DIFFICULTY_SETTINGS[settings.difficulty].speedMultiplier;
    this._baseSpeed = GAME_CONFIG.PIPE_SPEED * diffMult;
    this._pipeSpeed = this._baseSpeed;
  }

  get score(): number {
    return this._score;
  }

  get pipeSpeed(): number {
    return this._pipeSpeed;
  }

  /** Award +1 point for passing a pipe (original scoring). */
  public onPipePassed(): void {
    this._score += 1;
    this._updateSpeed();
  }

  /** Reset score and speed for a new game */
  public reset(): void {
    this._score = 0;
    const settings = getSettings();
    const diffMult = DIFFICULTY_SETTINGS[settings.difficulty].speedMultiplier;
    this._pipeSpeed = GAME_CONFIG.PIPE_SPEED * diffMult;
  }

  /**
   * Speed is constant in the original game (SPEED_INCREASE_PER_10_SCORE = 0).
   * Keeping the method so difficulty multipliers still apply.
   */
  private _updateSpeed(): void {
    if (GAME_CONFIG.SPEED_INCREASE_PER_10_SCORE === 0) return;
    const increments = Math.floor(this._score / 10);
    this._pipeSpeed = this._baseSpeed * (1 + increments * GAME_CONFIG.SPEED_INCREASE_PER_10_SCORE);
  }

  /**
   * Determine the medal type for a given score.
   */
  public static getMedal(score: number): MedalType {
    if (score >= MEDAL_THRESHOLDS.platinum) return 'platinum';
    if (score >= MEDAL_THRESHOLDS.gold) return 'gold';
    if (score >= MEDAL_THRESHOLDS.silver) return 'silver';
    if (score >= MEDAL_THRESHOLDS.bronze) return 'bronze';
    return 'none';
  }

  /**
   * Calculate effective pipe gap for current difficulty.
   * Returns a random value within the gap range adjusted by difficulty.
   */
  public static getRandomGap(): number {
    const settings = getSettings();
    const mult = DIFFICULTY_SETTINGS[settings.difficulty].gapMultiplier;
    const min = GAME_CONFIG.PIPE_GAP_MIN * mult;
    const max = GAME_CONFIG.PIPE_GAP_MAX * mult;
    return min + Math.random() * (max - min);
  }
}
