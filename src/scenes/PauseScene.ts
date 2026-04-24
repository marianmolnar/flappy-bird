import * as Phaser from 'phaser';
import { SCENE_KEYS, AUDIO_KEYS } from '../config/constants.ts';
import { audioManager } from '../systems/AudioManager.ts';
import { getSettings } from '../store/settingsStore.ts';

/**
 * PauseScene — lightweight overlay launched alongside GameScene.
 * Resumes physics and pipe movement when dismissed.
 */
export class PauseScene extends Phaser.Scene {
  private overlay: HTMLElement | null = null;

  constructor() {
    super({ key: SCENE_KEYS.PAUSE });
  }

  public create(): void {
    // Dark overlay drawn in Phaser
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.55);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.overlay = document.createElement('div');
    this.overlay.id = 'pause-overlay';
    this.overlay.innerHTML = this._buildHTML();
    this.overlay.style.opacity = '0';
    this.overlay.style.transition = 'opacity 0.25s';
    document.body.appendChild(this.overlay);

    requestAnimationFrame(() => {
      if (this.overlay) this.overlay.style.opacity = '1';
    });

    document.getElementById('pause-resume')?.addEventListener('click', () => this._resume());
    document.getElementById('pause-menu')?.addEventListener('click', () => this._goToMenu());
    document.getElementById('pause-sound')?.addEventListener('click', () => {
      const s = getSettings();
      audioManager.setSoundEnabled(!s.soundEnabled);
      const el = document.getElementById('pause-sound');
      if (el) el.textContent = getSettings().soundEnabled ? '🔊 Zvuk: ZAP' : '🔇 Zvuk: VYP';
    });

    const kb = this.input.keyboard!;
    kb.once('keydown-P',   () => this._resume());
    kb.once('keydown-ESC', () => this._resume());
    kb.once('keydown-SPACE', () => this._resume());
  }

  private _buildHTML(): string {
    const settings = getSettings();
    return `
      <div style="
        position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
        z-index:60; font-family:'Segoe UI',sans-serif;">
        <div style="
          background:rgba(15,15,25,0.95); border-radius:24px; padding:36px 32px;
          border:1px solid rgba(255,255,255,0.1); max-width:240px; width:100%;
          text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.6);">
          <div style="font-size:2.5rem; margin-bottom:8px;">⏸</div>
          <h2 style="color:white; font-size:1.4rem; font-weight:900; margin:0 0 24px; letter-spacing:2px;">PAUZA</h2>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="pause-resume" style="
              background:#FFD700; color:#1a1a1a; border:none; border-radius:14px;
              padding:13px 0; font-size:1rem; font-weight:900; cursor:pointer; letter-spacing:1px;">
              ▶ POKRAČOVAT
            </button>
            <button id="pause-sound" style="
              background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2);
              border-radius:14px; padding:11px 0; font-size:0.9rem; font-weight:600; cursor:pointer;">
              ${settings.soundEnabled ? '🔊 Zvuk: ZAP' : '🔇 Zvuk: VYP'}
            </button>
            <button id="pause-menu" style="
              background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7);
              border:1px solid rgba(255,255,255,0.12);
              border-radius:14px; padding:11px 0; font-size:0.9rem; font-weight:600; cursor:pointer;">
              ≡ Menu
            </button>
          </div>
          <p style="color:rgba(255,255,255,0.3); font-size:0.7rem; margin:16px 0 0;">
            P / ESC / Mezerník pro pokračování
          </p>
        </div>
      </div>
    `;
  }

  private _resume(): void {
    audioManager.play(AUDIO_KEYS.MENU_CLICK);
    this._removeOverlay();

    const gameScene = this.scene.get(SCENE_KEYS.GAME) as Phaser.Scene & {
      pipeManager: { resume: (speed: number) => void };
      scoreSystem: { pipeSpeed: number };
    };
    gameScene.physics.resume();
    gameScene.pipeManager.resume(gameScene.scoreSystem.pipeSpeed);
    this.scene.resume(SCENE_KEYS.GAME);
    this.scene.stop();
  }

  private _goToMenu(): void {
    audioManager.play(AUDIO_KEYS.MENU_CLICK);
    this._removeOverlay();
    this.scene.stop(SCENE_KEYS.GAME);
    this.scene.start(SCENE_KEYS.MENU);
    this.scene.stop();
  }

  private _removeOverlay(): void {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => this.overlay?.remove(), 250);
      this.overlay = null;
    }
  }

  public shutdown(): void {
    this._removeOverlay();
  }
}
