import './style.css';
import * as Phaser from 'phaser';
import { createGameConfig } from './config/gameConfig.ts';

/** Achievement toast listener for global notifications */
function setupAchievementToasts(): void {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    pointer-events: none;
  `;
  document.body.appendChild(container);

  window.addEventListener('achievement_unlocked', (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(20, 20, 30, 0.95);
      color: #FFD700;
      border: 1px solid rgba(255, 215, 0, 0.4);
      padding: 10px 22px;
      border-radius: 24px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      opacity: 0;
      transition: opacity 0.35s, transform 0.35s;
      transform: translateY(12px);
      white-space: nowrap;
    `;
    toast.textContent = `🏆 Achievement odemčen: ${detail.id}`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  });
}

/** Bootstrap the Phaser game */
function main(): void {
  const config = createGameConfig();

  // Ensure game container exists
  let container = document.getElementById('game-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'game-container';
    document.body.appendChild(container);
  }

  setupAchievementToasts();
  new Phaser.Game(config);
}

main();
