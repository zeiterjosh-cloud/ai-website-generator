/**
 * KILLFRAME - Weapon System
 * Raycast shooting, fire rate control, recoil, hit detection, and muzzle flash
 */

import * as THREE from 'three';

export class Weapon {
    constructor(camera, scene, player) {
        this.camera = camera;
        this.scene = scene;
        this.player = player;
        
        // Weapon stats
        this.damage = 25;
        this.fireRate = 8; // Shots per second
        this.range = 1000;
        
        // Fire rate control
        this.lastFireTime = 0;
        this.fireCooldown = 1 / this.fireRate;
        this.canFire = true;
        
        // Recoil system
        this.recoilAmount = 0.03;
        this.recoilRecoverySpeed = 8;
        this.currentRecoil = new THREE.Vector2();
        this.targetRecoil = new THREE.Vector2();
        
        // Spread (accuracy)
        this.baseSpread = 0.01;
        this.movingSpread = 0.03;
        
        // Raycaster for hit detection
        this.raycaster = new THREE.Raycaster();
        
        // Muzzle flash
        this.muzzleFlash = this.createMuzzleFlash();
        this.muzzleFlashDuration = 0.05;
        this.muzzleFlashTimer = 0;
        
        // Bullet tracers
        this.tracers = [];
        this.tracerLifetime = 0.1;
        
        // Hit markers
        this.hitMarkers = [];
        
        // Input
        this.isFiring = false;
        
        // Damage multiplier (for killframe mode)
        this.currentDamageMultiplier = 1.0;
        
        // Stats tracking (for killframe system)
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.lastHitTime = 0;
        
        // Callbacks
        this.onHit = null;
        this.onFire = null;
        
        this.initControls();
    }
    
    createMuzzleFlash() {
        const geometry = new THREE.PlaneGeometry(0.3, 0.3);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const flash = new THREE.Mesh(geometry, material);
        flash.visible = false;
        
        // Position relative to camera
        flash.position.set(0.15, -0.1, -0.5);
        this.camera.add(flash);
        
        return flash;
    }
    
    initControls() {
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.player.isLocked) {
                this.isFiring = true;
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isFiring = false;
            }
        });
    }
    
    update(deltaTime, currentTime, enemies, timeScale = 1.0) {
        // Update recoil recovery
        this.updateRecoil(deltaTime);
        
        // Update muzzle flash
        this.updateMuzzleFlash(deltaTime);
        
        // Update tracers
        this.updateTracers(deltaTime);
        
        // Update hit markers
        this.updateHitMarkers(deltaTime);
        
        // Handle firing with time scale
        const scaledTime = currentTime * timeScale;
        if (this.isFiring && this.canFire) {
            const timeSinceLastFire = currentTime - this.lastFireTime;
            if (timeSinceLastFire >= this.fireCooldown / timeScale) {
                this.fire(enemies, currentTime);
            }
        }
    }
    
    fire(enemies, currentTime) {
        this.lastFireTime = currentTime;
        this.shotsFired++;
        
        // Apply recoil
        this.applyRecoil();
        
        // Show muzzle flash
        this.showMuzzleFlash();
        
        // Calculate spread
        const spread = this.player.isMoving() ? this.movingSpread : this.baseSpread;
        
        // Get firing direction with spread
        const direction = this.getFireDirection(spread);
        
        // Set up raycaster
        this.raycaster.set(this.camera.position, direction);
        this.raycaster.far = this.range;
        
        // Check for hits
        const hitResult = this.checkHits(enemies);
        
        // Create tracer
        this.createTracer(direction, hitResult);
        
        // Fire callback
        if (this.onFire) {
            this.onFire({
                time: currentTime,
                position: this.camera.position.clone(),
                direction: direction.clone()
            });
        }
        
        return hitResult;
    }
    
    getFireDirection(spread) {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        // Add random spread
        direction.x += (Math.random() - 0.5) * spread;
        direction.y += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        direction.normalize();
        
        return direction;
    }
    
    checkHits(enemies) {
        // Get all enemy meshes
        const enemyMeshes = enemies
            .filter(e => !e.isDead)
            .map(e => e.mesh);
        
        const intersects = this.raycaster.intersectObjects(enemyMeshes, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            const hitPosition = hit.point;
            
            // Find which enemy was hit
            let hitEnemy = null;
            for (const enemy of enemies) {
                if (enemy.mesh === hit.object || enemy.mesh.children.includes(hit.object)) {
                    hitEnemy = enemy;
                    break;
                }
                // Check if hit object is a descendant
                let parent = hit.object.parent;
                while (parent) {
                    if (parent === enemy.mesh) {
                        hitEnemy = enemy;
                        break;
                    }
                    parent = parent.parent;
                }
                if (hitEnemy) break;
            }
            
            if (hitEnemy) {
                this.shotsHit++;
                const hitTime = performance.now() / 1000;
                const timeSinceLastHit = hitTime - this.lastHitTime;
                this.lastHitTime = hitTime;
                
                // Apply damage with multiplier
                const actualDamage = this.getDamage();
                const killed = hitEnemy.takeDamage(actualDamage);
                
                // Create hit marker
                this.createHitMarker(hitPosition);
                
                // Hit callback
                if (this.onHit) {
                    this.onHit({
                        enemy: hitEnemy,
                        position: hitPosition,
                        damage: actualDamage,
                        killed: killed,
                        timeSinceLastHit: timeSinceLastHit
                    });
                }
                
                return {
                    hit: true,
                    enemy: hitEnemy,
                    position: hitPosition,
                    killed: killed,
                    timeSinceLastHit: timeSinceLastHit
                };
            }
        }
        
        return { hit: false, position: null };
    }
    
    applyRecoil() {
        // Random horizontal recoil, upward vertical recoil
        this.targetRecoil.x += (Math.random() - 0.5) * this.recoilAmount * 0.5;
        this.targetRecoil.y += this.recoilAmount;
        
        // Apply to camera immediately for responsive feel
        const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
        euler.x -= this.recoilAmount * 0.5;
        euler.y += (Math.random() - 0.5) * this.recoilAmount * 0.3;
        this.camera.quaternion.setFromEuler(euler);
    }
    
    updateRecoil(deltaTime) {
        // Recover from recoil
        this.currentRecoil.lerp(new THREE.Vector2(), this.recoilRecoverySpeed * deltaTime);
        this.targetRecoil.lerp(new THREE.Vector2(), this.recoilRecoverySpeed * deltaTime);
    }
    
    showMuzzleFlash() {
        this.muzzleFlash.visible = true;
        this.muzzleFlash.material.opacity = 1;
        this.muzzleFlashTimer = this.muzzleFlashDuration;
        
        // Random rotation for variety
        this.muzzleFlash.rotation.z = Math.random() * Math.PI * 2;
        
        // Random scale
        const scale = 0.8 + Math.random() * 0.4;
        this.muzzleFlash.scale.set(scale, scale, scale);
    }
    
    updateMuzzleFlash(deltaTime) {
        if (this.muzzleFlashTimer > 0) {
            this.muzzleFlashTimer -= deltaTime;
            this.muzzleFlash.material.opacity = this.muzzleFlashTimer / this.muzzleFlashDuration;
            
            if (this.muzzleFlashTimer <= 0) {
                this.muzzleFlash.visible = false;
            }
        }
    }
    
    createTracer(direction, hitResult) {
        const startPos = this.camera.position.clone();
        startPos.add(direction.clone().multiplyScalar(0.5)); // Start slightly in front
        
        let endPos;
        if (hitResult.hit && hitResult.position) {
            endPos = hitResult.position.clone();
        } else {
            endPos = startPos.clone().add(direction.clone().multiplyScalar(this.range));
        }
        
        // Create tracer line
        const material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
        const tracer = new THREE.Line(geometry, material);
        
        this.scene.add(tracer);
        this.tracers.push({
            mesh: tracer,
            lifetime: this.tracerLifetime
        });
    }
    
    updateTracers(deltaTime) {
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const tracer = this.tracers[i];
            tracer.lifetime -= deltaTime;
            tracer.mesh.material.opacity = tracer.lifetime / this.tracerLifetime;
            
            if (tracer.lifetime <= 0) {
                this.scene.remove(tracer.mesh);
                tracer.mesh.geometry.dispose();
                tracer.mesh.material.dispose();
                this.tracers.splice(i, 1);
            }
        }
    }
    
    createHitMarker(position) {
        // Create a small emissive sphere at hit position
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        
        this.scene.add(marker);
        this.hitMarkers.push({
            mesh: marker,
            lifetime: 0.2,
            maxLifetime: 0.2
        });
    }
    
    updateHitMarkers(deltaTime) {
        for (let i = this.hitMarkers.length - 1; i >= 0; i--) {
            const marker = this.hitMarkers[i];
            marker.lifetime -= deltaTime;
            
            const progress = marker.lifetime / marker.maxLifetime;
            marker.mesh.material.opacity = progress;
            marker.mesh.scale.setScalar(1 + (1 - progress) * 2);
            
            if (marker.lifetime <= 0) {
                this.scene.remove(marker.mesh);
                marker.mesh.geometry.dispose();
                marker.mesh.material.dispose();
                this.hitMarkers.splice(i, 1);
            }
        }
    }
    
    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return (this.shotsHit / this.shotsFired) * 100;
    }
    
    resetStats() {
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.lastHitTime = 0;
    }
    
    setDamageMultiplier(multiplier) {
        this.currentDamageMultiplier = multiplier;
    }
    
    getDamage() {
        return this.damage * (this.currentDamageMultiplier || 1);
    }
    
    dispose() {
        // Clean up tracers
        for (const tracer of this.tracers) {
            this.scene.remove(tracer.mesh);
            tracer.mesh.geometry.dispose();
            tracer.mesh.material.dispose();
        }
        this.tracers = [];
        
        // Clean up hit markers
        for (const marker of this.hitMarkers) {
            this.scene.remove(marker.mesh);
            marker.mesh.geometry.dispose();
            marker.mesh.material.dispose();
        }
        this.hitMarkers = [];
        
        // Clean up muzzle flash
        this.camera.remove(this.muzzleFlash);
        this.muzzleFlash.geometry.dispose();
        this.muzzleFlash.material.dispose();
    }
}
