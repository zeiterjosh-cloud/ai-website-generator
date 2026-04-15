# KILLFRAME - Tactical Elimination Protocol

A modular, scalable first-person shooter prototype built with JavaScript and Three.js. Features professional, production-style architecture with clean separation of concerns.

![KILLFRAME Banner](https://via.placeholder.com/800x200/0a0a1a/ff00ff?text=KILLFRAME)

## 🎮 Features

### Core Systems

1. **Player System** (`player.js`)
   - First-person controller with WASD movement and mouse look
   - Pointer lock for immersive FPS controls
   - Smooth acceleration and deceleration
   - Head bob and subtle camera sway
   - Health system with damage/death handling

2. **Weapon System** (`weapon.js`)
   - Raycast-based shooting with hit detection
   - Fire rate control
   - Realistic recoil system (camera kickback)
   - Spread/accuracy mechanics
   - Muzzle flash effects
   - Bullet tracers
   - Hit markers with visual feedback

3. **Enemy System** (`enemy.js`)
   - AI with state machine (Idle → Chase → Attack)
   - Health system and death handling
   - Automatic respawn system
   - Difficulty scaling (speed, health, damage)
   - Visual feedback on damage

4. **KILLFRAME System** (`killframe.js`) - *Core Feature*
   - Tracks player performance:
     - Shots fired/hit
     - Accuracy percentage
     - Consecutive hits
     - Reaction times
     - Multi-kills
   - Activates **KILLFRAME MODE** when player performs high-skill sequences:
     - Slow-motion time scale
     - Damage multiplier
     - Score multiplier
     - Visual feedback (screen overlay, UI glow)

5. **Game Manager** (`gameManager.js`)
   - Score tracking with multipliers
   - Wave-based enemy spawning
   - Difficulty progression
   - Game state management (Menu, Playing, Paused, Game Over)
   - High score persistence

6. **UI System** (`ui.js`)
   - Animated crosshair
   - Health bar with segments
   - Score counter with popups
   - Wave indicator
   - KILLFRAME charge meter with glow effects
   - Hit markers
   - Damage overlay
   - Kill notifications
   - Game over statistics screen
   - FPS counter

### Visual Quality

- **Lighting**: Directional sun, ambient fill, colored point lights, rim lighting
- **Shadows**: PCF soft shadow mapping
- **Fog**: Exponential fog for depth
- **Materials**: Emissive neon/glow style
- **Post-processing ready**: Code structure supports bloom effects

## 🚀 Quick Start

### Option 1: Direct Browser (Simplest)

1. Navigate to the game directory
2. Start a local server:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js (npx)
   npx serve .
   
   # Using PHP
   php -S localhost:8080
   ```
3. Open `http://localhost:8080` in your browser

### Option 2: From Project Root

If running from the main ai-website-generator project:

1. Start the server:
   ```bash
   npm start
   ```
2. Navigate to `http://localhost:3000/killframe/`

## 🎯 Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move Forward |
| `S` / `↓` | Move Backward |
| `A` / `←` | Strafe Left |
| `D` / `→` | Strafe Right |
| `Shift` | Sprint |
| `Mouse` | Look Around |
| `Left Click` | Fire Weapon |
| `Escape` | Pause Game |

## 🏗️ Architecture

```
killframe/
├── index.html          # Entry point with Three.js importmap
├── README.md           # This file
└── js/
    ├── main.js         # Game loop, Three.js setup, system orchestration
    ├── player.js       # First-person controller
    ├── weapon.js       # Shooting mechanics
    ├── enemy.js        # AI enemies with state machine
    ├── killframe.js    # Performance tracking & slowmo system
    ├── gameManager.js  # Score, waves, game state
    └── ui.js           # HUD and menus
```

### Design Principles

- **Modular Architecture**: Each system is self-contained with clear interfaces
- **Event-Driven Communication**: Systems communicate via callbacks
- **Clean Separation of Concerns**: Rendering, logic, and UI are separate
- **Efficient Updates**: Delta-time based, time-scale aware updates
- **Professional Code Style**: ES6 classes, JSDoc-ready, consistent naming

## 🔧 Configuration

### Game Balance (in `killframe.js`)

```javascript
this.config = {
    accuracyThreshold: 70,          // % accuracy for bonuses
    consecutiveHitsThreshold: 4,    // Hits for KILLFRAME
    rapidHitWindow: 1.5,            // Seconds for rapid hit detection
    multiKillWindow: 2.0,           // Seconds for multi-kill detection
};

this.killframeParams = {
    duration: 5.0,                  // KILLFRAME mode duration
    timeScale: 0.4,                 // Slow-mo factor
    damageMultiplier: 2.0,          // Damage boost
    scoreMultiplier: 3.0,           // Score boost
};
```

### Enemy Difficulty (in `gameManager.js`)

```javascript
this.maxEnemies = 8;
this.enemiesPerWave = 3;
this.spawnInterval = 4.0;
this.difficulty = 1.0;              // Scales health, speed, damage
```

## 🎨 Visual Customization

### Colors (in various files)

- Primary Accent: `0x00ffff` (Cyan)
- Secondary Accent: `0xff00ff` (Magenta)
- Danger/Enemy: `0xff3333` (Red)
- Score/Positive: `0xffff00` (Yellow)
- Background: `0x0a0a1a` (Dark Blue)

### Lighting (in `main.js`)

Modify the `setupLighting()` method to change the atmosphere.

## 📊 Performance

- Optimized render loop with delta-time capping
- Efficient object pooling for tracers and hit markers
- Shadow map resolution scaled appropriately
- Fog for draw distance management
- Frame rate independent physics

## 🔮 Future Enhancements (Prepared For)

- Post-processing with bloom effect (composer ready)
- Additional weapon types
- Power-ups and pickups
- Multiple enemy variants
- Sound system integration
- Mobile touch controls
- Leaderboards

## 📜 License

MIT License - Free for personal and commercial use.

---

Built with ❤️ and Three.js
