import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../config/constants.ts';

/**
 * Generates procedural canvas assets that are NOT available as downloaded files.
 * The main sprites (bird, pipe, background, base) are loaded from real files.
 */
export class AssetGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Generate only the effect particles still needed */
  public generateParticles(): void {
    this._generateParticle();
    this._generateFeather();
  }

  /** Small glowing dot for sparkle effects */
  private _generateParticle(): void {
    if (this.scene.textures.exists(ASSET_KEYS.PARTICLE)) return;
    const size = 8;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 200, 1)');
    grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    this.scene.textures.addCanvas(ASSET_KEYS.PARTICLE, canvas);
  }

  /** Small feather for death burst */
  private _generateFeather(): void {
    if (this.scene.textures.exists(ASSET_KEYS.FEATHER)) return;
    const canvas = document.createElement('canvas');
    canvas.width = 14;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(7, 4, 6, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(1, 4);
    ctx.lineTo(13, 4);
    ctx.stroke();

    this.scene.textures.addCanvas(ASSET_KEYS.FEATHER, canvas);
  }
}
