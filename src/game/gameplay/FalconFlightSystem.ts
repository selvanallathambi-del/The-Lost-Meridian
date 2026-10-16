/**
 * The Lost Meridian - Andean Falcon Aerial Scouting System
 * Physics and flight mechanics for canopy reconnaissance soaring above the valley.
 */

import * as THREE from 'three';
import { InputController } from '../engine/InputController';
import { audioEngine } from '../audio/AudioEngine';

export class FalconFlightSystem {
  public position: THREE.Vector3 = new THREE.Vector3(0, 38, 50);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
  public heading = 0; // Yaw radians
  public pitch = -0.05; // Pitch radians
  public roll = 0; // Bank roll radians
  public speed = 14.0; // m/s
  public altitude = 38.0;
  public isActive = false;

  private falconMesh: THREE.Group | null = null;
  private wingLeft: THREE.Mesh | null = null;
  private wingRight: THREE.Mesh | null = null;
  private wingFlapTimer = 0;

  constructor(scene: THREE.Scene) {
    this.buildFalconMesh(scene);
  }

  private buildFalconMesh(scene: THREE.Scene) {
    this.falconMesh = new THREE.Group();

    const featherMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.8,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
    });
    const beakMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.2,
    });

    // Body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 7), featherMat);
    body.rotation.x = Math.PI * 0.5;
    this.falconMesh.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), whiteMat);
    head.position.set(0, 0.08, -0.6);
    this.falconMesh.add(head);

    // Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), beakMat);
    beak.rotation.x = -Math.PI * 0.5;
    beak.position.set(0, 0.05, -0.76);
    this.falconMesh.add(beak);

    // Wings
    const wingGeo = new THREE.BoxGeometry(1.2, 0.04, 0.4);
    this.wingLeft = new THREE.Mesh(wingGeo, featherMat);
    this.wingLeft.position.set(-0.65, 0.02, -0.1);
    this.falconMesh.add(this.wingLeft);

    this.wingRight = new THREE.Mesh(wingGeo, featherMat);
    this.wingRight.position.set(0.65, 0.02, -0.1);
    this.falconMesh.add(this.wingRight);

    // Tail feathers
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.6), whiteMat);
    tail.position.set(0, 0.02, 0.7);
    this.falconMesh.add(tail);

    this.falconMesh.visible = false;
    scene.add(this.falconMesh);
  }

  public startFlight(startPos: THREE.Vector3) {
    this.isActive = true;
    this.position.set(startPos.x, Math.max(32, startPos.y + 24), startPos.z);
    this.heading = 0;
    this.pitch = -0.05;
    this.roll = 0;
    this.speed = 15.0;
    this.altitude = this.position.y;

    if (this.falconMesh) {
      this.falconMesh.visible = true;
    }

    audioEngine.playFalconCry();
  }

  public stopFlight() {
    this.isActive = false;
    if (this.falconMesh) {
      this.falconMesh.visible = false;
    }
  }

  public update(delta: number, input: InputController, camera: THREE.PerspectiveCamera) {
    if (!this.isActive) return;

    // Pitch control (W / Forward: dive & descend, S / Backward: pull up & climb)
    if (input.moveForward || input.virtualMoveY > 0.3) {
      this.pitch = Math.max(-0.65, this.pitch - delta * 1.2);
      this.speed = Math.min(28.0, this.speed + delta * 8.0);
    } else if (input.moveBackward || input.virtualMoveY < -0.3) {
      this.pitch = Math.min(0.55, this.pitch + delta * 1.2);
      this.speed = Math.max(9.0, this.speed - delta * 6.0);
    } else {
      // Gentle pitch leveling
      this.pitch = THREE.MathUtils.lerp(this.pitch, -0.05, delta * 1.5);
      this.speed = THREE.MathUtils.lerp(this.speed, 14.0, delta * 1.0);
    }

    // Yaw & Bank Roll control (A / Left: bank left, D / Right: bank right)
    if (input.moveLeft || input.virtualMoveX < -0.3) {
      this.roll = THREE.MathUtils.lerp(this.roll, 0.7, delta * 4.0);
      this.heading += delta * 1.4;
    } else if (input.moveRight || input.virtualMoveX > 0.3) {
      this.roll = THREE.MathUtils.lerp(this.roll, -0.7, delta * 4.0);
      this.heading -= delta * 1.4;
    } else {
      this.roll = THREE.MathUtils.lerp(this.roll, 0, delta * 3.5);
    }

    // Compute forward vector
    const dir = new THREE.Vector3(
      -Math.sin(this.heading) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.heading) * Math.cos(this.pitch)
    ).normalize();

    // Advance position
    this.position.addScaledVector(dir, this.speed * delta);

    // Altitude bounds (keep above canopy)
    this.position.y = Math.max(16.0, Math.min(85.0, this.position.y));
    this.altitude = this.position.y;

    // Animate wings
    this.wingFlapTimer += delta * (this.speed > 18 ? 4.0 : 1.2);
    if (this.wingLeft && this.wingRight) {
      const flap = Math.sin(this.wingFlapTimer * 8.0) * 0.25;
      this.wingLeft.rotation.z = flap;
      this.wingRight.rotation.z = -flap;
    }

    // Orient Falcon Mesh
    if (this.falconMesh) {
      this.falconMesh.position.copy(this.position);
      this.falconMesh.rotation.order = 'YXZ';
      this.falconMesh.rotation.y = this.heading;
      this.falconMesh.rotation.x = -this.pitch;
      this.falconMesh.rotation.z = this.roll;
    }

    // Follow Camera behind Falcon
    const camOffset = new THREE.Vector3(
      Math.sin(this.heading) * 4.5,
      1.8 - this.pitch * 2.0,
      Math.cos(this.heading) * 4.5
    );
    camera.position.copy(this.position).add(camOffset);
    camera.lookAt(this.position.clone().add(dir.clone().multiplyScalar(15.0)));
  }
}
