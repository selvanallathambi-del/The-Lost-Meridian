/**
 * The Lost Meridian - Master Photorealistic PBR Texture & Material Generator
 * High-definition procedural & photographic PBR textures:
 * Albedo, Sobel Normals, Roughness Maps, Ambient Occlusion, and Micro-detail Shaders.
 */

import * as THREE from 'three';
import { textureManager } from '../engine/TextureManager';
import skyboxImg from '../../assets/images/skybox_jungle_canopy_1790863646790.jpg';
import mossyStoneImg from '../../assets/images/texture_mossy_stone_1790863660073.jpg';
import jungleFloorImg from '../../assets/images/texture_jungle_floor_1790863673317.jpg';
import basaltRockImg from '../../assets/images/texture_basalt_rock_1790863686128.jpg';
import leafFrondImg from '../../assets/images/leaf_tropical_frond_1790864440236.jpg';
import mangroveBarkImg from '../../assets/images/bark_wet_mangrove_1790864455519.jpg';
import wetMudImg from '../../assets/images/mud_wet_riverbank_1790864471467.jpg';

export const TEXTURE_PATHS = {
  skybox: skyboxImg,
  mossyStone: mossyStoneImg,
  jungleFloor: jungleFloorImg,
  basaltRock: basaltRockImg,
  leafFrond: leafFrondImg,
  mangroveBark: mangroveBarkImg,
  wetMud: wetMudImg,
};

export class ProceduralTextureGenerator {
  private static loader = new THREE.TextureLoader();
  private static textureCache = new Map<string, THREE.Texture>();
  private static materialCache = new Map<string, THREE.Material>();

  // Global uniform controller for dynamic foliage and wind
  public static foliageUniforms = {
    uTime: { value: 0 },
    uWindSpeed: { value: 1.0 },
    uSunDirection: { value: new THREE.Vector3(0.5, 0.65, 0.55).normalize() },
  };

  public static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Loads or retrieves cached photographic texture
   */
  public static loadTexture(path: string, repeatX = 1, repeatY = 1): THREE.Texture {
    return textureManager.loadHighResTexture(path, false, repeatX, repeatY);
  }

  /**
   * Generates seamless high-octave Ocean Wave Normal Map (inspired by Three.js webgl_shaders_ocean waternormals.jpg)
   */
  public static generateOceanWaterNormals(size = 512): THREE.CanvasTexture {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 128 : Math.min(size, 256);
    const key = `ocean_water_normals_${effectiveSize}`;
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)! as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = effectiveSize;
    canvas.height = effectiveSize;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(effectiveSize, effectiveSize);
    const dst = imgData.data;

    // Multi-harmonic trochoidal wave synthesiser
    const TWO_PI = Math.PI * 2;
    for (let y = 0; y < effectiveSize; y++) {
      const v = (y / effectiveSize) * TWO_PI;
      for (let x = 0; x < effectiveSize; x++) {
        const u = (x / effectiveSize) * TWO_PI;

        // Wave harmonics (periodic on [0, 2PI] for 100% seamless tiling)
        let dx = 0;
        let dy = 0;

        // Octave 1: Major oceanic swells
        dx += Math.cos(u * 2.0 + v * 1.0) * 0.45;
        dy += Math.sin(u * 1.0 + v * 2.0) * 0.45;

        // Octave 2: Diagonal chop
        dx += Math.cos(u * 4.0 - v * 3.0 + 1.2) * 0.35;
        dy += Math.sin(-u * 3.0 + v * 4.0 + 0.8) * 0.35;

        // Octave 3: High-frequency cross ripples
        dx += Math.cos(u * 8.0 + v * 6.0 + 2.4) * 0.22;
        dy += Math.sin(u * 6.0 - v * 8.0 + 1.7) * 0.22;

        // Octave 4: Capillary micro-facets
        dx += Math.cos(u * 16.0 - v * 12.0) * 0.12;
        dy += Math.sin(u * 12.0 + v * 16.0) * 0.12;

        // Normalize tangent normal
        const dz = 1.0;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = dx / len;
        const ny = dy / len;
        const nz = dz / len;

        const idx = (y * effectiveSize + x) * 4;
        dst[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        dst[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        dst[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        dst[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const normalTex = new THREE.CanvasTexture(canvas);
    normalTex.wrapS = THREE.RepeatWrapping;
    normalTex.wrapT = THREE.RepeatWrapping;
    normalTex.anisotropy = mob ? 1 : 16;
    normalTex.generateMipmaps = true;

    this.textureCache.set(key, normalTex);
    return normalTex;
  }

  /**
   * Generates a high-precision Sobel normal map from an image or texture
   */
  public static generateNormalMapFromTexture(
    imageTex: THREE.Texture,
    strength = 3.0
  ): THREE.CanvasTexture {
    const mob = this.isMobileDevice();
    const size = mob ? 256 : 512;
    const cacheKey = `norm_tex_${(imageTex as any)?.uuid || (imageTex as any)?.source?.data?.src || 'default'}_${strength}_${size}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey) as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    const normalTex = new THREE.CanvasTexture(canvas);
    normalTex.wrapS = THREE.RepeatWrapping;
    normalTex.wrapT = THREE.RepeatWrapping;
    normalTex.anisotropy = mob ? 1 : 16;
    normalTex.generateMipmaps = true;

    this.textureCache.set(cacheKey, normalTex);

    const img = (imageTex as any).image as HTMLImageElement | undefined;
    if (img && img.complete && img.width > 0) {
      this.bakeNormal(img, canvas, ctx, strength);
      normalTex.needsUpdate = true;
    } else {
      const srcUrl = (imageTex as any)?.image?.src || (imageTex as any)?.source?.data?.src;
      if (srcUrl) {
        const domImg = new Image();
        domImg.crossOrigin = 'anonymous';
        domImg.onload = () => {
          this.bakeNormal(domImg, canvas, ctx, strength);
          normalTex.needsUpdate = true;
        };
        domImg.src = srcUrl;
      }
    }

    return normalTex;
  }

  private static bakeNormal(
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    strength: number
  ) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const src = imgData.data;
    const normalImgData = ctx.createImageData(canvas.width, canvas.height);
    const dst = normalImgData.data;
    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const xL = (x - 1 + w) % w;
        const xR = (x + 1) % w;
        const yU = (y - 1 + h) % h;
        const yD = (y + 1) % h;

        const valL = (src[(y * w + xL) * 4] * 0.299 + src[(y * w + xL) * 4 + 1] * 0.587 + src[(y * w + xL) * 4 + 2] * 0.114) / 255.0;
        const valR = (src[(y * w + xR) * 4] * 0.299 + src[(y * w + xR) * 4 + 1] * 0.587 + src[(y * w + xR) * 4 + 2] * 0.114) / 255.0;
        const valU = (src[(yU * w + x) * 4] * 0.299 + src[(yU * w + x) * 4 + 1] * 0.587 + src[(yU * w + x) * 4 + 2] * 0.114) / 255.0;
        const valD = (src[(yD * w + x) * 4] * 0.299 + src[(yD * w + x) * 4 + 1] * 0.587 + src[(yD * w + x) * 4 + 2] * 0.114) / 255.0;

        const dx = (valR - valL) * strength;
        const dy = (valD - valU) * strength;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = dx / len;
        const ny = dy / len;
        const nz = dz / len;

        const idx = (y * w + x) * 4;
        dst[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        dst[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        dst[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        dst[idx + 3] = 255;
      }
    }
    ctx.putImageData(normalImgData, 0, 0);
  }

  /**
   * Generates crisp alpha mask for tropical foliage
   */
  public static generateAlphaMask(imagePath: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    const alphaTex = new THREE.CanvasTexture(canvas);
    alphaTex.anisotropy = 16;

    const img = new Image();
    domLoadImage(img, imagePath, () => {
      ctx.drawImage(img, 0, 0, 512, 512);
      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        const alpha = lum > 25 ? 255 : 0;
        data[i] = alpha;
        data[i + 1] = alpha;
        data[i + 2] = alpha;
        data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      alphaTex.needsUpdate = true;
    });

    return alphaTex;
  }

  // ==========================================
  // PROCEDURAL TEXTURE GENERATION SUITE
  // ==========================================

  /**
   * 1. Ultra-High Resolution Ancient Stone Block Texture
   */
  public static generateAncientStoneMaps(size = 512): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
  } {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 64 : Math.min(size, 256);
    const key = `stone_maps_${effectiveSize}`;
    if (this.textureCache.has(`${key}_diff`)) {
      return {
        diffuse: this.textureCache.get(`${key}_diff`) as THREE.CanvasTexture,
        normal: this.textureCache.get(`${key}_norm`) as THREE.CanvasTexture,
        roughness: this.textureCache.get(`${key}_rough`) as THREE.CanvasTexture,
      };
    }

    const cDiff = document.createElement('canvas');
    cDiff.width = effectiveSize;
    cDiff.height = effectiveSize;
    const ctxDiff = cDiff.getContext('2d')!;

    const cNorm = document.createElement('canvas');
    cNorm.width = effectiveSize;
    cNorm.height = effectiveSize;
    const ctxNorm = cNorm.getContext('2d')!;

    const cRough = document.createElement('canvas');
    cRough.width = effectiveSize;
    cRough.height = effectiveSize;
    const ctxRough = cRough.getContext('2d')!;

    // Base Sandstone / Granite Matrix
    ctxDiff.fillStyle = '#656359';
    ctxDiff.fillRect(0, 0, effectiveSize, effectiveSize);

    // 1. Chiseled Stone Ashlar Blocks & Mortar Seams
    const rows = 4;
    const rowH = effectiveSize / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const cols = 3;
      const colW = effectiveSize / cols;
      const offset = (r % 2) * (colW * 0.5);

      for (let c = -1; c <= cols; c++) {
        const x = c * colW + offset;
        // Block shading variation
        const shade = Math.floor((Math.random() - 0.5) * 30);
        ctxDiff.fillStyle = `rgb(${105 + shade}, ${103 + shade}, ${92 + shade})`;
        ctxDiff.fillRect(x + 4, y + 4, colW - 8, rowH - 8);

        // Chiseled edge bevel
        ctxDiff.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctxDiff.lineWidth = mob ? 2 : 3;
        ctxDiff.strokeRect(x + 5, y + 5, colW - 10, rowH - 10);

        // Deep Mortar groove
        ctxDiff.strokeStyle = 'rgba(20, 18, 15, 0.75)';
        ctxDiff.lineWidth = mob ? 3 : 6;
        ctxDiff.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);
      }
    }

    // 2. Micro-pores, Mineral Grains, and Weathering Cracks
    const imgData = ctxDiff.getImageData(0, 0, effectiveSize, effectiveSize);
    const data = imgData.data;
    const heightMap = new Float32Array(effectiveSize * effectiveSize);

    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % effectiveSize;
      const py = Math.floor((i / 4) / effectiveSize);

      // Noise grains
      const noise = (Math.random() - 0.5) * 32;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));

      // Moss / Lichen Growth in Crevices and Mortar
      const isCrevice = (px % (effectiveSize / 3) < 4) || (py % (effectiveSize / 4) < 4);
      if (isCrevice && Math.random() < 0.65) {
        data[i] = Math.floor(data[i] * 0.6); // Greenish tint
        data[i + 1] = Math.floor(data[i + 1] * 1.15);
        data[i + 2] = Math.floor(data[i + 2] * 0.55);
      }

      heightMap[py * effectiveSize + px] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255.0;
    }
    ctxDiff.putImageData(imgData, 0, 0);

    // 3. Compute High-Definition Normal Map (Sobel Filter)
    const normData = ctxNorm.createImageData(effectiveSize, effectiveSize);
    const nDst = normData.data;
    const roughData = ctxRough.createImageData(effectiveSize, effectiveSize);
    const rDst = roughData.data;

    const strength = 3.5;
    for (let y = 0; y < effectiveSize; y++) {
      for (let x = 0; x < effectiveSize; x++) {
        const xL = (x - 1 + effectiveSize) % effectiveSize;
        const xR = (x + 1) % effectiveSize;
        const yU = (y - 1 + effectiveSize) % effectiveSize;
        const yD = (y + 1) % effectiveSize;

        const valL = heightMap[y * effectiveSize + xL];
        const valR = heightMap[y * effectiveSize + xR];
        const valU = heightMap[yU * effectiveSize + x];
        const valD = heightMap[yD * effectiveSize + x];

        const dx = (valR - valL) * strength;
        const dy = (valD - valU) * strength;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const idx = (y * effectiveSize + x) * 4;
        nDst[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
        nDst[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
        nDst[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
        nDst[idx + 3] = 255;

        // Roughness: Stone is rough (0.85), moss is slightly smoother (0.7)
        const centerH = heightMap[y * effectiveSize + x];
        const roughnessVal = Math.floor((0.75 + (1.0 - centerH) * 0.2) * 255);
        rDst[idx] = roughnessVal;
        rDst[idx + 1] = roughnessVal;
        rDst[idx + 2] = roughnessVal;
        rDst[idx + 3] = 255;
      }
    }
    ctxNorm.putImageData(normData, 0, 0);
    ctxRough.putImageData(roughData, 0, 0);

    const diffuse = new THREE.CanvasTexture(cDiff);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.colorSpace = THREE.SRGBColorSpace;
    diffuse.anisotropy = mob ? 1 : 16;

    const normal = new THREE.CanvasTexture(cNorm);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.anisotropy = mob ? 1 : 16;

    const roughness = new THREE.CanvasTexture(cRough);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.anisotropy = mob ? 1 : 16;

    this.textureCache.set(`${key}_diff`, diffuse);
    this.textureCache.set(`${key}_norm`, normal);
    this.textureCache.set(`${key}_rough`, roughness);

    return { diffuse, normal, roughness };
  }

  /**
   * 2. High-Fidelity Carved Glyph / Solar Relief Texture
   */
  public static generateCarvedGlyphMaps(size = 512, emissiveColor = '#38bdf8'): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    emissive: THREE.CanvasTexture;
  } {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 256 : Math.min(size, 512);
    const key = `glyph_${effectiveSize}_${emissiveColor}`;
    if (this.textureCache.has(`${key}_diff`)) {
      return {
        diffuse: this.textureCache.get(`${key}_diff`) as THREE.CanvasTexture,
        normal: this.textureCache.get(`${key}_norm`) as THREE.CanvasTexture,
        emissive: this.textureCache.get(`${key}_emiss`) as THREE.CanvasTexture,
      };
    }

    const cDiff = document.createElement('canvas');
    cDiff.width = effectiveSize;
    cDiff.height = effectiveSize;
    const ctxDiff = cDiff.getContext('2d')!;

    const cNorm = document.createElement('canvas');
    cNorm.width = effectiveSize;
    cNorm.height = effectiveSize;
    const ctxNorm = cNorm.getContext('2d')!;

    const cEmiss = document.createElement('canvas');
    cEmiss.width = effectiveSize;
    cEmiss.height = effectiveSize;
    const ctxEmiss = cEmiss.getContext('2d')!;

    // Dark Basalt / Andesite weathered stone background with mineral variation
    ctxDiff.fillStyle = '#383a34';
    ctxDiff.fillRect(0, 0, effectiveSize, effectiveSize);

    for (let i = 0; i < 300; i++) {
      const rx = Math.random() * effectiveSize;
      const ry = Math.random() * effectiveSize;
      const rr = 1.0 + Math.random() * 2.5;
      ctxDiff.fillStyle = Math.random() > 0.5 ? 'rgba(75, 78, 68, 0.35)' : 'rgba(24, 25, 22, 0.45)';
      ctxDiff.beginPath();
      ctxDiff.arc(rx, ry, rr, 0, Math.PI * 2);
      ctxDiff.fill();
    }

    ctxEmiss.fillStyle = '#000000';
    ctxEmiss.fillRect(0, 0, effectiveSize, effectiveSize);

    // Draw Solar Mayan / Egyptian Hieroglyphic Circles and Chevrons
    const cx = effectiveSize / 2;
    const cy = effectiveSize / 2;

    const drawGlyphs = (targetCtx: CanvasRenderingContext2D, strokeColor: string, fill = false) => {
      targetCtx.strokeStyle = strokeColor;
      targetCtx.fillStyle = strokeColor;
      targetCtx.lineWidth = mob ? 4 : 8;

      // Outer Meridian Concentric Rings
      targetCtx.beginPath();
      targetCtx.arc(cx, cy, effectiveSize * 0.42, 0, Math.PI * 2);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.arc(cx, cy, effectiveSize * 0.35, 0, Math.PI * 2);
      targetCtx.stroke();

      // 12 Sunbeam Ray Channels
      for (let a = 0; a < 12; a++) {
        const rad = (a * Math.PI * 2) / 12;
        targetCtx.beginPath();
        targetCtx.moveTo(cx + Math.cos(rad) * (effectiveSize * 0.22), cy + Math.sin(rad) * (effectiveSize * 0.22));
        targetCtx.lineTo(cx + Math.cos(rad) * (effectiveSize * 0.34), cy + Math.sin(rad) * (effectiveSize * 0.34));
        targetCtx.stroke();
      }

      // Center Solar Eye / Crest
      targetCtx.beginPath();
      targetCtx.arc(cx, cy, effectiveSize * 0.18, 0, Math.PI * 2);
      if (fill) targetCtx.fill();
      else targetCtx.stroke();

      // Inner Rune Diamond
      targetCtx.beginPath();
      targetCtx.moveTo(cx, cy - effectiveSize * 0.12);
      targetCtx.lineTo(cx + effectiveSize * 0.12, cy);
      targetCtx.lineTo(cx, cy + effectiveSize * 0.12);
      targetCtx.lineTo(cx - effectiveSize * 0.12, cy);
      targetCtx.closePath();
      targetCtx.stroke();
    };

    // Draw stone engraved relief
    drawGlyphs(ctxDiff, 'rgba(18, 16, 14, 0.85)');
    // Draw gold foil inlay accents in diffuse
    ctxDiff.strokeStyle = 'rgba(212, 168, 62, 0.4)';
    ctxDiff.lineWidth = mob ? 2 : 3;
    drawGlyphs(ctxDiff, 'rgba(212, 168, 62, 0.4)');

    // Draw emissive glow runes
    drawGlyphs(ctxEmiss, emissiveColor);

    // Compute Normal map
    const imgData = ctxDiff.getImageData(0, 0, effectiveSize, effectiveSize);
    const data = imgData.data;
    const heightMap = new Float32Array(effectiveSize * effectiveSize);
    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % effectiveSize;
      const py = Math.floor((i / 4) / effectiveSize);
      heightMap[py * effectiveSize + px] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255.0;
    }

    const normData = ctxNorm.createImageData(effectiveSize, effectiveSize);
    const nDst = normData.data;
    const strength = 4.2;
    for (let y = 0; y < effectiveSize; y++) {
      for (let x = 0; x < effectiveSize; x++) {
        const xL = (x - 1 + effectiveSize) % effectiveSize;
        const xR = (x + 1) % effectiveSize;
        const yU = (y - 1 + effectiveSize) % effectiveSize;
        const yD = (y + 1) % effectiveSize;

        const valL = heightMap[y * effectiveSize + xL];
        const valR = heightMap[y * effectiveSize + xR];
        const valU = heightMap[yU * effectiveSize + x];
        const valD = heightMap[yD * effectiveSize + x];

        const dx = (valR - valL) * strength;
        const dy = (valD - valU) * strength;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const idx = (y * effectiveSize + x) * 4;
        nDst[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
        nDst[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
        nDst[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
        nDst[idx + 3] = 255;
      }
    }
    ctxNorm.putImageData(normData, 0, 0);

    const diffuse = new THREE.CanvasTexture(cDiff);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.colorSpace = THREE.SRGBColorSpace;
    diffuse.anisotropy = mob ? 1 : 16;

    const normal = new THREE.CanvasTexture(cNorm);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.anisotropy = mob ? 1 : 16;

    const emissive = new THREE.CanvasTexture(cEmiss);
    emissive.wrapS = THREE.RepeatWrapping;
    emissive.wrapT = THREE.RepeatWrapping;
    emissive.colorSpace = THREE.SRGBColorSpace;
    emissive.anisotropy = mob ? 1 : 16;

    this.textureCache.set(`${key}_diff`, diffuse);
    this.textureCache.set(`${key}_norm`, normal);
    this.textureCache.set(`${key}_emiss`, emissive);

    return { diffuse, normal, emissive };
  }

  /**
   * 3. Photorealistic Tropical Foliage with Alpha-Cutout Fronds
   */
  public static getTropicalFoliageMaterial(): THREE.MeshStandardMaterial {
    const diffTex = this.loadTexture(TEXTURE_PATHS.leafFrond, 1, 1);
    const alphaTex = this.generateAlphaMask(TEXTURE_PATHS.leafFrond);

    const mat = new THREE.MeshStandardMaterial({
      map: diffTex,
      alphaMap: alphaTex,
      alphaTest: 0.28,
      color: new THREE.Color(0xffffff),
      roughness: 0.38,
      metalness: 0.02,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
      envMapIntensity: 1.25,
    });

    // Subsurface Scattering and Rainforest Wind Shader
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = ProceduralTextureGenerator.foliageUniforms.uTime;
      shader.uniforms.uWindSpeed = ProceduralTextureGenerator.foliageUniforms.uWindSpeed;
      shader.uniforms.uSunDirection = ProceduralTextureGenerator.foliageUniforms.uSunDirection;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uWindSpeed;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float stemSway = sin(uTime * 0.8 + position.z * 0.3 + position.x * 0.2) * 0.03 * uWindSpeed * max(0.0, position.y * 0.08);
        transformed.x += stemSway;
        transformed.z += stemSway * 0.5;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        vec3 lSun = normalize(vec3(0.5, 0.65, 0.55));
        vec3 eye = normalize(-vViewPosition);

        // Forward-Scatter Chlorophyll Absorption & Red-Shift Transmission
        float backDot = max(dot(-normal, lSun), 0.0);
        vec3 sssSpectral = vec3(0.65 * pow(backDot, 1.8), 0.45 * pow(backDot, 2.6), 0.08 * pow(backDot, 3.8));
        vec3 sssGlow = sssSpectral * 0.55;

        // Tropical Waxy Cuticle Grazing Fresnel Sheen (IOR 1.45)
        float cuticleFresnel = pow(1.0 - max(dot(normal, eye), 0.0), 3.8) * 0.18;
        vec3 cuticleSpecular = vec3(0.35, 0.55, 0.25) * cuticleFresnel;

        gl_FragColor.rgb += sssGlow * gl_FragColor.rgb + cuticleSpecular;
        `
      );
    };

    return mat;
  }

  /**
   * 4. Wet Mangrove Bark & Stilt Roots Material
   */
  public static getMangroveBarkMaterial(repeatX = 2, repeatY = 6): THREE.MeshStandardMaterial {
    const diffTex = this.loadTexture(TEXTURE_PATHS.mangroveBark, repeatX, repeatY);
    const normTex = this.generateNormalMapFromTexture(diffTex, 3.2);
    normTex.repeat.set(repeatX, repeatY);

    return new THREE.MeshStandardMaterial({
      map: diffTex,
      normalMap: normTex,
      normalScale: new THREE.Vector2(2.4, 2.4),
      color: new THREE.Color(0x3e2d1f),
      roughness: 0.78,
      metalness: 0.04,
      envMapIntensity: 0.9,
    });
  }

  /**
   * 5. Weathered Hardwood Planks Material (Wood crates, docks, desks)
   */
  public static getWeatheredWoodMaterial(repeatX = 2, repeatY = 2): THREE.MeshStandardMaterial {
    const diffTex = this.loadTexture(TEXTURE_PATHS.mangroveBark, repeatX, repeatY);
    const normTex = this.generateNormalMapFromTexture(diffTex, 2.5);
    normTex.repeat.set(repeatX, repeatY);

    return new THREE.MeshStandardMaterial({
      map: diffTex,
      normalMap: normTex,
      normalScale: new THREE.Vector2(2.0, 2.0),
      color: new THREE.Color(0x452f1e),
      roughness: 0.72,
      metalness: 0.05,
      envMapIntensity: 0.95,
    });
  }

  /**
   * 6. Splat-Blended Ecological Terrain Material
   * Clean, high-performance PBR terrain material fully compatible with all WebGL2/WebGL1 mobile GPUs
   */
  public static createEcologicalTerrainMaterial(): THREE.Material {
    const soilTex = this.loadTexture(TEXTURE_PATHS.jungleFloor, 18, 18);
    const soilNorm = this.generateNormalMapFromTexture(soilTex, 2.5);
    soilNorm.repeat.set(18, 18);

    const rockTex = this.loadTexture(TEXTURE_PATHS.basaltRock, 14, 14);
    const rockNorm = this.generateNormalMapFromTexture(rockTex, 3.2);
    rockNorm.repeat.set(14, 14);

    const wetMudTex = this.loadTexture(TEXTURE_PATHS.wetMud, 16, 16);
    const stoneTex = this.loadTexture(TEXTURE_PATHS.mossyStone, 12, 12);

    const mat = new THREE.MeshStandardMaterial({
      name: 'EcologicalTerrainMaterial',
      map: soilTex,
      normalMap: soilNorm,
      normalScale: new THREE.Vector2(1.8, 1.8),
      roughness: 0.82,
      metalness: 0.04,
      color: new THREE.Color(0xd2cebd),
      envMapIntensity: 1.1,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.tRock = { value: rockTex };
      shader.uniforms.tRockNorm = { value: rockNorm };
      shader.uniforms.tMud = { value: wetMudTex };
      shader.uniforms.tStone = { value: stoneTex };

      shader.vertexShader = `
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        `
      );

      shader.fragmentShader = `
        uniform sampler2D tRock;
        uniform sampler2D tRockNorm;
        uniform sampler2D tMud;
        uniform sampler2D tStone;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #include <map_fragment>
        vec2 rockUv = vWorldPos.xz * 0.08;
        vec3 rockCol = texture2D(tRock, rockUv).rgb;
        vec3 mudCol = texture2D(tMud, vWorldPos.xz * 0.12).rgb;
        vec3 stoneCol = texture2D(tStone, vWorldPos.xz * 0.07).rgb;

        // 1. Slope cliff detection (steep ravine & canyon walls)
        float slope = 1.0 - clamp(vWorldNormal.y, 0.0, 1.0);
        float cliffWeight = smoothstep(0.28, 0.65, slope);

        // 2. Riverbed & shoreline wet mud
        float riverProx = smoothstep(16.0, 3.0, abs(vWorldPos.x));
        float waterHeightProx = smoothstep(1.5, -2.5, vWorldPos.y);
        float mudWeight = clamp(riverProx * waterHeightProx, 0.0, 1.0) * (1.0 - cliffWeight);

        // 3. Ancient Temple precinct stone paving (Z < -75)
        float templeWeight = smoothstep(-65.0, -95.0, vWorldPos.z) * (1.0 - cliffWeight) * 0.75;

        // Composite multi-biome terrain albedo
        vec3 baseAlbedo = diffuseColor.rgb;
        baseAlbedo = mix(baseAlbedo, mudCol * 1.08, mudWeight);
        baseAlbedo = mix(baseAlbedo, stoneCol * 1.15, templeWeight);
        baseAlbedo = mix(baseAlbedo, rockCol * 0.85, cliffWeight);
        diffuseColor.rgb = baseAlbedo;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <normal_fragment_maps>',
        `
        #include <normal_fragment_maps>
        vec3 rockNormSamp = texture2D(tRockNorm, vWorldPos.xz * 0.08).xyz * 2.0 - 1.0;
        float cliffNormWeight = smoothstep(0.25, 0.60, 1.0 - clamp(vWorldNormal.y, 0.0, 1.0));
        normal = normalize(mix(normal, normalize(normal + vec3(rockNormSamp.x, 0.0, rockNormSamp.y) * 1.8), cliffNormWeight * 0.7));
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `
        #include <roughnessmap_fragment>
        float slopeR = 1.0 - clamp(vWorldNormal.y, 0.0, 1.0);
        float cliffR = smoothstep(0.28, 0.65, slopeR);
        float riverR = smoothstep(16.0, 3.0, abs(vWorldPos.x)) * smoothstep(1.5, -2.5, vWorldPos.y);
        roughnessFactor = mix(roughnessFactor, 0.28, riverR * 0.85);
        roughnessFactor = mix(roughnessFactor, 0.88, cliffR);
        `
      );
    };

    return mat;
  }

  /**
   * 7. Ancient Weathered Stone Material with Multi-Scale Ashlar Normals
   */
  public static getAncientStoneMaterial(repeatX = 4, repeatY = 4): THREE.MeshStandardMaterial {
    const key = `stone_${repeatX}_${repeatY}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshStandardMaterial;
    }

    const diffuseTex = this.loadTexture(TEXTURE_PATHS.mossyStone, repeatX, repeatY);
    const normalTex = this.generateNormalMapFromTexture(diffuseTex, 3.2);
    normalTex.repeat.set(repeatX, repeatY);

    const mat = new THREE.MeshStandardMaterial({
      map: diffuseTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(2.6, 2.6),
      roughness: 0.76,
      metalness: 0.04,
      color: new THREE.Color(0xd6d3c7),
      envMapIntensity: 1.15,
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * 8. Wet Basalt Cliff Material
   */
  public static getBasaltCliffMaterial(repeatX = 6, repeatY = 6): THREE.MeshStandardMaterial {
    const key = `basalt_${repeatX}_${repeatY}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshStandardMaterial;
    }

    const diffuseTex = this.loadTexture(TEXTURE_PATHS.basaltRock, repeatX, repeatY);
    const normalTex = this.generateNormalMapFromTexture(diffuseTex, 3.8);
    normalTex.repeat.set(repeatX, repeatY);

    const mat = new THREE.MeshStandardMaterial({
      map: diffuseTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(2.6, 2.6),
      roughness: 0.42,
      metalness: 0.15,
      color: new THREE.Color(0x2d3238),
      envMapIntensity: 1.2,
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * 9. Ancient Carved Temple Glyphs Material with Solar Runes
   */
  public static getCarvedGlyphMaterial(emissiveColor = 0x38bdf8, glow = false): THREE.MeshStandardMaterial {
    const glyphMaps = this.generateCarvedGlyphMaps(512, `#${new THREE.Color(emissiveColor).getHexString()}`);

    return new THREE.MeshStandardMaterial({
      map: glyphMaps.diffuse,
      normalMap: glyphMaps.normal,
      normalScale: new THREE.Vector2(3.0, 3.0),
      roughness: 0.78,
      metalness: 0.12,
      color: new THREE.Color(0xffffff),
      emissiveMap: glow ? glyphMaps.emissive : null,
      emissive: glow ? new THREE.Color(emissiveColor) : new THREE.Color(0x000000),
      emissiveIntensity: glow ? 2.8 : 0.0,
      envMapIntensity: 1.1,
    });
  }

  /**
   * 10. Ancient Gold & Bronze Relics with Patina and Specular Micro-scratches
   */
  public static getAncientGoldMaterial(): THREE.MeshPhysicalMaterial {
    const key = 'ancient_gold';
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich antique gold base
    ctx.fillStyle = '#d4a83e';
    ctx.fillRect(0, 0, 512, 512);

    // Weathered malachite oxide patina flecks
    ctx.fillStyle = 'rgba(28, 88, 72, 0.45)';
    for (let i = 0; i < 80; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const pr = 1 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Micro-scratches
    ctx.strokeStyle = 'rgba(255, 240, 180, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 120; i++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }

    const goldTex = new THREE.CanvasTexture(canvas);
    goldTex.wrapS = THREE.RepeatWrapping;
    goldTex.wrapT = THREE.RepeatWrapping;
    goldTex.colorSpace = THREE.SRGBColorSpace;
    goldTex.anisotropy = 16;

    const normTex = this.generateNormalMapFromTexture(goldTex, 2.0);

    const mat = new THREE.MeshPhysicalMaterial({
      map: goldTex,
      normalMap: normTex,
      normalScale: new THREE.Vector2(1.2, 1.2),
      color: new THREE.Color(0xffe68a),
      roughness: 0.2,
      metalness: 0.96,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
      envMapIntensity: 1.8,
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * 11. Military Expedition Tent Weathered Canvas
   */
  public static getCanvasTentMaterial(): THREE.MeshStandardMaterial {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Earthy olive drab canvas
    ctx.fillStyle = '#6b634c';
    ctx.fillRect(0, 0, 512, 512);

    // Mud stain gradient at bottom hem
    const grad = ctx.createLinearGradient(0, 300, 0, 512);
    grad.addColorStop(0, 'rgba(40, 32, 20, 0)');
    grad.addColorStop(1, 'rgba(40, 32, 20, 0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 300, 512, 212);

    // Woven textile cross-hatch fibers
    for (let x = 0; x < 512; x += 4) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(x, 0, 2, 512);
    }
    for (let y = 0; y < 512; y += 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, y, 512, 2);
    }

    const diffuseTex = new THREE.CanvasTexture(canvas);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.wrapT = THREE.RepeatWrapping;
    diffuseTex.repeat.set(3, 3);
    diffuseTex.colorSpace = THREE.SRGBColorSpace;
    diffuseTex.anisotropy = 16;

    const normTex = this.generateNormalMapFromTexture(diffuseTex, 2.2);
    normTex.repeat.set(3, 3);

    return new THREE.MeshStandardMaterial({
      map: diffuseTex,
      normalMap: normTex,
      normalScale: new THREE.Vector2(1.5, 1.5),
      roughness: 0.86,
      metalness: 0.02,
      side: THREE.DoubleSide,
      color: new THREE.Color(0x635742),
    });
  }

  /**
   * 12. Meridian Core Energy Material
   */
  public static getMeridianCoreMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a1e2b),
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 3.5,
      roughness: 0.06,
      metalness: 0.95,
      envMapIntensity: 2.0,
    });
  }

  /**
   * 13. Clear Crystalline Prism Glass
   */
  public static getCrystalGlassMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf6fdff),
      roughness: 0.02,
      metalness: 0.02,
      transmission: 0.98,
      ior: 1.58,
      thickness: 1.6,
      attenuationColor: new THREE.Color(0x7dd3fc),
      attenuationDistance: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      specularIntensity: 1.2,
      specularColor: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.95,
      envMapIntensity: 2.2,
    });
  }

  /**
   * 14. Character PBR: Heavy Expedition Canvas / Twill Fabric Normal & Roughness Maps
   */
  public static generateFabricWeaveMaps(size = 256): { normal: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 64 : size;
    const key = `fabric_weave_${effectiveSize}`;
    if (this.textureCache.has(`${key}_norm`)) {
      return {
        normal: this.textureCache.get(`${key}_norm`) as THREE.CanvasTexture,
        roughness: this.textureCache.get(`${key}_rough`) as THREE.CanvasTexture,
      };
    }

    const cNorm = document.createElement('canvas');
    cNorm.width = effectiveSize;
    cNorm.height = effectiveSize;
    const ctxNorm = cNorm.getContext('2d')!;

    const cRough = document.createElement('canvas');
    cRough.width = effectiveSize;
    cRough.height = effectiveSize;
    const ctxRough = cRough.getContext('2d')!;

    const normData = ctxNorm.createImageData(effectiveSize, effectiveSize);
    const nDst = normData.data;
    const roughData = ctxRough.createImageData(effectiveSize, effectiveSize);
    const rDst = roughData.data;

    for (let y = 0; y < effectiveSize; y++) {
      for (let x = 0; x < effectiveSize; x++) {
        const u = (x * 32.0) / effectiveSize;
        const v = (y * 32.0) / effectiveSize;
        const threadX = Math.sin(u * Math.PI * 2.0);
        const threadY = Math.cos(v * Math.PI * 2.0);
        const twill = Math.sin((u + v) * Math.PI * 2.0);

        const dx = threadX * 0.4 + twill * 0.3;
        const dy = threadY * 0.4 - twill * 0.3;
        const dz = 1.0;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const idx = (y * effectiveSize + x) * 4;
        nDst[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
        nDst[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
        nDst[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
        nDst[idx + 3] = 255;

        const roughVal = Math.floor(210 + threadX * 25);
        rDst[idx] = roughVal;
        rDst[idx + 1] = roughVal;
        rDst[idx + 2] = roughVal;
        rDst[idx + 3] = 255;
      }
    }
    ctxNorm.putImageData(normData, 0, 0);
    ctxRough.putImageData(roughData, 0, 0);

    const normal = new THREE.CanvasTexture(cNorm);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(8, 8);
    normal.anisotropy = mob ? 1 : 16;

    const roughness = new THREE.CanvasTexture(cRough);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(8, 8);
    roughness.anisotropy = mob ? 1 : 16;

    this.textureCache.set(`${key}_norm`, normal);
    this.textureCache.set(`${key}_rough`, roughness);
    return { normal, roughness };
  }

  /**
   * 15. Character PBR: Weathered Bridle Leather Grain Normal & Roughness Maps
   */
  public static generateLeatherGrainMaps(size = 256): { normal: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 64 : size;
    const key = `leather_grain_${effectiveSize}`;
    if (this.textureCache.has(`${key}_norm`)) {
      return {
        normal: this.textureCache.get(`${key}_norm`) as THREE.CanvasTexture,
        roughness: this.textureCache.get(`${key}_rough`) as THREE.CanvasTexture,
      };
    }

    const cNorm = document.createElement('canvas');
    cNorm.width = effectiveSize;
    cNorm.height = effectiveSize;
    const ctxNorm = cNorm.getContext('2d')!;

    const cRough = document.createElement('canvas');
    cRough.width = effectiveSize;
    cRough.height = effectiveSize;
    const ctxRough = cRough.getContext('2d')!;

    const normData = ctxNorm.createImageData(effectiveSize, effectiveSize);
    const nDst = normData.data;
    const roughData = ctxRough.createImageData(effectiveSize, effectiveSize);
    const rDst = roughData.data;

    for (let y = 0; y < effectiveSize; y++) {
      for (let x = 0; x < effectiveSize; x++) {
        const u = (x * 18.0) / effectiveSize;
        const v = (y * 18.0) / effectiveSize;
        const cell = Math.sin(u * 6.28) * Math.sin(v * 6.28);
        const crease = Math.sin((u * 1.5 + Math.sin(v * 2.0)) * 6.28) * 0.5;

        const dx = cell * 0.45 + crease * 0.35;
        const dy = cell * 0.45 - crease * 0.35;
        const dz = 1.0;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const idx = (y * effectiveSize + x) * 4;
        nDst[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
        nDst[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
        nDst[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
        nDst[idx + 3] = 255;

        const roughVal = Math.floor(110 + Math.abs(crease) * 45);
        rDst[idx] = roughVal;
        rDst[idx + 1] = roughVal;
        rDst[idx + 2] = roughVal;
        rDst[idx + 3] = 255;
      }
    }
    ctxNorm.putImageData(normData, 0, 0);
    ctxRough.putImageData(roughData, 0, 0);

    const normal = new THREE.CanvasTexture(cNorm);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(4, 4);
    normal.anisotropy = mob ? 1 : 16;

    const roughness = new THREE.CanvasTexture(cRough);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(4, 4);
    roughness.anisotropy = mob ? 1 : 16;

    this.textureCache.set(`${key}_norm`, normal);
    this.textureCache.set(`${key}_rough`, roughness);
    return { normal, roughness };
  }

  /**
   * 16. Character PBR: Anatomical Human Skin Micro-Pore Normal & Roughness Maps
   */
  public static generateSkinPBRMaps(size = 256): { normal: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 64 : size;
    const key = `skin_pbr_${effectiveSize}`;
    if (this.textureCache.has(`${key}_norm`)) {
      return {
        normal: this.textureCache.get(`${key}_norm`) as THREE.CanvasTexture,
        roughness: this.textureCache.get(`${key}_rough`) as THREE.CanvasTexture,
      };
    }

    const cNorm = document.createElement('canvas');
    cNorm.width = effectiveSize;
    cNorm.height = effectiveSize;
    const ctxNorm = cNorm.getContext('2d')!;

    const cRough = document.createElement('canvas');
    cRough.width = effectiveSize;
    cRough.height = effectiveSize;
    const ctxRough = cRough.getContext('2d')!;

    const normData = ctxNorm.createImageData(effectiveSize, effectiveSize);
    const nDst = normData.data;
    const roughData = ctxRough.createImageData(effectiveSize, effectiveSize);
    const rDst = roughData.data;

    for (let y = 0; y < effectiveSize; y++) {
      for (let x = 0; x < effectiveSize; x++) {
        const u = (x * 48.0) / effectiveSize;
        const v = (y * 48.0) / effectiveSize;

        // Multi-scale cellular epidermal pores and micro-creases
        const pore1 = Math.sin(u * 6.28) * Math.sin(v * 6.28);
        const pore2 = Math.sin(u * 12.56 + 1.2) * Math.cos(v * 12.56 + 0.8) * 0.5;
        const microFold = Math.sin((u * 2.0 + Math.sin(v * 4.0)) * 6.28) * 0.35;

        const dx = (pore1 * 0.35 + pore2 * 0.25 + microFold * 0.3) * 0.6;
        const dy = (pore1 * 0.35 - pore2 * 0.25 - microFold * 0.3) * 0.6;
        const dz = 1.0;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const idx = (y * effectiveSize + x) * 4;
        nDst[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
        nDst[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
        nDst[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
        nDst[idx + 3] = 255;

        // Natural skin roughness distribution: lipid T-zone vs softer cheek pores
        const roughVal = Math.floor(140 + Math.abs(pore1) * 35 + Math.abs(microFold) * 25);
        rDst[idx] = roughVal;
        rDst[idx + 1] = roughVal;
        rDst[idx + 2] = roughVal;
        rDst[idx + 3] = 255;
      }
    }
    ctxNorm.putImageData(normData, 0, 0);
    ctxRough.putImageData(roughData, 0, 0);

    const normal = new THREE.CanvasTexture(cNorm);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(6, 6);
    normal.anisotropy = mob ? 1 : 16;

    const roughness = new THREE.CanvasTexture(cRough);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(6, 6);
    roughness.anisotropy = mob ? 1 : 16;

    this.textureCache.set(`${key}_norm`, normal);
    this.textureCache.set(`${key}_rough`, roughness);
    return { normal, roughness };
  }

  /**
   * 17. Character PBR: Anatomical Hazel/Amber Eye Iris Texture with Limbal Ring
   */
  public static generateEyeIrisTexture(size = 128): THREE.CanvasTexture {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 64 : size;
    const key = `eye_iris_${effectiveSize}`;
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key) as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = effectiveSize;
    canvas.height = effectiveSize;
    const ctx = canvas.getContext('2d')!;

    const cx = effectiveSize / 2;
    const cy = effectiveSize / 2;
    const maxR = effectiveSize / 2 - 2;

    // Sclera base (soft warm ivory eyeball white with micro-vascular tints)
    ctx.fillStyle = '#f0ebe1';
    ctx.fillRect(0, 0, effectiveSize, effectiveSize);

    // Subtle edge vascular shading
    const scleraGrad = ctx.createRadialGradient(cx, cy, maxR * 0.6, cx, cy, maxR);
    scleraGrad.addColorStop(0, '#f4efe8');
    scleraGrad.addColorStop(0.85, '#ede3d5');
    scleraGrad.addColorStop(1, '#dbcdbe');
    ctx.fillStyle = scleraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fill();

    // Iris circle
    const irisR = maxR * 0.72;
    // Outer dark limbal ring
    ctx.strokeStyle = '#1a1008';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
    ctx.stroke();

    // Radial iris pigment gradients (Warm Hazel-Amber)
    const irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.2, cx, cy, irisR);
    irisGrad.addColorStop(0, '#73441a');
    irisGrad.addColorStop(0.35, '#8c5926');
    irisGrad.addColorStop(0.7, '#6b431c');
    irisGrad.addColorStop(0.95, '#3b220d');
    irisGrad.addColorStop(1, '#1e1107');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Radial stroma fiber striations
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2;
      const rInner = irisR * (0.28 + Math.random() * 0.15);
      const rOuter = irisR * (0.85 + Math.random() * 0.12);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(215, 160, 85, 0.45)' : 'rgba(75, 42, 18, 0.5)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
      ctx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
      ctx.stroke();
    }

    // Pupil
    const pupilR = irisR * 0.32;
    const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pupilR);
    pupilGrad.addColorStop(0, '#020202');
    pupilGrad.addColorStop(0.85, '#080808');
    pupilGrad.addColorStop(1, '#1b120c');
    ctx.fillStyle = pupilGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Subtle specular glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx - pupilR * 0.45, cy - pupilR * 0.45, pupilR * 0.22, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = mob ? 1 : 16;
    this.textureCache.set(key, tex);
    return tex;
  }

  /**
   * 18. Character PBR: Anatomical Explorer Face Map (Sun-weathered skin, 5 o'clock shadow, lips, brows)
   */
  public static generateExplorerFaceAlbedo(size = 256): THREE.CanvasTexture {
    const mob = this.isMobileDevice();
    const effectiveSize = mob ? 64 : size;
    const key = `explorer_face_albedo_${effectiveSize}`;
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key) as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = effectiveSize;
    canvas.height = effectiveSize;
    const ctx = canvas.getContext('2d')!;

    // Base weathered explorer skin tone (golden tan)
    ctx.fillStyle = '#c78e6c';
    ctx.fillRect(0, 0, effectiveSize, effectiveSize);

    // Warm dermal shading and subtle cheek flush
    const grad = ctx.createRadialGradient(effectiveSize / 2, effectiveSize * 0.45, 10, effectiveSize / 2, effectiveSize * 0.45, effectiveSize * 0.6);
    grad.addColorStop(0, '#cf9573');
    grad.addColorStop(0.5, '#c58967');
    grad.addColorStop(1, '#b47756');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, effectiveSize, effectiveSize);

    // Subtle rosy vascular flush on cheeks and nose tip
    ctx.fillStyle = 'rgba(180, 85, 70, 0.18)';
    ctx.beginPath();
    ctx.ellipse(effectiveSize * 0.32, effectiveSize * 0.52, effectiveSize * 0.12, effectiveSize * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(effectiveSize * 0.68, effectiveSize * 0.52, effectiveSize * 0.12, effectiveSize * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5 o'clock expedition beard stubble on jaw and chin
    const stubbleGrad = ctx.createLinearGradient(0, effectiveSize * 0.6, 0, effectiveSize);
    stubbleGrad.addColorStop(0, 'rgba(55, 45, 38, 0)');
    stubbleGrad.addColorStop(0.35, 'rgba(50, 42, 35, 0.28)');
    stubbleGrad.addColorStop(1, 'rgba(40, 32, 26, 0.42)');
    ctx.fillStyle = stubbleGrad;
    ctx.fillRect(effectiveSize * 0.15, effectiveSize * 0.62, effectiveSize * 0.7, effectiveSize * 0.38);

    // Lip coloration (natural desaturated vermilion)
    ctx.fillStyle = 'rgba(165, 85, 75, 0.55)';
    ctx.beginPath();
    ctx.ellipse(effectiveSize / 2, effectiveSize * 0.74, effectiveSize * 0.16, effectiveSize * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrow shading
    ctx.fillStyle = 'rgba(45, 32, 22, 0.75)';
    // Left brow
    ctx.beginPath();
    ctx.ellipse(effectiveSize * 0.34, effectiveSize * 0.35, effectiveSize * 0.14, effectiveSize * 0.035, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Right brow
    ctx.beginPath();
    ctx.ellipse(effectiveSize * 0.66, effectiveSize * 0.35, effectiveSize * 0.14, effectiveSize * 0.035, 0.1, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = mob ? 1 : 16;
    this.textureCache.set(key, tex);
    return tex;
  }
}

function domLoadImage(img: HTMLImageElement, src: string, onLoad: () => void) {
  img.crossOrigin = 'anonymous';
  img.onload = onLoad;
  img.src = src;
}
