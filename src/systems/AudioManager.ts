import * as Phaser from 'phaser';
import { AUDIO_KEYS } from '../config/constants.ts';
import { getSettings } from '../store/settingsStore.ts';

/**
 * Thin wrapper around Phaser's built-in sound system.
 * Uses the original Flappy Bird audio files loaded in BootScene.
 */
export class AudioManager {
  private scene: Phaser.Scene | null = null;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private initialized = false;

  /** Call after BootScene has finished loading audio assets */
  public initPhaser(scene: Phaser.Scene): void {
    this.scene = scene;
    this._registerSound(AUDIO_KEYS.FLAP,       0.6);
    this._registerSound(AUDIO_KEYS.SCORE,      0.5);
    this._registerSound(AUDIO_KEYS.HIT,        0.8);
    this._registerSound(AUDIO_KEYS.DIE,        0.7);
    this._registerSound(AUDIO_KEYS.MENU_CLICK, 0.5);
    this.initialized = true;
    this.syncWithSettings();
  }

  /** Migrate to a new scene (sounds are global — just update reference) */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
    if (!this.initialized) {
      this.initPhaser(scene);
    }
  }

  /** Play a sound by audio key */
  public play(key: string): void {
    if (!this.initialized) return;
    const settings = getSettings();
    if (!settings.soundEnabled) return;
    const snd = this.sounds.get(key);
    if (snd && !snd.isPlaying) {
      snd.play();
    } else if (snd) {
      // Allow overlapping flaps by creating a new play
      this.scene?.sound.play(key, { volume: 0.6 });
    }
  }

  /** Toggle sound effects */
  public setSoundEnabled(enabled: boolean): void {
    getSettings().setSoundEnabled(enabled);
    this.syncWithSettings();
  }

  /** Toggle music (no ambient in Phaser version — kept for API compatibility) */
  public setMusicEnabled(enabled: boolean): void {
    getSettings().setMusicEnabled(enabled);
  }

  /** Toggle mute for all audio */
  public toggleMute(): void {
    const settings = getSettings();
    const nowEnabled = !settings.soundEnabled;
    this.setSoundEnabled(nowEnabled);
    this.setMusicEnabled(nowEnabled);
  }

  /** Sync global volume with stored settings */
  public syncWithSettings(): void {
    if (!this.scene) return;
    const settings = getSettings();
    this.scene.sound.setMute(!settings.soundEnabled);
  }

  /** No-op kept for interface compatibility */
  public startAmbient(): void { /* no ambient track in this version */ }
  public stopAmbient(): void { /* no ambient track in this version */ }

  private _registerSound(key: string, _volume: number): void {
    if (!this.scene) return;
    // Phaser caches sounds globally — safe to re-add
    if (!this.sounds.has(key) && this.scene.cache.audio.has(key)) {
      const snd = this.scene.sound.add(key, { volume: _volume });
      this.sounds.set(key, snd);
    }
  }
}

/** Singleton audio manager instance */
export const audioManager = new AudioManager();
