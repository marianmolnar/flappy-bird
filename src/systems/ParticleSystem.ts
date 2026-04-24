import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../config/constants.ts';

/**
 * Manages particle effects: feathers on death, sparkles on pipe pass.
 */
export class ParticleSystem {
  private scene: Phaser.Scene;
  private featherEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private sparkleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Initialize particle emitters */
  public init(): void {
    // Feather burst emitter (triggered on death)
    this.featherEmitter = this.scene.add.particles(0, 0, ASSET_KEYS.FEATHER, {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 500, max: 900 },
      gravityY: 200,
      rotate: { min: -180, max: 180 },
      emitting: false,
      quantity: 0,
    });

    // Sparkle emitter (triggered when passing pipe)
    this.sparkleEmitter = this.scene.add.particles(0, 0, ASSET_KEYS.PARTICLE, {
      speed: { min: 30, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xFFD700, 0xFFFFFF, 0x88FFFF],
      lifespan: { min: 300, max: 600 },
      gravityY: -50,
      emitting: false,
      quantity: 0,
    });

    // Ensure particles render above background but below UI
    this.featherEmitter.setDepth(10);
    this.sparkleEmitter.setDepth(10);
  }

  /**
   * Burst feather particles at bird's position on collision.
   */
  public burstFeathers(x: number, y: number): void {
    if (!this.featherEmitter) return;
    this.featherEmitter.setPosition(x, y);
    this.featherEmitter.explode(12, x, y);
  }

  /**
   * Emit sparkles when bird passes through a pipe gap.
   */
  public emitSparkles(x: number, y: number): void {
    if (!this.sparkleEmitter) return;
    this.sparkleEmitter.setPosition(x, y);
    this.sparkleEmitter.explode(8, x, y);
  }

  /** Set depth for layering */
  public setDepth(depth: number): void {
    this.featherEmitter?.setDepth(depth);
    this.sparkleEmitter?.setDepth(depth);
  }

  /** Destroy all emitters */
  public destroy(): void {
    this.featherEmitter?.destroy();
    this.sparkleEmitter?.destroy();
    this.featherEmitter = null;
    this.sparkleEmitter = null;
  }
}
