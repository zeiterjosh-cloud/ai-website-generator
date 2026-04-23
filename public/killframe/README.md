# KILLFRAME - FPS Prototype

A modular, scalable first-person shooter prototype built with JavaScript and Three.js. This project demonstrates AAA-level game architecture with clean, professional code organization.

![KILLFRAME](https://img.shields.io/badge/KILLFRAME-FPS%20Prototype-ff00ff?style=for-the-badge)

## 🎮 Features

### Core Systems

1. **Player System** (`player.js`)
   - First-person controller with WASD movement and mouse look
   - Smooth acceleration and deceleration
   - Head bob and subtle camera sway effects
   - Pointer lock integration

2. **Weapon System** (`weapon.js`)
   - Raycast-based shooting with hit detection
   - Fire rate control and ammunition management
   - Recoil system with camera kickback
   - Muzzle flash and bullet tracer effects
   - Impact particles on hit

3. **Enemy System** (`enemy.js`)
   - AI state machine (idle, chase, attack)
   - Dynamic pathfinding toward player
   - Health system with visual feedback
   - Death animations and respawn system

4. **KILLFRAME System** (`killframe.js`) - *Core Feature*
   - Tracks shots fired, hits, and accuracy
   - Monitors reaction speed between hits
   - **KILLFRAME MODE**: Activated by high-skill play
     - Slows down time
     - Boosts damage multiplier
     - Enhanced visual effects
     - Score multiplier bonus

5. **Game Manager** (`gameManager.js`)
   - Score tracking with multipliers
   - Game state management
   - Difficulty progression
   - Wave system

6. **UI System** (`ui.js`)
   - Crosshair with hit feedback
   - Health bar with low-health warning
   - Score counter with animations
   - Ammo display
   - KILLFRAME meter and indicator
   - Hit markers and damage indicators

### Visual Quality

- Directional and ambient lighting
- Real-time shadows (PCF Soft)
- Atmospheric fog
- Emissive materials for neon aesthetic
- Post-processing bloom effects
- Cyberpunk-inspired arena design

## 🚀 How to Run

### Option 1: Using the existing server

If you're running the main website:

```bash
npm start
```

Then navigate to: `http://localhost:3000/killframe/`

### Option 2: Using a simple HTTP server

```bash
# Using Python 3
cd public/killframe
python -m http.server 8080

# OR using Node.js with npx
npx serve public/killframe

# OR using PHP
cd public/killframe
php -S localhost:8080
```

Then open: `http://localhost:8080/`

### Option 3: VS Code Live Server

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 🎯 Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move |
| **Mouse** | Look around |
| **Left Click** | Shoot |
| **R** | Reload |
| **Shift** | Sprint |

## 🏆 Gameplay Tips

- **Build Kill Streaks**: Consecutive kills fill the KILLFRAME meter
- **Accuracy Matters**: High accuracy builds meter faster
- **Rapid Hits**: Quick successive hits provide bonus meter gain
- **KILLFRAME MODE**: When active, deal 2x damage and earn 3x score
- **Stay Moving**: Enemies track and attack - keep strafing!

## 📁 Project Structure

```
killframe/
├── index.html          # Entry point with UI elements
├── styles.css          # UI styling and animations
├── README.md           # This file
└── js/
    ├── main.js         # Game engine and initialization
    ├── player.js       # First-person controller
    ├── weapon.js       # Shooting and hit detection
    ├── enemy.js        # AI and enemy management
    ├── killframe.js    # KILLFRAME skill system
    ├── gameManager.js  # Score and game state
    └── ui.js           # HUD and interface
```

## 🔧 Technical Details

### Dependencies
- **Three.js r160** (loaded via CDN)
- **ES Modules** (native browser support)

### Performance Optimizations
- Object pooling for particles
- Efficient raycasting
- Cached DOM references
- Optimized render loop
- Delta time scaling for consistent gameplay

### Browser Support
- Chrome (recommended)
- Firefox
- Edge
- Safari (with WebGL support)

## 🎨 Customization

### Adjusting Difficulty

Edit constants in `enemy.js`:
```javascript
const ENEMY_CONFIG = {
    moveSpeed: 4,
    health: 100,
    attackDamage: 10,
    maxEnemies: 8
};
```

### Tuning KILLFRAME

Edit constants in `killframe.js`:
```javascript
const KILLFRAME_CONFIG = {
    activationThreshold: 100,
    activationDuration: 5,
    timeSlowFactor: 0.3,
    damageMultiplier: 2
};
```

### Weapon Settings

Edit constants in `weapon.js`:
```javascript
const WEAPON_CONFIG = {
    fireRate: 10,
    damage: 25,
    magazineSize: 30,
    recoilAmount: 0.03
};
```

## 📝 Architecture Notes

This prototype follows professional game development patterns:

1. **Modular Design**: Each system is self-contained with clear interfaces
2. **Single Responsibility**: Each class handles one aspect of gameplay
3. **Event-Driven**: Systems communicate through game engine events
4. **Configurable**: Constants are easily adjustable for tuning
5. **Scalable**: Easy to add new features or modify existing ones

## 🔮 Future Enhancements

Potential additions for expanding the prototype:

- [ ] Multiple weapon types
- [ ] Enemy variety (different behaviors)
- [ ] Level/arena variety
- [ ] Sound effects and music
- [ ] Powerup system
- [ ] Leaderboard integration
- [ ] Mobile touch controls
- [ ] Multiplayer support

## 📄 License

This prototype is provided as-is for educational and demonstration purposes.

---

**Built with ❤️ using Three.js**
