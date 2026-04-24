import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, ANIM_KEYS, GAME_CONFIG, AUDIO_KEYS } from '../config/constants.ts';
import { MenuUI } from '../ui/MenuUI.ts';
import { audioManager } from '../systems/AudioManager.ts';
import { getGameState } from '../store/gameStore.ts';
import { getSettings } from '../store/settingsStore.ts';
import type { SkinId, Difficulty } from '../types/index.ts';

/** Maps skin to the animation key / mid frame for preview */
const SKIN_ANIM: Record<SkinId, { anim: string; mid: string }> = {
  yellow:  { anim: ANIM_KEYS.YELLOW, mid: ASSET_KEYS.YELLOW_MID },
  blue:    { anim: ANIM_KEYS.BLUE,   mid: ASSET_KEYS.BLUE_MID   },
  red:     { anim: ANIM_KEYS.RED,    mid: ASSET_KEYS.RED_MID    },
  rainbow: { anim: ANIM_KEYS.YELLOW, mid: ASSET_KEYS.YELLOW_MID },
};

/**
 * MenuScene — main menu with animated background and HTML overlay.
 */
export class MenuScene extends Phaser.Scene {
  private menuUI: MenuUI | null = null;
  private demoBird!: Phaser.Physics.Arcade.Sprite;
  private toastContainer: HTMLElement | null = null;
  private boundAchievementHandler: (e: Event) => void;

  constructor() {
    super({ key: SCENE_KEYS.MENU });
    this.boundAchievementHandler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      this._showToast(`🏆 Achievement: ${detail.id}`);
    };
  }

  public create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Real background sprite
    this.add.image(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      ASSET_KEYS.BG_DAY,
    ).setDepth(0);

    // Scrolling base preview
    this.add.tileSprite(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT / 2,
      GAME_CONFIG.WIDTH,
      GAME_CONFIG.GROUND_HEIGHT,
      ASSET_KEYS.BASE,
    ).setDepth(2);

    // Demo bird with real animation
    const skin = getGameState().selectedSkin;
    const { anim, mid } = SKIN_ANIM[skin];
    this.demoBird = this.physics.add.sprite(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 - 60,
      mid,
    ).setDepth(5);
    this.demoBird.play(anim);
    if (skin === 'rainbow') this.demoBird.setTint(0xFF88FF);

    // Hover tween
    this.tweens.add({
      targets: this.demoBird,
      y: GAME_CONFIG.HEIGHT / 2 - 40,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // Disable gravity on demo bird
    (this.demoBird.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Give AudioManager this scene reference
    audioManager.setScene(this);

    window.addEventListener('achievement_unlocked', this.boundAchievementHandler);
    this._showMenu();
  }

  private _showMenu(): void {
    this.menuUI = new MenuUI({
      onPlay: () => {
        audioManager.play(AUDIO_KEYS.MENU_CLICK);
        this.menuUI?.destroy();
        this.menuUI = null;
        this._startGame();
      },
      onSkinSelect: (skin: SkinId) => {
        audioManager.play(AUDIO_KEYS.MENU_CLICK);
        getGameState().selectSkin(skin);
        const { anim, mid } = SKIN_ANIM[skin];
        this.demoBird.setTexture(mid).play(anim);
        this.demoBird.clearTint();
        if (skin === 'rainbow') this.demoBird.setTint(0xFF88FF);
      },
      onDifficultyChange: (diff: Difficulty) => {
        audioManager.play(AUDIO_KEYS.MENU_CLICK);
        getSettings().setDifficulty(diff);
      },
      onSoundToggle: () => {
        const s = getSettings();
        audioManager.setSoundEnabled(!s.soundEnabled);
      },
      onMusicToggle: () => {
        const s = getSettings();
        audioManager.setMusicEnabled(!s.musicEnabled);
      },
    });
  }

  private _startGame(): void {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }

  private _showToast(message: string): void {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        z-index: 100; display: flex; flex-direction: column; gap: 8px; align-items: center;
        pointer-events: none;
      `;
      document.body.appendChild(this.toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(30,30,30,0.95); color: #FFD700; padding: 10px 20px;
      border-radius: 20px; font-size: 13px; font-weight: 700;
      border: 1px solid rgba(255,215,0,0.3); opacity: 0; transition: opacity 0.3s;
      white-space: nowrap;
    `;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  public shutdown(): void {
    this.menuUI?.destroy();
    this.menuUI = null;
    this.toastContainer?.remove();
    this.toastContainer = null;
    window.removeEventListener('achievement_unlocked', this.boundAchievementHandler);
  }
}
