/**
 * KILLFRAME - FPS Prototype
 * Kill Frame System
 * 
 * Core gameplay mechanic that tracks player skill:
 * - Monitors shots fired, hits, and accuracy
 * - Tracks time between hits for reaction speed
 * - Calculates skill sequences
 * - Activates "KILLFRAME MODE" for high performance
 * - Controls time slowdown and damage bonuses
 */

import * as THREE from 'three';

/**
 * Kill Frame configuration
 */
const KILLFRAME_CONFIG = {
    // Meter building
    hitMeterGain: 15,           // Meter gained per hit
    killMeterGain: 30,          // Bonus for killing an enemy
    meterDecayRate: 5,          // Meter lost per second
    meterDecayDelay: 1.5,       // Delay before decay starts
    maxMeter: 100,
    
    // Activation
    activationThreshold: 100,    // Meter needed to activate
    activationDuration: 5,       // Duration in seconds
    
    // Effects
    timeSlowFactor: 0.3,        // Time scale during kill frame
    damageMultiplier: 2,        // Damage bonus during kill frame
    scoreMultiplier: 3,         // Score bonus during kill frame
    
    // Skill tracking
    rapidHitWindow: 0.5,        // Time window for rapid hits
    rapidHitThreshold: 3,       // Hits needed for rapid bonus
    accuracyBonusThreshold: 80, // Accuracy % for bonus meter
    
    // Audio/Visual feedback placeholders
    activationSound: null,
    deactivationSound: null
};

/**
 * Hit record for tracking timing
 */
class HitRecord {
    constructor(timestamp, wasKill = false) {
        this.timestamp = timestamp;
        this.wasKill = wasKill;
    }
}

/**
 * Kill Frame System class
 */
export class KillFrameSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        
        // Meter state
        this.meter = 0;
        this.lastHitTime = 0;
        this.lastMeterGainTime = 0;
        
        // Activation state
        this.isActive = false;
        this.activationTimer = 0;
        this.activationStartTime = 0;
        
        // Hit tracking
        this.recentHits = [];
        this.hitHistoryDuration = 5; // Keep 5 seconds of hit history
        
        // Statistics
        this.totalActivations = 0;
        this.longestStreak = 0;
        this.currentStreak = 0;
        
        // Visual effect references
        this.visualEffects = {
            chromaticAberration: 0,
            vignetteIntensity: 0,
            colorShift: 0
        };
        
        console.log('[KillFrameSystem] Initialized');
    }
    
    /**
     * Record a hit
     * @param {boolean} wasKill - Whether the hit killed an enemy
     */
    recordHit(wasKill = false) {
        const currentTime = this.engine.elapsedTime;
        
        // Add to hit history
        this.recentHits.push(new HitRecord(currentTime, wasKill));
        
        // Update streak
        this.currentStreak++;
        this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
        
        // Calculate meter gain
        let meterGain = wasKill ? KILLFRAME_CONFIG.killMeterGain : KILLFRAME_CONFIG.hitMeterGain;
        
        // Rapid hit bonus
        if (this.checkRapidHits(currentTime)) {
            meterGain *= 1.5;
        }
        
        // Accuracy bonus
        const accuracy = this.engine.weaponSystem.getAccuracy();
        if (accuracy >= KILLFRAME_CONFIG.accuracyBonusThreshold) {
            meterGain *= 1.25;
        }
        
        // Active bonus - gain meter faster while active
        if (this.isActive) {
            meterGain *= 0.5; // Reduced gain while active to balance
        }
        
        // Add meter
        this.addMeter(meterGain);
        
        // Update timing
        this.lastHitTime = currentTime;
        this.lastMeterGainTime = currentTime;
        
        // Check for activation
        if (!this.isActive && this.meter >= KILLFRAME_CONFIG.activationThreshold) {
            this.activate();
        }
    }
    
    /**
     * Record a miss (for streak tracking)
     */
    recordMiss() {
        this.currentStreak = 0;
    }
    
    /**
     * Check for rapid consecutive hits
     */
    checkRapidHits(currentTime) {
        // Count hits within the rapid hit window
        const recentCount = this.recentHits.filter(hit => {
            return currentTime - hit.timestamp < KILLFRAME_CONFIG.rapidHitWindow;
        }).length;
        
        return recentCount >= KILLFRAME_CONFIG.rapidHitThreshold;
    }
    
    /**
     * Add meter value
     */
    addMeter(amount) {
        const previousMeter = this.meter;
        this.meter = Math.min(KILLFRAME_CONFIG.maxMeter, this.meter + amount);
        
        // Visual feedback for meter gain
        const gained = this.meter - previousMeter;
        if (gained > 0) {
            this.engine.uiManager.flashKillframeMeter();
        }
        
        // Update UI
        this.engine.uiManager.updateKillframeMeter(this.meter / KILLFRAME_CONFIG.maxMeter);
    }
    
    /**
     * Activate Kill Frame mode
     */
    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.activationTimer = KILLFRAME_CONFIG.activationDuration;
        this.activationStartTime = this.engine.elapsedTime;
        this.totalActivations++;
        
        // Apply time slow
        this.engine.setTimeScale(KILLFRAME_CONFIG.timeSlowFactor);
        
        // Visual effects
        this.engine.uiManager.activateKillframeMode();
        this.enhanceVisuals();
        
        console.log('[KillFrameSystem] ACTIVATED!');
    }
    
    /**
     * Deactivate Kill Frame mode
     */
    deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.meter = 0;
        
        // Reset time scale
        this.engine.setTimeScale(1.0);
        
        // Reset visuals
        this.engine.uiManager.deactivateKillframeMode();
        this.resetVisuals();
        
        console.log('[KillFrameSystem] Deactivated');
    }
    
    /**
     * Enhance visuals during Kill Frame
     */
    enhanceVisuals() {
        // Increase bloom
        if (this.engine.bloomPass) {
            this.engine.bloomPass.strength = 1.0;
            this.engine.bloomPass.threshold = 0.7;
        }
        
        // Shift fog color
        if (this.engine.scene.fog) {
            this.engine.scene.fog.color.setHex(0x1a0a2e);
        }
    }
    
    /**
     * Reset visuals after Kill Frame
     */
    resetVisuals() {
        // Reset bloom
        if (this.engine.bloomPass) {
            this.engine.bloomPass.strength = 0.5;
            this.engine.bloomPass.threshold = 0.85;
        }
        
        // Reset fog color
        if (this.engine.scene.fog) {
            this.engine.scene.fog.color.setHex(0x0a0a0f);
        }
    }
    
    /**
     * Get current damage multiplier
     */
    getDamageMultiplier() {
        return this.isActive ? KILLFRAME_CONFIG.damageMultiplier : 1;
    }
    
    /**
     * Get current score multiplier
     */
    getScoreMultiplier() {
        return this.isActive ? KILLFRAME_CONFIG.scoreMultiplier : 1;
    }
    
    /**
     * Get time remaining in Kill Frame mode
     */
    getTimeRemaining() {
        return this.isActive ? this.activationTimer : 0;
    }
    
    /**
     * Get meter percentage
     */
    getMeterPercent() {
        return this.meter / KILLFRAME_CONFIG.maxMeter;
    }
    
    /**
     * Reset system state
     */
    reset() {
        this.meter = 0;
        this.lastHitTime = 0;
        this.lastMeterGainTime = 0;
        
        this.isActive = false;
        this.activationTimer = 0;
        
        this.recentHits = [];
        this.currentStreak = 0;
        
        // Reset visuals
        this.resetVisuals();
        this.engine.setTimeScale(1.0);
        
        this.engine.uiManager.updateKillframeMeter(0);
        this.engine.uiManager.deactivateKillframeMode();
        
        console.log('[KillFrameSystem] Reset');
    }
    
    /**
     * Clean up old hit records
     */
    cleanupHitHistory() {
        const currentTime = this.engine.elapsedTime;
        this.recentHits = this.recentHits.filter(hit => {
            return currentTime - hit.timestamp < this.hitHistoryDuration;
        });
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Use unscaled time for activation timer
        const realDelta = this.engine.deltaTime;
        
        // Update active state
        if (this.isActive) {
            this.activationTimer -= realDelta;
            
            // Update UI with remaining time
            const progress = this.activationTimer / KILLFRAME_CONFIG.activationDuration;
            this.engine.uiManager.updateKillframeMeter(progress);
            
            // Pulsing visual effect while active
            this.updateActiveVisuals();
            
            if (this.activationTimer <= 0) {
                this.deactivate();
            }
        } else {
            // Meter decay when not active
            const timeSinceGain = this.engine.elapsedTime - this.lastMeterGainTime;
            
            if (timeSinceGain > KILLFRAME_CONFIG.meterDecayDelay && this.meter > 0) {
                this.meter = Math.max(0, this.meter - KILLFRAME_CONFIG.meterDecayRate * realDelta);
                this.engine.uiManager.updateKillframeMeter(this.meter / KILLFRAME_CONFIG.maxMeter);
            }
            
            // Streak decay after no hits
            const timeSinceHit = this.engine.elapsedTime - this.lastHitTime;
            if (timeSinceHit > 3) {
                this.currentStreak = 0;
            }
        }
        
        // Cleanup old hit records periodically
        if (Math.floor(this.engine.elapsedTime) % 5 === 0) {
            this.cleanupHitHistory();
        }
    }
    
    /**
     * Update visual effects while Kill Frame is active
     */
    updateActiveVisuals() {
        if (!this.isActive) return;
        
        // Pulsing bloom
        const pulse = Math.sin(this.engine.elapsedTime * 8) * 0.2 + 0.8;
        
        if (this.engine.bloomPass) {
            this.engine.bloomPass.strength = 0.8 + pulse * 0.4;
        }
    }
}
