/**
 * The Lost Meridian - Subterranean Minecart Track & Gravity Railway
 * Spline rail simulation, momentum handbrake, and chasm trestle traversal.
 */

import * as THREE from 'three';
import { InputController } from '../engine/InputController';
import { audioEngine } from '../audio/AudioEngine';

const _scratchCartPos = new THREE.Vector3();
const _scratchNextPos = new THREE.Vector3();
const _scratchCartTangent = new THREE.Vector3();
const _scratchForwardAxis = new THREE.Vector3(0, 0, 1);

export class MinecartSystem {
  public isRiding = false;
  public cartGroup: THREE.Group;
  public trackGroup: THREE.Group;

  public speed = 0;
  public maxSpeed = 16.0;
  public progress = 0; // 0..1 along track spline
  public path: THREE.CatmullRomCurve3;

  private clatterTimer = 0;
  private handbrakeLever: THREE.Mesh | null = null;

  constructor() {
    this.cartGroup = new THREE.Group();
    this.trackGroup = new THREE.Group();

    // Define 3D railway spline through subterranean chasm & crystal caverns
    const trackPoints = [
      new THREE.Vector3(-3.0, -8.0, -118.0),
      new THREE.Vector3(-1.0, -8.5, -128.0),
      new THREE.Vector3(4.0, -9.2, -138.0),
      new THREE.Vector3(5.5, -9.8, -148.0),
      new THREE.Vector3(1.5, -10.5, -156.0),
      new THREE.Vector3(-4.0, -11.0, -152.0),
      new THREE.Vector3(-6.0, -10.2, -140.0),
      new THREE.Vector3(-5.5, -9.0, -128.0),
      new THREE.Vector3(-3.0, -8.0, -118.0), // closed loop
    ];
    this.path = new THREE.CatmullRomCurve3(trackPoints, true, 'centripetal');

    this.buildTrackGeometry();
    this.buildCartModel();
  }

  private buildTrackGeometry() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x452b1b, roughness: 0.9 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });

    // Generate rails along spline
    const railOffset = 0.45;
    const divisions = 120;

    for (let i = 0; i < divisions; i++) {
      const u = i / divisions;
      const pt = this.path.getPoint(u);
      const tangent = this.path.getTangent(u);
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      // Wooden Railroad Tie / Sleeper
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.2), woodMat);
      sleeper.position.copy(pt);
      sleeper.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
      this.trackGroup.add(sleeper);

      // Iron Rails (twin rails)
      [-railOffset, railOffset].forEach((offset) => {
        const railPt = pt.clone().addScaledVector(binormal, offset);
        const railSegment = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.8), ironMat);
        railSegment.position.copy(railPt);
        railSegment.position.y += 0.06;
        railSegment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        this.trackGroup.add(railSegment);
      });
    }
  }

  private buildCartModel() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3d28, roughness: 0.8 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 });

    // Cart Body Tub
    const tubBottom = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 1.5), woodMat);
    tubBottom.position.y = 0.3;
    this.cartGroup.add(tubBottom);

    const tubSideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 1.5), woodMat);
    tubSideL.position.set(-0.48, 0.65, 0);
    this.cartGroup.add(tubSideL);

    const tubSideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 1.5), woodMat);
    tubSideR.position.set(0.48, 0.65, 0);
    this.cartGroup.add(tubSideR);

    const tubFront = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.06), woodMat);
    tubFront.position.set(0, 0.65, 0.72);
    this.cartGroup.add(tubFront);

    const tubBack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.06), woodMat);
    tubBack.position.set(0, 0.65, -0.72);
    this.cartGroup.add(tubBack);

    // Flanged Iron Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12);
    wheelGeo.rotateZ(Math.PI * 0.5);

    [-0.45, 0.45].forEach((x) => {
      [-0.5, 0.5].forEach((z) => {
        const wheel = new THREE.Mesh(wheelGeo, ironMat);
        wheel.position.set(x, 0.18, z);
        this.cartGroup.add(wheel);
      });
    });

    // Handbrake Lever
    this.handbrakeLever = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), ironMat);
    this.handbrakeLever.position.set(0.35, 0.7, -0.5);
    this.handbrakeLever.rotation.x = -0.3;
    this.cartGroup.add(this.handbrakeLever);

    // Initial position on track
    const startPt = this.path.getPoint(0);
    this.cartGroup.position.copy(startPt);
  }

  public boardCart(playerPos: THREE.Vector3) {
    this.isRiding = true;
    this.speed = 4.0;
    audioEngine.playMinecartClatter();
  }

  public dismountCart(): THREE.Vector3 {
    this.isRiding = false;
    this.speed = 0;
    const dismountPos = this.cartGroup.position.clone();
    dismountPos.x += 1.2;
    dismountPos.y += 0.5;
    return dismountPos;
  }

  public update(
    delta: number,
    input: InputController,
    playerPos: THREE.Vector3,
    camera: THREE.PerspectiveCamera
  ) {
    if (!this.isRiding) return;

    // Controls: W / Virtual Y+ to accelerate, S / Virtual Y- to brake
    if (input.moveForward || input.virtualMoveY > 0.3) {
      this.speed = Math.min(this.maxSpeed, this.speed + delta * 6.0);
    } else if (input.moveBackward || input.virtualMoveY < -0.3) {
      this.speed = Math.max(0, this.speed - delta * 9.0);
    } else {
      // Natural gravity & rolling resistance
      this.speed = Math.max(2.5, this.speed - delta * 0.8);
    }

    // Advance along curve
    const pathLength = this.path.getLength();
    const progressDelta = (this.speed * delta) / pathLength;
    this.progress = (this.progress + progressDelta) % 1.0;

    this.path.getPoint(this.progress, _scratchCartPos);
    this.path.getPoint((this.progress + 0.01) % 1.0, _scratchNextPos);
    _scratchCartTangent.copy(_scratchNextPos).sub(_scratchCartPos).normalize();

    this.cartGroup.position.copy(_scratchCartPos);
    this.cartGroup.quaternion.setFromUnitVectors(_scratchForwardAxis, _scratchCartTangent);

    // Update Player & Camera to sit inside minecart
    playerPos.copy(_scratchCartPos);
    playerPos.y += 0.45;

    camera.position.copy(playerPos);
    camera.position.y += 0.8;

    // Audio clatter
    this.clatterTimer += delta * (this.speed / 5.0);
    if (this.clatterTimer >= 0.4) {
      this.clatterTimer = 0;
      audioEngine.playMinecartClatter();
    }
  }
}
