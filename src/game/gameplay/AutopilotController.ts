/**
 * The Lost Meridian - Autopilot / Autonomous Demo System
 * Autonomously navigates through all 8 quest stages, solves puzzles in real time,
 * narrates archaeological lore, and triggers the grand ending sequence.
 */

import * as THREE from 'three';
import { GameManager } from '../GameManager';
import { QuestStage } from '../types';

export interface AutopilotWaypoint {
  stage: QuestStage;
  targetPos: THREE.Vector3;
  lookAtPos: THREE.Vector3;
  subtitle: string;
  duration: number; // Duration to travel/stay at waypoint (seconds)
  action?: (game: GameManager) => void;
}

export class AutopilotController {
  public isActive = false;
  public isPaused = false;
  public speedMultiplier = 1.0; // 1x, 2x, 4x
  public currentWaypointIndex = 0;
  public waypointProgress = 0; // 0.0 to 1.0
  public currentSubtitle = '';

  private waypoints: AutopilotWaypoint[] = [];
  private startPos = new THREE.Vector3();
  private startLookAt = new THREE.Vector3();
  private tempLook = new THREE.Vector3();
  private tempPos = new THREE.Vector3();

  constructor(private game: GameManager) {
    this.initWaypoints();
  }

  private initWaypoints() {
    this.waypoints = [
      {
        stage: QuestStage.CAMP_INVESTIGATION,
        targetPos: new THREE.Vector3(0, 3.2, 72),
        lookAtPos: new THREE.Vector3(-4, 2.5, 68),
        subtitle: '🤖 AUTOPILOT DEMO: Inspecting Dr. Sterling’s Expedition Camp (1928)...',
        duration: 5.0,
        action: (g) => {
          if (!g.player.isTorchOn) g.player.toggleTorch();
          g.quest.readDocument('doc_camp_journal');
        },
      },
      {
        stage: QuestStage.JUNGLE_EXPEDITION,
        targetPos: new THREE.Vector3(0, 1.2, 25),
        lookAtPos: new THREE.Vector3(0, 0, 0),
        subtitle: '🤖 Traversing the Jungle Ravine following ancient carved waystones...',
        duration: 6.0,
      },
      {
        stage: QuestStage.WATERFALL_PASSAGE,
        targetPos: new THREE.Vector3(0, -2.5, -28),
        lookAtPos: new THREE.Vector3(0, 5, -45),
        subtitle: '🤖 Locating hidden entrance behind the roaring Great Cascade Gorge...',
        duration: 5.5,
      },
      {
        stage: QuestStage.AQUEDUCT_PUZZLE,
        targetPos: new THREE.Vector3(0, -4.5, -68),
        lookAtPos: new THREE.Vector3(-6, -3, -76),
        subtitle: '🤖 Subterranean Aqueduct reached. Auto-aligning ancient flume conduit dials...',
        duration: 6.0,
        action: (g) => {
          // Auto-solve water puzzle dials sequentially with real physical rotation & sound
          let interval = 0;
          const rotateStep = () => {
            interval++;
            if (interval === 1) g.puzzles.rotateWaterDial(1);
            if (interval === 2) g.puzzles.rotateWaterDial(2);
            if (interval === 3) {
              g.puzzles.rotateWaterDial(3);
              // Force exact solution if needed
              g.puzzles.waterPuzzle.dial1 = 90;
              g.puzzles.waterPuzzle.dial2 = 180;
              g.puzzles.waterPuzzle.dial3 = 270;
              if (g.environment.waterDial1) g.environment.waterDial1.rotation.y = (90 * Math.PI) / 180;
              if (g.environment.waterDial2) g.environment.waterDial2.rotation.y = (180 * Math.PI) / 180;
              if (g.environment.waterDial3) g.environment.waterDial3.rotation.y = (270 * Math.PI) / 180;
              g.puzzles.waterPuzzle.isSolved = true;
              g.quest.advanceStage(
                QuestStage.AQUEDUCT_PUZZLE,
                'Conduit dials aligned! Sunken gate receding...'
              );
            } else if (interval < 3) {
              setTimeout(rotateStep, 800);
            }
          };
          rotateStep();
        },
      },
      {
        stage: QuestStage.TEMPLE_APPROACH,
        targetPos: new THREE.Vector3(0, 1.0, -122),
        lookAtPos: new THREE.Vector3(0, 12, -155),
        subtitle: '🤖 Sunken gateway drained! Ascending the Grand Temple of the Sun stairs...',
        duration: 6.0,
      },
      {
        stage: QuestStage.LIGHT_ALIGNMENT_PUZZLE,
        targetPos: new THREE.Vector3(0, 3.5, -155),
        lookAtPos: new THREE.Vector3(0, 5, -170),
        subtitle: '🤖 Entering Solar Temple Hall. Auto-refracting crystalline light prisms onto Solar Crest...',
        duration: 6.5,
        action: (g) => {
          // Auto-solve solar light prism reflection puzzle sequentially
          let step = 0;
          const alignStep = () => {
            step++;
            if (step === 1) g.puzzles.rotateSolarPrism(1);
            if (step === 2) g.puzzles.rotateSolarPrism(2);
            if (step === 3) {
              g.puzzles.rotateSolarPrism(3);
              g.puzzles.lightPuzzle.prism1 = 45;
              g.puzzles.lightPuzzle.prism2 = 135;
              g.puzzles.lightPuzzle.prism3 = 225;
              if (g.environment.lightPrism1) g.environment.lightPrism1.rotation.y = (45 * Math.PI) / 180;
              if (g.environment.lightPrism2) g.environment.lightPrism2.rotation.y = (135 * Math.PI) / 180;
              if (g.environment.lightPrism3) g.environment.lightPrism3.rotation.y = (225 * Math.PI) / 180;
              g.puzzles.lightPuzzle.beam1Hit = true;
              g.puzzles.lightPuzzle.beam2Hit = true;
              g.puzzles.lightPuzzle.beam3Hit = true;
              g.puzzles.lightPuzzle.isSolved = true;
              g.quest.advanceStage(
                QuestStage.UNDERGROUND_DESCENT,
                'Solar beam focused! Subterranean chasm bridge unsealed...'
              );
            } else if (step < 3) {
              setTimeout(alignStep, 800);
            }
          };
          alignStep();
        },
      },
      {
        stage: QuestStage.UNDERGROUND_DESCENT,
        targetPos: new THREE.Vector3(0, -7.5, -200),
        lookAtPos: new THREE.Vector3(0, -8, -228),
        subtitle: '🤖 Crossing the subterranean chasm bridge into the Meridian Abyss Sanctuary...',
        duration: 5.5,
      },
      {
        stage: QuestStage.MERIDIAN_ACTIVATION,
        targetPos: new THREE.Vector3(0, -9.5, -225),
        lookAtPos: new THREE.Vector3(0, -8, -230),
        subtitle: '🤖 Placing the Meridian Key upon the central altar. Awakening sequence initiated!',
        duration: 4.0,
        action: (g) => {
          if (!g.cinematics.isPlayingCinematic) {
            g.cinematics.playMeridianActivationSequence(() => {
              g.quest.advanceStage(QuestStage.CHAPTER_COMPLETE, 'THE MERIDIAN HAS AWOKEN!');
            });
          }
        },
      },
    ];
  }

  public start() {
    this.isActive = true;
    this.isPaused = false;
    this.currentWaypointIndex = 0;
    this.waypointProgress = 0;
    this.startPos.copy(this.game.player.position);
    this.game.cameraRig.getLookAt(this.startLookAt);
    
    // Execute first waypoint action if present
    const currentWp = this.waypoints[0];
    if (currentWp) {
      this.currentSubtitle = currentWp.subtitle;
      this.game.quest.showSubtitle(currentWp.subtitle, 8.0);
      if (currentWp.action) currentWp.action(this.game);
    }
  }

  public stop() {
    this.isActive = false;
    this.isPaused = false;
    this.currentSubtitle = '';
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  public setSpeed(speed: number) {
    this.speedMultiplier = speed;
  }

  public nextWaypoint() {
    if (this.currentWaypointIndex < this.waypoints.length - 1) {
      this.currentWaypointIndex++;
      this.waypointProgress = 0;
      this.startPos.copy(this.game.player.position);
      this.game.cameraRig.getLookAt(this.startLookAt);

      const wp = this.waypoints[this.currentWaypointIndex];
      this.currentSubtitle = wp.subtitle;
      this.game.quest.showSubtitle(wp.subtitle, 8.0);
      if (wp.action) wp.action(this.game);
    }
  }

  public update(delta: number) {
    if (!this.isActive || this.isPaused) return;

    const currentWp = this.waypoints[this.currentWaypointIndex];
    if (!currentWp) {
      this.stop();
      return;
    }

    const effectiveDelta = delta * this.speedMultiplier;
    this.waypointProgress += effectiveDelta / currentWp.duration;

    if (this.waypointProgress >= 1.0) {
      this.waypointProgress = 1.0;
      if (this.currentWaypointIndex < this.waypoints.length - 1) {
        this.nextWaypoint();
        return;
      } else {
        // Reached final altar
        return;
      }
    }

    // Smooth cubic Hermite / EaseInOut interpolation for camera and player position
    const t = this.smoothStep(this.waypointProgress);

    this.tempPos.lerpVectors(this.startPos, currentWp.targetPos, t);
    this.game.player.position.copy(this.tempPos);

    this.tempLook.lerpVectors(this.startLookAt, currentWp.lookAtPos, t);

    // Calculate camera look direction vector from eye height (1.7m)
    const eyePos = new THREE.Vector3().copy(this.tempPos).add(new THREE.Vector3(0, 1.7, 0));
    const lookDir = new THREE.Vector3().subVectors(this.tempLook, eyePos).normalize();

    const yaw = Math.atan2(-lookDir.x, -lookDir.z);
    const pitch = Math.asin(THREE.MathUtils.clamp(lookDir.y, -0.99, 0.99));

    this.game.cameraRig.yaw = yaw;
    this.game.cameraRig.pitch = pitch;

    // Update CameraRig & Flashlight position so player eyes, headbobbing, footstep sounds & torch stay 100% active!
    this.game.cameraRig.update(effectiveDelta, this.game.player.position, true, false, true);

    // Position torch light & target
    if (this.game.player.torchLight && this.game.player.torchTarget) {
      this.game.player.torchLight.position.copy(this.game.cameraRig.camera.position);
      const torchForward = new THREE.Vector3();
      this.game.cameraRig.camera.getWorldDirection(torchForward);
      this.game.player.torchTarget.position.copy(this.game.cameraRig.camera.position).add(torchForward.multiplyScalar(10));
      this.game.player.torchTarget.updateMatrixWorld();
    }
  }

  private smoothStep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  public getCurrentWaypoint(): AutopilotWaypoint | undefined {
    return this.waypoints[this.currentWaypointIndex];
  }
}
