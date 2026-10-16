/**
 * The Lost Meridian - Dynamic Weather System
 * Manages rain particles, localized ground impact splashes, low-lying volumetric fog cloud patches,
 * wetness transitions, overcast lighting, and atmospheric fog interpolations.
 */

import * as THREE from 'three';
import { WeatherState, WeatherType } from '../types';

export class WeatherSystem {
  public group = new THREE.Group();

  public state: WeatherState = {
    current: 'CLEAR',
    rainIntensity: 0.0,
    cloudCover: 0.2,
    wetness: 0.1,
    fogDensity: 0.0035,
    windSpeed: 1.0,
  };

  // Particle Systems
  public rainParticles: THREE.Points;
  public splashParticles: THREE.Points;
  public fogParticles: THREE.Points;

  private static isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );

  // Rain Attributes
  private rainPositions: Float32Array;
  private rainVelocities: Float32Array;
  private rainCount = WeatherSystem.isMobile ? 120 : 400;

  // Localized Ground Rain Splash Attributes
  private splashPositions: Float32Array;
  private splashLifes: Float32Array;
  private splashCount = WeatherSystem.isMobile ? 50 : 180;

  // Localized Low-Lying Fog/Mist Patch Attributes
  private fogPositions: Float32Array;
  private fogPhases: Float32Array;
  private fogScales: Float32Array;
  private fogCount = WeatherSystem.isMobile ? 35 : 100;

  // Smooth Interpolation Targets for Scene Lighting & Fog
  public targetSunIntensity = 2.6;
  public targetAmbientIntensity = 0.55;
  public targetFogDensity = 0.0035;
  public targetFogColor = new THREE.Color(0x87ceeb);
  public currentFogColor = new THREE.Color(0x87ceeb);

  constructor() {
    // 1. Build Rain Streak Particle System
    const rainGeo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(this.rainCount * 3);
    this.rainVelocities = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 60;
      this.rainPositions[i * 3 + 1] = Math.random() * 35;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      this.rainVelocities[i] = 22 + Math.random() * 14;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    const rainMat = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 160.0 / max(1.0, -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          p.x *= 2.5; // Elongated raindrop streak
          float dist = length(p);
          if (dist > 0.5) discard;
          float soft = smoothstep(0.5, 0.0, dist);
          vec3 rainCol = vec3(0.88, 0.95, 1.0);
          gl_FragColor = vec4(rainCol, soft * uOpacity);
        }
      `,
      uniforms: {
        uOpacity: { value: 0.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.group.add(this.rainParticles);

    // 2. Build Localized Ground Impact Splash Particle System
    const splashGeo = new THREE.BufferGeometry();
    this.splashPositions = new Float32Array(this.splashCount * 3);
    this.splashLifes = new Float32Array(this.splashCount);

    for (let i = 0; i < this.splashCount; i++) {
      this.splashPositions[i * 3] = (Math.random() - 0.5) * 35;
      this.splashPositions[i * 3 + 1] = -1.2;
      this.splashPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      this.splashLifes[i] = Math.random();
    }

    splashGeo.setAttribute('position', new THREE.BufferAttribute(this.splashPositions, 3));

    const splashMat = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 48.0 / max(1.0, -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float dist = length(p);
          float ring = smoothstep(0.48, 0.38, dist) * smoothstep(0.18, 0.32, dist);
          gl_FragColor = vec4(0.85, 0.95, 1.0, ring * uIntensity * 0.65);
        }
      `,
      uniforms: {
        uIntensity: { value: 0.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.splashParticles = new THREE.Points(splashGeo, splashMat);
    this.splashParticles.visible = false;
    this.group.add(this.splashParticles);

    // 3. Build Localized Low-Lying Volumetric Fog Cloud Patch Particle System
    const fogGeo = new THREE.BufferGeometry();
    this.fogPositions = new Float32Array(this.fogCount * 3);
    this.fogPhases = new Float32Array(this.fogCount);
    this.fogScales = new Float32Array(this.fogCount);

    for (let i = 0; i < this.fogCount; i++) {
      this.fogPositions[i * 3] = (Math.random() - 0.5) * 70;
      this.fogPositions[i * 3 + 1] = -1.0 + Math.random() * 5.0; // Low to ground
      this.fogPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      this.fogPhases[i] = Math.random() * Math.PI * 2;
      this.fogScales[i] = 12.0 + Math.random() * 18.0;
    }

    fogGeo.setAttribute('position', new THREE.BufferAttribute(this.fogPositions, 3));

    const fogMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        void main() {
          vec3 pos = position;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 450.0 / max(1.0, -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uDensity;
        uniform vec3 uColor;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float dist = length(p);
          if (dist > 0.5) discard;
          // Smooth Gaussian dropoff
          float alpha = exp(-dist * dist * 10.0) * uDensity;
          gl_FragColor = vec4(uColor, alpha * 0.48);
        }
      `,
      uniforms: {
        uDensity: { value: 0.0 },
        uColor: { value: new THREE.Color(0x627585) },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.fogParticles = new THREE.Points(fogGeo, fogMat);
    this.fogParticles.visible = false;
    this.group.add(this.fogParticles);
  }

  /**
   * Toggles smoothly between CLEAR, FOG, and RAIN modes
   */
  public toggleWeatherMode(): WeatherType {
    if (this.state.current === 'CLEAR') {
      this.setWeather('FOG');
    } else if (this.state.current === 'FOG') {
      this.setWeather('RAIN');
    } else {
      this.setWeather('CLEAR');
    }
    return this.state.current;
  }

  public setWeather(type: WeatherType) {
    this.state.current = type;
    switch (type) {
      case 'CLEAR':
        this.state.rainIntensity = 0.0;
        this.state.cloudCover = 0.1;
        this.targetFogDensity = 0.003;
        this.targetSunIntensity = 3.2;
        this.targetAmbientIntensity = 0.65;
        this.targetFogColor.setHex(0x87ceeb);
        break;
      case 'FOG':
      case 'HUMID_OVERCAST':
        this.state.rainIntensity = 0.0;
        this.state.cloudCover = 0.75;
        this.targetFogDensity = 0.038; // Thick atmospheric fog
        this.targetSunIntensity = 1.1; // Low dimmed sunlight
        this.targetAmbientIntensity = 0.32; // Cool moody shadow ambient
        this.targetFogColor.setHex(0x5e7282); // Misty cool blue-gray
        break;
      case 'RAIN':
      case 'LIGHT_RAIN':
        this.state.rainIntensity = 0.55;
        this.state.cloudCover = 0.85;
        this.targetFogDensity = 0.016;
        this.targetSunIntensity = 1.4;
        this.targetAmbientIntensity = 0.42;
        this.targetFogColor.setHex(0x4a5763);
        break;
      case 'HEAVY_RAIN':
        this.state.rainIntensity = 1.0;
        this.state.cloudCover = 0.98;
        this.targetFogDensity = 0.024;
        this.targetSunIntensity = 0.8;
        this.targetAmbientIntensity = 0.28;
        this.targetFogColor.setHex(0x323c46);
        break;
      case 'CLEARING':
        this.state.rainIntensity = 0.1;
        this.state.cloudCover = 0.3;
        this.targetFogDensity = 0.006;
        this.targetSunIntensity = 2.4;
        this.targetAmbientIntensity = 0.55;
        this.targetFogColor.setHex(0x80b0d0);
        break;
      case 'DESERT':
        this.state.rainIntensity = 0.0;
        this.state.cloudCover = 0.05;
        this.targetFogDensity = 0.005;
        this.targetSunIntensity = 4.2;
        this.targetAmbientIntensity = 0.75;
        this.targetFogColor.setHex(0xe8c582);
        break;
    }
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    scene?: THREE.Scene,
    sunLight?: THREE.DirectionalLight,
    ambientLight?: THREE.AmbientLight,
    hemiLight?: THREE.HemisphereLight
  ) {
    // 1. Dynamic surface wetness transition
    const targetWetness = this.state.rainIntensity > 0.2 ? 0.85 : 0.15;
    this.state.wetness += (targetWetness - this.state.wetness) * Math.min(1, delta * 0.15);

    // 2. Smooth Ambient, Sun Lighting & Scene Fog Interpolations
    if (sunLight) {
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, this.targetSunIntensity, delta * 1.5);
    }
    if (ambientLight) {
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, this.targetAmbientIntensity, delta * 1.5);
    }
    if (scene && scene.fog && (scene.fog as THREE.FogExp2).isFogExp2) {
      const fog = scene.fog as THREE.FogExp2;
      fog.density = THREE.MathUtils.lerp(fog.density, this.targetFogDensity, delta * 1.2);
      this.currentFogColor.lerp(this.targetFogColor, delta * 1.2);
      fog.color.copy(this.currentFogColor);
      if (scene.background && (scene.background as THREE.Color).isColor) {
        (scene.background as THREE.Color).lerp(this.currentFogColor, delta * 1.2);
      }
    }

    // 3. Update Rain Particle Streaks
    const isRaining = this.state.rainIntensity > 0.02;
    this.rainParticles.visible = isRaining;
    const rainMat = this.rainParticles.material as THREE.ShaderMaterial;
    if (rainMat.uniforms?.uOpacity) {
      rainMat.uniforms.uOpacity.value = this.state.rainIntensity * 0.7;
    }

    if (isRaining) {
      const posAttr = this.rainParticles.geometry.attributes.position;
      const arr = this.rainPositions;
      const count = this.rainCount;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        arr[i3 + 1] -= this.rainVelocities[i] * delta;

        if (arr[i3 + 1] < playerPos.y - 2.0) {
          arr[i3 + 1] = playerPos.y + 20.0 + Math.random() * 10.0;
          arr[i3] = playerPos.x + (Math.random() - 0.5) * 45.0;
          arr[i3 + 2] = playerPos.z + (Math.random() - 0.5) * 45.0;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 4. Update Localized Ground Rain Splash Particles
    this.splashParticles.visible = isRaining;
    if (isRaining) {
      const splashMat = this.splashParticles.material as THREE.ShaderMaterial;
      if (splashMat.uniforms?.uIntensity) {
        splashMat.uniforms.uIntensity.value = this.state.rainIntensity;
      }

      const sPosAttr = this.splashParticles.geometry.attributes.position;
      const sArr = this.splashPositions;
      const sCount = this.splashCount;

      for (let i = 0; i < sCount; i++) {
        const i3 = i * 3;
        this.splashLifes[i] += delta * (2.0 + Math.random() * 2.0);
        if (this.splashLifes[i] >= 1.0) {
          this.splashLifes[i] = 0.0;
          sArr[i3] = playerPos.x + (Math.random() - 0.5) * 30.0;
          sArr[i3 + 2] = playerPos.z + (Math.random() - 0.5) * 30.0;
          sArr[i3 + 1] = playerPos.y - 1.2;
        }
      }
      sPosAttr.needsUpdate = true;
    }

    // 5. Update Localized Low-Lying Fog/Mist Patch Particles
    const isFoggy = this.targetFogDensity > 0.010 || this.state.rainIntensity > 0.05;
    this.fogParticles.visible = isFoggy;

    if (isFoggy) {
      const fogMat = this.fogParticles.material as THREE.ShaderMaterial;
      if (fogMat.uniforms?.uDensity) {
        const targetOpacity = this.targetFogDensity > 0.025 ? 0.85 : 0.42;
        fogMat.uniforms.uDensity.value = THREE.MathUtils.lerp(
          fogMat.uniforms.uDensity.value,
          targetOpacity,
          delta * 2.0
        );
      }
      if (fogMat.uniforms?.uColor) {
        fogMat.uniforms.uColor.value.copy(this.currentFogColor);
      }
      if (fogMat.uniforms?.uTime) {
        fogMat.uniforms.uTime.value += delta;
      }

      const fPosAttr = this.fogParticles.geometry.attributes.position;
      const fArr = this.fogPositions;
      const fCount = this.fogCount;

      for (let i = 0; i < fCount; i++) {
        const i3 = i * 3;
        // Float & drift over terrain
        fArr[i3] += Math.sin(fArr[i3 + 2] * 0.05) * delta * 0.8;
        fArr[i3 + 2] += delta * 0.5;

        if (Math.abs(fArr[i3] - playerPos.x) > 40.0) {
          fArr[i3] = playerPos.x + (Math.random() - 0.5) * 60.0;
        }
        if (Math.abs(fArr[i3 + 2] - playerPos.z) > 40.0) {
          fArr[i3 + 2] = playerPos.z + (Math.random() - 0.5) * 60.0;
        }
      }
      fPosAttr.needsUpdate = true;
    }
  }

  public dispose() {
    this.rainParticles.geometry.dispose();
    (this.rainParticles.material as THREE.Material).dispose();
    this.splashParticles.geometry.dispose();
    (this.splashParticles.material as THREE.Material).dispose();
    this.fogParticles.geometry.dispose();
    (this.fogParticles.material as THREE.Material).dispose();
  }
}
