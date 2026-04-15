/**
 * KILLFRAME - FPS Prototype
 * Game Manager
 * 
 * Handles core game logic:
 * - Game state management (playing, paused, game over)
 * - Score tracking and multipliers
 * - Enemy spawning coordination
 * - Difficulty progression
 * - Win/lose conditions
 */

/**
 * Game state enumeration
 */
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

/**
 * Score configuration
 */
const SCORE_CONFIG = {
    killBase: 100,
    hitBase: 10,
    accuracyBonus: 50,
    streakMultiplier: 0.1,
    killFrameMultiplier: 3
};

/**
 * Game Manager class
 */
export class GameManager {
    constructor(gameEngine) {
        this.engine = gameEngine;
        
        // Game state
        this.state = GameState.MENU;
        this.isGameOver = false;
        
        // Score
        this.score = 0;
        this.highScore = this.loadHighScore();
        
        // Statistics
        this.kills = 0;
        this.totalKills = 0;
        this.gameTime = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        
        // Difficulty
        this.difficultyLevel = 1;
        this.difficultyTimer = 0;
        this.difficultyInterval = 30; // Increase difficulty every 30 seconds
        
        // Wave system (optional progressive mode)
        this.currentWave = 1;
        this.waveKillsRequired = 10;
        this.waveKills = 0;
        
        console.log('[GameManager] Initialized');
    }
    
    /**
     * Load high score from local storage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('killframe_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    }
    
    /**
     * Save high score to local storage
     */
    saveHighScore() {
        try {
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('killframe_highscore', this.highScore.toString());
            }
        } catch {
            // Storage not available
        }
    }
    
    /**
     * Add score with multipliers
     */
    addScore(baseAmount, reason = 'generic') {
        let multiplier = 1;
        
        // Kill frame multiplier
        if (this.engine.killFrameSystem.isActive) {
            multiplier *= SCORE_CONFIG.killFrameMultiplier;
        }
        
        // Streak multiplier
        multiplier += this.currentStreak * SCORE_CONFIG.streakMultiplier;
        
        const finalScore = Math.round(baseAmount * multiplier);
        this.score += finalScore;
        
        // Update UI with bonus indicator
        this.engine.uiManager.updateScore(this.score, multiplier > 1);
        
        return finalScore;
    }
    
    /**
     * Handle enemy killed event
     */
    onEnemyKilled() {
        this.kills++;
        this.totalKills++;
        this.waveKills++;
        this.currentStreak++;
        this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
        
        // Calculate score
        let killScore = SCORE_CONFIG.killBase;
        
        // Accuracy bonus
        const accuracy = this.engine.weaponSystem.getAccuracy();
        if (accuracy >= 80) {
            killScore += SCORE_CONFIG.accuracyBonus;
        }
        
        this.addScore(killScore, 'kill');
        
        // Update kills display
        this.engine.uiManager.updateKills(this.kills);
        
        // Check wave completion
        this.checkWaveProgress();
    }
    
    /**
     * Handle player taking damage
     */
    onPlayerDamaged(amount) {
        // Reset streak on damage
        this.currentStreak = 0;
    }
    
    /**
     * Check wave progress
     */
    checkWaveProgress() {
        if (this.waveKills >= this.waveKillsRequired) {
            this.advanceWave();
        }
    }
    
    /**
     * Advance to next wave
     */
    advanceWave() {
        this.currentWave++;
        this.waveKills = 0;
        this.waveKillsRequired = Math.floor(10 + this.currentWave * 2);
        
        // Bonus score for wave completion
        const waveBonus = this.currentWave * 500;
        this.addScore(waveBonus, 'wave');
        
        // Increase difficulty
        this.increaseDifficulty();
        
        console.log(`[GameManager] Wave ${this.currentWave} started!`);
    }
    
    /**
     * Increase game difficulty
     */
    increaseDifficulty() {
        this.difficultyLevel++;
        
        // Enemies spawn faster
        const enemyManager = this.engine.enemyManager;
        if (enemyManager) {
            enemyManager.spawnInterval = Math.max(1.5, enemyManager.spawnInterval - 0.2);
        }
        
        console.log(`[GameManager] Difficulty increased to level ${this.difficultyLevel}`);
    }
    
    /**
     * Handle game over
     */
    gameOver() {
        this.state = GameState.GAME_OVER;
        this.isGameOver = true;
        
        // Save high score
        this.saveHighScore();
        
        // Notify engine
        this.engine.endGame();
        
        console.log('[GameManager] Game Over');
    }
    
    /**
     * Reset game state
     */
    reset() {
        this.state = GameState.PLAYING;
        this.isGameOver = false;
        
        this.score = 0;
        this.kills = 0;
        this.gameTime = 0;
        this.currentStreak = 0;
        
        this.difficultyLevel = 1;
        this.difficultyTimer = 0;
        
        this.currentWave = 1;
        this.waveKills = 0;
        this.waveKillsRequired = 10;
        
        // Reset UI
        this.engine.uiManager.updateScore(0, false);
        this.engine.uiManager.updateKills(0);
        
        console.log('[GameManager] Reset');
    }
    
    /**
     * Pause game
     */
    pause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
        }
    }
    
    /**
     * Resume game
     */
    resume() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
        }
    }
    
    /**
     * Get current game statistics
     */
    getStats() {
        return {
            score: this.score,
            highScore: this.highScore,
            kills: this.kills,
            accuracy: this.engine.weaponSystem?.getAccuracy() || 0,
            gameTime: this.gameTime,
            wave: this.currentWave,
            streak: this.currentStreak,
            bestStreak: this.bestStreak,
            difficulty: this.difficultyLevel
        };
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        if (this.state !== GameState.PLAYING) return;
        
        // Track game time (use real delta)
        this.gameTime += this.engine.deltaTime;
        
        // Difficulty progression over time
        this.difficultyTimer += this.engine.deltaTime;
        
        if (this.difficultyTimer >= this.difficultyInterval) {
            this.increaseDifficulty();
            this.difficultyTimer = 0;
        }
        
        // Check for game over conditions
        if (this.engine.player.isDead) {
            this.gameOver();
        }
    }
}
