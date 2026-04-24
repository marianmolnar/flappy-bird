import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, AUDIO_KEYS, GAME_CONFIG } from '../config/constants.ts';
import { GameOverUI } from '../ui/GameOverUI.ts';
import { audioManager } from '../systems/AudioManager.ts';
import type { MedalType } from '../types/index.ts';

interface GameOverData {
  score: number;
  medal: MedalType;
  isNewHighScore: boolean;
}

/**
 * GameOverScene — shows the game over overlay with score, medal, and restart options.
 * Runs as a separate scene layered on top.
 */
export class GameOverScene extends Phaser.Scene {
  private gameOverUI: GameOverUI | null = null;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  public init(data: GameOverData): void {
    this._data = data;
  }

  private _data: GameOverData = { score: 0, medal: 'none', isNewHighScore: false };

  public create(): void {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Frozen background
    this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, ASSET_KEYS.BG_DAY).setDepth(0);

    // Dark overlay
    const overlay = this.add.graphics().setDepth(1);
    overlay.fillStyle(0x000000, 0.35);
    overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

    // Original "GAME OVER" image — centred upper area
    this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT * 0.28, ASSET_KEYS.GAMEOVER)
      .setDepth(2);

    audioManager.setScene(this);

    this.gameOverUI = new GameOverUI(
      this._data.score,
      this._data.medal,
      this._data.isNewHighScore,
      () => this._restart(),
      () => this._goToMenu(),
    );

    // Keyboard shortcuts
    const keyboard = this.input.keyboard!;
    keyboard.once('keydown-SPACE', () => this._restart());
    keyboard.once('keydown-ENTER', () => this._restart());
    keyboard.once('keydown-ESC', () => this._goToMenu());
  }

  private _restart(): void {
    audioManager.play(AUDIO_KEYS.MENU_CLICK);
    this.gameOverUI?.destroy();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
  }

  private _goToMenu(): void {
    audioManager.play(AUDIO_KEYS.MENU_CLICK);
    this.gameOverUI?.destroy();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  public shutdown(): void {
    this.gameOverUI?.destroy();
    this.gameOverUI = null;
  }
}
