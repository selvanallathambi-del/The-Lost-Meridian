/**
 * The Lost Meridian - 1928 Expedition Hot Air Observation Balloon
 * High-altitude aerostat flight simulation, burner mechanics, and panoramic mesa survey.
 */

import * as THREE from 'three';
import { InputController } from '../engine/InputController';
import { CameraRig } from '../engine/CameraRig';
import { audioEngine } from '../audio/AudioEngine';

export class BalloonSystem {
  public isBoarded = false;
  public group: THREE.Group;
  public basketGroup: THREE.Group;
  public envelopeGroup: THREE.Group;
  public burnerLight: THREE.PointLight;
  public burnerFlame: THREE.Mesh;

  public basePosition = new THREE.Vector3(-18.0, 12.0, 30.0);
  public currentPosition = new THREE.Vector3(-18.0, 12.0, 30.0);
  public velocityY = 0;
  public altitude = 12.0;
  public minAltitude = 12.0;
  public maxAltitude = 220.0;
  public yaw = 0;
  public fuel = 100; // 0..100%
  public isBurnerActive = false;
  public isSpyglassActive = false;
  public ballastCount = 4;

  private burnerTimer = 0;
  private windTimer = 0;
  private tetherLines: THREE.LineSegments | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.basketGroup = new THREE.Group();
    this.envelopeGroup = new THREE.Group();

    // 1. Build Wicker Basket
    const wickerMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });

    const basketFloor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.0), woodMat);
    basketFloor.position.y = 0.05;
    this.basketGroup.add(basketFloor);

    // 4 Wicker Walls
    [-0.95, 0.95].forEach((x) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 2.0), wickerMat);
      wall.position.set(x, 0.6, 0);
      this.basketGroup.add(wall);
    });
    [-0.95, 0.95].forEach((z) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.1), wickerMat);
      wall.position.set(0, 0.6, z);
      this.basketGroup.add(wall);
    });

    // Sandbags
    const sandbagMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9 });
    [
      [-1.0, 0.4, -0.6],
      [-1.0, 0.4, 0.6],
      [1.0, 0.4, -0.6],
      [1.0, 0.4, 0.6],
    ].forEach(([x, y, z]) => {
      const bag = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), sandbagMat);
      bag.scale.set(0.8, 1.2, 0.8);
      bag.position.set(x, y, z);
      this.basketGroup.add(bag);
    });

    // Rigging Poles
    [
      [-0.9, 1.8, -0.9],
      [0.9, 1.8, -0.9],
      [-0.9, 1.8, 0.9],
      [0.9, 1.8, 0.9],
    ].forEach(([x, y, z]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), brassMat);
      pole.position.set(x, y, z);
      this.basketGroup.add(pole);
    });

    // Burner Frame & Flame
    const burnerFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), brassMat);
    burnerFrame.position.set(0, 2.5, 0);
    this.basketGroup.add(burnerFrame);

    const flameGeo = new THREE.ConeGeometry(0.25, 0.8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    this.burnerFlame = new THREE.Mesh(flameGeo, flameMat);
    this.burnerFlame.position.set(0, 2.9, 0);
    this.burnerFlame.visible = false;
    this.basketGroup.add(this.burnerFlame);

    this.burnerLight = new THREE.PointLight(0xf97316, 0, 15);
    this.burnerLight.position.set(0, 3.0, 0);
    this.basketGroup.add(this.burnerLight);

    // 2. Build Balloon Fabric Envelope (Striped Cream & Crimson)
    const envelopeGeo = new THREE.SphereGeometry(6.5, 24, 20);
    envelopeGeo.scale(1.0, 1.35, 1.0);
    const envelopeMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const envelope = new THREE.Mesh(envelopeGeo, envelopeMat);
    envelope.position.set(0, 11.5, 0);
    this.envelopeGroup.add(envelope);

    // Lower skirt cone
    const skirtGeo = new THREE.ConeGeometry(2.5, 3.0, 16, 1, true);
    skirtGeo.rotateX(Math.PI);
    const skirt = new THREE.Mesh(skirtGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }));
    skirt.position.set(0, 5.0, 0);
    this.envelopeGroup.add(skirt);

    this.group.add(this.basketGroup);
    this.group.add(this.envelopeGroup);

    this.group.position.copy(this.basePosition);
  }

  public board(playerPos: THREE.Vector3) {
    this.isBoarded = true;
    this.currentPosition.copy(this.group.position);
    audioEngine.playSfx('click');
  }

  public dismount(terrain?: { getHeightAt: (x: number, z: number) => number }): THREE.Vector3 {
    this.isBoarded = false;
    this.isBurnerActive = false;
    this.burnerFlame.visible = false;
    this.burnerLight.intensity = 0;
    const exitPos = this.basePosition.clone();
    exitPos.x += 2.5;
    const groundY = terrain ? terrain.getHeightAt(exitPos.x, exitPos.z) : 12.0;
    exitPos.y = Math.max(groundY + 0.5, 12.0);
    return exitPos;
  }

  public dropBallast() {
    if (this.ballastCount > 0) {
      this.ballastCount--;
      this.velocityY += 2.5;
      audioEngine.playSfx('splash');
    }
  }

  public update(
    delta: number,
    input: InputController,
    cameraRig: CameraRig,
    playerPos: THREE.Vector3
  ) {
    if (!this.isBoarded) return;

    // Controls:
    // W / ArrowUp: Fire Burner (Ascend)
    // S / ArrowDown: Vent Hot Air (Descend)
    // A / D: Rotate Yaw
    // B / Virtual: Drop Ballast
    const isHeating = (input.moveForward || input.virtualMoveY > 0.2) && this.fuel > 0;
    const isVenting = input.moveBackward || input.virtualMoveY < -0.2;

    if (isHeating) {
      this.isBurnerActive = true;
      this.velocityY = Math.min(6.5, this.velocityY + delta * 4.0);
      this.fuel = Math.max(0, this.fuel - delta * 1.5);
      this.burnerFlame.visible = true;
      this.burnerLight.intensity = 3.5 + Math.random() * 1.2;

      this.burnerTimer += delta;
      if (this.burnerTimer >= 0.8) {
        this.burnerTimer = 0;
        audioEngine.playBurnerRoar();
      }
    } else {
      this.isBurnerActive = false;
      this.burnerFlame.visible = false;
      this.burnerLight.intensity = 0;
      this.burnerTimer = 0;

      if (isVenting) {
        this.velocityY = Math.max(-5.0, this.velocityY - delta * 3.5);
      } else {
        // Natural cooling & gravitational descent
        this.velocityY = Math.max(-2.2, this.velocityY - delta * 1.2);
      }
    }

    // Yaw Steering
    if (input.moveLeft || input.virtualMoveX < -0.2) {
      this.yaw += delta * 0.6;
    }
    if (input.moveRight || input.virtualMoveX > 0.2) {
      this.yaw -= delta * 0.6;
    }

    // Update altitude
    this.altitude = THREE.MathUtils.clamp(
      this.altitude + this.velocityY * delta,
      this.minAltitude,
      this.maxAltitude
    );

    // If at ground or ceiling, zero out velocity
    if (this.altitude <= this.minAltitude || this.altitude >= this.maxAltitude) {
      this.velocityY = 0;
    }

    // Pendulum basket sway based on altitude and wind
    const swayAngle = Math.sin(Date.now() * 0.0015) * 0.04 * (this.altitude / 50);
    this.basketGroup.rotation.z = swayAngle;
    this.basketGroup.rotation.y = this.yaw;
    this.envelopeGroup.rotation.y = this.yaw;

    // Apply Position
    this.currentPosition.y = this.altitude;
    this.group.position.copy(this.currentPosition);

    // Sync Player & Camera with basket interior
    playerPos.copy(this.currentPosition);
    playerPos.y += 0.8;

    cameraRig.camera.position.copy(playerPos);
    cameraRig.camera.position.y += 0.8;

    // High altitude atmospheric wind sounds
    if (this.altitude > 45) {
      this.windTimer += delta;
      if (this.windTimer >= 3.5) {
        this.windTimer = 0;
        audioEngine.playHighAltitudeWind();
      }
    }
  }
}
