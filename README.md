# 🐦 Flappy Bird — Modern Remake

A modern web remake of the classic Flappy Bird game. Built with Phaser, TypeScript, Vite, and Tailwind CSS, with unlockable skins, achievements, difficulty modes, persistent stats, and original-style sprites and audio.

Live demo: https://marianmolnar.github.io/flappy-bird/

---

## Screens

```
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│       MAIN MENU         │   │        GAME             │   │       GAME OVER         │
│                         │   │                         │   │                         │
│   🐦 Flappy Bird        │   │          0              │   │      GAME OVER          │
│   Modern remake         │   │                         │   │                         │
│                         │   │    [bird ~~>]           │   │        🥇               │
│  Best: 42               │   │                         │   │      Gold Medal         │
│  Games: 12  Avg: 18     │   │  ══════════  ══════     │   │                         │
│                         │   │              ══════     │   │   Score: 52  Best: 52   │
│  [Yellow][Blue][Red]    │   │                         │   │   🏆 New record!        │
│  [Rainbow]              │   │  ══════════  ══════     │   │                         │
│                         │   │              ══════     │   │      ↺ RETRY            │
│  Difficulty: Normal     │   │                         │   │      ≡ Menu             │
│                         │   │  /\/\/\/\/\/\/\/\/\/\   │   │                         │
│      ▶ PLAY             │   │  ////////////////////////   │                         │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Phaser** | ^4.x | Game engine, physics, scenes, input, rendering |
| **TypeScript** | ^6.x | Strict typing |
| **Vite** | ^8.x | Build tool and development server |
| **Tailwind CSS** | ^4.x | HTML overlay styling |
| **Web Audio / OGG assets** | native | Game audio playback |
| **localStorage** | native | Persistent progress and settings |

---

## Installation

```bash
# Enter the project directory
cd flappy-bird-remake

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

The local dev server runs on `http://localhost:3000`.

---

## Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Flap | `Space` or mouse click | Tap |
| Pause | `P` or `ESC` | — |
| Mute sound | `M` | Sound button in the HUD |
| Debug mode | `D` | — |
| Restart after game over | `Space` or `Enter` | Retry button |
| Return to menu after game over | `ESC` | Menu button |

---

## Features

### Gameplay
- [x] Phaser Arcade Physics with gravity and flap velocity
- [x] Bird rotation based on vertical speed
- [x] Three-frame wing animation
- [x] Procedurally spawned pipe pairs
- [x] Difficulty-based pipe speed and gap size
- [x] Score tracking with persistent high score
- [x] Collision detection for pipes and ground

### Visuals
- [x] Original-style Flappy Bird sprites
- [x] Scrolling background and ground
- [x] Day/night background variants
- [x] Screen shake on collision
- [x] Particle effects for collisions and scoring
- [x] Fade transitions between scenes

### Scenes
- [x] **BootScene** — loading screen and asset preload
- [x] **MenuScene** — main menu, stats, skin picker, settings, achievements
- [x] **GameScene** — active gameplay and HUD
- [x] **GameOverScene** — score, medal, retry/menu actions
- [x] **PauseScene** — pause overlay

### UI & UX
- [x] Score HUD with combo indicator
- [x] Sound toggle in the HUD and menus
- [x] Skin picker with score-based unlocks
- [x] Difficulty settings: Easy, Normal, Hard
- [x] Persistent stats: total games, average score, best score
- [x] Achievement toast notifications
- [x] Responsive Phaser scaling for portrait and landscape screens

### Achievements
- [x] 🐦 **First Flight** — reach a score of 1
- [x] 🌱 **Beginner** — reach a score of 10
- [x] ⚡ **Advanced** — reach a score of 25
- [x] 🔥 **Expert** — reach a score of 50
- [x] 👑 **Legend** — reach a score of 100
- [x] 🏃 **Veteran** — play 10 games
- [x] 🎨 **Collector** — unlock every skin

### Bird Skins

| Skin | Color | Unlock |
|------|-------|--------|
| Yellow | #FFD700 | Default |
| Blue | #4FC3F7 | High score 25+ |
| Red | #FF5252 | High score 50+ |
| Rainbow | #FF6EC7 | High score 100+ |

### Medals

| Medal | Score |
|-------|-------|
| 🥉 Bronze | 10+ |
| 🥈 Silver | 25+ |
| 🥇 Gold | 50+ |
| 💎 Platinum | 100+ |

### Audio
- [x] **Flap** — wing sound
- [x] **Score** — point sound
- [x] **Hit** — collision sound
- [x] **Die** — death sound
- [x] **Menu Click** — UI feedback sound

### Persistence
- [x] High score
- [x] Total games
- [x] Score history
- [x] Selected and unlocked skins
- [x] Achievements
- [x] Difficulty and sound settings

---

## Project Structure

```
flappy-bird-remake/
├── index.html                  # Entry HTML
├── vite.config.ts              # Vite and Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json
├── README.md
├── public/
│   ├── assets/                 # Sprites and audio files
│   └── favicon.svg             # Favicon
└── src/
    ├── main.ts                 # Bootstrap and achievement toasts
    ├── style.css               # Tailwind import and global styles
    ├── config/
    │   ├── constants.ts        # Game constants and asset keys
    │   └── gameConfig.ts       # Phaser game config factory
    ├── scenes/
    │   ├── BootScene.ts        # Loading and asset preload
    │   ├── MenuScene.ts        # Main menu scene
    │   ├── GameScene.ts        # Gameplay scene
    │   ├── GameOverScene.ts    # Game over scene
    │   └── PauseScene.ts       # Pause overlay scene
    ├── entities/
    │   ├── Bird.ts             # Bird physics and animation
    │   ├── Pipe.ts             # Pipe pair entity
    │   ├── PipeManager.ts      # Pipe spawning and recycling
    │   └── Background.ts       # Background and ground scrolling
    ├── systems/
    │   ├── ScoreSystem.ts      # Score, combo, and speed state
    │   ├── AchievementSystem.ts # Achievements and skin unlocks
    │   ├── AudioManager.ts     # Audio wrapper
    │   └── ParticleSystem.ts   # Particle effects
    ├── store/
    │   ├── gameStore.ts        # Progress and persistence
    │   └── settingsStore.ts    # Settings persistence
    ├── ui/
    │   ├── MenuUI.ts           # HTML/Tailwind menu overlay
    │   ├── HUD.ts              # In-game HUD
    │   └── GameOverUI.ts       # Game over overlay
    ├── utils/
    │   ├── storage.ts          # Safe localStorage helper
    │   ├── assetGenerator.ts   # Procedural canvas effects
    │   └── soundGenerator.ts   # Procedural sound helpers
    └── types/
        └── index.ts            # Shared TypeScript types
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Phaser Game                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │BootScene │→ │MenuScene │→ │   GameScene       │  │
│  └──────────┘  └──────────┘  │  ┌─────────────┐ │  │
│                               │  │   Bird      │ │  │
│                    ┌──────────┤  │ PipeManager │ │  │
│                    │PauseScene│  │ Background  │ │  │
│                    └──────────┤  └─────────────┘ │  │
│                               └─────────┬────────┘  │
│                    ┌───────────────────┘            │
│                    ↓                                │
│              ┌───────────────┐                     │
│              │GameOverScene  │                     │
│              └───────────────┘                     │
│                                                     │
│  Systems: ScoreSystem │ AchievementSystem │ Audio   │
│  UI: MenuUI │ HUD │ GameOverUI                    │
│  State: gameStore │ settingsStore                  │
└─────────────────────────────────────────────────────┘
```

---

## Development

```bash
# Dev server with HMR
npm run dev

# Type check
npx tsc --noEmit

# Build and preview
npm run build
npm run preview
```

---

## Deployment

The project is configured for GitHub Pages with:

```ts
base: '/flappy-bird/'
```

Build and publish the `dist` folder:

```bash
npm run build
npx gh-pages -d dist --dotfiles
```

---

## License

MIT © 2024

This is a fan remake built for educational purposes. Flappy Bird is the original work of Dong Nguyen.
