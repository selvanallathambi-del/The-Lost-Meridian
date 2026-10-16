/**
 * The Lost Meridian - 1920s Copper Diving Apparatus & Cavern Submersion System
 * Hard-hat diving physics, air pressure regulator, and underwater lantern.
 */

import * as THREE from 'three';
import { audioEngine } from '../audio/AudioEngine';

export class DivingSystem {
  public isDiving = false;
  public depth = 0; // meters
  public airPressure = 105; // PSI
  public isLanternOn = true;

  private breathTimer = 0;
  private bubbleTimer = 0;
  public diverLight: THREE.SpotLight;

  constructor() {
    this.diverLight = new THREE.SpotLight(0x7dd3fc, 0, 15, Math.PI * 0.28, 0.4);
    this.diverLight.position.set(0, 1.5, 0);
  }

  public startDiving(startPos: THREE.Vector3) {
    this.isDiving = true;
    this.depth = 4.5;
    this.airPressure = 105;
    this.diverLight.intensity = 3.5;
    audioEngine.playDiverBreathing();
    audioEngine.playDiverBubbles();
  }

  public stopDiving() {
    this.isDiving = false;
    this.diverLight.intensity = 0;
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    if (!this.isDiving) return;

    // Calculate depth based on Y coordinate below water level (water level is Y = -3.8 in plunge pool)
    const waterSurfaceY = -3.8;
    this.depth = Math.max(0, Number((waterSurfaceY - playerPos.y).toFixed(1)));

    // Slow pressure fluctuation
    this.airPressure = Math.max(80, 105 - this.depth * 1.5);

    // Update diver lantern position
    this.diverLight.position.copy(playerPos);
    this.diverLight.position.y += 1.4;

    // Periodic underwater audio
    this.breathTimer += delta;
    if (this.breathTimer >= 4.2) {
      this.breathTimer = 0;
      audioEngine.playDiverBreathing();
    }

    this.bubbleTimer += delta;
    if (this.bubbleTimer >= 5.8) {
      this.bubbleTimer = 0;
      audioEngine.playDiverBubbles();
    }
  }
}
