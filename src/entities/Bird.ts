import * as Phaser from 'phaser';
import { GAME_CONFIG, ANIM_KEYS, ASSET_KEYS } from '../config/constants.ts';
import { getGameState } from '../store/gameStore.ts';
import type { SkinId } from '../types/index.ts';

/** Maps skin ID to the first-frame texture key and animation key */
const SKIN_MAP: Record<SkinId, { anim: string; midKey: string; tint: number | null }> = {
  yellow:  { anim: ANIM_KEYS.YELLOW, midKey: ASSET_KEYS.YELLOW_MID, tint: null },
  blue:    { anim: ANIM_KEYS.BLUE,   midKey: ASSET_KEYS.BLUE_MID,   tint: null },
  red:     { anim: ANIM_KEYS.RED,    midKey: ASSET_KEYS.RED_MID,    tint: null },
  // Rainbow uses yellow anim with cycling tint
  rainbow: { anim: ANIM_KEYS.YELLOW, midKey: ASSET_KEYS.YELLOW_MID, tint: 0xFF88FF },
};

/**
 * The player-controlled bird.
 * Uses original 34×24 sprites with Phaser animation system.
 * Physics: 1800 px/s² gravity, -480 px/s instant flap velocity.
 */
export class Bird {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private _isDead = false;
  private rainbowTween: Phaser.Tweens.Tween | null = null;
  private readonly skin: SkinId;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.skin = getGameState().selectedSkin;
    const { midKey, tint } = SKIN_MAP[this.skin];

    this.sprite = scene.physics.add.sprite(
      Math.round(GAME_CONFIG.WIDTH * 0.28),
      Math.round(GAME_CONFIG.HEIGHT * 0.45),
      midKey,
    );

    // Original size: 34×24 — display at pixel-perfect 2× for 288-wide canvas
    this.sprite.setScale(1);
    this.sprite.setDepth(20);

    // Circular physics body — slightly smaller than sprite for fairer hitbox
    // radius=9, offsets to centre within 34×24 sprite
    this.sprite.setCircle(9, 8, 3);

    // Disable gravity until game starts
    this.getBody().setGravityY(-GAME_CONFIG.GRAVITY);
    this.getBody().setVelocityY(0);
    this.getBody().setAllowGravity(true);

    // Apply tint for rainbow skin
    if (tint !== null) {
      this.sprite.setTint(tint);
      this._startRainbowTween();
    }
  }

  get isDead(): boolean { return this._isDead; }
  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
  get velocity(): Phaser.Math.Vector2 { return this.getBody().velocity; }
  get physicsSprite(): Phaser.Physics.Arcade.Sprite { return this.sprite; }

  /** Start physics gravity (called when the player first taps) */
  public startPhysics(): void {
    this.getBody().setGravityY(0); // Remove the negative offset — now real gravity applies
  }

  /**
   * Instant velocity flap — original sets velocity to exactly -480 px/s regardless of current vel.
   */
  public flap(): void {
    if (this._isDead) return;
    this.getBody().setVelocityY(GAME_CONFIG.JUMP_VELOCITY);
  }

  /** Start wing animation */
  public startAnim(): void {
    const { anim } = SKIN_MAP[this.skin];
    this.sprite.play(anim);
  }

  public update(_delta: number): void {
    if (this._isDead) return;

    // Rotation: original maps velocity to angle (-25° up, +90° nosedive)
    const vy = this.getBody().velocity.y;
    let targetAngle: number;
    if (vy < 0) {
      // Ascending — tilt up, original clamps at -25°
      targetAngle = Math.max(-25, vy * 0.05);
    } else {
      // Descending — tilt down proportionally, max +90°
      targetAngle = Math.min(90, vy * 0.2);
    }
    this.sprite.angle = Phaser.Math.Linear(this.sprite.angle, targetAngle, 0.3);
  }

  /** Trigger death: brief upward bounce then fall */
  public die(): void {
    this._isDead = true;
    this.sprite.stop(); // Stop wing animation
    this.rainbowTween?.stop();
    this.getBody().setVelocityY(-200);
    this.getBody().setGravityY(GAME_CONFIG.GRAVITY * 0.4);
  }

  /** Check if bird has dropped below the ground line */
  public isOffscreen(): boolean {
    return this.sprite.y + GAME_CONFIG.BIRD_H / 2 >=
      GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT;
  }

  public destroy(): void {
    this.rainbowTween?.stop();
    this.sprite.destroy();
  }

  private getBody(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  private _startRainbowTween(): void {
    const colors = [0xFF5555, 0xFF9900, 0xFFFF00, 0x55FF55, 0x55FFFF, 0x8888FF, 0xFF88FF];
    let idx = 0;
    this.rainbowTween = this.scene.tweens.addCounter({
      from: 0, to: 1, duration: 200,
      repeat: -1,
      onRepeat: () => {
        idx = (idx + 1) % colors.length;
        this.sprite.setTint(colors[idx]);
      },
    });
  }
}
