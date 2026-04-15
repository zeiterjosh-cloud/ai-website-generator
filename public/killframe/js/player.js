/**
 * KILLFRAME - Player System
 * First-person controller with WASD movement, mouse look, head bob, and camera sway
 */

import * as THREE from 'three';

export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        
        // Position and physics
        this.position = new THREE.Vector3(0, 1.8, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Movement parameters
        this.moveSpeed = 8.0;
        this.acceleration = 50.0;
        this.deceleration = 10.0;
        this.maxSpeed = 12.0;
        
        // Mouse look
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = 0.002;
        this.pitchLimit = Math.PI / 2 - 0.1;
        
        // Head bob parameters
        this.headBobEnabled = true;
        this.headBobTimer = 0;
        this.headBobFrequency = 10;
        this.headBobAmplitude = 0.04;
        this.baseHeight = 1.8;
        
        // Camera sway
        this.swayAmount = 0.0015;
        this.swaySmoothing = 0.1;
        this.currentSway = new THREE.Vector2();
        this.targetSway = new THREE.Vector2();
        
        // Input state
        this.inputState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false
        };
        
        // Health system
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.isDead = false;
        
        // Pointer lock
        this.isLocked = false;
        
        this.initControls();
        this.initPointerLock();
    }
    
    initControls() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }
    
    initPointerLock() {
        const canvas = document.querySelector('canvas');
        
        canvas?.addEventListener('click', () => {
            if (!this.isLocked) {
                canvas.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement !== null;
        });
    }
    
    onKeyDown(event) {
        if (this.isDead) return;
        
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.inputState.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.inputState.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.inputState.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.inputState.right = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.inputState.sprint = true;
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.inputState.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.inputState.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.inputState.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.inputState.right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.inputState.sprint = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (!this.isLocked || this.isDead) return;
        
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        // Update euler angles
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.y -= movementX * this.mouseSensitivity;
        this.euler.x -= movementY * this.mouseSensitivity;
        
        // Clamp pitch
        this.euler.x = Math.max(-this.pitchLimit, Math.min(this.pitchLimit, this.euler.x));
        
        this.camera.quaternion.setFromEuler(this.euler);
        
        // Update camera sway target
        this.targetSway.x = movementX * this.swayAmount;
        this.targetSway.y = movementY * this.swayAmount;
    }
    
    update(deltaTime, timeScale = 1.0) {
        if (this.isDead) return;
        
        const scaledDelta = deltaTime * timeScale;
        
        this.updateMovement(scaledDelta);
        this.updateHeadBob(scaledDelta);
        this.updateCameraSway(deltaTime); // Sway uses real time
        this.updateCameraPosition();
    }
    
    updateMovement(deltaTime) {
        // Calculate movement direction
        this.direction.set(0, 0, 0);
        
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        
        if (this.inputState.forward) this.direction.add(forward);
        if (this.inputState.backward) this.direction.sub(forward);
        if (this.inputState.left) this.direction.sub(right);
        if (this.inputState.right) this.direction.add(right);
        
        // Apply sprint modifier
        const currentMaxSpeed = this.inputState.sprint ? this.maxSpeed * 1.5 : this.maxSpeed;
        
        // Normalize direction if moving
        if (this.direction.lengthSq() > 0) {
            this.direction.normalize();
            
            // Accelerate
            this.velocity.add(
                this.direction.clone().multiplyScalar(this.acceleration * deltaTime)
            );
            
            // Clamp to max speed
            const speed = this.velocity.length();
            if (speed > currentMaxSpeed) {
                this.velocity.normalize().multiplyScalar(currentMaxSpeed);
            }
        } else {
            // Decelerate
            const speed = this.velocity.length();
            if (speed > 0) {
                const decelAmount = this.deceleration * deltaTime;
                if (speed <= decelAmount) {
                    this.velocity.set(0, 0, 0);
                } else {
                    this.velocity.sub(
                        this.velocity.clone().normalize().multiplyScalar(decelAmount)
                    );
                }
            }
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Arena bounds
        const bounds = 45;
        this.position.x = Math.max(-bounds, Math.min(bounds, this.position.x));
        this.position.z = Math.max(-bounds, Math.min(bounds, this.position.z));
    }
    
    updateHeadBob(deltaTime) {
        if (!this.headBobEnabled) return;
        
        const speed = this.velocity.length();
        
        if (speed > 0.5) {
            // Increase bob frequency with speed
            const speedFactor = speed / this.maxSpeed;
            this.headBobTimer += deltaTime * this.headBobFrequency * (1 + speedFactor);
            
            // Calculate bob offset
            const bobOffset = Math.sin(this.headBobTimer) * this.headBobAmplitude * speedFactor;
            this.position.y = this.baseHeight + bobOffset;
        } else {
            // Smoothly return to base height
            this.position.y = THREE.MathUtils.lerp(this.position.y, this.baseHeight, 0.1);
        }
    }
    
    updateCameraSway(deltaTime) {
        // Smoothly interpolate sway
        this.currentSway.lerp(this.targetSway, this.swaySmoothing);
        
        // Decay target sway
        this.targetSway.multiplyScalar(0.9);
    }
    
    updateCameraPosition() {
        this.camera.position.copy(this.position);
        
        // Apply sway
        this.camera.rotateZ(this.currentSway.x);
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health = Math.max(0, this.health - amount);
        
        if (this.health <= 0) {
            this.die();
        }
        
        return this.health;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        return this.health;
    }
    
    die() {
        this.isDead = true;
        this.velocity.set(0, 0, 0);
    }
    
    respawn() {
        this.health = this.maxHealth;
        this.isDead = false;
        this.position.set(0, this.baseHeight, 0);
        this.velocity.set(0, 0, 0);
        this.euler.set(0, 0, 0);
        this.camera.quaternion.setFromEuler(this.euler);
    }
    
    getForwardDirection() {
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        return forward;
    }
    
    isMoving() {
        return this.velocity.lengthSq() > 0.1;
    }
    
    getSpeed() {
        return this.velocity.length();
    }
}
