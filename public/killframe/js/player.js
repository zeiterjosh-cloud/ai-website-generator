/**
 * KILLFRAME - FPS Prototype
 * Player System
 * 
 * Handles first-person player controller including:
 * - WASD movement with acceleration/deceleration
 * - Mouse look with pointer lock
 * - Head bob and camera sway effects
 * - Player health and damage handling
 */

import * as THREE from 'three';

/**
 * Configuration constants for player movement and effects
 */
const PLAYER_CONFIG = {
    // Movement
    moveSpeed: 8,
    sprintMultiplier: 1.5,
    acceleration: 25,
    deceleration: 15,
    
    // Physics
    height: 1.8,
    radius: 0.5,
    gravity: 20,
    jumpForce: 8,
    
    // Mouse look
    mouseSensitivity: 0.002,
    maxPitch: Math.PI / 2 - 0.1,
    
    // Head bob
    headBobSpeed: 10,
    headBobAmount: 0.04,
    
    // Camera sway
    swayAmount: 0.02,
    swaySpeed: 2,
    
    // Health
    maxHealth: 100,
    healthRegenDelay: 5,
    healthRegenRate: 10
};

/**
 * Player class - First-person controller
 */
export class Player {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.camera = gameEngine.camera;
        this.scene = gameEngine.scene;
        
        // Position and velocity
        this.position = new THREE.Vector3(0, PLAYER_CONFIG.height, 0);
        this.velocity = new THREE.Vector3();
        this.inputVelocity = new THREE.Vector3();
        
        // Rotation
        this.yaw = 0;
        this.pitch = 0;
        
        // Camera effects
        this.headBobPhase = 0;
        this.headBobOffset = 0;
        this.swayOffset = new THREE.Vector2();
        this.recoilOffset = new THREE.Vector2();
        this.recoilRecovery = new THREE.Vector2();
        
        // State
        this.isGrounded = true;
        this.isSprinting = false;
        this.isMoving = false;
        
        // Health
        this.health = PLAYER_CONFIG.maxHealth;
        this.maxHealth = PLAYER_CONFIG.maxHealth;
        this.lastDamageTime = 0;
        this.isDead = false;
        
        // Input state
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false
        };
        
        // Movement vectors (reused for performance)
        this._moveDirection = new THREE.Vector3();
        this._forward = new THREE.Vector3();
        this._right = new THREE.Vector3();
        
        // Initialize
        this.initInputHandlers();
        
        console.log('[Player] Initialized');
    }
    
    /**
     * Initialize keyboard and mouse input handlers
     */
    initInputHandlers() {
        // Keyboard input
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse look
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }
    
    /**
     * Handle key down events
     */
    onKeyDown(event) {
        if (this.engine.isPaused || this.isDead) return;
        
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.input.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.input.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.input.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.input.right = true;
                break;
            case 'Space':
                this.input.jump = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.input.sprint = true;
                break;
        }
    }
    
    /**
     * Handle key up events
     */
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.input.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.input.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.input.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.input.right = false;
                break;
            case 'Space':
                this.input.jump = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.input.sprint = false;
                break;
        }
    }
    
    /**
     * Handle mouse movement for look
     */
    onMouseMove(event) {
        if (!document.pointerLockElement || this.engine.isPaused || this.isDead) return;
        
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        // Apply mouse sensitivity
        this.yaw -= movementX * PLAYER_CONFIG.mouseSensitivity;
        this.pitch -= movementY * PLAYER_CONFIG.mouseSensitivity;
        
        // Clamp pitch to prevent over-rotation
        this.pitch = Math.max(
            -PLAYER_CONFIG.maxPitch,
            Math.min(PLAYER_CONFIG.maxPitch, this.pitch)
        );
    }
    
    /**
     * Apply recoil to camera
     */
    applyRecoil(amount) {
        this.recoilOffset.y += amount;
        this.recoilOffset.x += (Math.random() - 0.5) * amount * 0.3;
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health = Math.max(0, this.health - amount);
        this.lastDamageTime = this.engine.elapsedTime;
        
        // Visual feedback
        this.engine.uiManager.showDamage();
        this.engine.uiManager.updateHealth(this.health, this.maxHealth);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Handle player death
     */
    die() {
        this.isDead = true;
        this.engine.endGame();
    }
    
    /**
     * Heal the player
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.engine.uiManager.updateHealth(this.health, this.maxHealth);
    }
    
    /**
     * Reset player state
     */
    reset() {
        this.position.set(0, PLAYER_CONFIG.height, 0);
        this.velocity.set(0, 0, 0);
        this.yaw = 0;
        this.pitch = 0;
        
        this.health = PLAYER_CONFIG.maxHealth;
        this.isDead = false;
        this.lastDamageTime = 0;
        
        this.headBobPhase = 0;
        this.headBobOffset = 0;
        this.swayOffset.set(0, 0);
        this.recoilOffset.set(0, 0);
        
        this.engine.uiManager.updateHealth(this.health, this.maxHealth);
        
        console.log('[Player] Reset');
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        if (this.isDead) return;
        
        this.updateMovement(deltaTime);
        this.updateHeadBob(deltaTime);
        this.updateCameraSway(deltaTime);
        this.updateRecoilRecovery(deltaTime);
        this.updateHealthRegen(deltaTime);
        this.updateCamera();
    }
    
    /**
     * Update player movement
     */
    updateMovement(deltaTime) {
        // Calculate movement direction from input
        this._moveDirection.set(0, 0, 0);
        
        if (this.input.forward) this._moveDirection.z -= 1;
        if (this.input.backward) this._moveDirection.z += 1;
        if (this.input.left) this._moveDirection.x -= 1;
        if (this.input.right) this._moveDirection.x += 1;
        
        // Normalize if moving diagonally
        if (this._moveDirection.lengthSq() > 0) {
            this._moveDirection.normalize();
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
        
        // Get forward and right vectors based on yaw
        this._forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this._right.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        
        // Calculate target velocity
        const speed = PLAYER_CONFIG.moveSpeed * 
            (this.input.sprint ? PLAYER_CONFIG.sprintMultiplier : 1);
        
        const targetX = (this._forward.x * -this._moveDirection.z + 
                        this._right.x * this._moveDirection.x) * speed;
        const targetZ = (this._forward.z * -this._moveDirection.z + 
                        this._right.z * this._moveDirection.x) * speed;
        
        // Apply acceleration/deceleration
        const accel = this.isMoving ? PLAYER_CONFIG.acceleration : PLAYER_CONFIG.deceleration;
        
        this.velocity.x = THREE.MathUtils.lerp(
            this.velocity.x, 
            targetX, 
            Math.min(1, accel * deltaTime)
        );
        this.velocity.z = THREE.MathUtils.lerp(
            this.velocity.z, 
            targetZ, 
            Math.min(1, accel * deltaTime)
        );
        
        // Apply velocity to position
        const nextPos = this.position.clone();
        nextPos.x += this.velocity.x * deltaTime;
        nextPos.z += this.velocity.z * deltaTime;
        
        // Simple boundary collision
        const boundary = 43;
        nextPos.x = Math.max(-boundary, Math.min(boundary, nextPos.x));
        nextPos.z = Math.max(-boundary, Math.min(boundary, nextPos.z));
        
        // Simple obstacle collision
        if (!this.checkObstacleCollision(nextPos)) {
            this.position.copy(nextPos);
        }
        
        // Update sprint state
        this.isSprinting = this.input.sprint && this.isMoving;
    }
    
    /**
     * Check collision with obstacles
     */
    checkObstacleCollision(position) {
        const playerRadius = PLAYER_CONFIG.radius;
        
        // Check against all obstacles in scene
        for (const object of this.scene.children) {
            if (!object.userData.isObstacle) continue;
            
            // Simple AABB collision check
            const box = new THREE.Box3().setFromObject(object);
            box.expandByScalar(playerRadius);
            
            if (box.containsPoint(position)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Update head bob effect
     */
    updateHeadBob(deltaTime) {
        if (this.isMoving && this.isGrounded) {
            const bobSpeed = PLAYER_CONFIG.headBobSpeed * 
                (this.isSprinting ? 1.5 : 1);
            
            this.headBobPhase += deltaTime * bobSpeed;
            
            // Vertical bob with subtle horizontal sway
            this.headBobOffset = Math.sin(this.headBobPhase) * PLAYER_CONFIG.headBobAmount;
        } else {
            // Smoothly return to neutral
            this.headBobOffset = THREE.MathUtils.lerp(this.headBobOffset, 0, deltaTime * 5);
            this.headBobPhase = 0;
        }
    }
    
    /**
     * Update camera sway effect
     */
    updateCameraSway(deltaTime) {
        // Subtle idle sway
        const swayX = Math.sin(this.engine.elapsedTime * PLAYER_CONFIG.swaySpeed) * 
            PLAYER_CONFIG.swayAmount;
        const swayY = Math.cos(this.engine.elapsedTime * PLAYER_CONFIG.swaySpeed * 0.7) * 
            PLAYER_CONFIG.swayAmount * 0.5;
        
        this.swayOffset.x = THREE.MathUtils.lerp(this.swayOffset.x, swayX, deltaTime * 3);
        this.swayOffset.y = THREE.MathUtils.lerp(this.swayOffset.y, swayY, deltaTime * 3);
    }
    
    /**
     * Update recoil recovery
     */
    updateRecoilRecovery(deltaTime) {
        // Smoothly recover from recoil
        const recovery = 10 * deltaTime;
        
        this.recoilOffset.x = THREE.MathUtils.lerp(this.recoilOffset.x, 0, recovery);
        this.recoilOffset.y = THREE.MathUtils.lerp(this.recoilOffset.y, 0, recovery);
    }
    
    /**
     * Update health regeneration
     */
    updateHealthRegen(deltaTime) {
        if (this.health >= this.maxHealth) return;
        
        const timeSinceDamage = this.engine.elapsedTime - this.lastDamageTime;
        
        if (timeSinceDamage > PLAYER_CONFIG.healthRegenDelay) {
            this.heal(PLAYER_CONFIG.healthRegenRate * deltaTime);
        }
    }
    
    /**
     * Update camera position and rotation
     */
    updateCamera() {
        // Set camera position
        this.camera.position.copy(this.position);
        this.camera.position.y += this.headBobOffset;
        
        // Calculate final rotation with all effects
        const finalPitch = this.pitch + this.swayOffset.y + this.recoilOffset.y;
        const finalYaw = this.yaw + this.swayOffset.x + this.recoilOffset.x;
        
        // Apply rotation using quaternions for smooth interpolation
        const euler = new THREE.Euler(finalPitch, finalYaw, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);
    }
    
    /**
     * Get player's forward direction
     */
    getForwardDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        return direction;
    }
    
    /**
     * Get player's look direction (for shooting)
     */
    getLookDirection() {
        return this.getForwardDirection();
    }
}
