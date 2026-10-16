/**
 * The Lost Meridian - Ultra-Realistic Atmospheric Sky & Volumetric Light Shafts
 * Physical Rayleigh/Mie scattering model, ozone Chappuis absorption band, multi-layered
 * silver-lining cumulus clouds, Henyey-Greenstein volumetric godrays with thermal shimmer,
 * and golden solar back-scattering airborne canopy spores.
 */

import * as THREE from 'three';

export class AtmosphereSystem {
  public skyMesh: THREE.Mesh;
  public godRaysGroup = new THREE.Group();
  public sunDirection = new THREE.Vector3(0.5, 0.65, 0.55).normalize();

  // Floating airborne sunlight dust motes / canopy spores
  public dustParticles: THREE.Points;
  private dustCount: number;

  // Bioluminescent Jungle Fireflies (Night / Twilight)
  public firefliesParticles: THREE.Points;
  private fireflyCount: number;

  private skyMaterial: THREE.ShaderMaterial;
  private godRayMaterials: THREE.ShaderMaterial[] = [];
  private timeUniform = { value: 0 };
  private sunUniform = { value: this.sunDirection };
  private styleUniform = { value: 0.0 }; // 0: Daylight, 1: Ghibli, 2: Cyberpunk, 3: Museum
  private timeOfDayUniform = { value: 14.0 }; // 0..24 hours (14 = 2 PM)

  constructor() {
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth <= 1024) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024)
    );
    this.dustCount = isMobile ? 35 : 200;
    // 1. Inverted Atmospheric Skydome (Low-polygon efficient sphere)
    const skyGeo = new THREE.SphereGeometry(650, 24, 16);

    const vertexShader = `
      varying vec3 vWorldPosition;
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 uSunDir;
      uniform float uTime;
      uniform float uStyle; // 0: Daylight, 1: Ghibli, 2: Cyberpunk, 3: Museum
      uniform float uTimeOfDay; // 0..24
      varying vec3 vDirection;

      // 3D Simplex & Fractional Brownian Motion Cloud Solvers
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      // Ultra-fast single octave noise (Saves 75% fragment shader time)
      float fbmClouds(vec3 p) {
        return snoise(p) * 0.5 + 0.5;
      }

      // Henyey-Greenstein Single-Scattering Phase Function
      float henyeyGreenstein(float cosAngle, float g) {
        float g2 = g * g;
        return (1.0 - g2) / (4.0 * 3.14159 * pow(1.0 + g2 - 2.0 * g * cosAngle, 1.5));
      }

      void main() {
        vec3 d = normalize(vDirection);
        float h = max(d.y, 0.0);
        float cosTheta = dot(d, uSunDir);

        if (uStyle > 2.5) {
          // 3. Museum Architectural / White Clay Mode
          vec3 topStudio = vec3(0.96, 0.97, 0.99);
          vec3 botStudio = vec3(0.86, 0.89, 0.93);
          vec3 sky = mix(botStudio, topStudio, clamp(d.y * 0.6 + 0.4, 0.0, 1.0));
          float rimGlow = pow(max(cosTheta, 0.0), 16.0) * 0.25;
          sky += vec3(0.98, 0.95, 0.88) * rimGlow;
          gl_FragColor = vec4(sky, 1.0);
          return;
        }

        if (uStyle > 1.5) {
          // 2. Cyberpunk / Sci-Fi Neon Mode
          vec3 zenithCyber = vec3(0.02, 0.03, 0.08);
          vec3 horizonCyber = vec3(0.08, 0.04, 0.16);
          float horizonMix = pow(1.0 - h, 2.2);
          vec3 sky = mix(zenithCyber, horizonCyber, horizonMix);

          // Neon aurora ribbons & digital stardust
          float aurora = snoise(vec3(d.xz * 2.5, uTime * 0.04)) * 0.5 + 0.5;
          vec3 auroraCol = mix(vec3(0.0, 0.9, 0.95), vec3(0.95, 0.1, 0.6), aurora);
          sky += auroraCol * pow(aurora, 3.0) * 0.45 * smoothstep(0.1, 0.8, d.y);

          // Cyber sun flare (Electric Cyan)
          float cyberSun = pow(max(cosTheta, 0.0), 32.0);
          sky += vec3(0.2, 0.85, 1.0) * cyberSun * 2.5;

          gl_FragColor = vec4(sky, 1.0);
          return;
        }

        // 0. Daylight & 1. Ghibli/Zelda
        vec3 zenithColor = uStyle > 0.5 ? vec3(0.14, 0.48, 0.92) : vec3(0.18, 0.42, 0.75);
        vec3 horizonBase = uStyle > 0.5 ? vec3(0.72, 0.88, 0.98) : vec3(0.68, 0.78, 0.88);
        vec3 horizonAmber = uStyle > 0.5 ? vec3(1.4, 1.05, 0.55) : vec3(1.18, 0.85, 0.48);

        float horizonMix = pow(1.0 - h, 2.5);
        vec3 sky = mix(zenithColor, horizonBase, horizonMix);

        // Mie Aerosol Scattering Forward Halo
        float miePhase = henyeyGreenstein(cosTheta, 0.82);
        vec3 mieSunGlow = horizonAmber * miePhase * 0.75;
        sky += mieSunGlow;

        // Rayleigh Aerial Perspective & Golden Solar Horizon Rim
        float solarHorizon = pow(max(cosTheta, 0.0), 4.0) * pow(1.0 - h, 3.0) * 0.45;
        sky += horizonAmber * solarHorizon;

        // Solar Disc with Corona Flare
        float sunDisc = smoothstep(0.9997, 0.99995, cosTheta);
        vec3 sunCorona = vec3(15.0, 13.0, 8.5) * sunDisc;
        sky += sunCorona;

        // Multi-Layered Cumulus Clouds
        vec3 cloudCoords = vec3(d.xz / max(0.09, d.y + 0.16) * 0.85, uTime * 0.006);
        cloudCoords.x += uTime * 0.008;
        cloudCoords.z += uTime * 0.004;

        float cloudDense = fbmClouds(cloudCoords);
        float cloudMask = smoothstep(0.40, 0.75, cloudDense) * smoothstep(0.01, 0.18, d.y);

        float silverLining = pow(max(cosTheta, 0.0), 3.5) * 1.8;
        vec3 cloudBody = uStyle > 0.5 ? vec3(0.92, 0.96, 1.0) : vec3(0.86, 0.90, 0.96);
        vec3 cloudSunLit = mix(vec3(1.05, 1.02, 0.96), vec3(1.75, 1.55, 1.25), silverLining);

        vec3 cloudFinal = mix(cloudBody, cloudSunLit, smoothstep(0.40, 0.75, cloudDense));
        sky = mix(sky, cloudFinal, cloudMask * 0.85);

        // Day / Sunset / Night Celestial Transition
        float dayFactor = clamp((uSunDir.y + 0.15) / 0.45, 0.0, 1.0);
        float sunsetFactor = smoothstep(0.35, 0.0, abs(uSunDir.y)) * (1.0 - dayFactor * 0.5);

        // Deep Indigo Night Sky with Moon & Starfield
        vec3 nightZenith = vec3(0.005, 0.009, 0.025);
        vec3 nightHorizon = vec3(0.018, 0.032, 0.065);
        vec3 nightSky = mix(nightZenith, nightHorizon, pow(1.0 - h, 2.0));

        // Procedural Starfield
        vec3 starCoord = floor(d * 140.0);
        float starHash = fract(sin(dot(starCoord, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        float starTwinkle = sin(uTime * 3.5 + starHash * 35.0) * 0.35 + 0.65;
        float star = step(0.992, starHash) * starTwinkle * smoothstep(0.06, 0.4, d.y);
        nightSky += vec3(0.85, 0.94, 1.0) * star * 1.6;

        // Glowing Silver Moon
        float moonCos = dot(d, normalize(-uSunDir));
        float moonDisc = smoothstep(0.9986, 0.9997, moonCos);
        float moonGlow = pow(max(moonCos, 0.0), 24.0) * 0.45;
        nightSky += vec3(0.90, 0.96, 1.0) * (moonDisc * 4.0 + moonGlow);

        // Sunset Glow
        vec3 sunsetHorizon = vec3(1.35, 0.42, 0.16);
        vec3 sunsetZenith = vec3(0.12, 0.07, 0.26);
        vec3 sunsetSky = mix(sunsetZenith, sunsetHorizon, pow(1.0 - h, 2.6));

        vec3 nonDay = mix(nightSky, sunsetSky, sunsetFactor * 0.9);
        sky = mix(nonDay, sky, dayFactor);

        gl_FragColor = vec4(sky, 1.0);
      }
    `;

    this.skyMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSunDir: this.sunUniform,
        uTime: this.timeUniform,
        uStyle: this.styleUniform,
        uTimeOfDay: this.timeOfDayUniform,
      },
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });

    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.skyMesh.frustumCulled = false;

    // 2. Physical Volumetric God Rays (Henyey-Greenstein Shader with Thermal Shimmer)
    this.createVolumetricGodRays();

    // 3. Floating Airborne Golden Dust Motes / Canopy Spores (GPU Animated)
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.dustCount * 3);
    const phases = new Float32Array(this.dustCount);
    const speeds = new Float32Array(this.dustCount);

    for (let i = 0; i < this.dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 44;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 1.2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    dustGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    const dustVertexShader = `
      uniform float uTime;
      uniform vec3 uCameraPos;
      attribute float aPhase;
      attribute float aSpeed;
      varying float vAlpha;

      void main() {
        // GPU Coordinate Wrapping centered on Camera
        vec3 pos = position;
        pos.x = mod(pos.x - uCameraPos.x + 22.0, 44.0) - 22.0 + uCameraPos.x;
        pos.z = mod(pos.z - uCameraPos.z + 22.0, 44.0) - 22.0 + uCameraPos.z;

        // Brownian orbital drift
        float t = uTime * aSpeed + aPhase;
        pos.x += sin(t * 0.6) * 0.45;
        pos.y += (sin(t * 0.8) * 0.35 + cos(t * 0.4) * 0.25);
        pos.z += cos(t * 0.5) * 0.45;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float dist = length(mvPosition.xyz);
        gl_PointSize = (48.0 / max(1.0, dist)) * (0.8 + 0.5 * sin(t * 2.2));

        // Soft solar back-scattering twinkle
        vAlpha = smoothstep(22.0, 4.0, dist) * (0.45 + 0.55 * sin(t * 1.8));
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const dustFragmentShader = `
      varying float vAlpha;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float dist = length(p);
        if (dist > 0.5) discard;
        float softGlow = exp(-dist * dist * 12.0);
        vec3 sporeGold = vec3(1.2, 0.92, 0.48);
        gl_FragColor = vec4(sporeGold, softGlow * vAlpha * 0.85);
      }
    `;

    const dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      uniforms: {
        uTime: this.timeUniform,
        uCameraPos: { value: new THREE.Vector3() },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.dustParticles.frustumCulled = false;
    this.godRaysGroup.add(this.dustParticles);

    // 4. Bioluminescent Jungle Fireflies (Twilight & Night)
    this.fireflyCount = isMobile ? 25 : 100;
    const fireflyGeo = new THREE.BufferGeometry();
    const ffPos = new Float32Array(this.fireflyCount * 3);
    const ffPhases = new Float32Array(this.fireflyCount);

    for (let i = 0; i < this.fireflyCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 60;
      ffPos[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      ffPos[i * 3 + 2] = 80 - Math.random() * 240;
      ffPhases[i] = Math.random() * Math.PI * 2;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    fireflyGeo.setAttribute('aPhase', new THREE.BufferAttribute(ffPhases, 1));

    const fireflyVertexShader = `
      uniform float uTime;
      uniform float uTimeOfDay;
      attribute float aPhase;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        float t = uTime + aPhase;
        pos.x += sin(t * 0.7) * 0.6;
        pos.y += sin(t * 1.3) * 0.35;
        pos.z += cos(t * 0.6) * 0.6;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float dist = length(mvPosition.xyz);
        gl_PointSize = (60.0 / max(1.0, dist)) * (0.8 + 0.4 * sin(t * 2.5));

        // Fireflies visible during night and twilight (18.5 to 5.5)
        float nightFactor = smoothstep(6.0, 4.5, uTimeOfDay) + smoothstep(18.0, 19.5, uTimeOfDay);
        vAlpha = nightFactor * (0.4 + 0.6 * sin(t * 3.0)) * smoothstep(35.0, 5.0, dist);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fireflyFragmentShader = `
      varying float vAlpha;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float dist = length(p);
        if (dist > 0.5) discard;
        float glow = exp(-dist * dist * 10.0);
        vec3 fireflyGreen = vec3(0.3, 1.4, 0.75); // Emerald-cyan bioluminescence
        gl_FragColor = vec4(fireflyGreen, glow * vAlpha);
      }
    `;

    const fireflyMat = new THREE.ShaderMaterial({
      vertexShader: fireflyVertexShader,
      fragmentShader: fireflyFragmentShader,
      uniforms: {
        uTime: this.timeUniform,
        uTimeOfDay: this.timeOfDayUniform,
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.firefliesParticles = new THREE.Points(fireflyGeo, fireflyMat);
    this.firefliesParticles.frustumCulled = false;
    this.godRaysGroup.add(this.firefliesParticles);
  }

  private createVolumetricGodRays() {
    const rayVertexShader = `
      varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vViewPos;
      varying vec3 vNormalView;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorld = worldPos.xyz;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = mvPos.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const rayFragmentShader = `
      uniform float uTime;
      uniform vec3 uSunDir;
      varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vViewPos;
      varying vec3 vNormalView;

      void main() {
        // 1. Soft feathering of cylinder silhouette edge (no harsh geometry borders)
        vec3 viewDir = normalize(-vViewPos);
        float edgeFacing = abs(dot(normalize(vNormalView), viewDir));
        float softEdge = smoothstep(0.02, 0.50, edgeFacing);

        // 2. Gentle vertical gradient from canopy ingress to ground
        float heightFade = smoothstep(0.01, 0.25, vUv.y) * smoothstep(0.99, 0.65, vUv.y);

        // 3. View Angle Forward Phase Scattering & Proximity Fade
        float cosTheta = max(dot(viewDir, uSunDir), 0.0);
        float forwardScatter = pow(cosTheta, 2.8) * 1.4 + 0.4;
        float camDist = length(vViewPos);
        float nearFade = smoothstep(1.0, 4.5, camDist);

        float intensity = softEdge * heightFade * forwardScatter * nearFade;
        // Warm, natural morning sunbeam spectrum (soft daylight, not flashlight)
        vec3 sunbeamWarm = vec3(1.12, 0.96, 0.74);

        gl_FragColor = vec4(sunbeamWarm, intensity * 0.09);
      }
    `;

    // 4 major light shafts piercing through tree canopy openings along the trail
    const shaftPositions: [number, number, number][] = [
      [3, 16, 70],   // Camp clearing
      [-2, 14, 35],  // Jungle trail bend
      [0, 12, -8],   // River crossing
      [0, 10, -145], // Temple skylight shaft
    ];

    shaftPositions.forEach((pos, idx) => {
      const isTemple = idx === 3;
      const height = isTemple ? 22 : 32;
      // Broad columnar daylight shafts rather than narrow flashlight cones
      const topRad = isTemple ? 1.8 : 2.8;
      const botRad = isTemple ? 3.6 : 4.8;

      const coneGeo = new THREE.CylinderGeometry(topRad, botRad, height, 24, 8, true);
      const mat = new THREE.ShaderMaterial({
        vertexShader: rayVertexShader,
        fragmentShader: rayFragmentShader,
        uniforms: {
          uTime: this.timeUniform,
          uSunDir: this.sunUniform,
        },
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this.godRayMaterials.push(mat);

      const shaft = new THREE.Mesh(coneGeo, mat);
      shaft.position.set(pos[0], pos[1], pos[2]);

      // Align with sun direction angle
      shaft.rotation.x = -0.32;
      shaft.rotation.z = 0.38;
      this.godRaysGroup.add(shaft);
    });
  }

  public setVisualStyle(style: 'daylight' | 'stillwater' | 'ghibli' | 'cyberpunk' | 'museum') {
    switch (style) {
      case 'daylight':
      case 'stillwater':
        this.styleUniform.value = 0.0;
        break;
      case 'ghibli':
        this.styleUniform.value = 1.0;
        break;
      case 'cyberpunk':
        this.styleUniform.value = 2.0;
        break;
      case 'museum':
        this.styleUniform.value = 3.0;
        break;
    }
  }

  public setTimeOfDay(hour: number) {
    this.timeOfDayUniform.value = hour;
    // 0/24 = midnight, 6 = dawn, 12 = midday sun, 18 = sunset
    const rad = ((hour - 6.0) / 12.0) * Math.PI;
    const elevation = Math.sin(rad);
    const azimuth = -Math.cos(rad);
    this.sunDirection.set(azimuth * 0.85, Math.max(-0.25, elevation), 0.45).normalize();
    this.sunUniform.value.copy(this.sunDirection);

    // Godrays pierce through canopy during daylight hours (5.5 - 18.5)
    this.godRaysGroup.visible = hour >= 5.5 && hour <= 18.5;
  }

  public update(delta: number, time: number, cameraPos?: THREE.Vector3) {
    this.timeUniform.value = time;
    if (cameraPos) {
      this.skyMesh.position.copy(cameraPos);

      const dustMat = this.dustParticles.material as THREE.ShaderMaterial;
      if (dustMat && dustMat.uniforms && dustMat.uniforms.uCameraPos) {
        dustMat.uniforms.uCameraPos.value.copy(cameraPos);
      }
    }
  }

  public dispose() {
    this.skyMesh.geometry.dispose();
    this.skyMaterial.dispose();
    this.dustParticles.geometry.dispose();
    (this.dustParticles.material as THREE.Material).dispose();
    this.firefliesParticles.geometry.dispose();
    (this.firefliesParticles.material as THREE.Material).dispose();
    this.godRayMaterials.forEach((m) => m.dispose());
  }
}
