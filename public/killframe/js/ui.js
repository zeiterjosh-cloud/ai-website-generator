/**
 * KILLFRAME - UI System
 * Crosshair, health bar, score counter, and animated KILLFRAME indicator
 */

import { KillframeState } from './killframe.js';
import { GameState } from './gameManager.js';

export class UIManager {
    constructor() {
        // UI Container
        this.container = null;
        
        // UI Elements
        this.elements = {
            crosshair: null,
            healthBar: null,
            healthFill: null,
            healthText: null,
            scoreDisplay: null,
            waveDisplay: null,
            killframeIndicator: null,
            killframeMeter: null,
            killframeFill: null,
            killframeText: null,
            hitMarker: null,
            damageOverlay: null,
            killNotification: null,
            gameOverScreen: null,
            menuScreen: null,
            pauseScreen: null,
            fpsCounter: null
        };
        
        // Animation states
        this.animations = {
            hitMarkerTimer: 0,
            damageFlashTimer: 0,
            killNotificationTimer: 0,
            scorePopups: [],
            killframeGlow: 0
        };
        
        // Killframe visual state
        this.killframeActive = false;
        this.killframeCharge = 0;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.createCrosshair();
        this.createHealthBar();
        this.createScoreDisplay();
        this.createKillframeIndicator();
        this.createHitMarker();
        this.createDamageOverlay();
        this.createKillNotification();
        this.createGameOverScreen();
        this.createMenuScreen();
        this.createPauseScreen();
        this.createFPSCounter();
        
        // Add CSS animations
        this.injectStyles();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'game-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            font-family: 'Orbitron', 'Rajdhani', sans-serif;
            z-index: 1000;
        `;
        document.body.appendChild(this.container);
    }
    
    createCrosshair() {
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.innerHTML = `
            <div class="crosshair-line horizontal"></div>
            <div class="crosshair-line vertical"></div>
            <div class="crosshair-dot"></div>
        `;
        this.container.appendChild(crosshair);
        this.elements.crosshair = crosshair;
    }
    
    createHealthBar() {
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        healthBar.innerHTML = `
            <div class="health-label">HEALTH</div>
            <div class="health-container">
                <div class="health-fill"></div>
                <div class="health-segments">
                    <div class="segment"></div>
                    <div class="segment"></div>
                    <div class="segment"></div>
                    <div class="segment"></div>
                </div>
            </div>
            <div class="health-text">100</div>
        `;
        this.container.appendChild(healthBar);
        this.elements.healthBar = healthBar;
        this.elements.healthFill = healthBar.querySelector('.health-fill');
        this.elements.healthText = healthBar.querySelector('.health-text');
    }
    
    createScoreDisplay() {
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.innerHTML = `
            <div class="score-label">SCORE</div>
            <div class="score-value">0</div>
            <div class="wave-display">WAVE <span class="wave-number">1</span></div>
        `;
        this.container.appendChild(scoreDisplay);
        this.elements.scoreDisplay = scoreDisplay;
        this.elements.waveDisplay = scoreDisplay.querySelector('.wave-number');
    }
    
    createKillframeIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'killframe-indicator';
        indicator.innerHTML = `
            <div class="killframe-container">
                <div class="killframe-meter">
                    <div class="killframe-fill"></div>
                    <div class="killframe-glow"></div>
                </div>
                <div class="killframe-text">KILLFRAME</div>
                <div class="killframe-status">CHARGING</div>
            </div>
        `;
        this.container.appendChild(indicator);
        this.elements.killframeIndicator = indicator;
        this.elements.killframeMeter = indicator.querySelector('.killframe-meter');
        this.elements.killframeFill = indicator.querySelector('.killframe-fill');
        this.elements.killframeText = indicator.querySelector('.killframe-text');
    }
    
    createHitMarker() {
        const hitMarker = document.createElement('div');
        hitMarker.id = 'hit-marker';
        hitMarker.innerHTML = `
            <div class="hit-line tl"></div>
            <div class="hit-line tr"></div>
            <div class="hit-line bl"></div>
            <div class="hit-line br"></div>
        `;
        this.container.appendChild(hitMarker);
        this.elements.hitMarker = hitMarker;
    }
    
    createDamageOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'damage-overlay';
        this.container.appendChild(overlay);
        this.elements.damageOverlay = overlay;
    }
    
    createKillNotification() {
        const notification = document.createElement('div');
        notification.id = 'kill-notification';
        notification.innerHTML = `
            <div class="kill-text">ENEMY ELIMINATED</div>
            <div class="kill-points">+100</div>
        `;
        this.container.appendChild(notification);
        this.elements.killNotification = notification;
    }
    
    createGameOverScreen() {
        const screen = document.createElement('div');
        screen.id = 'game-over-screen';
        screen.style.display = 'none';
        screen.innerHTML = `
            <div class="game-over-content">
                <h1 class="game-over-title">TERMINATED</h1>
                <div class="game-over-stats">
                    <div class="stat-row">
                        <span class="stat-label">FINAL SCORE</span>
                        <span class="stat-value score-final">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">HIGH SCORE</span>
                        <span class="stat-value high-score">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">ENEMIES KILLED</span>
                        <span class="stat-value kills">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">ACCURACY</span>
                        <span class="stat-value accuracy">0%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">WAVES SURVIVED</span>
                        <span class="stat-value waves">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">TIME</span>
                        <span class="stat-value time">0:00</span>
                    </div>
                </div>
                <button class="restart-btn" style="pointer-events: auto;">RESTART</button>
            </div>
        `;
        this.container.appendChild(screen);
        this.elements.gameOverScreen = screen;
    }
    
    createMenuScreen() {
        const screen = document.createElement('div');
        screen.id = 'menu-screen';
        screen.innerHTML = `
            <div class="menu-content">
                <h1 class="game-title">KILLFRAME</h1>
                <p class="game-subtitle">TACTICAL ELIMINATION PROTOCOL</p>
                <div class="menu-instructions">
                    <p><span class="key">WASD</span> - MOVE</p>
                    <p><span class="key">MOUSE</span> - AIM</p>
                    <p><span class="key">CLICK</span> - FIRE</p>
                    <p><span class="key">SHIFT</span> - SPRINT</p>
                </div>
                <button class="start-btn" style="pointer-events: auto;">START MISSION</button>
            </div>
        `;
        this.container.appendChild(screen);
        this.elements.menuScreen = screen;
    }
    
    createPauseScreen() {
        const screen = document.createElement('div');
        screen.id = 'pause-screen';
        screen.style.display = 'none';
        screen.innerHTML = `
            <div class="pause-content">
                <h1 class="pause-title">PAUSED</h1>
                <button class="resume-btn" style="pointer-events: auto;">RESUME</button>
            </div>
        `;
        this.container.appendChild(screen);
        this.elements.pauseScreen = screen;
    }
    
    createFPSCounter() {
        const fpsCounter = document.createElement('div');
        fpsCounter.id = 'fps-counter';
        fpsCounter.textContent = 'FPS: 60';
        this.container.appendChild(fpsCounter);
        this.elements.fpsCounter = fpsCounter;
    }
    
    injectStyles() {
        const style = document.createElement('style');
        // Note: Fonts are preloaded in index.html for better performance
        style.textContent = `
            #game-ui {
                color: #00ffff;
                text-shadow: 0 0 10px #00ffff;
            }
            
            /* Crosshair */
            #crosshair {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
            }
            
            .crosshair-line {
                position: absolute;
                background: #fff;
                box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff;
            }
            
            .crosshair-line.horizontal {
                width: 12px;
                height: 2px;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .crosshair-line.horizontal:first-child {
                left: 0;
            }
            
            .crosshair-line.vertical {
                width: 2px;
                height: 12px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .crosshair-line.vertical:nth-child(2) {
                top: 0;
            }
            
            .crosshair-dot {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #ff0000;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 5px #ff0000;
            }
            
            /* Health Bar */
            #health-bar {
                position: absolute;
                bottom: 30px;
                left: 30px;
                width: 250px;
            }
            
            .health-label {
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 2px;
                margin-bottom: 5px;
                color: #00ffff;
            }
            
            .health-container {
                position: relative;
                height: 20px;
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #00ffff;
                overflow: hidden;
            }
            
            .health-fill {
                height: 100%;
                width: 100%;
                background: linear-gradient(90deg, #00ff00, #00cc00);
                box-shadow: 0 0 10px #00ff00;
                transition: width 0.2s ease;
            }
            
            .health-fill.low {
                background: linear-gradient(90deg, #ff0000, #cc0000);
                box-shadow: 0 0 10px #ff0000;
                animation: pulse 0.5s infinite;
            }
            
            .health-segments {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
            }
            
            .health-segments .segment {
                flex: 1;
                border-right: 1px solid rgba(0, 255, 255, 0.3);
            }
            
            .health-text {
                position: absolute;
                right: -40px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 18px;
                font-weight: 700;
                color: #fff;
            }
            
            /* Score Display */
            #score-display {
                position: absolute;
                top: 30px;
                right: 30px;
                text-align: right;
            }
            
            .score-label {
                font-size: 12px;
                letter-spacing: 2px;
                color: #00ffff;
            }
            
            .score-value {
                font-size: 36px;
                font-weight: 900;
                color: #fff;
                text-shadow: 0 0 20px #00ffff;
            }
            
            .wave-display {
                font-size: 14px;
                margin-top: 5px;
                color: #ff6600;
            }
            
            .wave-number {
                font-weight: 700;
            }
            
            /* Killframe Indicator */
            #killframe-indicator {
                position: absolute;
                bottom: 30px;
                right: 30px;
                width: 200px;
            }
            
            .killframe-container {
                padding: 10px;
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #ff00ff;
            }
            
            .killframe-meter {
                position: relative;
                height: 15px;
                background: rgba(255, 0, 255, 0.2);
                overflow: hidden;
            }
            
            .killframe-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #ff00ff, #ff66ff);
                box-shadow: 0 0 10px #ff00ff;
                transition: width 0.1s ease;
            }
            
            .killframe-glow {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
                pointer-events: none;
            }
            
            .killframe-text {
                margin-top: 5px;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 3px;
                text-align: center;
                color: #ff00ff;
            }
            
            .killframe-status {
                font-size: 10px;
                text-align: center;
                letter-spacing: 1px;
                color: #888;
                margin-top: 3px;
            }
            
            #killframe-indicator.active {
                animation: killframe-glow 0.2s infinite alternate;
            }
            
            #killframe-indicator.active .killframe-container {
                border-color: #fff;
                box-shadow: 0 0 30px #ff00ff, inset 0 0 20px rgba(255, 0, 255, 0.3);
            }
            
            #killframe-indicator.active .killframe-text {
                color: #fff;
                animation: flash 0.1s infinite;
            }
            
            @keyframes killframe-glow {
                from { transform: scale(1); }
                to { transform: scale(1.02); }
            }
            
            @keyframes flash {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            
            /* Hit Marker */
            #hit-marker {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                opacity: 0;
                pointer-events: none;
            }
            
            #hit-marker.active {
                animation: hitmarker-appear 0.15s ease-out;
            }
            
            .hit-line {
                position: absolute;
                width: 10px;
                height: 2px;
                background: #fff;
                box-shadow: 0 0 5px #ff0000;
            }
            
            .hit-line.tl { top: 8px; left: 8px; transform: rotate(-45deg); }
            .hit-line.tr { top: 8px; right: 8px; transform: rotate(45deg); }
            .hit-line.bl { bottom: 8px; left: 8px; transform: rotate(45deg); }
            .hit-line.br { bottom: 8px; right: 8px; transform: rotate(-45deg); }
            
            @keyframes hitmarker-appear {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
            }
            
            /* Damage Overlay */
            #damage-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                opacity: 0;
                background: radial-gradient(transparent 30%, rgba(255, 0, 0, 0.4));
                transition: opacity 0.1s ease;
            }
            
            #damage-overlay.active {
                animation: damage-flash 0.3s ease-out;
            }
            
            @keyframes damage-flash {
                0% { opacity: 0.8; }
                100% { opacity: 0; }
            }
            
            /* Kill Notification */
            #kill-notification {
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                opacity: 0;
                pointer-events: none;
            }
            
            #kill-notification.active {
                animation: kill-notify 1s ease-out;
            }
            
            .kill-text {
                font-size: 18px;
                font-weight: 700;
                letter-spacing: 3px;
                color: #ff6600;
            }
            
            .kill-points {
                font-size: 24px;
                font-weight: 900;
                color: #fff;
            }
            
            @keyframes kill-notify {
                0% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
            }
            
            /* Game Over Screen */
            #game-over-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .game-over-content {
                text-align: center;
            }
            
            .game-over-title {
                font-size: 72px;
                font-weight: 900;
                color: #ff0000;
                text-shadow: 0 0 30px #ff0000;
                margin-bottom: 30px;
                letter-spacing: 10px;
            }
            
            .game-over-stats {
                margin-bottom: 40px;
            }
            
            .stat-row {
                display: flex;
                justify-content: space-between;
                width: 300px;
                margin: 10px auto;
                font-size: 16px;
            }
            
            .stat-label {
                color: #888;
            }
            
            .stat-value {
                color: #fff;
                font-weight: 700;
            }
            
            .restart-btn, .start-btn, .resume-btn {
                padding: 15px 40px;
                font-size: 18px;
                font-weight: 700;
                letter-spacing: 3px;
                background: transparent;
                border: 2px solid #00ffff;
                color: #00ffff;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'Orbitron', sans-serif;
            }
            
            .restart-btn:hover, .start-btn:hover, .resume-btn:hover {
                background: #00ffff;
                color: #000;
                box-shadow: 0 0 20px #00ffff;
            }
            
            /* Menu Screen */
            #menu-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .menu-content {
                text-align: center;
            }
            
            .game-title {
                font-size: 96px;
                font-weight: 900;
                color: #ff00ff;
                text-shadow: 0 0 50px #ff00ff, 0 0 100px #ff00ff;
                margin-bottom: 10px;
                letter-spacing: 15px;
                animation: title-glow 2s infinite alternate;
            }
            
            @keyframes title-glow {
                from { text-shadow: 0 0 50px #ff00ff, 0 0 100px #ff00ff; }
                to { text-shadow: 0 0 30px #ff00ff, 0 0 60px #ff00ff, 0 0 120px #ff00ff; }
            }
            
            .game-subtitle {
                font-size: 14px;
                letter-spacing: 5px;
                color: #666;
                margin-bottom: 50px;
            }
            
            .menu-instructions {
                margin-bottom: 40px;
            }
            
            .menu-instructions p {
                margin: 10px 0;
                font-size: 14px;
                color: #888;
            }
            
            .menu-instructions .key {
                display: inline-block;
                padding: 5px 10px;
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                color: #00ffff;
                margin-right: 10px;
                min-width: 60px;
            }
            
            /* Pause Screen */
            #pause-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .pause-title {
                font-size: 48px;
                color: #00ffff;
                margin-bottom: 30px;
            }
            
            /* FPS Counter */
            #fps-counter {
                position: absolute;
                top: 10px;
                left: 10px;
                font-size: 12px;
                color: #666;
            }
            
            /* Killframe Active Overlay */
            .killframe-active-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                background: radial-gradient(transparent 30%, rgba(255, 0, 255, 0.15));
                border: 4px solid rgba(255, 0, 255, 0.5);
                box-shadow: inset 0 0 100px rgba(255, 0, 255, 0.2);
                animation: killframe-overlay-pulse 0.3s infinite alternate;
            }
            
            @keyframes killframe-overlay-pulse {
                from { opacity: 0.7; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Update methods
    update(deltaTime) {
        // Update animations
        this.updateAnimations(deltaTime);
    }
    
    updateAnimations(deltaTime) {
        // Update score popups
        for (let i = this.animations.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.animations.scorePopups[i];
            popup.timer -= deltaTime;
            
            if (popup.timer <= 0) {
                popup.element.remove();
                this.animations.scorePopups.splice(i, 1);
            }
        }
    }
    
    // Health
    updateHealth(current, max) {
        const percentage = (current / max) * 100;
        this.elements.healthFill.style.width = `${percentage}%`;
        this.elements.healthText.textContent = Math.ceil(current);
        
        // Low health warning
        if (percentage < 30) {
            this.elements.healthFill.classList.add('low');
        } else {
            this.elements.healthFill.classList.remove('low');
        }
    }
    
    // Score
    updateScore(score) {
        const scoreValue = this.elements.scoreDisplay.querySelector('.score-value');
        scoreValue.textContent = score.toLocaleString();
    }
    
    updateWave(wave) {
        this.elements.waveDisplay.textContent = wave;
    }
    
    // Killframe
    updateKillframe(charge, state) {
        this.elements.killframeFill.style.width = `${charge}%`;
        
        const status = this.elements.killframeIndicator.querySelector('.killframe-status');
        
        switch (state) {
            case KillframeState.INACTIVE:
                status.textContent = 'IDLE';
                this.elements.killframeIndicator.classList.remove('active');
                break;
            case KillframeState.CHARGING:
                status.textContent = 'CHARGING';
                this.elements.killframeIndicator.classList.remove('active');
                break;
            case KillframeState.ACTIVE:
                status.textContent = 'ACTIVE';
                this.elements.killframeIndicator.classList.add('active');
                break;
            case KillframeState.COOLDOWN:
                status.textContent = 'COOLDOWN';
                this.elements.killframeIndicator.classList.remove('active');
                break;
        }
    }
    
    activateKillframeOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'killframe-active-overlay';
        overlay.id = 'killframe-overlay';
        document.body.appendChild(overlay);
        this.killframeActive = true;
    }
    
    deactivateKillframeOverlay() {
        const overlay = document.getElementById('killframe-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.killframeActive = false;
    }
    
    // Hit marker
    showHitMarker(isKill = false) {
        this.elements.hitMarker.classList.remove('active');
        void this.elements.hitMarker.offsetWidth; // Trigger reflow
        this.elements.hitMarker.classList.add('active');
        
        if (isKill) {
            this.elements.hitMarker.style.setProperty('--hit-color', '#ff0000');
        } else {
            this.elements.hitMarker.style.setProperty('--hit-color', '#ffffff');
        }
    }
    
    // Damage flash
    showDamageFlash() {
        this.elements.damageOverlay.classList.remove('active');
        void this.elements.damageOverlay.offsetWidth;
        this.elements.damageOverlay.classList.add('active');
    }
    
    // Kill notification
    showKillNotification(points) {
        this.elements.killNotification.querySelector('.kill-points').textContent = `+${points}`;
        this.elements.killNotification.classList.remove('active');
        void this.elements.killNotification.offsetWidth;
        this.elements.killNotification.classList.add('active');
    }
    
    // Score popup
    showScorePopup(points, x, y) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: 16px;
            font-weight: 700;
            color: #ffff00;
            text-shadow: 0 0 10px #ffff00;
            animation: score-popup 0.5s ease-out forwards;
            pointer-events: none;
        `;
        
        this.container.appendChild(popup);
        this.animations.scorePopups.push({
            element: popup,
            timer: 0.5
        });
    }
    
    // FPS
    updateFPS(fps) {
        this.elements.fpsCounter.textContent = `FPS: ${fps}`;
    }
    
    // Screen management
    showMenu() {
        this.elements.menuScreen.style.display = 'flex';
        this.elements.gameOverScreen.style.display = 'none';
        this.elements.pauseScreen.style.display = 'none';
    }
    
    hideMenu() {
        this.elements.menuScreen.style.display = 'none';
    }
    
    showGameOver(stats) {
        this.elements.gameOverScreen.style.display = 'flex';
        
        // Update stats
        const screen = this.elements.gameOverScreen;
        screen.querySelector('.score-final').textContent = stats.score.toLocaleString();
        screen.querySelector('.high-score').textContent = stats.highScore.toLocaleString();
        screen.querySelector('.kills').textContent = stats.totalKills;
        screen.querySelector('.accuracy').textContent = `${stats.accuracy}%`;
        screen.querySelector('.waves').textContent = stats.wavesCompleted;
        
        // Format time
        const minutes = Math.floor(stats.timePlayed / 60);
        const seconds = Math.floor(stats.timePlayed % 60);
        screen.querySelector('.time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    hideGameOver() {
        this.elements.gameOverScreen.style.display = 'none';
    }
    
    showPause() {
        this.elements.pauseScreen.style.display = 'flex';
    }
    
    hidePause() {
        this.elements.pauseScreen.style.display = 'none';
    }
    
    // Button callbacks
    onStartClick(callback) {
        const btn = this.elements.menuScreen.querySelector('.start-btn');
        btn.addEventListener('click', callback);
    }
    
    onRestartClick(callback) {
        const btn = this.elements.gameOverScreen.querySelector('.restart-btn');
        btn.addEventListener('click', callback);
    }
    
    onResumeClick(callback) {
        const btn = this.elements.pauseScreen.querySelector('.resume-btn');
        btn.addEventListener('click', callback);
    }
    
    // Game state handling
    handleGameState(state) {
        switch (state) {
            case GameState.MENU:
                this.showMenu();
                break;
            case GameState.PLAYING:
                this.hideMenu();
                this.hideGameOver();
                this.hidePause();
                break;
            case GameState.PAUSED:
                this.showPause();
                break;
            case GameState.GAME_OVER:
                // Handled separately with stats
                break;
        }
    }
    
    dispose() {
        this.container.remove();
    }
}
