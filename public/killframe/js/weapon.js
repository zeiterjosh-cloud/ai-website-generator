/**
 * KILLFRAME - FPS Prototype
 * Weapon System
 * 
 * Handles all weapon-related functionality:
 * - Raycast shooting with hit detection
 * - Fire rate control and ammunition
 * - Recoil system with camera kickback
 * - Muzzle flash and visual effects
 * - Hit feedback and accuracy tracking
 */

import * as THREE from 'three';

/**
 * Weapon configuration
 */
const WEAPON_CONFIG = {
    // Firing
    fireRate: 10,           // Rounds per second
    damage: 25,
    range: 200,
    
    // Ammunition
    magazineSize: 30,
    maxReserve: 90,
    reloadTime: 2.0,
    
    // Recoil
    recoilAmount: 0.03,
    recoilRecovery: 8,
    
    // Visual effects
    muzzleFlashDuration: 0.05,
    tracerSpeed: 500,
    
    // Audio placeholder (would be implemented with Web Audio API)
    fireSound: null,
    reloadSound: null
};

/**
 * Bullet tracer class for visual bullet trails
 */
class BulletTracer {
    constructor(scene, start, end, color = 0xffff00) {
        this.scene = scene;
        this.lifetime = 0;
        this.maxLifetime = 0.1;
        this.isActive = true;
        
        // Create tracer geometry
        const points = [start.clone(), end.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        this.line = new THREE.Line(geometry, material);
        scene.add(this.line);
    }
    
    update(deltaTime) {
        this.lifetime += deltaTime;
        
        // Fade out
        const alpha = 1 - (this.lifetime / this.maxLifetime);
        this.line.material.opacity = alpha * 0.8;
        
        if (this.lifetime >= this.maxLifetime) {
            this.destroy();
        }
    }
    
    destroy() {
        this.isActive = false;
        this.scene.remove(this.line);
        this.line.geometry.dispose();
        this.line.material.dispose();
    }
}

/**
 * Impact effect class for hit visualization
 */
class ImpactEffect {
    constructor(scene, position, normal, isEnemy = false) {
        this.scene = scene;
        this.lifetime = 0;
        this.maxLifetime = 0.3;
        this.isActive = true;
        
        // Create impact particles
        const particleCount = isEnemy ? 10 : 5;
        const color = isEnemy ? 0xff0000 : 0xffff00;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
            
            // Random velocity based on normal
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 5 + normal.x * 3,
                (Math.random() - 0.5) * 5 + normal.y * 3,
                (Math.random() - 0.5) * 5 + normal.z * 3
            ));
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: isEnemy ? 0.15 : 0.1,
            transparent: true,
            opacity: 1,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.velocities = velocities;
        scene.add(this.particles);
        
        // Add point light for flash effect
        this.light = new THREE.PointLight(color, 2, 5);
        this.light.position.copy(position);
        scene.add(this.light);
    }
    
    update(deltaTime) {
        this.lifetime += deltaTime;
        
        // Update particle positions
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < this.velocities.length; i++) {
            positions[i * 3] += this.velocities[i].x * deltaTime;
            positions[i * 3 + 1] += this.velocities[i].y * deltaTime - 9.8 * deltaTime;
            positions[i * 3 + 2] += this.velocities[i].z * deltaTime;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Fade out
        const alpha = 1 - (this.lifetime / this.maxLifetime);
        this.particles.material.opacity = alpha;
        this.light.intensity = alpha * 2;
        
        if (this.lifetime >= this.maxLifetime) {
            this.destroy();
        }
    }
    
    destroy() {
        this.isActive = false;
        this.scene.remove(this.particles);
        this.scene.remove(this.light);
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }
}

/**
 * Muzzle flash effect
 */
class MuzzleFlash {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.isActive = false;
        this.lifetime = 0;
        
        // Create muzzle flash sprite
        const spriteMaterial = new THREE.SpriteMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.scale.set(0.3, 0.3, 0.3);
        
        // Create flash light
        this.light = new THREE.PointLight(0xffaa00, 0, 10);
    }
    
    trigger() {
        this.isActive = true;
        this.lifetime = 0;
        
        // Position in front of camera
        const flashPos = new THREE.Vector3(0.15, -0.15, -0.5);
        flashPos.applyQuaternion(this.camera.quaternion);
        flashPos.add(this.camera.position);
        
        this.sprite.position.copy(flashPos);
        this.sprite.material.opacity = 1;
        this.sprite.scale.set(0.2 + Math.random() * 0.15, 0.2 + Math.random() * 0.15, 1);
        
        this.light.position.copy(this.camera.position);
        this.light.intensity = 3;
        
        if (!this.scene.children.includes(this.sprite)) {
            this.scene.add(this.sprite);
            this.scene.add(this.light);
        }
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.lifetime += deltaTime;
        
        const alpha = 1 - (this.lifetime / WEAPON_CONFIG.muzzleFlashDuration);
        this.sprite.material.opacity = Math.max(0, alpha);
        this.light.intensity = Math.max(0, alpha * 3);
        
        if (this.lifetime >= WEAPON_CONFIG.muzzleFlashDuration) {
            this.isActive = false;
            this.scene.remove(this.sprite);
            this.scene.remove(this.light);
        }
    }
}

/**
 * Main Weapon System class
 */
export class WeaponSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.scene = gameEngine.scene;
        this.camera = gameEngine.camera;
        this.player = gameEngine.player;
        
        // Weapon state
        this.currentAmmo = WEAPON_CONFIG.magazineSize;
        this.reserveAmmo = WEAPON_CONFIG.maxReserve;
        this.isReloading = false;
        this.reloadTimer = 0;
        
        // Firing state
        this.canFire = true;
        this.fireTimer = 0;
        this.fireInterval = 1 / WEAPON_CONFIG.fireRate;
        this.isFiring = false;
        
        // Statistics
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.lastShotTime = 0;
        
        // Visual effects
        this.tracers = [];
        this.impacts = [];
        this.muzzleFlash = new MuzzleFlash(this.scene, this.camera);
        
        // Raycaster for shooting
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = WEAPON_CONFIG.range;
        
        // Input binding
        this.initInputHandlers();
        
        console.log('[WeaponSystem] Initialized');
    }
    
    /**
     * Initialize input handlers
     */
    initInputHandlers() {
        // Mouse click to fire
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.startFiring();
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.stopFiring();
        });
        
        // Reload key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') this.startReload();
        });
    }
    
    /**
     * Start firing (automatic fire while held)
     */
    startFiring() {
        if (!this.engine.isRunning || this.engine.isPaused) return;
        this.isFiring = true;
    }
    
    /**
     * Stop firing
     */
    stopFiring() {
        this.isFiring = false;
    }
    
    /**
     * Start reload
     */
    startReload() {
        if (this.isReloading) return;
        if (this.currentAmmo >= WEAPON_CONFIG.magazineSize) return;
        if (this.reserveAmmo <= 0) return;
        
        this.isReloading = true;
        this.reloadTimer = 0;
        this.canFire = false;
        
        console.log('[WeaponSystem] Reloading...');
    }
    
    /**
     * Complete reload
     */
    completeReload() {
        const needed = WEAPON_CONFIG.magazineSize - this.currentAmmo;
        const toReload = Math.min(needed, this.reserveAmmo);
        
        this.currentAmmo += toReload;
        this.reserveAmmo -= toReload;
        
        this.isReloading = false;
        this.canFire = true;
        
        this.engine.uiManager.updateAmmo(this.currentAmmo, this.reserveAmmo);
        
        console.log('[WeaponSystem] Reload complete');
    }
    
    /**
     * Fire weapon
     */
    fire() {
        if (!this.canFire || this.isReloading) return;
        if (this.currentAmmo <= 0) {
            this.startReload();
            return;
        }
        
        // Consume ammo
        this.currentAmmo--;
        this.shotsFired++;
        
        // Record shot time for KillFrame system
        const currentTime = this.engine.elapsedTime;
        this.lastShotTime = currentTime;
        
        // Apply recoil
        this.player.applyRecoil(WEAPON_CONFIG.recoilAmount);
        
        // Trigger muzzle flash
        this.muzzleFlash.trigger();
        
        // Perform raycast
        this.performRaycast();
        
        // Update UI
        this.engine.uiManager.updateAmmo(this.currentAmmo, this.reserveAmmo);
        
        // Set fire cooldown
        this.fireTimer = this.fireInterval;
    }
    
    /**
     * Perform raycast for hit detection
     */
    performRaycast() {
        // Get ray from center of screen
        const origin = this.camera.position.clone();
        const direction = this.player.getLookDirection();
        
        this.raycaster.set(origin, direction);
        
        // Get all objects to test against
        const testObjects = this.getShootableObjects();
        const intersects = this.raycaster.intersectObjects(testObjects, false);
        
        // Calculate end point for tracer
        let endPoint;
        let hitEnemy = false;
        let hitObject = null;
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            endPoint = hit.point.clone();
            hitObject = hit.object;
            
            // Check if hit enemy
            if (hit.object.userData.isEnemy) {
                hitEnemy = true;
                this.onEnemyHit(hit);
            } else {
                this.onEnvironmentHit(hit);
            }
        } else {
            // No hit - end point at max range
            endPoint = origin.clone().add(direction.multiplyScalar(WEAPON_CONFIG.range));
        }
        
        // Create tracer
        const tracerColor = hitEnemy ? 0xff4444 : 0xffff00;
        this.tracers.push(new BulletTracer(this.scene, origin, endPoint, tracerColor));
    }
    
    /**
     * Get all objects that can be shot
     */
    getShootableObjects() {
        const objects = [];
        
        this.scene.traverse((child) => {
            if (child.isMesh && (child.userData.isEnemy || child.userData.isObstacle || 
                child.geometry?.type === 'PlaneGeometry')) {
                objects.push(child);
            }
        });
        
        // Add enemy meshes from enemy manager
        if (this.engine.enemyManager) {
            this.engine.enemyManager.enemies.forEach(enemy => {
                if (enemy.mesh) {
                    objects.push(enemy.mesh);
                }
            });
        }
        
        return objects;
    }
    
    /**
     * Handle enemy hit
     */
    onEnemyHit(hit) {
        this.shotsHit++;
        
        const enemy = hit.object.userData.enemyRef;
        if (enemy) {
            const killed = enemy.takeDamage(WEAPON_CONFIG.damage);
            
            // Notify kill frame system
            this.engine.killFrameSystem.recordHit(killed);
            
            // Show hit marker
            this.engine.uiManager.showHitMarker(killed);
        }
        
        // Create impact effect
        const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        this.impacts.push(new ImpactEffect(this.scene, hit.point, normal, true));
    }
    
    /**
     * Handle environment hit
     */
    onEnvironmentHit(hit) {
        // Create impact effect
        const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        this.impacts.push(new ImpactEffect(this.scene, hit.point, normal, false));
    }
    
    /**
     * Get current accuracy
     */
    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return Math.round((this.shotsHit / this.shotsFired) * 100);
    }
    
    /**
     * Reset weapon state
     */
    reset() {
        this.currentAmmo = WEAPON_CONFIG.magazineSize;
        this.reserveAmmo = WEAPON_CONFIG.maxReserve;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.canFire = true;
        this.fireTimer = 0;
        this.isFiring = false;
        
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.lastShotTime = 0;
        
        // Clear effects
        this.tracers.forEach(t => t.destroy());
        this.impacts.forEach(i => i.destroy());
        this.tracers = [];
        this.impacts = [];
        
        this.engine.uiManager.updateAmmo(this.currentAmmo, this.reserveAmmo);
        
        console.log('[WeaponSystem] Reset');
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Handle firing cooldown (use unscaled time for consistent fire rate)
        const realDelta = this.engine.deltaTime;
        
        if (this.fireTimer > 0) {
            this.fireTimer -= realDelta;
        }
        
        // Handle automatic firing
        if (this.isFiring && this.fireTimer <= 0 && !this.isReloading) {
            this.fire();
        }
        
        // Handle reload
        if (this.isReloading) {
            this.reloadTimer += realDelta;
            if (this.reloadTimer >= WEAPON_CONFIG.reloadTime) {
                this.completeReload();
            }
        }
        
        // Update muzzle flash
        this.muzzleFlash.update(realDelta);
        
        // Update tracers
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            this.tracers[i].update(realDelta);
            if (!this.tracers[i].isActive) {
                this.tracers.splice(i, 1);
            }
        }
        
        // Update impact effects
        for (let i = this.impacts.length - 1; i >= 0; i--) {
            this.impacts[i].update(realDelta);
            if (!this.impacts[i].isActive) {
                this.impacts.splice(i, 1);
            }
        }
        
        // Update accuracy display
        this.engine.uiManager.updateAccuracy(this.getAccuracy());
    }
}
