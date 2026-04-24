import * as Phaser from 'phaser';
import { GAME_CONFIG, ASSET_KEYS, DAY_CYCLE_INTERVAL } from '../config/constants.ts';
import type { DayPhase } from '../types/index.ts';

/**
 * Day phases.
 * Night uses the original background-night.png.
 * Sunset / Dawn tint the day background (original had only day & night).
 */
const PHASE_ORDER: DayPhase[] = ['day', 'sunset', 'night', 'dawn'];

/**
 * Parallax background using original Flappy Bird sprites.
 *   Layer 0 — static background image (288×512), cross-faded between day/night
 *   Layer 1 — scrolling base/ground (336×112 tile sprite, matches pipe speed)
 */
export class Background {
  private scene: Phaser.Scene;
  /** Current background image (shown) */
  private bgA: Phaser.GameObjects.Image;
  /** Next background image (faded in during transition) */
  private bgB: Phaser.GameObjects.Image;
  /** Scrolling ground tile */
  private base: Phaser.GameObjects.TileSprite;

  private currentPhase: DayPhase = 'day';
  private phaseIndex = 0;
  private transitioning = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };

    // Background layers (depth 0)
    this.bgA = scene.add.image(width / 2, height / 2, ASSET_KEYS.BG_DAY)
      .setDepth(0);

    this.bgB = scene.add.image(width / 2, height / 2, ASSET_KEYS.BG_DAY)
      .setDepth(0)
      .setAlpha(0);

    // Ground/base — tile sprite so we can scroll it
    // base.png is 336×112; position so top of base is at HEIGHT - GROUND_HEIGHT
    const baseY = height - GAME_CONFIG.GROUND_HEIGHT / 2;
    this.base = scene.add.tileSprite(width / 2, baseY, width, GAME_CONFIG.GROUND_HEIGHT, ASSET_KEYS.BASE)
      .setDepth(18);
  }

  get phase(): DayPhase { return this.currentPhase; }

  /**
   * @param delta     Frame delta in ms
   * @param pipeSpeed Current pipe speed in px/s (ground scrolls at same rate)
   * @param score     Current score (triggers phase changes)
   */
  public update(delta: number, pipeSpeed: number, score: number): void {
    const dt = delta / 1000;

    // Ground scrolls at exactly pipe speed for seamless feel
    this.base.tilePositionX += pipeSpeed * dt;

    // Phase change every DAY_CYCLE_INTERVAL points
    const targetIndex = Math.floor(score / DAY_CYCLE_INTERVAL) % PHASE_ORDER.length;
    if (targetIndex !== this.phaseIndex && !this.transitioning) {
      this.phaseIndex = targetIndex;
      this.currentPhase = PHASE_ORDER[this.phaseIndex];
      this._transitionToPhase(this.currentPhase);
    }
  }

  /** Force-set phase immediately (e.g. on restart) */
  public setPhase(phase: DayPhase): void {
    this.currentPhase = phase;
    this.phaseIndex = PHASE_ORDER.indexOf(phase);
    const tex = this._textureFor(phase);
    const tint = this._tintFor(phase);
    this.bgA.setTexture(tex).setTint(tint).setAlpha(1);
    this.bgB.setAlpha(0);
    this.transitioning = false;
  }

  public destroy(): void {
    this.bgA.destroy();
    this.bgB.destroy();
    this.base.destroy();
  }

  /** Cross-fade to next phase */
  private _transitionToPhase(phase: DayPhase): void {
    this.transitioning = true;
    this.bgB.setTexture(this._textureFor(phase))
      .setTint(this._tintFor(phase))
      .setAlpha(0);

    this.scene.tweens.add({
      targets: this.bgB,
      alpha: 1,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => {
        this.bgA.setTexture(this._textureFor(phase))
          .setTint(this._tintFor(phase))
          .setAlpha(1);
        this.bgB.setAlpha(0);
        this.transitioning = false;
      },
    });
  }

  /** Texture key for a given phase */
  private _textureFor(phase: DayPhase): string {
    return phase === 'night' ? ASSET_KEYS.BG_NIGHT : ASSET_KEYS.BG_DAY;
  }

  /**
   * Tint colour for phases that reuse the day background:
   * - day:    no tint (0xFFFFFF)
   * - sunset: warm orange overlay
   * - dawn:   soft pink/purple overlay
   * - night:  no tint (uses night texture)
   */
  private _tintFor(phase: DayPhase): number {
    switch (phase) {
      case 'sunset': return 0xFFBB88;
      case 'dawn':   return 0xFFCCDD;
      default:       return 0xFFFFFF;
    }
  }
}
