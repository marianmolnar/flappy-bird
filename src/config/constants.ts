import type { SkinConfig } from '../types/index.ts';

/**
 * Core game dimensions matching the original Flappy Bird (288×512).
 * Physics values reverse-engineered from original:
 *   gravity  = 0.5 px/frame² × 60² = 1800 px/s²
 *   flap     = -8  px/frame  × 60   = -480 px/s
 *   speed    = 2   px/frame  × 60   =  120 px/s (original: constant, no increase)
 *   gap      = 100 px (fixed in original, ~90-100 px depending on version)
 *   ground   = 112 px (base.png height)
 */
export const GAME_CONFIG = {
  WIDTH: 288,
  HEIGHT: 512,
  GRAVITY: 1800,
  JUMP_VELOCITY: -480,
  PIPE_SPEED: 120,
  PIPE_SPAWN_INTERVAL: 1700,
  PIPE_GAP_MIN: 100,
  PIPE_GAP_MAX: 120,
  PIPE_WIDTH: 52,
  PIPE_HEIGHT: 320,
  BIRD_W: 34,
  BIRD_H: 24,
  GROUND_HEIGHT: 112,
  /** Original had no speed increase — set to 0 for 1:1, or small value for custom modes */
  SPEED_INCREASE_PER_10_SCORE: 0,
} as const;

/** Difficulty multipliers — speed & gap relative to base values */
export const DIFFICULTY_SETTINGS = {
  easy:   { speedMultiplier: 0.75, gapMultiplier: 1.3 },
  normal: { speedMultiplier: 1.0,  gapMultiplier: 1.0 },
  hard:   { speedMultiplier: 1.3,  gapMultiplier: 0.80 },
} as const;

/** Score thresholds for medals (original: 10/20/30/40 — we keep extended range) */
export const MEDAL_THRESHOLDS = {
  bronze:   10,
  silver:   25,
  gold:     50,
  platinum: 100,
} as const;

/** Score interval for day/night cycle change */
export const DAY_CYCLE_INTERVAL = 20;


export const ACHIEVEMENT_IDS = {
  FIRST_FLIGHT: 'first_flight',
  BEGINNER:     'beginner',
  ADVANCED:     'advanced',
  EXPERT:       'expert',
  LEGEND:       'legend',
  VETERAN:      'veteran',
  COLLECTOR:    'collector',
} as const;

/** Skin configs — original 3 colours + custom rainbow */
export const SKINS: SkinConfig[] = [
  { id: 'yellow',  name: 'Yellow',  color: 0xFFD700, wingColor: 0xFFA500, eyeColor: 0x000000, requiredScore: 0,   label: 'Default'    },
  { id: 'blue',    name: 'Blue',    color: 0x4FC3F7, wingColor: 0x0288D1, eyeColor: 0x000000, requiredScore: 25,  label: 'Score 25+'  },
  { id: 'red',     name: 'Red',     color: 0xFF5252, wingColor: 0xC62828, eyeColor: 0xFFFFFF, requiredScore: 50,  label: 'Score 50+'  },
  { id: 'rainbow', name: 'Rainbow', color: 0xFF6EC7, wingColor: 0xA78BFA, eyeColor: 0xFFFFFF, requiredScore: 100, label: 'Score 100+' },
];

export const STORAGE_KEYS = {
  GAME_STATE: 'flappy_game_state',
  SETTINGS:   'flappy_settings',
} as const;

export const SCENE_KEYS = {
  BOOT:      'BootScene',
  MENU:      'MenuScene',
  GAME:      'GameScene',
  GAME_OVER: 'GameOverScene',
  PAUSE:     'PauseScene',
} as const;

/** Phaser texture/asset keys matching downloaded files */
export const ASSET_KEYS = {
  // Backgrounds (original sprites)
  BG_DAY:   'background-day',
  BG_NIGHT: 'background-night',
  BASE:     'base',

  // Pipes (original sprites)
  PIPE_GREEN: 'pipe-green',
  PIPE_RED:   'pipe-red',

  // Bird frames — 3 colours × 3 frames
  YELLOW_DOWN: 'yellowbird-downflap',
  YELLOW_MID:  'yellowbird-midflap',
  YELLOW_UP:   'yellowbird-upflap',
  BLUE_DOWN:   'bluebird-downflap',
  BLUE_MID:    'bluebird-midflap',
  BLUE_UP:     'bluebird-upflap',
  RED_DOWN:    'redbird-downflap',
  RED_MID:     'redbird-midflap',
  RED_UP:      'redbird-upflap',

  // Score digits (original sprites)
  DIGIT_0: 'digit-0',
  DIGIT_1: 'digit-1',
  DIGIT_2: 'digit-2',
  DIGIT_3: 'digit-3',
  DIGIT_4: 'digit-4',
  DIGIT_5: 'digit-5',
  DIGIT_6: 'digit-6',
  DIGIT_7: 'digit-7',
  DIGIT_8: 'digit-8',
  DIGIT_9: 'digit-9',

  // UI (original sprites)
  GAMEOVER: 'gameover',
  MESSAGE:  'message',

  // Particle (procedural — kept for effects)
  PARTICLE: 'particle',
  FEATHER:  'feather',
} as const;

/** Bird animation keys */
export const ANIM_KEYS = {
  YELLOW: 'bird-yellow',
  BLUE:   'bird-blue',
  RED:    'bird-red',
} as const;

/** Audio file mapping (original .ogg files) */
export const AUDIO_KEYS = {
  FLAP:       'wing',
  SCORE:      'point',
  HIT:        'hit',
  DIE:        'die',
  MENU_CLICK: 'swoosh',
} as const;

export const EVENTS = {
  SCORE_UPDATE:        'score_update',
  GAME_OVER:           'game_over',
  COMBO:               'combo',
  ACHIEVEMENT_UNLOCKED:'achievement_unlocked',
} as const;
