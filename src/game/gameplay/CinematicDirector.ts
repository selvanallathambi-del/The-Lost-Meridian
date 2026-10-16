/**
 * The Lost Meridian - Cinematic Director
 * Orchestrates cutscenes, camera sweeps, vision sequences, and the Meridian Awakening Climax.
 */

import * as THREE from 'three';
import { CameraRig } from '../engine/CameraRig';
import { QuestManager } from './QuestManager';
import { QuestStage } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import { EnvironmentBuilder } from '../world/EnvironmentBuilder';

export class CinematicDirector {
  public isPlayingCinematic = false;
  public cinematicName = '';
  public letterboxAmount = 0;
  public visionFlashIntensity = 0; // 0 to 1 for Meridian celestial vision
  private currentOnComplete: (() => void) | null = null;

  constructor(
    private cameraRig: CameraRig,
    private questManager: QuestManager,
    private environment: EnvironmentBuilder
  ) {}

  public skipCinematic() {
    if (!this.isPlayingCinematic) return;
    this.isPlayingCinematic = false;
    this.letterboxAmount = 0;
    this.cameraRig.endCinematic();
    if (this.currentOnComplete) {
      const cb = this.currentOnComplete;
      this.currentOnComplete = null;
      cb();
    }
  }

  /**
   * 01. Opening Cinematic: Jungle Canopy Descend to Expedition Camp
   */
  public playOpeningCinematic(onComplete: () => void) {
    this.isPlayingCinematic = true;
    this.cinematicName = 'OPENING';
    this.letterboxAmount = 0;
    this.currentOnComplete = onComplete;

    audioEngine.setMusicMood('mystery');
    this.questManager.showSubtitle(
      'Deep inside the uncharted meridian basin... October 1928.',
      5.0
    );

    const startPos = new THREE.Vector3(0, 18.0, 95);
    const endPos = new THREE.Vector3(0, 3.2, 78);
    const startLook = new THREE.Vector3(0, 15.0, 50);
    const endLook = new THREE.Vector3(0, 2.5, 70);

    this.cameraRig.playCinematic(startPos, endPos, startLook, endLook, 6.5, () => {
      this.questManager.showSubtitle(
        "The Sterling Expedition went silent two weeks ago. Follow their trail.",
        4.5
      );
      this.letterboxAmount = 0.0;
      this.isPlayingCinematic = false;
      this.cameraRig.endCinematic();
      onComplete();
    });
  }

  /**
   * 02. Waterfall Reveal Cinematic
   */
  public playWaterfallReveal(onComplete: () => void) {
    this.isPlayingCinematic = true;
    this.cinematicName = 'WATERFALL_REVEAL';
    this.letterboxAmount = 0;
    this.currentOnComplete = onComplete;

    audioEngine.setMusicMood('discovery');
    this.questManager.showSubtitle(
      'The Great Cascade... An ancient passage lies shrouded behind the water curtain.',
      5.0
    );

    const startPos = new THREE.Vector3(0, -10.0, -32);
    const endPos = new THREE.Vector3(0, -12.0, -42);
    const startLook = new THREE.Vector3(0, -8.0, -46);
    const endLook = new THREE.Vector3(0, -10.0, -46);

    this.cameraRig.playCinematic(startPos, endPos, startLook, endLook, 4.5, () => {
      this.letterboxAmount = 0.0;
      this.isPlayingCinematic = false;
      this.cameraRig.endCinematic();
      onComplete();
    });
  }

  /**
   * 03. Water Puzzle Solved Cinematic (Gate lowering)
   */
  public playWaterGateOpenCutscene(onComplete: () => void) {
    this.isPlayingCinematic = true;
    this.cinematicName = 'GATE_OPEN';
    this.letterboxAmount = 0;
    this.currentOnComplete = onComplete;

    this.questManager.showSubtitle(
      'The ancient flumes align. The subterranean portcullis recedes!',
      4.0
    );

    const startPos = new THREE.Vector3(0, -12.0, -84);
    const endPos = new THREE.Vector3(0, -12.5, -88);
    const startLook = new THREE.Vector3(0, -12.0, -92);
    const endLook = new THREE.Vector3(0, -13.5, -92);

    this.cameraRig.playCinematic(startPos, endPos, startLook, endLook, 3.8, () => {
      this.letterboxAmount = 0;
      this.isPlayingCinematic = false;
      this.cameraRig.endCinematic();
      onComplete();
    });
  }

  /**
   * 04. The Meridian Awakening Climax Sequence
   */
  public playMeridianActivationSequence(onComplete: () => void) {
    this.isPlayingCinematic = true;
    this.cinematicName = 'MERIDIAN_AWAKENING';
    this.letterboxAmount = 0;
    this.currentOnComplete = onComplete;

    audioEngine.setMusicMood('climax');
    audioEngine.playMeridianPulse();

    this.questManager.showSubtitle(
      'THE MERIDIAN CORE IS AWAKENING...',
      4.5
    );

    // Ignite runic floor channels to brilliant cyan
    this.environment.runicFloorChannels.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(0x38bdf8);
      mat.emissiveIntensity = 3.5;
    });

    // Dramatic camera orbits around the active Meridian Core
    const startPos = new THREE.Vector3(0, -22.0, -225);
    const endPos = new THREE.Vector3(12, -16.0, -235);
    const startLook = new THREE.Vector3(0, -18.0, -235);
    const endLook = new THREE.Vector3(0, -18.0, -235);

    this.cameraRig.playCinematic(startPos, endPos, startLook, endLook, 6.0, () => {
      // Celestial Vision Flash
      this.visionFlashIntensity = 1.0;
      this.questManager.showSubtitle(
        '“The Meridian is restored. The stars realign with the lost civilization...”',
        6.0
      );

      setTimeout(() => {
        this.questManager.advanceStage(
          QuestStage.CHAPTER_COMPLETE,
          'CHAPTER I COMPLETE: THE LOST MERIDIAN'
        );
        this.letterboxAmount = 0;
        this.isPlayingCinematic = false;
        onComplete();
      }, 5000);
    });
  }

  public update(delta: number) {
    // Fade vision flash
    if (this.visionFlashIntensity > 0) {
      this.visionFlashIntensity = Math.max(0, this.visionFlashIntensity - delta * 0.4);
    }
  }
}
