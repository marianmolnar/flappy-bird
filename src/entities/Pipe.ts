import * as Phaser from 'phaser';
import { GAME_CONFIG, ASSET_KEYS } from '../config/constants.ts';
import type { DayPhase } from '../types/index.ts';

const PIPE_H = GAME_CONFIG.PIPE_HEIGHT; // 320px sprite height

/**
 * A pipe pair: top pipe (flipped) and bottom pipe using the original 52×320 sprites.
 *
 * Positioning:
 *   Top pipe:    flipY=true, centre at gapTop - PIPE_H/2  → bottom edge = gapTop
 *   Bottom pipe: no flip,    centre at gapBottom + PIPE_H/2 → top edge = gapBottom
 */
export class Pipe {
  private topSprite: Phaser.Physics.Arcade.Image;
  private bottomSprite: Phaser.Physics.Arcade.Image;
  private _gapCenterY: number;
  private _passed = false;
  private _active = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    gapCenterY: number,
    gapSize: number,
    phase: DayPhase,
  ) {
    this._gapCenterY = gapCenterY;

    const pipeKey = (phase === 'sunset' || phase === 'night')
      ? ASSET_KEYS.PIPE_RED
      : ASSET_KEYS.PIPE_GREEN;

    const gapHalf  = gapSize / 2;
    const gapTop    = gapCenterY - gapHalf;   // y where top pipe bottom ends
    const gapBottom = gapCenterY + gapHalf;   // y where bottom pipe top starts

    // Top pipe — flip vertically so the cap points downward
    this.topSprite = scene.physics.add.image(x, gapTop - PIPE_H / 2, pipeKey);
    this.topSprite.setFlipY(true);
    this.topSprite.setDepth(15);
    this._initBody(this.topSprite);

    // Bottom pipe — no flip, cap points upward
    this.bottomSprite = scene.physics.add.image(x, gapBottom + PIPE_H / 2, pipeKey);
    this.bottomSprite.setDepth(15);
    this._initBody(this.bottomSprite);
  }

  get x(): number { return this.topSprite.x; }
  get gapCenterY(): number { return this._gapCenterY; }
  get passed(): boolean { return this._passed; }
  set passed(v: boolean) { this._passed = v; }
  get active(): boolean { return this._active; }
  get topBody(): Phaser.Physics.Arcade.Image { return this.topSprite; }
  get bottomBody(): Phaser.Physics.Arcade.Image { return this.bottomSprite; }

  public setVelocityX(speed: number): void {
    (this.topSprite.body    as Phaser.Physics.Arcade.Body).setVelocityX(-speed);
    (this.bottomSprite.body as Phaser.Physics.Arcade.Body).setVelocityX(-speed);
  }

  public stop(): void {
    (this.topSprite.body    as Phaser.Physics.Arcade.Body).setVelocityX(0);
    (this.bottomSprite.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
  }

  public isOffscreen(): boolean {
    return this.topSprite.x < -(GAME_CONFIG.PIPE_WIDTH / 2 + 4);
  }

  public destroy(): void {
    this._active = false;
    this.topSprite.destroy();
    this.bottomSprite.destroy();
  }

  private _initBody(img: Phaser.Physics.Arcade.Image): void {
    const body = img.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
  }
}
