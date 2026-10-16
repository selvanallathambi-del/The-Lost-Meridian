/**
 * The Lost Meridian - Master Photographic Post-Processing Pipeline
 * Advanced fullscreen shader pipeline featuring:
 * - Three.js Solar Lens Flare & Anamorphic Halos (webgl_lensflares)
 * - AgX / ACES Filmic Tone Mapping & High-Dynamic-Range curve
 * - Screen-Space Contact Crevice Ambient Occlusion (SSAO)
 * - Optical Focus & Circle of Confusion (Bokeh)
 * - Meridian Celestial Lens (Archaeological Spectral Vision)
 * - Dynamic Camera Lens Water Droplets & Mist Refraction
 * - 35mm Photochemical Film Grain & Radial Optical Vignette
 */

import * as THREE from 'three';

export class PostProcessingPass {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderTarget: THREE.WebGLRenderTarget;
  private quadMesh: THREE.Mesh;
  public material: THREE.ShaderMaterial;

  private currentFocusDistance = 18.0;
  private currentFocalRange = 14.0;
  private currentMaxBokeh = 0.007;
  private isArtifactFocused = 0.0;
  private lensModeActive = 0.0;
  private rainIntensity = 0.0;
  private sunWorldPos = new THREE.Vector3(45, 80, 50);
  private _scratchSunProj = new THREE.Vector3();

  private isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );

  constructor(width: number, height: number) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const rtWidth = Math.max(320, width);
    const rtHeight = Math.max(240, height);

    // Mobile uses safe 8-bit buffer without depthTexture to eliminate GPU stalls and driver timeouts
    if (this.isMobile) {
      this.renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        stencilBuffer: false,
      });
    } else {
      this.renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        stencilBuffer: false,
      });
      this.renderTarget.depthTexture = new THREE.DepthTexture(rtWidth, rtHeight);
    }

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Mobile-optimized lightweight shader (Single-pass AgX Filmic, Lens vision, vignette)
    const mobileFragmentShader = `
      uniform sampler2D tDiffuse;
      uniform float uLensMode;
      uniform float uRainIntensity;
      uniform float uTime;
      uniform float uVignette;
      uniform float uGrain;
      uniform float uExposure;
      uniform float uStyle;
      uniform vec3 uSunScreenPos;
      varying vec2 vUv;

      float hash21(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      vec3 AgXFilmic(vec3 val) {
        const mat3 agx_mat = mat3(
          0.842479, 0.042328, 0.042376,
          0.078434, 0.878469, 0.078434,
          0.079224, 0.079166, 0.879143
        );
        const mat3 agx_mat_inv = mat3(
          1.196879, -0.052897, -0.052972,
          -0.098021, 1.151903, -0.098043,
          -0.099030, -0.098961, 1.151074
        );
        vec3 col = max(val, vec3(1e-5));
        col = agx_mat * col;
        col = clamp(log2(col) * 0.064516 + 0.580645, 0.0, 1.0);
        col = col * col * (3.0 - 2.0 * col);
        col = col * col * (3.0 - 2.0 * col);
        col = agx_mat_inv * col;
        return clamp(col, 0.0, 1.0);
      }

      void main() {
        vec2 uv = clamp(vUv, 0.0001, 0.9999);
        vec3 color = texture2D(tDiffuse, uv).rgb;

        // Mobile solar flare corona when facing sun
        if (uSunScreenPos.z > 0.0) {
          float sunDist = length(uv - uSunScreenPos.xy);
          float sunVis = clamp(1.0 - length(uSunScreenPos.xy - 0.5) * 1.3, 0.0, 1.0);
          if (sunVis > 0.01 && sunDist < 0.4) {
            float flare = exp(-sunDist * 16.0) * 0.8 * sunVis;
            color += vec3(1.0, 0.92, 0.72) * flare;
          }
        }

        // Meridian Spectral Vision if activated
        if (uLensMode > 0.05) {
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          vec3 celestialTint = vec3(0.2, 0.85, 1.0) * lum * 1.5;
          color = mix(color, celestialTint, uLensMode * 0.7);
        }

        // Fast Film Grade Tone Mapping
        color = AgXFilmic(color * uExposure);

        // Visual Style Color Grading
        if (uStyle > 2.5) {
          // Museum Minimalist
          float mono = dot(color, vec3(0.299, 0.587, 0.114));
          color = vec3(mono * 0.96, mono * 0.98, mono * 1.02);
        } else if (uStyle > 1.5) {
          // Cyberpunk split toning
          vec3 shadowTeal = vec3(0.02, 0.18, 0.28);
          vec3 midMagenta = vec3(0.35, 0.08, 0.42);
          vec3 highlightGold = vec3(1.2, 0.95, 0.45);
          float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
          vec3 split = mix(shadowTeal, midMagenta, smoothstep(0.1, 0.5, lum));
          split = mix(split, highlightGold, smoothstep(0.5, 0.9, lum));
          color = mix(color, color * split * 2.2, 0.65);
        } else if (uStyle > 0.5) {
          // Vibrant Ghibli
          color.r = pow(color.r, 0.92) * 1.08;
          color.g = pow(color.g, 0.88) * 1.14;
          color.b = pow(color.b, 0.95) * 1.05;
        }

        // Radial Vignette
        vec2 d = uv - 0.5;
        float vig = clamp(1.0 - dot(d, d) * uVignette * 1.8, 0.0, 1.0);
        color *= vig;

        // Photochemical subtle grain
        float grain = (hash21(uv * 450.0 + fract(uTime * 3.0)) - 0.5) * uGrain;
        color += grain;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const fragmentShader = this.isMobile ? mobileFragmentShader : `
      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;
      uniform float uNear;
      uniform float uFar;
      uniform float uFocusDistance;
      uniform float uFocalRange;
      uniform float uMaxBokeh;
      uniform float uIsArtifactFocused;
      uniform float uLensMode; // 0.0: Normal, 1.0: Meridian Celestial Spectral Vision
      uniform float uRainIntensity; // 0.0 to 1.0: Lens water droplet condensation
      uniform vec3 uSunScreenPos; // Projected sun screen coords (x,y in [0,1], z>0 if in front of camera)
      uniform float uTime;
      uniform float uVignette;
      uniform float uGrain;
      uniform float uExposure;
      uniform float uStyle; // 0: Daylight, 1: Ghibli, 2: Cyberpunk, 3: Museum
      uniform vec2 uResolution;
      varying vec2 vUv;

      // High-Frequency Pseudo-Random Hash
      float hash21(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // Procedural Water Droplet Normal on Camera Lens
      vec2 getLensDroplet(vec2 uv, float t) {
        vec2 grid = fract(uv * vec2(16.0, 9.0)) - 0.5;
        vec2 id = floor(uv * vec2(16.0, 9.0));
        float n = hash21(id);

        if (n < 0.65) return vec2(0.0);

        float dropTime = t * 0.4 + n * 6.28;
        float ySlide = fract(dropTime) * 0.3;
        vec2 dropPos = vec2(sin(n * 10.0) * 0.25, -ySlide);
        float d = length(grid - dropPos);

        if (d < 0.22) {
          vec2 norm = normalize(grid - dropPos);
          float str = smoothstep(0.22, 0.0, d);
          return norm * str * 0.045;
        }
        return vec2(0.0);
      }

      // AgX Filmic Tone Mapping with High-Luminance Desaturation Rolloff (Prevents hue-twist on golden solar specular)
      vec3 AgXFilmic(vec3 val) {
        const mat3 agx_mat = mat3(
          0.842479, 0.042328, 0.042376,
          0.078434, 0.878469, 0.078434,
          0.079224, 0.079166, 0.879143
        );
        const mat3 agx_mat_inv = mat3(
          1.196879, -0.052897, -0.052972,
          -0.098021, 1.151903, -0.098043,
          -0.099030, -0.098961, 1.151074
        );
        vec3 col = max(val, vec3(1e-5));

        // High-Luminance Specular Desaturation Rolloff (QA DIV-06 Lead #521 Remediation)
        float peakLum = dot(col, vec3(0.2126, 0.7152, 0.0722));
        float desat = smoothstep(1.8, 6.5, peakLum);
        col = mix(col, vec3(peakLum), desat * 0.45);

        col = agx_mat * col;
        col = clamp(log2(col) * 0.064516 + 0.580645, 0.0, 1.0);
        col = col * col * (3.0 - 2.0 * col);
        col = col * col * (3.0 - 2.0 * col);
        col = agx_mat_inv * col;
        return clamp(col, 0.0, 1.0);
      }

      // Linear Depth Reconstruction with zero-division and numerical safety guards
      float getLinearDepth(vec2 coord) {
        float z_b = texture2D(tDepth, coord).r;
        float z_n = 2.0 * z_b - 1.0;
        float denom = uFar + uNear - z_n * (uFar - uNear);
        if (abs(denom) < 0.0001) return uFar;
        float lin = 2.0 * uNear * uFar / denom;
        return clamp(lin, 0.05, 1200.0);
      }

      // Interleaved Gradient Noise for artifact-free AO and contact shadow dithering
      float interleavedGradientNoise(vec2 screenPos) {
        vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
        return fract(magic.z * fract(dot(screenPos, magic.xy)));
      }

      // Multi-Radius Screen-Space Ambient Crevice Occlusion (SSAO)
      float getContactAO(vec2 coord, float centerDepth, vec2 screenPos) {
        if (centerDepth > 140.0) return 1.0;

        float occlusion = 0.0;
        vec2 texelSize = 1.0 / uResolution;
        float innerRadius = clamp(8.0 / max(centerDepth * 0.1, 1.0), 1.5, 9.0);
        float outerRadius = clamp(22.0 / max(centerDepth * 0.1, 1.0), 4.0, 24.0);
        float dither = interleavedGradientNoise(screenPos) * 6.283185;

        const int SAMPLES = 10;
        for (int i = 0; i < SAMPLES; i++) {
          float angle = float(i) * (6.283185 / float(SAMPLES)) + dither;
          vec2 dir = vec2(cos(angle), sin(angle));

          // Inner micro-crevices (foliage, stone pores, gravel)
          vec2 innerCoord = clamp(coord + dir * texelSize * innerRadius, 0.001, 0.999);
          float innerDepth = getLinearDepth(innerCoord);
          float diffInner = centerDepth - innerDepth;
          if (diffInner > 0.02 && diffInner < 1.8) {
            occlusion += (1.0 - smoothstep(0.02, 1.8, diffInner)) * 0.65;
          }

          // Outer architectural crevices (pillars, masonry seams, cliffs)
          vec2 outerCoord = clamp(coord + dir * texelSize * outerRadius, 0.001, 0.999);
          float outerDepth = getLinearDepth(outerCoord);
          float diffOuter = centerDepth - outerDepth;
          if (diffOuter > 0.05 && diffOuter < 3.5) {
            occlusion += (1.0 - smoothstep(0.05, 3.5, diffOuter)) * 0.35;
          }
        }
        return clamp(1.0 - (occlusion / float(SAMPLES)) * 0.82, 0.16, 1.0);
      }

      // Screen-Space Contact Shadows (SSCS) - UE5-grade raymarched micro-occlusion
      float getContactShadows(vec2 coord, float centerDepth, vec2 screenPos, vec3 sunScreenPos) {
        if (centerDepth > 85.0 || sunScreenPos.z <= -0.3) return 1.0;

        vec2 lightDir = sunScreenPos.xy - coord;
        float lightDist = length(lightDir);
        if (lightDist < 0.001) return 1.0;
        lightDir = normalize(lightDir);

        vec2 texelSize = 1.0 / uResolution;
        float maxRayLength = clamp(15.0 / max(centerDepth * 0.12, 1.0), 3.0, 22.0);
        float dither = interleavedGradientNoise(screenPos);

        const int STEPS = 8;
        float stepSize = maxRayLength / float(STEPS);
        float shadow = 1.0;

        for (int i = 1; i <= STEPS; i++) {
          float rayDist = (float(i) - 0.5 + dither * 0.5) * stepSize;
          vec2 sampleUv = coord + lightDir * texelSize * rayDist;
          if (sampleUv.x < 0.001 || sampleUv.x > 0.999 || sampleUv.y < 0.001 || sampleUv.y > 0.999) break;

          float sampleDepth = getLinearDepth(sampleUv);
          float depthDelta = centerDepth - sampleDepth;

          if (depthDelta > 0.035 && depthDelta < 0.85) {
            float falloff = 1.0 - smoothstep(0.035, 0.85, depthDelta);
            shadow = min(shadow, 1.0 - falloff * 0.68);
            break;
          }
        }
        return shadow;
      }

      void main() {
        vec2 uv = clamp(vUv, 0.0001, 0.9999);
        vec2 screenCoord = uv * uResolution;

        // 1. Water Droplets Refraction on Camera Lens
        if (uRainIntensity > 0.02) {
          vec2 dropDistort = getLensDroplet(uv, uTime) * uRainIntensity;
          uv = clamp(uv + dropDistort, 0.001, 0.999);
        }

        // 2. Optical 1928 Triplet Lens Chromatic Aberration Dispersion
        vec2 centerOffset = uv - 0.5;
        float edgeDist = dot(centerOffset, centerOffset);
        vec2 caShift = centerOffset * edgeDist * 0.012;
        float rCol = texture2D(tDiffuse, clamp(uv + caShift, 0.001, 0.999)).r;
        float gCol = texture2D(tDiffuse, uv).g;
        float bCol = texture2D(tDiffuse, clamp(uv - caShift, 0.001, 0.999)).b;
        vec3 color = vec3(rCol, gCol, bCol);
        float centerDepth = getLinearDepth(uv);

        // 3. Screen-Space Contact Ambient Occlusion & Contact Shadows (UE5 Lumen / SSCS counterpart with zero-cost sky early-out)
        float ao = 1.0;
        if (centerDepth <= 140.0) {
          ao = getContactAO(uv, centerDepth, screenCoord);
          float contactShadow = getContactShadows(uv, centerDepth, screenCoord, uSunScreenPos);
          color *= (ao * contactShadow);
        }

        // 4. Crisp Micro-Contrast Enhancement (Clamped without halo ringing)
        vec2 px = 1.0 / uResolution;
        vec3 colN = texture2D(tDiffuse, clamp(uv + vec2(0.0, px.y), 0.001, 0.999)).rgb;
        vec3 colS = texture2D(tDiffuse, clamp(uv - vec2(0.0, px.y), 0.001, 0.999)).rgb;
        vec3 colE = texture2D(tDiffuse, clamp(uv + vec2(px.x, 0.0), 0.001, 0.999)).rgb;
        vec3 colW = texture2D(tDiffuse, clamp(uv - vec2(px.x, 0.0), 0.001, 0.999)).rgb;
        vec3 localAvg = (colN + colS + colE + colW) * 0.25;
        vec3 detail = clamp(color - localAvg, -0.05, 0.05);
        color += detail * 0.12;

        // 4. Optical Focus Bokeh with Longitudinal Abbe Chromatic Fringe Dispersion (QA DIV-08 Lead #701 Remediation)
        if (uIsArtifactFocused > 0.05 && uMaxBokeh > 0.0005) {
          float coc = clamp(abs(centerDepth - uFocusDistance) / max(uFocalRange, 1.0), 0.0, 1.0) * uMaxBokeh * uIsArtifactFocused;
          if (coc > 0.0008) {
            vec3 bokehAccum = color;
            float weightAccum = 1.0;
            vec2 aspect = vec2(1.0, uResolution.x / uResolution.y);

            // 12-sample circular aperture disc with chromatic Abbe separation
            for (int k = 0; k < 12; k++) {
              float angle = float(k) * 0.523598; // 30 deg steps
              float rad = (float(k % 2) * 0.4 + 0.6) * coc;
              vec2 offset = vec2(cos(angle), sin(angle)) * rad * aspect;
              
              // Wavelength-dependent chromatic dispersion offset
              float rSample = texture2D(tDiffuse, clamp(uv + offset * 1.025, 0.001, 0.999)).r;
              float gSample = texture2D(tDiffuse, clamp(uv + offset, 0.001, 0.999)).g;
              float bSample = texture2D(tDiffuse, clamp(uv + offset * 0.975, 0.001, 0.999)).b;

              bokehAccum += vec3(rSample, gSample, bSample);
              weightAccum += 1.0;
            }
            color = bokehAccum / weightAccum;
          }
        }

        // 5. Cinematic HDR Specular Bloom & Optical Radiance (Thresholded Gaussian Bloom)
        vec3 bloomSamples = vec3(0.0);
        float bloomWeight = 0.0;
        vec2 bTexel = 2.4 / uResolution;
        for (int b = -2; b <= 2; b++) {
          for (int a = -2; a <= 2; a++) {
            vec2 bUv = clamp(uv + vec2(float(a), float(b)) * bTexel, 0.001, 0.999);
            vec3 sCol = texture2D(tDiffuse, bUv).rgb;
            float sLum = dot(sCol, vec3(0.299, 0.587, 0.114));
            if (sLum > 0.82) {
              float excess = sLum - 0.82;
              float w = exp(-float(a * a + b * b) * 0.32);
              bloomSamples += sCol * excess * w;
              bloomWeight += w;
            }
          }
        }
        if (bloomWeight > 0.0) {
          color += (bloomSamples / bloomWeight) * 0.45;
        }

        // 6. Three.js Optical Solar Lens Flare & Anamorphic Halos (webgl_lensflares)
        if (uSunScreenPos.z > 0.0) {
          vec2 sunUv = uSunScreenPos.xy;
          float sunDist = length(uv - sunUv);
          float sunVisibility = clamp(1.0 - length(sunUv - 0.5) * 1.3, 0.0, 1.0);

          if (sunVisibility > 0.01) {
            // Direct Sun Core Corona
            float sunCorona = exp(-sunDist * 14.0) * 1.6;
            vec3 flare = vec3(1.0, 0.92, 0.72) * sunCorona;

            // Anamorphic Horizontal Light Streak
            float streakY = abs(uv.y - sunUv.y);
            float streakX = abs(uv.x - sunUv.x);
            float streak = exp(-streakY * 95.0) * exp(-streakX * 1.8) * 0.35;
            flare += vec3(0.45, 0.85, 1.0) * streak;

            // Multi-Ring Chromatic Optical Ghost Discs
            vec2 toCenter = 0.5 - sunUv;
            for (int g = 1; g <= 4; g++) {
              float scale = float(g) * 0.42 - 0.55;
              vec2 gPos = 0.5 + toCenter * scale;
              float gDist = length(uv - gPos);
              float gSize = 0.025 * float(g);
              float gRing = smoothstep(gSize, 0.0, abs(gDist - gSize));
              vec3 gCol = (g == 1 || g == 3) ? vec3(0.2, 0.85, 0.95) : vec3(0.95, 0.65, 0.25);
              flare += gCol * gRing * 0.15;
            }

            color += flare * sunVisibility;
          }
        }

        // 6. Meridian Celestial Lens (Antique Astronomical Spectral Scanner)
        if (uLensMode > 0.01) {
          float centerDist = distance(uv, vec2(0.5));
          float ring1 = smoothstep(0.003, 0.0, abs(centerDist - 0.35));
          float ring2 = smoothstep(0.003, 0.0, abs(centerDist - 0.22));
          float crosshairX = smoothstep(0.0015, 0.0, abs(uv.x - 0.5)) * smoothstep(0.4, 0.0, centerDist);
          float crosshairY = smoothstep(0.0015, 0.0, abs(uv.y - 0.5)) * smoothstep(0.4, 0.0, centerDist);
          float reticle = ring1 + ring2 + crosshairX + crosshairY;

          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          vec3 spectralGlow = vec3(0.12, 0.85, 0.95) * pow(lum, 2.0) * 1.8;
          vec3 reticleColor = vec3(0.95, 0.82, 0.35) * reticle;

          color = mix(color, color * vec3(0.65, 0.88, 1.15) + spectralGlow + reticleColor, uLensMode);
        }

        // 7. Photographic Exposure & AgX Filmic Tone Mapping
        color *= uExposure;
        color = AgXFilmic(color);

        // 8. Visual Style Color Grading
        if (uStyle > 2.5) {
          float mono = dot(color, vec3(0.299, 0.587, 0.114));
          vec3 museumBase = vec3(mono * 0.96, mono * 0.98, mono * 1.02);
          float goldMask = smoothstep(0.4, 0.9, color.r) * smoothstep(0.3, 0.8, color.g) * (1.0 - smoothstep(0.4, 0.8, color.b));
          color = mix(museumBase, color * 1.15, clamp(goldMask * 1.8 + uIsArtifactFocused * 0.5, 0.0, 1.0));
        } else if (uStyle > 1.5) {
          vec3 shadowTeal = vec3(0.02, 0.18, 0.28);
          vec3 midMagenta = vec3(0.35, 0.08, 0.42);
          vec3 highlightGold = vec3(1.2, 0.95, 0.45);
          float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
          vec3 split = mix(shadowTeal, midMagenta, smoothstep(0.1, 0.5, lum));
          split = mix(split, highlightGold, smoothstep(0.5, 0.9, lum));
          color = mix(color, color * split * 2.2, 0.65);
        } else if (uStyle > 0.5) {
          color.r = pow(color.r, 0.92) * 1.08;
          color.g = pow(color.g, 0.88) * 1.14;
          color.b = pow(color.b, 0.95) * 1.05;
        }

        // 9. Optical Lens Vignette & Photochemical 35mm Grain
        float dist = distance(uv, vec2(0.5));
        float vignette = 1.0 - smoothstep(0.38, 0.92, dist) * uVignette;
        color *= vignette;

        float grain = (hash21(uv * 920.0 + fract(uTime * 5.0)) - 0.5) * uGrain;
        color += grain;

        // Defensive NaN/Inf suppression
        color = clamp(color, 0.0, 1.0);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: this.isMobile ? null : this.renderTarget.depthTexture },
        uNear: { value: 0.1 },
        uFar: { value: 1000.0 },
        uFocusDistance: { value: 18.0 },
        uFocalRange: { value: 14.0 },
        uMaxBokeh: { value: 0.007 },
        uIsArtifactFocused: { value: 0.0 },
        uLensMode: { value: 0.0 },
        uRainIntensity: { value: 0.0 },
        uSunScreenPos: { value: new THREE.Vector3(0.5, 0.5, 1.0) },
        uTime: { value: 0 },
        uVignette: { value: 0.15 },
        uGrain: { value: 0.02 },
        uExposure: { value: 1.0 },
        uStyle: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      depthWrite: false,
      depthTest: false,
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.quadMesh = new THREE.Mesh(quadGeo, this.material);
    this.scene.add(this.quadMesh);
  }

  public setLensMode(enabled: boolean) {
    this.lensModeActive = enabled ? 1.0 : 0.0;
  }

  public setRainIntensity(intensity: number) {
    this.rainIntensity = Math.min(1.0, Math.max(0.0, intensity));
  }

  public setSunPosition(pos: THREE.Vector3) {
    this.sunWorldPos.copy(pos);
  }

  public setFocalParams(focusDistance: number, focalRange = 14.0, maxBokeh = 0.007) {
    this.currentFocusDistance = focusDistance;
    this.currentFocalRange = focalRange;
    this.currentMaxBokeh = maxBokeh;
  }

  public setArtifactFocus(isFocused: boolean) {
    this.isArtifactFocused = isFocused ? 1.0 : 0.0;
  }

  public setVisualStyle(style: 'daylight' | 'stillwater' | 'ghibli' | 'cyberpunk' | 'museum') {
    let val = 0.0;
    if (style === 'stillwater') val = 0.8;
    else if (style === 'ghibli') val = 1.0;
    else if (style === 'cyberpunk') val = 2.0;
    else if (style === 'museum') val = 3.0;

    if (this.material && this.material.uniforms && this.material.uniforms.uStyle) {
      this.material.uniforms.uStyle.value = val;
    }
  }

  public setSize(width: number, height: number) {
    const rtWidth = Math.max(320, width);
    const rtHeight = Math.max(240, height);
    this.renderTarget.setSize(rtWidth, rtHeight);
    this.material.uniforms.uResolution.value.set(rtWidth, rtHeight);
  }

  public getRenderTarget(): THREE.WebGLRenderTarget {
    return this.renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, time: number) {
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, camera);

    // Project sun into NDC screen coordinates for optical lens flare
    this._scratchSunProj.copy(this.sunWorldPos);
    this._scratchSunProj.project(camera);
    const sunScreenX = (this._scratchSunProj.x * 0.5) + 0.5;
    const sunScreenY = (this._scratchSunProj.y * 0.5) + 0.5;
    const sunFront = this._scratchSunProj.z < 1.0 ? 1.0 : -1.0;
    this.material.uniforms.uSunScreenPos.value.set(sunScreenX, sunScreenY, sunFront);

    this.material.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.material.uniforms.uNear.value = camera.near;
    this.material.uniforms.uFar.value = camera.far;
    this.material.uniforms.uFocusDistance.value = this.currentFocusDistance;
    this.material.uniforms.uFocalRange.value = this.currentFocalRange;
    this.material.uniforms.uMaxBokeh.value = this.currentMaxBokeh;
    this.material.uniforms.uIsArtifactFocused.value = this.isArtifactFocused;
    this.material.uniforms.uLensMode.value = THREE.MathUtils.lerp(this.material.uniforms.uLensMode.value, this.lensModeActive, 0.15);
    this.material.uniforms.uRainIntensity.value = THREE.MathUtils.lerp(this.material.uniforms.uRainIntensity.value, this.rainIntensity, 0.1);
    this.material.uniforms.uTime.value = time;

    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderTarget.dispose();
    if (this.renderTarget.depthTexture) {
      this.renderTarget.depthTexture.dispose();
    }
    this.quadMesh.geometry.dispose();
    this.material.dispose();
  }
}
