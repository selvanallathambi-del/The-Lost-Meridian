/**
 * The Lost Meridian & Stillwater - Interactive Rowboat & Navigation Physics
 * Complete boardable wooden rowboat with dual rotating oars, water buoyancy,
 * inertia physics, stern wake trails, and docking mechanics.
 */

import * as THREE from 'three';
import { CameraRig } from '../engine/CameraRig';
import { InputController } from '../engine/InputController';
import { TerrainSystem } from '../world/TerrainSystem';

export class BoatSystem {
  public mesh: THREE.Group;
  public isBoarded = false;
  public isAnchored = false;
  public position = new THREE.Vector3(-3.4, -2.25, 12.0);
  public velocity = new THREE.Vector3();
  public forwardSpeed = 0;
  public heading = Math.PI * 0.5; // Facing out towards pond
  public angularVelocity = 0;

  // Visual sub-meshes
  private leftOar: THREE.Group;
  private rightOar: THREE.Group;
  private bowLantern: THREE.PointLight;
  private oarStrokePhase = 0;
  private wakeEmitterGroup = new THREE.Group();

  // Water level
  private waterY = -2.25;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    // 1. Build Wooden Rowboat Hull
    const hullGroup = new THREE.Group();

    // Bottom Keel & Planking
    const keelGeo = new THREE.BoxGeometry(0.2, 0.25, 3.8);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.75,
      metalness: 0.05,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.85,
    });

    const keel = new THREE.Mesh(keelGeo, darkWoodMat);
    keel.position.y = -0.15;
    hullGroup.add(keel);

    // Curved Hull Planks (Side ribs)
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-0.7, 0.4);
    hullShape.quadraticCurveTo(-0.75, -0.1, -0.1, -0.25);
    hullShape.lineTo(0.1, -0.25);
    hullShape.quadraticCurveTo(0.75, -0.1, 0.7, 0.4);
    hullShape.lineTo(0.6, 0.4);
    hullShape.quadraticCurveTo(0.65, -0.05, 0.0, -0.18);
    hullShape.quadraticCurveTo(-0.65, -0.05, -0.6, 0.4);
    hullShape.closePath();

    const extrudeSettings = {
      steps: 8,
      depth: 3.4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 3,
    };

    const hullMeshGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullMeshGeo.center();
    const hullMesh = new THREE.Mesh(hullMeshGeo, woodMat);
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    hullGroup.add(hullMesh);

    // Bow Pointed Cone
    const bowGeo = new THREE.ConeGeometry(0.72, 1.2, 4);
    bowGeo.rotateX(Math.PI / 2);
    bowGeo.rotateY(Math.PI / 4);
    const bowMesh = new THREE.Mesh(bowGeo, woodMat);
    bowMesh.position.set(0, 0.05, -2.1);
    bowMesh.scale.set(0.95, 0.55, 1.0);
    hullGroup.add(bowMesh);

    // Stern Flat Transom
    const sternGeo = new THREE.BoxGeometry(1.2, 0.6, 0.15);
    const sternMesh = new THREE.Mesh(sternGeo, darkWoodMat);
    sternMesh.position.set(0, 0.12, 1.7);
    hullGroup.add(sternMesh);

    // Wooden Thwart Benches (Seats)
    const benchGeo = new THREE.BoxGeometry(1.25, 0.08, 0.4);
    const midBench = new THREE.Mesh(benchGeo, woodMat);
    midBench.position.set(0, 0.12, 0.0);
    hullGroup.add(midBench);

    const bowBench = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.35), woodMat);
    bowBench.position.set(0, 0.18, -1.2);
    hullGroup.add(bowBench);

    const sternBench = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.35), woodMat);
    sternBench.position.set(0, 0.18, 1.3);
    hullGroup.add(sternBench);

    // 2. Dual Wooden Oars
    this.leftOar = this.createOar(true);
    this.leftOar.position.set(-0.75, 0.35, 0.0);
    hullGroup.add(this.leftOar);

    this.rightOar = this.createOar(false);
    this.rightOar.position.set(0.75, 0.35, 0.0);
    hullGroup.add(this.rightOar);

    // 3. Bow Warm Lantern Post
    const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), darkWoodMat);
    lanternPost.position.set(0, 0.45, -2.2);
    hullGroup.add(lanternPost);

    const lanternCage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0xffa000,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      })
    );
    lanternCage.position.set(0, 0.72, -2.2);
    hullGroup.add(lanternCage);

    this.bowLantern = new THREE.PointLight(0xffb74d, 1.8, 12);
    this.bowLantern.position.set(0, 0.75, -2.2);
    hullGroup.add(this.bowLantern);

    this.mesh.add(hullGroup);
    this.mesh.add(this.wakeEmitterGroup);
  }

  private createOar(isLeft: boolean): THREE.Group {
    const oarGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.03, 1.9, 8);
    const oarMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
    const shaft = new THREE.Mesh(shaftGeo, oarMat);
    shaft.position.y = -0.6;
    shaft.rotation.z = isLeft ? -0.45 : 0.45;
    oarGroup.add(shaft);

    const bladeGeo = new THREE.BoxGeometry(0.18, 0.55, 0.02);
    const blade = new THREE.Mesh(bladeGeo, oarMat);
    blade.position.set(isLeft ? -0.45 : 0.45, -1.35, 0);
    blade.rotation.z = isLeft ? -0.45 : 0.45;
    oarGroup.add(blade);

    return oarGroup;
  }

  public getBoardingDistance(playerPos: THREE.Vector3): number {
    return playerPos.distanceTo(this.position);
  }

  public toggleBoard(playerPos: THREE.Vector3, terrain?: TerrainSystem): boolean {
    if (!this.isBoarded) {
      if (this.getBoardingDistance(playerPos) < 5.2) {
        this.isBoarded = true;
        return true;
      }
      return false;
    } else {
      // Dismount to nearest safe riverbank or landing platform
      this.isBoarded = false;
      const bankSign = this.position.x < 0 ? -1 : 1;
      const safeX = this.position.x + bankSign * 2.4;
      const safeZ = this.position.z;
      const safeY = terrain ? Math.max(-1.5, terrain.getHeightAt(safeX, safeZ) + 0.3) : -1.2;
      playerPos.set(safeX, safeY, safeZ);
      return true;
    }
  }

  public toggleAnchor() {
    this.isAnchored = !this.isAnchored;
    if (this.isAnchored) {
      this.forwardSpeed = 0;
      this.angularVelocity = 0;
    }
  }

  public update(delta: number, time: number, input: InputController, cameraRig: CameraRig, terrain: TerrainSystem) {
    if (this.isBoarded) {
      // 1. Steering & Rowing Physics
      let accel = 0;
      let turn = 0;

      if (!this.isAnchored) {
        if (input.moveForward) accel += 4.5;
        if (input.moveBackward) accel -= 2.5;
        if (input.moveLeft) turn += 1.8;
        if (input.moveRight) turn -= 1.8;

        // Virtual Joystick support
        if (input.virtualMoveY !== 0) accel += input.virtualMoveY * 4.5;
        if (input.virtualMoveX !== 0) turn -= input.virtualMoveX * 1.8;
      }

      // Inertia & Water Drag
      this.forwardSpeed += accel * delta;
      this.forwardSpeed *= Math.pow(0.82, delta * 10); // Water friction
      this.angularVelocity += turn * delta;
      this.angularVelocity *= Math.pow(0.75, delta * 10);

      this.heading += this.angularVelocity * delta;

      // Position update
      const fwd = new THREE.Vector3(-Math.sin(this.heading), 0, -Math.cos(this.heading));
      this.velocity.copy(fwd).multiplyScalar(this.forwardSpeed);
      this.position.addScaledVector(this.velocity, delta);

      // Constrain boat to river channels and open pond basins (Z between +35 and -40, X within banks)
      const maxBankX = 7.2;
      this.position.x = Math.max(-maxBankX, Math.min(maxBankX, this.position.x));
      this.position.z = Math.max(-41.0, Math.min(38.0, this.position.z));

      // Embankment shoreline collision check against terrain height
      const shoreHeight = terrain.getHeightAt(this.position.x, this.position.z);
      if (shoreHeight > -1.65) {
        // Deflect boat back toward center of river channel
        this.position.x *= 0.94;
        this.forwardSpeed *= 0.65;
        this.angularVelocity = -this.angularVelocity * 0.5;
      }

      // 2. Animated Oar Strokes
      if (Math.abs(this.forwardSpeed) > 0.1 || Math.abs(this.angularVelocity) > 0.1) {
        this.oarStrokePhase += delta * 4.2 * Math.sign(this.forwardSpeed || 1);
        const oarRoll = Math.sin(this.oarStrokePhase) * 0.35;
        const oarPitch = Math.cos(this.oarStrokePhase) * 0.25;

        this.leftOar.rotation.x = oarPitch;
        this.leftOar.rotation.y = oarRoll;
        this.rightOar.rotation.x = oarPitch;
        this.rightOar.rotation.y = -oarRoll;
      }

      // 3. Smooth Camera Follow
      const targetCamPos = this.position.clone().add(new THREE.Vector3(
        Math.sin(this.heading) * 4.8,
        2.2,
        Math.cos(this.heading) * 4.8
      ));
      cameraRig.camera.position.lerp(targetCamPos, delta * 4.0);
      cameraRig.yaw = this.heading + Math.PI;
    }

    // 4. Natural Wave Buoyancy & Gentle Rocking
    const wavePitch = Math.sin(time * 1.6 + this.position.z * 0.5) * 0.04;
    const waveRoll = Math.cos(time * 2.1 + this.position.x * 0.6) * 0.06;
    const waveY = Math.sin(time * 1.8 + this.position.z * 0.4) * 0.03;

    this.mesh.position.set(this.position.x, this.waterY + waveY, this.position.z);
    this.mesh.rotation.set(wavePitch, this.heading, waveRoll);
  }

  public dispose() {
    this.mesh.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
  }
}
