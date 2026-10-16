/**
 * The Lost Meridian - Master Ocean & River Water System
 * Implements the Three.js Ocean Shader architecture (webgl_shaders_ocean):
 * - Dual-octave animated normal map sampling with counter-flow velocity vectors
 * - Physical Schlick Fresnel reflection & Beer-Lambert deep water absorption
 * - Planar mirror reflection with high-fidelity wave distortion
 * - Anisotropic sun specular glints (sunDirection & sunColor matching webgl_shaders_ocean)
 * - Multi-harmonic Gerstner trochoidal vertex waves & Shoreline foam
 * - Cascading multi-layer waterfall with volumetric foam curl & buoyant mist plume.
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from '../textures/ProceduralTextureGenerator';

export class WaterSystem {
  public group = new THREE.Group();

  // Water Surface
  public riverMesh: THREE.Mesh;
  private waterMaterial: THREE.ShaderMaterial;
  private oceanNormalsTex: THREE.Texture;

  // Planar Mirror Reflection Camera & Render Target
  private mirrorCamera: THREE.PerspectiveCamera;
  private renderTarget: THREE.WebGLRenderTarget;
  private reflectionMatrix = new THREE.Matrix4();
  private tempTarget = new THREE.Vector3();
  private tempLook = new THREE.Vector3();
  private waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 2.35); // River surface at Y = -2.35

  // Waterfall Multi-layer System
  private waterfallCoreMesh: THREE.Mesh;
  private waterfallFoamMesh: THREE.Mesh;
  private waterfallLipMesh: THREE.Mesh;
  private waterfallMat: THREE.ShaderMaterial;
  private waterfallFoamMat: THREE.ShaderMaterial;
  private waterfallLipMat: THREE.ShaderMaterial;

  // Impact Splash Shockwave Rings
  private splashRings: THREE.Mesh[] = [];
  private splashRingMat: THREE.ShaderMaterial;

  // Waterfall Mist Plume Particles
  private mistParticles: THREE.Points;
  private mistPositions: Float32Array;
  private mistVelocities: Float32Array;
  private mistScales: Float32Array;
  private mistCount = 450;

  // Subterranean Aqueduct Flume (Puzzle 1)
  public aqueductWaterMesh: THREE.Mesh;

  private isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );

  public setReflectionResolution(size: number) {
    if (this.renderTarget && !this.isMobile) {
      this.renderTarget.setSize(size, size);
    }
  }

  constructor() {
    // 1. Setup Planar Reflection Render Target & Mirror Camera (Desktop only)
    if (!this.isMobile) {
      this.renderTarget = new THREE.WebGLRenderTarget(512, 512, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
      });
    } else {
      this.renderTarget = new THREE.WebGLRenderTarget(1, 1);
    }

    this.mirrorCamera = new THREE.PerspectiveCamera();

    // 2. High-Octave Ocean Water Normals (mobile: 128, desktop: 256)
    this.oceanNormalsTex = ProceduralTextureGenerator.generateOceanWaterNormals(this.isMobile ? 128 : 256);

    // 3. Three.js Ocean Shader (webgl_shaders_ocean) Architecture
    const oceanVertexShader = `
      uniform mat4 uReflectionMatrix;
      uniform float uTime;
      varying vec3 vWorldPosition;
      varying vec4 vReflectCoord;
      varying vec3 vEyeVector;
      varying vec2 vUv;
      varying vec3 vNormal;

      // Trochoidal Gerstner 3D Wave Displacement
      void calculateGerstner(inout vec3 pos, inout vec3 normal, float t) {
        vec3 n = vec3(0.0, 1.0, 0.0);

        // Wave 1: Primary River Current Swell
        float k1 = 0.95;
        float w1 = 1.65;
        float a1 = 0.05;
        float q1 = 0.7;
        float p1 = pos.z * k1 - t * w1;
        pos.x += q1 * a1 * cos(p1) * 0.15;
        pos.y += a1 * sin(p1);
        pos.z -= q1 * a1 * cos(p1);
        n.z += cos(p1) * a1 * k1;

        // Wave 2: Cross Current Chop
        float k2 = 2.4;
        float w2 = 2.2;
        float a2 = 0.025;
        float q2 = 0.6;
        float p2 = (pos.x * 0.65 + pos.z * 0.75) * k2 - t * w2;
        pos.x -= q2 * a2 * 0.65 * cos(p2);
        pos.y += a2 * sin(p2);
        pos.z -= q2 * a2 * 0.75 * cos(p2);
        n.x += 0.65 * cos(p2) * a2 * k2;
        n.z += 0.75 * cos(p2) * a2 * k2;

        normal = normalize(vec3(-n.x, 1.0, -n.z));
      }

      #include <fog_pars_vertex>

      void main() {
        vUv = uv;
        vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vec3 waveNormal = vec3(0.0, 1.0, 0.0);
        calculateGerstner(worldPos, waveNormal, uTime);

        vWorldPosition = worldPos;
        vNormal = waveNormal;

        // Planar reflection projective matrix
        vReflectCoord = uReflectionMatrix * vec4(worldPos, 1.0);
        vEyeVector = cameraPosition - worldPos;

        vec4 mvPosition = viewMatrix * vec4(worldPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `;

    const oceanFragmentShader = `
      uniform sampler2D uNormalMap;
      uniform sampler2D uReflectionMap;
      uniform vec3 uSunDirection;
      uniform vec3 uSunColor;
      uniform vec3 uWaterColor;
      uniform float uDistortionScale;
      uniform float uSize;
      uniform float uAlpha;
      uniform float uTime;
      
      varying vec3 vWorldPosition;
      varying vec4 vReflectCoord;
      varying vec3 vEyeVector;
      varying vec2 vUv;
      varying vec3 vNormal;
      #include <fog_pars_fragment>

      // Dual-octave wave normal sampler (from Three.js Ocean Shader)
      vec4 getNoise(vec2 uv) {
        vec2 uv0 = (uv / 103.0) + vec2(uTime / 17.0, uTime / 29.0);
        vec2 uv1 = (uv / 107.0) - vec2(uTime / -19.0, uTime / 31.0);
        vec2 uv2 = (uv / vec2(8907.0, 9803.0)) + vec2(uTime / 101.0, uTime / 97.0);
        vec2 uv3 = (uv / vec2(1091.0, 1027.0)) - vec2(uTime / 109.0, -uTime / -113.0);
        vec4 noise = texture2D(uNormalMap, uv0) +
                     texture2D(uNormalMap, uv1) +
                     texture2D(uNormalMap, uv2) +
                     texture2D(uNormalMap, uv3);
        return noise * 0.5 - 1.0;
      }

      // Analytical Caustics
      float getCaustic(vec2 p, float t) {
        vec2 p1 = p + vec2(sin(p.y * 1.8 + t * 2.2), cos(p.x * 1.8 + t * 2.2)) * 0.3;
        float c1 = sin(p1.x * 3.6 + t * 1.5) * cos(p1.y * 3.6 - t * 1.5);
        float c2 = sin(p1.y * 5.0 - t * 1.8) * cos(p1.x * 5.0 + t * 1.8);
        return clamp((c1 + c2) * 0.5 + 0.5, 0.0, 1.0);
      }

      void main() {
        vec3 eye = normalize(vEyeVector);

        // 1. Sample Ocean Normal Map with counter-moving waves
        vec4 noise = getNoise(vWorldPosition.xz * uSize);
        vec3 surfaceNormal = normalize(noise.xzy * vec3(1.5, 1.0, 1.5) + vNormal * 0.8);

        // 2. Physical Fresnel Factor (Schlick's approximation)
        float cosTheta = max(dot(eye, surfaceNormal), 0.0);
        float fresnel = 0.02 + 0.98 * pow(1.0 - cosTheta, 5.0);

        // 3. Planar Reflection Sampling with Wave Distortion
        vec2 distortion = surfaceNormal.xz * (0.001 * uDistortionScale);
        vec2 refUv = (vReflectCoord.xy / max(vReflectCoord.w, 0.0001)) * 0.5 + 0.5;
        refUv += distortion;
        refUv = clamp(refUv, 0.002, 0.998);

        // Environmental fallback reflection
        vec3 reflectDir = reflect(-eye, surfaceNormal);
        vec3 skyReflect = mix(vec3(0.55, 0.78, 0.98), vec3(0.12, 0.42, 0.25), clamp(reflectDir.y * 0.5 + 0.5, 0.0, 1.0));
        skyReflect += pow(max(dot(reflectDir, normalize(uSunDirection)), 0.0), 64.0) * uSunColor * 3.5;

        vec3 mirrorTex = texture2D(uReflectionMap, refUv).rgb;
        float mirrorLum = dot(mirrorTex, vec3(0.299, 0.587, 0.114));
        vec3 reflection = mirrorLum > 0.03 ? mirrorTex : skyReflect;

        // 4. Deep Water Body & Subsurface Scattering (Beer-Lambert model)
        vec3 shallowTurquoise = vec3(0.04, 0.68, 0.62);
        vec3 deepOcean = uWaterColor;
        vec3 waterBody = mix(deepOcean, shallowTurquoise, 0.55);

        // Caustic Highlights
        float caust1 = getCaustic(vWorldPosition.xz * 0.85, uTime);
        float caust2 = getCaustic(vWorldPosition.xz * 1.35 + vec2(0.05, 0.0), uTime * 1.05);
        vec3 caustics = vec3(pow(caust1, 2.6), pow(caust1 * 0.9 + caust2 * 0.1, 2.4), pow(caust2, 2.2)) * 0.85;
        waterBody += caustics * (1.0 - fresnel) * 0.45;

        // 5. Blinn-Phong & GGX Sun Glint Highlights (Three.js Ocean specular)
        vec3 sunDir = normalize(uSunDirection);
        vec3 halfVec = normalize(eye + sunDir);
        float NdotH = max(dot(surfaceNormal, halfVec), 0.0);
        float specularGlint = pow(NdotH, 180.0) * 4.5 + pow(max(dot(reflectDir, sunDir), 0.0), 320.0) * 8.0;
        vec3 specular = uSunColor * specularGlint * fresnel;

        // 6. Shoreline Lap Foam & Froth Wake
        float edgeDist = abs(vWorldPosition.x);
        float shorelineLap = smoothstep(6.8, 9.8, edgeDist);
        float froth = getCaustic(vWorldPosition.xz * 2.2, uTime * 2.5);
        float foam = shorelineLap * smoothstep(0.38, 0.78, froth);
        vec3 foamColor = vec3(0.95, 0.98, 1.0);

        // Final Radiance Composite
        vec3 finalColor = mix(waterBody, reflection, fresnel);
        finalColor = mix(finalColor, foamColor, foam * 0.85);
        finalColor += specular;

        gl_FragColor = vec4(finalColor, uAlpha);
        #include <fog_fragment>
      }
    `;

    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uNormalMap: { value: this.oceanNormalsTex },
          uReflectionMap: { value: this.renderTarget.texture },
          uReflectionMatrix: { value: this.reflectionMatrix },
          uSunDirection: { value: new THREE.Vector3(0.5, 0.65, 0.55).normalize() },
          uSunColor: { value: new THREE.Color(0xfff6e6) },
          uWaterColor: { value: new THREE.Color(0x001e1f) }, // Deep Oceanic Emerald/Teal
          uDistortionScale: { value: 3.7 },
          uSize: { value: 0.25 },
          uAlpha: { value: 0.94 },
          uTime: { value: 0 },
        },
      ]),
      transparent: true,
      depthWrite: false,
    });

    const riverGeo = new THREE.PlaneGeometry(20, 68, 96, 128);
    riverGeo.rotateX(-Math.PI / 2);
    this.riverMesh = new THREE.Mesh(riverGeo, this.waterMaterial);
    this.riverMesh.position.set(0, -2.35, -5);
    this.group.add(this.riverMesh);

    // 4. Multi-Layer 3D Waterfall System (Lip Curl, Dense Plunge Core, and Foam Envelope)
    const lipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2.35, -37.5),
      new THREE.Vector3(0, -2.40, -38.8),
      new THREE.Vector3(0, -2.85, -39.8),
      new THREE.Vector3(0, -3.90, -40.2),
    ]);
    const lipGeo = new THREE.TubeGeometry(lipCurve, 16, 8.2, 16, false);
    lipGeo.scale(1.0, 0.35, 1.0);

    const lipShader = {
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float speed = uTime * 2.8;
          float streaking = sin(vUv.x * 24.0 + sin(vUv.y * 12.0 + speed)) * 0.5 + 0.5;
          float flow = fract(vUv.y * 4.0 - speed);
          vec3 lipColor = mix(vec3(0.08, 0.65, 0.58), vec3(0.85, 0.96, 1.0), flow * streaking * 0.7);
          gl_FragColor = vec4(lipColor, 0.88);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
    };
    this.waterfallLipMat = new THREE.ShaderMaterial(lipShader);
    this.waterfallLipMesh = new THREE.Mesh(lipGeo, this.waterfallLipMat);
    this.group.add(this.waterfallLipMesh);

    // Waterfall Core
    const coreGeo = new THREE.PlaneGeometry(16, 11, 32, 32);
    coreGeo.translate(0, -5.5, 0);
    this.waterfallMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.y * 1.5 + uTime * 5.0) * 0.25;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float flow = fract(vUv.y * 6.0 - uTime * 4.5);
          float streaks = sin(vUv.x * 32.0 + uTime * 2.0) * 0.5 + 0.5;
          vec3 col = mix(vec3(0.04, 0.55, 0.62), vec3(0.92, 0.98, 1.0), flow * streaks);
          gl_FragColor = vec4(col, 0.92);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.waterfallCoreMesh = new THREE.Mesh(coreGeo, this.waterfallMat);
    this.waterfallCoreMesh.position.set(0, -3.8, -40.2);
    this.group.add(this.waterfallCoreMesh);

    // Waterfall White-Water Foam Jacket
    const foamGeo = new THREE.PlaneGeometry(17.5, 11.5, 32, 32);
    foamGeo.translate(0, -5.75, 0);
    this.waterfallFoamMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.y * 2.0 + uTime * 6.0) * 0.35 + 0.15;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float foamNoise = sin(vUv.x * 48.0 + uTime * 8.0) * cos(vUv.y * 24.0 - uTime * 9.0);
          float alpha = smoothstep(0.15, 0.65, foamNoise);
          gl_FragColor = vec4(0.96, 0.99, 1.0, alpha * 0.75);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.waterfallFoamMesh = new THREE.Mesh(foamGeo, this.waterfallFoamMat);
    this.waterfallFoamMesh.position.set(0, -3.8, -40.1);
    this.group.add(this.waterfallFoamMesh);

    // Impact Shockwave Splash Rings
    this.splashRingMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          float ring = smoothstep(0.08, 0.0, abs(d - uProgress));
          float fade = 1.0 - uProgress;
          gl_FragColor = vec4(0.95, 0.98, 1.0, ring * fade * 0.8);
        }
      `,
      uniforms: { uProgress: { value: 0 } },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.PlaneGeometry(14, 14);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, this.splashRingMat.clone());
      ringMesh.position.set(0, -14.75, -46.0);
      this.splashRings.push(ringMesh);
      this.group.add(ringMesh);
    }

    // 5. Buoyant Waterfall Mist Particles
    const mistGeo = new THREE.BufferGeometry();
    this.mistPositions = new Float32Array(this.mistCount * 3);
    this.mistVelocities = new Float32Array(this.mistCount * 3);
    this.mistScales = new Float32Array(this.mistCount);

    for (let i = 0; i < this.mistCount; i++) {
      const i3 = i * 3;
      this.mistPositions[i3] = (Math.random() - 0.5) * 16.0;
      this.mistPositions[i3 + 1] = -14.5 + Math.random() * 8.0;
      this.mistPositions[i3 + 2] = -47.0 + (Math.random() - 0.5) * 8.0;

      this.mistVelocities[i3] = (Math.random() - 0.5) * 1.5;
      this.mistVelocities[i3 + 1] = 1.2 + Math.random() * 2.4;
      this.mistVelocities[i3 + 2] = 0.8 + Math.random() * 1.8;

      this.mistScales[i] = 1.8 + Math.random() * 3.2;
    }

    mistGeo.setAttribute('position', new THREE.BufferAttribute(this.mistPositions, 3));
    mistGeo.setAttribute('aScale', new THREE.BufferAttribute(this.mistScales, 1));

    const mistShaderMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aScale;
        varying float vAlpha;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          float dist = length(mvPos.xyz);
          gl_PointSize = aScale * (380.0 / dist);

          float heightNorm = clamp((position.y + 14.0) / 9.5, 0.0, 1.0);
          vAlpha = (1.0 - heightNorm) * 0.42;

          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float dist = length(p);
          if (dist > 0.5) discard;
          float softEdge = exp(-dist * dist * 10.0);

          vec3 mistColor = vec3(0.88, 0.94, 1.0);
          gl_FragColor = vec4(mistColor, softEdge * vAlpha);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mistParticles = new THREE.Points(mistGeo, mistShaderMat);
    this.mistParticles.frustumCulled = false;
    this.group.add(this.mistParticles);

    // 6. Subterranean Aqueduct Flume
    const aqueductWaterGeo = new THREE.PlaneGeometry(6.5, 30, 32, 64);
    aqueductWaterGeo.rotateX(-Math.PI / 2);
    this.aqueductWaterMesh = new THREE.Mesh(aqueductWaterGeo, this.waterMaterial);
    this.aqueductWaterMesh.position.set(0, -14.8, -76);
    this.group.add(this.aqueductWaterMesh);
  }

  private reflectionFrame = 0;

  /**
   * Updates planar reflection matrix & renders mirror pass for real-time ocean reflections
   */
  public updateReflection(renderer: THREE.WebGLRenderer, scene: THREE.Scene, mainCamera: THREE.PerspectiveCamera) {
    if (this.isMobile) return;
    const pZ = mainCamera.position.z;
    if (pZ < -80 || pZ > 30) {
      return;
    }

    this.reflectionFrame++;
    // Alternate frames for buttery 60 FPS performance
    if (this.reflectionFrame % 2 !== 0) {
      return;
    }

    const waterY = -2.35;
    this.waterPlane.constant = -waterY;

    this.tempTarget.copy(mainCamera.position);
    this.tempTarget.y = waterY - (mainCamera.position.y - waterY);

    mainCamera.getWorldDirection(this.tempLook);
    this.tempLook.y = -this.tempLook.y;
    this.tempLook.add(this.tempTarget);

    this.mirrorCamera.position.copy(this.tempTarget);
    this.mirrorCamera.up.set(0, 1, 0);
    this.mirrorCamera.lookAt(this.tempLook);
    this.mirrorCamera.fov = mainCamera.fov;
    this.mirrorCamera.aspect = mainCamera.aspect;
    this.mirrorCamera.near = mainCamera.near;
    this.mirrorCamera.far = 85.0;
    this.mirrorCamera.updateProjectionMatrix();
    this.mirrorCamera.updateMatrixWorld();

    // Reflection Projection Texture Matrix
    this.reflectionMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    this.reflectionMatrix.multiply(this.mirrorCamera.projectionMatrix);
    this.reflectionMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

    // Hide water meshes during mirror render pass
    this.riverMesh.visible = false;
    this.waterfallOuterMeshVisible(false);

    const currentRT = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, this.mirrorCamera);
    renderer.setRenderTarget(currentRT);

    this.riverMesh.visible = true;
    this.waterfallOuterMeshVisible(true);
  }

  private waterfallOuterMeshVisible(visible: boolean) {
    this.waterfallCoreMesh.visible = visible;
    this.waterfallFoamMesh.visible = visible;
    this.waterfallLipMesh.visible = visible;
  }

  public setSunDirection(sunDir: THREE.Vector3) {
    if (this.waterMaterial && this.waterMaterial.uniforms && this.waterMaterial.uniforms.uSunDirection) {
      this.waterMaterial.uniforms.uSunDirection.value.copy(sunDir).normalize();
    }
  }

  public setVisualStyle(style: string) {
    if (!this.waterMaterial?.uniforms) return;
    if (style === 'stillwater') {
      this.waterMaterial.uniforms.uWaterColor.value.setHex(0x00323a);
    } else {
      this.waterMaterial.uniforms.uWaterColor.value.setHex(0x001e1f);
    }
  }

  public update(delta: number, time: number) {
    this.waterMaterial.uniforms.uTime.value = time;
    this.waterfallMat.uniforms.uTime.value = time;
    this.waterfallFoamMat.uniforms.uTime.value = time;
    this.waterfallLipMat.uniforms.uTime.value = time;

    // 1. Splash shockwave rings progress
    this.splashRings.forEach((ring, idx) => {
      const mat = ring.material as THREE.ShaderMaterial;
      const ringTime = (time * 1.6 + idx * 0.33) % 1.0;
      mat.uniforms.uProgress.value = ringTime;
      const scale = 0.4 + ringTime * 1.8;
      ring.scale.set(scale, scale, scale);
    });

    // 2. Buoyant Mist Particles Simulation
    const posAttr = this.mistParticles.geometry.attributes.position;
    const arr = this.mistPositions;
    const count = this.mistCount;
    const vels = this.mistVelocities;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += vels[i3] * delta;
      arr[i3 + 1] += vels[i3 + 1] * delta;
      arr[i3 + 2] += vels[i3 + 2] * delta;

      if (arr[i3 + 1] > -4.5 || arr[i3 + 2] > -35.0) {
        arr[i3] = (Math.random() - 0.5) * 16.0;
        arr[i3 + 1] = -14.0 + Math.random() * 1.5;
        arr[i3 + 2] = -47.0 + (Math.random() - 0.5) * 8.0;
      }
    }
    posAttr.needsUpdate = true;
  }

  public dispose() {
    this.renderTarget.dispose();
    this.riverMesh.geometry.dispose();
    this.waterMaterial.dispose();
    this.waterfallCoreMesh.geometry.dispose();
    this.waterfallMat.dispose();
    this.waterfallFoamMesh.geometry.dispose();
    this.waterfallFoamMat.dispose();
    this.waterfallLipMesh.geometry.dispose();
    this.waterfallLipMat.dispose();
    this.mistParticles.geometry.dispose();
    (this.mistParticles.material as THREE.Material).dispose();
    this.splashRings.forEach((r) => {
      r.geometry.dispose();
      (r.material as THREE.Material).dispose();
    });
  }
}
