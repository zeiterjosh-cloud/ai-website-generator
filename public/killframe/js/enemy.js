/**
 * KILLFRAME - Enemy System
 * AI state machine with idle, chase, attack states
 * Health system and death handling with respawn
 */

import * as THREE from 'three';

// Enemy states
export const EnemyState = {
    IDLE: 'idle',
    CHASE: 'chase',
    ATTACK: 'attack',
    DEAD: 'dead'
};

export class Enemy {
    constructor(scene, position, id) {
        this.scene = scene;
        this.id = id;
        
        // Create enemy mesh
        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);
        
        // Movement
        this.speed = 3.5;
        this.velocity = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        
        // State machine
        this.state = EnemyState.IDLE;
        this.stateTimer = 0;
        this.idleDuration = 2;
        
        // Detection
        this.detectionRange = 25;
        this.attackRange = 2;
        this.fieldOfView = Math.PI * 0.8; // ~144 degrees
        
        // Combat
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 10;
        this.attackCooldown = 1.5;
        this.lastAttackTime = 0;
        
        // Death
        this.isDead = false;
        this.deathTimer = 0;
        this.deathDuration = 2;
        this.respawnDelay = 5;
        this.respawnTimer = 0;
        
        // Animation
        this.bobTimer = Math.random() * Math.PI * 2;
        this.bobSpeed = 3;
        this.bobAmplitude = 0.1;
        this.baseY = position.y;
        
        // Visual feedback
        this.hitFlashTimer = 0;
        this.hitFlashDuration = 0.1;
        this.originalColor = 0xff3333;
        
        // Callbacks
        this.onDeath = null;
        this.onAttack = null;
        this.onRespawn = null;
    }
    
    createMesh() {
        // Create a group for the enemy
        const group = new THREE.Group();
        
        // Body - main capsule shape
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.3,
            roughness: 0.6,
            metalness: 0.4
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Head - glowing sphere
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6666,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.6
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.65;
        head.castShadow = true;
        group.add(head);
        
        // Eyes - bright emissive
        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.7, 0.2);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.7, 0.2);
        group.add(rightEye);
        
        // Store references for material updates
        group.userData.bodyMaterial = bodyMaterial;
        group.userData.headMaterial = headMaterial;
        group.userData.eyeMaterial = eyeMaterial;
        
        return group;
    }
    
    update(deltaTime, playerPosition, currentTime, timeScale = 1.0) {
        if (this.isDead) {
            this.updateDeath(deltaTime);
            return;
        }
        
        const scaledDelta = deltaTime * timeScale;
        
        // Update state machine
        this.updateStateMachine(scaledDelta, playerPosition, currentTime);
        
        // Update movement
        this.updateMovement(scaledDelta);
        
        // Update animation
        this.updateAnimation(scaledDelta);
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
    }
    
    updateStateMachine(deltaTime, playerPosition, currentTime) {
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        switch (this.state) {
            case EnemyState.IDLE:
                this.stateTimer += deltaTime;
                
                // Check if player is in range
                if (distanceToPlayer <= this.detectionRange) {
                    this.setState(EnemyState.CHASE);
                } else if (this.stateTimer >= this.idleDuration) {
                    // Random idle movement
                    this.setRandomTarget();
                    this.stateTimer = 0;
                }
                break;
                
            case EnemyState.CHASE:
                this.targetPosition.copy(playerPosition);
                
                if (distanceToPlayer <= this.attackRange) {
                    this.setState(EnemyState.ATTACK);
                } else if (distanceToPlayer > this.detectionRange * 1.5) {
                    this.setState(EnemyState.IDLE);
                }
                break;
                
            case EnemyState.ATTACK:
                this.targetPosition.copy(playerPosition);
                
                // Look at player
                this.lookAtTarget(playerPosition);
                
                // Try to attack
                if (currentTime - this.lastAttackTime >= this.attackCooldown) {
                    this.attack(currentTime);
                }
                
                // Switch back to chase if player moves away
                if (distanceToPlayer > this.attackRange * 1.5) {
                    this.setState(EnemyState.CHASE);
                }
                break;
        }
    }
    
    setState(newState) {
        this.state = newState;
        this.stateTimer = 0;
    }
    
    setRandomTarget() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 3 + Math.random() * 5;
        
        this.targetPosition.set(
            this.mesh.position.x + Math.cos(angle) * distance,
            this.baseY,
            this.mesh.position.z + Math.sin(angle) * distance
        );
        
        // Clamp to arena bounds
        const bounds = 40;
        this.targetPosition.x = Math.max(-bounds, Math.min(bounds, this.targetPosition.x));
        this.targetPosition.z = Math.max(-bounds, Math.min(bounds, this.targetPosition.z));
    }
    
    updateMovement(deltaTime) {
        if (this.state === EnemyState.DEAD) return;
        
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, this.mesh.position);
        direction.y = 0;
        
        const distance = direction.length();
        
        if (distance > 0.5) {
            direction.normalize();
            
            // Calculate speed based on state
            let currentSpeed = this.speed;
            if (this.state === EnemyState.CHASE) {
                currentSpeed *= 1.2;
            } else if (this.state === EnemyState.ATTACK) {
                currentSpeed *= 0.5;
            }
            
            // Move towards target
            this.velocity.copy(direction).multiplyScalar(currentSpeed);
            this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
            
            // Rotate to face movement direction
            this.lookAtTarget(
                this.mesh.position.clone().add(direction)
            );
        }
        
        // Keep at ground level
        this.mesh.position.y = this.baseY;
    }
    
    lookAtTarget(target) {
        const lookTarget = target.clone();
        lookTarget.y = this.mesh.position.y;
        this.mesh.lookAt(lookTarget);
    }
    
    updateAnimation(deltaTime) {
        // Idle bob animation
        this.bobTimer += deltaTime * this.bobSpeed;
        const bobOffset = Math.sin(this.bobTimer) * this.bobAmplitude;
        
        // Apply bob to children
        if (this.mesh.children.length > 0) {
            this.mesh.children[0].position.y = 0.9 + bobOffset * 0.5;
        }
    }
    
    updateVisualEffects(deltaTime) {
        // Hit flash effect
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
            
            const flashIntensity = this.hitFlashTimer / this.hitFlashDuration;
            const bodyMaterial = this.mesh.userData.bodyMaterial;
            const headMaterial = this.mesh.userData.headMaterial;
            
            if (bodyMaterial) {
                bodyMaterial.emissiveIntensity = 0.3 + flashIntensity * 0.7;
            }
            if (headMaterial) {
                headMaterial.emissiveIntensity = 0.5 + flashIntensity * 0.5;
            }
        }
    }
    
    attack(currentTime) {
        this.lastAttackTime = currentTime;
        
        if (this.onAttack) {
            this.onAttack({
                enemy: this,
                damage: this.damage,
                time: currentTime
            });
        }
    }
    
    takeDamage(amount) {
        if (this.isDead) return false;
        
        this.health -= amount;
        
        // Visual feedback
        this.hitFlashTimer = this.hitFlashDuration;
        
        if (this.health <= 0) {
            this.die();
            return true; // Killed
        }
        
        return false; // Not killed
    }
    
    die() {
        this.isDead = true;
        this.state = EnemyState.DEAD;
        this.deathTimer = 0;
        
        // Death animation - fall over
        this.animateDeath();
        
        if (this.onDeath) {
            this.onDeath({
                enemy: this,
                position: this.mesh.position.clone()
            });
        }
    }
    
    animateDeath() {
        // Tween rotation for falling
        const targetRotation = Math.PI / 2;
        const duration = 0.5;
        
        const animate = () => {
            if (this.deathTimer >= duration) return;
            
            const progress = Math.min(this.deathTimer / duration, 1);
            this.mesh.rotation.x = targetRotation * progress;
            this.mesh.position.y = this.baseY - progress * 0.5;
            
            // Fade out materials after half the death duration
            const fadeStartTime = this.deathDuration * 0.5;
            const fadeDuration = this.deathDuration * 0.5;
            const timeSinceFadeStart = Math.max(0, this.deathTimer - fadeStartTime);
            const opacity = 1 - (timeSinceFadeStart / fadeDuration);
            this.setMeshOpacity(opacity);
        };
        
        // Store animation function
        this.deathAnimation = animate;
    }
    
    setMeshOpacity(opacity) {
        this.mesh.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = Math.max(0, opacity);
            }
        });
    }
    
    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        
        // Run death animation
        if (this.deathAnimation) {
            this.deathAnimation();
        }
        
        // Check for respawn
        if (this.deathTimer >= this.respawnDelay) {
            this.respawn();
        }
    }
    
    respawn() {
        // Reset health
        this.health = this.maxHealth;
        this.isDead = false;
        
        // Reset state
        this.setState(EnemyState.IDLE);
        
        // Reset position to random location
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 20;
        
        this.mesh.position.set(
            Math.cos(angle) * distance,
            this.baseY,
            Math.sin(angle) * distance
        );
        
        // Reset rotation and opacity
        this.mesh.rotation.set(0, 0, 0);
        this.setMeshOpacity(1);
        
        // Reset materials
        const bodyMaterial = this.mesh.userData.bodyMaterial;
        const headMaterial = this.mesh.userData.headMaterial;
        
        if (bodyMaterial) {
            bodyMaterial.emissiveIntensity = 0.3;
        }
        if (headMaterial) {
            headMaterial.emissiveIntensity = 0.5;
        }
        
        if (this.onRespawn) {
            this.onRespawn({
                enemy: this,
                position: this.mesh.position.clone()
            });
        }
    }
    
    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
    
    isInRange(position, range) {
        return this.mesh.position.distanceTo(position) <= range;
    }
    
    dispose() {
        this.scene.remove(this.mesh);
        
        this.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
}

// Enemy Manager - handles multiple enemies
export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.maxEnemies = 8;
        this.spawnRadius = 30;
        this.minSpawnDistance = 10;
        this.nextId = 0;
    }
    
    spawnEnemy(position) {
        if (this.enemies.length >= this.maxEnemies) return null;
        
        const enemy = new Enemy(this.scene, position, this.nextId++);
        this.enemies.push(enemy);
        return enemy;
    }
    
    spawnEnemyRandom(playerPosition) {
        if (this.enemies.length >= this.maxEnemies) return null;
        
        // Find a position away from the player
        let position;
        let attempts = 0;
        
        do {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.minSpawnDistance + Math.random() * (this.spawnRadius - this.minSpawnDistance);
            
            position = new THREE.Vector3(
                Math.cos(angle) * distance,
                0.9,
                Math.sin(angle) * distance
            );
            
            attempts++;
        } while (
            position.distanceTo(playerPosition) < this.minSpawnDistance &&
            attempts < 10
        );
        
        return this.spawnEnemy(position);
    }
    
    update(deltaTime, playerPosition, currentTime, timeScale = 1.0) {
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, playerPosition, currentTime, timeScale);
        }
    }
    
    getActiveEnemies() {
        return this.enemies.filter(e => !e.isDead);
    }
    
    getAllEnemies() {
        return this.enemies;
    }
    
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            enemy.dispose();
            this.enemies.splice(index, 1);
        }
    }
    
    clear() {
        for (const enemy of this.enemies) {
            enemy.dispose();
        }
        this.enemies = [];
    }
    
    dispose() {
        this.clear();
    }
}
