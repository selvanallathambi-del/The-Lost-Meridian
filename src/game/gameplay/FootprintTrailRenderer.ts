/**
 * The Lost Meridian - Footprint Trail Renderer
 * Renders temporary, fading physical impressions and footprints on the ground surface
 * whenever the player walks or runs through mud or soft soil areas.
 * Features:
 * - Boot tread sole & heel indentation geometry with authentic 1928 field boot lug profile
 * - Wet mud displacement displacement & specular gloss sheen on fresh indentations
 * - Smooth exponential age fading with soft dissipation into ground soil
 * - Surface detection: distinguishes mud, riverbank silt, soft soil/humus vs hard stone
 * - Exact terrain conforming using terrain.getHeightAt() and normal slope calculation
 * - Fully attached to PlayerController locomotion kinematics
 */

import * as THREE from 'three';
import { TerrainSystem } from '../world/TerrainSystem';

export interface FootstepPoint {
  position: THREE.Vector3;
  rotationY: number;
  normal: THREE.Vector3;
  foot: 'left' | 'right';
  maxLife: number;
  remainingLife: number;
  depth: number;
  scale: number;
  wetness: number;
  surface: 'mud' | 'soil';
}

export class FootprintTrailRenderer {
  public group: THREE.Group;
  private terrain: TerrainSystem;

  // Maximum concurrent footprints pooled
  private static readonly MAX_FOOTPRINTS = 120;
  private footprints: FootstepPoint[] = [];

  // InstancedMesh for high performance zero-GC footprint rendering
  private instancedMesh: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  
  // Custom PBR material for boot indentations in wet mud and soft soil
  private footprintMaterial: THREE.MeshStandardMaterial;

  // Per-instance color attribute for wetness & fading alpha
  private instanceColors: Float32Array;

  // Track player foot alternation and step distance accumulator
  private distanceTraveled = 0;
  private lastPosition = new THREE.Vector3();
  private nextFoot: 'left' | 'right' = 'left';
  private hasInitializedPos = false;

  constructor(terrain: TerrainSystem) {
    this.terrain = terrain;
    this.group = new THREE.Group();
    this.group.name = 'FootprintTrailRenderer';

    // 1. Create boot tread geometry
    // Authentic 1928 field boot profile: rounded heel and forward ball/toe with arch notch
    const bootShape = new THREE.Shape();
    // Start at back of heel (origin at center of foot)
    const heelW = 0.048;
    const heelL = 0.07;
    const archW = 0.038;
    const ballW = 0.058;
    const toeL = 0.12;

    bootShape.moveTo(-heelW * 0.7, -heelL);
    bootShape.quadraticCurveTo(-heelW, -heelL * 0.5, -heelW, -0.02);
    bootShape.quadraticCurveTo(-archW, 0.02, -ballW, 0.06);
    bootShape.quadraticCurveTo(-ballW, toeL * 0.8, -ballW * 0.5, toeL);
    bootShape.quadraticCurveTo(0, toeL * 1.05, ballW * 0.5, toeL);
    bootShape.quadraticCurveTo(ballW, toeL * 0.8, ballW, 0.06);
    bootShape.quadraticCurveTo(archW, 0.02, heelW, -0.02);
    bootShape.quadraticCurveTo(heelW, -heelL * 0.5, heelW * 0.7, -heelL);
    bootShape.quadraticCurveTo(0, -heelL * 1.05, -heelW * 0.7, -heelL);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.016,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.005,
      bevelThickness: 0.005,
    };
    const geom = new THREE.ExtrudeGeometry(bootShape, extrudeSettings);
    // Orient horizontally: Extrude was along +Z, rotate so boot footprint lies flat in XZ plane with +Y up
    geom.rotateX(Math.PI / 2);
    geom.rotateY(Math.PI); // Forward toe points along local -Z

    // 2. High-fidelity Wet Mud & Soft Soil Footprint Material
    this.footprintMaterial = new THREE.MeshStandardMaterial({
      color: 0x18100a, // Rich dark muddy peat
      roughness: 0.45,
      metalness: 0.08,
      transparent: true,
      opacity: 0.88,
      depthWrite: false, // Prevents z-fighting artifacts
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    // 3. Setup InstancedMesh
    this.instancedMesh = new THREE.InstancedMesh(
      geom,
      this.footprintMaterial,
      FootprintTrailRenderer.MAX_FOOTPRINTS
    );
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instancedMesh.castShadow = false;
    this.instancedMesh.receiveShadow = true;

    // Instance colors: used to blend from wet reflective mud to soil and fade out
    this.instanceColors = new Float32Array(FootprintTrailRenderer.MAX_FOOTPRINTS * 3);
    const instColorAttr = new THREE.InstancedBufferAttribute(this.instanceColors, 3);
    instColorAttr.setUsage(THREE.DynamicDrawUsage);
    this.instancedMesh.instanceColor = instColorAttr;

    // Initialize all instances off-screen
    for (let i = 0; i < FootprintTrailRenderer.MAX_FOOTPRINTS; i++) {
      this.dummy.position.set(0, -9999, 0);
      this.dummy.scale.set(0.001, 0.001, 0.001);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      this.instancedMesh.setColorAt(i, new THREE.Color(0, 0, 0));
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.group.add(this.instancedMesh);
  }

  /**
   * Checks whether the given world coordinate is in a mud or soft soil area,
   * returning surface metadata or null if on hard rock/water/indoor sanctuary.
   */
  public querySurfaceAt(x: number, z: number): { isMudOrSoil: boolean; type: 'mud' | 'soil'; wetness: number } | null {
    // 1. Water bodies (riverbed and plunge pool deep water) - no footprints under swimming water
    if (Math.abs(x) < 8.8 && z > -38 && z < 28) {
      const h = this.terrain.getHeightAt(x, z);
      if (h <= -2.1) return null; // Submerged river channel
    }
    if (Math.abs(x) < 12.0 && z <= -38 && z >= -60) {
      return null; // Plunge pool waterfall basin
    }

    // 2. Interior Temple Stone Floors & Deep Chasm Sanctuary (Hard dressed ashlar stone)
    if (z <= -95) {
      // Zone 6-9: Temple Steps (-95 to -130), Temple Sanctuary (-130 to -175), Meridian Abyss (-175 to -240)
      return null;
    }

    // 3. Great Waterfall Cliff (z between -30 and -60)
    if (z <= -30 && z > -60) {
      // Steep basalt bedrock cliff
      return null;
    }

    // 4. Riverbanks & Low Trail (Wet Mud Zone)
    // Z: 30 to -30, especially along river banks (abs(x) between 4 and 16)
    if (z <= 32 && z > -30) {
      const distFromRiverCenter = Math.abs(x);
      if (distFromRiverCenter <= 18) {
        // Wet mud riverbank
        const wetness = THREE.MathUtils.clamp(1.0 - (distFromRiverCenter - 4) / 14, 0.45, 1.0);
        return { isMudOrSoil: true, type: 'mud', wetness };
      }
      // Far flanks are soft damp jungle soil
      return { isMudOrSoil: true, type: 'soil', wetness: 0.35 };
    }

    // 5. Jungle Trail Ravine & Camp Trailhead (Z: 32 to 90)
    if (z > 32 && z <= 90) {
      // Expedition camp, muddy cart tracks and soft soil trail
      // Along main pathway (|x| < 12)
      if (Math.abs(x) < 16) {
        // High mud near camp stream / well, soft soil throughout jungle trail
        const isMudPuddle = Math.sin(x * 0.4 + z * 0.3) > 0.2 || (z > 55 && z < 75 && Math.abs(x) < 5);
        if (isMudPuddle) {
          return { isMudOrSoil: true, type: 'mud', wetness: 0.85 };
        }
        return { isMudOrSoil: true, type: 'soil', wetness: 0.4 };
      }
    }

    return null;
  }

  /**
   * Adds an individual footprint at the specified foot position and orientation
   */
  public addFootprint(
    footPos: THREE.Vector3,
    facingYaw: number,
    foot: 'left' | 'right',
    surfaceType: 'mud' | 'soil',
    wetness: number,
    isSprinting: boolean
  ) {
    // Exact terrain height query
    const groundY = this.terrain.getHeightAt(footPos.x, footPos.z);

    // Compute ground surface normal via finite difference for slope alignment
    const deltaEpsilon = 0.12;
    const hL = this.terrain.getHeightAt(footPos.x - deltaEpsilon, footPos.z);
    const hR = this.terrain.getHeightAt(footPos.x + deltaEpsilon, footPos.z);
    const hD = this.terrain.getHeightAt(footPos.x, footPos.z - deltaEpsilon);
    const hU = this.terrain.getHeightAt(footPos.x, footPos.z + deltaEpsilon);

    const normal = new THREE.Vector3(
      (hL - hR) / (2 * deltaEpsilon),
      1.0,
      (hD - hU) / (2 * deltaEpsilon)
    ).normalize();

    // Lift footprint microscopic fraction above ground to prevent z-fighting
    const plantY = groundY + 0.012;

    // Mud has deeper impression than dry soft soil
    const baseDepth = surfaceType === 'mud' ? 0.024 : 0.014;
    const sprintDepthMult = isSprinting ? 1.35 : 1.0;
    const depth = baseDepth * sprintDepthMult;

    // Lifetime: mud footprints last 18-24 seconds, soft soil lasts 14-18 seconds
    const maxLife = surfaceType === 'mud' ? (18.0 + Math.random() * 6.0) : (13.0 + Math.random() * 5.0);

    const newPrint: FootstepPoint = {
      position: new THREE.Vector3(footPos.x, plantY, footPos.z),
      rotationY: facingYaw + (foot === 'left' ? -0.03 : 0.03), // Subtle natural outward foot splay
      normal,
      foot,
      maxLife,
      remainingLife: maxLife,
      depth,
      scale: isSprinting ? 1.08 : 1.0,
      wetness,
      surface: surfaceType,
    };

    if (this.footprints.length >= FootprintTrailRenderer.MAX_FOOTPRINTS) {
      this.footprints.shift(); // Evict oldest
    }
    this.footprints.push(newPrint);
  }

  /**
   * Called per frame by PlayerController to update footprint lifecycles and spawn new footprints
   */
  public update(
    delta: number,
    playerPos: THREE.Vector3,
    playerYaw: number,
    isMoving: boolean,
    isGrounded: boolean,
    isSwimming: boolean,
    isSprinting: boolean
  ) {
    if (!this.hasInitializedPos) {
      this.lastPosition.copy(playerPos);
      this.hasInitializedPos = true;
      return;
    }

    // 1. Check movement step cadence
    if (isGrounded && !isSwimming && isMoving) {
      const dx = playerPos.x - this.lastPosition.x;
      const dz = playerPos.z - this.lastPosition.z;
      const stepDist = Math.hypot(dx, dz);

      this.distanceTraveled += stepDist;
      this.lastPosition.copy(playerPos);

      // Distance threshold per footstep (sprinting has longer stride than walking)
      const strideRequirement = isSprinting ? 1.6 : 1.15;

      if (this.distanceTraveled >= strideRequirement) {
        this.distanceTraveled = 0;

        // Query ground surface at player position
        const surfaceInfo = this.querySurfaceAt(playerPos.x, playerPos.z);

        if (surfaceInfo && surfaceInfo.isMudOrSoil) {
          // Calculate foot offset perpendicular to facing direction
          const footOffset = this.nextFoot === 'left' ? -0.16 : 0.16;
          // Perpendicular vector
          const perpX = Math.cos(playerYaw) * footOffset;
          const perpZ = -Math.sin(playerYaw) * footOffset;

          const footWorldPos = new THREE.Vector3(
            playerPos.x + perpX,
            playerPos.y,
            playerPos.z + perpZ
          );

          this.addFootprint(
            footWorldPos,
            playerYaw,
            this.nextFoot,
            surfaceInfo.type,
            surfaceInfo.wetness,
            isSprinting
          );

          // Alternate foot
          this.nextFoot = this.nextFoot === 'left' ? 'right' : 'left';
        }
      }
    } else {
      this.lastPosition.copy(playerPos);
    }

    // 2. Age and fade existing footprints
    for (let i = this.footprints.length - 1; i >= 0; i--) {
      const fp = this.footprints[i];
      fp.remainingLife -= delta;
      if (fp.remainingLife <= 0) {
        this.footprints.splice(i, 1);
      }
    }

    // 3. Update InstancedMesh matrices and fading color values
    const upVector = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion();
    const alignQuat = new THREE.Quaternion();
    const yawQuat = new THREE.Quaternion();
    const tempColor = new THREE.Color();

    for (let i = 0; i < FootprintTrailRenderer.MAX_FOOTPRINTS; i++) {
      if (i < this.footprints.length) {
        const fp = this.footprints[i];
        const lifeRatio = Math.max(0, fp.remainingLife / fp.maxLife); // 1.0 -> 0.0

        // Smooth cubic fade curve for natural dissipation into soil
        const fade = lifeRatio * lifeRatio * (3.0 - 2.0 * lifeRatio);

        // Align footprint geometry with terrain slope normal and player yaw
        alignQuat.setFromUnitVectors(upVector, fp.normal);
        yawQuat.setFromAxisAngle(fp.normal, fp.rotationY);
        quat.multiplyQuaternions(alignQuat, yawQuat);

        this.dummy.position.copy(fp.position);
        this.dummy.quaternion.copy(quat);

        // Scale footprint slightly down as mud settles and dissolves
        const scaleX = fp.scale * (0.85 + 0.15 * fade);
        const scaleY = fp.depth * fade;
        const scaleZ = fp.scale * (0.88 + 0.12 * fade);
        this.dummy.scale.set(scaleX, Math.max(0.002, scaleY), scaleZ);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

        // Color blending: Wet mud starts dark brown-black (0.08, 0.05, 0.03),
        // gradually drying and fading to surrounding soil (0.24, 0.18, 0.12)
        if (fp.surface === 'mud') {
          const r = 0.09 + (1.0 - fade) * 0.15;
          const g = 0.06 + (1.0 - fade) * 0.11;
          const b = 0.04 + (1.0 - fade) * 0.07;
          tempColor.setRGB(r * fade, g * fade, b * fade);
        } else {
          // Soft soil humus
          const r = 0.18 + (1.0 - fade) * 0.12;
          const g = 0.13 + (1.0 - fade) * 0.09;
          const b = 0.08 + (1.0 - fade) * 0.05;
          tempColor.setRGB(r * fade, g * fade, b * fade);
        }
        this.instancedMesh.setColorAt(i, tempColor);
      } else {
        // Pool slot unused: position far underground
        this.dummy.position.set(0, -9999, 0);
        this.dummy.scale.set(0.0001, 0.0001, 0.0001);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        tempColor.setRGB(0, 0, 0);
        this.instancedMesh.setColorAt(i, tempColor);
      }
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Resets all active footprints
   */
  public clear() {
    this.footprints = [];
    for (let i = 0; i < FootprintTrailRenderer.MAX_FOOTPRINTS; i++) {
      this.dummy.position.set(0, -9999, 0);
      this.dummy.scale.set(0.001, 0.001, 0.001);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
