import { getGameState } from '../store/gameStore.ts';
import { getSettings } from '../store/settingsStore.ts';
import { AchievementSystem } from '../systems/AchievementSystem.ts';
import { SKINS } from '../config/constants.ts';
import type { SkinId, Difficulty } from '../types/index.ts';

type MenuCallback = {
  onPlay: () => void;
  onSkinSelect: (skin: SkinId) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onSoundToggle: () => void;
  onMusicToggle: () => void;
};

/**
 * HTML/Tailwind overlay for the main menu.
 * Displays: title, high score, skin picker, settings, achievements.
 */
export class MenuUI {
  private overlay: HTMLElement;

  constructor(callbacks: MenuCallback) {
    const state = getGameState();
    const settings = getSettings();
    const achievements = AchievementSystem.getAll();

    this.overlay = document.createElement('div');
    this.overlay.id = 'menu-overlay';
    this.overlay.innerHTML = this._buildHTML(state.highScore, state.selectedSkin, state.unlockedSkins, settings.difficulty, settings.soundEnabled, settings.musicEnabled, achievements, state.totalGames, state.getAverageScore(), state.longestStreak);
    document.body.appendChild(this.overlay);

    // Play button
    const playBtn = document.getElementById('menu-play-btn');
    playBtn?.addEventListener('click', () => {
      callbacks.onPlay();
    });

    // Skin picker
    const skinBtns = document.querySelectorAll<HTMLButtonElement>('.skin-btn');
    skinBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const skinId = btn.dataset.skin as SkinId;
        if (!state.unlockedSkins.includes(skinId)) return;
        callbacks.onSkinSelect(skinId);
        skinBtns.forEach((b) => b.classList.remove('ring-4', 'ring-white'));
        btn.classList.add('ring-4', 'ring-white');
      });
    });

    // Difficulty
    const diffBtns = document.querySelectorAll<HTMLButtonElement>('.diff-btn');
    diffBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.diff as Difficulty;
        callbacks.onDifficultyChange(diff);
        diffBtns.forEach((b) => b.classList.remove('bg-yellow-400', 'text-gray-900'));
        btn.classList.add('bg-yellow-400', 'text-gray-900');
      });
    });

    // Sound toggle
    document.getElementById('sound-toggle')?.addEventListener('click', () => {
      callbacks.onSoundToggle();
      const el = document.getElementById('sound-toggle');
      if (el) el.textContent = getSettings().soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Music toggle
    document.getElementById('music-toggle')?.addEventListener('click', () => {
      callbacks.onMusicToggle();
      const el = document.getElementById('music-toggle');
      if (el) el.textContent = getSettings().musicEnabled ? '🎵 Music: ON' : '🎵 Music: OFF';
    });
  }

  private _buildHTML(
    highScore: number,
    selectedSkin: SkinId,
    unlockedSkins: SkinId[],
    difficulty: Difficulty,
    soundEnabled: boolean,
    musicEnabled: boolean,
    achievements: ReturnType<typeof AchievementSystem.getAll>,
    totalGames: number,
    avgScore: number,
    _longestStreak: number,
  ): string {
    const skinHTML = SKINS.map((skin) => {
      const locked = !unlockedSkins.includes(skin.id);
      const selected = skin.id === selectedSkin;
      return `
        <button
          class="skin-btn relative flex flex-col items-center gap-1 p-2 rounded-xl border-2
            ${locked ? 'border-gray-600 opacity-50 cursor-not-allowed' : 'border-white/30 cursor-pointer hover:border-white/70'}
            ${selected ? 'ring-4 ring-white' : ''}
            transition-all"
          data-skin="${skin.id}"
          ${locked ? 'disabled' : ''}
        >
          <div class="w-10 h-10 rounded-full" style="background: #${skin.color.toString(16).padStart(6, '0')}; box-shadow: 0 2px 8px rgba(0,0,0,0.4)"></div>
          <span class="text-white text-xs font-semibold">${skin.name}</span>
          ${locked ? `<span class="text-gray-300 text-[10px]">${skin.label}</span>` : ''}
        </button>
      `;
    }).join('');

    const achieveHTML = achievements.map((a) => `
      <div class="flex items-center gap-2 py-1 ${a.unlocked ? 'opacity-100' : 'opacity-40'}">
        <span class="text-lg">${a.unlocked ? '✅' : '🔒'}</span>
        <div>
          <div class="text-white text-sm font-semibold">${a.name}</div>
          <div class="text-gray-300 text-xs">${a.description}</div>
        </div>
      </div>
    `).join('');

    const diffBtns = (['easy', 'normal', 'hard'] as Difficulty[]).map((d) => {
      const labels: Record<Difficulty, string> = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
      const selected = d === difficulty;
      return `
        <button class="diff-btn flex-1 py-1.5 rounded-lg text-sm font-bold border border-white/30
          ${selected ? 'bg-yellow-400 text-gray-900' : 'text-white hover:bg-white/10'}
          transition-colors"
          data-diff="${d}">${labels[d]}</button>
      `;
    }).join('');

    return `
      <div class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
        <div class="w-full max-w-sm mx-4 bg-gray-900/90 rounded-3xl p-6 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col gap-5">

          <!-- Title -->
          <div class="text-center">
            <h1 class="text-4xl font-black text-yellow-400 drop-shadow-lg tracking-wide">🐦 Flappy Bird</h1>
            <p class="text-gray-300 text-sm mt-1">Modern remake</p>
          </div>

          <!-- Score -->
          <div class="flex justify-around bg-white/5 rounded-2xl p-3">
            <div class="text-center">
              <div class="text-2xl font-black text-yellow-400">${highScore}</div>
              <div class="text-gray-400 text-xs">Best Score</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-black text-blue-400">${totalGames}</div>
              <div class="text-gray-400 text-xs">Games</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-black text-green-400">${avgScore}</div>
              <div class="text-gray-400 text-xs">Average</div>
            </div>
          </div>

          <!-- Skin picker -->
          <div>
            <h2 class="text-white font-bold text-sm mb-2 uppercase tracking-wider">Bird</h2>
            <div class="grid grid-cols-4 gap-2">${skinHTML}</div>
          </div>

          <!-- Difficulty -->
          <div>
            <h2 class="text-white font-bold text-sm mb-2 uppercase tracking-wider">Difficulty</h2>
            <div class="flex gap-2">${diffBtns}</div>
          </div>

          <!-- Settings -->
          <div class="flex gap-2">
            <button id="sound-toggle" class="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
              ${soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
            </button>
            <button id="music-toggle" class="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
              ${musicEnabled ? '🎵 Music: ON' : '🎵 Music: OFF'}
            </button>
          </div>

          <!-- Achievements -->
          <details class="bg-white/5 rounded-2xl p-3">
            <summary class="text-white font-bold text-sm cursor-pointer uppercase tracking-wider">Achievements</summary>
            <div class="mt-3 space-y-1">${achieveHTML}</div>
          </details>

          <!-- Play button -->
          <button id="menu-play-btn"
            class="w-full py-4 rounded-2xl bg-yellow-400 text-gray-900 text-xl font-black uppercase tracking-widest
              hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/30">
            ▶ PLAY
          </button>

          <p class="text-center text-gray-500 text-xs">Space / click / tap to flap • P/ESC to pause • D for debug</p>
        </div>
      </div>
    `;
  }

  /** Remove menu from DOM with fade */
  public destroy(): void {
    this.overlay.style.transition = 'opacity 0.3s';
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 300);
  }
}
