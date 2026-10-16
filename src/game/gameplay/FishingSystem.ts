/**
 * The Lost Meridian & Stillwater - Serene Fishing System
 * Cast line from the dock, riverbanks, or rowboat.
 * Realistic line physics, floating bobber with concentric ripple shockwaves,
 * bite nibble mechanics, and discoveries.
 */

import * as THREE from 'three';
import { CameraRig } from '../engine/CameraRig';
import { audioEngine } from '../audio/AudioEngine';

export interface FishCatch {
  name: string;
  weight: string;
  lore: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  icon: string;
}

export const FISH_SPECIES: FishCatch[] = [
  {
    name: 'Stillwater Jade Trout',
    weight: '3.4 lbs',
    lore: 'A peaceful, shimmering freshwater trout endemic to the tranquil millpond.',
    rarity: 'Common',
    icon: 'Fish',
  },
  {
    name: 'Luminescent Lotus Koi',
    weight: '5.8 lbs',
    lore: 'A golden-scaled carp that feeds on tropical lotus petals near ancient sluices.',
    rarity: 'Rare',
    icon: 'Sparkles',
  },
  {
    name: 'Sunken Meridian Bass',
    weight: '7.2 lbs',
    lore: 'Found in the deep shadow of the water mill wheel. Possesses iridescent azure scales.',
    rarity: 'Rare',
    icon: 'Anchor',
  },
  {
    name: 'Celestial Sovereign Eel',
    weight: '11.5 lbs',
    lore: 'A legendary golden water serpent spoken of in ancient Mayan and Mill chronicles.',
    rarity: 'Legendary',
    icon: 'Crown',
  },
];

export class FishingSystem {
  public group = new THREE.Group();
  public isFishing = false;
  public isBiting = false;
  public biteTimer = 0;
  public lineCastProgress = 0;

  // Visuals
  public rodMesh: THREE.Group;
  public bobberMesh: THREE.Mesh;
  public lineMesh: THREE.Line;
  public rippleRings: THREE.Mesh[] = [];

  private bobberPos = new THREE.Vector3();
  private rodTipPos = new THREE.Vector3();
  private waterY = -2.25;

  // Callbacks
  public onCatchFish?: (fish: FishCatch) => void;

  constructor() {
    // 1. Build Fishing Rod Mesh
    this.rodMesh = new THREE.Group();
    const rodGeo = new THREE.CylinderGeometry(0.015, 0.035, 2.4, 8);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x8d5b2c, roughness: 0.6 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.set(0.35, -0.2, -0.6);
    rod.rotation.x = -Math.PI / 3.5;
    this.rodMesh.add(rod);
    this.rodMesh.visible = false;
    this.group.add(this.rodMesh);

    // 2. Build Red & White Floating Bobber
    const bobberGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const bobberMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      emissive: 0x330000,
    });
    this.bobberMesh = new THREE.Mesh(bobberGeo, bobberMat);
    this.bobberMesh.visible = false;
    this.group.add(this.bobberMesh);

    // 3. Line geometry (2-point line)
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    this.lineMesh = new THREE.Line(lineGeo, lineMat);
    this.lineMesh.visible = false;
    this.group.add(this.lineMesh);

    // 4. Concentric Bobber Ripple Rings
    const ringGeo = new THREE.RingGeometry(0.05, 0.2, 24);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 3; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x99e6ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.visible = false;
      this.rippleRings.push(ring);
      this.group.add(ring);
    }
  }

  public toggleFishing(originPos: THREE.Vector3, forwardDir: THREE.Vector3): boolean {
    if (!this.isFishing) {
      // Cast Line
      this.isFishing = true;
      this.isBiting = false;
      this.lineCastProgress = 0;
      this.biteTimer = 3.5 + Math.random() * 4.0; // Fish bites in 3.5 to 7.5s

      // Position bobber 6-8 meters out in front on water surface
      this.bobberPos.copy(originPos).addScaledVector(forwardDir, 7.5);
      this.bobberPos.y = this.waterY;

      this.bobberMesh.position.copy(this.bobberPos);
      this.bobberMesh.visible = true;
      this.rodMesh.visible = true;
      this.lineMesh.visible = true;

      audioEngine.playWaterSplash(0.4);
      return true;
    } else {
      // Reel In
      return this.reelIn();
    }
  }

  public reelIn(): boolean {
    if (!this.isFishing) return false;

    if (this.isBiting) {
      // Success! Caught a fish!
      const randomFish = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
      audioEngine.playWaterSplash(0.8);
      if (this.onCatchFish) {
        this.onCatchFish(randomFish);
      }
    }

    this.isFishing = false;
    this.isBiting = false;
    this.bobberMesh.visible = false;
    this.rodMesh.visible = false;
    this.lineMesh.visible = false;
    this.rippleRings.forEach((r) => (r.visible = false));
    return true;
  }

  public update(delta: number, time: number, cameraRig: CameraRig) {
    if (!this.isFishing) return;

    // 1. Update Rod to follow camera view
    this.rodMesh.position.copy(cameraRig.camera.position);
    this.rodMesh.rotation.y = cameraRig.yaw;
    this.rodMesh.rotation.x = cameraRig.pitch;

    // 2. Fish Bite Timer
    if (!this.isBiting) {
      this.biteTimer -= delta;
      if (this.biteTimer <= 0) {
        this.isBiting = true;
        audioEngine.playWaterSplash(0.5);
      }
    }

    // 3. Bobber Motion (Gentle Float or Excited Nibble Splash)
    const bobDip = this.isBiting
      ? Math.sin(time * 16.0) * 0.12 - 0.08 // Fast dipping
      : Math.sin(time * 2.5) * 0.03; // Gentle float

    this.bobberMesh.position.y = this.waterY + bobDip;

    // 4. Concentric Ripple Rings
    this.rippleRings.forEach((ring, idx) => {
      ring.visible = true;
      const speed = this.isBiting ? 2.5 : 1.2;
      const rTime = (time * speed + idx * 0.33) % 1.0;
      const scale = 0.5 + rTime * (this.isBiting ? 4.5 : 2.5);
      ring.position.set(this.bobberPos.x, this.waterY + 0.01, this.bobberPos.z);
      ring.scale.set(scale, 1, scale);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1.0 - rTime) * (this.isBiting ? 0.85 : 0.45);
    });

    // 5. Update Line Connection
    this.rodTipPos.set(0.35, 0.6, -1.5).applyEuler(cameraRig.camera.rotation).add(cameraRig.camera.position);
    const linePos = this.lineMesh.geometry.attributes.position;
    linePos.setXYZ(0, this.rodTipPos.x, this.rodTipPos.y, this.rodTipPos.z);
    linePos.setXYZ(1, this.bobberMesh.position.x, this.bobberMesh.position.y + 0.08, this.bobberMesh.position.z);
    linePos.needsUpdate = true;
  }

  public dispose() {
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
  }
}
