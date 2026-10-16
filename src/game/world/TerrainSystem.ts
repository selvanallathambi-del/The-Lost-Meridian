/**
 * The Lost Meridian - Continuous Terrain & World Geometry
 * Multi-biome seamless terrain with exact height query function for player physics.
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from '../textures/ProceduralTextureGenerator';

export class TerrainSystem {
  public mesh: THREE.Mesh;
  public boundingBoxes: THREE.Box3[] = [];

  constructor() {
    const terrainGeo = this.buildTerrainGeometry(300, 380, 80, 100);
    const terrainMat = ProceduralTextureGenerator.createEcologicalTerrainMaterial();
    this.mesh = new THREE.Mesh(terrainGeo, terrainMat);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
  }

  /**
   * Generates continuous heightfield terrain with biomes
   */
  private buildTerrainGeometry(
    width: number,
    length: number,
    segmentsW: number,
    segmentsL: number
  ): THREE.BufferGeometry {
    const geo = new THREE.PlaneGeometry(width, length, segmentsW, segmentsL);
    geo.rotateX(-Math.PI / 2); // Lay horizontal on XZ plane

    const pos = geo.attributes.position;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Offset terrain center so expedition camp is at Z ~ +80 and Meridian is at Z ~ -240
      const worldZ = z - 60;
      pos.setZ(i, worldZ);

      const y = this.calculateHeight(x, worldZ);
      pos.setY(i, y);
    }

    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Continuous mathematical height function representing the entire archaeological expedition
   */
  public calculateHeight(x: number, z: number): number {
    // 1. Canyon / valley walls on East & West to keep player on path
    const canyonDist = Math.abs(x);
    let canyonWallHeight = 0;
    const pathWidth = (z < -60 && z > -180) ? 22 : 18; // wider near temple
    if (canyonDist > pathWidth) {
      const excess = canyonDist - pathWidth;
      canyonWallHeight = Math.pow(excess * 0.45, 1.6);
    }

    // 2. Base natural undulating terrain noise
    const naturalUndulation =
      Math.sin(x * 0.08) * 0.8 +
      Math.cos(z * 0.05) * 1.2 +
      Math.sin((x + z) * 0.15) * 0.4;

    // 3. Biome-specific elevations:
    let biomeElevation = 0;

    if (z > 45) {
      // Zone 1: Expedition Camp & Trailhead (Elevation ~ +1.0 to +3.0)
      biomeElevation = 2.0 + Math.sin(z * 0.1) * 0.5;
    } else if (z > 10) {
      // Zone 2: Jungle Trail descending to River (Elevation ~ +2.0 to -1.0)
      const t = (45 - z) / 35.0; // 0 to 1
      biomeElevation = 2.0 - t * 3.0;
    } else if (z > -30) {
      // Zone 3: River Basin & Ancient Crossing (Elevation ~ -1.5)
      // River channel carved in center
      const riverBed = Math.abs(x) < 7 ? -1.8 : 0;
      biomeElevation = -1.5 + riverBed;
    } else if (z > -60) {
      // Zone 4: The Great Waterfall Cliff (Steep plunge from -2.0 to -14.0)
      const t = (-30 - z) / 30.0; // 0 to 1
      const smoothDrop = Math.pow(t, 2.2);
      biomeElevation = -2.0 - smoothDrop * 12.0;
    } else if (z > -95) {
      // Zone 5: Grotto & Aqueduct Puzzle Chamber (Subterranean basin ~ -14.0)
      biomeElevation = -14.0 + Math.sin(x * 0.1) * 0.3;
    } else if (z > -130) {
      // Zone 6: Grand Temple Steps & Ascent (Ascends from -14.0 to -6.0)
      const t = (-95 - z) / 35.0;
      biomeElevation = -14.0 + t * 8.0;
    } else if (z > -175) {
      // Zone 7: Temple Interior Sanctuary (Level floor at -6.0)
      biomeElevation = -6.0;
    } else if (z > -210) {
      // Zone 8: Subterranean Chasm & Meridian Descent (-6.0 down to -24.0)
      const t = (-175 - z) / 35.0;
      biomeElevation = -6.0 - t * 18.0;
    } else {
      // Zone 9: The Meridian Core Chamber (Arena floor at -24.0)
      const distFromCenter = Math.hypot(x, z - (-235));
      if (distFromCenter < 28) {
        biomeElevation = -24.0;
      } else {
        // Bottomless abyss chasm around arena
        biomeElevation = -24.0 - Math.min(40, (distFromCenter - 28) * 3.0);
      }
    }

    return biomeElevation + naturalUndulation * 0.5 + canyonWallHeight;
  }

  /**
   * Fast height query at any world (X, Z) coordinate
   */
  public getHeightAt(x: number, z: number): number {
    return this.calculateHeight(x, z);
  }

  /**
   * Finite-difference surface normal query at world (X, Z) coordinate
   */
  public getNormalAt(x: number, z: number): THREE.Vector3 {
    const eps = 0.2;
    const hL = this.calculateHeight(x - eps, z);
    const hR = this.calculateHeight(x + eps, z);
    const hD = this.calculateHeight(x, z - eps);
    const hU = this.calculateHeight(x, z + eps);
    const normal = new THREE.Vector3(hL - hR, 2.0 * eps, hD - hU);
    return normal.normalize();
  }

  public update(wetness: number) {
    const mat = this.mesh.material as THREE.ShaderMaterial;
    if (mat && mat.uniforms && mat.uniforms.uWetness) {
      mat.uniforms.uWetness.value = wetness;
    }
  }
}
