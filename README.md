# 🐦 Flappy Bird — Moderní Remake

Kompletní moderní remake klasické hry Flappy Bird jako webová aplikace. Postaveno na Phaser 3, TypeScript a Vite s plným feature setem včetně achievementů, skin pickeru, day/night cyklu a procedurálně generovaných assetů.

---

## Screenshoty

```
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│      HLAVNÍ MENU        │   │        HRA              │   │      GAME OVER          │
│                         │   │                         │   │                         │
│   🐦 Flappy Bird        │   │          0              │   │    ⏸ KONEC HRY          │
│   Moderní remake        │   │                         │   │                         │
│                         │   │    [ptáček ~~>]         │   │        🥇               │
│  Nejlepší: 42           │   │                         │   │    Zlatá medaile        │
│  Her: 12  Průměr: 18    │   │  ══════════  ══════     │   │                         │
│                         │   │              ══════     │   │   Skóre: 52  Best: 52   │
│  [Žlutý][Modrý][Červ.]  │   │                         │   │   🏆 Nový rekord!       │
│  [Duhový]               │   │  ══════════  ══════     │   │                         │
│                         │   │              ══════     │   │      ↺ ZNOVU            │
│  Obtížnost: Normální    │   │                         │   │      ≡ Menu             │
│                         │   │  /\/\/\/\/\/\/\/\/\/\   │   │                         │
│      ▶ HRÁT             │   │  ////////////////////////   │                         │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

---

## Tech Stack

| Technologie | Verze | Účel |
|------------|-------|------|
| **Phaser 3** | ^3.x | Herní engine (fyzika, scény, input, rendering) |
| **TypeScript** | ^5.x | Type safety, strict mode |
| **Vite** | ^8.x | Build tool, HMR dev server |
| **Howler.js** | ^2.x | Pokročilá správa zvuků |
| **Tailwind CSS** | ^4.x | UI overlay styling |
| **Zustand** | ^5.x | State management s localStorage perzistencí |
| **Web Audio API** | native | Procedurální generování zvuků |

---

## Instalace a spuštění

```bash
# Klonování / vstup do složky
cd flappy-bird-remake

# Instalace závislostí
npm install

# Spuštění dev serveru (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production buildu
npm run preview
```

---

## Ovládání

| Akce | Desktop | Mobil |
|------|---------|-------|
| Skok / Mávnutí | `Mezerník` nebo `Klik myší` | Tap |
| Pauza | `P` nebo `ESC` | — |
| Mute zvuku | `M` | Tlačítko 🔊 v HUD |
| Debug mód | `D` | — |
| Restart (Game Over) | `Mezerník` nebo `Enter` | Tlačítko ↺ |
| Menu (Game Over) | `ESC` | Tlačítko ≡ |

---

## Funkce

### Herní mechaniky
- [x] Phaser Arcade Physics s gravitací a skokem
- [x] Rotace ptáčka podle vertikální rychlosti (-20° až +90°)
- [x] 3-frame animace křídel
- [x] Procedurálně generované páry trubek
- [x] Náhodná mezera (min 140px, max 200px, škáluje dle obtížnosti)
- [x] Postupné zrychlování každých 10 bodů (+5 %)
- [x] Combo systém — bonus +2 za průlet těsně středem
- [x] Detekce kolizí s trubkami a zemí (AABB, shrinknutý hitbox)

### Vizuál
- [x] Parallax scrolling pozadí (3 vrstvy: obloha, mraky, silueta města)
- [x] Dynamický cyklus den/noc (Ráno → Západ → Noc → Úsvit, každých 20 bodů)
- [x] Plynulé fade přechody mezi fázemi dne
- [x] Procedurálně generované canvas assety (ptáček, trubky, pozadí, mraky, město)
- [x] Screen shake při smrti (Phaser camera shake)
- [x] Particle efekty: peří při kolizi, třpytky při průletu trubkou
- [x] Fade in/out přechody mezi scénami

### Scény
- [x] **BootScene** — loading bar, generování assetů a zvuků
- [x] **MenuScene** — titulka, statistiky, skin picker, nastavení, achievementy
- [x] **GameScene** — aktivní hra s HUD
- [x] **GameOverScene** — skóre, medaile, restart/menu
- [x] **PauseScene** — pauza (překryvná scéna)

### UI & UX
- [x] Score HUD s combo indikátorem
- [x] Mute tlačítko v HUD
- [x] Skin picker (4 varianty, zamykání dle high score)
- [x] Nastavení obtížnosti (Lehká / Normální / Těžká)
- [x] Přepínač zvuků a hudby
- [x] Statistiky: celkem her, průměrné skóre, nejlepší skóre
- [x] Toast notifikace pro achievementy
- [x] Responsive design (Scale.FIT, portrait i landscape)

### Achievementy
- [x] 🐦 **První let** — dosáhni skóre 1
- [x] 🌱 **Začátečník** — dosáhni skóre 10
- [x] ⚡ **Pokročilý** — dosáhni skóre 25
- [x] 🔥 **Expert** — dosáhni skóre 50
- [x] 👑 **Legenda** — dosáhni skóre 100
- [x] 🏃 **Vytrvalec** — odehraj 10 her
- [x] 🎨 **Sběratel** — odemkni všechny skiny

### Skiny ptáčka
| Skin | Barva | Podmínka |
|------|-------|----------|
| Žlutý | #FFD700 | Výchozí |
| Modrý | #4FC3F7 | High score 25+ |
| Červený | #FF5252 | High score 50+ |
| Duhový | #FF6EC7 | High score 100+ |

### Medaile (Game Over)
| Medaile | Skóre |
|---------|-------|
| 🥉 Bronzová | 10+ |
| 🥈 Stříbrná | 25+ |
| 🥇 Zlatá | 50+ |
| 💎 Platinová | 100+ |

### Zvuky (procedurální, Web Audio API)
- [x] **Flap** — krátký swoosh při skoku
- [x] **Score** — ding při průletu trubkou
- [x] **Hit** — crash při kolizi
- [x] **Die** — sestupný tón při smrti
- [x] **Menu Click** — UI feedback
- [x] **Ambient** — ambientní hudební smyčka (volitelná)

### Perzistence
- [x] Zustand vanilla store s localStorage backendem
- [x] Automatické ukládání: high score, celkem her, skóre, skiny, achievementy
- [x] Error handling pro private mode / quota exceeded

---

## Struktura projektu

```
flappy-bird-remake/
├── index.html                  # Entry HTML
├── vite.config.ts              # Vite + Tailwind konfigurace
├── tsconfig.json               # TypeScript strict config
├── package.json
├── README.md
├── public/
│   └── favicon.svg             # Ptáček favicon
└── src/
    ├── main.ts                 # Bootstrap + achievement toasts
    ├── style.css               # Tailwind import + global styly
    ├── config/
    │   ├── constants.ts        # Veškeré herní konstanty
    │   └── gameConfig.ts       # Phaser game config factory
    ├── scenes/
    │   ├── BootScene.ts        # Loading + asset generování
    │   ├── MenuScene.ts        # Hlavní menu
    │   ├── GameScene.ts        # Herní scéna (hlavní loop)
    │   ├── GameOverScene.ts    # Game over overlay
    │   └── PauseScene.ts       # Pauza (overlay scéna)
    ├── entities/
    │   ├── Bird.ts             # Ptáček (physics, animace)
    │   ├── Pipe.ts             # Pár trubek
    │   ├── PipeManager.ts      # Spawnování a recyklace trubek
    │   └── Background.ts       # Parallax + day/night cyklus
    ├── systems/
    │   ├── ScoreSystem.ts      # Skóre, combo, rychlost
    │   ├── AchievementSystem.ts # Achievementy a skin unlocks
    │   ├── AudioManager.ts     # Howler.js wrapper
    │   └── ParticleSystem.ts   # Particle efekty
    ├── store/
    │   ├── gameStore.ts        # Zustand: progress + persistence
    │   └── settingsStore.ts    # Zustand: nastavení
    ├── ui/
    │   ├── MenuUI.ts           # HTML/Tailwind menu overlay
    │   ├── HUD.ts              # In-game HUD (score, combo, debug)
    │   └── GameOverUI.ts       # Game over overlay
    ├── utils/
    │   ├── storage.ts          # localStorage helper (safe)
    │   ├── assetGenerator.ts   # Procedurální Canvas assety
    │   └── soundGenerator.ts   # Web Audio API zvuky → Blob URL
    └── types/
        └── index.ts            # Sdílené TypeScript typy
```

---

## Architektura

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
│              ┌───────────┐                         │
│              │GameOverScene│                        │
│              └───────────┘                         │
│                                                     │
│  Systems: ScoreSystem │ AchievementSystem │ Audio   │
│  UI: MenuUI (HTML) │ HUD (HTML) │ GameOverUI (HTML) │
│  State: gameStore (Zustand) │ settingsStore         │
└─────────────────────────────────────────────────────┘
```

---

## Konfigurace (src/config/constants.ts)

```typescript
export const GAME_CONFIG = {
  WIDTH: 400,
  HEIGHT: 700,
  GRAVITY: 1200,
  JUMP_VELOCITY: -400,
  PIPE_SPEED: 200,
  PIPE_SPAWN_INTERVAL: 1500,
  PIPE_GAP_MIN: 140,
  PIPE_GAP_MAX: 200,
  BIRD_SIZE: 34,
  GROUND_HEIGHT: 100,
  SPEED_INCREASE_PER_10_SCORE: 0.05,
} as const;
```

---

## Vývoj

```bash
# Dev server s HMR
npm run dev

# Type check
npx tsc --noEmit

# Build + preview
npm run build && npm run preview
```

---

## License

MIT © 2024

Tento projekt je fan remake pro vzdělávací účely. Flappy Bird je původní dílo Dong Nguyen.
