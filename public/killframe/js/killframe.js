/**
 * KILLFRAME - Core Killframe System
 * Tracks player performance and activates KILLFRAME MODE
 * for high-skill sequences
 */

export const KillframeState = {
    INACTIVE: 'inactive',
    CHARGING: 'charging',
    ACTIVE: 'active',
    COOLDOWN: 'cooldown'
};

export class KillframeSystem {
    constructor() {
        // State
        this.state = KillframeState.INACTIVE;
        
        // Tracking stats
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.consecutiveHits = 0;
        this.hitTimes = [];
        this.killCount = 0;
        this.recentKills = [];
        
        // Thresholds for activation
        this.config = {
            // Accuracy threshold (percentage)
            accuracyThreshold: 70,
            // Minimum shots to consider accuracy
            minShotsForAccuracy: 5,
            // Consecutive hits needed
            consecutiveHitsThreshold: 4,
            // Time window for rapid hits (seconds)
            rapidHitWindow: 1.5,
            // Rapid hits needed within window
            rapidHitsThreshold: 3,
            // Multi-kill window (seconds)
            multiKillWindow: 2.0,
            // Multi-kills needed
            multiKillThreshold: 2
        };
        
        // Killframe mode parameters
        this.killframeParams = {
            duration: 5.0,          // Seconds
            timeScale: 0.4,         // Slow-mo factor
            damageMultiplier: 2.0,  // Damage boost
            scoreMultiplier: 3.0,   // Score boost
            chargeDecayRate: 0.5,   // Charge decay per second
            cooldownDuration: 8.0   // Cooldown after activation
        };
        
        // Charge meter (0-100)
        this.charge = 0;
        this.maxCharge = 100;
        this.chargePerHit = 15;
        this.chargePerKill = 35;
        this.chargePerConsecutiveHit = 5;
        this.chargePerAccuracyBonus = 10;
        this.chargePerRapidHit = 8;
        
        // Active mode tracking
        this.activeTimer = 0;
        this.cooldownTimer = 0;
        
        // Current time scale (for slomo)
        this.currentTimeScale = 1.0;
        this.targetTimeScale = 1.0;
        this.timeScaleLerpSpeed = 5.0;
        
        // Callbacks
        this.onActivate = null;
        this.onDeactivate = null;
        this.onChargeChange = null;
        this.onStateChange = null;
        
        // Performance metrics
        this.metrics = {
            totalAccuracy: 0,
            averageReactionTime: 0,
            peakConsecutiveHits: 0,
            totalKillframeActivations: 0,
            longestKillframeStreak: 0
        };
    }
    
    update(deltaTime) {
        // Update time scale interpolation
        this.updateTimeScale(deltaTime);
        
        switch (this.state) {
            case KillframeState.INACTIVE:
            case KillframeState.CHARGING:
                // Decay charge over time
                this.decayCharge(deltaTime);
                break;
                
            case KillframeState.ACTIVE:
                this.activeTimer -= deltaTime;
                
                if (this.activeTimer <= 0) {
                    this.deactivate();
                }
                break;
                
            case KillframeState.COOLDOWN:
                this.cooldownTimer -= deltaTime;
                
                if (this.cooldownTimer <= 0) {
                    this.setState(KillframeState.INACTIVE);
                }
                break;
        }
        
        // Clean up old hit times
        this.cleanupHitTimes();
        this.cleanupRecentKills();
    }
    
    updateTimeScale(deltaTime) {
        // Smoothly interpolate time scale
        const diff = this.targetTimeScale - this.currentTimeScale;
        if (Math.abs(diff) > 0.01) {
            this.currentTimeScale += diff * this.timeScaleLerpSpeed * deltaTime;
        } else {
            this.currentTimeScale = this.targetTimeScale;
        }
    }
    
    decayCharge(deltaTime) {
        if (this.charge > 0) {
            this.charge = Math.max(0, this.charge - this.killframeParams.chargeDecayRate * deltaTime);
            this.notifyChargeChange();
            
            // Update state based on charge
            if (this.charge > 0 && this.state === KillframeState.INACTIVE) {
                this.setState(KillframeState.CHARGING);
            } else if (this.charge === 0 && this.state === KillframeState.CHARGING) {
                this.setState(KillframeState.INACTIVE);
            }
        }
    }
    
    cleanupHitTimes() {
        const now = performance.now() / 1000;
        const windowSize = this.config.rapidHitWindow * 2;
        
        this.hitTimes = this.hitTimes.filter(t => (now - t) < windowSize);
    }
    
    cleanupRecentKills() {
        const now = performance.now() / 1000;
        
        this.recentKills = this.recentKills.filter(
            t => (now - t) < this.config.multiKillWindow
        );
    }
    
    recordShot() {
        this.shotsFired++;
    }
    
    recordHit(hitData) {
        const now = performance.now() / 1000;
        
        this.shotsHit++;
        this.consecutiveHits++;
        this.hitTimes.push(now);
        
        // Calculate charge bonuses
        let chargeGain = this.chargePerHit;
        
        // Bonus for consecutive hits
        if (this.consecutiveHits > 1) {
            chargeGain += this.chargePerConsecutiveHit * (this.consecutiveHits - 1);
        }
        
        // Bonus for rapid hits
        const rapidHits = this.countRapidHits();
        if (rapidHits >= this.config.rapidHitsThreshold) {
            chargeGain += this.chargePerRapidHit * (rapidHits - this.config.rapidHitsThreshold + 1);
        }
        
        // Add charge
        this.addCharge(chargeGain);
        
        // Update metrics
        this.metrics.peakConsecutiveHits = Math.max(
            this.metrics.peakConsecutiveHits,
            this.consecutiveHits
        );
        
        // Calculate reaction time
        if (hitData && hitData.timeSinceLastHit) {
            this.updateAverageReactionTime(hitData.timeSinceLastHit);
        }
        
        // Check for activation conditions
        this.checkActivationConditions();
    }
    
    recordMiss() {
        this.consecutiveHits = 0;
    }
    
    recordKill(killData) {
        const now = performance.now() / 1000;
        
        this.killCount++;
        this.recentKills.push(now);
        
        // Charge bonus for kills
        let chargeGain = this.chargePerKill;
        
        // Multi-kill bonus
        const multiKillCount = this.recentKills.length;
        if (multiKillCount >= this.config.multiKillThreshold) {
            chargeGain *= (1 + (multiKillCount - 1) * 0.5);
        }
        
        this.addCharge(chargeGain);
        
        // Check for activation
        this.checkActivationConditions();
    }
    
    addCharge(amount) {
        if (this.state === KillframeState.ACTIVE || this.state === KillframeState.COOLDOWN) {
            return;
        }
        
        const previousCharge = this.charge;
        this.charge = Math.min(this.maxCharge, this.charge + amount);
        
        if (this.charge !== previousCharge) {
            this.notifyChargeChange();
        }
        
        // Auto-activate when fully charged
        if (this.charge >= this.maxCharge) {
            this.activate();
        }
    }
    
    countRapidHits() {
        const now = performance.now() / 1000;
        return this.hitTimes.filter(
            t => (now - t) < this.config.rapidHitWindow
        ).length;
    }
    
    checkActivationConditions() {
        // Don't check if already active or on cooldown
        if (this.state === KillframeState.ACTIVE || this.state === KillframeState.COOLDOWN) {
            return;
        }
        
        let shouldActivate = false;
        let activationReason = '';
        
        // Check accuracy threshold
        if (this.shotsFired >= this.config.minShotsForAccuracy) {
            const accuracy = (this.shotsHit / this.shotsFired) * 100;
            if (accuracy >= this.config.accuracyThreshold) {
                // High accuracy contributes to charge, doesn't auto-activate
                this.addCharge(this.chargePerAccuracyBonus);
            }
        }
        
        // Check consecutive hits
        if (this.consecutiveHits >= this.config.consecutiveHitsThreshold) {
            shouldActivate = true;
            activationReason = 'CONSECUTIVE HITS';
        }
        
        // Check rapid hits
        const rapidHits = this.countRapidHits();
        if (rapidHits >= this.config.rapidHitsThreshold + 2) {
            shouldActivate = true;
            activationReason = 'RAPID FIRE';
        }
        
        // Check multi-kills
        if (this.recentKills.length >= this.config.multiKillThreshold) {
            shouldActivate = true;
            activationReason = 'MULTI-KILL';
        }
        
        // Check full charge
        if (this.charge >= this.maxCharge) {
            shouldActivate = true;
            activationReason = 'FULL CHARGE';
        }
        
        if (shouldActivate) {
            this.activate(activationReason);
        }
    }
    
    activate(reason = 'SKILL') {
        if (this.state === KillframeState.ACTIVE) return;
        
        this.setState(KillframeState.ACTIVE);
        this.activeTimer = this.killframeParams.duration;
        this.charge = this.maxCharge; // Fill charge when activated
        
        // Set time scale for slow motion
        this.targetTimeScale = this.killframeParams.timeScale;
        
        // Update metrics
        this.metrics.totalKillframeActivations++;
        
        if (this.onActivate) {
            this.onActivate({
                reason: reason,
                duration: this.killframeParams.duration,
                damageMultiplier: this.killframeParams.damageMultiplier,
                scoreMultiplier: this.killframeParams.scoreMultiplier
            });
        }
    }
    
    deactivate() {
        this.setState(KillframeState.COOLDOWN);
        this.cooldownTimer = this.killframeParams.cooldownDuration;
        this.charge = 0;
        
        // Reset time scale
        this.targetTimeScale = 1.0;
        
        // Reset tracking
        this.consecutiveHits = 0;
        this.hitTimes = [];
        this.recentKills = [];
        
        if (this.onDeactivate) {
            this.onDeactivate();
        }
    }
    
    setState(newState) {
        if (this.state !== newState) {
            const oldState = this.state;
            this.state = newState;
            
            if (this.onStateChange) {
                this.onStateChange(newState, oldState);
            }
        }
    }
    
    notifyChargeChange() {
        if (this.onChargeChange) {
            this.onChargeChange(this.charge, this.maxCharge);
        }
    }
    
    updateAverageReactionTime(reactionTime) {
        // Rolling average
        const alpha = 0.2;
        this.metrics.averageReactionTime = 
            this.metrics.averageReactionTime * (1 - alpha) + reactionTime * alpha;
    }
    
    // Getters for current state
    isActive() {
        return this.state === KillframeState.ACTIVE;
    }
    
    getTimeScale() {
        return this.currentTimeScale;
    }
    
    getDamageMultiplier() {
        return this.isActive() ? this.killframeParams.damageMultiplier : 1.0;
    }
    
    getScoreMultiplier() {
        return this.isActive() ? this.killframeParams.scoreMultiplier : 1.0;
    }
    
    getChargePercentage() {
        return (this.charge / this.maxCharge) * 100;
    }
    
    getActiveTimeRemaining() {
        return this.isActive() ? this.activeTimer : 0;
    }
    
    getCooldownRemaining() {
        return this.state === KillframeState.COOLDOWN ? this.cooldownTimer : 0;
    }
    
    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return (this.shotsHit / this.shotsFired) * 100;
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            currentAccuracy: this.getAccuracy(),
            consecutiveHits: this.consecutiveHits,
            recentKills: this.recentKills.length,
            chargeLevel: this.getChargePercentage()
        };
    }
    
    // Manual activation (for testing or power-ups)
    forceActivate() {
        this.activate('MANUAL');
    }
    
    reset() {
        this.state = KillframeState.INACTIVE;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.consecutiveHits = 0;
        this.hitTimes = [];
        this.killCount = 0;
        this.recentKills = [];
        this.charge = 0;
        this.activeTimer = 0;
        this.cooldownTimer = 0;
        this.currentTimeScale = 1.0;
        this.targetTimeScale = 1.0;
        
        this.notifyChargeChange();
    }
}
