/**
 * KILLFRAME - Main Entry Point
 * Game loop, Three.js setup, and system orchestration
 */

import * as THREE from 'three';
import { Player } from './player.js';
import { Weapon } from './weapon.js';
import { KillframeSystem, KillframeState } from './killframe.js';
import { GameManager, GameState } from './gameManager.js';
import { UIManager } from './ui.js';

class KillframeGame {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Game systems
        this.player = null;
        this.weapon = null;
        this.killframe = null;
        this.gameManager = null;
        this.ui = null;
        
        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fpsCounter = {
            frames: 0,
            lastUpdate: 0,
            current: 60
        };
        
        // Post-processing ready
        this.composer = null;
        this.bloomPass = null;
        
        this.init();
    }
    
    async init() {
        this.setupRenderer();
        this.setupScene();
        this.setupLighting();
        this.setupEnvironment();
        this.setupFog();
        this.setupSystems();
        this.setupEventListeners();
        
        // Start game loop
        this.animate();
    }
    
    setupRenderer() {
        // Create renderer with shadows
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.8, 0);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
    }
    
    setupLighting() {
        // Ambient light for base illumination
        const ambient = new THREE.AmbientLight(0x333366, 0.4);
        this.scene.add(ambient);
        
        // Main directional light (sun-like)
        const directional = new THREE.DirectionalLight(0xffffff, 1.0);
        directional.position.set(50, 100, 50);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 200;
        directional.shadow.camera.left = -60;
        directional.shadow.camera.right = 60;
        directional.shadow.camera.top = 60;
        directional.shadow.camera.bottom = -60;
        directional.shadow.bias = -0.0001;
        this.scene.add(directional);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x6666ff, 0.3);
        fillLight.position.set(-30, 20, -30);
        this.scene.add(fillLight);
        
        // Rim light for dramatic effect
        const rimLight = new THREE.DirectionalLight(0xff00ff, 0.2);
        rimLight.position.set(0, 10, -50);
        this.scene.add(rimLight);
        
        // Point lights for neon atmosphere
        const neonColors = [0xff00ff, 0x00ffff, 0xff6600];
        const positions = [
            new THREE.Vector3(30, 5, 30),
            new THREE.Vector3(-30, 5, -30),
            new THREE.Vector3(30, 5, -30)
        ];
        
        positions.forEach((pos, i) => {
            const pointLight = new THREE.PointLight(neonColors[i], 1.0, 50);
            pointLight.position.copy(pos);
            this.scene.add(pointLight);
        });
    }
    
    setupFog() {
        // Exponential fog for depth
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    }
    
    setupEnvironment() {
        // Ground plane with grid effect
        const groundSize = 100;
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x111122,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Grid overlay
        const gridHelper = new THREE.GridHelper(groundSize, 50, 0x00ffff, 0x003333);
        gridHelper.position.y = 0.01;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Arena walls (boundaries)
        this.createArenaWalls();
        
        // Decorative pillars
        this.createPillars();
        
        // Neon lights on ground
        this.createGroundLights();
    }
    
    createArenaWalls() {
        const wallHeight = 8;
        const wallThickness = 1;
        const arenaSize = 50;
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.4,
            metalness: 0.6,
            emissive: 0x000022,
            emissiveIntensity: 0.1
        });
        
        // Create 4 walls
        const wallPositions = [
            { pos: [0, wallHeight/2, -arenaSize], rot: [0, 0, 0], size: [arenaSize * 2, wallHeight, wallThickness] },
            { pos: [0, wallHeight/2, arenaSize], rot: [0, 0, 0], size: [arenaSize * 2, wallHeight, wallThickness] },
            { pos: [-arenaSize, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [arenaSize * 2, wallHeight, wallThickness] },
            { pos: [arenaSize, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [arenaSize * 2, wallHeight, wallThickness] }
        ];
        
        wallPositions.forEach(config => {
            const geometry = new THREE.BoxGeometry(...config.size);
            const wall = new THREE.Mesh(geometry, wallMaterial);
            wall.position.set(...config.pos);
            wall.rotation.set(...config.rot);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
            
            // Add neon strip to wall top
            this.addWallNeonStrip(wall, config.size);
        });
    }
    
    addWallNeonStrip(wall, size) {
        const stripGeometry = new THREE.BoxGeometry(size[0] - 0.5, 0.1, 0.15);
        const stripMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        const strip = new THREE.Mesh(stripGeometry, stripMaterial);
        strip.position.y = size[1] / 2 - 0.1;
        strip.position.z = size[2] / 2 + 0.08;
        wall.add(strip);
    }
    
    createPillars() {
        const pillarPositions = [
            [-20, 0, -20], [20, 0, -20], [-20, 0, 20], [20, 0, 20],
            [-35, 0, 0], [35, 0, 0], [0, 0, -35], [0, 0, 35]
        ];
        
        pillarPositions.forEach(pos => {
            this.createPillar(new THREE.Vector3(...pos));
        });
    }
    
    createPillar(position) {
        const group = new THREE.Group();
        
        // Main pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.6, 6, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            roughness: 0.3,
            metalness: 0.7
        });
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.y = 3;
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        group.add(pillar);
        
        // Neon ring
        const ringGeometry = new THREE.TorusGeometry(0.55, 0.05, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.9
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 4;
        group.add(ring);
        
        // Top light
        const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 6.2;
        group.add(light);
        
        group.position.copy(position);
        this.scene.add(group);
    }
    
    createGroundLights() {
        const lightPositions = [
            [-10, 0.05, -10], [10, 0.05, -10], [-10, 0.05, 10], [10, 0.05, 10],
            [0, 0.05, -25], [0, 0.05, 25], [-25, 0.05, 0], [25, 0.05, 0]
        ];
        
        const colors = [0xff00ff, 0x00ffff];
        
        lightPositions.forEach((pos, i) => {
            const geometry = new THREE.CircleGeometry(0.5, 16);
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % 2],
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const light = new THREE.Mesh(geometry, material);
            light.rotation.x = -Math.PI / 2;
            light.position.set(...pos);
            this.scene.add(light);
        });
    }
    
    setupSystems() {
        // Player system
        this.player = new Player(this.camera, this.scene);
        
        // Weapon system
        this.weapon = new Weapon(this.camera, this.scene, this.player);
        
        // Killframe system
        this.killframe = new KillframeSystem();
        
        // Game manager
        this.gameManager = new GameManager(this.scene);
        this.gameManager.setPlayer(this.player);
        
        // UI system
        this.ui = new UIManager();
        
        // Connect systems
        this.connectSystems();
    }
    
    connectSystems() {
        // Weapon hit callback
        this.weapon.onHit = (hitData) => {
            this.killframe.recordHit(hitData);
            this.gameManager.recordHit({ consecutiveHits: this.killframe.consecutiveHits });
            this.ui.showHitMarker(hitData.killed);
            
            if (hitData.killed) {
                this.killframe.recordKill(hitData);
                this.ui.showKillNotification(100 * this.killframe.getScoreMultiplier());
            }
        };
        
        // Weapon fire callback
        this.weapon.onFire = () => {
            this.killframe.recordShot();
            this.gameManager.recordShot();
        };
        
        // Killframe callbacks
        this.killframe.onActivate = (data) => {
            this.gameManager.setScoreMultiplier(data.scoreMultiplier);
            this.gameManager.recordKillframeActivation();
            this.ui.activateKillframeOverlay();
        };
        
        this.killframe.onDeactivate = () => {
            this.gameManager.setScoreMultiplier(1.0);
            this.ui.deactivateKillframeOverlay();
        };
        
        this.killframe.onChargeChange = (charge, max) => {
            this.ui.updateKillframe((charge / max) * 100, this.killframe.state);
        };
        
        this.killframe.onStateChange = (newState) => {
            this.ui.updateKillframe(this.killframe.getChargePercentage(), newState);
        };
        
        // Game manager callbacks
        this.gameManager.onScoreChange = (score) => {
            this.ui.updateScore(score);
        };
        
        this.gameManager.onWaveComplete = (data) => {
            this.ui.updateWave(data.waveNumber);
        };
        
        this.gameManager.onGameOver = (data) => {
            this.ui.showGameOver(data.stats);
        };
        
        this.gameManager.onStateChange = (state) => {
            this.ui.handleGameState(state);
        };
        
        // UI callbacks
        this.ui.onStartClick(() => {
            this.gameManager.startGame();
        });
        
        this.ui.onRestartClick(() => {
            this.gameManager.startGame();
            this.killframe.reset();
            this.ui.hideGameOver();
        });
        
        this.ui.onResumeClick(() => {
            this.gameManager.resumeGame();
        });
        
        // Player damage callback
        const originalTakeDamage = this.player.takeDamage.bind(this.player);
        this.player.takeDamage = (amount) => {
            const result = originalTakeDamage(amount);
            this.ui.updateHealth(this.player.health, this.player.maxHealth);
            this.ui.showDamageFlash();
            return result;
        };
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onResize());
        
        // Pause on Escape
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.gameManager.isPlaying()) {
                    this.gameManager.pauseGame();
                    document.exitPointerLock();
                } else if (this.gameManager.isPaused()) {
                    this.gameManager.resumeGame();
                }
            }
        });
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const currentTime = performance.now() / 1000;
        this.deltaTime = Math.min(currentTime - this.lastTime, 0.1); // Cap at 100ms
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.updateFPS();
        
        // Get time scale from killframe system
        const timeScale = this.killframe.getTimeScale();
        
        // Update systems if playing
        if (this.gameManager.isPlaying()) {
            // Update killframe system (always real time)
            this.killframe.update(this.deltaTime);
            
            // Update player with time scale
            this.player.update(this.deltaTime, timeScale);
            
            // Update weapon with time scale
            this.weapon.update(
                this.deltaTime,
                currentTime,
                this.gameManager.getEnemies(),
                timeScale
            );
            
            // Update game manager with time scale
            this.gameManager.update(this.deltaTime, timeScale);
            
            // Update UI health
            this.ui.updateHealth(this.player.health, this.player.maxHealth);
        }
        
        // Update UI
        this.ui.update(this.deltaTime);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    updateFPS() {
        this.fpsCounter.frames++;
        const now = performance.now();
        
        if (now - this.fpsCounter.lastUpdate >= 1000) {
            this.fpsCounter.current = this.fpsCounter.frames;
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastUpdate = now;
            this.ui.updateFPS(this.fpsCounter.current);
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new KillframeGame();
});
