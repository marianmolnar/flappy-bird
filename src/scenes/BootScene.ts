import * as Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, ANIM_KEYS, AUDIO_KEYS } from '../config/constants.ts';
import { audioManager } from '../systems/AudioManager.ts';
import { AssetGenerator } from '../utils/assetGenerator.ts';

const SPRITE_BASE = '/assets/sprites/';
const AUDIO_BASE  = '/assets/audio/';

/**
 * BootScene — loads all original Flappy Bird assets via Phaser's file loader,
 * then creates bird animations and transitions to MenuScene.
 */
export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  public preload(): void {
    const { width, height } = this.cameras.main;

    // --- Loading UI ---
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A237E, 0x1A237E, 0x283593, 0x283593, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 90, '🐦 Flappy Bird', {
      fontSize: '22px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x111111, 0.8);
    this.progressBox.fillRoundedRect(width / 2 - 110, height / 2 - 18, 220, 36, 8);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(width / 2, height / 2 + 30, 'Načítání...', {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Progress events
    this.load.on('progress', (v: number) => this._drawProgress(v));
    this.load.on('fileprogress', (file: { key: string }) => {
      this.loadingText.setText(file.key);
    });

    // --- Backgrounds ---
    this.load.image(ASSET_KEYS.BG_DAY,   SPRITE_BASE + 'background-day.png');
    this.load.image(ASSET_KEYS.BG_NIGHT, SPRITE_BASE + 'background-night.png');
    this.load.image(ASSET_KEYS.BASE,     SPRITE_BASE + 'base.png');

    // --- Pipes ---
    this.load.image(ASSET_KEYS.PIPE_GREEN, SPRITE_BASE + 'pipe-green.png');
    this.load.image(ASSET_KEYS.PIPE_RED,   SPRITE_BASE + 'pipe-red.png');

    // --- Bird frames (yellow) ---
    this.load.image(ASSET_KEYS.YELLOW_DOWN, SPRITE_BASE + 'yellowbird-downflap.png');
    this.load.image(ASSET_KEYS.YELLOW_MID,  SPRITE_BASE + 'yellowbird-midflap.png');
    this.load.image(ASSET_KEYS.YELLOW_UP,   SPRITE_BASE + 'yellowbird-upflap.png');

    // --- Bird frames (blue) ---
    this.load.image(ASSET_KEYS.BLUE_DOWN, SPRITE_BASE + 'bluebird-downflap.png');
    this.load.image(ASSET_KEYS.BLUE_MID,  SPRITE_BASE + 'bluebird-midflap.png');
    this.load.image(ASSET_KEYS.BLUE_UP,   SPRITE_BASE + 'bluebird-upflap.png');

    // --- Bird frames (red) ---
    this.load.image(ASSET_KEYS.RED_DOWN, SPRITE_BASE + 'redbird-downflap.png');
    this.load.image(ASSET_KEYS.RED_MID,  SPRITE_BASE + 'redbird-midflap.png');
    this.load.image(ASSET_KEYS.RED_UP,   SPRITE_BASE + 'redbird-upflap.png');

    // --- Score digits ---
    for (let i = 0; i <= 9; i++) {
      this.load.image(`digit-${i}`, SPRITE_BASE + `${i}.png`);
    }

    // --- UI sprites ---
    this.load.image(ASSET_KEYS.GAMEOVER, SPRITE_BASE + 'gameover.png');
    this.load.image(ASSET_KEYS.MESSAGE,  SPRITE_BASE + 'message.png');

    // --- Audio ---
    this.load.audio(AUDIO_KEYS.FLAP,       AUDIO_BASE + 'wing.ogg');
    this.load.audio(AUDIO_KEYS.SCORE,      AUDIO_BASE + 'point.ogg');
    this.load.audio(AUDIO_KEYS.HIT,        AUDIO_BASE + 'hit.ogg');
    this.load.audio(AUDIO_KEYS.DIE,        AUDIO_BASE + 'die.ogg');
    this.load.audio(AUDIO_KEYS.MENU_CLICK, AUDIO_BASE + 'swoosh.ogg');
  }

  public create(): void {
    // Register bird animations (down → mid → up → mid loop)
    const birdDefs = [
      { key: ANIM_KEYS.YELLOW, frames: [ASSET_KEYS.YELLOW_DOWN, ASSET_KEYS.YELLOW_MID, ASSET_KEYS.YELLOW_UP, ASSET_KEYS.YELLOW_MID] },
      { key: ANIM_KEYS.BLUE,   frames: [ASSET_KEYS.BLUE_DOWN,   ASSET_KEYS.BLUE_MID,   ASSET_KEYS.BLUE_UP,   ASSET_KEYS.BLUE_MID]   },
      { key: ANIM_KEYS.RED,    frames: [ASSET_KEYS.RED_DOWN,    ASSET_KEYS.RED_MID,    ASSET_KEYS.RED_UP,    ASSET_KEYS.RED_MID]    },
    ];

    for (const def of birdDefs) {
      this.anims.create({
        key: def.key,
        frames: def.frames.map((f) => ({ key: f })),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Generate procedural particle assets still needed for effects
    const gen = new AssetGenerator(this);
    gen.generateParticles();

    // Init audio (Phaser sounds via AudioManager wrapper)
    audioManager.initPhaser(this);

    this._drawProgress(1);
    this.loadingText.setText('Hotovo!');

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private _drawProgress(value: number): void {
    const { width, height } = this.cameras.main;
    this.progressBar.clear();
    this.progressBar.fillStyle(0xFFD700, 1);
    this.progressBar.fillRoundedRect(
      width / 2 - 107,
      height / 2 - 15,
      214 * value,
      30,
      value >= 1 ? 6 : 4,
    );
  }
}
