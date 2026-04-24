/**
 * In-game HUD — mute button and optional debug overlay, positioned
 * to overlay exactly the Phaser canvas (call setBounds after canvas is ready).
 */
export class HUD {
  private container: HTMLElement;
  private muteBtn: HTMLElement;
  private debugPanel: HTMLElement;
  private _debugVisible = false;

  constructor() {
    this.container = this._createElement('div', 'hud-container', `
      position: fixed;
      pointer-events: none;
      z-index: 10;
      font-family: 'Segoe UI', sans-serif;
    `);

    // Mute button
    this.muteBtn = this._createElement('button', 'hud-mute', `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.6);
      background: rgba(0,0,0,0.3);
      color: white;
      font-size: 1rem;
      cursor: pointer;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
      transition: background 0.2s;
    `);
    this.muteBtn.textContent = '🔊';
    this.muteBtn.setAttribute('aria-label', 'Toggle mute');

    // Debug panel
    this.debugPanel = this._createElement('div', 'hud-debug', `
      position: absolute;
      bottom: 120px;
      left: 8px;
      background: rgba(0,0,0,0.65);
      color: #0f0;
      font-family: monospace;
      font-size: 0.75rem;
      padding: 6px 10px;
      border-radius: 6px;
      display: none;
      line-height: 1.6;
    `);

    this.container.appendChild(this.muteBtn);
    this.container.appendChild(this.debugPanel);
    document.body.appendChild(this.container);
  }

  /**
   * Sync the HUD overlay to exactly cover the Phaser canvas.
   * Call this once on create and again on every resize event.
   */
  public setBounds(x: number, y: number, w: number, h: number): void {
    this.container.style.left   = `${x}px`;
    this.container.style.top    = `${y}px`;
    this.container.style.width  = `${w}px`;
    this.container.style.height = `${h}px`;
  }

  /** Update debug information panel */
  public updateDebug(fps: number, vy: number, speed: number, score: number): void {
    if (!this._debugVisible) return;
    this.debugPanel.innerHTML = [
      `FPS: ${Math.round(fps)}`,
      `VY: ${Math.round(vy)}`,
      `Speed: ${Math.round(speed)}`,
      `Score: ${score}`,
    ].join('<br>');
  }

  /** Toggle debug panel visibility */
  public toggleDebug(): void {
    this._debugVisible = !this._debugVisible;
    this.debugPanel.style.display = this._debugVisible ? 'block' : 'none';
  }

  get isDebugVisible(): boolean {
    return this._debugVisible;
  }

  /** Register mute button click handler */
  public onMute(callback: () => void): void {
    this.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      callback();
    });
  }

  /** Update mute icon */
  public setMuted(muted: boolean): void {
    this.muteBtn.textContent = muted ? '🔇' : '🔊';
  }

  /** Remove HUD from DOM */
  public destroy(): void {
    this.container.remove();
  }

  private _createElement(tag: string, id: string, style: string): HTMLElement {
    const el = document.createElement(tag);
    el.id = id;
    el.style.cssText = style.replace(/\s+/g, ' ').trim();
    return el;
  }
}
