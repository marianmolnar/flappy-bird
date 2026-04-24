import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants.ts';
import { ScoreSystem } from '../systems/ScoreSystem.ts';
import { Pipe } from './Pipe.ts';
import type { DayPhase } from '../types/index.ts';

/**
 * Spawns and manages all active pipe pairs.
 * Handles timing, recycling, and speed updates.
 */
export class PipeManager {
  private scene: Phaser.Scene;
  private pipes: Pipe[] = [];
  private spawnTimer = 0;
  private _dayPhase: DayPhase = 'day';
  private running = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Start spawning pipes */
  public start(phase: DayPhase): void {
    this.running = true;
    this._dayPhase = phase;
    this.spawnTimer = GAME_CONFIG.PIPE_SPAWN_INTERVAL * 0.5; // Spawn first pipe sooner
  }

  /** Stop all pipes (on death/pause) */
  public stop(): void {
    this.running = false;
    this.pipes.forEach((p) => p.stop());
  }

  /** Resume pipes after pause */
  public resume(speed: number): void {
    this.running = true;
    this.pipes.forEach((p) => p.setVelocityX(speed));
  }

  set dayPhase(phase: DayPhase) {
    this._dayPhase = phase;
  }

  /** Get all top and bottom pipe images for collision detection */
  public getPipeImages(): Phaser.Physics.Arcade.Image[] {
    const images: Phaser.Physics.Arcade.Image[] = [];
    for (const pipe of this.pipes) {
      if (pipe.active) {
        images.push(pipe.topBody, pipe.bottomBody);
      }
    }
    return images;
  }

  /** Get all active pipes */
  public getActivePipes(): Pipe[] {
    return this.pipes.filter((p) => p.active);
  }

  /**
   * Update called every frame.
   * @param delta - delta time ms
   * @param speed - current pipe speed in px/s
   */
  public update(delta: number, speed: number): void {
    if (!this.running) return;

    // Spawn timing
    this.spawnTimer += delta;
    if (this.spawnTimer >= GAME_CONFIG.PIPE_SPAWN_INTERVAL) {
      this.spawnTimer = 0;
      this._spawn(speed);
    }

    // Update active pipes
    for (const pipe of this.pipes) {
      if (!pipe.active) continue;
      pipe.setVelocityX(speed);

      // Remove offscreen pipes
      if (pipe.isOffscreen()) {
        pipe.destroy();
      }
    }

    // Clean up destroyed pipes
    this.pipes = this.pipes.filter((p) => p.active);
  }

  /** Destroy all pipes (scene shutdown) */
  public destroyAll(): void {
    this.pipes.forEach((p) => p.destroy());
    this.pipes = [];
  }

  /** Spawn a new pipe pair at the right edge */
  private _spawn(speed: number): void {
    const gapSize = ScoreSystem.getRandomGap();
    const minY = 120;
    const maxY = GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT - 120;
    const gapCenterY = minY + Math.random() * (maxY - minY);
    const x = GAME_CONFIG.WIDTH + 60;

    const pipe = new Pipe(this.scene, x, gapCenterY, gapSize, this._dayPhase);
    pipe.setVelocityX(speed);
    this.pipes.push(pipe);
  }
}
