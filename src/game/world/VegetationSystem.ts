/**
 * The Lost Meridian - Photorealistic Vegetation & Foliage System
 * Complex organic palm trees, buttress-rooted banyans, arched fern rosettes, and mossy rock formations.
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from '../textures/ProceduralTextureGenerator';
import { TerrainSystem } from './TerrainSystem';

export class VegetationSystem {
  public group = new THREE.Group();

  constructor(terrain: TerrainSystem) {
    this.spawnRainforestFlora(terrain);
  }

  /**
   * Builds realistic palm tree geometry with segmented curved trunk and arched fronds
   */
  private createRealisticPalmGeometry(): { trunkGeo: THREE.BufferGeometry; frondsGeo: THREE.BufferGeometry } {
    // 1. Segmented curved trunk
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, 3, 0.2),
      new THREE.Vector3(0.8, 6, 0.6),
      new THREE.Vector3(1.1, 9, 1.0),
    ]);
    const trunkGeo = new THREE.TubeGeometry(curve, 16, 0.35, 8, false);

    // 2. Crown of 10 arched feather palm fronds
    const frondsGeos: THREE.BufferGeometry[] = [];
    const frondCount = 10;

    for (let f = 0; f < frondCount; f++) {
      const angle = (f * Math.PI * 2) / frondCount + (Math.random() - 0.5) * 0.2;
      const frondLength = 4.5 + Math.random() * 1.0;

      // An arching curve for each frond
      const fCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * (frondLength * 0.4), 0.8, Math.sin(angle) * (frondLength * 0.4)),
        new THREE.Vector3(Math.cos(angle) * (frondLength * 0.8), 0.2, Math.sin(angle) * (frondLength * 0.8)),
        new THREE.Vector3(Math.cos(angle) * frondLength, -1.2, Math.sin(angle) * frondLength),
      ]);

      const frondGeo = new THREE.TubeGeometry(fCurve, 8, 0.05, 4, false);

      // Add 12 leaflet pairs along the frond stem
      const points = fCurve.getPoints(12);
      for (let p = 2; p < points.length; p++) {
        const pt = points[p];
        const leafletWidth = (1.0 - (p / points.length)) * 1.4;

        const leafPlane = new THREE.PlaneGeometry(leafletWidth, 0.22);
        leafPlane.rotateX(Math.PI / 4);
        leafPlane.rotateY(angle + Math.PI / 2);
        leafPlane.translate(pt.x, pt.y, pt.z);
        frondsGeos.push(leafPlane);
      }
      frondsGeos.push(frondGeo);
    }

    // Merge frond geometries manually into single buffer geometry
    const mergedFronds = this.mergeGeometries(frondsGeos);
    mergedFronds.translate(1.1, 9, 1.0); // align with top of trunk

    return { trunkGeo, frondsGeo: mergedFronds };
  }

  /**
   * Builds realistic giant rainforest canopy tree with buttress roots and branched crown
   */
  private createRealisticGiantTreeGeometry(): { trunkGeo: THREE.BufferGeometry; foliageGeo: THREE.BufferGeometry } {
    // 1. Organic Fluted Banyan Trunk with Natural Sweeping Buttress Flanges
    const trunkGeos: THREE.BufferGeometry[] = [];
    const mainStem = new THREE.CylinderGeometry(0.75, 2.6, 18, 16, 16);
    mainStem.translate(0, 9, 0);

    // Procedural vertex displacement for organic flared roots
    const pos = mainStem.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      const angle = Math.atan2(vz, vx);
      const curRadius = Math.hypot(vx, vz);

      // Fluted buttress root flanges flare outward near ground (vy < 6.0)
      const flangePower = Math.pow(Math.max(0.0, Math.cos(angle * 3.0)), 2.5);
      const heightFalloff = Math.exp(-Math.max(0.0, vy) * 0.45);
      const expansion = flangePower * 1.85 * heightFalloff;

      const newRadius = curRadius + expansion;
      pos.setX(i, Math.cos(angle) * newRadius);
      pos.setZ(i, Math.sin(angle) * newRadius);
    }
    mainStem.computeVertexNormals();
    trunkGeos.push(mainStem);

    // 4 Spreading boughs
    for (let b = 0; b < 4; b++) {
      const bAngle = (b * Math.PI * 2) / 4 + 0.3;
      const bough = new THREE.CylinderGeometry(0.28, 0.48, 6.5, 8);
      bough.rotateZ(0.65);
      bough.rotateY(bAngle);
      bough.translate(Math.cos(bAngle) * 2.6, 17, Math.sin(bAngle) * 2.6);
      trunkGeos.push(bough);
    }
    const mergedTrunk = this.mergeGeometries(trunkGeos);

    // 2. High-density volumetric domed foliage clusters
    const leafClusters: THREE.BufferGeometry[] = [];
    for (let c = 0; c < 16; c++) {
      const clusterAngle = (c * Math.PI * 2) / 10 + (Math.random() - 0.5) * 0.4;
      const dist = 2.0 + Math.random() * 4.2;
      const cx = Math.cos(clusterAngle) * dist;
      const cy = 18 + (Math.random() - 0.5) * 4.5;
      const cz = Math.sin(clusterAngle) * dist;

      // Curved arched leaf sprays that catch specular glints and light
      for (let p = 0; p < 3; p++) {
        const rad = 3.2 + Math.random() * 1.6;
        const spray = new THREE.PlaneGeometry(rad, rad * 0.8, 3, 3);
        const sPos = spray.attributes.position;
        // Parabolic arch
        for (let j = 0; j < sPos.count; j++) {
          const sx = sPos.getX(j);
          const sy = sPos.getY(j);
          sPos.setZ(j, -0.22 * (sx * sx + sy * sy));
        }
        spray.computeVertexNormals();

        spray.rotateY((p * Math.PI) / 3 + Math.random() * 0.6);
        spray.rotateX((Math.random() - 0.5) * 0.6);
        spray.translate(cx, cy, cz);
        leafClusters.push(spray);
      }
    }
    const mergedFoliage = this.mergeGeometries(leafClusters);

    return { trunkGeo: mergedTrunk, foliageGeo: mergedFoliage };
  }

  /**
   * Builds realistic sword fern rosette geometry with upright central rhizome and elevated fronds
   */
  private createRealisticFernGeometry(): THREE.BufferGeometry {
    const fronds: THREE.BufferGeometry[] = [];
    const count = 8;

    // Central rhizome crown base
    const crown = new THREE.CylinderGeometry(0.12, 0.06, 0.22, 6);
    crown.translate(0, 0.11, 0);
    fronds.push(crown);

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + (i % 2) * 0.15;
      const reach = 1.6 + (i % 3) * 0.25;

      // Fronds emerge from crown, arch high into canopy, and cascade with tips safely above soil
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.12, 0),
        new THREE.Vector3(Math.cos(angle) * (reach * 0.22), 0.52, Math.sin(angle) * (reach * 0.22)),
        new THREE.Vector3(Math.cos(angle) * (reach * 0.58), 0.82, Math.sin(angle) * (reach * 0.58)),
        new THREE.Vector3(Math.cos(angle) * (reach * 0.85), 0.62, Math.sin(angle) * (reach * 0.85)),
        new THREE.Vector3(Math.cos(angle) * reach, 0.32, Math.sin(angle) * reach),
      ]);

      const stem = new THREE.TubeGeometry(curve, 8, 0.035, 4, false);
      fronds.push(stem);

      const pts = curve.getPoints(10);
      for (let p = 1; p < pts.length; p++) {
        const pt = pts[p];
        const w = (1.0 - p / pts.length) * 0.85;
        const leaf = new THREE.PlaneGeometry(w, 0.2);
        leaf.rotateX(-0.25);
        leaf.rotateY(angle + Math.PI / 2);
        leaf.translate(pt.x, pt.y, pt.z);
        fronds.push(leaf);
      }
    }
    return this.mergeGeometries(fronds);
  }

  /**
   * Builds realistic arching Monstera & Caladium broadleaf plant with upright petiole stalks
   */
  private createBroadleafPlantGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    const count = 6;

    // Central root cluster base
    const rootCluster = new THREE.CylinderGeometry(0.1, 0.05, 0.18, 6);
    rootCluster.translate(0, 0.09, 0);
    parts.push(rootCluster);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.25;
      const height = 0.85 + (i % 3) * 0.35;
      const spread = 0.55 + (i % 2) * 0.25;

      // 1. Upright arching petiole stalk from ground to leaf
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.08, 0),
        new THREE.Vector3(Math.cos(angle) * (spread * 0.3), height * 0.45, Math.sin(angle) * (spread * 0.3)),
        new THREE.Vector3(Math.cos(angle) * spread, height * 0.88, Math.sin(angle) * spread),
        new THREE.Vector3(Math.cos(angle) * (spread * 1.25), height, Math.sin(angle) * (spread * 1.25)),
      ]);

      const stem = new THREE.TubeGeometry(stemCurve, 6, 0.03, 4, false);
      parts.push(stem);

      // 2. Broad heart-shaped leaf blade perched at the top of the stalk
      const leaf = new THREE.PlaneGeometry(0.75, 1.15, 3, 3);
      // Offset geometry origin so blade base connects to stem tip
      leaf.translate(0, 0.55, 0);
      leaf.rotateX(-0.65);
      leaf.rotateY(angle);
      leaf.translate(
        Math.cos(angle) * (spread * 1.25),
        height,
        Math.sin(angle) * (spread * 1.25)
      );
      parts.push(leaf);
    }
    return this.mergeGeometries(parts);
  }

  /**
   * Builds realistic eroded boulder geometry with natural deformation
   */
  private createRealisticBoulderGeometry(): THREE.BufferGeometry {
    const geo = new THREE.DodecahedronGeometry(1.4, 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      // Noise deformation for organic rock fractures
      const noise =
        Math.sin(vx * 3.0) * 0.15 +
        Math.cos(vy * 3.5) * 0.15 +
        Math.sin(vz * 4.0) * 0.12;

      pos.setXYZ(i, vx + noise * vx, vy + noise * vy * 0.8, vz + noise * vz);
    }
    geo.computeVertexNormals();
    return geo;
  }

  private spawnRainforestFlora(terrain: TerrainSystem) {
    const barkMat = ProceduralTextureGenerator.getMangroveBarkMaterial();
    const leafMat = ProceduralTextureGenerator.getTropicalFoliageMaterial();
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial();

    const isMobile = ProceduralTextureGenerator.isMobileDevice();

    // 1. Giant Rainforest Banyan Trees (Trunks cast solid tree shadows; fronds receive for 10x shadow pass speed)
    const { trunkGeo: giantTrunkGeo, foliageGeo: giantFoliageGeo } = this.createRealisticGiantTreeGeometry();
    const giantTreeCount = isMobile ? 24 : 90;
    const giantTrunkInstanced = new THREE.InstancedMesh(giantTrunkGeo, barkMat, giantTreeCount);
    const giantFoliageInstanced = new THREE.InstancedMesh(giantFoliageGeo, leafMat, giantTreeCount);
    giantTrunkInstanced.castShadow = !isMobile;
    giantTrunkInstanced.receiveShadow = true;
    giantFoliageInstanced.castShadow = false;
    giantFoliageInstanced.receiveShadow = true;

    // 2. Realistic Palm Trees (Instanced)
    const { trunkGeo: palmTrunkGeo, frondsGeo: palmFrondsGeo } = this.createRealisticPalmGeometry();
    const palmCount = isMobile ? 22 : 85;
    const palmTrunkInstanced = new THREE.InstancedMesh(palmTrunkGeo, barkMat, palmCount);
    const palmFrondsInstanced = new THREE.InstancedMesh(palmFrondsGeo, leafMat, palmCount);
    palmTrunkInstanced.castShadow = !isMobile;
    palmTrunkInstanced.receiveShadow = true;
    palmFrondsInstanced.castShadow = false;
    palmFrondsInstanced.receiveShadow = true;

    // 3. Dense Realistic Sword Ferns
    const fernGeo = this.createRealisticFernGeometry();
    const fernCount = isMobile ? 60 : 380;
    const fernInstanced = new THREE.InstancedMesh(fernGeo, leafMat, fernCount);
    fernInstanced.castShadow = false;
    fernInstanced.receiveShadow = true;

    // 3b. Broadleaf Monstera & Caladium Ground Plants
    const broadleafGeo = this.createBroadleafPlantGeometry();
    const broadleafCount = isMobile ? 40 : 220;
    const broadleafInstanced = new THREE.InstancedMesh(broadleafGeo, leafMat, broadleafCount);
    broadleafInstanced.castShadow = false;
    broadleafInstanced.receiveShadow = true;

    // 4. Weathered Basalt Boulders
    const boulderGeo = this.createRealisticBoulderGeometry();
    const boulderCount = isMobile ? 30 : 110;
    const boulderInstanced = new THREE.InstancedMesh(boulderGeo, stoneMat, boulderCount);
    boulderInstanced.castShadow = !isMobile;
    boulderInstanced.receiveShadow = true;

    const dummy = new THREE.Object3D();

    // Populate Giant Trees along borders (Z = 85 down to -200)
    let gtIdx = 0;
    for (let i = 0; i < giantTreeCount; i++) {
      const z = 80 - Math.random() * 250;
      // Skip steep waterfall plunge cliff face (Z = -32 to -62) to prevent floating trees on cliff drops
      if (z < -32 && z > -62) continue;

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (12 + Math.random() * 40) * side;
      const y = terrain.getHeightAt(x, z);

      if (y < 45) {
        // Embed trunk base 0.35m into soil to prevent floating roots
        dummy.position.set(x, y - 0.35, z);
        const s = 0.85 + Math.random() * 0.55;
        dummy.scale.set(s, s * (0.9 + Math.random() * 0.2), s);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.updateMatrix();

        giantTrunkInstanced.setMatrixAt(gtIdx, dummy.matrix);
        giantFoliageInstanced.setMatrixAt(gtIdx, dummy.matrix);
        gtIdx++;
      }
    }
    giantTrunkInstanced.instanceMatrix.needsUpdate = true;
    giantFoliageInstanced.instanceMatrix.needsUpdate = true;

    // Populate Palm Trees along river and camp trails
    let pIdx = 0;
    for (let i = 0; i < palmCount; i++) {
      const z = 80 - Math.random() * 180;
      if (z < -32 && z > -62) continue; // Skip steep waterfall cliff drop

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (5 + Math.random() * 26) * side;
      // Skip center river water channel
      if (Math.abs(x) < 4.5 && z > -30 && z < 20) continue;

      const y = terrain.getHeightAt(x, z);

      // Embed palm trunk base 0.25m into ground
      dummy.position.set(x, y - 0.25, z);
      const s = 0.75 + Math.random() * 0.5;
      dummy.scale.set(s, s, s);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.z = (Math.random() - 0.5) * 0.2;
      dummy.updateMatrix();

      palmTrunkInstanced.setMatrixAt(pIdx, dummy.matrix);
      palmFrondsInstanced.setMatrixAt(pIdx, dummy.matrix);
      pIdx++;
    }
    palmTrunkInstanced.instanceMatrix.needsUpdate = true;
    palmFrondsInstanced.instanceMatrix.needsUpdate = true;

    // Populate Fern Rosettes (Properly seated on soil surface with embedded rhizome)
    let fIdx = 0;
    for (let i = 0; i < fernCount; i++) {
      const z = 85 - Math.random() * 240;
      if (z < -32 && z > -62) continue;

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (1.8 + Math.random() * 26) * side;
      if (Math.abs(x) < 4.0 && z > -30 && z < 20) continue;

      const y = terrain.getHeightAt(x, z);

      // Embed fern rhizome crown 0.12m into soil
      dummy.position.set(x, y - 0.12, z);
      const s = 0.7 + Math.random() * 0.8;
      dummy.scale.set(s, s, s);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      fernInstanced.setMatrixAt(fIdx, dummy.matrix);
      fIdx++;
    }
    fernInstanced.instanceMatrix.needsUpdate = true;

    // Populate Broadleaf Monstera & Caladium Ground Plants (Rooted in soil)
    let bIdx = 0;
    for (let i = 0; i < broadleafCount; i++) {
      const z = 85 - Math.random() * 230;
      if (z < -32 && z > -62) continue;

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (1.6 + Math.random() * 20) * side;
      if (Math.abs(x) < 4.0 && z > -30 && z < 20) continue;

      const y = terrain.getHeightAt(x, z);

      // Embed root cluster 0.12m into soil
      dummy.position.set(x, y - 0.12, z);
      const s = 0.8 + Math.random() * 0.7;
      dummy.scale.set(s, s, s);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.z = (Math.random() - 0.5) * 0.12;
      dummy.updateMatrix();

      broadleafInstanced.setMatrixAt(bIdx, dummy.matrix);
      bIdx++;
    }
    broadleafInstanced.instanceMatrix.needsUpdate = true;

    // Populate Deformed Basalt Boulders
    let boIdx = 0;
    for (let i = 0; i < boulderCount; i++) {
      const z = 80 - Math.random() * 250;
      if (z < -32 && z > -62) continue;

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (4.0 + Math.random() * 26) * side;
      const y = terrain.getHeightAt(x, z);

      // Embed boulder base 0.35m into earth
      dummy.position.set(x, y - 0.35, z);
      const s = 0.6 + Math.random() * 1.6;
      dummy.scale.set(s * (0.8 + Math.random() * 0.5), s, s * (0.8 + Math.random() * 0.5));
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();

      boulderInstanced.setMatrixAt(boIdx, dummy.matrix);
      boIdx++;
    }
    boulderInstanced.instanceMatrix.needsUpdate = true;

    this.group.add(giantTrunkInstanced);
    this.group.add(giantFoliageInstanced);
    this.group.add(palmTrunkInstanced);
    this.group.add(palmFrondsInstanced);
    this.group.add(fernInstanced);
    this.group.add(broadleafInstanced);
    this.group.add(boulderInstanced);

    this.addHangingLianas(terrain);
    this.addWatersideMangroveRoots(terrain);
  }

  private addWatersideMangroveRoots(terrain: TerrainSystem) {
    const barkMat = ProceduralTextureGenerator.getMangroveBarkMaterial(1, 4);
    const rootGroup = new THREE.Group();

    for (let i = 0; i < 32; i++) {
      const z = 20 - i * 1.6;
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (5.5 + Math.random() * 2.8);
      const groundY = terrain.getHeightAt(x, z);

      // Arching stilt root entering the water at Y = -2.35
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.8, 0),
        new THREE.Vector3(side * 0.9, 1.4, (Math.random() - 0.5) * 0.8),
        new THREE.Vector3(side * 1.9, -0.2, (Math.random() - 0.5) * 1.0),
        new THREE.Vector3(side * 2.8, -2.4, (Math.random() - 0.5) * 0.6),
      ]);
      const geo = new THREE.TubeGeometry(curve, 12, 0.14, 6, false);
      const mesh = new THREE.Mesh(geo, barkMat);
      mesh.position.set(x, groundY, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      rootGroup.add(mesh);
    }
    this.group.add(rootGroup);
  }

  private addHangingLianas(terrain: TerrainSystem) {
    const vineMat = new THREE.MeshStandardMaterial({
      color: 0x2e2014,
      roughness: 0.92,
    });

    for (let i = 0; i < 40; i++) {
      const z = 75 - i * 5.5;
      const x = (Math.random() - 0.5) * 18;
      const groundY = terrain.getHeightAt(x, z);
      const length = 5.0 + Math.random() * 7.0;

      // Twisted curve for lianas
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, length, 0),
        new THREE.Vector3((Math.random() - 0.5) * 0.6, length * 0.66, (Math.random() - 0.5) * 0.6),
        new THREE.Vector3((Math.random() - 0.5) * 0.8, length * 0.33, (Math.random() - 0.5) * 0.8),
        new THREE.Vector3(0, 0, 0),
      ]);

      const vineGeo = new THREE.TubeGeometry(curve, 10, 0.05, 5, false);
      const vineMesh = new THREE.Mesh(vineGeo, vineMat);
      // Embed bottom tip of liana 0.2m into soil so it touches the ground naturally
      vineMesh.position.set(x, groundY - 0.2, z);
      vineMesh.castShadow = true;
      this.group.add(vineMesh);
    }
  }

  /**
   * Helper to merge buffer geometries into one single geometry
   */
  private mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
    let totalVertices = 0;
    let totalIndices = 0;

    geos.forEach((g) => {
      totalVertices += g.attributes.position.count;
      if (g.index) totalIndices += g.index.count;
      else totalIndices += g.attributes.position.count;
    });

    const mergedPos = new Float32Array(totalVertices * 3);
    const mergedNorm = new Float32Array(totalVertices * 3);
    const mergedUv = new Float32Array(totalVertices * 2);
    const mergedIndices: number[] = [];

    let vOffset = 0;
    let uvOffset = 0;
    let idxOffset = 0;

    geos.forEach((g) => {
      const posAttr = g.attributes.position;
      const normAttr = g.attributes.normal || posAttr;
      const uvAttr = g.attributes.uv;

      for (let i = 0; i < posAttr.count; i++) {
        mergedPos[(vOffset + i) * 3] = posAttr.getX(i);
        mergedPos[(vOffset + i) * 3 + 1] = posAttr.getY(i);
        mergedPos[(vOffset + i) * 3 + 2] = posAttr.getZ(i);

        mergedNorm[(vOffset + i) * 3] = normAttr.getX(i);
        mergedNorm[(vOffset + i) * 3 + 1] = normAttr.getY(i);
        mergedNorm[(vOffset + i) * 3 + 2] = normAttr.getZ(i);

        if (uvAttr) {
          mergedUv[(uvOffset + i) * 2] = uvAttr.getX(i);
          mergedUv[(uvOffset + i) * 2 + 1] = uvAttr.getY(i);
        }
      }

      if (g.index) {
        for (let j = 0; j < g.index.count; j++) {
          mergedIndices.push(g.index.getX(j) + vOffset);
        }
      } else {
        for (let j = 0; j < posAttr.count; j++) {
          mergedIndices.push(j + vOffset);
        }
      }

      vOffset += posAttr.count;
      uvOffset += posAttr.count;
    });

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
    result.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
    result.setAttribute('uv', new THREE.BufferAttribute(mergedUv, 2));
    result.setIndex(mergedIndices);
    return result;
  }

  public update(time: number, windSpeed = 1.0) {
    ProceduralTextureGenerator.foliageUniforms.uTime.value = time;
    ProceduralTextureGenerator.foliageUniforms.uWindSpeed.value = windSpeed;
  }
}
