import * as Phaser from 'phaser';
import { GAME_CONFIG, SCENE_KEYS } from './constants.ts';
import { BootScene } from '../scenes/BootScene.ts';
import { MenuScene } from '../scenes/MenuScene.ts';
import { GameScene } from '../scenes/GameScene.ts';
import { GameOverScene } from '../scenes/GameOverScene.ts';
import { PauseScene } from '../scenes/PauseScene.ts';

/** Creates the Phaser game configuration object */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: GAME_CONFIG.GRAVITY },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.NO_CENTER,
      width: 288,
      height: 512,
    },
    scene: [
      BootScene,
      MenuScene,
      GameScene,
      GameOverScene,
      PauseScene,
    ],
    audio: {
      disableWebAudio: false,
    },
    render: {
      antialias: false,
      pixelArt: true,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    input: {
      activePointers: 3,
    },
  };
}

/** Scene key reference re-export for convenience */
export { SCENE_KEYS };
