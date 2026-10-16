/**
 * The Lost Meridian - First-Person Hands & Held Archaeological Equipment
 * Renders player arms, brass field compass with dynamic magnetic needle, and archaeological torch.
 */

import * as THREE from 'three';
import { CameraRig } from '../engine/CameraRig';
import { ProceduralTextureGenerator } from '../textures/ProceduralTextureGenerator';

export class PlayerArmsModel {
  public group = new THREE.Group();

  // Held equipment
  private torchMesh: THREE.Group;
  private compassGroup: THREE.Group;
  private needleMesh: THREE.Mesh;

  // Kinetic sway and inertial look lag parameters
  private swayOffset = new THREE.Vector3();
  private swayTimer = 0;
  private inspectProgress = 0;
  private isInspecting = false;
  private prevCameraYaw = Math.PI;
  private prevCameraPitch = 0;
  private lagYaw = 0;
  private lagPitch = 0;

  // Torch Ember Sparks Particle System
  private emberParticles: THREE.Points;
  private emberPositions: Float32Array;
  private emberVelocities: Float32Array;
  private emberCount = 20;

  // Scratch vector for compass targeting (Zero-GC)
  private _scratchMeridian = new THREE.Vector3();

  constructor(private cameraRig: CameraRig) {
    this.prevCameraYaw = cameraRig.yaw;
    this.prevCameraPitch = cameraRig.pitch;

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc89d3a,
      roughness: 0.28,
      metalness: 0.9,
      envMapIntensity: 1.6,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x222426,
      roughness: 0.45,
      metalness: 0.75,
      envMapIntensity: 1.4,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.75,
    });

    const fabricPBR = ProceduralTextureGenerator.generateFabricWeaveMaps(256);
    const leatherPBR = ProceduralTextureGenerator.generateLeatherGrainMaps(256);
    const skinPBR = ProceduralTextureGenerator.generateSkinPBRMaps(256);

    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x5a4b38, // Khaki expedition canvas
      normalMap: fabricPBR.normal,
      normalScale: new THREE.Vector2(1.8, 1.8),
      roughnessMap: fabricPBR.roughness,
      roughness: 0.84,
      metalness: 0.03,
      envMapIntensity: 0.85,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc48c6b, // Sun-weathered skin with micro-pores
      normalMap: skinPBR.normal,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: skinPBR.roughness,
      roughness: 0.58,
      metalness: 0.04,
      envMapIntensity: 0.85,
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x28180e, // Dark bridle leather
      normalMap: leatherPBR.normal,
      normalScale: new THREE.Vector2(2.2, 2.2),
      roughnessMap: leatherPBR.roughness,
      roughness: 0.50,
      metalness: 0.14,
      envMapIntensity: 1.25,
    });

    // 1. Right Hand: Vintage Archaeological Heavy-Duty Brass Torch
    this.torchMesh = new THREE.Group();

    // Right forearm with khaki rolled expedition sleeve
    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.075, 0.42, 10), clothMat);
    rForearm.position.set(0.12, -0.16, 0.22);
    rForearm.rotation.set(-0.65, 0.35, -0.45);
    rForearm.castShadow = true;
    this.torchMesh.add(rForearm);

    // Rolled sleeve cuff ring
    const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 16), clothMat);
    rCuff.position.set(0.05, -0.07, 0.12);
    rCuff.rotation.set(-0.65, 0.35, -0.45);
    this.torchMesh.add(rCuff);

    // Right wrist & hand gripping torch
    const rWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, 0.14, 8), skinMat);
    rWrist.position.set(0.02, -0.03, 0.06);
    rWrist.rotation.set(-0.65, 0.35, -0.45);
    this.torchMesh.add(rWrist);

    // Hand palm and gripping fingers around torch
    const rHandPalm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.09), skinMat);
    rHandPalm.position.set(0.02, -0.01, 0.0);
    this.torchMesh.add(rHandPalm);

    // 4 Curved fingers wrapping around the brass barrel
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.075, 6), skinMat);
      finger.position.set(-0.038, 0.015, -0.04 + f * 0.024);
      finger.rotation.z = Math.PI / 2.3;
      this.torchMesh.add(finger);
    }

    // Ribbed cylindrical body of torch
    const bodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.32, 12);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, brassMat);
    body.castShadow = true;
    this.torchMesh.add(body);

    // Flared reflector head & bezel
    const headGeo = new THREE.CylinderGeometry(0.075, 0.045, 0.09, 12);
    headGeo.rotateX(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, darkMetalMat);
    head.position.z = -0.18;
    this.torchMesh.add(head);

    // Glass lens with bulb
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), glassMat);
    lens.position.z = -0.226;
    this.torchMesh.add(lens);

    // Torch Ember Sparks (Glowing micro-particles drifting from torch)
    this.emberPositions = new Float32Array(this.emberCount * 3);
    this.emberVelocities = new Float32Array(this.emberCount * 3);
    for (let i = 0; i < this.emberCount; i++) {
      this.emberPositions[i * 3] = (Math.random() - 0.5) * 0.05;
      this.emberPositions[i * 3 + 1] = Math.random() * 0.15;
      this.emberPositions[i * 3 + 2] = -0.23 - Math.random() * 0.05;

      this.emberVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      this.emberVelocities[i * 3 + 1] = 0.08 + Math.random() * 0.08;
      this.emberVelocities[i * 3 + 2] = -0.05 - Math.random() * 0.05;
    }

    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(this.emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xffaa33,
      size: 0.015,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.emberParticles = new THREE.Points(emberGeo, emberMat);
    this.torchMesh.add(this.emberParticles);

    // Position held torch in lower-right of first-person view
    this.torchMesh.position.set(0.28, -0.25, -0.5);
    this.torchMesh.rotation.set(-0.08, -0.05, 0);
    this.group.add(this.torchMesh);

    // 2. Left Hand: Vintage Brass Field Compass
    this.compassGroup = new THREE.Group();

    // Left forearm with khaki rolled sleeve
    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.075, 0.42, 10), clothMat);
    lForearm.position.set(-0.14, -0.16, 0.22);
    lForearm.rotation.set(-0.65, -0.35, 0.45);
    lForearm.castShadow = true;
    this.compassGroup.add(lForearm);

    // Rolled sleeve cuff
    const lCuff = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 16), clothMat);
    lCuff.position.set(-0.06, -0.07, 0.12);
    lCuff.rotation.set(-0.65, -0.35, 0.45);
    this.compassGroup.add(lCuff);

    // Leather expedition wristwatch with brass bezel on left wrist
    const watchStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.026, 12), leatherMat);
    watchStrap.position.set(-0.03, -0.03, 0.06);
    watchStrap.rotation.set(-0.65, -0.35, 0.45);
    this.compassGroup.add(watchStrap);

    const watchFace = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 10), brassMat);
    watchFace.position.set(-0.02, 0.01, 0.06);
    this.compassGroup.add(watchFace);

    // Left wrist & cupped hand supporting compass
    const lWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, 0.12, 8), skinMat);
    lWrist.position.set(-0.02, -0.03, 0.05);
    lWrist.rotation.set(-0.65, -0.35, 0.45);
    this.compassGroup.add(lWrist);

    const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.09), skinMat);
    lPalm.position.set(0, -0.025, 0);
    this.compassGroup.add(lPalm);

    // Circular brass housing of compass
    const casingGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.02, 16);
    const casing = new THREE.Mesh(casingGeo, brassMat);
    casing.castShadow = true;
    this.compassGroup.add(casing);

    // Dial face with compass rose
    const dialFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.058, 16),
      new THREE.MeshStandardMaterial({ color: 0xeee7d6, roughness: 0.8 })
    );
    dialFace.rotateX(-Math.PI / 2);
    dialFace.position.y = 0.011;
    this.compassGroup.add(dialFace);

    // Magnetic Needle (North red, South dark)
    const needleGeo = new THREE.ConeGeometry(0.012, 0.09, 4);
    needleGeo.rotateX(Math.PI / 2);
    needleGeo.scale(1, 0.2, 1);
    this.needleMesh = new THREE.Mesh(
      needleGeo,
      new THREE.MeshStandardMaterial({ color: 0xd93838, roughness: 0.3 })
    );
    this.needleMesh.position.y = 0.014;
    this.compassGroup.add(this.needleMesh);

    // Glass crystal cover
    const compassGlass = new THREE.Mesh(new THREE.CircleGeometry(0.062, 16), glassMat);
    compassGlass.rotateX(-Math.PI / 2);
    compassGlass.position.y = 0.016;
    this.compassGroup.add(compassGlass);

    // Position held compass in lower-left of first-person view
    this.compassGroup.position.set(-0.28, -0.26, -0.48);
    this.compassGroup.rotation.set(0.35, 0.25, -0.15);
    this.group.add(this.compassGroup);

    // Attach arms group directly as a child of the camera for locked 1st-person view
    this.cameraRig.camera.add(this.group);
  }

  public triggerInspectAnimation() {
    this.isInspecting = true;
    this.inspectProgress = 0;
  }

  public update(delta: number, isMoving: boolean, isSprinting: boolean, playerPos: THREE.Vector3) {
    // 1. Compass needle points toward the ancient Meridian Sanctuary (X = 0, Z = -235) (Zero-GC)
    this._scratchMeridian.set(0 - playerPos.x, 0, -235 - playerPos.z).normalize();
    const currentAngle = Math.atan2(this._scratchMeridian.x, this._scratchMeridian.z);

    // Relative to camera yaw
    const relativeAngle = currentAngle - this.cameraRig.yaw;
    this.needleMesh.rotation.y = relativeAngle;

    // 2. Natural sway and stride movement
    const swaySpeed = isSprinting ? 12 : (isMoving ? 7.5 : 1.8);
    const swayAmp = isSprinting ? 0.035 : (isMoving ? 0.018 : 0.005);
    this.swayTimer += delta * swaySpeed;

    this.swayOffset.x = Math.sin(this.swayTimer * 0.5) * swayAmp;
    this.swayOffset.y = Math.cos(this.swayTimer) * (swayAmp * 0.7);

    // Apply sway to equipment
    this.torchMesh.position.set(
      0.28 + this.swayOffset.x,
      -0.25 + this.swayOffset.y,
      -0.5
    );

    this.compassGroup.position.set(
      -0.28 - this.swayOffset.x * 0.8,
      -0.26 - this.swayOffset.y * 0.8,
      -0.48
    );

    // 3. Inspect animation reach
    if (this.isInspecting) {
      this.inspectProgress += delta * 3.5;
      const reach = Math.sin(this.inspectProgress * Math.PI) * 0.12;
      this.torchMesh.position.z = -0.5 - reach;
      this.torchMesh.position.y = -0.25 + reach * 0.5;

      if (this.inspectProgress >= 1.0) {
        this.isInspecting = false;
        this.torchMesh.position.z = -0.5;
      }
    }

    // 4. Inertial Look Lag & Breathing Motion
    const deltaYaw = this.cameraRig.yaw - this.prevCameraYaw;
    const deltaPitch = this.cameraRig.pitch - this.prevCameraPitch;
    this.prevCameraYaw = this.cameraRig.yaw;
    this.prevCameraPitch = this.cameraRig.pitch;

    // Smooth spring recovery
    this.lagYaw = THREE.MathUtils.lerp(this.lagYaw, -deltaYaw * 0.25, Math.min(1.0, delta * 12));
    this.lagPitch = THREE.MathUtils.lerp(this.lagPitch, deltaPitch * 0.25, Math.min(1.0, delta * 12));

    // Breathing cycle (0.22Hz idle oscillation)
    const breathing = Math.sin(this.swayTimer * 0.3) * 0.0025;
    this.group.position.x = this.lagYaw;
    this.group.position.y = this.lagPitch + breathing;
    this.group.rotation.z = -this.lagYaw * 0.5;
    this.group.rotation.x = this.lagPitch * 0.5;

    // 5. Animate Torch Ember Sparks
    const posAttr = this.emberParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < this.emberCount; i++) {
      arr[i * 3] += this.emberVelocities[i * 3] * delta + (Math.random() - 0.5) * 0.002;
      arr[i * 3 + 1] += this.emberVelocities[i * 3 + 1] * delta;
      arr[i * 3 + 2] += this.emberVelocities[i * 3 + 2] * delta;

      // Reset when risen too high or far
      if (arr[i * 3 + 1] > 0.22 || arr[i * 3 + 2] < -0.42) {
        arr[i * 3] = (Math.random() - 0.5) * 0.035;
        arr[i * 3 + 1] = 0.01;
        arr[i * 3 + 2] = -0.23;
      }
    }
    posAttr.needsUpdate = true;
  }
}
