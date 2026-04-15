/**
 * KILLFRAME - FPS Prototype
 * Enemy System
 * 
 * Handles enemy AI and behavior:
 * - State machine (idle, chase, attack)
 * - Pathfinding toward player
 * - Health system and damage
 * - Death handling and respawn
 * - Visual representation
 */

import * as THREE from 'three';

/**
 * Enemy configuration
 */
const ENEMY_CONFIG = {
    // Movement
    moveSpeed: 4,
    chaseSpeed: 6,
    rotationSpeed: 3,
    
    // Combat
    health: 100,
    attackDamage: 10,
    attackRange: 2.5,
    attackCooldown: 1.0,
    detectionRange: 30,
    
    // Visual
    height: 1.8,
    radius: 0.5,
    
    // Spawn
    respawnDelay: 3.0,
    maxEnemies: 8
};

/**
 * Enemy states
 */
const EnemyState = {
    IDLE: 'idle',
    CHASE: 'chase',
    ATTACK: 'attack',
    DEAD: 'dead'
};

/**
 * Individual Enemy class
 */
class Enemy {
    constructor(manager, position) {
        this.manager = manager;
        this.scene = manager.scene;
        this.engine = manager.engine;
        
        // Position and movement
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.targetDirection = new THREE.Vector3();
        
        // State
        this.state = EnemyState.IDLE;
        this.health = ENEMY_CONFIG.health;
        this.maxHealth = ENEMY_CONFIG.health;
        this.isDead = false;
        
        // Timers
        this.attackTimer = 0;
        this.stateTimer = 0;
        this.idleDuration = 1 + Math.random() * 2;
        
        // Animation state
        this.animationPhase = Math.random() * Math.PI * 2;
        
        // Create visual mesh
        this.createMesh();
    }
    
    /**
     * Create enemy visual representation
     */
    createMesh() {
        // Main body (glowing enemy design)
        const bodyGeometry = new THREE.CylinderGeometry(
            ENEMY_CONFIG.radius * 0.7,
            ENEMY_CONFIG.radius,
            ENEMY_CONFIG.height * 0.8,
            8
        );
        
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0x660000,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.7
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.isEnemy = true;
        this.mesh.userData.enemyRef = this;
        
        // Head/eye area
        const headGeometry = new THREE.SphereGeometry(ENEMY_CONFIG.radius * 0.5, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = ENEMY_CONFIG.height * 0.35;
        this.mesh.add(this.head);
        
        // Eye glow
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            toneMapped: false
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0, 0.35);
        this.head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0, 0.35);
        this.head.add(rightEye);
        
        // Health bar above enemy
        this.createHealthBar();
        
        // Update position
        this.mesh.position.copy(this.position);
        this.mesh.position.y = ENEMY_CONFIG.height / 2;
        
        this.scene.add(this.mesh);
    }
    
    /**
     * Create health bar display
     */
    createHealthBar() {
        const barWidth = 1;
        const barHeight = 0.1;
        
        // Background
        const bgGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        this.healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
        this.healthBarBg.position.y = ENEMY_CONFIG.height * 0.6;
        this.mesh.add(this.healthBarBg);
        
        // Health fill
        const fillGeometry = new THREE.PlaneGeometry(barWidth - 0.05, barHeight - 0.02);
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide
        });
        this.healthBarFill = new THREE.Mesh(fillGeometry, fillMaterial);
        this.healthBarFill.position.z = 0.01;
        this.healthBarBg.add(this.healthBarFill);
    }
    
    /**
     * Update health bar display
     */
    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBarFill.scale.x = healthPercent;
        this.healthBarFill.position.x = (1 - healthPercent) * -0.475;
        
        // Color based on health
        if (healthPercent > 0.5) {
            this.healthBarFill.material.color.setHex(0x00ff00);
        } else if (healthPercent > 0.25) {
            this.healthBarFill.material.color.setHex(0xffff00);
        } else {
            this.healthBarFill.material.color.setHex(0xff0000);
        }
        
        // Face camera
        const camera = this.engine.camera;
        this.healthBarBg.lookAt(camera.position);
    }
    
    /**
     * Take damage
     * @returns {boolean} true if killed
     */
    takeDamage(amount) {
        if (this.isDead) return false;
        
        // Apply killframe damage bonus
        const damageMultiplier = this.engine.killFrameSystem.isActive ? 2 : 1;
        const finalDamage = amount * damageMultiplier;
        
        this.health -= finalDamage;
        this.updateHealthBar();
        
        // Flash effect
        this.flashDamage();
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        // Aggro on damage
        if (this.state === EnemyState.IDLE) {
            this.setState(EnemyState.CHASE);
        }
        
        return false;
    }
    
    /**
     * Flash red when taking damage
     */
    flashDamage() {
        const originalColor = this.mesh.material.emissive.getHex();
        this.mesh.material.emissive.setHex(0xffffff);
        this.mesh.material.emissiveIntensity = 1.5;
        
        setTimeout(() => {
            if (!this.isDead) {
                this.mesh.material.emissive.setHex(originalColor);
                this.mesh.material.emissiveIntensity = 0.5;
            }
        }, 100);
    }
    
    /**
     * Handle enemy death
     */
    die() {
        this.isDead = true;
        this.setState(EnemyState.DEAD);
        
        // Notify game manager
        this.engine.gameManager.onEnemyKilled();
        
        // Death animation (scale down and fade)
        this.deathAnimation();
    }
    
    /**
     * Death animation
     */
    deathAnimation() {
        const duration = 0.5;
        const startTime = this.engine.elapsedTime;
        
        const animate = () => {
            if (!this.mesh) return;
            
            const elapsed = this.engine.elapsedTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Scale down
            const scale = 1 - progress;
            this.mesh.scale.set(scale, scale, scale);
            
            // Fade
            this.mesh.material.opacity = 1 - progress;
            this.mesh.material.transparent = true;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.remove();
                this.manager.scheduleRespawn();
            }
        };
        
        animate();
    }
    
    /**
     * Remove enemy from scene
     */
    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
    
    /**
     * Set enemy state
     */
    setState(newState) {
        if (this.state === newState) return;
        
        this.state = newState;
        this.stateTimer = 0;
        
        // State enter logic
        switch (newState) {
            case EnemyState.IDLE:
                this.idleDuration = 1 + Math.random() * 2;
                break;
            case EnemyState.CHASE:
                break;
            case EnemyState.ATTACK:
                this.attackTimer = 0;
                break;
        }
    }
    
    /**
     * Get distance to player
     */
    getDistanceToPlayer() {
        const playerPos = this.engine.player.position;
        return this.position.distanceTo(playerPos);
    }
    
    /**
     * Get direction to player
     */
    getDirectionToPlayer() {
        const playerPos = this.engine.player.position;
        const direction = new THREE.Vector3();
        direction.subVectors(playerPos, this.position);
        direction.y = 0;
        direction.normalize();
        return direction;
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        if (this.isDead) return;
        
        this.stateTimer += deltaTime;
        this.animationPhase += deltaTime * 3;
        
        // State machine update
        switch (this.state) {
            case EnemyState.IDLE:
                this.updateIdle(deltaTime);
                break;
            case EnemyState.CHASE:
                this.updateChase(deltaTime);
                break;
            case EnemyState.ATTACK:
                this.updateAttack(deltaTime);
                break;
        }
        
        // Update visuals
        this.updateVisuals(deltaTime);
        this.updateHealthBar();
    }
    
    /**
     * Update idle state
     */
    updateIdle(deltaTime) {
        // Check for player detection
        const distance = this.getDistanceToPlayer();
        
        if (distance < ENEMY_CONFIG.detectionRange) {
            this.setState(EnemyState.CHASE);
            return;
        }
        
        // Random movement while idle
        if (this.stateTimer > this.idleDuration) {
            // Pick new random direction
            this.targetDirection.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
            
            this.stateTimer = 0;
            this.idleDuration = 1 + Math.random() * 2;
        }
        
        // Move slowly
        this.moveInDirection(this.targetDirection, ENEMY_CONFIG.moveSpeed * 0.3, deltaTime);
    }
    
    /**
     * Update chase state
     */
    updateChase(deltaTime) {
        const distance = this.getDistanceToPlayer();
        
        // Check if in attack range
        if (distance < ENEMY_CONFIG.attackRange) {
            this.setState(EnemyState.ATTACK);
            return;
        }
        
        // Check if lost player
        if (distance > ENEMY_CONFIG.detectionRange * 1.5) {
            this.setState(EnemyState.IDLE);
            return;
        }
        
        // Move toward player
        const direction = this.getDirectionToPlayer();
        this.moveInDirection(direction, ENEMY_CONFIG.chaseSpeed, deltaTime);
        
        // Face player
        this.faceDirection(direction, deltaTime);
    }
    
    /**
     * Update attack state
     */
    updateAttack(deltaTime) {
        const distance = this.getDistanceToPlayer();
        
        // Check if player moved out of range
        if (distance > ENEMY_CONFIG.attackRange * 1.2) {
            this.setState(EnemyState.CHASE);
            return;
        }
        
        // Face player
        const direction = this.getDirectionToPlayer();
        this.faceDirection(direction, deltaTime);
        
        // Attack cooldown
        this.attackTimer += deltaTime;
        
        if (this.attackTimer >= ENEMY_CONFIG.attackCooldown) {
            this.performAttack();
            this.attackTimer = 0;
        }
    }
    
    /**
     * Perform attack on player
     */
    performAttack() {
        const distance = this.getDistanceToPlayer();
        
        if (distance <= ENEMY_CONFIG.attackRange) {
            this.engine.player.takeDamage(ENEMY_CONFIG.attackDamage);
            
            // Attack visual feedback
            this.mesh.material.emissive.setHex(0xff6600);
            setTimeout(() => {
                if (!this.isDead) {
                    this.mesh.material.emissive.setHex(0x660000);
                }
            }, 150);
        }
    }
    
    /**
     * Move in a direction
     */
    moveInDirection(direction, speed, deltaTime) {
        // Calculate movement
        const movement = direction.clone().multiplyScalar(speed * deltaTime);
        
        // Check boundary
        const nextPos = this.position.clone().add(movement);
        const boundary = 42;
        
        if (Math.abs(nextPos.x) < boundary && Math.abs(nextPos.z) < boundary) {
            // Simple obstacle avoidance
            if (!this.checkCollision(nextPos)) {
                this.position.copy(nextPos);
            } else {
                // Try to slide along obstacle
                const slideX = new THREE.Vector3(movement.x, 0, 0);
                const slideZ = new THREE.Vector3(0, 0, movement.z);
                
                if (!this.checkCollision(this.position.clone().add(slideX))) {
                    this.position.add(slideX);
                } else if (!this.checkCollision(this.position.clone().add(slideZ))) {
                    this.position.add(slideZ);
                }
            }
        }
        
        // Update mesh position
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;
    }
    
    /**
     * Check collision with obstacles
     */
    checkCollision(position) {
        for (const object of this.scene.children) {
            if (!object.userData.isObstacle) continue;
            
            const box = new THREE.Box3().setFromObject(object);
            box.expandByScalar(ENEMY_CONFIG.radius);
            
            if (box.containsPoint(position)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Rotate to face direction
     */
    faceDirection(direction, deltaTime) {
        const targetAngle = Math.atan2(direction.x, direction.z);
        const currentAngle = this.mesh.rotation.y;
        
        // Smooth rotation
        let angleDiff = targetAngle - currentAngle;
        
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.mesh.rotation.y += angleDiff * ENEMY_CONFIG.rotationSpeed * deltaTime;
    }
    
    /**
     * Update visual effects
     */
    updateVisuals(deltaTime) {
        // Bobbing animation
        const bobAmount = 0.05;
        const bobOffset = Math.sin(this.animationPhase) * bobAmount;
        this.mesh.position.y = ENEMY_CONFIG.height / 2 + bobOffset;
        
        // Pulse glow based on state
        let pulseIntensity = 0.5;
        if (this.state === EnemyState.CHASE) {
            pulseIntensity = 0.5 + Math.sin(this.animationPhase * 2) * 0.3;
        } else if (this.state === EnemyState.ATTACK) {
            pulseIntensity = 0.8 + Math.sin(this.animationPhase * 4) * 0.2;
        }
        
        this.mesh.material.emissiveIntensity = pulseIntensity;
    }
}

/**
 * Enemy Manager class
 * Handles enemy spawning, pooling, and management
 */
export class EnemyManager {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.scene = gameEngine.scene;
        
        // Active enemies
        this.enemies = [];
        
        // Spawn management
        this.spawnTimer = 0;
        this.spawnInterval = 3;
        this.respawnQueue = [];
        
        // Spawn points (around the arena)
        this.spawnPoints = this.generateSpawnPoints();
        
        console.log('[EnemyManager] Initialized');
    }
    
    /**
     * Generate spawn points around arena
     */
    generateSpawnPoints() {
        const points = [];
        const radius = 35;
        const count = 16;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }
        
        // Add corner spawn points
        points.push(new THREE.Vector3(-30, 0, -30));
        points.push(new THREE.Vector3(30, 0, -30));
        points.push(new THREE.Vector3(-30, 0, 30));
        points.push(new THREE.Vector3(30, 0, 30));
        
        return points;
    }
    
    /**
     * Get valid spawn point away from player
     */
    getValidSpawnPoint() {
        const playerPos = this.engine.player.position;
        const minDistance = 15;
        
        // Filter spawn points by distance from player
        const validPoints = this.spawnPoints.filter(point => {
            return point.distanceTo(playerPos) > minDistance;
        });
        
        if (validPoints.length === 0) {
            return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        }
        
        return validPoints[Math.floor(Math.random() * validPoints.length)];
    }
    
    /**
     * Spawn a new enemy
     */
    spawnEnemy() {
        if (this.enemies.length >= ENEMY_CONFIG.maxEnemies) return;
        
        const spawnPoint = this.getValidSpawnPoint();
        const enemy = new Enemy(this, spawnPoint);
        this.enemies.push(enemy);
        
        console.log(`[EnemyManager] Spawned enemy at (${spawnPoint.x.toFixed(1)}, ${spawnPoint.z.toFixed(1)})`);
    }
    
    /**
     * Schedule enemy respawn
     */
    scheduleRespawn() {
        this.respawnQueue.push({
            timer: ENEMY_CONFIG.respawnDelay
        });
    }
    
    /**
     * Remove dead enemies from array
     */
    cleanupDeadEnemies() {
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
    }
    
    /**
     * Reset all enemies
     */
    reset() {
        // Remove all enemies
        this.enemies.forEach(enemy => enemy.remove());
        this.enemies = [];
        this.respawnQueue = [];
        this.spawnTimer = 0;
        
        // Spawn initial enemies
        for (let i = 0; i < 4; i++) {
            this.spawnEnemy();
        }
        
        console.log('[EnemyManager] Reset');
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Update all enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Cleanup dead enemies
        this.cleanupDeadEnemies();
        
        // Process respawn queue
        for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
            this.respawnQueue[i].timer -= deltaTime;
            
            if (this.respawnQueue[i].timer <= 0) {
                this.spawnEnemy();
                this.respawnQueue.splice(i, 1);
            }
        }
        
        // Automatic spawning over time
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < ENEMY_CONFIG.maxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
            
            // Increase difficulty over time
            this.spawnInterval = Math.max(2, this.spawnInterval - 0.1);
        }
    }
}
