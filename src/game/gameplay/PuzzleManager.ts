/**
 * The Lost Meridian - Environmental Puzzle Systems
 * Manages Water Aqueduct Alignment and Solar Prism Reflection with physical animations & audio.
 * Features 3D Volumetric Radiant Light Beams for ancient solar refraction.
 */

import * as THREE from 'three';
import { EnvironmentBuilder } from '../world/EnvironmentBuilder';
import { WaterPuzzleState, LightPuzzleState } from '../types';
import { audioEngine } from '../audio/AudioEngine';

const _scratchBeamMid = new THREE.Vector3();

export class PuzzleManager {
  public waterPuzzle: WaterPuzzleState = {
    dial1: 0,
    dial2: 0,
    dial3: 0,
    isSolved: false,
    waterFlowRate: 0,
    gateOpenProgress: 0,
  };

  public lightPuzzle: LightPuzzleState = {
    prism1: 0,
    prism2: 0,
    prism3: 0,
    isSolved: false,
    beam1Hit: false,
    beam2Hit: false,
    beam3Hit: false,
    energyCharge: 0,
  };

  // Volumetric Radiant Light Beams
  public beamGroup = new THREE.Group();
  private beamMeshes: THREE.Mesh[] = [];

  constructor(private environment: EnvironmentBuilder) {
    this.initLightBeamVisuals();
  }

  private initLightBeamVisuals() {
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    for (let i = 0; i < 4; i++) {
      // Cylindrical light beam with 0.12m radius
      const geo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 8, 1, true);
      geo.rotateX(Math.PI / 2); // Orient along Z axis for lookAt alignment
      const mesh = new THREE.Mesh(geo, beamMat);
      mesh.visible = false;
      this.beamMeshes.push(mesh);
      this.beamGroup.add(mesh);
    }
  }

  /**
   * Interact with Water Puzzle Dial (rotates in 90 degree increments)
   */
  public rotateWaterDial(dialIndex: number): boolean {
    if (this.waterPuzzle.isSolved) return false;

    audioEngine.playStoneDialTurn();

    if (dialIndex === 1) {
      this.waterPuzzle.dial1 = (this.waterPuzzle.dial1 + 90) % 360;
      if (this.environment.waterDial1) {
        this.environment.waterDial1.rotation.y = (this.waterPuzzle.dial1 * Math.PI) / 180;
      }
    } else if (dialIndex === 2) {
      this.waterPuzzle.dial2 = (this.waterPuzzle.dial2 + 90) % 360;
      if (this.environment.waterDial2) {
        this.environment.waterDial2.rotation.y = (this.waterPuzzle.dial2 * Math.PI) / 180;
      }
    } else if (dialIndex === 3) {
      this.waterPuzzle.dial3 = (this.waterPuzzle.dial3 + 90) % 360;
      if (this.environment.waterDial3) {
        this.environment.waterDial3.rotation.y = (this.waterPuzzle.dial3 * Math.PI) / 180;
      }
    }

    // Correct alignment: Dial 1 = 90, Dial 2 = 180, Dial 3 = 270
    if (
      this.waterPuzzle.dial1 === 90 &&
      this.waterPuzzle.dial2 === 180 &&
      this.waterPuzzle.dial3 === 270
    ) {
      this.waterPuzzle.isSolved = true;
      audioEngine.playStoneGateOpening();
      return true;
    }
    return false;
  }

  /**
   * Interact with Solar Prism (rotates in 45 degree increments)
   */
  public rotatePrism(prismIndex: number): boolean {
    return this.rotateSolarPrism(prismIndex);
  }

  public rotateSolarPrism(prismIndex: number): boolean {
    if (this.lightPuzzle.isSolved) return false;

    audioEngine.playPrismAlign();

    if (prismIndex === 1) {
      this.lightPuzzle.prism1 = (this.lightPuzzle.prism1 + 45) % 360;
      if (this.environment.lightPrism1) {
        this.environment.lightPrism1.rotation.y = (this.lightPuzzle.prism1 * Math.PI) / 180;
      }
      this.lightPuzzle.beam1Hit = this.lightPuzzle.prism1 === 135;
    } else if (prismIndex === 2) {
      this.lightPuzzle.prism2 = (this.lightPuzzle.prism2 + 45) % 360;
      if (this.environment.lightPrism2) {
        this.environment.lightPrism2.rotation.y = (this.lightPuzzle.prism2 * Math.PI) / 180;
      }
      this.lightPuzzle.beam2Hit = this.lightPuzzle.beam1Hit && this.lightPuzzle.prism2 === 225;
    } else if (prismIndex === 3) {
      this.lightPuzzle.prism3 = (this.lightPuzzle.prism3 + 45) % 360;
      if (this.environment.lightPrism3) {
        this.environment.lightPrism3.rotation.y = (this.lightPuzzle.prism3 * Math.PI) / 180;
      }
      this.lightPuzzle.beam3Hit =
        this.lightPuzzle.beam1Hit &&
        this.lightPuzzle.beam2Hit &&
        this.lightPuzzle.prism3 === 315;
    }

    // Re-verify continuous chain
    this.lightPuzzle.beam1Hit = this.lightPuzzle.prism1 === 135;
    this.lightPuzzle.beam2Hit = this.lightPuzzle.beam1Hit && this.lightPuzzle.prism2 === 225;
    this.lightPuzzle.beam3Hit =
      this.lightPuzzle.beam1Hit &&
      this.lightPuzzle.beam2Hit &&
      this.lightPuzzle.prism3 === 315;

    if (this.lightPuzzle.beam3Hit) {
      this.lightPuzzle.isSolved = true;
      audioEngine.playStoneGateOpening();
      return true;
    }
    return false;
  }

  /**
   * Idempotent visual synchronization ensuring 3D meshes always reflect internal degree states
   */
  public syncVisualsWithState() {
    if (this.environment.waterDial1) this.environment.waterDial1.rotation.y = (this.waterPuzzle.dial1 * Math.PI) / 180;
    if (this.environment.waterDial2) this.environment.waterDial2.rotation.y = (this.waterPuzzle.dial2 * Math.PI) / 180;
    if (this.environment.waterDial3) this.environment.waterDial3.rotation.y = (this.waterPuzzle.dial3 * Math.PI) / 180;

    if (this.environment.lightPrism1) this.environment.lightPrism1.rotation.y = (this.lightPuzzle.prism1 * Math.PI) / 180;
    if (this.environment.lightPrism2) this.environment.lightPrism2.rotation.y = (this.lightPuzzle.prism2 * Math.PI) / 180;
    if (this.environment.lightPrism3) this.environment.lightPrism3.rotation.y = (this.lightPuzzle.prism3 * Math.PI) / 180;

    this.lightPuzzle.beam1Hit = this.lightPuzzle.prism1 === 135;
    this.lightPuzzle.beam2Hit = this.lightPuzzle.beam1Hit && this.lightPuzzle.prism2 === 225;
    this.lightPuzzle.beam3Hit = this.lightPuzzle.beam1Hit && this.lightPuzzle.beam2Hit && this.lightPuzzle.prism3 === 315;
  }

  /**
   * Auto-solve fail-safe helper for soft-lock rescue
   */
  public forceSolveAllPuzzles() {
    this.waterPuzzle.dial1 = 90;
    this.waterPuzzle.dial2 = 180;
    this.waterPuzzle.dial3 = 270;
    this.waterPuzzle.isSolved = true;
    this.waterPuzzle.gateOpenProgress = 1.0;

    this.lightPuzzle.prism1 = 135;
    this.lightPuzzle.prism2 = 225;
    this.lightPuzzle.prism3 = 315;
    this.lightPuzzle.isSolved = true;
    this.lightPuzzle.energyCharge = 1.0;
    this.lightPuzzle.beam1Hit = true;
    this.lightPuzzle.beam2Hit = true;
    this.lightPuzzle.beam3Hit = true;

    this.syncVisualsWithState();

    if (this.environment.sunkenGateMesh) this.environment.sunkenGateMesh.position.y = -16.0;
    if (this.environment.sunkenGateBox) {
      this.environment.sunkenGateBox.min.y = -999;
      this.environment.sunkenGateBox.max.y = -999;
    }
    if (this.environment.templeInnerGate) this.environment.templeInnerGate.position.y = -9.0;
    if (this.environment.innerGateBox) {
      this.environment.innerGateBox.min.y = -999;
      this.environment.innerGateBox.max.y = -999;
    }
  }

  public update(delta: number) {
    // 1. Water Puzzle Gate Lowering Animation with Progressive Collision Interpolation
    if (this.waterPuzzle.isSolved && this.waterPuzzle.gateOpenProgress < 1.0) {
      this.waterPuzzle.gateOpenProgress = Math.min(1.0, this.waterPuzzle.gateOpenProgress + delta * 0.35);
      const gateY = -11.0 - this.waterPuzzle.gateOpenProgress * 5.0;
      if (this.environment.sunkenGateMesh) {
        this.environment.sunkenGateMesh.position.y = gateY;
      }
      if (this.environment.sunkenGateBox) {
        if (this.waterPuzzle.gateOpenProgress >= 0.85) {
          this.environment.sunkenGateBox.min.y = -999;
          this.environment.sunkenGateBox.max.y = -999;
        } else {
          this.environment.sunkenGateBox.max.y = gateY + 3.0;
        }
      }
    }

    // 2. Solar Light Beam Paths
    const skySource = new THREE.Vector3(-5.0, 6.0, -138);
    const p1 = new THREE.Vector3(-5.0, -3.4, -138);
    const p2 = new THREE.Vector3(4.5, -3.4, -148);
    const p3 = new THREE.Vector3(-3.5, -3.4, -158);
    const solarCrest = new THREE.Vector3(0, -2.5, -168);

    // Segment 1: Sky to Prism 1
    this.setBeamSegment(0, skySource, p1, true);

    // Segment 2: Prism 1 to Prism 2
    this.setBeamSegment(1, p1, p2, this.lightPuzzle.beam1Hit);

    // Segment 3: Prism 2 to Prism 3
    this.setBeamSegment(2, p2, p3, this.lightPuzzle.beam2Hit);

    // Segment 4: Prism 3 to Solar Crest Target
    this.setBeamSegment(3, p3, solarCrest, this.lightPuzzle.beam3Hit);

    // 3. Inner Temple Gate Opening Animation with Progressive Collision Interpolation
    if (this.lightPuzzle.isSolved && this.lightPuzzle.energyCharge < 1.0) {
      this.lightPuzzle.energyCharge = Math.min(1.0, this.lightPuzzle.energyCharge + delta * 0.4);
      const innerGateY = -3.0 - this.lightPuzzle.energyCharge * 6.0;
      if (this.environment.templeInnerGate) {
        this.environment.templeInnerGate.position.y = innerGateY;
      }
      if (this.environment.innerGateBox) {
        if (this.lightPuzzle.energyCharge >= 0.85) {
          this.environment.innerGateBox.min.y = -999;
          this.environment.innerGateBox.max.y = -999;
        } else {
          this.environment.innerGateBox.max.y = innerGateY + 3.0;
        }
      }
    }
  }

  private setBeamSegment(index: number, from: THREE.Vector3, to: THREE.Vector3, isVisible: boolean) {
    const mesh = this.beamMeshes[index];
    if (!mesh) return;
    mesh.visible = isVisible;
    if (isVisible) {
      _scratchBeamMid.copy(from).add(to).multiplyScalar(0.5);
      const dist = from.distanceTo(to);
      mesh.position.copy(_scratchBeamMid);
      mesh.scale.set(1, 1, dist);
      mesh.lookAt(to);
    }
  }

  public dispose() {
    this.beamMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
  }
}
