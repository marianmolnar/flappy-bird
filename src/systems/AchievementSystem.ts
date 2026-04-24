import { ACHIEVEMENT_IDS, SKINS } from '../config/constants.ts';
import { getGameState } from '../store/gameStore.ts';
import { audioManager } from './AudioManager.ts';
import type { Achievement } from '../types/index.ts';

/**
 * Checks and unlocks achievements based on game events.
 * Emits a DOM custom event when an achievement is unlocked.
 */
export class AchievementSystem {
  /**
   * Check score-based achievements after a game ends.
   * @param score - final score of the game
   * @returns array of newly unlocked achievement IDs
   */
  public checkScoreAchievements(score: number): string[] {
    const unlocked: string[] = [];
    const state = getGameState();

    const scoreThresholds: Array<{ id: string; threshold: number }> = [
      { id: ACHIEVEMENT_IDS.FIRST_FLIGHT, threshold: 1 },
      { id: ACHIEVEMENT_IDS.BEGINNER, threshold: 10 },
      { id: ACHIEVEMENT_IDS.ADVANCED, threshold: 25 },
      { id: ACHIEVEMENT_IDS.EXPERT, threshold: 50 },
      { id: ACHIEVEMENT_IDS.LEGEND, threshold: 100 },
    ];

    for (const { id, threshold } of scoreThresholds) {
      if (score >= threshold && !state.achievements[id]) {
        state.unlockAchievement(id);
        unlocked.push(id);
      }
    }

    return unlocked;
  }

  /**
   * Check game count achievements.
   * @returns array of newly unlocked achievement IDs
   */
  public checkGameCountAchievements(): string[] {
    const unlocked: string[] = [];
    const state = getGameState();

    if (state.totalGames >= 10 && !state.achievements[ACHIEVEMENT_IDS.VETERAN]) {
      state.unlockAchievement(ACHIEVEMENT_IDS.VETERAN);
      unlocked.push(ACHIEVEMENT_IDS.VETERAN);
    }

    return unlocked;
  }

  /**
   * Check if all skins are unlocked (Collector achievement).
   * @returns array of newly unlocked achievement IDs
   */
  public checkCollectorAchievement(): string[] {
    const unlocked: string[] = [];
    const state = getGameState();
    const allSkinIds = SKINS.map((s) => s.id);
    const hasAll = allSkinIds.every((id) => state.unlockedSkins.includes(id));

    if (hasAll && !state.achievements[ACHIEVEMENT_IDS.COLLECTOR]) {
      state.unlockAchievement(ACHIEVEMENT_IDS.COLLECTOR);
      unlocked.push(ACHIEVEMENT_IDS.COLLECTOR);
    }

    return unlocked;
  }

  /**
   * Auto-unlock skins based on high score.
   */
  public checkSkinUnlocks(highScore: number): void {
    const state = getGameState();
    for (const skin of SKINS) {
      if (highScore >= skin.requiredScore && !state.unlockedSkins.includes(skin.id)) {
        state.unlockSkin(skin.id);
      }
    }
    this.checkCollectorAchievement();
  }

  /**
   * Show an achievement toast notification in the UI.
   * @param achievementId - the ID of the unlocked achievement
   */
  public showToast(achievementId: string): void {
    audioManager.play('score');
    const event = new CustomEvent('achievement_unlocked', { detail: { id: achievementId } });
    window.dispatchEvent(event);
  }

  /**
   * Get list of all achievements with current unlock status.
   */
  public static getAll(): Achievement[] {
    const state = getGameState();
    const defs = [
      { id: ACHIEVEMENT_IDS.FIRST_FLIGHT, name: 'První let', description: 'Dosáhni skóre 1' },
      { id: ACHIEVEMENT_IDS.BEGINNER, name: 'Začátečník', description: 'Dosáhni skóre 10' },
      { id: ACHIEVEMENT_IDS.ADVANCED, name: 'Pokročilý', description: 'Dosáhni skóre 25' },
      { id: ACHIEVEMENT_IDS.EXPERT, name: 'Expert', description: 'Dosáhni skóre 50' },
      { id: ACHIEVEMENT_IDS.LEGEND, name: 'Legenda', description: 'Dosáhni skóre 100' },
      { id: ACHIEVEMENT_IDS.VETERAN, name: 'Vytrvalec', description: 'Odehraj 10 her' },
      { id: ACHIEVEMENT_IDS.COLLECTOR, name: 'Sběratel', description: 'Odemkni všechny skiny' },
    ];

    return defs.map((d) => ({ ...d, unlocked: Boolean(state.achievements[d.id]) }));
  }
}
