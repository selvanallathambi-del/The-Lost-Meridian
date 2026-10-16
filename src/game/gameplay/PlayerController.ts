/**
 * The Lost Meridian - Player Controller & Physics-Lite
 * First-person kinematic character controller with terrain raycasting, slopes, stamina, and torch.
 */

import * as THREE from 'three';
import { CameraRig } from '../engine/CameraRig';
import { InputController } from '../engine/InputController';
import { TerrainSystem } from '../world/TerrainSystem';
import { EnvironmentBuilder } from '../world/EnvironmentBuilder';
import { PlayerArmsModel } from './PlayerArmsModel';
import { CharacterModel } from './CharacterModel';
import { FootprintTrailRenderer } from './FootprintTrailRenderer';
import { audioEngine } from '../audio/AudioEngine';
import { InteractionTarget } from '../types';

// Pre-allocated static scratchpads for 100% zero-allocation (Zero-GC) per frame
const _scratchMoveDir = new THREE.Vector3();
const _scratchForward = new THREE.Vector3();
const _scratchRight = new THREE.Vector3();
const _scratchNextPos = new THREE.Vector3();
const _scratchTorchOffset = new THREE.Vector3(0.15, -0.15, 0);
const _scratchTargetPos = new THREE.Vector3();
const _scratchToTarget = new THREE.Vector3();
const _scratchBoxMin = new THREE.Vector3();
const _scratchBoxMax = new THREE.Vector3();
const _scratchTestBox = new THREE.Box3();

export class PlayerController {
  public position = new THREE.Vector3(0, 1.2, 32); // Riverside overlook overlooking the river water shader and temple
  public velocity = new THREE.Vector3();
  public facingYaw = 0; // Facing north down the expedition trail towards the ancient temple

  // Kinematic parameters
  private walkSpeed = 4.2;
  private sprintSpeed = 7.5;
  private crouchSpeed = 2.2;
  private jumpForce = 5.2;
  private gravity = 18.0;

  // Ground detection
  public isGrounded = true;
  public isSprinting = false;
  public isCrouching = false;
  public isSwimming = false;
  public isDiving = false;
  public stamina = 100;
  public maxStamina = 100;

  // Torch / Flashlight
  public isTorchOn = false;
  public torchLight: THREE.SpotLight;
  public torchTarget: THREE.Object3D;

  // Visual Models
  public arms: PlayerArmsModel;
  public character: CharacterModel;

  // Temporary fading footprint trail renderer attached to movement controller
  public trailRenderer: FootprintTrailRenderer;

  // Footstep audio timing
  private footstepTimer = 0;

  // Kinematic Stuck & Wedging Safeguard
  private stuckTimer = 0;
  private lastStuckCheckPos = new THREE.Vector3();

  // Current interactable in crosshairs
  public currentFocusTarget: InteractionTarget | null = null;

  constructor(private cameraRig: CameraRig, private terrain: TerrainSystem, private environment: EnvironmentBuilder) {
    // Setup archaeological torch / flashlight
    this.torchLight = new THREE.SpotLight(0xfff4d6, 0, 30, Math.PI / 6, 0.4, 1.5);
    this.torchLight.castShadow = false;

    this.torchTarget = new THREE.Object3D();
    this.torchLight.target = this.torchTarget;

    // First person hands & held gear
    this.arms = new PlayerArmsModel(this.cameraRig);

    // Third person animated character
    this.character = new CharacterModel();

    // Trail renderer attached to player movement controller for mud and soft soil
    this.trailRenderer = new FootprintTrailRenderer(this.terrain);
  }

  public toggleTorch() {
    this.isTorchOn = !this.isTorchOn;
    this.torchLight.intensity = this.isTorchOn ? 4.0 : 0.0;
    this.torchLight.castShadow = this.isTorchOn;
    this.arms.triggerInspectAnimation();
    audioEngine.playTorchToggle(this.isTorchOn);
  }

  public update(rawDelta: number, input: InputController): { focusedTarget: InteractionTarget | null } {
    // 0. NaN Sanitizer Safeguard (Protects from numerical overflow or crazy delta)
    if (isNaN(this.position.x) || isNaN(this.position.y) || isNaN(this.position.z)) {
      this.position.set(0, 1.2, 32);
      this.velocity.set(0, 0, 0);
    }
    if (isNaN(this.velocity.x) || isNaN(this.velocity.y) || isNaN(this.velocity.z)) {
      this.velocity.set(0, 0, 0);
    }

    // Clamp maximum delta to prevent teleporting through walls or terrain during lag spikes
    const delta = Math.min(rawDelta, 0.05);

    // 1. Process look input
    const mouseDelta = input.consumeMouseDelta();
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      this.cameraRig.addLookDelta(mouseDelta.x, mouseDelta.y);
    }

    // 2. Process Torch toggle
    if (input.consumeTorch()) {
      this.toggleTorch();
    }

    // 3. Sprint and Stamina
    this.isCrouching = input.isCrouching;
    const wantsSprint = input.isSprinting && !this.isCrouching && (input.moveForward || input.moveLeft || input.moveRight || Math.abs(input.virtualMoveX) > 0.3 || Math.abs(input.virtualMoveY) > 0.3);

    if (wantsSprint && this.stamina > 5) {
      this.isSprinting = true;
      this.stamina = Math.max(0, this.stamina - delta * 22);
    } else {
      this.isSprinting = false;
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 15);
    }

    // 4. Movement vector from Camera orientation (Zero-GC scratchpad)
    _scratchMoveDir.set(0, 0, 0);
    _scratchForward.copy(this.cameraRig.forward).setY(0).normalize();
    _scratchRight.copy(this.cameraRig.right).setY(0).normalize();

    const hasVirtual = Math.abs(input.virtualMoveX) > 0.05 || Math.abs(input.virtualMoveY) > 0.05;
    if (hasVirtual) {
      _scratchMoveDir.addScaledVector(_scratchForward, input.virtualMoveY);
      _scratchMoveDir.addScaledVector(_scratchRight, input.virtualMoveX);
    }
    if (input.moveForward) _scratchMoveDir.add(_scratchForward);
    if (input.moveBackward) _scratchMoveDir.sub(_scratchForward);
    if (input.moveRight) _scratchMoveDir.add(_scratchRight);
    if (input.moveLeft) _scratchMoveDir.sub(_scratchRight);

    const isMoving = _scratchMoveDir.lengthSq() > 0.001;
    if (isMoving) {
      _scratchMoveDir.normalize();
    }

    const speed = this.isCrouching ? this.crouchSpeed : (this.isSprinting ? this.sprintSpeed : this.walkSpeed);

    // Apply horizontal velocity with smoothing
    const targetVelX = _scratchMoveDir.x * speed;
    const targetVelZ = _scratchMoveDir.z * speed;
    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1, delta * 14);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1, delta * 14);

    // 5. Jump, Swimming & Shoreline Egress
    const curPx = this.position.x;
    const curPz = this.position.z;
    const curGroundY = this.terrain.getHeightAt(curPx, curPz);
    const inRiver = Math.abs(curPx) < 8.8 && curPz > -38 && curPz < 28 && this.position.y <= -1.8;
    const inPlungePool = Math.abs(curPx) < 12.0 && curPz <= -38 && curPz >= -60 && this.position.y <= -3.6;
    const waterSurfaceY = inPlungePool ? -4.5 : -2.35;

    // Seamless Shoreline Egress: If the player walks onto dry terrain above water, immediately allow walking
    const isAtShoreline = curGroundY >= waterSurfaceY - 0.25;
    this.isSwimming = (inRiver || inPlungePool) && !isAtShoreline;

    if (this.isSwimming) {
      const wantsDive = input.isCrouching || this.cameraRig.pitch > 0.45;
      const wantsSurface = input.jumpRequested;

      this.isDiving = wantsDive && this.position.y < waterSurfaceY;

      if (wantsSurface) {
        this.velocity.y = 3.2; // Ascend towards surface
      } else if (wantsDive) {
        this.velocity.y = -2.6; // Submerge / dive downwards
      } else {
        // Natural water buoyancy floating player with head above surface
        const targetFloatY = waterSurfaceY - 0.35;
        this.velocity.y += (targetFloatY - this.position.y) * 8.0 * delta;
        this.velocity.y *= Math.max(0, 1.0 - delta * 4.0); // Aquatic drag
      }
      this.isGrounded = false;
    } else {
      this.isDiving = false;
      if (input.consumeJump() && this.isGrounded && !this.isCrouching) {
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
      }
      this.velocity.y -= this.gravity * delta;
    }

    // 6. Proposed new position
    _scratchNextPos.copy(this.position).addScaledVector(this.velocity, delta);

    // 7. Terrain Topography & Steep Cliff Slope Collision (Prevents running up vertical cliffs)
    const maxStepHeight = 0.52; // Maximum step height for stairs, roots, and stone slabs (meters)
    const maxClimbableSlope = 1.45; // ~55 degrees slope limit

    let blockedX = false;
    let blockedZ = false;

    // World Boundary Clamping
    if (_scratchNextPos.x < -64 || _scratchNextPos.x > 64) blockedX = true;
    if (_scratchNextPos.z < -244 || _scratchNextPos.z > 94) blockedZ = true;

    if (!this.isSwimming) {
      // Test X-axis terrain height change
      const targetGroundX = this.terrain.getHeightAt(_scratchNextPos.x, this.position.z);
      const diffX = targetGroundX - curGroundY;
      const distX = Math.abs(_scratchNextPos.x - this.position.x);
      if (distX > 0.001) {
        const slopeX = diffX / distX;
        if (diffX > maxStepHeight && slopeX > maxClimbableSlope) {
          blockedX = true;
          this.velocity.x = 0;
        } else if (slopeX > 0.15 && slopeX <= maxClimbableSlope) {
          // Uphill terrain resistance on X
          const slopeResistance = Math.max(0.4, 1.0 - slopeX * 0.35);
          this.velocity.x *= slopeResistance;
        }
      }

      // Test Z-axis terrain height change
      const targetGroundZ = this.terrain.getHeightAt(this.position.x, _scratchNextPos.z);
      const diffZ = targetGroundZ - curGroundY;
      const distZ = Math.abs(_scratchNextPos.z - this.position.z);
      if (distZ > 0.001) {
        const slopeZ = diffZ / distZ;
        if (diffZ > maxStepHeight && slopeZ > maxClimbableSlope) {
          blockedZ = true;
          this.velocity.z = 0;
        } else if (slopeZ > 0.15 && slopeZ <= maxClimbableSlope) {
          // Uphill terrain resistance on Z
          const slopeResistance = Math.max(0.4, 1.0 - slopeZ * 0.35);
          this.velocity.z *= slopeResistance;
        }
      }

      // Combined diagonal terrain check
      if (!blockedX && !blockedZ) {
        const targetGroundFull = this.terrain.getHeightAt(_scratchNextPos.x, _scratchNextPos.z);
        const diffFull = targetGroundFull - curGroundY;
        const distFull = Math.hypot(_scratchNextPos.x - this.position.x, _scratchNextPos.z - this.position.z);
        if (distFull > 0.001) {
          const slopeFull = diffFull / distFull;
          if (diffFull > maxStepHeight && slopeFull > maxClimbableSlope) {
            // Slope physics: Block direct climb and smoothly deflect movement down the slope contour
            const normal = this.terrain.getNormalAt(this.position.x, this.position.z);
            if (normal.y < 0.85) {
              // Redirect velocity along downhill contour tangent
              const slideForce = (1.0 - normal.y) * 2.8;
              this.velocity.x += normal.x * slideForce;
              this.velocity.z += normal.z * slideForce;
            }
            if (Math.abs(diffX) > Math.abs(diffZ)) {
              blockedX = true;
              this.velocity.x = 0;
            } else {
              blockedZ = true;
              this.velocity.z = 0;
            }
          }
        }
      }
    }

    // 8. Check solid obstacles & environment collisions with step-height tolerance (Zero-GC)
    const playerRadius = 0.28;
    const playerHeight = 1.85;

    for (const box of this.environment.collisionBoxes) {
      // Spatial bounding box distance reject
      if (curPx < box.min.x - 3.0 || curPx > box.max.x + 3.0 || curPz < box.min.z - 3.0 || curPz > box.max.z + 3.0) {
        continue;
      }

      // Vertical span check (obstacle must overlap player's vertical body above step height)
      const playerFeet = this.position.y;
      const playerHead = this.position.y + playerHeight;
      if (box.max.y <= playerFeet + maxStepHeight || box.min.y >= playerHead) {
        continue; // Below feet or above head
      }

      // Test X movement
      if (!blockedX) {
        _scratchBoxMin.set(_scratchNextPos.x - playerRadius, playerFeet + maxStepHeight, this.position.z - playerRadius);
        _scratchBoxMax.set(_scratchNextPos.x + playerRadius, playerHead, this.position.z + playerRadius);
        _scratchTestBox.set(_scratchBoxMin, _scratchBoxMax);
        if (box.intersectsBox(_scratchTestBox)) {
          blockedX = true;
          this.velocity.x = 0;
        }
      }

      // Test Z movement
      if (!blockedZ) {
        _scratchBoxMin.set(this.position.x - playerRadius, playerFeet + maxStepHeight, _scratchNextPos.z - playerRadius);
        _scratchBoxMax.set(this.position.x + playerRadius, playerHead, _scratchNextPos.z + playerRadius);
        _scratchTestBox.set(_scratchBoxMin, _scratchBoxMax);
        if (box.intersectsBox(_scratchTestBox)) {
          blockedZ = true;
          this.velocity.z = 0;
        }
      }

      // Test combined diagonal corner penetration
      if (!blockedX && !blockedZ) {
        _scratchBoxMin.set(_scratchNextPos.x - playerRadius, playerFeet + maxStepHeight, _scratchNextPos.z - playerRadius);
        _scratchBoxMax.set(_scratchNextPos.x + playerRadius, playerHead, _scratchNextPos.z + playerRadius);
        _scratchTestBox.set(_scratchBoxMin, _scratchBoxMax);
        if (box.intersectsBox(_scratchTestBox)) {
          blockedX = true;
          blockedZ = true;
          this.velocity.x = 0;
          this.velocity.z = 0;
        }
      }

      if (blockedX && blockedZ) break;
    }

    if (!blockedX) this.position.x = _scratchNextPos.x;
    if (!blockedZ) this.position.z = _scratchNextPos.z;

    // 9. Ground detection from Terrain with slope stickiness to eliminate downhill stutter
    const groundHeight = this.terrain.getHeightAt(this.position.x, this.position.z);
    const wasGrounded = this.isGrounded;
    const canSnapDown = !this.isSwimming && wasGrounded && this.velocity.y <= 0 && (this.position.y - groundHeight) < 0.6;

    if (!this.isSwimming && (_scratchNextPos.y <= groundHeight || canSnapDown)) {
      if (!wasGrounded && this.velocity.y < -6.0) {
        // Landing impact only on significant falls
        this.cameraRig.triggerLandingDip(0.22);
        this.cameraRig.addTrauma(0.22);
        this.playFootstepSound(this.position.z);
      }
      this.position.y = groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else if (this.isSwimming) {
      if (_scratchNextPos.y <= groundHeight) {
        this.position.y = groundHeight;
        this.velocity.y = Math.max(0, this.velocity.y);
      } else {
        this.position.y = _scratchNextPos.y;
      }
      this.isGrounded = false;
    } else {
      this.position.y = _scratchNextPos.y;
      this.isGrounded = false;
    }

    // Abyss Void Fall Recovery Safeguard
    if (this.position.y < -36.0) {
      if (this.position.z < -200) {
        this.position.set(0, -24.0, -230); // Meridian Sanctuary Arena Floor
      } else if (this.position.z < -130) {
        this.position.set(0, -6.0, -150); // Temple Interior Floor
      } else if (this.position.z < -60) {
        this.position.set(0, -14.0, -85); // Grotto Basin
      } else {
        this.position.set(0, 1.2, 32); // Riverside Overlook
      }
      const safeFloor = this.terrain.getHeightAt(this.position.x, this.position.z);
      this.position.y = Math.max(this.position.y, safeFloor + 0.35);
      this.velocity.set(0, 0, 0);
      this.isGrounded = true;
      audioEngine.playSfx('splash');
    }

    // Kinematic Stuck & Wedging Detection: Auto-unstick if player is pressing movement keys but stuck in a geometry seam
    if (isMoving && !this.isSwimming) {
      const movedDist = this.position.distanceTo(this.lastStuckCheckPos);
      if (movedDist < 0.03) {
        this.stuckTimer += delta;
        if (this.stuckTimer > 1.2) {
          // Wedged in geometry seam: apply gentle normal impulse and vertical lift
          const n = this.terrain.getNormalAt(this.position.x, this.position.z);
          this.position.x += (n.x !== 0 ? n.x : 0.5) * 0.4;
          this.position.z += (n.z !== 0 ? n.z : 0.5) * 0.4;
          this.position.y += 0.4;
          this.velocity.set(n.x * 1.5, 2.2, n.z * 1.5);
          this.stuckTimer = 0;
          this.lastStuckCheckPos.copy(this.position);
        }
      } else {
        this.stuckTimer = 0;
        this.lastStuckCheckPos.copy(this.position);
      }
    } else {
      this.stuckTimer = 0;
      this.lastStuckCheckPos.copy(this.position);
    }

    // 10. Footsteps cadence & sprint slope drain
    if (this.isGrounded && isMoving) {
      if (this.isSprinting) {
        // Sprinting uphill consumes slightly more stamina
        const currentSlope = (groundHeight - curGroundY);
        if (currentSlope > 0.05) {
          this.stamina = Math.max(0, this.stamina - delta * 12 * (1 + currentSlope * 4));
        }
      }
      const stepInterval = this.isSprinting ? 0.32 : (this.isCrouching ? 0.65 : 0.48);
      this.footstepTimer += delta;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        this.playFootstepSound(this.position.z);
      }
    }

    // 11. Update Camera Rig, Arms Model & Third-Person Character
    const groundAtCam = this.terrain.getHeightAt(this.cameraRig.camera.position.x, this.cameraRig.camera.position.z);
    this.cameraRig.update(delta, this.position, isMoving, this.isSprinting, this.isCrouching, groundAtCam);

    const isFirstPerson = this.cameraRig.viewMode === 'firstPerson';
    this.arms.group.visible = isFirstPerson;
    this.character.setVisible(!isFirstPerson);

    if (isMoving && _scratchMoveDir.lengthSq() > 0.01) {
      const targetYaw = Math.atan2(_scratchMoveDir.x, _scratchMoveDir.z) + Math.PI;
      this.facingYaw = THREE.MathUtils.lerp(this.facingYaw, targetYaw, delta * 14.0);
    }

    const horizSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    this.character.group.position.copy(this.position);
    this.character.group.scale.set(1.0, 1.0, 1.0);
    this.character.update(delta, horizSpeed, isMoving, this.facingYaw, false, this.cameraRig.yaw, this.cameraRig.pitch, this.isTorchOn);

    if (isFirstPerson) {
      this.arms.update(delta, isMoving, this.isSprinting, this.position);
    }

    // 12. Update Torch Light position and dynamic handheld flame flicker (UE5 Style)
    if (this.isTorchOn) {
      const time = performance.now() * 0.003;
      const flicker = Math.sin(time * 11.0) * 0.25 + Math.cos(time * 23.0) * 0.15;
      this.torchLight.intensity = 5.8 + flicker;
      
      const jitterX = Math.sin(time * 17.0) * 0.02;
      const jitterY = Math.cos(time * 19.0) * 0.02;
      this.torchLight.position.copy(this.cameraRig.camera.position).add(_scratchTorchOffset).add(new THREE.Vector3(jitterX, jitterY, 0));
    } else {
      this.torchLight.position.copy(this.cameraRig.camera.position).add(_scratchTorchOffset);
    }
    this.torchTarget.position.copy(this.cameraRig.camera.position).addScaledVector(this.cameraRig.forward, 5);
    this.torchLight.target.updateMatrixWorld();

    // 13. Update Temporary Fading Footprint Trail Renderer
    this.trailRenderer.update(
      delta,
      this.position,
      this.facingYaw,
      isMoving,
      this.isGrounded,
      this.isSwimming,
      this.isSprinting
    );

    // 14. Interaction Raycast with Line-of-Sight verification
    this.checkInteractionFocus();

    return { focusedTarget: this.currentFocusTarget };
  }

  private playFootstepSound(z: number) {
    let surface: 'grass' | 'mud' | 'stone' | 'water' | 'sand' | 'gravel' = 'grass';
    const y = this.position.y;
    const x = Math.abs(this.position.x);

    if (this.isSwimming || y <= 0.15) {
      surface = 'water';
    } else if (z <= -55) {
      // Temple platform, ancient paved marble/granite terrace
      surface = 'stone';
    } else if (y < 1.85 && z > -22 && z < 42) {
      // Saturated soft riverbank loam and mud
      surface = 'mud';
    } else if (y < 2.6 && x > 14) {
      // Sandy coastal spit and river silt flats
      surface = 'sand';
    } else if (z < -35 && z > -55 && x > 8) {
      // Rocky canyon switchback & scree gravel
      surface = 'gravel';
    } else {
      surface = 'grass';
    }
    audioEngine.playFootstep(surface, this.isSprinting, this.isCrouching);
  }

  /**
   * Raycast from center of screen to find interactable targets with line-of-sight verification (Zero-GC, Ultra-Fast)
   */
  private checkInteractionFocus() {
    let bestTarget: InteractionTarget | null = null;
    let bestScore = -1;

    const playerEye = this.cameraRig.camera.position;
    const forward = this.cameraRig.forward;

    // Phase 1: Fast Cone & Reach Filter
    for (const item of this.environment.interactables) {
      if (!item.visible) continue;
      const target = item.interactionData;
      _scratchTargetPos.set(target.position[0], target.position[1], target.position[2]);
      const dist = playerEye.distanceTo(_scratchTargetPos);

      const maxReach = (target.distance || 3.5) + 1.2;
      if (dist <= maxReach) {
        _scratchToTarget.copy(_scratchTargetPos).sub(playerEye).normalize();
        const dot = forward.dot(_scratchToTarget);

        if (dot > 0.65) {
          const score = dot / Math.max(1.0, dist * 0.5);
          if (score > bestScore) {
            bestScore = score;
            bestTarget = target;
          }
        }
      }
    }

    // Phase 2: Single Line-of-Sight verification for the top candidate only
    if (bestTarget) {
      _scratchTargetPos.set(bestTarget.position[0], bestTarget.position[1], bestTarget.position[2]);
      let isObscured = false;

      for (const box of this.environment.collisionBoxes) {
        // Fast spatial reject for boxes far from ray
        if (playerEye.x < box.min.x - 6.0 || playerEye.x > box.max.x + 6.0 ||
            playerEye.z < box.min.z - 6.0 || playerEye.z > box.max.z + 6.0) {
          continue;
        }

        const boxCenterX = (box.min.x + box.max.x) * 0.5;
        const boxCenterZ = (box.min.z + box.max.z) * 0.5;
        const minX = Math.min(playerEye.x, _scratchTargetPos.x) - 0.2;
        const maxX = Math.max(playerEye.x, _scratchTargetPos.x) + 0.2;
        const minZ = Math.min(playerEye.z, _scratchTargetPos.z) - 0.2;
        const maxZ = Math.max(playerEye.z, _scratchTargetPos.z) + 0.2;

        if (boxCenterX > minX && boxCenterX < maxX && boxCenterZ > minZ && boxCenterZ < maxZ) {
          const boxHeight = box.max.y - box.min.y;
          if (boxHeight > 1.2 && box.max.y > playerEye.y - 0.5) {
            isObscured = true;
            break;
          }
        }
      }

      if (isObscured) {
        bestTarget = null;
      }
    }

    this.currentFocusTarget = bestTarget;
  }

  /**
   * Emergency fail-safe unstick command
   * Instantly lifts player to safe grounded height, clears trapped velocities, and resets kinematic flags.
   */
  public rescueUnstick(safePosition?: THREE.Vector3) {
    if (safePosition) {
      this.position.copy(safePosition);
    }
    const groundY = this.terrain.getHeightAt(this.position.x, this.position.z);
    this.position.y = Math.max(this.position.y, groundY + 0.5);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
    this.isSwimming = false;
    this.isDiving = false;
    this.stuckTimer = 0;
    this.lastStuckCheckPos.copy(this.position);
    this.cameraRig.targetPitch = 0;
  }
}
