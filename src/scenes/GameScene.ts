import * as Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, AUDIO_KEYS } from '../config/constants.ts';
import { Bird } from '../entities/Bird.ts';
import { PipeManager } from '../entities/PipeManager.ts';
import { Background } from '../entities/Background.ts';
import { ScoreSystem } from '../systems/ScoreSystem.ts';
import { AchievementSystem } from '../systems/AchievementSystem.ts';
import { ParticleSystem } from '../systems/ParticleSystem.ts';
import { audioManager } from '../systems/AudioManager.ts';
import { HUD } from '../ui/HUD.ts';
import { getGameState } from '../store/gameStore.ts';
import { getSettings } from '../store/settingsStore.ts';

type GameState = 'waiting' | 'playing' | 'dead' | 'done';

// Digit sprite widths (original PNG sizes)
const DIGIT_WIDTHS: Record<string, number> = {
  '0':24,'1':16,'2':24,'3':24,'4':24,'5':24,'6':24,'7':24,'8':24,'9':24,
};

/**
 * GameScene — main gameplay scene.
 * Uses original physics: 1800px/s² gravity, -480px/s flap, 120px/s pipes (constant speed).
 */
export class GameScene extends Phaser.Scene {
  private bird!: Bird;
  public  pipeManager!: PipeManager;
  private background!: Background;
  public  scoreSystem!: ScoreSystem;
  private achievementSystem!: AchievementSystem;
  private particleSystem!: ParticleSystem;
  private hud!: HUD;

  private gameState: GameState = 'waiting';
  private deathTimer = 0;
  private readonly DEATH_DELAY = 1400;

  private debugGraphics!: Phaser.GameObjects.Graphics;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private pKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private mKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;

  // Original-style digit sprite score
  private scoreDigits: Phaser.GameObjects.Image[] = [];

  private boundAchievementHandler: (e: Event) => void;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
    this.boundAchievementHandler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      this._showInGameToast(`🏆 ${detail.id}`);
    };
  }

  public create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.gameState = 'waiting';
    this.deathTimer = 0;

    // Hand Phaser scene to AudioManager so it can play sounds
    audioManager.setScene(this);

    // Systems
    this.scoreSystem = new ScoreSystem();
    this.achievementSystem = new AchievementSystem();

    // Background (real sprites)
    this.background = new Background(this);

    // Pipe manager
    this.pipeManager = new PipeManager(this);

    // Bird (real sprites + animations)
    this.bird = new Bird(this);

    // Particles
    this.particleSystem = new ParticleSystem(this);
    this.particleSystem.init();

    // HTML HUD (mute button, debug overlay) — synced to canvas bounds
    this.hud = new HUD();
    this.hud.onMute(() => {
      audioManager.toggleMute();
      this.hud.setMuted(!getSettings().soundEnabled);
    });
    this.hud.setMuted(!getSettings().soundEnabled);
    this._syncHUDToCanvas();
    this.scale.on('resize', this._syncHUDToCanvas, this);

    // Debug graphics
    this.debugGraphics = this.add.graphics().setDepth(100);

    // Input
    const kb = this.input.keyboard!;
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pKey     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.escKey   = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.mKey     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.dKey     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.on('pointerdown', this._handleInput, this);

    // "Tap to start" — use the original message.png
    const msgH = this.textures.get('message').getSourceImage().height as number;
    this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 - 40, 'message')
      .setDepth(50)
      .setName('start-msg');
    void msgH; // suppress unused warning

    // Score display (digit sprites, shown during play)
    this._renderScore(0);

    window.addEventListener('achievement_unlocked', this.boundAchievementHandler);
  }

  public update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this._handleInput();
    if (Phaser.Input.Keyboard.JustDown(this.pKey) || Phaser.Input.Keyboard.JustDown(this.escKey)) {
      if (this.gameState === 'playing') this._pauseGame();
    }
    if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
      audioManager.toggleMute();
      this.hud.setMuted(!getSettings().soundEnabled);
    }
    if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
      this.hud.toggleDebug();
    }

    if (this.gameState === 'waiting') return;

    if (this.gameState === 'dead') {
      this.deathTimer += delta;
      this.bird.update(delta);
      if (this.deathTimer >= this.DEATH_DELAY) {
        this.gameState = 'done';
        this._showGameOver();
      }
      return;
    }

    if (this.gameState === 'done') return;

    this.bird.update(delta);
    this.pipeManager.update(delta, this.scoreSystem.pipeSpeed);
    this.background.update(delta, this.scoreSystem.pipeSpeed, this.scoreSystem.score);
    this.pipeManager.dayPhase = this.background.phase;

    if (this.bird.isOffscreen()) {
      this._triggerDeath();
      return;
    }

    this._checkPipeCollisions();
    this._checkPipePasses();

    if (this.hud.isDebugVisible) {
      this.hud.updateDebug(
        this.game.loop.actualFps,
        this.bird.velocity.y,
        this.scoreSystem.pipeSpeed,
        this.scoreSystem.score,
      );
      this._drawDebug();
    } else {
      this.debugGraphics.clear();
    }
  }

  // ─── Input ──────────────────────────────────────────────────────────────────

  private _handleInput(): void {
    if (this.gameState === 'dead' || this.gameState === 'done') return;

    if (this.gameState === 'waiting') {
      this._startGame();
      return;
    }

    this.bird.flap();
    audioManager.play(AUDIO_KEYS.FLAP);
  }

  private _startGame(): void {
    this.gameState = 'playing';

    // Remove start message
    const msg = this.children.getByName('start-msg');
    msg?.destroy();

    this.bird.startPhysics();
    this.bird.startAnim();
    this.bird.flap();
    audioManager.play(AUDIO_KEYS.FLAP);
    this.pipeManager.start(this.background.phase);
  }

  // ─── Collision ──────────────────────────────────────────────────────────────

  private _checkPipeCollisions(): void {
    const sp = this.bird.physicsSprite;
    const bx = sp.x, by = sp.y, r = 9; // match setCircle radius

    for (const pipe of this.pipeManager.getActivePipes()) {
      for (const img of [pipe.topBody, pipe.bottomBody]) {
        const b = img.getBounds();
        // Circle vs AABB
        const nearX = Phaser.Math.Clamp(bx, b.left, b.right);
        const nearY = Phaser.Math.Clamp(by, b.top, b.bottom);
        const distSq = (bx - nearX) ** 2 + (by - nearY) ** 2;
        if (distSq < r * r) {
          this._triggerDeath();
          return;
        }
      }
    }
  }

  private _checkPipePasses(): void {
    for (const pipe of this.pipeManager.getActivePipes()) {
      if (!pipe.passed && pipe.x < this.bird.x - GAME_CONFIG.PIPE_WIDTH / 2) {
        pipe.passed = true;
        this.scoreSystem.onPipePassed();
        this._renderScore(this.scoreSystem.score);
        audioManager.play(AUDIO_KEYS.SCORE);
        this.particleSystem.emitSparkles(this.bird.x + 28, this.bird.y);
        this.achievementSystem.checkSkinUnlocks(this.scoreSystem.score);
      }
    }
  }

  // ─── Death ──────────────────────────────────────────────────────────────────

  private _triggerDeath(): void {
    if (this.gameState !== 'playing') return;
    this.gameState = 'dead';
    this.deathTimer = 0;

    this.bird.die();
    this.pipeManager.stop();
    audioManager.play(AUDIO_KEYS.HIT);
    this.particleSystem.burstFeathers(this.bird.x, this.bird.y);
    this.cameras.main.shake(250, 0.01);

    this.time.delayedCall(200, () => audioManager.play(AUDIO_KEYS.DIE));
  }

  private _showGameOver(): void {
    const score = this.scoreSystem.score;
    const state = getGameState();
    const isNewHighScore = score > state.highScore;

    state.setHighScore(score);
    state.incrementTotalGames();
    state.addTotalScore(score);

    const unlocked = [
      ...this.achievementSystem.checkScoreAchievements(score),
      ...this.achievementSystem.checkGameCountAchievements(),
    ];
    unlocked.forEach((id) => this.achievementSystem.showToast(id));

    const medal = ScoreSystem.getMedal(score);

    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.GAME_OVER, { score, medal, isNewHighScore });
    });
  }

  // ─── Pause ──────────────────────────────────────────────────────────────────

  private _pauseGame(): void {
    this.pipeManager.stop();
    this.physics.pause();
    this.scene.launch(SCENE_KEYS.PAUSE);
    this.scene.pause();
  }

  // ─── HUD canvas sync ────────────────────────────────────────────────────────

  private _syncHUDToCanvas(): void {
    const rect = this.game.canvas.getBoundingClientRect();
    this.hud.setBounds(rect.left, rect.top, rect.width, rect.height);
  }

  // ─── Score display (digit sprites) ──────────────────────────────────────────

  /**
   * Render score using original digit PNG sprites, centred at top of screen.
   * Matches the original Flappy Bird HUD look.
   */
  private _renderScore(score: number): void {
    // Destroy previous digits
    this.scoreDigits.forEach((d) => d.destroy());
    this.scoreDigits = [];

    const digits = String(score).split('');
    const gap = 2; // pixels between digits

    // Measure total width
    const totalW = digits.reduce((sum, d, i) => {
      return sum + (DIGIT_WIDTHS[d] ?? 24) + (i < digits.length - 1 ? gap : 0);
    }, 0);

    let x = Math.round(GAME_CONFIG.WIDTH / 2 - totalW / 2);
    const y = 28;

    for (const d of digits) {
      const key = `digit-${d}`;
      const img = this.add.image(x + (DIGIT_WIDTHS[d] ?? 24) / 2, y, key);
      img.setDepth(50);
      this.scoreDigits.push(img);
      x += (DIGIT_WIDTHS[d] ?? 24) + gap;
    }
  }

  // ─── Debug ──────────────────────────────────────────────────────────────────

  private _drawDebug(): void {
    this.debugGraphics.clear();

    // Bird circle
    const sp = this.bird.physicsSprite;
    this.debugGraphics.lineStyle(1, 0x00FF00);
    this.debugGraphics.strokeCircle(sp.x, sp.y, 9);

    // Pipe AABBs
    this.debugGraphics.lineStyle(1, 0xFF0000);
    for (const pipe of this.pipeManager.getActivePipes()) {
      const tb = pipe.topBody.getBounds();
      const bb = pipe.bottomBody.getBounds();
      this.debugGraphics.strokeRect(tb.x, tb.y, tb.width, tb.height);
      this.debugGraphics.strokeRect(bb.x, bb.y, bb.width, bb.height);
    }
  }

  private _showInGameToast(message: string): void {
    const toast = this.add.text(GAME_CONFIG.WIDTH / 2, 100, message, {
      fontSize: '11px', color: '#FFD700', stroke: '#000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: toast, y: 75, alpha: 0, duration: 2200, ease: 'Power2',
      onComplete: () => toast.destroy(),
    });
  }

  public shutdown(): void {
    this.scale.off('resize', this._syncHUDToCanvas, this);
    this.hud.destroy();
    this.pipeManager.destroyAll();
    this.background.destroy();
    this.particleSystem.destroy();
    this.scoreDigits.forEach((d) => d.destroy());
    this.scoreDigits = [];
    this.input.off('pointerdown', this._handleInput, this);
    window.removeEventListener('achievement_unlocked', this.boundAchievementHandler);
  }
}
