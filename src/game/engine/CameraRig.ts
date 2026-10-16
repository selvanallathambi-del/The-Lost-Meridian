/**
 * The Lost Meridian - Camera Rig & First Person Controller
 * Features smooth yaw/pitch clamping, head-bobbing, sprint FOV zoom, landing dip, and cinematic takeover.
 */

import * as THREE from 'three';

export type CameraViewMode = 'follow' | 'explore' | 'firstPerson';

export interface CameraState {
  isCinematic: boolean;
  fov: number;
  bobIntensity: number;
  pitch: number;
  yaw: number;
  viewMode: CameraViewMode;
}

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  public position: THREE.Vector3 = new THREE.Vector3(0, 2.8, 32); // Player eye position overlooking river
  public forward: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
  public right: THREE.Vector3 = new THREE.Vector3(1, 0, 0);

  // View Mode
  public viewMode: CameraViewMode = 'firstPerson';

  // Rotation angles (radians)
  public yaw = 0; // Facing north towards camp and temple
  public pitch = -0.05;
  public targetYaw = 0;
  public targetPitch = -0.05;

  // Orbit Distance for Third Person Follow & Explore
  public followDistance = 4.6;
  public exploreDistance = 14.0;
  public currentDistance = 4.6;

  // Head Bobbing & Kinetics
  private bobTimer = 0;
  private bobOffset = new THREE.Vector3();
  private landingDip = 0;
  private currentFOV = 70;
  private targetFOV = 70;

  // Visceral Camera Shake & Seismic Trauma System
  public trauma = 0; // 0 to 1
  private shakeTimer = 0;
  private shakeOffset = new THREE.Vector3();
  private shakeRot = new THREE.Vector2();

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  // Cinematic Interpolation
  public isCinematicActive = false;
  private cinematicStartPos = new THREE.Vector3();
  private cinematicTargetPos = new THREE.Vector3();
  private cinematicStartLook = new THREE.Vector3();
  private cinematicTargetLook = new THREE.Vector3();
  private cinematicProgress = 1.0;
  private cinematicDuration = 1.0;
  private cinematicOnComplete: (() => void) | null = null;

  private _scratchBasePos = new THREE.Vector3();
  private _scratchCamPos = new THREE.Vector3();

  constructor(fov = 70, aspect = window.innerWidth / window.innerHeight) {
    this.currentFOV = fov;
    this.targetFOV = fov;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.25, 450);
    this.camera.rotation.order = 'YXZ';
    this.updateVectors();
  }

  public cycleViewMode(): CameraViewMode {
    const modes: CameraViewMode[] = ['follow', 'explore', 'firstPerson'];
    const idx = modes.indexOf(this.viewMode);
    this.viewMode = modes[(idx + 1) % modes.length];
    return this.viewMode;
  }

  public setViewMode(mode: CameraViewMode) {
    this.viewMode = mode;
  }

  public setAspectRatio(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  public setBaseFOV(fov: number) {
    this.targetFOV = fov;
  }

  public getLookAt(target: THREE.Vector3): THREE.Vector3 {
    this.camera.getWorldDirection(target);
    target.add(this.camera.position);
    return target;
  }

  public addLookDelta(deltaX: number, deltaY: number, sensitivity = 0.0022, invertY = false) {
    if (this.isCinematicActive) return;

    this.targetYaw -= deltaX * sensitivity;
    const ySign = invertY ? 1 : -1;
    this.targetPitch += deltaY * sensitivity * ySign;

    // Clamp pitch between -80 deg and +80 deg
    const maxPitch = (80 * Math.PI) / 180;
    this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));
  }

  public triggerLandingDip(intensity = 0.25) {
    this.landingDip = intensity;
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    isMoving: boolean,
    isSprinting: boolean,
    isCrouching: boolean,
    minGroundY = -999
  ) {
    if (this.isCinematicActive) {
      this.updateCinematic(delta);
      return;
    }

    // High-frequency exponential smoothing (38Hz) for buttery-smooth panning without mouse polling jitter
    this.yaw += (this.targetYaw - this.yaw) * Math.min(1.0, delta * 32.0);
    this.pitch += (this.targetPitch - this.pitch) * Math.min(1.0, delta * 32.0);
    this.updateVectors();

    // Smooth landing dip recovery
    if (this.landingDip > 0) {
      this.landingDip = Math.max(0, this.landingDip - delta * 1.8);
    }

    // Dynamic FOV
    const desiredFOV = isSprinting && isMoving ? this.targetFOV + 6 : this.targetFOV;
    this.currentFOV += (desiredFOV - this.currentFOV) * Math.min(1, delta * 6);
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();

    const targetEyeHeight = isCrouching ? 1.0 : 1.55;
    this._scratchBasePos.copy(playerPos);
    this._scratchBasePos.y += (targetEyeHeight - this.landingDip);

    // Visceral non-linear camera trauma shake (Quadratic falloff for crisp impact)
    if (this.trauma > 0.001) {
      this.trauma = Math.max(0, this.trauma - delta * 1.5);
      const shake = this.trauma * this.trauma;
      this.shakeTimer += delta * 32.0;

      const shakeX = (Math.sin(this.shakeTimer * 1.1) + Math.sin(this.shakeTimer * 2.3) * 0.5) * 0.09 * shake;
      const shakeY = (Math.cos(this.shakeTimer * 1.4) + Math.cos(this.shakeTimer * 2.9) * 0.5) * 0.09 * shake;
      const shakeYaw = (Math.sin(this.shakeTimer * 0.8) + Math.sin(this.shakeTimer * 1.9) * 0.5) * 0.05 * shake;
      const shakePitch = (Math.cos(this.shakeTimer * 1.2) + Math.cos(this.shakeTimer * 2.7) * 0.5) * 0.05 * shake;

      this.shakeOffset.set(shakeX, shakeY, 0);
      this.shakeRot.set(shakeYaw, shakePitch);
    } else {
      this.shakeOffset.set(0, 0, 0);
      this.shakeRot.set(0, 0);
    }

    if (this.viewMode === 'firstPerson') {
      // 1. First-Person Mode
      if (isMoving) {
        const bobFreq = isSprinting ? 12 : 7.5;
        const bobAmpY = isSprinting ? 0.07 : 0.035;
        const bobAmpX = isSprinting ? 0.035 : 0.018;

        this.bobTimer += delta * bobFreq;
        this.bobOffset.y = Math.sin(this.bobTimer) * bobAmpY;
        this.bobOffset.x = Math.cos(this.bobTimer * 0.5) * bobAmpX;
      } else {
        this.bobTimer += delta * 1.35;
        // Dual-harmonic organic respiration sway (chest expansion + subtle lateral weight shift)
        this.bobOffset.y = Math.sin(this.bobTimer) * 0.007 + Math.sin(this.bobTimer * 2.0) * 0.002;
        this.bobOffset.x = Math.cos(this.bobTimer * 0.5) * 0.004;
      }

      this.camera.rotation.y = this.yaw + this.shakeRot.x;
      this.camera.rotation.x = this.pitch + this.shakeRot.y;
      this.camera.position.copy(this._scratchBasePos).add(this.bobOffset).add(this.shakeOffset);
    } else if (this.viewMode === 'follow') {
      // 2. Third-Person Follow Mode (Stillwater default)
      const targetDist = this.followDistance;
      this.currentDistance += (targetDist - this.currentDistance) * Math.min(1.0, delta * 10.0);

      const offset = new THREE.Vector3(
        Math.sin(this.yaw) * Math.cos(this.pitch) * this.currentDistance,
        -Math.sin(this.pitch) * this.currentDistance + 0.6,
        Math.cos(this.yaw) * Math.cos(this.pitch) * this.currentDistance
      );

      this._scratchCamPos.copy(this._scratchBasePos).add(offset);
      if (minGroundY > -900) {
        this._scratchCamPos.y = Math.max(this._scratchCamPos.y, minGroundY + 0.45);
      }
      this.camera.position.lerp(this._scratchCamPos, Math.min(1.0, delta * 18.0));
      this.camera.lookAt(this._scratchBasePos.x, this._scratchBasePos.y + 0.3, this._scratchBasePos.z);
    } else if (this.viewMode === 'explore') {
      // 3. High-Angle Isometric Diorama Explore Mode
      const targetDist = this.exploreDistance;
      this.currentDistance += (targetDist - this.currentDistance) * Math.min(1.0, delta * 6.0);

      const offset = new THREE.Vector3(
        Math.sin(this.yaw) * this.currentDistance * 0.75,
        this.currentDistance * 0.85,
        Math.cos(this.yaw) * this.currentDistance * 0.75
      );

      this._scratchCamPos.copy(this._scratchBasePos).add(offset);
      if (minGroundY > -900) {
        this._scratchCamPos.y = Math.max(this._scratchCamPos.y, minGroundY + 0.85);
      }
      this.camera.position.lerp(this._scratchCamPos, Math.min(1.0, delta * 12.0));
      this.camera.lookAt(this._scratchBasePos.x, this._scratchBasePos.y, this._scratchBasePos.z);
    }

    this.updateVectors();
  }

  private updateVectors() {
    this.forward.set(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)).normalize();
    this.right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
  }

  /**
   * Start a cinematic camera sweep or cutscene
   */
  public playCinematic(
    fromPos: THREE.Vector3,
    toPos: THREE.Vector3,
    lookAtFrom: THREE.Vector3,
    lookAtTo: THREE.Vector3,
    durationSeconds: number,
    onComplete?: () => void
  ) {
    this.isCinematicActive = true;
    this.cinematicStartPos.copy(fromPos);
    this.cinematicTargetPos.copy(toPos);
    this.cinematicStartLook.copy(lookAtFrom);
    this.cinematicTargetLook.copy(lookAtTo);
    this.cinematicProgress = 0;
    this.cinematicDuration = durationSeconds;
    this.cinematicOnComplete = onComplete || null;
  }

  public endCinematic(resetYawPitchFromCurrent = true) {
    this.isCinematicActive = false;
    if (resetYawPitchFromCurrent) {
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this.yaw = Math.atan2(-dir.x, -dir.z);
      this.targetYaw = this.yaw;
      this.pitch = Math.asin(Math.max(-0.99, Math.min(0.99, dir.y)));
      this.targetPitch = this.pitch;
      this.updateVectors();
    }
  }

  private updateCinematic(delta: number) {
    this.cinematicProgress += delta / this.cinematicDuration;
    const t = Math.min(1.0, this.cinematicProgress);

    // Smooth cubic ease in/out
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    this.camera.position.lerpVectors(this.cinematicStartPos, this.cinematicTargetPos, ease);

    const currentLook = new THREE.Vector3().lerpVectors(
      this.cinematicStartLook,
      this.cinematicTargetLook,
      ease
    );
    this.camera.lookAt(currentLook);

    if (t >= 1.0) {
      if (this.cinematicOnComplete) {
        const cb = this.cinematicOnComplete;
        this.cinematicOnComplete = null;
        cb();
      }
    }
  }
}
