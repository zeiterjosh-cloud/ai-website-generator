/**
 * KILLFRAME - Game Manager
 * Handles game state, score, enemy spawning, and overall game flow
 */

import { EnemyManager } from './enemy.js';
import * as THREE from 'three';

export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

export class GameManager {
    constructor(scene) {
        this.scene = scene;
        
        // Game state
        this.state = GameState.MENU;
        this.previousState = null;
        
        // Score system
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.scoreMultiplier = 1.0;
        
        // Scoring values
        this.scoreConfig = {
            hitPoints: 10,
            killPoints: 100,
            headShotBonus: 50,
            consecutiveHitBonus: 5,
            survivalPointsPerSecond: 1
        };
        
        // Enemy management
        this.enemyManager = new EnemyManager(scene);
        this.maxEnemies = 8;
        this.enemiesPerWave = 3;
        this.waveNumber = 0;
        this.enemiesKilledThisWave = 0;
        this.totalEnemiesKilled = 0;
        
        // Spawning
        this.spawnInterval = 4.0;
        this.spawnTimer = 0;
        this.minSpawnInterval = 1.5;
        this.spawnIntervalDecay = 0.9;
        
        // Game time tracking
        this.gameTime = 0;
        this.survivalTime = 0;
        
        // Difficulty scaling
        this.difficulty = 1.0;
        this.difficultyIncreaseRate = 0.05;
        this.maxDifficulty = 3.0;
        
        // Player reference (set externally)
        this.player = null;
        
        // Callbacks
        this.onScoreChange = null;
        this.onWaveComplete = null;
        this.onGameOver = null;
        this.onStateChange = null;
        this.onEnemyKilled = null;
        
        // Stats for end screen
        this.gameStats = {
            totalShots: 0,
            totalHits: 0,
            totalKills: 0,
            maxCombo: 0,
            timePlayed: 0,
            wavesCompleted: 0,
            killframeActivations: 0
        };
    }
    
    setPlayer(player) {
        this.player = player;
    }
    
    update(deltaTime, timeScale = 1.0) {
        if (this.state !== GameState.PLAYING) return;
        
        const scaledDelta = deltaTime * timeScale;
        
        // Update game time
        this.gameTime += scaledDelta;
        this.survivalTime += deltaTime; // Real time
        
        // Survival score
        this.addScore(this.scoreConfig.survivalPointsPerSecond * scaledDelta, false);
        
        // Update enemy spawning
        this.updateSpawning(scaledDelta);
        
        // Update enemies
        if (this.player) {
            this.enemyManager.update(
                deltaTime,
                this.player.position,
                performance.now() / 1000,
                timeScale
            );
        }
        
        // Update difficulty
        this.updateDifficulty(scaledDelta);
        
        // Check game over conditions
        this.checkGameOver();
        
        // Update stats
        this.gameStats.timePlayed = this.survivalTime;
    }
    
    updateSpawning(deltaTime) {
        this.spawnTimer += deltaTime;
        
        const activeEnemies = this.enemyManager.getActiveEnemies().length;
        
        // Spawn if timer elapsed and we need more enemies
        if (this.spawnTimer >= this.spawnInterval && activeEnemies < this.maxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
            
            // Decrease spawn interval over time
            this.spawnInterval = Math.max(
                this.minSpawnInterval,
                this.spawnInterval * this.spawnIntervalDecay
            );
        }
        
        // Check wave completion
        if (this.enemiesKilledThisWave >= this.enemiesPerWave) {
            this.completeWave();
        }
    }
    
    spawnEnemy() {
        if (!this.player) return;
        
        const enemy = this.enemyManager.spawnEnemyRandom(this.player.position);
        
        if (enemy) {
            // Scale enemy stats with difficulty
            enemy.maxHealth = 100 * (1 + (this.difficulty - 1) * 0.3);
            enemy.health = enemy.maxHealth;
            enemy.speed = 3.5 * (1 + (this.difficulty - 1) * 0.2);
            enemy.damage = 10 * (1 + (this.difficulty - 1) * 0.25);
            
            // Set up callbacks
            enemy.onDeath = (data) => this.handleEnemyDeath(data);
            enemy.onAttack = (data) => this.handleEnemyAttack(data);
        }
        
        return enemy;
    }
    
    handleEnemyDeath(data) {
        this.totalEnemiesKilled++;
        this.enemiesKilledThisWave++;
        this.gameStats.totalKills++;
        
        // Award score
        const baseScore = this.scoreConfig.killPoints;
        this.addScore(baseScore);
        
        if (this.onEnemyKilled) {
            this.onEnemyKilled(data);
        }
    }
    
    handleEnemyAttack(data) {
        if (this.player && !this.player.isDead) {
            this.player.takeDamage(data.damage);
        }
    }
    
    completeWave() {
        this.waveNumber++;
        this.enemiesKilledThisWave = 0;
        this.gameStats.wavesCompleted = this.waveNumber;
        
        // Increase enemies per wave
        this.enemiesPerWave = Math.min(10, this.enemiesPerWave + 1);
        
        // Wave completion bonus
        const waveBonus = 500 * this.waveNumber;
        this.addScore(waveBonus);
        
        if (this.onWaveComplete) {
            this.onWaveComplete({
                waveNumber: this.waveNumber,
                bonus: waveBonus
            });
        }
    }
    
    updateDifficulty(deltaTime) {
        // Gradually increase difficulty
        this.difficulty = Math.min(
            this.maxDifficulty,
            this.difficulty + this.difficultyIncreaseRate * deltaTime / 60
        );
    }
    
    addScore(points, useMultiplier = true) {
        const finalPoints = useMultiplier ? 
            Math.floor(points * this.scoreMultiplier) : 
            Math.floor(points);
        
        this.score += finalPoints;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        
        if (this.onScoreChange) {
            this.onScoreChange(this.score, finalPoints);
        }
        
        return finalPoints;
    }
    
    setScoreMultiplier(multiplier) {
        this.scoreMultiplier = multiplier;
    }
    
    recordHit(hitData) {
        this.gameStats.totalHits++;
        this.addScore(this.scoreConfig.hitPoints);
        
        if (hitData && hitData.consecutiveHits) {
            const bonus = this.scoreConfig.consecutiveHitBonus * hitData.consecutiveHits;
            this.addScore(bonus);
            this.gameStats.maxCombo = Math.max(
                this.gameStats.maxCombo,
                hitData.consecutiveHits
            );
        }
    }
    
    recordShot() {
        this.gameStats.totalShots++;
    }
    
    recordKillframeActivation() {
        this.gameStats.killframeActivations++;
    }
    
    checkGameOver() {
        if (this.player && this.player.isDead) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.setState(GameState.GAME_OVER);
        this.saveHighScore();
        
        if (this.onGameOver) {
            this.onGameOver({
                score: this.score,
                highScore: this.highScore,
                stats: this.getGameStats()
            });
        }
    }
    
    startGame() {
        this.reset();
        this.setState(GameState.PLAYING);
        
        // Initial enemy spawn
        for (let i = 0; i < 3; i++) {
            this.spawnEnemy();
        }
    }
    
    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.previousState = this.state;
            this.setState(GameState.PAUSED);
        }
    }
    
    resumeGame() {
        if (this.state === GameState.PAUSED && this.previousState) {
            this.setState(this.previousState);
            this.previousState = null;
        }
    }
    
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        if (this.onStateChange) {
            this.onStateChange(newState, oldState);
        }
    }
    
    reset() {
        // Reset score
        this.score = 0;
        this.scoreMultiplier = 1.0;
        
        // Reset waves
        this.waveNumber = 0;
        this.enemiesKilledThisWave = 0;
        this.enemiesPerWave = 3;
        this.totalEnemiesKilled = 0;
        
        // Reset spawning
        this.spawnInterval = 4.0;
        this.spawnTimer = 0;
        
        // Reset time
        this.gameTime = 0;
        this.survivalTime = 0;
        
        // Reset difficulty
        this.difficulty = 1.0;
        
        // Clear enemies
        this.enemyManager.clear();
        
        // Reset player
        if (this.player) {
            this.player.respawn();
        }
        
        // Reset stats
        this.gameStats = {
            totalShots: 0,
            totalHits: 0,
            totalKills: 0,
            maxCombo: 0,
            timePlayed: 0,
            wavesCompleted: 0,
            killframeActivations: 0
        };
        
        if (this.onScoreChange) {
            this.onScoreChange(this.score, 0);
        }
    }
    
    getGameStats() {
        return {
            ...this.gameStats,
            accuracy: this.gameStats.totalShots > 0 ? 
                (this.gameStats.totalHits / this.gameStats.totalShots * 100).toFixed(1) : 0,
            score: this.score,
            highScore: this.highScore,
            wave: this.waveNumber,
            difficulty: this.difficulty.toFixed(2)
        };
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('killframe_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('killframe_highscore', this.highScore.toString());
        } catch {
            // Storage not available
        }
    }
    
    getEnemies() {
        return this.enemyManager.getAllEnemies();
    }
    
    getActiveEnemies() {
        return this.enemyManager.getActiveEnemies();
    }
    
    isPlaying() {
        return this.state === GameState.PLAYING;
    }
    
    isPaused() {
        return this.state === GameState.PAUSED;
    }
    
    isGameOver() {
        return this.state === GameState.GAME_OVER;
    }
    
    dispose() {
        this.enemyManager.dispose();
    }
}
