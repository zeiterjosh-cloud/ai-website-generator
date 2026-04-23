/**
 * KILLFRAME - FPS Prototype
 * UI Manager
 * 
 * Handles all user interface elements:
 * - Crosshair with feedback
 * - Health bar display
 * - Score counter with animations
 * - Ammunition display
 * - Kill Frame indicator and meter
 * - Hit markers and damage indicators
 * - Game over screen
 */

/**
 * UI Manager class
 */
export class UIManager {
    constructor() {
        // Cache DOM elements for performance
        this.elements = {
            // Crosshair
            crosshair: document.getElementById('crosshair'),
            
            // Health
            healthBar: document.getElementById('health-bar'),
            healthValue: document.getElementById('health-value'),
            
            // Score
            scoreValue: document.getElementById('score-value'),
            
            // Ammo
            ammoValue: document.getElementById('ammo-value'),
            
            // Kill Frame
            killframeIndicator: document.getElementById('killframe-indicator'),
            killframeMeter: document.getElementById('killframe-meter'),
            killframeOverlay: document.getElementById('killframe-active-overlay'),
            
            // Hit marker
            hitMarker: document.getElementById('hit-marker'),
            
            // Damage indicator
            damageIndicator: document.getElementById('damage-indicator'),
            
            // Stats
            accuracyStat: document.getElementById('accuracy-stat'),
            killsStat: document.getElementById('kills-stat'),
            
            // Screens
            startScreen: document.getElementById('start-screen'),
            gameoverScreen: document.getElementById('gameover-screen'),
            finalScore: document.getElementById('final-score'),
            finalKills: document.getElementById('final-kills'),
            finalAccuracy: document.getElementById('final-accuracy')
        };
        
        // Animation state
        this.hitMarkerTimeout = null;
        this.damageTimeout = null;
        this.scoreAnimationTimeout = null;
        
        console.log('[UIManager] Initialized');
    }
    
    /**
     * Update health bar display
     */
    updateHealth(current, max) {
        const percent = (current / max) * 100;
        
        this.elements.healthBar.style.width = `${percent}%`;
        this.elements.healthValue.textContent = Math.round(current);
        
        // Low health warning
        if (percent <= 25) {
            this.elements.healthBar.classList.add('low');
        } else {
            this.elements.healthBar.classList.remove('low');
        }
    }
    
    /**
     * Update score display
     */
    updateScore(score, isBonus = false) {
        this.elements.scoreValue.textContent = score.toLocaleString();
        
        if (isBonus) {
            // Add bonus animation
            this.elements.scoreValue.classList.add('bonus');
            
            if (this.scoreAnimationTimeout) {
                clearTimeout(this.scoreAnimationTimeout);
            }
            
            this.scoreAnimationTimeout = setTimeout(() => {
                this.elements.scoreValue.classList.remove('bonus');
            }, 300);
        }
    }
    
    /**
     * Update ammunition display
     */
    updateAmmo(current, reserve) {
        this.elements.ammoValue.textContent = `${current} / ${reserve}`;
        
        // Low ammo warning
        if (current <= 5) {
            this.elements.ammoValue.classList.add('low');
        } else {
            this.elements.ammoValue.classList.remove('low');
        }
    }
    
    /**
     * Update accuracy stat display
     */
    updateAccuracy(accuracy) {
        this.elements.accuracyStat.textContent = `ACCURACY: ${accuracy}%`;
    }
    
    /**
     * Update kills stat display
     */
    updateKills(kills) {
        this.elements.killsStat.textContent = `KILLS: ${kills}`;
    }
    
    /**
     * Update Kill Frame meter
     */
    updateKillframeMeter(percent) {
        this.elements.killframeMeter.style.width = `${percent * 100}%`;
        
        // Ready state when full
        if (percent >= 1) {
            this.elements.killframeIndicator.classList.add('ready');
        } else {
            this.elements.killframeIndicator.classList.remove('ready');
        }
    }
    
    /**
     * Flash Kill Frame meter on gain
     */
    flashKillframeMeter() {
        this.elements.killframeMeter.style.boxShadow = '0 0 20px rgba(255, 0, 255, 1)';
        
        setTimeout(() => {
            this.elements.killframeMeter.style.boxShadow = '';
        }, 100);
    }
    
    /**
     * Activate Kill Frame mode visuals
     */
    activateKillframeMode() {
        this.elements.killframeIndicator.classList.add('active');
        this.elements.killframeOverlay.classList.add('active');
        
        // Crosshair enhancement
        this.elements.crosshair.style.transform = 'translate(-50%, -50%) scale(1.2)';
        this.elements.crosshair.style.filter = 'drop-shadow(0 0 10px rgba(255, 0, 255, 1))';
    }
    
    /**
     * Deactivate Kill Frame mode visuals
     */
    deactivateKillframeMode() {
        this.elements.killframeIndicator.classList.remove('active');
        this.elements.killframeOverlay.classList.remove('active');
        
        // Reset crosshair
        this.elements.crosshair.style.transform = 'translate(-50%, -50%) scale(1)';
        this.elements.crosshair.style.filter = '';
    }
    
    /**
     * Show hit marker
     */
    showHitMarker(isKill = false) {
        const hitMarker = this.elements.hitMarker;
        
        // Clear previous animation
        if (this.hitMarkerTimeout) {
            clearTimeout(this.hitMarkerTimeout);
            hitMarker.classList.remove('show', 'kill');
        }
        
        // Add appropriate classes
        if (isKill) {
            hitMarker.classList.add('kill');
        }
        hitMarker.classList.add('show');
        
        // Also flash crosshair
        this.elements.crosshair.classList.add('hit');
        
        // Remove after animation
        this.hitMarkerTimeout = setTimeout(() => {
            hitMarker.classList.remove('show', 'kill');
            this.elements.crosshair.classList.remove('hit');
        }, 200);
    }
    
    /**
     * Show damage indicator
     */
    showDamage() {
        const indicator = this.elements.damageIndicator;
        
        // Clear previous animation
        if (this.damageTimeout) {
            clearTimeout(this.damageTimeout);
            indicator.classList.remove('show');
        }
        
        // Force reflow for animation restart
        void indicator.offsetWidth;
        
        indicator.classList.add('show');
        
        this.damageTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, 300);
    }
    
    /**
     * Show game over screen
     */
    showGameOver(score, kills, accuracy) {
        this.elements.finalScore.textContent = score.toLocaleString();
        this.elements.finalKills.textContent = kills;
        this.elements.finalAccuracy.textContent = `${accuracy}%`;
        
        this.elements.gameoverScreen.classList.remove('hidden');
    }
    
    /**
     * Hide game over screen
     */
    hideGameOver() {
        this.elements.gameoverScreen.classList.add('hidden');
    }
    
    /**
     * Reset all UI elements
     */
    reset() {
        this.updateHealth(100, 100);
        this.updateScore(0, false);
        this.updateAmmo(30, 90);
        this.updateAccuracy(0);
        this.updateKills(0);
        this.updateKillframeMeter(0);
        
        this.deactivateKillframeMode();
        this.hideGameOver();
        
        // Clear any active animations
        this.elements.hitMarker.classList.remove('show', 'kill');
        this.elements.damageIndicator.classList.remove('show');
        this.elements.crosshair.classList.remove('hit');
        this.elements.scoreValue.classList.remove('bonus');
        this.elements.healthBar.classList.remove('low');
        this.elements.ammoValue.classList.remove('low');
        
        console.log('[UIManager] Reset');
    }
    
    /**
     * Main update loop (for animated elements)
     */
    update(deltaTime) {
        // Currently handled through CSS animations and event-driven updates
        // This method is available for future procedural UI animations
    }
}
