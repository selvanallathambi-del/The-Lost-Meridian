/**
 * The Lost Meridian - Master Game Engine & Orchestrator
 * Pure Three.js r186 Architecture powering rendering, simulation, and gameplay loop.
 */

import * as THREE from 'three';
import { CameraRig } from './engine/CameraRig';
import { InputController } from './engine/InputController';
import { PostProcessingPass } from './engine/PostProcessingPass';
import { textureManager } from './engine/TextureManager';
import { TerrainSystem } from './world/TerrainSystem';
import { VegetationSystem } from './world/VegetationSystem';
import { WaterSystem } from './world/WaterSystem';
import { WeatherSystem } from './world/WeatherSystem';
import { WildlifeSystem } from './world/WildlifeSystem';
import { EnvironmentBuilder } from './world/EnvironmentBuilder';
import { AtmosphereSystem } from './world/AtmosphereSystem';
import { PlayerController } from './gameplay/PlayerController';
import { PuzzleManager } from './gameplay/PuzzleManager';
import { QuestManager } from './gameplay/QuestManager';
import { CinematicDirector } from './gameplay/CinematicDirector';
import { AutopilotController } from './gameplay/AutopilotController';
import { audioEngine } from './audio/AudioEngine';
import { QuestStage, GameSettings, ExpeditionPhoto, ActiveBrewPerk, InspectLoreData } from './types';
import { TEXTURE_PATHS } from './textures/ProceduralTextureGenerator';
import { getLoreData, CIVILIZATION_LORE_REGISTRY } from './lore/CivilizationLore';
import { BoatSystem } from './gameplay/BoatSystem';
import { FishingSystem, FishCatch } from './gameplay/FishingSystem';
import { FalconFlightSystem } from './gameplay/FalconFlightSystem';
import { MinecartSystem } from './gameplay/MinecartSystem';
import { DivingSystem } from './gameplay/DivingSystem';
import { BalloonSystem } from './gameplay/BalloonSystem';
import { BiplaneSystem } from './systems/BiplaneSystem';

export type VisualStyle = 'daylight' | 'stillwater' | 'ghibli' | 'cyberpunk' | 'museum';

export interface VisualStyleInfo {
  id: VisualStyle;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  desc: string;
}

const _scratchCamDir = new THREE.Vector3();

export const VISUAL_STYLES: VisualStyleInfo[] = [
  {
    id: 'daylight',
    name: 'Showcase Daylight',
    tagline: 'Clean Studio Realism',
    badge: 'REALISM',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981',
    desc: 'Pure crisp daylight, clear atmosphere, true-to-life PBR materials & sparkling turquoise water',
  },
  {
    id: 'stillwater',
    name: 'Stillwater Pond',
    tagline: 'Tranquil Mill Landing & Boat',
    badge: 'STILLWATER',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    accentColor: '#14b8a6',
    desc: 'Serene misty lake, gentle water lapping, turning mill wheel, glassy reflections & wooden rowboat',
  },
  {
    id: 'ghibli',
    name: 'Vibrant Ghibli',
    tagline: 'Anime Fantasy Watercolor',
    badge: 'STYLIZED',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b',
    desc: 'Lush saturated greens, warm golden sunbeams, cerulean skies & soft watercolor grading',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'High-Tech Synthwave',
    badge: 'SCI-FI',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentColor: '#06b6d4',
    desc: 'Dark obsidian stone, pulsating neon cyan & magenta conduits, moody indigo atmosphere',
  },
  {
    id: 'museum',
    name: 'Museum White Clay',
    tagline: 'Architectural Minimalist',
    badge: 'MINIMAL',
    badgeColor: 'bg-stone-300/20 text-stone-200 border-stone-400/40',
    accentColor: '#e2e8f0',
    desc: 'Matte ivory & porcelain architectural surfaces, diffused studio light, pure gold relic accents',
  },
];

export class GameManager {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer | null = null;
  public postProcessing: PostProcessingPass | null = null;
  public cameraRig: CameraRig;
  public input: InputController;

  // World Subsystems
  public terrain: TerrainSystem;
  public vegetation: VegetationSystem;
  public water: WaterSystem;
  public weather: WeatherSystem;
  public wildlife: WildlifeSystem;
  public environment: EnvironmentBuilder;
  public atmosphere: AtmosphereSystem;

  // Gameplay Subsystems
  public player: PlayerController;
  public puzzles: PuzzleManager;
  public quest: QuestManager;
  public cinematics: CinematicDirector;
  public autopilot: AutopilotController;
  public boat: BoatSystem;
  public fishing: FishingSystem;

  // Environment Lighting
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemiLight: THREE.HemisphereLight;

  // Mobile Touch Controls
  public showTouchControls = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.matchMedia('(pointer: coarse)').matches;

  public toggleTouchControls() {
    this.showTouchControls = !this.showTouchControls;
    this.notifyUI();
  }

  // State
  private isRunning = false;
  private clock = new THREE.Clock();
  private renderFrameCount = 0;
  public isPaused = false;
  public isJournalOpen = false;
  public isPhotoMode = false;
  public isLensModeActive = false;
  public capturedPhotos: ExpeditionPhoto[] = [];

  // Celestial Day/Night Cycle & Pocket Watch
  public timeOfDay = 14.0; // 0..24 hours (14 = 2:00 PM)
  public isTimeAdvancing = true;
  public isWatchOpen = false;

  // Astrolabe Stele Cipher Wheel Minigame
  public isCipherWheelOpen = false;
  public isCipherSolved = false;

  // Underwater Diving & Submerged Exploration
  public isUnderwater = false;
  public oxygenLevel = 100;

  // Cartography Map & Excavation
  public isMapOpen = false;
  public isExcavationOpen = false;
  public currentExcavationSiteId = 'excavation_mound_1';

  // Weather Station, Marconi Radio, Charcoal Rubbing
  public isWeatherStationOpen = false;
  public isRadioOpen = false;
  public isRubbingOpen = false;
  public currentReliefId = 'rubbing_stele_1';

  // Endemic Herbarium, Tuning Forks, Campfire Hearth
  public isHerbariumOpen = false;
  public isTuningForkOpen = false;
  public isCampfireBrewOpen = false;
  public activePerk: ActiveBrewPerk | null = null;

  // Andean Falcon Aerial Scouting & 3D Reliquary
  public isFalconFlying = false;
  public isReliquaryOpen = false;
  public falconFlight: FalconFlightSystem;

  // Meridian Planetarium, Field Chemistry, Theodolite
  public isPlanetariumOpen = false;
  public isPlanetariumActivated = false;
  public isChemistryLabOpen = false;
  public isTheodoliteOpen = false;

  // Minecart, Diving, and Phonograph systems
  public minecartSystem: MinecartSystem;
  public divingSystem: DivingSystem;
  public isPhonographOpen = false;

  // Observation Balloon, Marconi Radio, Epigraphy Wheel
  public balloonSystem: BalloonSystem;
  public isEpigraphyOpen = false;

  // Armillary Sphere, Hydraulic Siphon, Paleontology Lab
  public isArmillaryOpen = false;
  public isHydraulicOpen = false;
  public isPaleontologyOpen = false;

  // Metallurgy Forge, Cartography Desk, Chladni Resonance Table
  public isMetallurgyOpen = false;
  public isCartographyOpen = false;
  public isChladniOpen = false;

  // 1928 Curtiss Biplane, Assay Sarcophagus, Magic Lantern
  public biplaneSystem: BiplaneSystem;
  public isAssayOpen = false;
  public isLanternOpen = false;

  // Grand Solstice Finale Sequence
  public isFinaleOpen = false;
  public isFinaleCompleted = false;

  // 10-Lead Stringent QA Audit Dossier & Master Review
  public isQAAuditOpen = false;

  public openQAAudit() {
    this.closeAnyOpenModal();
    this.isQAAuditOpen = true;
    this.input.exitPointerLock();
    this.notifyUI();
  }

  public closeQAAudit() {
    this.isQAAuditOpen = false;
    this.input.requestPointerLock();
    this.notifyUI();
  }

  // 1928 Archaeological Field Dossier & Stele Inscription Lore
  public isInspectLoreOpen = false;
  public currentLoreData: InspectLoreData | null = null;

  public openLoreInspection(loreIdOrData: string | InspectLoreData) {
    if (typeof loreIdOrData === 'string') {
      const found = getLoreData(loreIdOrData);
      if (found) {
        this.currentLoreData = found;
      } else {
        this.currentLoreData = {
          id: loreIdOrData,
          title: 'Archaeological Field Inscription',
          subtitle: 'Sector 7 Solarian Horizon',
          category: 'CIVILIZATION',
          dateOrEra: 'c. 1420 BCE',
          authorOrCulture: 'Solarian Dynasty of Atlan-Mar',
          description: 'An ancient carved architectural monument bearing petroglyphs and astronomical alignments.',
          historicalSignificance: 'Forming part of the sacred network constructed by the builders of the Lost Meridian.',
          archaeologicalNotes: 'Recovered during the 1928 Royal Geographic Society Expedition.',
        };
      }
    } else {
      this.currentLoreData = loreIdOrData;
    }
    this.isInspectLoreOpen = true;
    this.input.exitPointerLock();
    this.notifyUI();
  }

  public closeLoreInspection() {
    this.isInspectLoreOpen = false;
    this.currentLoreData = null;
    this.input.requestPointerLock();
    this.notifyUI();
  }

  public isAnyModalOpen(): boolean {
    return (
      this.isInspectLoreOpen ||
      this.isJournalOpen ||
      this.isWatchOpen ||
      this.isCipherWheelOpen ||
      this.isMapOpen ||
      this.isExcavationOpen ||
      this.isWeatherStationOpen ||
      this.isRadioOpen ||
      this.isRubbingOpen ||
      this.isHerbariumOpen ||
      this.isTuningForkOpen ||
      this.isCampfireBrewOpen ||
      this.isReliquaryOpen ||
      this.isPlanetariumOpen ||
      this.isChemistryLabOpen ||
      this.isTheodoliteOpen ||
      this.isPhonographOpen ||
      this.isEpigraphyOpen ||
      this.isArmillaryOpen ||
      this.isHydraulicOpen ||
      this.isPaleontologyOpen ||
      this.isMetallurgyOpen ||
      this.isCartographyOpen ||
      this.isChladniOpen ||
      this.isAssayOpen ||
      this.isLanternOpen ||
      this.isFinaleOpen ||
      this.isQAAuditOpen
    );
  }

  public closeAnyOpenModal(): boolean {
    let closed = false;
    if (this.isQAAuditOpen) { this.isQAAuditOpen = false; closed = true; }
    if (this.isInspectLoreOpen) { this.isInspectLoreOpen = false; this.currentLoreData = null; closed = true; }
    if (this.isJournalOpen) { this.isJournalOpen = false; closed = true; }
    if (this.isWatchOpen) { this.isWatchOpen = false; closed = true; }
    if (this.isCipherWheelOpen) { this.isCipherWheelOpen = false; closed = true; }
    if (this.isMapOpen) { this.isMapOpen = false; closed = true; }
    if (this.isExcavationOpen) { this.isExcavationOpen = false; closed = true; }
    if (this.isWeatherStationOpen) { this.isWeatherStationOpen = false; closed = true; }
    if (this.isRadioOpen) { this.isRadioOpen = false; closed = true; }
    if (this.isRubbingOpen) { this.isRubbingOpen = false; closed = true; }
    if (this.isHerbariumOpen) { this.isHerbariumOpen = false; closed = true; }
    if (this.isTuningForkOpen) { this.isTuningForkOpen = false; closed = true; }
    if (this.isCampfireBrewOpen) { this.isCampfireBrewOpen = false; closed = true; }
    if (this.isReliquaryOpen) { this.isReliquaryOpen = false; closed = true; }
    if (this.isPlanetariumOpen) { this.isPlanetariumOpen = false; closed = true; }
    if (this.isChemistryLabOpen) { this.isChemistryLabOpen = false; closed = true; }
    if (this.isTheodoliteOpen) { this.isTheodoliteOpen = false; closed = true; }
    if (this.isPhonographOpen) { this.isPhonographOpen = false; closed = true; }
    if (this.isEpigraphyOpen) { this.isEpigraphyOpen = false; closed = true; }
    if (this.isArmillaryOpen) { this.isArmillaryOpen = false; closed = true; }
    if (this.isHydraulicOpen) { this.isHydraulicOpen = false; closed = true; }
    if (this.isPaleontologyOpen) { this.isPaleontologyOpen = false; closed = true; }
    if (this.isMetallurgyOpen) { this.isMetallurgyOpen = false; closed = true; }
    if (this.isCartographyOpen) { this.isCartographyOpen = false; closed = true; }
    if (this.isChladniOpen) { this.isChladniOpen = false; closed = true; }
    if (this.isAssayOpen) { this.isAssayOpen = false; closed = true; }
    if (this.isLanternOpen) { this.isLanternOpen = false; closed = true; }
    if (this.isFinaleOpen) { this.isFinaleOpen = false; closed = true; }
    return closed;
  }

  // User Settings
  public settings: GameSettings = {
    graphics: {
      shadowQuality: 'high',
      depthOfField: true,
      bloom: true,
      filmGrain: true,
      vignette: true,
      fov: 70,
      resolutionScale: 1.0,
      motionBlur: false,
    },
    audio: {
      masterVolume: 0.9,
      sfxVolume: 0.85,
      musicVolume: 0.7,
      ambienceVolume: 0.8,
    },
    controls: {
      mouseSensitivity: 0.0022,
      invertY: false,
      toggleCrouch: true,
      toggleSprint: false,
    },
  };

  // State change callbacks for React UI sync
  public onStateChange?: () => void;

  private resizeHandler: () => void;
  private _scratchFocusTarget = new THREE.Vector3();
  public isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
  public isGameStarted = false;

  // Cinematic Optical Depth-of-Field & Post-Processing Pipeline
  public isDepthOfFieldEnabled = true;
  public currentFocalDistance = 18.0;
  public isFocusedOnArtifact = false;
  public focusedArtifactName = '';

  // Visual Styles Pipeline (Daylight, Stillwater, Ghibli, Cyberpunk, Museum)
  public currentVisualStyle: VisualStyle = 'daylight';

  public setVisualStyle(style: VisualStyle) {
    this.currentVisualStyle = style;
    this.atmosphere.setVisualStyle(style);
    this.water.setVisualStyle(style);
    this.postProcessing?.setVisualStyle(style);
    this.applyLightingForStyle(style);
    const found = VISUAL_STYLES.find((s) => s.id === style);
    this.quest.showNotification(`STYLE: ${found?.name.toUpperCase() || style.toUpperCase()}`);
    this.notifyUI();
  }

  public cycleVisualStyle() {
    const styles: VisualStyle[] = ['stillwater', 'daylight', 'ghibli', 'cyberpunk', 'museum'];
    const nextIdx = (styles.indexOf(this.currentVisualStyle) + 1) % styles.length;
    this.setVisualStyle(styles[nextIdx]);
  }

  public applyLightingForStyle(style: VisualStyle) {
    if (!this.sunLight || !this.ambientLight || !this.hemiLight) return;
    switch (style) {
      case 'stillwater':
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.FogExp2(0xd6eefc, 0.0007); // Crystal-clear visibility
        this.sunLight.color.setHex(0xfffbf0);
        this.sunLight.intensity = 3.2;
        this.ambientLight.color.setHex(0xe8f5fd);
        this.ambientLight.intensity = 1.0;
        this.hemiLight.color.setHex(0xffffff);
        this.hemiLight.groundColor.setHex(0x92c488);
        this.hemiLight.intensity = 1.0;
        break;
      case 'daylight':
        this.scene.background = new THREE.Color(0x82b8d9);
        this.scene.fog = new THREE.FogExp2(0xcbe6f6, 0.0014);
        this.sunLight.color.setHex(0xfffaee);
        this.sunLight.intensity = 2.8;
        this.ambientLight.color.setHex(0xd4e9ff);
        this.ambientLight.intensity = 0.82;
        this.hemiLight.color.setHex(0xb2ddfc);
        this.hemiLight.groundColor.setHex(0x546e48);
        this.hemiLight.intensity = 0.85;
        break;
      case 'ghibli':
        this.scene.background = new THREE.Color(0x38bdf8);
        this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.0038);
        this.sunLight.color.setHex(0xffe066);
        this.sunLight.intensity = 3.2;
        this.ambientLight.color.setHex(0x86efac);
        this.ambientLight.intensity = 0.75;
        this.hemiLight.color.setHex(0x7dd3fc);
        this.hemiLight.groundColor.setHex(0x4ade80);
        this.hemiLight.intensity = 0.85;
        break;
      case 'cyberpunk':
        this.scene.background = new THREE.Color(0x050814);
        this.scene.fog = new THREE.FogExp2(0x0f172a, 0.0075);
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 2.4;
        this.ambientLight.color.setHex(0x1e1b4b);
        this.ambientLight.intensity = 0.85;
        this.hemiLight.color.setHex(0xec4899);
        this.hemiLight.groundColor.setHex(0x0284c7);
        this.hemiLight.intensity = 0.75;
        break;
      case 'museum':
        this.scene.background = new THREE.Color(0xf1f5f9);
        this.scene.fog = new THREE.FogExp2(0xe2e8f0, 0.0035);
        this.sunLight.color.setHex(0xfffbf5);
        this.sunLight.intensity = 2.4;
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.95;
        this.hemiLight.color.setHex(0xf8fafc);
        this.hemiLight.groundColor.setHex(0xe2e8f0);
        this.hemiLight.intensity = 0.95;
        break;
    }
  }

  public updateSunPosition() {
    if (!this.sunLight || !this.atmosphere) return;
    const sunDir = this.atmosphere.sunDirection;
    const sunDist = 75.0;
    const targetY = this.player ? this.player.position.y : 0;
    const targetX = this.player ? this.player.position.x : 0;
    const targetZ = this.player ? this.player.position.z : 0;

    this.sunLight.position.set(
      targetX + sunDir.x * sunDist,
      targetY + Math.max(20.0, sunDir.y * sunDist),
      targetZ + sunDir.z * sunDist
    );
    this.sunLight.target.position.set(targetX, targetY, targetZ);
    this.sunLight.target.updateMatrixWorld();
  }

  public setTimeOfDay(hour: number) {
    this.timeOfDay = ((hour % 24) + 24) % 24;
    this.atmosphere.setTimeOfDay(this.timeOfDay);
    this.updateSunPosition();

    if (!this.sunLight || !this.ambientLight) return;

    // Celestial lighting shifts based on time of day
    const h = this.timeOfDay;
    if (h < 5.0 || h > 19.5) {
      // Midnight moonlight
      this.sunLight.color.setHex(0x94b4e8);
      this.sunLight.intensity = 0.55;
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.35;
    } else if (h >= 5.0 && h < 7.0) {
      // Dawn twilight
      this.sunLight.color.setHex(0xffcaa5);
      this.sunLight.intensity = 1.9;
      this.ambientLight.color.setHex(0x818cf8);
      this.ambientLight.intensity = 0.5;
    } else if (h >= 17.5 && h <= 19.5) {
      // Crimson sunset
      this.sunLight.color.setHex(0xff7a45);
      this.sunLight.intensity = 2.1;
      this.ambientLight.color.setHex(0x475569);
      this.ambientLight.intensity = 0.45;
    } else {
      // Standard daytime
      this.applyLightingForStyle(this.currentVisualStyle);
    }
  }

  public toggleBoat() {
    const success = this.boat.toggleBoard(this.player.position, this.terrain);
    if (success) {
      if (this.boat.isBoarded) {
        this.quest.showNotification('ROWBOAT BOARDED — USE WASD / JOYSTICK TO ROW & STEER');
      } else {
        this.quest.showNotification('DISMOUNTED ROWBOAT AT SHORELINE');
      }
      this.notifyUI();
    }
  }

  public toggleFishing() {
    if (this.fishing.isFishing) {
      this.fishing.reelIn();
      this.notifyUI();
    } else {
      const fwd = new THREE.Vector3();
      this.cameraRig.camera.getWorldDirection(fwd);
      this.fishing.toggleFishing(this.player.position, fwd);
      this.quest.showNotification('FISHING LINE CAST — WAIT FOR NIBBLE OR PRESS [F] TO REEL');
      this.notifyUI();
    }
  }

  public toggleDepthOfField() {
    this.isDepthOfFieldEnabled = !this.isDepthOfFieldEnabled;
    this.settings.graphics.depthOfField = this.isDepthOfFieldEnabled;
    this.quest.showNotification(`CINEMATIC DOF: ${this.isDepthOfFieldEnabled ? 'ON' : 'OFF'}`);
    this.notifyUI();
  }

  public isContextLost = false;
  private boundContextLost: (e: Event) => void;
  private boundContextRestored: () => void;

  constructor() {
    this.resizeHandler = this.onResize.bind(this);
    this.boundContextLost = (e: Event) => {
      e.preventDefault();
      this.isContextLost = true;
    };
    this.boundContextRestored = () => {
      this.isContextLost = false;
    };
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x283b3c);
    this.scene.fog = new THREE.FogExp2(0x283b3c, 0.0072);

    // Load Photorealistic Equirectangular Jungle Canopy Environment Map for PBR Reflections
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(TEXTURE_PATHS.skybox, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.scene.environment = texture;
    });

    this.cameraRig = new CameraRig(this.settings.graphics.fov);
    this.input = new InputController();

    // 1. Build world subsystems
    this.atmosphere = new AtmosphereSystem();
    this.terrain = new TerrainSystem();
    this.vegetation = new VegetationSystem(this.terrain);
    this.water = new WaterSystem();
    this.weather = new WeatherSystem();
    this.wildlife = new WildlifeSystem();
    this.environment = new EnvironmentBuilder();

    // 2. Add meshes to scene
    this.scene.add(this.atmosphere.skyMesh);
    this.scene.add(this.atmosphere.godRaysGroup);
    this.scene.add(this.terrain.mesh);
    this.scene.add(this.vegetation.group);
    this.scene.add(this.water.group);
    this.scene.add(this.weather.group);
    this.scene.add(this.wildlife.group);
    this.scene.add(this.environment.group);

    // 3. Setup gameplay systems
    this.player = new PlayerController(this.cameraRig, this.terrain, this.environment);
    this.scene.add(this.player.torchLight);
    this.scene.add(this.player.torchTarget);
    this.scene.add(this.player.character.group);
    this.scene.add(this.player.trailRenderer.group);

    this.boat = new BoatSystem();
    this.scene.add(this.boat.mesh);

    this.fishing = new FishingSystem();
    this.scene.add(this.fishing.group);
    this.fishing.onCatchFish = (fish) => {
      this.quest.addItem({
        id: `fish_${Date.now()}`,
        name: fish.name,
        category: 'artifact',
        description: `${fish.rarity} freshwater species (${fish.weight}). ${fish.lore}`,
        lore: fish.lore,
        iconName: 'Sparkles',
      });
      this.quest.showNotification(`🎣 CAUGHT: ${fish.name.toUpperCase()} (${fish.weight})!`);
      this.notifyUI();
    };

    this.falconFlight = new FalconFlightSystem(this.scene);

    this.minecartSystem = new MinecartSystem();
    this.scene.add(this.minecartSystem.trackGroup);
    this.scene.add(this.minecartSystem.cartGroup);

    this.divingSystem = new DivingSystem();
    this.scene.add(this.divingSystem.diverLight);

    this.balloonSystem = new BalloonSystem();
    this.scene.add(this.balloonSystem.group);

    this.biplaneSystem = new BiplaneSystem();
    if (this.environment.biplaneMesh && this.environment.biplaneProp) {
      this.biplaneSystem.init(this.scene, this.environment.biplaneMesh, this.environment.biplaneProp);
    }

    this.puzzles = new PuzzleManager(this.environment);
    this.scene.add(this.puzzles.beamGroup);

    this.quest = new QuestManager();
    this.cinematics = new CinematicDirector(this.cameraRig, this.quest, this.environment);
    this.autopilot = new AutopilotController(this);

    // 4. Setup Photorealistic AAA Natural Lighting (Balanced Dynamic Range)
    this.ambientLight = new THREE.AmbientLight(0x22362b, 0.38);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x7fb865, 0x1f2e1a, 0.45);
    this.scene.add(this.hemiLight);

    const isMobile = this.isMobile;

    this.sunLight = new THREE.DirectionalLight(0xfffaea, 2.4);
    this.sunLight.position.set(45, 80, 50);
    this.sunLight.castShadow = true;
    
    // High-fidelity AAA shadow cascades with soft PCF penumbra
    this.currentPreset = isMobile ? 'balanced' : 'high';
    const shadowMapSize = isMobile ? 1024 : 2048;
    this.sunLight.shadow.mapSize.width = shadowMapSize;
    this.sunLight.shadow.mapSize.height = shadowMapSize;
    this.sunLight.shadow.camera.near = 2.0;
    this.sunLight.shadow.camera.far = 145.0;
    this.sunLight.shadow.camera.left = -34;
    this.sunLight.shadow.camera.right = 34;
    this.sunLight.shadow.camera.top = 34;
    this.sunLight.shadow.camera.bottom = -34;
    this.sunLight.shadow.bias = -0.0001;
    this.sunLight.shadow.normalBias = 0.025;
    this.sunLight.shadow.radius = isMobile ? 1.5 : 2.0;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Apply Photorealistic Expedition Daylight atmosphere by default
    this.applyLightingForStyle('daylight');
  }

  public currentPreset: 'ultra' | 'high' | 'balanced' | 'performance' = 'balanced';

  public setGraphicsQualityPreset(preset: 'ultra' | 'high' | 'balanced' | 'performance') {
    this.currentPreset = preset;
    if (!this.renderer) return;

    if (preset === 'ultra') {
      const shadowSize = 4096; // 4K Crisp Directional Shadows
      this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
      this.sunLight.shadow.radius = 2.5; // Soft penumbra
      this.sunLight.shadow.map?.dispose();
      this.sunLight.shadow.map = null;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); // Super-sampled clarity
      this.water.setReflectionResolution(2048); // 2K Crisp Real-Time Water Mirror Reflections
      this.settings.graphics.shadowQuality = 'high';
      this.isDepthOfFieldEnabled = true;
    } else if (preset === 'high') {
      const shadowSize = 2048; // 2K Directional Shadows
      this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
      this.sunLight.shadow.radius = 1.8;
      this.sunLight.shadow.map?.dispose();
      this.sunLight.shadow.map = null;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.water.setReflectionResolution(1024);
      this.settings.graphics.shadowQuality = 'high';
      this.isDepthOfFieldEnabled = true;
    } else if (preset === 'balanced') {
      const shadowSize = 1024; // 1K Standard Shadows
      this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
      this.sunLight.shadow.radius = 1.6;
      this.sunLight.shadow.map?.dispose();
      this.sunLight.shadow.map = null;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(1.0);
      this.water.setReflectionResolution(512);
      this.settings.graphics.shadowQuality = 'low';
      this.isDepthOfFieldEnabled = true;
    } else if (preset === 'performance') {
      const shadowSize = 512; // Fast 512 Shadows
      this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
      this.sunLight.shadow.radius = 0.5;
      this.sunLight.shadow.map?.dispose();
      this.sunLight.shadow.map = null;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
      this.renderer.setPixelRatio(0.85);
      this.water.setReflectionResolution(256);
      this.settings.graphics.shadowQuality = 'off';
      this.isDepthOfFieldEnabled = false;
    }

    // Force shadow map update and resize post processing
    this.sunLight.shadow.needsUpdate = true;
    if (this.postProcessing) {
      this.postProcessing.setSize(window.innerWidth * this.renderer.getPixelRatio(), window.innerHeight * this.renderer.getPixelRatio());
    }
    this.quest.showNotification(`GRAPHICS SET TO: ${preset.toUpperCase()}`);
    this.notifyUI();
  }

  public setWeatherPreset(type: 'CLEAR' | 'FOG' | 'RAIN' | 'HUMID_OVERCAST' | 'LIGHT_RAIN' | 'HEAVY_RAIN') {
    this.weather.setWeather(type as any);
    this.quest.showNotification(`WEATHER SHIFTED TO: ${type.replace('_', ' ')}`);
    this.notifyUI();
  }

  public toggleWeatherMode() {
    const newMode = this.weather.toggleWeatherMode();
    this.quest.showNotification(`WEATHER SHIFTED TO: ${newMode}`);
    this.notifyUI();
  }

  public toggleCameraMode() {
    this.isPhotoMode = !this.isPhotoMode;
    if (this.isPhotoMode) {
      this.input.exitPointerLock();
      this.quest.showNotification('📷 1928 FIELD CAMERA ENGAGED — Press [SPACE] or Click Snap');
    } else {
      this.input.requestPointerLock();
    }
    this.notifyUI();
  }

  public capturePhoto(dataUrl: string, filterStyle: string = '1928 Sepia') {
    audioEngine.playCameraShutter();
    const photo: ExpeditionPhoto = {
      id: `photo_${Date.now()}`,
      dataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: this.getZoneNameByPosition(this.player.position.z),
      filterStyle,
    };
    this.capturedPhotos.unshift(photo);
    this.quest.showNotification('📸 EXPEDITION PHOTO CAPTURED & SAVED TO LOGBOOK!');
    this.notifyUI();
    return photo;
  }

  public deletePhoto(photoId: string) {
    this.capturedPhotos = this.capturedPhotos.filter((p) => p.id !== photoId);
    this.notifyUI();
  }

  public getZoneNameByPosition(z: number): string {
    if (z > 50) return 'Expedition Camp Sector';
    if (z > 0) return 'Jungle Ravine Trail';
    if (z > -30) return 'River Basin & Millpond';
    if (z > -60) return 'Great Cascade Gorge';
    if (z > -95) return 'Subterranean Aqueduct Sluice';
    if (z > -130) return 'Grand Temple Plaza';
    if (z > -175) return 'Prism Reflection Sanctuary';
    return 'The Meridian Inner Vault';
  }

  public init(canvas: HTMLCanvasElement) {
    if (this.renderer) {
      try {
        this.renderer.dispose();
      } catch {
        // Safe disposal
      }
    }

    canvas.addEventListener('webglcontextlost', this.boundContextLost);
    canvas.addEventListener('webglcontextrestored', this.boundContextRestored);

    const isMobile = this.isMobile;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'highp',
      stencil: false,
      alpha: false,
      failIfMajorPerformanceCaveat: false,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const maxDpr = Math.min(window.devicePixelRatio || 1.0, isMobile ? 1.0 : 1.5);
    this.renderer.setPixelRatio(maxDpr * this.settings.graphics.resolutionScale);
    
    // When cinematic post-processing is active, render scene in linear HDR without double-tonemapping
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // High-resolution torch shadows with soft falloff
    const torchShadowSize = isMobile ? 512 : 1024;
    this.player.torchLight.shadow.mapSize.width = torchShadowSize;
    this.player.torchLight.shadow.mapSize.height = torchShadowSize;
    this.player.torchLight.shadow.bias = -0.0001;
    this.player.torchLight.shadow.camera.near = 0.2;
    this.player.torchLight.shadow.camera.far = 40;

    // Initialize Texture Manager with WebGL Compressed Textures & Mipmap Streaming
    textureManager.init(this.renderer);
    if (this.terrain?.mesh) {
      textureManager.registerMesh(this.terrain.mesh, TEXTURE_PATHS.jungleFloor, { repeatX: 24, repeatY: 24 });
    }

    // Load Photorealistic Environment Map with full PMREM pre-filtered radiance
    new THREE.TextureLoader().load(
      TEXTURE_PATHS.skybox,
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 16;
        try {
          const pmremGenerator = new THREE.PMREMGenerator(this.renderer!);
          pmremGenerator.compileEquirectangularShader();
          const envMap = pmremGenerator.fromEquirectangular(tex).texture;
          this.scene.environment = envMap;
          pmremGenerator.dispose();
        } catch {
          this.scene.environment = tex;
        }
        if ('environmentIntensity' in this.scene) {
          (this.scene as any).environmentIntensity = 1.25;
        }
      }
    );

    this.input.attach(canvas);
    this.cameraRig.setAspectRatio(window.innerWidth / window.innerHeight);

    // Initialize Fullscreen Cinematic Post-Processing Pass (AgX Filmic, SSAO, SSCS, Bloom)
    this.postProcessing = new PostProcessingPass(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', this.resizeHandler);

    this.startLoop();
  }

  public startNewGame() {
    this.isGameStarted = true;
    audioEngine.init();
    this.player.position.set(0, 2.5, 78);
    this.player.facingYaw = 0;
    this.cameraRig.yaw = 0;
    this.cameraRig.targetYaw = 0;
    this.cameraRig.pitch = -0.05;
    this.cameraRig.targetPitch = -0.05;

    this.cinematics.playOpeningCinematic(() => {
      this.input.requestPointerLock();
      this.quest.showNotification('EXPEDITION COMMENCED — Check Field Journal [TAB]');
    });
  }

  public handleInteraction() {
    // If player is on boat, pressing [E] or clicking dismounts
    if (this.boat.isBoarded) {
      this.toggleBoat();
      return;
    }

    // If near boat, boarding takes top priority
    if (this.boat.getBoardingDistance(this.player.position) < 5.0) {
      this.toggleBoat();
      return;
    }

    const target = this.player.currentFocusTarget;
    if (!target) return;

    if (target.type === 'read') {
      const lore = getLoreData(target.id);
      if (lore) {
        this.quest.readDocument(target.id);
        this.openLoreInspection(lore);
        audioEngine.playSfx('click');
        return;
      }
      const doc = this.quest.readDocument(target.id);
      if (doc) {
        this.quest.showNotification(`EXAMINED: ${doc.title}`);
        this.isJournalOpen = true;
        this.input.exitPointerLock();
        this.notifyUI();
      }
    } else if (target.type === 'pickup') {
      if (target.id === 'item_meridian_key_1') {
        this.quest.addItem({
          id: 'item_meridian_key_1',
          name: 'Meridian Solar Disc Fragment',
          category: 'artifact',
          description: 'An ancient carved golden dial bearing astronomical star positions.',
          lore: 'Recovered from Dr. Sterling’s field kit at the base camp.',
          iconName: 'Sparkles',
        });
        // Remove relic mesh from world
        const found = this.environment.interactables.find((o) => o.interactionData.id === target.id);
        if (found) found.visible = false;

        this.quest.advanceStage(
          QuestStage.JUNGLE_EXPEDITION,
          'Follow the ancient waystones along the jungle trail'
        );
      } else if (target.id === 'pickup_sunken_urn_1') {
        this.quest.addItem({
          id: 'item_sunken_urn_1',
          name: 'Sunken Gilded Urn',
          category: 'artifact',
          description: 'A heavily encrusted gold ceremonial urn recovered from the riverbed.',
          lore: 'Dating back to the pre-classic Meridian builders, filled with dried ceremonial resins.',
          iconName: 'Sparkles',
        });
        const found = this.environment.interactables.find((o) => o.interactionData.id === target.id);
        if (found) found.visible = false;
        audioEngine.playItemDiscovery();
        this.quest.showNotification('💎 SALVAGED: Sunken Gilded Urn from riverbed!');
      } else if (target.id === 'pickup_sunken_jade_2') {
        this.quest.addItem({
          id: 'item_sunken_jade_2',
          name: 'Submerged Jade Amphora',
          category: 'artifact',
          description: 'A precious vessel carved from deep emerald imperial jade.',
          lore: 'Retrieved from the deep plunge pool beneath the Great Cascade Waterfall.',
          iconName: 'Sparkles',
        });
        const found = this.environment.interactables.find((o) => o.interactionData.id === target.id);
        if (found) found.visible = false;
        audioEngine.playItemDiscovery();
        this.quest.showNotification('💎 SALVAGED: Submerged Jade Amphora from waterfall pool!');
      }
    } else if (target.type === 'inspect') {
      if (target.id === 'stele_cipher_wheel') {
        this.isCipherWheelOpen = true;
        this.input.exitPointerLock();
        this.notifyUI();
      } else if (target.id === 'weather_station_camp') {
        this.isWeatherStationOpen = true;
        this.input.exitPointerLock();
        this.notifyUI();
      } else if (target.id === 'marconi_radio_camp') {
        this.isRadioOpen = true;
        this.input.exitPointerLock();
        this.notifyUI();
      } else if (getLoreData(target.id)) {
        this.openLoreInspection(target.id);
        audioEngine.playSfx('click');
      }
    } else if (target.type === 'rubbing') {
      this.currentReliefId = target.id;
      this.isRubbingOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.type === 'brazier') {
      if (this.player.isTorchOn) {
        const res = this.environment.igniteBrazier(target.id);
        audioEngine.playFireIgnition();
        this.cameraRig.addTrauma(0.22);
        if (res.isAllLit) {
          audioEngine.playStoneGateOpening();
          this.cameraRig.addTrauma(0.55);
          this.quest.addItem({
            id: 'item_amulet_sunken_sun',
            name: 'Amulet of the Sunken Sun',
            category: 'artifact',
            description: 'A radiant golden talisman depicting the subterranean sun setting beneath the waters.',
            lore: 'Unsealed from the Guardian Crypt after igniting all four ancient subterranean braziers.',
            iconName: 'Sparkles',
          });
          this.quest.showNotification('🔥 ALL 4 BRAZIERS IGNITED — GUARDIAN CRYPT UNSEALED!');
        } else {
          this.quest.showNotification(`🔥 BRAZIER IGNITED (${res.count}/4)`);
        }
        this.notifyUI();
      } else {
        this.quest.showNotification('EQUIP TORCH [T] TO IGNITE ANCIENT BRAZIER');
      }
    } else if (target.type === 'brew') {
      this.isCampfireBrewOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.type === 'harvest') {
      audioEngine.playPlantHarvest();
      const found = this.environment.interactables.find((o) => o.interactionData.id === target.id);
      if (found) found.visible = false;

      let plantName = 'Endemic Botanical Specimen';
      if (target.id === 'plant_grotto_orchid') plantName = 'Luminescent Grotto Orchid';
      else if (target.id === 'plant_meridian_fern') plantName = 'Sacred Meridian Spiral Fern';
      else if (target.id === 'plant_dragons_blood') plantName = "Crimson Dragon's Blood Blossom";

      this.quest.addItem({
        id: target.id,
        name: plantName,
        category: 'artifact',
        description: 'Rare endemic botanical specimen harvested from the valley wild.',
        lore: 'Catalogued into Dr. Sterling’s Herbarium Press album.',
        iconName: 'Sparkles',
      });
      this.quest.showNotification(`🌿 HARVESTED: ${plantName.toUpperCase()}`);
      this.notifyUI();
    } else if (target.type === 'excavate') {
      this.currentExcavationSiteId = target.id;
      this.isExcavationOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.type === 'rotate') {
      if (target.id === 'boat_dock_landing') {
        this.toggleBoat();
      } else if (target.data?.dialIndex) {
        this.cameraRig.addTrauma(0.24);
        const solved = this.puzzles.rotateWaterDial(target.data.dialIndex);
        if (solved) {
          this.cameraRig.addTrauma(0.65);
          this.cinematics.playWaterGateOpenCutscene(() => {
            this.quest.advanceStage(
              QuestStage.TEMPLE_APPROACH,
              'Ascend the Grand Temple steps'
            );
          });
        }
      } else if (target.data?.prismIndex) {
        this.cameraRig.addTrauma(0.22);
        const solved = this.puzzles.rotateSolarPrism(target.data.prismIndex);
        if (solved) {
          this.cameraRig.addTrauma(0.55);
          this.quest.showNotification('SOLAR PRISMS ALIGNED — SANCTUARY GATE UNSEALED');
          this.quest.advanceStage(
            QuestStage.UNDERGROUND_DESCENT,
            'Descend the subterranean chasm to the Meridian Sanctuary'
          );
        }
      }
    } else if (target.type === 'altar') {
      this.cameraRig.addTrauma(0.75);
      if (!this.cinematics.isPlayingCinematic) {
        this.cinematics.playMeridianActivationSequence(() => {
          this.notifyUI();
        });
      }
    } else if (target.id === 'falcon_perch') {
      this.startFalconFlight();
    } else if (target.id.startsWith('rappel_')) {
      this.executeRappel(target.id);
    } else if (target.id === 'meridian_planetarium') {
      this.isPlanetariumOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'chemistry_bench') {
      this.isChemistryLabOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'survey_theodolite') {
      this.isTheodoliteOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'diving_helmet_rig') {
      if (this.divingSystem.isDiving) {
        this.stopDiving();
      } else {
        this.startDiving();
      }
    } else if (target.id === 'sunken_diver_chest') {
      audioEngine.playItemDiscovery();
      this.quest.addItem({
        id: 'item_sunken_chalice',
        name: 'Sunken Gilded Chalice',
        category: 'artifact',
        description: 'Recovered from the plunge pool deep subterranean crypt.',
        lore: 'Carved with celestial meridian sunrays.',
        iconName: 'Sparkles',
      });
      this.quest.showNotification('✦ DISCOVERED: SUNKEN GILDED CHALICE!');
    } else if (target.id === 'edison_phonograph') {
      this.isPhonographOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'chasm_minecart') {
      if (this.minecartSystem.isRiding) {
        this.dismountMinecart();
      } else {
        this.boardMinecart();
      }
    } else if (target.id === 'mesa_balloon') {
      if (this.balloonSystem.isBoarded) {
        this.dismountBalloon();
      } else {
        this.boardBalloon();
      }
    } else if (target.id === 'marconi_radio') {
      this.isRadioOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'epigraphy_desk') {
      this.isEpigraphyOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'armillary_sphere') {
      this.isArmillaryOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'hydraulic_siphon') {
      this.isHydraulicOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'paleontology_bench') {
      this.isPaleontologyOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'metallurgy_forge') {
      this.isMetallurgyOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'cartography_desk') {
      this.isCartographyOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'chladni_table') {
      this.isChladniOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'mesa_biplane') {
      if (this.biplaneSystem.isBoarded) {
        this.dismountBiplane();
      } else {
        this.boardBiplane();
      }
    } else if (target.id === 'assay_balance') {
      this.isAssayOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'magic_lantern') {
      this.isLanternOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    } else if (target.id === 'grand_apex_altar') {
      this.triggerGrandFinale();
    }
  }

  public triggerGrandFinale() {
    this.isFinaleCompleted = true;
    this.setTimeOfDay(17.5); // Golden Solstice Twilight
    audioEngine.playGrandFinaleFanfare();

    this.cinematics.playMeridianActivationSequence(() => {
      this.isFinaleOpen = true;
      this.input.exitPointerLock();
      this.notifyUI();
    });
  }

  public boardBiplane() {
    this.biplaneSystem.board();
    this.quest.showNotification('🛩️ 1928 CURTISS "FALCON" BIPLANE BOARDED [W: THROTTLE, A/D: ROLL, ↑/↓: PITCH]');
    this.notifyUI();
  }

  public dismountBiplane() {
    const exitPos = this.biplaneSystem.dismount(this.terrain);
    this.player.position.copy(exitPos);
    this.player.velocity.set(0, 0, 0);
    this.quest.showNotification('LANDED & DISMOUNTED BIPLANE');
    this.notifyUI();
  }

  public executeEmergencyRescue() {
    // 1. Close any open modal to clear UI lockups
    this.closeAnyOpenModal();
    this.isPaused = false;

    // 2. Clear vehicles
    if (this.boat.isBoarded) this.boat.isBoarded = false;
    if (this.balloonSystem.isBoarded) this.balloonSystem.isBoarded = false;
    if (this.minecartSystem.isRiding) this.minecartSystem.isRiding = false;
    if (this.biplaneSystem.isBoarded) this.biplaneSystem.isBoarded = false;
    if (this.isFalconFlying) this.stopFalconFlight();

    // 3. Unstick player kinematics and place safely on ground
    this.player.rescueUnstick();

    // 4. Fortify puzzle visual synchronization
    this.puzzles.syncVisualsWithState();

    // 5. Ensure required quest items are not lost
    this.quest.ensurePrerequisiteQuestItems();

    // 6. Audio and UI feedback
    audioEngine.playItemDiscovery();
    this.quest.showNotification('✦ EMERGENCY PROTOCOL: POSITION & ALL SAFEGUARDS RESTORED');
    this.input.requestPointerLock();
    this.notifyUI();
  }

  public applyBrewPerk(perk: ActiveBrewPerk) {
    this.activePerk = perk;
    this.notifyUI();
  }

  public triggerSonarWavefront(freq: number) {
    const origin = this.player.position.clone();
    origin.y += 1.6;
    this.environment.triggerSonarWavefront(freq, origin);
  }

  public startFalconFlight() {
    this.isFalconFlying = true;
    this.falconFlight.startFlight(this.player.position);
    this.quest.showNotification('🦅 ANDEAN FALCON SCOUTING LAUNCHED');
    this.notifyUI();
  }

  public stopFalconFlight() {
    this.isFalconFlying = false;
    this.falconFlight.stopFlight();
    this.cameraRig.camera.position.copy(this.player.position);
    this.quest.showNotification('RETURNED TO DR. STERLING');
    this.notifyUI();
  }

  public executeRappel(targetId: string) {
    audioEngine.playRappelFriction();
    if (targetId === 'rappel_cliff_waterfall_top') {
      this.player.position.set(-4.2, -4.2, -42.0);
      this.quest.showNotification('🧗 RAPPELED DOWN TO WATERFALL GROTTO');
    } else if (targetId === 'rappel_cliff_waterfall_bottom') {
      this.player.position.set(-4.2, 4.5, -42.0);
      this.quest.showNotification('🧗 CLIMBED UP TO WATERFALL CLIFF');
    } else if (targetId === 'rappel_chasm_top') {
      this.player.position.set(0.0, -9.5, -135.0);
      this.quest.showNotification('🧗 RAPPELED DOWN TO SUBTERRANEAN CRYPT');
    } else if (targetId === 'rappel_chasm_bottom') {
      this.player.position.set(0.0, 1.2, -135.0);
      this.quest.showNotification('🧗 CLIMBED UP TO CHASM LEDGE');
    }
    this.notifyUI();
  }

  public activatePlanetariumDome() {
    this.isPlanetariumActivated = true;
    this.environment.setPlanetariumActive(true);
    this.notifyUI();
  }

  public boardMinecart() {
    this.minecartSystem.boardCart(this.player.position);
    this.quest.showNotification('🛷 BOARDED SUBTERRANEAN MINECART [W: ACCELERATE, S: BRAKE, SPACE: DISMOUNT]');
    this.notifyUI();
  }

  public dismountMinecart() {
    const exitPos = this.minecartSystem.dismountCart();
    this.player.position.copy(exitPos);
    this.quest.showNotification('DISMOUNTED MINECART');
    this.notifyUI();
  }

  public startDiving() {
    this.divingSystem.startDiving(this.player.position);
    this.quest.showNotification('🤿 1920s COPPER DIVING HELMET EQUIPPED');
    this.notifyUI();
  }

  public stopDiving() {
    this.divingSystem.stopDiving();
    this.quest.showNotification('SURFACED FROM DIVE');
    this.notifyUI();
  }

  public boardBalloon() {
    this.balloonSystem.board(this.player.position);
    this.quest.showNotification('🎈 BOARDED OBSERVATION BALLOON [W: FIRE BURNER, S: VENT, A/D: YAW]');
    this.notifyUI();
  }

  public dismountBalloon() {
    const exitPos = this.balloonSystem.dismount(this.terrain);
    this.player.position.copy(exitPos);
    this.player.velocity.set(0, 0, 0);
    this.quest.showNotification('MOORED & DISMOUNTED OBSERVATION BALLOON');
    this.notifyUI();
  }

  private onResize() {
    if (!this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024);
    const maxDpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.75);
    this.renderer.setPixelRatio(maxDpr * this.settings.graphics.resolutionScale);
    this.cameraRig.setAspectRatio(w / h);
    this.postProcessing?.setSize(w, h);
  }

  private startLoop() {
    this.isRunning = true;
    const loop = () => {
      if (this.isRunning) {
        requestAnimationFrame(loop);
        this.update();
      }
    };
    loop();
  }

  private update() {
    if (this.isContextLost) return;
    const delta = Math.min(0.1, this.clock.getDelta());
    const time = this.clock.getElapsedTime();

    if (!this.isGameStarted) {
      // Gentle scenic overview around the camp while on title screen
      const camTime = time * 0.12;
      this.cameraRig.camera.position.set(
        Math.sin(camTime) * 10.0,
        3.2 + Math.sin(camTime * 0.5) * 0.4,
        78.0 + Math.cos(camTime) * 8.0
      );
      this.cameraRig.camera.lookAt(0, 2.0, 42.0);

      this.water.update(delta, time);
      this.atmosphere.update(delta, time, this.cameraRig.camera.position);
      this.vegetation.update(time, 0.8);

      if (this.renderer) {
        if (!this.isMobile && this.postProcessing) {
          this.postProcessing.render(this.renderer, this.scene, this.cameraRig.camera, time);
        } else {
          this.renderer.render(this.scene, this.cameraRig.camera);
        }
      }
      return;
    }

    // Poll Gamepad Controller Inputs
    this.input.updateGamepad(delta);

    // Handle Input toggles
    if (this.input.consumeJournal()) {
      this.isJournalOpen = !this.isJournalOpen;
      if (this.isJournalOpen) {
        this.input.exitPointerLock();
      } else {
        this.input.requestPointerLock();
      }
      this.notifyUI();
    }

    if (this.input.consumeMap()) {
      this.isMapOpen = !this.isMapOpen;
      if (this.isMapOpen) {
        this.input.exitPointerLock();
      } else {
        this.input.requestPointerLock();
      }
      this.notifyUI();
    }

    if (this.input.consumePause()) {
      if (this.closeAnyOpenModal()) {
        this.input.requestPointerLock();
      } else {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
          this.input.exitPointerLock();
        } else {
          this.input.requestPointerLock();
        }
      }
      this.notifyUI();
    }

    if (this.input.consumeRescue()) {
      this.executeEmergencyRescue();
    }

    if (this.input.consumeQAAudit()) {
      if (this.isQAAuditOpen) {
        this.closeQAAudit();
      } else {
        this.openQAAudit();
      }
    }

    if (this.input.consumeCameraViewToggle()) {
      const mode = this.cameraRig.cycleViewMode();
      this.quest.showNotification(`VIEW: ${mode.toUpperCase()}`);
      this.notifyUI();
    }

    if (this.input.consumeLensMode()) {
      this.isLensModeActive = !this.isLensModeActive;
      this.postProcessing?.setLensMode(this.isLensModeActive);
      audioEngine.playSfx('click');
      this.quest.showNotification(
        this.isLensModeActive
          ? '✦ MERIDIAN CELESTIAL LENS ENGAGED [V]'
          : '✦ MERIDIAN CELESTIAL LENS DISENGAGED'
      );
      this.notifyUI();
    }

    if (this.input.consumePhotoMode()) {
      this.toggleCameraMode();
    }

    if (this.input.consumeFishing()) {
      this.toggleFishing();
    }

    if (this.input.consumeInteract()) {
      this.handleInteraction();
    }

    if (this.input.loreInspectRequested) {
      this.input.loreInspectRequested = false;
      const target = this.player.currentFocusTarget;
      if (target) {
        this.openLoreInspection(target.id);
      } else {
        this.openLoreInspection('doc_trail_stele');
      }
    }

    if (this.isFalconFlying) {
      if (this.input.consumeJump() || this.input.consumePause()) {
        this.stopFalconFlight();
      } else {
        this.falconFlight.update(delta, this.input, this.cameraRig.camera);
        this.atmosphere.update(delta, time, this.cameraRig.camera.position);
        this.water.update(delta, time);
        this.weather.update(delta, this.falconFlight.position, this.scene, this.sunLight, this.ambientLight, this.hemiLight);
        this.environment.update(delta, time, this.quest.currentStage === QuestStage.CHAPTER_COMPLETE);
      }
      return;
    }

    if (!this.isPaused && !this.isJournalOpen) {
      this.input.pollGamepad();
      // 1. Update Player, Boat & Camera
      if (this.biplaneSystem.isBoarded) {
        // Biplane inputs
        if (this.input.moveForward) this.biplaneSystem.adjustThrottle(0.35 * delta);
        if (this.input.moveBackward) this.biplaneSystem.adjustThrottle(-0.35 * delta);
        if (this.input.moveLeft || this.input.virtualMoveX < -0.2) this.biplaneSystem.rollInput = -1;
        else if (this.input.moveRight || this.input.virtualMoveX > 0.2) this.biplaneSystem.rollInput = 1;
        else this.biplaneSystem.rollInput = 0;

        if (this.input.consumeJump()) this.biplaneSystem.dropFlare();

        // Mouse delta pitch
        this.biplaneSystem.pitchInput = -this.input.mouseDeltaY * 0.05;
        this.biplaneSystem.update(delta, this.terrain);

        this.player.position.copy(this.biplaneSystem.position);
        this.cameraRig.camera.position.copy(this.biplaneSystem.position);
        this.cameraRig.camera.position.y += 0.8;
        const camOffset = new THREE.Vector3(0, 1.2, 5.5).applyEuler(this.biplaneSystem.rotation);
        this.cameraRig.camera.position.add(camOffset);
        this.cameraRig.camera.lookAt(this.biplaneSystem.position);
      } else if (this.balloonSystem.isBoarded) {
        if (this.input.consumeJump() && this.balloonSystem.altitude <= this.balloonSystem.minAltitude + 1.5) {
          this.dismountBalloon();
        } else {
          this.balloonSystem.update(delta, this.input, this.cameraRig, this.player.position);
        }
      } else if (this.minecartSystem.isRiding) {
        if (this.input.consumeJump()) {
          this.dismountMinecart();
        } else {
          this.minecartSystem.update(delta, this.input, this.player.position, this.cameraRig.camera);
        }
      } else if (this.boat.isBoarded) {
        this.boat.update(delta, time, this.input, this.cameraRig, this.terrain);
        this.player.position.copy(this.boat.position);
        this.player.position.y += 0.25;
        const boatCamGround = this.terrain.getHeightAt(this.cameraRig.camera.position.x, this.cameraRig.camera.position.z);
        this.cameraRig.update(delta, this.player.position, false, false, false, boatCamGround);
        this.player.character.group.position.copy(this.player.position);
        this.player.character.update(delta, 0, false, this.boat.heading, true);
      } else {
        this.player.update(delta, this.input);
        this.boat.update(delta, time, this.input, this.cameraRig, this.terrain);
      }

      this.divingSystem.update(delta, this.player.position);

      this.fishing.update(delta, time, this.cameraRig);

      // 2. Zone-based quest trigger triggers
      this.checkZoneTriggers();

      // 3. Update World systems
      this.atmosphere.update(delta, time, this.cameraRig.camera.position);
      this.vegetation.update(time, this.weather.state.windSpeed);
      this.terrain.update(this.weather.state.wetness);
      this.water.update(delta, time);
      this.weather.update(delta, this.player.position, this.scene, this.sunLight, this.ambientLight, this.hemiLight);
      this.wildlife.update(delta, time, this.player.position);
      this.environment.update(delta, time, this.quest.currentStage === QuestStage.CHAPTER_COMPLETE);
      this.puzzles.update(delta);
      this.cinematics.update(delta);
      this.quest.update(delta);

      // 4. Update Audio Engine Spatial acoustics
      audioEngine.updateSpatialAmbience(this.player.position.z, this.weather.state.rainIntensity);

      // 5. Dynamic Subterranean Darkness & Torch Reliance (Chiaroscuro Atmosphere)
      const isSubterranean = this.player.position.z < -62;
      const targetAmbient = isSubterranean ? 0.08 : 0.38;
      const targetHemi = isSubterranean ? 0.06 : 0.45;
      this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, targetAmbient, delta * 3.5);
      this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, targetHemi, delta * 3.5);

      // Celestial Time Progression & Day/Night Orbit
      if (this.isTimeAdvancing) {
        this.timeOfDay = (this.timeOfDay + delta * 0.04) % 24;
        this.setTimeOfDay(this.timeOfDay);
      } else {
        this.updateSunPosition();
      }

      // Underwater Submersion & Breath Gauge
      const px = this.player.position.x;
      const pz = this.player.position.z;
      const camY = this.cameraRig.camera.position.y;
      const inRiverArea = Math.abs(px) < 8.8 && pz > -38 && pz < 28;
      const inPoolArea = Math.abs(px) < 12.0 && pz <= -38 && pz >= -60;
      const currentWaterSurface = inPoolArea ? -4.5 : (inRiverArea ? -2.35 : -999);
      const isSubmerged = camY < currentWaterSurface;

      if (isSubmerged !== this.isUnderwater) {
        this.isUnderwater = isSubmerged;
        audioEngine.setUnderwater(isSubmerged);
        if (isSubmerged) {
          audioEngine.playWaterSplash(0.7);
        }
      }

      // Active Campfire Infusion Perk Expiration
      if (this.activePerk) {
        if (Date.now() > this.activePerk.expiresAt) {
          this.activePerk = null;
          this.quest.showNotification('EXPEDITION BREW PERK EXPIRED');
          this.notifyUI();
        } else if (this.activePerk.id === 'yerba_mate') {
          this.player.stamina = 100;
        }
      }

      if (this.isUnderwater) {
        const drainRate = this.activePerk?.id === 'grotto_mint' ? 2.0 : 4.0;
        this.oxygenLevel = Math.max(0, this.oxygenLevel - delta * drainRate);
        if (Math.random() < delta * 0.5) {
          audioEngine.playUnderwaterBubble();
        }
      } else {
        this.oxygenLevel = Math.min(100, this.oxygenLevel + delta * 35.0);
      }

      // 5. Dynamic Camera Lens Condensation (Waterfall mist & rain)
      const mistProximity = Math.max(0, 1.0 - Math.abs(this.player.position.z - (-38.0)) / 18.0);
      const totalLensCondensation = Math.max(this.weather.state.rainIntensity, mistProximity * 0.85);
      this.postProcessing?.setRainIntensity(totalLensCondensation);

      // 6. Sun/Moon shadow position follows celestial orbit and player
      const sunDir = this.atmosphere.sunDirection;
      this.sunLight.position.set(
        this.player.position.x + sunDir.x * 60,
        this.player.position.y + Math.max(15, sunDir.y * 70),
        this.player.position.z + sunDir.z * 60
      );
      this.sunLight.target.position.copy(this.player.position);
      this.sunLight.target.updateMatrixWorld();
      this.postProcessing?.setSunPosition(this.sunLight.position);
    }

    // Update frustum-aware texture streaming & mobile memory guardrail
    textureManager.update(this.cameraRig.camera, delta);

    // Render Scene with maximum frame rate and cinematic post-processing
    if (this.renderer) {
      this.renderFrameCount++;
      // Only compute planar mirror reflection pass when player is near river water and every 2nd frame (Desktop only)
      const isNearRiverWater = this.player.position.z > -65 && this.player.position.z < 38;
      if (isNearRiverWater && this.renderFrameCount % 2 === 0) {
        const camDirY = this.cameraRig.camera.getWorldDirection(_scratchCamDir).y;
        if (camDirY < 0.85 || this.cameraRig.camera.position.y <= -1.0) {
          this.water.updateReflection(this.renderer, this.scene, this.cameraRig.camera);
        }
      }

      if (this.postProcessing) {
        this.postProcessing.render(this.renderer, this.scene, this.cameraRig.camera, time);
      } else {
        this.renderer.render(this.scene, this.cameraRig.camera);
      }
    }
  }

  private checkZoneTriggers() {
    const z = this.player.position.z;

    // Approaching Waterfall (Z = -28 to -40)
    if (z < -28 && this.quest.currentStage === QuestStage.JUNGLE_EXPEDITION) {
      this.quest.advanceStage(
        QuestStage.WATERFALL_PASSAGE,
        'Find the hidden grotto passage behind the waterfall'
      );
      this.cinematics.playWaterfallReveal(() => {});
    }

    // Entering Aqueduct Chamber (Z < -62)
    if (z < -62 && this.quest.currentStage === QuestStage.WATERFALL_PASSAGE) {
      this.quest.advanceStage(
        QuestStage.AQUEDUCT_PUZZLE,
        'Align the ancient stone flumes to drain the submerged gateway'
      );
    }

    // Entering Temple Interior (Z < -132)
    if (z < -132 && this.quest.currentStage === QuestStage.TEMPLE_APPROACH) {
      this.quest.advanceStage(
        QuestStage.LIGHT_ALIGNMENT_PUZZLE,
        'Rotate the crystalline prisms to reflect sunlight onto the Solar Crest'
      );
    }

    // Entering Meridian Chamber (Z < -215)
    if (z < -215 && this.quest.currentStage === QuestStage.UNDERGROUND_DESCENT) {
      this.quest.advanceStage(
        QuestStage.MERIDIAN_ACTIVATION,
        'Approach the central keystole and awaken the Meridian'
      );
    }
  }

  private notifyUI() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  public destroy() {
    this.isRunning = false;
    window.removeEventListener('resize', this.resizeHandler);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.boundContextLost);
      this.renderer.domElement.removeEventListener('webglcontextrestored', this.boundContextRestored);
    }
    this.input.detach();
    this.water.dispose();
    this.atmosphere.dispose();
    if (this.postProcessing) {
      this.postProcessing.dispose();
      this.postProcessing = null as any;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null as any;
    }
  }
}
