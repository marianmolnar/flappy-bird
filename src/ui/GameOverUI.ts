import { getGameState } from '../store/gameStore.ts';
import type { MedalType } from '../types/index.ts';

const MEDAL_CONFIG: Record<MedalType, { emoji: string; label: string; color: string }> = {
  none: { emoji: '💀', label: 'No medal', color: '#6B7280' },
  bronze: { emoji: '🥉', label: 'Bronze Medal', color: '#CD7F32' },
  silver: { emoji: '🥈', label: 'Silver Medal', color: '#C0C0C0' },
  gold: { emoji: '🥇', label: 'Gold Medal', color: '#FFD700' },
  platinum: { emoji: '💎', label: 'Platinum Medal', color: '#E5E4E2' },
};

/**
 * HTML overlay shown after the player dies.
 * Displays score, medal, best score, and restart/menu options.
 */
export class GameOverUI {
  private overlay: HTMLElement;

  constructor(
    score: number,
    medal: MedalType,
    isNewHighScore: boolean,
    onRestart: () => void,
    onMenu: () => void,
  ) {
    const state = getGameState();
    const medalCfg = MEDAL_CONFIG[medal];

    this.overlay = document.createElement('div');
    this.overlay.id = 'gameover-overlay';
    this.overlay.style.cssText = 'opacity: 0; transition: opacity 0.4s;';
    this.overlay.innerHTML = this._buildHTML(score, state.highScore, medalCfg, isNewHighScore);
    document.body.appendChild(this.overlay);

    // Fade in
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '1';
    });

    document.getElementById('gameover-restart')?.addEventListener('click', onRestart);
    document.getElementById('gameover-menu')?.addEventListener('click', onMenu);
  }

  private _buildHTML(
    score: number,
    highScore: number,
    medalCfg: { emoji: string; label: string; color: string },
    isNewHighScore: boolean,
  ): string {
    return `
      <div class="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-xs mx-4 bg-gray-900/95 rounded-3xl p-7 border border-white/10 shadow-2xl flex flex-col items-center gap-5">

          <h1 class="text-3xl font-black text-red-400 uppercase tracking-widest">Game Over</h1>

          <!-- Medal -->
          <div class="flex flex-col items-center gap-1">
            <div class="text-6xl animate-bounce">${medalCfg.emoji}</div>
            <span class="text-sm font-semibold" style="color: ${medalCfg.color}">${medalCfg.label}</span>
          </div>

          <!-- Score -->
          <div class="w-full bg-white/5 rounded-2xl p-4 flex justify-around">
            <div class="text-center">
              <div class="text-4xl font-black text-white">${score}</div>
              <div class="text-gray-400 text-xs">Score</div>
            </div>
            <div class="w-px bg-white/10"></div>
            <div class="text-center">
              <div class="text-4xl font-black text-yellow-400">${highScore}</div>
              <div class="text-gray-400 text-xs">Best</div>
            </div>
          </div>

          ${isNewHighScore ? `
            <div class="w-full text-center bg-yellow-400/20 border border-yellow-400/40 rounded-xl py-2 px-4">
              <span class="text-yellow-400 font-bold text-sm">🏆 New record!</span>
            </div>
          ` : ''}

          <!-- Buttons -->
          <button id="gameover-restart"
            class="w-full py-4 rounded-2xl bg-yellow-400 text-gray-900 text-lg font-black uppercase tracking-widest
              hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/30">
            ↺ RETRY
          </button>

          <button id="gameover-menu"
            class="w-full py-3 rounded-2xl bg-white/10 text-white text-base font-semibold
              hover:bg-white/20 active:scale-95 transition-all">
            ≡ Menu
          </button>
        </div>
      </div>
    `;
  }

  /** Remove game over overlay with fade */
  public destroy(): void {
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 400);
  }
}
