/**
 * KILLFRAME - FPS Prototype
 * Main Entry Point
 * 
 * Initializes the game engine, manages the game loop,
 * and coordinates all game systems.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { Player } from './player.js';
import { WeaponSystem } from './weapon.js';
import { EnemyManager } from './enemy.js';
import { KillFrameSystem } from './killframe.js';
import { GameManager } from './gameManager.js';
import { UIManager } from './ui.js';

/**
 * Main Game Engine Class
 * Handles rendering, game loop, and system coordination
 */
class GameEngine {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        
        // Game systems
        this.player = null;
        this.weaponSystem = null;
        this.enemyManager = null;
        this.killFrameSystem = null;
        this.gameManager = null;
        this.uiManager = null;
        
        // Timing
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.elapsedTime = 0;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.fps = 0;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        
        // Time scale for slow-motion effects
        this.timeScale = 1.0;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
    }
    
    /**
     * Initialize the game engine
     */
    async init() {
        this.initRenderer();
        this.initScene();
        this.initCamera();
        this.initLighting();
        this.initPostProcessing();
        this.initEnvironment();
        this.initGameSystems();
        this.initEventListeners();
        
        console.log('[GameEngine] Initialization complete');
    }
    
    /**
     * Initialize the WebGL renderer
     */
    initRenderer() {
        const container = document.getElementById('game-container');
        
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
        this.renderer.toneMappingExposure = 1.0;
        
        container.appendChild(this.renderer.domElement);
        
        console.log('[GameEngine] Renderer initialized');
    }
    
    /**
     * Initialize the 3D scene
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        
        // Add atmospheric fog
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);
        
        console.log('[GameEngine] Scene initialized');
    }
    
    /**
     * Initialize the camera
     */
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.8, 0);
        
        console.log('[GameEngine] Camera initialized');
    }
    
    /**
     * Initialize scene lighting
     */
    initLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404050, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);
        
        // Colored accent lights for cyberpunk aesthetic
        const cyanLight = new THREE.PointLight(0x00ffff, 1, 30);
        cyanLight.position.set(-10, 5, -10);
        this.scene.add(cyanLight);
        
        const magentaLight = new THREE.PointLight(0xff00ff, 1, 30);
        magentaLight.position.set(10, 5, 10);
        this.scene.add(magentaLight);
        
        // Store lights for potential animation
        this.lights = {
            ambient: ambientLight,
            directional: directionalLight,
            cyan: cyanLight,
            magenta: magentaLight
        };
        
        console.log('[GameEngine] Lighting initialized');
    }
    
    /**
     * Initialize post-processing effects
     */
    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom pass for glow effects
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        
        this.bloomPass = bloomPass;
        
        console.log('[GameEngine] Post-processing initialized');
    }
    
    /**
     * Initialize the game environment (arena)
     */
    initEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add grid lines for visual reference
        const gridHelper = new THREE.GridHelper(100, 50, 0x00ffff, 0x1a1a2e);
        gridHelper.position.y = 0.01;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Create arena walls and obstacles
        this.createArenaStructures();
        
        // Add decorative elements
        this.createDecorativeElements();
        
        console.log('[GameEngine] Environment initialized');
    }
    
    /**
     * Create arena walls and obstacles
     */
    createArenaStructures() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4e,
            roughness: 0.6,
            metalness: 0.4
        });
        
        // Arena boundary walls
        const wallHeight = 8;
        const wallThickness = 1;
        const arenaSize = 45;
        
        const wallConfigs = [
            { pos: [0, wallHeight/2, -arenaSize], size: [arenaSize * 2, wallHeight, wallThickness] },
            { pos: [0, wallHeight/2, arenaSize], size: [arenaSize * 2, wallHeight, wallThickness] },
            { pos: [-arenaSize, wallHeight/2, 0], size: [wallThickness, wallHeight, arenaSize * 2] },
            { pos: [arenaSize, wallHeight/2, 0], size: [wallThickness, wallHeight, arenaSize * 2] }
        ];
        
        wallConfigs.forEach(config => {
            const geometry = new THREE.BoxGeometry(...config.size);
            const wall = new THREE.Mesh(geometry, wallMaterial);
            wall.position.set(...config.pos);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
        });
        
        // Cover obstacles
        const coverMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a5e,
            roughness: 0.5,
            metalness: 0.5
        });
        
        const coverPositions = [
            { pos: [-15, 1.5, -15], size: [4, 3, 1] },
            { pos: [15, 1.5, -15], size: [4, 3, 1] },
            { pos: [-15, 1.5, 15], size: [4, 3, 1] },
            { pos: [15, 1.5, 15], size: [4, 3, 1] },
            { pos: [0, 2, 0], size: [6, 4, 6] },
            { pos: [-25, 1, -25], size: [3, 2, 3] },
            { pos: [25, 1, 25], size: [3, 2, 3] },
            { pos: [-25, 1, 25], size: [3, 2, 3] },
            { pos: [25, 1, -25], size: [3, 2, 3] }
        ];
        
        coverPositions.forEach(config => {
            const geometry = new THREE.BoxGeometry(...config.size);
            const cover = new THREE.Mesh(geometry, coverMaterial);
            cover.position.set(...config.pos);
            cover.castShadow = true;
            cover.receiveShadow = true;
            cover.userData.isObstacle = true;
            this.scene.add(cover);
        });
    }
    
    /**
     * Create decorative elements (neon lights, etc.)
     */
    createDecorativeElements() {
        // Neon light strips
        const neonMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            toneMapped: false
        });
        
        const neonPositions = [
            { pos: [-44, 6, 0], rot: [0, 0, Math.PI/2], scale: [0.2, 40, 0.2] },
            { pos: [44, 6, 0], rot: [0, 0, Math.PI/2], scale: [0.2, 40, 0.2] },
            { pos: [0, 6, -44], rot: [Math.PI/2, 0, 0], scale: [0.2, 40, 0.2] },
            { pos: [0, 6, 44], rot: [Math.PI/2, 0, 0], scale: [0.2, 40, 0.2] }
        ];
        
        neonPositions.forEach(config => {
            const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const neon = new THREE.Mesh(geometry, neonMaterial.clone());
            neon.position.set(...config.pos);
            neon.rotation.set(...config.rot);
            neon.scale.set(...config.scale);
            
            // Add point light at each neon strip
            const light = new THREE.PointLight(0x00ffff, 0.5, 15);
            light.position.copy(neon.position);
            this.scene.add(light);
            
            this.scene.add(neon);
        });
        
        // Magenta accents on corners
        const magentaNeon = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            toneMapped: false
        });
        
        const corners = [
            [-44, 4, -44], [44, 4, -44], [-44, 4, 44], [44, 4, 44]
        ];
        
        corners.forEach(pos => {
            const geometry = new THREE.SphereGeometry(0.5, 16, 16);
            const sphere = new THREE.Mesh(geometry, magentaNeon);
            sphere.position.set(...pos);
            this.scene.add(sphere);
            
            const light = new THREE.PointLight(0xff00ff, 1, 20);
            light.position.set(...pos);
            this.scene.add(light);
        });
    }
    
    /**
     * Initialize all game systems
     */
    initGameSystems() {
        // Initialize UI Manager first
        this.uiManager = new UIManager();
        
        // Initialize Game Manager
        this.gameManager = new GameManager(this);
        
        // Initialize Player
        this.player = new Player(this);
        
        // Initialize Weapon System
        this.weaponSystem = new WeaponSystem(this);
        
        // Initialize Kill Frame System
        this.killFrameSystem = new KillFrameSystem(this);
        
        // Initialize Enemy Manager
        this.enemyManager = new EnemyManager(this);
        
        console.log('[GameEngine] All game systems initialized');
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Window resize
        window.addEventListener('resize', this.onWindowResize);
        
        // Start button
        const startButton = document.getElementById('start-button');
        startButton.addEventListener('click', () => this.startGame());
        
        // Restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => this.restartGame());
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement !== this.renderer.domElement) {
                if (this.isRunning && !this.gameManager.isGameOver) {
                    this.pause();
                }
            }
        });
        
        console.log('[GameEngine] Event listeners initialized');
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        
        if (this.bloomPass) {
            this.bloomPass.resolution.set(width, height);
        }
    }
    
    /**
     * Start the game
     */
    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        
        // Request pointer lock
        this.renderer.domElement.requestPointerLock();
        
        // Reset game state
        this.gameManager.reset();
        this.player.reset();
        this.weaponSystem.reset();
        this.killFrameSystem.reset();
        this.enemyManager.reset();
        this.uiManager.reset();
        
        // Start game loop
        this.isRunning = true;
        this.isPaused = false;
        this.clock.start();
        
        this.update();
        
        console.log('[GameEngine] Game started');
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        document.getElementById('gameover-screen').classList.add('hidden');
        this.startGame();
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
        console.log('[GameEngine] Game paused');
    }
    
    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
        this.renderer.domElement.requestPointerLock();
        console.log('[GameEngine] Game resumed');
    }
    
    /**
     * End the game
     */
    endGame() {
        this.isRunning = false;
        document.exitPointerLock();
        
        // Show game over screen with stats
        this.uiManager.showGameOver(
            this.gameManager.score,
            this.gameManager.kills,
            this.weaponSystem.getAccuracy()
        );
        
        console.log('[GameEngine] Game ended');
    }
    
    /**
     * Set time scale for slow-motion effects
     */
    setTimeScale(scale) {
        this.timeScale = scale;
    }
    
    /**
     * Get scaled delta time
     */
    getScaledDeltaTime() {
        return this.deltaTime * this.timeScale;
    }
    
    /**
     * Main game loop
     */
    update() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(this.update);
        
        // Calculate delta time
        this.deltaTime = Math.min(this.clock.getDelta(), 0.1);
        this.elapsedTime = this.clock.getElapsedTime();
        
        // Skip update if paused
        if (this.isPaused) {
            this.render();
            return;
        }
        
        // Get scaled delta time for gameplay
        const scaledDelta = this.getScaledDeltaTime();
        
        // Update all game systems
        this.player.update(scaledDelta);
        this.weaponSystem.update(scaledDelta);
        this.enemyManager.update(scaledDelta);
        this.killFrameSystem.update(scaledDelta);
        this.gameManager.update(scaledDelta);
        this.uiManager.update(scaledDelta);
        
        // Update FPS counter
        this.updateFPS();
        
        // Render the scene
        this.render();
    }
    
    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }
    }
    
    /**
     * Render the scene
     */
    render() {
        // Use composer for post-processing
        this.composer.render();
    }
}

// ============================================
// Application Entry Point
// ============================================

const game = new GameEngine();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await game.init();
    console.log('[KILLFRAME] Game ready');
});

// Export for debugging
window.game = game;
