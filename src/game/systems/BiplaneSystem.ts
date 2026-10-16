/**
 * The Lost Meridian - 1928 Curtiss "Falcon" Biplane Flight System
 * Aerodynamic simulation, radial piston throttle, flare dropping, and aerial photography.
 */

import * as THREE from 'three';
import { audioEngine } from '../audio/AudioEngine';

export interface AerialFlare {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

export class BiplaneSystem {
  public isBoarded = false;
  public throttle = 0; // 0..1.0
  public airspeed = 0; // knots (0..120)
  public position = new THREE.Vector3(-18.0, 14.5, 45.0);
  public rotation = new THREE.Euler(0, 0, 0, 'YXZ');
  public velocity = new THREE.Vector3();

  // Control inputs
  public pitchInput = 0; // -1..1
  public rollInput = 0; // -1..1
  public yawInput = 0; // -1..1

  // Flares & Photography
  public flares: AerialFlare[] = [];
  public flareCount = 6;
  public photosTaken = 0;

  // 3D Object Refs
  public planeMesh: THREE.Group | null = null;
  public propMesh: THREE.Mesh | null = null;

  private scene: THREE.Scene | null = null;
  private soundTimer = 0;

  public init(scene: THREE.Scene, planeMesh: THREE.Group, propMesh: THREE.Mesh) {
    this.scene = scene;
    this.planeMesh = planeMesh;
    this.propMesh = propMesh;
  }

  public board() {
    this.isBoarded = true;
    this.throttle = 0.35;
    audioEngine.playSfx('click');
    audioEngine.playBiplaneEngine(0.35);
  }

  public dismount(terrain?: { getHeightAt: (x: number, z: number) => number }): THREE.Vector3 {
    this.isBoarded = false;
    this.throttle = 0;
    this.airspeed = 0;
    const exitX = this.position.x + 3.0;
    const exitZ = this.position.z;
    const groundY = terrain ? terrain.getHeightAt(exitX, exitZ) : 12.0;
    const exitY = Math.max(groundY + 0.6, 2.0);
    return new THREE.Vector3(exitX, exitY, exitZ);
  }

  public adjustThrottle(delta: number) {
    this.throttle = Math.max(0, Math.min(1.0, this.throttle + delta));
  }

  public dropFlare() {
    if (!this.scene || this.flareCount <= 0) return;
    this.flareCount--;
    audioEngine.playFlareDrop();

    const flareGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
    const flareMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.0 });
    const mesh = new THREE.Mesh(flareGeo, flareMat);
    mesh.position.copy(this.position);
    mesh.position.y -= 1.5;

    const light = new THREE.PointLight(0xf97316, 4.0, 45);
    light.position.copy(mesh.position);

    this.scene.add(mesh);
    this.scene.add(light);

    this.flares.push({
      mesh,
      light,
      position: mesh.position,
      velocity: new THREE.Vector3(0, -2.5, 0), // slow parachute drift
      life: 18.0, // seconds
    });
  }

  public snapAerialPhoto(): boolean {
    if (this.photosTaken >= 12) return false;
    this.photosTaken++;
    audioEngine.playCameraShutter();
    return true;
  }

  public update(dt: number, terrain?: { getHeightAt: (x: number, z: number) => number }) {
    // Engine sound loop
    this.soundTimer += dt;
    if (this.soundTimer > 0.22 && this.isBoarded) {
      this.soundTimer = 0;
      audioEngine.playBiplaneEngine(this.throttle);
    }

    // Spin propeller
    if (this.propMesh) {
      this.propMesh.rotation.z += (this.isBoarded ? (15 + this.throttle * 40) : 2) * dt;
    }

    if (this.isBoarded) {
      // Target airspeed based on throttle
      const targetSpeed = this.throttle * 90; // knots
      this.airspeed += (targetSpeed - this.airspeed) * 1.5 * dt;

      // Angular rotation physics
      const rollRate = this.rollInput * 1.8 * dt;
      const pitchRate = this.pitchInput * 1.2 * dt;
      const yawRate = this.yawInput * 1.0 * dt;

      this.rotation.z += rollRate;
      this.rotation.x += pitchRate;
      this.rotation.y += yawRate;

      // Forward flight direction
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
      const speedMps = (this.airspeed * 1852) / 3600; // m/s
      this.velocity.copy(forward).multiplyScalar(speedMps);

      // Lift vs gravity
      const lift = (this.airspeed / 50) * 9.8;
      this.velocity.y += (lift - 9.8) * 0.4 * dt;

      this.position.addScaledVector(this.velocity, dt);

      // Terrain minimum flight clearance
      const groundY = terrain ? terrain.getHeightAt(this.position.x, this.position.z) : 0;
      const minFlightY = Math.max(8.0, groundY + 2.5);
      if (this.position.y < minFlightY) {
        this.position.y = minFlightY;
        this.velocity.y = Math.max(0, this.velocity.y);
      }

      // Update Plane Mesh
      if (this.planeMesh) {
        this.planeMesh.position.copy(this.position);
        this.planeMesh.rotation.copy(this.rotation);
      }
    }

    // Update flares
    for (let i = this.flares.length - 1; i >= 0; i--) {
      const f = this.flares[i];
      f.life -= dt;
      f.position.addScaledVector(f.velocity, dt);
      f.mesh.position.copy(f.position);
      f.light.position.copy(f.position);

      if (f.life <= 0 || f.position.y <= 0) {
        if (this.scene) {
          this.scene.remove(f.mesh);
          this.scene.remove(f.light);
        }
        this.flares.splice(i, 1);
      }
    }
  }
}
