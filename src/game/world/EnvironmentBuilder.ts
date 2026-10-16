/**
 * The Lost Meridian - Environment Builder
 * Constructs photorealistic archaeological locations, sculpted expedition camp, stepped temple, and mechanisms.
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from '../textures/ProceduralTextureGenerator';
import { InteractionTarget } from '../types';

export class EnvironmentBuilder {
  public group = new THREE.Group();
  public interactables: (THREE.Object3D & { interactionData: InteractionTarget })[] = [];
  public collisionBoxes: THREE.Box3[] = [];
  public sunkenGateBox: THREE.Box3 | null = null;
  public innerGateBox: THREE.Box3 | null = null;

  // Puzzle mechanism references
  public waterDial1: THREE.Mesh | null = null;
  public waterDial2: THREE.Mesh | null = null;
  public waterDial3: THREE.Mesh | null = null;
  public sunkenGateMesh: THREE.Mesh | null = null;

  public lightPrism1: THREE.Mesh | null = null;
  public lightPrism2: THREE.Mesh | null = null;
  public lightPrism3: THREE.Mesh | null = null;
  public solarCrestMesh: THREE.Mesh | null = null;
  public templeInnerGate: THREE.Mesh | null = null;

  public meridianCoreSphere: THREE.Mesh | null = null;
  public meridianRing1: THREE.Mesh | null = null;
  public meridianRing2: THREE.Mesh | null = null;
  public meridianRing3: THREE.Mesh | null = null;
  public meridianAltar: THREE.Mesh | null = null;
  public runicFloorChannels: THREE.Mesh[] = [];

  // Volumetric Sunbeams & Lights
  public campLanternLight: THREE.PointLight | null = null;
  public meridianEnergyLight: THREE.PointLight | null = null;
  public brazierParticles: THREE.Points[] = [];
  public sunbeamMesh: THREE.Mesh | null = null;

  // Subterranean Flame Brazier Network
  public braziers: Array<{
    id: string;
    mesh: THREE.Group;
    light: THREE.PointLight;
    flameMesh: THREE.Mesh;
    isLit: boolean;
  }> = [];
  public litBraziersCount = 0;

  // Water Mill & Stillwater Landing
  public waterMillWheel: THREE.Group | null = null;
  public dockBoatSpot: THREE.Vector3 = new THREE.Vector3(-3.8, -2.25, 12.0);

  // Weather Station Anemometer
  public anemometerMesh: THREE.Group | null = null;

  // Pythagorean Sonar Wavefront
  public sonarWaveMesh: THREE.Mesh | null = null;
  public sonarWaveRadius = 0;
  public sonarWaveActive = false;
  public sonarWaveMaterial: THREE.MeshBasicMaterial | null = null;

  // 1928 Curtiss Biplane
  public biplaneMesh: THREE.Group | null = null;
  public biplaneProp: THREE.Mesh | null = null;

  constructor() {
    this.buildSculptedExpeditionCamp();
    this.buildWaterMillAndLanding();
    this.buildJungleTrailAndRuins();
    this.buildWaterfallAndGrotto();
    this.buildAqueductPuzzleChamber();
    this.buildMonumentalTempleExterior();
    this.buildTempleInteriorAndPrisms();
    this.buildUndergroundChasm();
    this.buildMeridianSanctuary();
    this.buildSubterraneanBraziers();
    this.buildExcavationMounds();
    this.buildExpeditionScientificInstruments();
    this.buildAncientReliefMurals();
    this.buildCampfireHearth();
    this.buildEndemicFloraSpecimens();
    this.initSonarWaveMesh();
    this.buildFalconPerch();
    this.buildRappellingRopes();
    this.buildPlanetariumProjector();
    this.buildChemistryLabBench();
    this.buildTheodoliteStation();
    this.buildDivingRigStation();
    this.buildPhonographStation();
    this.buildMinecartStation();
    this.buildBalloonMooringStation();
    this.buildMarconiRadioStation();
    this.buildEpigraphyDesk();
    this.buildArmillarySphere();
    this.buildHydraulicSiphonStation();
    this.buildPaleontologyBench();
    this.buildMetallurgyForge();
    this.buildCartographyDesk();
    this.buildChladniTable();
    this.buildBiplane();
    this.buildAssaySarcophagus();
    this.buildMagicLanternStation();
    this.buildGrandApexAltar();
  }

  private registerInteractable(mesh: THREE.Object3D, data: InteractionTarget) {
    (mesh as any).interactionData = data;
    this.interactables.push(mesh as any);
  }

  private addCollisionBox(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): THREE.Box3 {
    const box = new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    );
    this.collisionBoxes.push(box);
    return box;
  }

  /**
   * 01. SCULPTED EXPEDITION CAMP (Z = 85 to 55)
   */
  private buildSculptedExpeditionCamp() {
    const tentMat = ProceduralTextureGenerator.getCanvasTentMaterial();
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial(2, 2);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x3a3c40,
      roughness: 0.28,
      metalness: 0.9,
      envMapIntensity: 1.5,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc89d3a,
      roughness: 0.3,
      metalness: 0.88,
      envMapIntensity: 1.6,
    });
    const goldMat = ProceduralTextureGenerator.getAncientGoldMaterial();
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(2, 2);

    // 1. Two Realistic Ridge A-Frame Expedition Tents
    for (const xOffset of [-7.0, 7.0]) {
      const tentGroup = new THREE.Group();

      // Sloped canvas roof
      const roofGeo = new THREE.BufferGeometry();
      const w = 3.8;
      const h = 2.8;
      const l = 5.2;

      // 6 vertices of an A-frame prism
      const vertices = new Float32Array([
        // Left roof slope
        -w / 2, 0, -l / 2,   0, h, -l / 2,   -w / 2, 0, l / 2,
        0, h, -l / 2,        0, h, l / 2,    -w / 2, 0, l / 2,
        // Right roof slope
        w / 2, 0, -l / 2,    w / 2, 0, l / 2, 0, h, -l / 2,
        0, h, -l / 2,        w / 2, 0, l / 2, 0, h, l / 2,
        // Back wall triangle
        -w / 2, 0, -l / 2,   w / 2, 0, -l / 2, 0, h, -l / 2,
      ]);
      roofGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const uvs = new Float32Array([
        // Left roof slope
        0, 0,  1, 0,  0, 1,
        1, 0,  1, 1,  0, 1,
        // Right roof slope
        0, 0,  0, 1,  1, 0,
        1, 0,  0, 1,  1, 1,
        // Back wall triangle
        0, 0,  1, 0,  0.5, 1,
      ]);
      roofGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      roofGeo.computeVertexNormals();

      const roofMesh = new THREE.Mesh(roofGeo, tentMat);
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      tentGroup.add(roofMesh);

      // Wooden ridge pole along top spine
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, l + 0.6, 6);
      poleGeo.rotateX(Math.PI / 2);
      const pole = new THREE.Mesh(poleGeo, woodMat);
      pole.position.set(0, h, 0);
      pole.castShadow = true;
      tentGroup.add(pole);

      // Guy ropes and wooden stakes on both flanks
      const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8c7355, roughness: 0.9 });
      for (const side of [-1, 1]) {
        for (let r = -2.0; r <= 2.0; r += 2.0) {
          const ropeGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.6, 4);
          ropeGeo.rotateZ(side * 0.72);
          const rope = new THREE.Mesh(ropeGeo, ropeMat);
          rope.position.set(side * 2.6, 1.2, r);
          tentGroup.add(rope);

          const stakeGeo = new THREE.CylinderGeometry(0.03, 0.01, 0.4, 5);
          stakeGeo.rotateZ(-side * 0.25);
          const stake = new THREE.Mesh(stakeGeo, woodMat);
          stake.position.set(side * 3.4, 0.1, r);
          tentGroup.add(stake);
        }
      }

      // Two A-poles at front and back
      for (const z of [-l / 2, l / 2]) {
        for (const side of [-1, 1]) {
          const aPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 5), woodMat);
          aPole.rotation.z = side * 0.42;
          aPole.position.set(side * 0.7, 1.4, z);
          aPole.castShadow = true;
          tentGroup.add(aPole);
        }
      }

      // Interior camp cot inside left tent
      if (xOffset < 0) {
        const cotFrame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 2.2), woodMat);
        cotFrame.position.set(0, 0.2, 0);
        tentGroup.add(cotFrame);
      }

      tentGroup.position.set(xOffset, 2.5, 75);
      this.group.add(tentGroup);
      this.addCollisionBox(xOffset - 2.2, 0, 72.2, xOffset + 2.2, 5.5, 77.8);
    }

    // 2. Research Desk with Field Gear
    const tableMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.8), woodMat);
    tableMesh.position.set(0, 2.5, 74);
    tableMesh.castShadow = true;
    tableMesh.receiveShadow = true;
    this.group.add(tableMesh);

    // Turned wooden legs with cross stretcher
    for (const dx of [-1.6, 1.6]) {
      for (const dz of [-0.7, 0.7]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.4, 6), woodMat);
        leg.position.set(dx, 1.8, 74 + dz);
        leg.castShadow = true;
        this.group.add(leg);
      }
    }
    this.addCollisionBox(-2.0, 0, 72.8, 2.0, 3.6, 75.2);

    // Shortwave Transceiver Radio (Detailed faceplate, brass knobs & copper antenna)
    const radioMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.45), metalMat);
    radioMesh.position.set(-0.9, 2.85, 74);
    radioMesh.castShadow = true;

    // Brass knobs and frequency dial plate
    for (let k = -0.25; k <= 0.25; k += 0.25) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8), brassMat);
      knob.rotateX(Math.PI / 2);
      knob.position.set(k, -0.1, 0.24);
      radioMesh.add(knob);
    }
    // Copper wire antenna coil
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.8, 6), brassMat);
    antenna.position.set(0.35, 0.65, 0);
    radioMesh.add(antenna);
    this.group.add(radioMesh);

    // Glowing Vacuum Tubes on top of radio
    for (const tx of [-0.15, 0.05]) {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.2, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffaa44,
          emissive: 0xff7711,
          emissiveIntensity: 2.2,
          roughness: 0.1,
          transparent: true,
          opacity: 0.85,
        })
      );
      tube.position.set(-0.9 + tx, 3.22, 74);
      this.group.add(tube);
    }

    // Kerosene Hurricane Lantern with Detailed Wire Cage, Chimney & Bail Handle
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0, 2.56, 74);

    const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.12, 10), metalMat);
    lanternBase.position.y = 0.06;
    lanternGroup.add(lanternBase);

    const glassGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xffe6a3,
        emissive: 0xffaa33,
        emissiveIntensity: 2.5,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8,
      })
    );
    glassGlobe.position.y = 0.22;
    lanternGroup.add(glassGlobe);

    // Top chimney cap & wire cage ribs
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.14, 10), metalMat);
    chimney.position.y = 0.38;
    lanternGroup.add(chimney);

    const bailHandle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 6, 16, Math.PI), metalMat);
    bailHandle.position.y = 0.45;
    lanternGroup.add(bailHandle);
    this.group.add(lanternGroup);

    this.campLanternLight = new THREE.PointLight(0xffaa44, 3.2, 22);
    this.campLanternLight.position.set(0, 2.9, 74);
    this.campLanternLight.castShadow = false;
    this.group.add(this.campLanternLight);

    // Dr. Sterling's Field Journal with Gilded Cover & Ribbon (Interactable)
    const journalGeo = new THREE.BoxGeometry(0.48, 0.09, 0.6);
    const journalMat = new THREE.MeshStandardMaterial({ color: 0x4a180e, roughness: 0.65 });
    const journalMesh = new THREE.Mesh(journalGeo, journalMat);
    journalMesh.position.set(0.6, 2.62, 74);
    journalMesh.rotation.y = 0.15;

    // Brass corner braces on journal
    const cornerMat = brassMat;
    const corner1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.095, 0.08), cornerMat);
    corner1.position.set(0.2, 0, 0.26);
    journalMesh.add(corner1);
    this.group.add(journalMesh);

    // Brass Field Magnifying Glass beside journal
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16), brassMat);
    lensRing.rotateX(Math.PI / 2);
    lensRing.position.set(0.95, 2.62, 73.8);
    const lensHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.22, 6), woodMat);
    lensHandle.rotateZ(Math.PI / 3);
    lensHandle.position.set(0.16, 0, 0.1);
    lensRing.add(lensHandle);
    this.group.add(lensRing);

    this.registerInteractable(journalMesh, {
      id: 'doc_camp_journal',
      title: "Dr. Sterling's Field Journal",
      verb: 'READ',
      distance: 3.5,
      position: [0.6, 2.62, 74],
      type: 'read',
    });

    // Golden Meridian Key Fragment (Detailed Archaeotectonic Solar Glyph Disc)
    const relicGroup = new THREE.Group();
    relicGroup.position.set(1.1, 2.68, 74.2);

    const relicGeo = new THREE.TorusGeometry(0.18, 0.045, 12, 24);
    const relicMesh = new THREE.Mesh(relicGeo, goldMat);
    relicMesh.rotation.x = Math.PI / 2;
    relicGroup.add(relicMesh);

    // Core Solar Ray Spikes
    for (let r = 0; r < 4; r++) {
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.15, 4), goldMat);
      ray.rotateZ((r * Math.PI) / 2);
      ray.position.set(Math.cos((r * Math.PI) / 2) * 0.18, 0, Math.sin((r * Math.PI) / 2) * 0.18);
      relicGroup.add(ray);
    }
    this.group.add(relicGroup);

    this.registerInteractable(relicGroup as any, {
      id: 'item_meridian_key_1',
      title: 'Meridian Solar Disc Fragment',
      verb: 'TAKE',
      distance: 3.2,
      position: [1.1, 2.68, 74.2],
      type: 'pickup',
    });

    // Wooden Crates with Aqueduct Clue Rubbing Paper
    const crateMat = woodMat;
    const crateMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), crateMat);
    crateMesh.position.set(-4.5, 2.45, 70);
    crateMesh.castShadow = true;
    crateMesh.receiveShadow = true;
    this.group.add(crateMesh);

    const rubbingPaperGeo = new THREE.PlaneGeometry(0.7, 0.9);
    rubbingPaperGeo.rotateX(-Math.PI / 2);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xe8d9bc, roughness: 0.9 });
    const rubbingMesh = new THREE.Mesh(rubbingPaperGeo, paperMat);
    rubbingMesh.position.set(-4.5, 3.12, 70);
    this.group.add(rubbingMesh);

    this.registerInteractable(rubbingMesh, {
      id: 'doc_water_clue',
      title: 'Aqueduct Glyphs Rubbing (Field Clue)',
      verb: 'EXAMINE',
      distance: 3.5,
      position: [-4.5, 3.12, 70],
      type: 'read',
    });

    // 3. Central Campfire with Stone Hearth & Glowing Charcoal
    const fireGroup = new THREE.Group();
    const ashMat = new THREE.MeshStandardMaterial({ color: 0x181512, roughness: 0.95 });

    const ashBed = new THREE.Mesh(new THREE.CircleGeometry(1.4, 16), ashMat);
    ashBed.rotateX(-Math.PI / 2);
    ashBed.position.y = 0.02;
    fireGroup.add(ashBed);

    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const r = 1.15;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), stoneMat);
      rock.position.set(Math.cos(angle) * r, 0.15, Math.sin(angle) * r);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      fireGroup.add(rock);
    }

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.3, 6), woodMat);
      log.rotation.x = Math.PI / 2;
      log.rotation.y = angle + 0.3;
      log.position.set(0, 0.12 + i * 0.06, 0);
      log.castShadow = true;
      fireGroup.add(log);
    }

    const emberMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff3300,
        emissive: new THREE.Color(0xff4400),
        emissiveIntensity: 3.0,
        roughness: 0.9,
      })
    );
    emberMesh.position.y = 0.2;
    emberMesh.scale.set(1.2, 0.5, 1.2);
    fireGroup.add(emberMesh);

    const campFireLight = new THREE.PointLight(0xff7722, 2.8, 16);
    campFireLight.position.set(0, 0.6, 0);
    campFireLight.castShadow = true;
    fireGroup.add(campFireLight);

    fireGroup.position.set(0, 2.2, 67);
    this.group.add(fireGroup);

    // ==========================================
    // ENVIRONMENTAL STORYTELLING: SIGNS OF SUDDEN DEPARTURE
    // ==========================================
    // 1. Overturned Expedition Camp Stool (Knocked over in a hurry)
    const stoolGroup = new THREE.Group();
    stoolGroup.position.set(0.7, 1.95, 73.2);
    stoolGroup.rotation.set(1.4, 0.2, 0.6); // Tumbled in the mud
    const stoolSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.45), tentMat);
    stoolGroup.add(stoolSeat);
    for (let s = -1; s <= 1; s += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), woodMat);
      leg.position.set(s * 0.18, -0.25, 0);
      leg.rotation.z = s * 0.25;
      stoolGroup.add(leg);
    }
    this.group.add(stoolGroup);

    // 2. Scattered 1928 Rations & Dented Canteen in the Dirt
    const tinMat = new THREE.MeshStandardMaterial({ color: 0x6e7068, roughness: 0.45, metalness: 0.7 });
    for (let t = 0; t < 3; t++) {
      const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), tinMat);
      tin.position.set(-0.6 + t * 0.35, 1.86, 65.5 + (t % 2) * 0.4);
      tin.rotation.set(Math.random() * 0.4, Math.random() * 3.14, 1.2);
      this.group.add(tin);
    }

    // Dented field canteen dropped in the grass
    const droppedCanteen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0x3d4239, roughness: 0.85 })
    );
    droppedCanteen.rotateZ(1.3);
    droppedCanteen.position.set(-1.2, 1.88, 66.2);
    this.group.add(droppedCanteen);

    // 3. Muddy Bootprint Trail leading from Camp toward the Ravine (Z: 72 -> 58)
    const mudPrintMat = new THREE.MeshStandardMaterial({
      color: 0x1a120b,
      roughness: 0.95,
      transparent: true,
      opacity: 0.65,
    });
    for (let p = 0; p < 7; p++) {
      const zStep = 72 - p * 2.0;
      const xOffset = (p % 2 === 0 ? -0.15 : 0.15) + Math.sin(p) * 0.2;
      const bootPrint = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.28), mudPrintMat);
      bootPrint.position.set(xOffset, 1.82, zStep);
      bootPrint.rotation.y = 0.08 * (p % 2 === 0 ? 1 : -1);
      this.group.add(bootPrint);
    }

    // 4. Brass Surveyor's Theodolite on Tripod
    const theodoliteGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 1.6, 5), woodMat);
      leg.position.set(Math.cos(angle) * 0.35, 0.75, Math.sin(angle) * 0.35);
      leg.rotation.z = Math.cos(angle) * 0.28;
      leg.rotation.x = Math.sin(angle) * 0.28;
      leg.castShadow = true;
      theodoliteGroup.add(leg);
    }
    const brassHead = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12), goldMat);
    brassHead.position.y = 1.5;
    theodoliteGroup.add(brassHead);

    const telescope = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.55, 10), goldMat);
    telescope.position.set(0, 1.6, 0);
    telescope.rotation.x = 0.35;
    telescope.castShadow = true;
    theodoliteGroup.add(telescope);

    theodoliteGroup.position.set(3.8, 2.3, 72);
    this.group.add(theodoliteGroup);

    // 5. Weathered Stone Flagstones peeking through mud along path
    for (let i = 0; i < 22; i++) {
      const pz = 76 - i * 2.5;
      const px = Math.sin(i * 1.3) * 0.8 + (Math.random() - 0.5) * 0.5;
      const py = 2.4 - (76 - pz) * 0.04;
      const flagstone = new THREE.Mesh(
        new THREE.BoxGeometry(1.4 + Math.random() * 0.6, 0.12, 1.2 + Math.random() * 0.5),
        stoneMat
      );
      flagstone.position.set(px, py, pz);
      flagstone.rotation.y = Math.random() * 0.3;
      flagstone.receiveShadow = true;
      this.group.add(flagstone);
    }

    // Volumetric jungle sunlight is handled by AtmosphereSystem's physically-based scattering shafts
    this.sunbeamMesh = null;
  }

  /**
   * 01B. THE OLD WATER MILL & STILLWATER LANDING (Z = 20 to 8)
   */
  private buildWaterMillAndLanding() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial(2, 2);
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(2, 2);
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.85 });

    // 1. Old Mill Stone Foundation & Timber House (X = -8.8, Z = 14.0)
    const millGroup = new THREE.Group();
    millGroup.position.set(-8.8, 0.2, 14.0);

    // Stone foundation
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.8, 6.0), stoneMat);
    foundation.position.y = -0.4;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    millGroup.add(foundation);
    this.addCollisionBox(-11.5, -2.0, 10.5, -6.5, 4.0, 17.5);

    // Timber walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 5.6), woodMat);
    walls.position.y = 2.2;
    walls.castShadow = true;
    millGroup.add(walls);

    // Pitched Shingle Roof
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 6.2), darkWoodMat);
    roofL.position.set(-1.0, 4.2, 0);
    roofL.rotation.z = 0.55;
    roofL.castShadow = true;
    millGroup.add(roofL);

    const roofR = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 6.2), darkWoodMat);
    roofR.position.set(1.0, 4.2, 0);
    roofR.rotation.z = -0.55;
    roofR.castShadow = true;
    millGroup.add(roofR);

    // Mill Window with warm amber glow
    const windowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 1.1),
      new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0xffa000,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      })
    );
    windowMesh.position.set(2.11, 2.2, 0);
    windowMesh.rotation.y = Math.PI / 2;
    millGroup.add(windowMesh);

    const windowLight = new THREE.PointLight(0xffaa33, 2.2, 14);
    windowLight.position.set(2.4, 2.2, 0);
    millGroup.add(windowLight);

    this.group.add(millGroup);

    // 2. Giant Rotating Overshot Water Wheel (12 spokes & paddles)
    this.waterMillWheel = new THREE.Group();
    this.waterMillWheel.position.set(-6.5, -1.2, 14.0);

    // Axle
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 12), darkWoodMat);
    axle.rotation.z = Math.PI / 2;
    this.waterMillWheel.add(axle);

    // Rim rings & spokes
    const numPaddles = 12;
    const wheelRadius = 2.4;

    for (let r = -0.35; r <= 0.35; r += 0.7) {
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(wheelRadius, 0.08, 8, 24),
        darkWoodMat
      );
      rim.rotation.y = Math.PI / 2;
      rim.position.x = r;
      this.waterMillWheel.add(rim);
    }

    for (let i = 0; i < numPaddles; i++) {
      const angle = (i / numPaddles) * Math.PI * 2;

      // Wooden Spoke
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, wheelRadius * 2, 6), darkWoodMat);
      spoke.position.set(0, 0, 0);
      spoke.rotation.x = angle;
      this.waterMillWheel.add(spoke);

      // Water Scoop Bucket / Paddle
      const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.06), woodMat);
      paddle.position.set(
        0,
        Math.sin(angle) * (wheelRadius - 0.15),
        Math.cos(angle) * (wheelRadius - 0.15)
      );
      paddle.rotation.x = angle + 0.35; // Angled scoop
      paddle.castShadow = true;
      this.waterMillWheel.add(paddle);
    }

    this.group.add(this.waterMillWheel);

    // 3. Elevated Wooden Sluice Flume delivering water to wheel
    const flumeGeo = new THREE.BoxGeometry(0.9, 0.25, 8.0);
    const flume = new THREE.Mesh(flumeGeo, woodMat);
    flume.position.set(-6.5, 1.4, 18.0);
    flume.castShadow = true;
    this.group.add(flume);

    // 4. Stillwater Pier & Wooden Boat Landing Dock (Z = 12.0)
    const pierGroup = new THREE.Group();
    pierGroup.position.set(-6.0, -1.6, 12.0);

    // Pier deck planks
    const deckPlanks = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 2.2), woodMat);
    deckPlanks.castShadow = true;
    deckPlanks.receiveShadow = true;
    pierGroup.add(deckPlanks);

    // Pier support pilings driven into riverbed
    const pilings = [
      [-1.8, -1.2, -0.8],
      [-1.8, -1.2, 0.8],
      [1.8, -1.2, -0.8],
      [1.8, -1.2, 0.8],
    ];
    pilings.forEach(([px, py, pz]) => {
      const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8), darkWoodMat);
      pile.position.set(px, py, pz);
      pile.castShadow = true;
      pierGroup.add(pile);
    });

    // Mooring Bollard on dock edge
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.5, 8), darkWoodMat);
    bollard.position.set(1.6, 0.3, 0.8);
    pierGroup.add(bollard);

    // Dock Wooden Lantern Post
    const dockLantern = new THREE.PointLight(0xffb74d, 1.5, 10);
    dockLantern.position.set(-1.8, 1.2, 0.8);
    pierGroup.add(dockLantern);

    const dockLanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), darkWoodMat);
    dockLanternPost.position.set(-1.8, 0.6, 0.8);
    pierGroup.add(dockLanternPost);

    this.group.add(pierGroup);
    this.addCollisionBox(-8.2, -2.0, 10.8, -3.8, 0.5, 13.2);

    // Register Dock Boat Boarding Interactable Target
    const dockTarget = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), new THREE.MeshBasicMaterial({ visible: false }));
    dockTarget.position.set(-4.0, -1.4, 12.0);
    this.group.add(dockTarget);

    this.registerInteractable(dockTarget, {
      id: 'boat_dock_landing',
      title: 'Wooden Rowboat at Mill Landing',
      verb: 'BOARD BOAT',
      distance: 4.5,
      position: [-4.0, -1.4, 12.0],
      type: 'rotate', // Triggers boat boarding toggle
    });
  }

  /**
   * 02. JUNGLE TRAIL & 03. RIVER RUINS (Z = 55 to -30)
   */
  private buildJungleTrailAndRuins() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(2, 4);
    const glyphMat = ProceduralTextureGenerator.getCarvedGlyphMaterial(0x38bdf8, false);

    // Ancient Monolithic Waystone Steles with Relief Carvings
    for (let i = 0; i < 4; i++) {
      const z = 45 - i * 18;
      const x = i % 2 === 0 ? 5.8 : -5.8;

      const steleGroup = new THREE.Group();
      // Tiered base
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.4), stoneMat);
      steleGroup.add(base);

      // Carved vertical shaft
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.8, 0.8), glyphMat);
      shaft.position.y = 2.7;
      shaft.castShadow = true;
      steleGroup.add(shaft);

      // Pyramidal apex cap
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.8, 4), stoneMat);
      cap.position.y = 5.5;
      cap.rotateY(Math.PI / 4);
      steleGroup.add(cap);

      steleGroup.position.set(x, 1.2, z);
      steleGroup.rotation.y = (Math.random() - 0.5) * 0.3;
      this.group.add(steleGroup);
      this.addCollisionBox(x - 1.2, -1, z - 1.2, x + 1.2, 6, z + 1.2);
    }

    // Interactive Stele Inscription Tablet
    const interactiveStele = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.2, 1.0), glyphMat);
    interactiveStele.position.set(-4.5, -0.2, 22);
    interactiveStele.castShadow = true;
    this.group.add(interactiveStele);
    this.addCollisionBox(-5.5, -2, 21, -3.5, 4.5, 23);

    this.registerInteractable(interactiveStele, {
      id: 'doc_trail_stele',
      title: 'Monolithic Waystone Inscription',
      verb: 'DECIPHER',
      distance: 4.0,
      position: [-4.5, 0.8, 22],
      type: 'read',
    });

    // River Bridge Monolithic Columns & Stepping Stones
    for (const x of [-6.5, 6.5]) {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 8, 10), stoneMat);
      pylon.position.set(x, 0.6, -5);
      pylon.castShadow = true;
      this.group.add(pylon);
      this.addCollisionBox(x - 1.6, -3, -6.6, x + 1.6, 5, -3.4);
    }

    // Weathered stepping stones across river with mossy PBR tops
    for (let i = 0; i < 6; i++) {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.8, 8), stoneMat);
      stone.position.set((i - 2.5) * 2.2, -2.1, -5 + (i % 2 === 0 ? 0.7 : -0.7));
      stone.receiveShadow = true;
      this.group.add(stone);
    }

    // 03B. Ancient Astrolabe Stele (Interactive Cipher Wheel Minigame)
    const astrolabeGroup = new THREE.Group();
    const astroBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.9, 12), stoneMat);
    astroBase.castShadow = true;
    astroBase.receiveShadow = true;
    astrolabeGroup.add(astroBase);

    // Carved stele slab with brass astronomical rings
    const astroSlab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.6, 0.5), glyphMat);
    astroSlab.position.set(0, 2.2, 0);
    astroSlab.castShadow = true;
    astrolabeGroup.add(astroSlab);

    // Concentric brass dial rings on stele face
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc89d3a, metalness: 0.9, roughness: 0.28 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 24), brassMat);
    ring1.position.set(0, 2.4, 0.28);
    astrolabeGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 8, 20), brassMat);
    ring2.position.set(0, 2.4, 0.29);
    astrolabeGroup.add(ring2);

    const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    }));
    coreCrystal.position.set(0, 2.4, 0.32);
    astrolabeGroup.add(coreCrystal);

    astrolabeGroup.position.set(5.2, 0.2, -18);
    this.group.add(astrolabeGroup);
    this.addCollisionBox(4.0, -1.0, -19.2, 6.4, 4.5, -16.8);

    this.registerInteractable(astroSlab, {
      id: 'stele_cipher_wheel',
      title: 'Celestial Astrolabe Stele',
      verb: 'DECIPHER ASTROLABE',
      distance: 4.2,
      position: [5.2, 2.2, -18],
      type: 'inspect',
    });

    // 03C. Submerged Sunken Treasures (Salvageable in River & Waterfall Pool)
    const goldMat = ProceduralTextureGenerator.getAncientGoldMaterial();
    const jadeMat = ProceduralTextureGenerator.getCarvedGlyphMaterial(0x10b981, true);

    // 1. Sunken Gilded Urn on Riverbed (X = 1.5, Y = -2.85, Z = -12)
    const sunkenUrn1 = new THREE.Group();
    const urnBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.55, 10), goldMat);
    const urnNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.2, 10), goldMat);
    urnNeck.position.y = 0.35;
    sunkenUrn1.add(urnBody);
    sunkenUrn1.add(urnNeck);
    sunkenUrn1.position.set(1.5, -2.85, -12);
    sunkenUrn1.rotation.z = 0.45;
    this.group.add(sunkenUrn1);

    this.registerInteractable(urnBody, {
      id: 'pickup_sunken_urn_1',
      title: 'Sunken Gilded Urn',
      verb: 'SALVAGE URN',
      distance: 3.5,
      position: [1.5, -2.85, -12],
      type: 'pickup',
    });

    // 2. Submerged Jade Amphora in Deep Waterfall Pool (X = -1.8, Y = -5.4, Z = -46)
    const sunkenJade2 = new THREE.Group();
    const amphoraBody = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), jadeMat);
    const amphoraHandles = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12), goldMat);
    sunkenJade2.add(amphoraBody);
    sunkenJade2.add(amphoraHandles);
    sunkenJade2.position.set(-1.8, -5.4, -46);
    sunkenJade2.rotation.y = 0.8;
    this.group.add(sunkenJade2);

    this.registerInteractable(amphoraBody, {
      id: 'pickup_sunken_jade_2',
      title: 'Submerged Jade Amphora',
      verb: 'SALVAGE AMPHORA',
      distance: 3.8,
      position: [-1.8, -5.4, -46],
      type: 'pickup',
    });
  }

  /**
   * 04. WATERFALL & 05. HIDDEN GROTTO (Z = -35 to -65)
   */
  private buildWaterfallAndGrotto() {
    const basaltMat = ProceduralTextureGenerator.getBasaltCliffMaterial(6, 6);
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(4, 4);

    // Natural Stepped Basalt Cliffs Flanking the Waterfall
    for (const side of [-1, 1]) {
      const cliffX = side * 15;
      const cliffGroup = new THREE.Group();

      for (let tier = 0; tier < 3; tier++) {
        const w = 14 + tier * 2;
        const h = 8.0;
        const l = 16;
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), basaltMat);
        block.position.set(side * 2, -10 + tier * 6.5, -45);
        block.castShadow = true;
        block.receiveShadow = true;
        cliffGroup.add(block);
      }
      cliffGroup.position.set(cliffX, 0, 0);
      this.group.add(cliffGroup);

      if (side < 0) this.addCollisionBox(-24, -16, -52, -7, 8, -38);
      else this.addCollisionBox(7, -16, -52, 24, 8, -38);
    }

    // Massive Ancient Grotto Cave Archway behind waterfall (Z = -58)
    const archGeo = new THREE.TorusGeometry(5.5, 2.2, 10, 20, Math.PI);
    const archMesh = new THREE.Mesh(archGeo, stoneMat);
    archMesh.position.set(0, -12, -58);
    archMesh.castShadow = true;
    this.group.add(archMesh);
  }

  /**
   * 06. AQUEDUCT PUZZLE CHAMBER (Z = -65 to -95)
   * 3 Rotatable Stone Dials with Carved Flow Channels and Glyphs
   */
  private buildAqueductPuzzleChamber() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(3, 3);
    const glyphMat = ProceduralTextureGenerator.getCarvedGlyphMaterial(0x38bdf8, false);
    const bronzeMat = ProceduralTextureGenerator.getAncientGoldMaterial();

    // 3 Stone Dial Pedestals with Bronze Gear Trims
    const dialPositions: [number, number, number][] = [
      [-4.2, -13.0, -78],
      [0.0, -13.0, -82],
      [4.2, -13.0, -78],
    ];

    dialPositions.forEach((pos, idx) => {
      // Pedestal column
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 1.6, 10), stoneMat);
      pedestal.position.set(pos[0], pos[1], pos[2]);
      pedestal.castShadow = true;
      this.group.add(pedestal);
      this.addCollisionBox(pos[0] - 1.0, -15, pos[2] - 1.0, pos[0] + 1.0, -11.5, pos[2] + 1.0);

      // Bronze toothed rim
      const bronzeRim = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 6, 24), bronzeMat);
      bronzeRim.position.set(pos[0], pos[1] + 0.8, pos[2]);
      bronzeRim.rotateX(Math.PI / 2);
      this.group.add(bronzeRim);

      // Rotatable Disc Dial on top with carved fluid channel
      const dialGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 20);
      const dial = new THREE.Mesh(dialGeo, glyphMat);
      dial.position.set(pos[0], pos[1] + 0.8, pos[2]);
      dial.castShadow = true;
      this.group.add(dial);

      // Carved Solarian Astronomical Glyph Marker Pointer on the dial rim
      const pointerGeo = new THREE.ConeGeometry(0.12, 0.32, 4);
      pointerGeo.rotateX(Math.PI / 2);
      const pointer = new THREE.Mesh(pointerGeo, bronzeMat);
      pointer.position.set(0, 0.22, 0.72);
      dial.add(pointer);

      if (idx === 0) this.waterDial1 = dial;
      if (idx === 1) this.waterDial2 = dial;
      if (idx === 2) this.waterDial3 = dial;

      const dialNames = [
        'Dawn Conduit Dial (Sol-Khor I — Rising Sun Flume)',
        'Zenith Conduit Dial (Sol-Atlan II — High Noon Flume)',
        'Twilight Conduit Dial (Sol-Vea III — Evening Flume)',
      ];

      this.registerInteractable(dial, {
        id: `puzzle_dial_${idx + 1}`,
        title: dialNames[idx],
        verb: 'ALIGN CONDUIT',
        distance: 3.5,
        position: [pos[0], pos[1] + 0.8, pos[2]],
        type: 'rotate',
        data: { dialIndex: idx + 1 },
      });
    });

    // Heavy Sunken Portcullis Stone Gate (Z = -92)
    const gateGeo = new THREE.BoxGeometry(8.5, 7.5, 0.9);
    this.sunkenGateMesh = new THREE.Mesh(gateGeo, stoneMat);
    this.sunkenGateMesh.position.set(0, -11.0, -92);
    this.sunkenGateMesh.castShadow = true;
    this.group.add(this.sunkenGateMesh);
    this.sunkenGateBox = this.addCollisionBox(-4.8, -16, -92.6, 4.8, -6, -91.4);
  }

  /**
   * 07. GRAND MONUMENTAL TEMPLE OF THE SUN (Z = -95 to -130)
   * Stepped pyramid facade, carved cornice mouldings, and ceremonial fire braziers
   */
  private buildMonumentalTempleExterior() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(4, 4);
    const glyphMat = ProceduralTextureGenerator.getCarvedGlyphMaterial(0xffb703, false);

    // 5 Monumental Stepped Pyramid Tiers with Carved Cornices
    for (let step = 0; step < 5; step++) {
      const w = 40 - step * 4.5;
      const h = 2.2;
      const l = 9.0;
      const z = -104 - step * 5.5;
      const y = -12.0 + step * 2.0;

      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), stoneMat);
      stepMesh.position.set(0, y, z);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      this.group.add(stepMesh);

      // Cornice band trim
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, l + 0.6), glyphMat);
      cornice.position.set(0, y + h / 2, z);
      this.group.add(cornice);
    }

    // Colossal Guardian Statues with Headdress & Shield Flanking Portal
    for (const x of [-7.5, 7.5]) {
      const guardianGroup = new THREE.Group();

      // Plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 3.0), stoneMat);
      guardianGroup.add(plinth);

      // Body & Armor
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 2.2), glyphMat);
      body.position.y = 4.2;
      guardianGroup.add(body);

      // Carved Ceremonial Mask / Headdress
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.8), glyphMat);
      head.position.y = 8.8;
      guardianGroup.add(head);

      guardianGroup.position.set(x, -5.5, -128);
      guardianGroup.castShadow = true;
      this.group.add(guardianGroup);
      this.addCollisionBox(x - 1.8, -6, -130, x + 1.8, 5, -126);
    }

    // Ceremonial Braziers with Burning Coals, Flickering Light & Sparks
    for (const x of [-4.5, 4.5]) {
      const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.45, 1.4, 8), stoneMat);
      brazier.position.set(x, -5.2, -125);
      brazier.castShadow = true;
      this.group.add(brazier);

      // Glowing Ember Coals
      const embers = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6611 })
      );
      embers.position.set(x, -4.4, -125);
      this.group.add(embers);

      const fireLight = new THREE.PointLight(0xff7722, 2.8, 14);
      fireLight.position.set(x, -4.2, -125);
      fireLight.castShadow = true;
      this.group.add(fireLight);
    }
  }

  /**
   * 08. TEMPLE INTERIOR & SOLAR PRISM HALL (Z = -130 to -170)
   * Vaulted stone hall, skylight light shaft, and rotatable crystalline prism obelisks
   */
  private buildTempleInteriorAndPrisms() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(4, 4);
    const goldMat = ProceduralTextureGenerator.getAncientGoldMaterial();
    const crystalMat = ProceduralTextureGenerator.getCrystalGlassMaterial();

    // Vaulted Hall Lateral Stone Walls & Ceiling
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(2.5, 15, 42), stoneMat);
    wallLeft.position.set(-11.5, 0.5, -150);
    this.group.add(wallLeft);
    this.addCollisionBox(-13, -7, -171, -10, 8, -129);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(2.5, 15, 42), stoneMat);
    wallRight.position.set(11.5, 0.5, -150);
    this.group.add(wallRight);
    this.addCollisionBox(10, -7, -171, 13, 8, -129);

    // Skylight aperture roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(22, 2, 42), stoneMat);
    roof.position.set(0, 8.0, -150);
    this.group.add(roof);

    // 3 Rotatable Crystalline Prisms on Bronze Gimbal Mounts
    const prismPositions: [number, number, number][] = [
      [-5.0, -5.0, -138],
      [4.5, -5.0, -148],
      [-3.5, -5.0, -158],
    ];

    prismPositions.forEach((pos, idx) => {
      // Carved stone plinth
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.85, 2.0, 8), stoneMat);
      stand.position.set(pos[0], pos[1], pos[2]);
      stand.castShadow = true;
      this.group.add(stand);
      this.addCollisionBox(pos[0] - 0.8, -6, pos[2] - 0.8, pos[0] + 0.8, -3, pos[2] + 0.8);

      // Bronze gimbal bracket
      const bracket = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.08, 6, 16, Math.PI), goldMat);
      bracket.position.set(pos[0], pos[1] + 1.4, pos[2]);
      bracket.rotateX(Math.PI / 2);
      this.group.add(bracket);

      // Faceted Crystalline Obelisk Prism
      const prismGeo = new THREE.OctahedronGeometry(0.7, 0);
      prismGeo.scale(1, 1.8, 1);
      const prism = new THREE.Mesh(prismGeo, crystalMat);
      prism.position.set(pos[0], pos[1] + 1.8, pos[2]);
      prism.castShadow = true;
      this.group.add(prism);

      if (idx === 0) this.lightPrism1 = prism;
      if (idx === 1) this.lightPrism2 = prism;
      if (idx === 2) this.lightPrism3 = prism;

      this.registerInteractable(prism, {
        id: `puzzle_prism_${idx + 1}`,
        title: `Solar Crystal Reflector ${idx + 1}`,
        verb: 'ALIGN',
        distance: 3.5,
        position: [pos[0], pos[1] + 1.8, pos[2]],
        type: 'rotate',
        data: { prismIndex: idx + 1 },
      });
    });

    // Central Meridian Solar Crest Target on Back Wall (Z = -168)
    const crestGroup = new THREE.Group();
    const crestOuter = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.35, 12, 32), goldMat);
    crestGroup.add(crestOuter);

    const crestCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16),
      ProceduralTextureGenerator.getCarvedGlyphMaterial(0xffd166, true)
    );
    crestCenter.rotateX(Math.PI / 2);
    crestGroup.add(crestCenter);

    crestGroup.position.set(0, -2.5, -168);
    this.solarCrestMesh = crestGroup as any;
    this.group.add(crestGroup);

    // ==========================================
    // ENVIRONMENTAL STORYTELLING: SCORCHED SOLAR SURGE MARKS & PRISM SHARDS
    // ==========================================
    // Scorched radial blast ring on the back basalt wall from the 780 CE Cataclysm
    const sootMat = new THREE.MeshStandardMaterial({
      color: 0x120e0a,
      roughness: 0.98,
      transparent: true,
      opacity: 0.85,
    });
    const blastMark = new THREE.Mesh(new THREE.RingGeometry(1.6, 5.2, 18), sootMat);
    blastMark.position.set(0, -2.5, -168.4);
    this.group.add(blastMark);

    // Shattered crystalline prism shards scattered across the temple stone floor
    const shardMat = ProceduralTextureGenerator.getCrystalGlassMaterial();
    for (let s = 0; s < 12; s++) {
      const angle = (s / 12) * Math.PI * 2;
      const dist = 1.2 + Math.random() * 2.5;
      const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.12 + Math.random() * 0.15), shardMat);
      shard.position.set(Math.cos(angle) * dist, -5.9, -150 + Math.sin(angle) * dist);
      shard.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      shard.castShadow = true;
      this.group.add(shard);
    }

    // Inner Sanctuary Gate (Descending stone portal)
    const innerGateGeo = new THREE.BoxGeometry(6.5, 8.5, 1.2);
    this.templeInnerGate = new THREE.Mesh(innerGateGeo, stoneMat);
    this.templeInnerGate.position.set(0, -3.0, -169);
    this.templeInnerGate.castShadow = true;
    this.group.add(this.templeInnerGate);
    this.innerGateBox = this.addCollisionBox(-3.8, -6, -170, 3.8, 4, -168);
  }

  /**
   * 09. UNDERGROUND CHASM & DESCENT (Z = -170 to -210)
   */
  private buildUndergroundChasm() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(4, 4);

    // Subterranean Suspension Bridge with Runic Pylons
    const bridgeGeo = new THREE.BoxGeometry(4.8, 0.5, 38);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, stoneMat);
    bridgeMesh.position.set(0, -15.0, -190);
    bridgeMesh.rotation.x = 0.45;
    bridgeMesh.receiveShadow = true;
    bridgeMesh.castShadow = true;
    this.group.add(bridgeMesh);

    // Bioluminescent Cyan Crystal Clusters along Chasm Edge
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 2.2,
      roughness: 0.15,
      metalness: 0.2,
    });

    for (let i = 0; i < 22; i++) {
      const z = -174 - i * 1.8;
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (7.5 + Math.random() * 2.0);
      const y = -8.0 - (i / 22) * 14.0;

      const cluster = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 5), crystalMat);
      cluster.position.set(x, y, z);
      cluster.rotation.z = -side * 0.4;
      this.group.add(cluster);
    }
  }

  /**
   * 10. THE MERIDIAN SANCTUARY & FINAL ACTIVATION (Z = -210 to -260)
   * Circular abyss amphitheater, floating concentric Meridian Core, and runic floor channels
   */
  private buildMeridianSanctuary() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(4, 4);
    const goldMat = ProceduralTextureGenerator.getAncientGoldMaterial();
    const coreMat = ProceduralTextureGenerator.getMeridianCoreMaterial();

    // Circular Monolithic Arena (Center Z = -235, Y = -24.0)
    const arenaGeo = new THREE.CylinderGeometry(25, 27, 4.5, 40);
    const arena = new THREE.Mesh(arenaGeo, stoneMat);
    arena.position.set(0, -26.2, -235);
    arena.receiveShadow = true;
    this.group.add(arena);

    // 12 Colossal Perimeter Vault Columns
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const x = Math.cos(angle) * 23;
      const z = -235 + Math.sin(angle) * 23;

      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 22, 10), stoneMat);
      col.position.set(x, -14.0, z);
      col.castShadow = true;
      this.group.add(col);
      this.addCollisionBox(x - 1.6, -24, z - 1.6, x + 1.6, -4, z + 1.6);
    }

    // 8 Runic Floor Channels radiating from the Altar to the Core
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const channelGeo = new THREE.BoxGeometry(0.5, 0.06, 17);
      const channelMat = new THREE.MeshStandardMaterial({
        color: 0x122634,
        emissive: new THREE.Color(0x0284c7),
        emissiveIntensity: 0.35,
      });
      const channel = new THREE.Mesh(channelGeo, channelMat);
      channel.position.set(Math.cos(angle) * 8.5, -23.94, -235 + Math.sin(angle) * 8.5);
      channel.rotation.y = -angle;
      this.group.add(channel);
      this.runicFloorChannels.push(channel);
    }

    // Central Activation Altar Pedestal
    const altarBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 1.5, 10), goldMat);
    altarBase.position.set(0, -23.2, -225);
    altarBase.castShadow = true;
    this.group.add(altarBase);
    this.addCollisionBox(-1.8, -24, -226.8, 1.8, -22, -223.2);

    this.meridianAltar = altarBase;
    this.registerInteractable(altarBase, {
      id: 'altar_meridian_core',
      title: 'The Meridian Activation Keystole',
      verb: 'AWAKEN THE MERIDIAN',
      distance: 3.8,
      position: [0, -22.4, -225],
      type: 'altar',
    });

    // FLOATING CONCENTRIC MERIDIAN CORE (X = 0, Y = -18.0, Z = -235)
    // 1. Central Pulsating Celestial Energy Sphere
    const coreSphereGeo = new THREE.IcosahedronGeometry(2.6, 4);
    this.meridianCoreSphere = new THREE.Mesh(coreSphereGeo, coreMat);
    this.meridianCoreSphere.position.set(0, -18.0, -235);
    this.group.add(this.meridianCoreSphere);

    // 2. Concentric Orbiting Golden Runic Rings
    const ring1Geo = new THREE.TorusGeometry(4.2, 0.28, 10, 48);
    this.meridianRing1 = new THREE.Mesh(ring1Geo, goldMat);
    this.meridianRing1.position.set(0, -18.0, -235);
    this.group.add(this.meridianRing1);

    const ring2Geo = new THREE.TorusGeometry(6.4, 0.28, 10, 48);
    this.meridianRing2 = new THREE.Mesh(ring2Geo, goldMat);
    this.meridianRing2.position.set(0, -18.0, -235);
    this.group.add(this.meridianRing2);

    const ring3Geo = new THREE.TorusGeometry(8.6, 0.28, 10, 48);
    this.meridianRing3 = new THREE.Mesh(ring3Geo, goldMat);
    this.meridianRing3.position.set(0, -18.0, -235);
    this.group.add(this.meridianRing3);

    // Core Radiant Point Light
    this.meridianEnergyLight = new THREE.PointLight(0x38bdf8, 4.5, 45);
    this.meridianEnergyLight.position.set(0, -18.0, -235);
    this.group.add(this.meridianEnergyLight);
  }

  public update(delta: number, time: number, isActivated: boolean) {
    const spinSpeed = isActivated ? 3.8 : 0.65;

    // Smoothly rotate the Water Mill Wheel (1.2 radians per sec)
    if (this.waterMillWheel) {
      this.waterMillWheel.rotation.x = time * 0.75;
    }

    if (this.meridianRing1) {
      this.meridianRing1.rotation.x = time * 0.45 * spinSpeed;
      this.meridianRing1.rotation.y = time * 0.6 * spinSpeed;
    }
    if (this.meridianRing2) {
      this.meridianRing2.rotation.y = -time * 0.5 * spinSpeed;
      this.meridianRing2.rotation.z = time * 0.35 * spinSpeed;
    }
    if (this.meridianRing3) {
      this.meridianRing3.rotation.x = -time * 0.3 * spinSpeed;
      this.meridianRing3.rotation.z = -time * 0.45 * spinSpeed;
    }

    if (this.meridianCoreSphere) {
      this.meridianCoreSphere.position.y = -18.0 + Math.sin(time * 1.5) * 0.4;
      this.meridianCoreSphere.rotation.y = time * 0.3;
    }

    if (this.meridianEnergyLight) {
      const pulse = Math.sin(time * 3.5) * 0.6 + (isActivated ? 7.0 : 3.8);
      this.meridianEnergyLight.intensity = pulse;
    }

    // Subtle sunbeam sway
    if (this.sunbeamMesh) {
      this.sunbeamMesh.rotation.z = 0.35 + Math.sin(time * 0.5) * 0.02;
    }

    // Dynamic flickering flame illumination for lit braziers
    this.braziers.forEach((brazier, idx) => {
      if (brazier.isLit) {
        const flicker = Math.sin(time * 14.0 + idx * 2.5) * 0.35 + Math.cos(time * 22.0 + idx) * 0.15;
        brazier.light.intensity = 3.2 + flicker;
        brazier.flameMesh.scale.set(
          1.0 + Math.sin(time * 16.0 + idx) * 0.12,
          1.0 + Math.cos(time * 12.0 + idx) * 0.18,
          1.0 + Math.sin(time * 18.0 + idx) * 0.12
        );
      }
    });

    // Spin weather station anemometer in the breeze
    if (this.anemometerMesh) {
      this.anemometerMesh.rotation.y += delta * 4.2;
    }

    // Pythagorean Sonar Wavefront Expansion
    if (this.sonarWaveActive && this.sonarWaveMesh && this.sonarWaveMaterial) {
      this.sonarWaveRadius += delta * 26.0;
      const s = Math.max(0.1, this.sonarWaveRadius);
      this.sonarWaveMesh.scale.set(s, s, s);
      const alpha = Math.max(0, 1.0 - this.sonarWaveRadius / 60.0);
      this.sonarWaveMaterial.opacity = alpha * 0.45;
      if (this.sonarWaveRadius >= 60.0) {
        this.sonarWaveActive = false;
        this.sonarWaveMesh.visible = false;
      }
    }
  }

  /**
   * 10. SUBTERRANEAN ANCIENT BRAZIER NETWORK
   */
  private buildSubterraneanBraziers() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(2, 2);
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x8c6239,
      metalness: 0.85,
      roughness: 0.35,
    });
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffaa33,
      emissive: 0xff5500,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const brazierPositions: [number, number, number, string][] = [
      [-3.5, -2.1, -55, 'brazier_1'],
      [3.5, -2.1, -78, 'brazier_2'],
      [-4.5, -1.0, -160, 'brazier_3'],
      [4.5, -2.2, -205, 'brazier_4'],
    ];

    brazierPositions.forEach(([bx, by, bz, id], idx) => {
      const group = new THREE.Group();

      // Fluted stone pedestal
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.2, 10), stoneMat);
      pedestal.position.y = 0.6;
      pedestal.castShadow = true;
      group.add(pedestal);

      // Bronze serpent fire bowl
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.45, 12, 1, true), bronzeMat);
      bowl.position.y = 1.35;
      bowl.castShadow = true;
      group.add(bowl);

      // Internal charcoal bed
      const charcoal = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.1, 10), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }));
      charcoal.position.y = 1.25;
      group.add(charcoal);

      // Flame Mesh (Visible when lit)
      const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), flameMat);
      flame.position.y = 1.65;
      flame.visible = false;
      group.add(flame);

      // Dynamic Firelight (PointLight, starts at 0 intensity)
      const light = new THREE.PointLight(0xff7722, 0, 18);
      light.position.y = 1.85;
      group.add(light);

      group.position.set(bx, by, bz);
      this.group.add(group);
      this.addCollisionBox(bx - 0.7, by - 0.5, bz - 0.7, bx + 0.7, by + 2.0, bz + 0.7);

      this.braziers.push({
        id,
        mesh: group,
        light,
        flameMesh: flame,
        isLit: false,
      });

      this.registerInteractable(bowl, {
        id,
        title: `Ancient Serpent Brazier ${idx + 1}`,
        verb: 'IGNITE BRAZIER',
        distance: 3.8,
        position: [bx, by + 1.2, bz],
        type: 'brazier',
      });
    });
  }

  /**
   * 11. ARCHAEOLOGICAL SEDIMENT EXCAVATION MOUNDS
   */
  private buildExcavationMounds() {
    const dirtMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e28,
      roughness: 0.9,
    });
    const relicMat = ProceduralTextureGenerator.getAncientGoldMaterial();

    const moundPositions: [number, number, number, string, string][] = [
      [4.5, 1.0, 66, 'excavation_mound_1', 'Camp Loam Sediment Mound'],
      [-6.2, -1.8, 2, 'excavation_mound_2', 'Riverbank Sandy Silt Deposit'],
      [-6.5, 0.6, -115, 'excavation_mound_3', 'Temple Terrace Gravel Pit'],
    ];

    moundPositions.forEach(([mx, my, mz, id, title]) => {
      const moundGroup = new THREE.Group();

      // Rounded irregular dirt mound
      const moundGeo = new THREE.CylinderGeometry(1.6, 2.2, 0.45, 12);
      moundGeo.scale(1.2, 1.0, 1.0);
      const moundMesh = new THREE.Mesh(moundGeo, dirtMat);
      moundMesh.position.y = 0.2;
      moundMesh.receiveShadow = true;
      moundGroup.add(moundMesh);

      // Protruding artifact / bone shard
      const shard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.25), relicMat);
      shard.position.set(0.2, 0.35, 0.1);
      shard.rotation.set(0.3, 0.4, 0.2);
      moundGroup.add(shard);

      moundGroup.position.set(mx, my, mz);
      this.group.add(moundGroup);

      this.registerInteractable(moundMesh, {
        id,
        title,
        verb: 'EXCAVATE SITE',
        distance: 3.8,
        position: [mx, my + 0.3, mz],
        type: 'excavate',
      });
    });
  }

  public igniteBrazier(id: string): { isAllLit: boolean; count: number } {
    const brazier = this.braziers.find((b) => b.id === id);
    if (brazier && !brazier.isLit) {
      brazier.isLit = true;
      brazier.flameMesh.visible = true;
      brazier.light.intensity = 3.5;
      this.litBraziersCount++;
    }
    return {
      isAllLit: this.litBraziersCount === this.braziers.length,
      count: this.litBraziersCount,
    };
  }

  /**
   * 12. EXPEDITION SCIENTIFIC INSTRUMENTS (WEATHER STATION & MARCONI WIRELESS TELEGRAPH)
   */
  private buildExpeditionScientificInstruments() {
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25,
    });
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.6, roughness: 0.4 });

    // A. 1928 Aneroid Barometer & Wind Station Tripod Stand
    const weatherStationGroup = new THREE.Group();
    // Wooden Tripod Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), woodMat);
      leg.position.set(Math.cos(angle) * 0.35, 0.65, Math.sin(angle) * 0.35);
      leg.rotation.z = Math.cos(angle) * -0.25;
      leg.rotation.x = Math.sin(angle) * 0.25;
      weatherStationGroup.add(leg);
    }
    // Brass Barometer Housing Drum
    const barometerDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16), brassMat);
    barometerDrum.position.y = 1.35;
    barometerDrum.rotation.x = Math.PI * 0.5;
    weatherStationGroup.add(barometerDrum);

    // Glass Face
    const glassFace = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), new THREE.MeshStandardMaterial({ color: 0xf5eedd, roughness: 0.2 }));
    glassFace.position.set(0, 1.35, 0.13);
    weatherStationGroup.add(glassFace);

    // Spinning 4-Cup Anemometer Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), ironMat);
    mast.position.y = 1.7;
    weatherStationGroup.add(mast);

    this.anemometerMesh = new THREE.Group();
    this.anemometerMesh.position.y = 2.0;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 4), ironMat);
      arm.rotation.z = Math.PI * 0.5;
      arm.rotation.y = a;
      this.anemometerMesh.add(arm);

      const cup = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8, 0, Math.PI), brassMat);
      cup.position.set(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22);
      cup.rotation.y = a;
      this.anemometerMesh.add(cup);
    }
    weatherStationGroup.add(this.anemometerMesh);

    weatherStationGroup.position.set(3.2, 1.0, 71.0);
    this.group.add(weatherStationGroup);
    this.addCollisionBox(2.7, 0.5, 70.5, 3.7, 2.2, 71.5);

    this.registerInteractable(barometerDrum, {
      id: 'weather_station_camp',
      title: '1928 Aneroid Barometer & Microclimate Station',
      verb: 'INSPECT WEATHER STATION',
      distance: 3.5,
      position: [3.2, 1.4, 71.0],
      type: 'inspect',
    });

    // B. Marconi Spark-Gap Wireless Telegraph Desk
    const radioDesk = new THREE.Group();
    // Desk table
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.9), woodMat);
    tableTop.position.y = 0.85;
    radioDesk.add(tableTop);

    // Marconi apparatus wooden chassis
    const radioBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.6 }));
    radioBox.position.set(0, 1.1, 0);
    radioDesk.add(radioBox);

    // Glowing vacuum tubes
    for (let i = 0; i < 3; i++) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0xffbb44, emissive: 0xff6600, emissiveIntensity: 1.5 }));
      tube.position.set(-0.25 + i * 0.25, 1.38, 0.05);
      radioDesk.add(tube);
    }

    // Brass Morse tapper key
    const morseKey = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.25), brassMat);
    morseKey.position.set(0.55, 0.92, 0.15);
    radioDesk.add(morseKey);

    // Wire antenna mast
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.2, 4), ironMat);
    antenna.position.set(-0.65, 1.9, -0.2);
    radioDesk.add(antenna);

    radioDesk.position.set(-1.8, 1.2, 74.0);
    this.group.add(radioDesk);
    this.addCollisionBox(-2.7, 0.5, 73.4, -0.9, 2.5, 74.6);

    this.registerInteractable(morseKey, {
      id: 'marconi_radio_camp',
      title: 'Marconi Spark-Gap Wireless Telegraph',
      verb: 'TUNE WIRELESS TELEGRAPH',
      distance: 3.5,
      position: [-1.8, 1.2, 74.0],
      type: 'inspect',
    });
  }

  /**
   * 13. ANCIENT PRE-COLUMBIAN BAS-RELIEF STONE STELES
   */
  private buildAncientReliefMurals() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(2, 2);
    const reliefMat = new THREE.MeshStandardMaterial({
      color: 0x8a7e6b,
      roughness: 0.85,
    });

    const reliefLocations: [number, number, number, number, string, string][] = [
      [-7.5, -0.6, -46, Math.PI * 0.4, 'rubbing_stele_1', 'Bas-Relief: Serpent of Stillwater'],
      [7.8, 1.8, -132, -Math.PI * 0.5, 'rubbing_stele_2', 'Bas-Relief: Winged Solar Jaguar'],
      [-6.0, -1.2, -196, Math.PI * 0.5, 'rubbing_stele_3', 'Bas-Relief: Astrolabe Celestial Sphere'],
    ];

    reliefLocations.forEach(([rx, ry, rz, rotY, id, title]) => {
      const slabGroup = new THREE.Group();

      // Stone slab frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.35), stoneMat);
      frame.castShadow = true;
      slabGroup.add(frame);

      // Carved inner relief face
      const face = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.38), reliefMat);
      face.position.z = 0.02;
      slabGroup.add(face);

      slabGroup.position.set(rx, ry, rz);
      slabGroup.rotation.y = rotY;
      this.group.add(slabGroup);

      this.registerInteractable(face, {
        id,
        title,
        verb: 'TAKE CHARCOAL RUBBING',
        distance: 3.8,
        position: [rx, ry, rz],
        type: 'rubbing',
      });
    });
  }

  /**
   * 14. EXPEDITION CAMPFIRE HEARTH & BILLYCAN
   */
  private buildCampfireHearth() {
    const stoneMat = ProceduralTextureGenerator.getAncientStoneMaterial(1, 1);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.5 });
    const charcoalMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      emissive: 0xff3b00,
      emissiveIntensity: 0.8,
      roughness: 0.9,
    });

    const hearthGroup = new THREE.Group();

    // Ring of 8 stones
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), stoneMat);
      rock.position.set(Math.cos(a) * 0.75, 0.15, Math.sin(a) * 0.75);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      hearthGroup.add(rock);
    }

    // Glowing charcoal embers
    for (let i = 0; i < 5; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), charcoalMat);
      log.position.set((Math.random() - 0.5) * 0.3, 0.1, (Math.random() - 0.5) * 0.3);
      log.rotation.set(0.2, (i * Math.PI) / 2.5, 0.2);
      hearthGroup.add(log);
    }

    // Iron Tripod Support
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), ironMat);
      leg.position.set(Math.cos(a) * 0.45, 0.55, Math.sin(a) * 0.45);
      leg.rotation.z = Math.cos(a) * -0.3;
      leg.rotation.x = Math.sin(a) * 0.3;
      hearthGroup.add(leg);
    }

    // Boiling Cast-Iron Billycan Kettle
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 10), ironMat);
    kettle.position.set(0, 0.48, 0);
    hearthGroup.add(kettle);

    // Warm Campfire Point Light
    const fireLight = new THREE.PointLight(0xff7722, 2.8, 12);
    fireLight.position.set(0, 0.6, 0);
    hearthGroup.add(fireLight);

    hearthGroup.position.set(0.0, 0.8, 67.5);
    this.group.add(hearthGroup);
    this.addCollisionBox(-0.9, 0.5, 66.6, 0.9, 2.0, 68.4);

    this.registerInteractable(kettle, {
      id: 'campfire_hearth_camp',
      title: 'Expedition Campfire Hearth',
      verb: 'BREW EXPEDITION INFUSION',
      distance: 3.5,
      position: [0.0, 1.2, 67.5],
      type: 'brew',
    });
  }

  /**
   * 15. ENDEMIC RARE BOTANICAL HARVEST SITES
   */
  private buildEndemicFloraSpecimens() {
    const plants: [number, number, number, string, string, number][] = [
      [-6.8, -1.8, -48, 'plant_grotto_orchid', 'Luminescent Grotto Orchid', 0x38bdf8],
      [-7.0, 0.4, -112, 'plant_meridian_fern', 'Sacred Meridian Spiral Fern', 0xfbbf24],
      [5.8, -2.0, 16, 'plant_dragons_blood', "Crimson Dragon's Blood Blossom", 0xf43f5e],
    ];

    plants.forEach(([px, py, pz, id, title, col]) => {
      const plantGroup = new THREE.Group();

      const bloomMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 1.2,
        roughness: 0.2,
      });

      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.6, 5),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 })
      );
      stem.position.y = 0.3;
      plantGroup.add(stem);

      // Blossom Cluster
      for (let i = 0; i < 4; i++) {
        const petal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), bloomMat);
        petal.position.set(
          Math.cos((i * Math.PI) / 2) * 0.12,
          0.55 + (i % 2) * 0.05,
          Math.sin((i * Math.PI) / 2) * 0.12
        );
        plantGroup.add(petal);
      }

      // Soft glow point light
      const glow = new THREE.PointLight(col, 1.2, 5);
      glow.position.y = 0.6;
      plantGroup.add(glow);

      plantGroup.position.set(px, py, pz);
      this.group.add(plantGroup);

      this.registerInteractable(plantGroup, {
        id,
        title,
        verb: 'HARVEST SPECIMEN',
        distance: 3.2,
        position: [px, py + 0.5, pz],
        type: 'harvest',
      });
    });
  }

  /**
   * 16. PYTHAGOREAN SONAR WAVEFRONT INITIALIZATION
   */
  private initSonarWaveMesh() {
    const geo = new THREE.SphereGeometry(1, 24, 16);
    this.sonarWaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
    });

    this.sonarWaveMesh = new THREE.Mesh(geo, this.sonarWaveMaterial);
    this.sonarWaveMesh.visible = false;
    this.group.add(this.sonarWaveMesh);
  }

  public triggerSonarWavefront(freq: number, origin: THREE.Vector3) {
    if (!this.sonarWaveMesh || !this.sonarWaveMaterial) return;

    this.sonarWaveMesh.position.copy(origin);
    this.sonarWaveRadius = 0.1;
    this.sonarWaveActive = true;
    this.sonarWaveMesh.visible = true;

    // Color based on harmonic frequency
    if (freq === 432) {
      this.sonarWaveMaterial.color.setHex(0xfbbf24); // Gold Earth
    } else if (freq === 648) {
      this.sonarWaveMaterial.color.setHex(0x38bdf8); // Sky Blue Celestial
    } else {
      this.sonarWaveMaterial.color.setHex(0xc084fc); // Violet Keystole
    }
  }

  /**
   * 17. ANDEAN FALCONRY SCOUT PERCH
   */
  private buildFalconPerch() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });
    const featherMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.8 });

    const perchGroup = new THREE.Group();

    // Wooden Tripod Base
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), woodMat);
      leg.position.set(Math.cos(a) * 0.35, 0.55, Math.sin(a) * 0.35);
      leg.rotation.z = Math.cos(a) * -0.25;
      leg.rotation.x = Math.sin(a) * 0.25;
      perchGroup.add(leg);
    }

    // Central Post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.4, 6), woodMat);
    post.position.y = 0.7;
    perchGroup.add(post);

    // Crossbar T-Bar
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 6), woodMat);
    bar.rotation.z = Math.PI * 0.5;
    bar.position.y = 1.38;
    perchGroup.add(bar);

    // Perched Falcon Model
    const falcon = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), featherMat);
    body.rotation.x = 0.3;
    falcon.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    head.position.set(0, 0.22, 0.08);
    falcon.add(head);

    falcon.position.set(0, 1.48, 0);
    perchGroup.add(falcon);

    perchGroup.position.set(4.5, 0.8, 62.0);
    this.group.add(perchGroup);

    this.registerInteractable(perchGroup, {
      id: 'falcon_perch',
      title: 'Andean Scouting Falcon',
      verb: 'LAUNCH FALCON SCOUT',
      distance: 3.5,
      position: [4.5, 1.8, 62.0],
      type: 'inspect',
    });
  }

  /**
   * 18. CLIFFSIDE & CHASM RAPPEL CLIMBING ROPES
   */
  private buildRappellingRopes() {
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.9,
    });
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });

    // A. Waterfall Cliff Rappel (Height: 4.5 down to -4.2)
    const waterfallRopeGroup = new THREE.Group();
    const pitonA = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), ironMat);
    pitonA.position.set(-4.2, 4.6, -42.0);
    waterfallRopeGroup.add(pitonA);

    const ropeA = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 8.8, 6), ropeMat);
    ropeA.position.set(-4.2, 0.2, -42.0);
    waterfallRopeGroup.add(ropeA);
    this.group.add(waterfallRopeGroup);

    this.registerInteractable(pitonA, {
      id: 'rappel_cliff_waterfall_top',
      title: 'Cliffside Rappel Rope Anchor',
      verb: 'RAPPEL DOWN TO WATERFALL GROTTO',
      distance: 3.8,
      position: [-4.2, 4.5, -42.0],
      type: 'activate',
    });

    const bottomCleatA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), ironMat);
    bottomCleatA.position.set(-4.2, -4.0, -42.0);
    this.group.add(bottomCleatA);

    this.registerInteractable(bottomCleatA, {
      id: 'rappel_cliff_waterfall_bottom',
      title: 'Cliffside Climbing Rope',
      verb: 'CLIMB UP CLIFF',
      distance: 3.8,
      position: [-4.2, -4.0, -42.0],
      type: 'activate',
    });

    // B. Subterranean Chasm Rappel (Height: 1.2 down to -9.5)
    const chasmRopeGroup = new THREE.Group();
    const pitonB = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), ironMat);
    pitonB.position.set(0.0, 1.3, -135.0);
    chasmRopeGroup.add(pitonB);

    const ropeB = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 10.8, 6), ropeMat);
    ropeB.position.set(0.0, -4.1, -135.0);
    chasmRopeGroup.add(ropeB);
    this.group.add(chasmRopeGroup);

    this.registerInteractable(pitonB, {
      id: 'rappel_chasm_top',
      title: 'Chasm Rappel Rope Anchor',
      verb: 'RAPPEL DOWN TO SUBTERRANEAN CRYPT',
      distance: 3.8,
      position: [0.0, 1.2, -135.0],
      type: 'activate',
    });

    const bottomCleatB = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), ironMat);
    bottomCleatB.position.set(0.0, -9.2, -135.0);
    this.group.add(bottomCleatB);

    this.registerInteractable(bottomCleatB, {
      id: 'rappel_chasm_bottom',
      title: 'Chasm Climbing Rope',
      verb: 'CLIMB UP TO CHASM LEDGE',
      distance: 3.8,
      position: [0.0, -9.2, -135.0],
      type: 'activate',
    });
  }

  public planetariumDomeMesh: THREE.Mesh | null = null;
  public planetariumDomeLight: THREE.PointLight | null = null;

  public setPlanetariumActive(active: boolean) {
    if (this.planetariumDomeMesh) {
      this.planetariumDomeMesh.visible = active;
    }
    if (this.planetariumDomeLight) {
      this.planetariumDomeLight.intensity = active ? 2.5 : 0;
    }
  }

  /**
   * 19. MERIDIAN DEEP SANCTUARY PLANETARIUM STAR-PROJECTOR & DOME
   */
  private buildPlanetariumProjector() {
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.8 });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });

    const projGroup = new THREE.Group();

    // Octagonal Stone Base Pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.9, 8), brassMat);
    base.position.y = 0.45;
    projGroup.add(base);

    // Brass Celestial Sphere Housing
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), brassMat);
    globe.position.y = 1.15;
    projGroup.add(globe);

    // Armillary Equatorial Rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 6, 24), brassMat);
    ring1.rotation.x = Math.PI * 0.35;
    ring1.position.y = 1.15;
    projGroup.add(ring1);

    // Upward Pointing Luminous Projector Crystal Aperture
    const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 6), crystalMat);
    crystal.position.y = 1.6;
    projGroup.add(crystal);

    projGroup.position.set(0.0, -17.2, -165.0);
    this.group.add(projGroup);

    this.registerInteractable(projGroup, {
      id: 'meridian_planetarium',
      title: 'Sanctuary Armillary Planetarium',
      verb: 'ALIGN CONSTELLATIONS',
      distance: 4.0,
      position: [0.0, -16.0, -165.0],
      type: 'inspect',
    });

    // Subterranean Cavern Ceiling Celestial Starfield Dome Mesh
    const domeGeo = new THREE.SphereGeometry(22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    this.planetariumDomeMesh = new THREE.Mesh(domeGeo, domeMat);
    this.planetariumDomeMesh.position.set(0.0, -14.0, -165.0);
    this.planetariumDomeMesh.visible = false;
    this.group.add(this.planetariumDomeMesh);

    this.planetariumDomeLight = new THREE.PointLight(0x38bdf8, 0, 30);
    this.planetariumDomeLight.position.set(0.0, -10.0, -165.0);
    this.group.add(this.planetariumDomeLight);
  }

  /**
   * 20. BASE CAMP FIELD CHEMISTRY & RESTORATION BENCH
   */
  private buildChemistryLabBench() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.8 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
    });

    const labGroup = new THREE.Group();

    // Lab Table
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.9), woodMat);
    tableTop.position.y = 0.8;
    labGroup.add(tableTop);

    // Legs
    for (let x = -0.75; x <= 0.75; x += 1.5) {
      for (let z = -0.35; z <= 0.35; z += 0.7) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), woodMat);
        leg.position.set(x, 0.4, z);
        labGroup.add(leg);
      }
    }

    // Glass Alembic & Retort Flask
    const flask = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), glassMat);
    flask.position.set(-0.4, 0.98, 0.1);
    labGroup.add(flask);

    // Spirit Burner Flame
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 6), brassMat);
    burner.position.set(-0.4, 0.85, 0.1);
    labGroup.add(burner);

    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), flameMat);
    flame.position.set(-0.4, 0.92, 0.1);
    labGroup.add(flame);

    const burnerLight = new THREE.PointLight(0x38bdf8, 0.8, 4);
    burnerLight.position.set(-0.4, 1.0, 0.1);
    labGroup.add(burnerLight);

    // Reagent Bottles Rack (Acid, Solvent, Polish)
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.18), woodMat);
    rack.position.set(0.35, 0.85, -0.15);
    labGroup.add(rack);

    const reagentColors = [0xf43f5e, 0xf59e0b, 0x10b981];
    reagentColors.forEach((col, i) => {
      const bottleMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 });
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), bottleMat);
      bottle.position.set(0.2 + i * 0.14, 0.95, -0.15);
      labGroup.add(bottle);
    });

    labGroup.position.set(-3.5, 0.8, 56.5);
    this.group.add(labGroup);

    this.registerInteractable(labGroup, {
      id: 'chemistry_bench',
      title: "Dr. Sterling's Field Chemistry Lab",
      verb: 'ANALYZE & CLEANSE ARTIFACTS',
      distance: 3.5,
      position: [-3.5, 1.8, 56.5],
      type: 'inspect',
    });
  }

  /**
   * 21. VALLEY RIDGE THEODOLITE SIGHTING STATION
   */
  private buildTheodoliteStation() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.8 });

    const theoGroup = new THREE.Group();

    // Tripod Legs
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 5), woodMat);
      leg.position.set(Math.cos(a) * 0.38, 0.6, Math.sin(a) * 0.38);
      leg.rotation.z = Math.cos(a) * -0.25;
      leg.rotation.x = Math.sin(a) * 0.25;
      theoGroup.add(leg);
    }

    // Horizontal Azimuth Circle Dial
    const circle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12), brassMat);
    circle.position.y = 1.25;
    theoGroup.add(circle);

    // Optical Telescope Barrel
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.7, 8), brassMat);
    scope.rotation.x = Math.PI * 0.45;
    scope.position.set(0, 1.42, 0);
    theoGroup.add(scope);

    // Eyepiece
    const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6), brassMat);
    eyepiece.rotation.x = Math.PI * 0.45;
    eyepiece.position.set(0, 1.38, 0.38);
    theoGroup.add(eyepiece);

    theoGroup.position.set(-8.5, 3.8, -25.0);
    this.group.add(theoGroup);

    this.registerInteractable(theoGroup, {
      id: 'survey_theodolite',
      title: '1928 Troughton & Simms Brass Theodolite',
      verb: 'SIGHT VALLEY TRANSIT',
      distance: 3.5,
      position: [-8.5, 4.8, -25.0],
      type: 'inspect',
    });
  }

  /**
   * 22. WATERFALL PLUNGE POOL COPPER DIVING RIG & SUNKEN CHEST
   */
  private buildDivingRigStation() {
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.85 });
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x7dd3fc, transmission: 0.9, roughness: 0.1 });

    const diveGroup = new THREE.Group();

    // Wooden Staging Bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.6), woodMat);
    bench.position.set(-4.5, -3.9, -45.0);
    diveGroup.add(bench);

    // 1920s Copper Diving Helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), copperMat);
    helmet.position.set(-4.5, -3.4, -45.0);
    diveGroup.add(helmet);

    // Circular Glass Viewport
    const viewPort = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), glassMat);
    viewPort.rotation.x = Math.PI * 0.5;
    viewPort.position.set(-4.5, -3.4, -44.78);
    diveGroup.add(viewPort);

    // Air Hose Coil
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 16), new THREE.MeshStandardMaterial({ color: 0x1c1917 }));
    hose.rotation.x = Math.PI * 0.5;
    hose.position.set(-4.1, -3.6, -45.0);
    diveGroup.add(hose);

    this.group.add(diveGroup);

    this.registerInteractable(diveGroup, {
      id: 'diving_helmet_rig',
      title: '1920s Siebe Gorman Diving Rig',
      verb: 'DON COPPER DIVING HELMET',
      distance: 3.5,
      position: [-4.5, -3.4, -45.0],
      type: 'activate',
    });

    // Submerged Sunken Chest in the deep plunge pool
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const chestGroup = new THREE.Group();
    const chestBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), stoneMat);
    chestBox.position.set(-4.2, -6.5, -48.0);
    chestGroup.add(chestBox);

    const chestLid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12, 1, false, 0, Math.PI), stoneMat);
    chestLid.rotation.z = Math.PI * 0.5;
    chestLid.position.set(-4.2, -6.25, -48.0);
    chestGroup.add(chestLid);

    this.group.add(chestGroup);

    this.registerInteractable(chestGroup, {
      id: 'sunken_diver_chest',
      title: 'Sunken Plunge Pool Vault Chest',
      verb: 'UNLOCK SUNKEN VAULT',
      distance: 3.5,
      position: [-4.2, -6.2, -48.0],
      type: 'inspect',
    });
  }

  /**
   * 23. BASE CAMP TENT EDISON WAX-CYLINDER PHONOGRAPH
   */
  private buildPhonographStation() {
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();

    const phonoGroup = new THREE.Group();

    // Wood Cabinet Base
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.35), woodMat);
    cab.position.set(-4.8, 1.3, 59.2);
    phonoGroup.add(cab);

    // Wax Cylinder Mandrel
    const mandrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
    mandrel.rotation.z = Math.PI * 0.5;
    mandrel.position.set(-4.8, 1.45, 59.2);
    phonoGroup.add(mandrel);

    // Morning Glory Brass Acoustic Horn
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 12, 1, true), brassMat);
    horn.rotation.x = Math.PI * 0.4;
    horn.position.set(-4.8, 1.6, 58.9);
    phonoGroup.add(horn);

    this.group.add(phonoGroup);

    this.registerInteractable(phonoGroup, {
      id: 'edison_phonograph',
      title: '1928 Edison Wax-Cylinder Phonograph',
      verb: 'PLAY EXPEDITION LOGS',
      distance: 3.5,
      position: [-4.8, 1.4, 59.2],
      type: 'inspect',
    });
  }

  /**
   * 24. SUBTERRANEAN CHASM MINECART STATION
   */
  private buildMinecartStation() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });

    const stationGroup = new THREE.Group();

    // Timber Boarding Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 1.4), woodMat);
    platform.position.set(-1.6, -8.1, -118.0);
    stationGroup.add(platform);

    // Station Lantern
    const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), ironMat);
    lanternPost.position.set(-0.8, -7.2, -118.0);
    stationGroup.add(lanternPost);

    const light = new THREE.PointLight(0xf59e0b, 1.5, 8);
    light.position.set(-0.8, -6.4, -118.0);
    stationGroup.add(light);

    this.group.add(stationGroup);

    this.registerInteractable(stationGroup, {
      id: 'chasm_minecart',
      title: 'Subterranean Ore Minecart',
      verb: 'BOARD MINECART',
      distance: 4.0,
      position: [-3.0, -7.5, -118.0],
      type: 'activate',
    });
  }

  /**
   * 25. HIGH MESA RIDGE BALLOON MOORING PLATFORM
   */
  private buildBalloonMooringStation() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });

    const moorGroup = new THREE.Group();

    // Wooden Mooring Staging Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.25, 3.5), woodMat);
    platform.position.set(-18.0, 11.9, 30.0);
    moorGroup.add(platform);

    // Kerosene Fuel Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12), ironMat);
    barrel.position.set(-19.2, 12.45, 29.0);
    moorGroup.add(barrel);

    // Steel Ring Mooring Cleats
    const cleatMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    [
      [-19.5, 12.1, 28.5],
      [-16.5, 12.1, 28.5],
      [-18.0, 12.1, 31.5],
    ].forEach(([x, y, z]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12), cleatMat);
      ring.position.set(x, y, z);
      moorGroup.add(ring);
    });

    this.group.add(moorGroup);

    this.registerInteractable(moorGroup, {
      id: 'mesa_balloon',
      title: '1928 Expedition Observation Balloon',
      verb: 'LAUNCH OBSERVATION BALLOON',
      distance: 4.5,
      position: [-18.0, 12.8, 30.0],
      type: 'activate',
    });
  }

  /**
   * 26. BASE CAMP MARCONI WIRELESS RADIO BENCH
   */
  private buildMarconiRadioStation() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xfef08a, transmission: 0.8, roughness: 0.1 });

    const radioGroup = new THREE.Group();

    // Wood Cabinet Radio Transceiver
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.35), woodMat);
    cab.position.set(-5.2, 1.4, 57.8);
    radioGroup.add(cab);

    // Vacuum Tubes
    [-0.15, 0, 0.15].forEach((x) => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), glassMat);
      tube.position.set(-5.2 + x, 1.68, 57.8);
      radioGroup.add(tube);
    });

    // Copper Antenna Mast
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 6), brassMat);
    ant.position.set(-5.45, 2.3, 57.8);
    radioGroup.add(ant);

    // Brass Morse Key
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.14), brassMat);
    key.position.set(-4.8, 1.25, 57.8);
    radioGroup.add(key);

    this.group.add(radioGroup);

    this.registerInteractable(radioGroup, {
      id: 'marconi_radio',
      title: '1928 Marconi Long-Wave Field Wireless',
      verb: 'TUNE WIRELESS FREQUENCIES',
      distance: 3.5,
      position: [-5.2, 1.4, 57.8],
      type: 'inspect',
    });
  }

  /**
   * 27. TEMPLE PLAZA CONCENTRIC STONE EPIGRAPHY DESK
   */
  private buildEpigraphyDesk() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });
    const cyanRuneMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x38bdf8, emissiveIntensity: 0.8 });

    const epiGroup = new THREE.Group();

    // Carved Stone Pedestal Altar
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.9, 8), stoneMat);
    pedestal.position.set(-8.0, 4.05, -72.0);
    epiGroup.add(pedestal);

    // Outer Stone Ring
    const outerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16), stoneMat);
    outerRing.position.set(-8.0, 4.54, -72.0);
    epiGroup.add(outerRing);

    // Middle Gold Inlay Ring
    const midRing = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.09, 16), goldMat);
    midRing.position.set(-8.0, 4.55, -72.0);
    epiGroup.add(midRing);

    // Inner Glowing Rune Disc
    const innerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12), cyanRuneMat);
    innerDisc.position.set(-8.0, 4.56, -72.0);
    epiGroup.add(innerDisc);

    this.group.add(epiGroup);

    this.registerInteractable(epiGroup, {
      id: 'epigraphy_desk',
      title: 'Meridian Glyphic Epigraphy Wheel',
      verb: 'DECIPHER TEMPLE CIPHER',
      distance: 3.5,
      position: [-8.0, 4.5, -72.0],
      type: 'inspect',
    });
  }

  /**
   * 28. CELESTIAL PRISMATIC ARMILLARY SPHERE
   */
  private buildArmillarySphere() {
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const quartzMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

    const armGroup = new THREE.Group();

    // Stone Pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1.2, 12), stoneMat);
    base.position.set(0, 6.6, -95.0);
    armGroup.add(base);

    // Brass Mounting Yoke
    const yoke = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 24, Math.PI), brassMat);
    yoke.rotation.x = Math.PI * 0.5;
    yoke.position.set(0, 7.8, -95.0);
    armGroup.add(yoke);

    // 3 Concentric Armillary Rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 6, 24), brassMat);
    ring1.position.set(0, 7.8, -95.0);
    armGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 6, 24), brassMat);
    ring2.rotation.y = Math.PI * 0.35;
    ring2.position.set(0, 7.8, -95.0);
    armGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), brassMat);
    ring3.rotation.x = Math.PI * 0.25;
    ring3.position.set(0, 7.8, -95.0);
    armGroup.add(ring3);

    // Central Quartz Prism
    const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), quartzMat);
    prism.position.set(0, 7.8, -95.0);
    armGroup.add(prism);

    const prismLight = new THREE.PointLight(0xfef08a, 1.5, 12);
    prismLight.position.set(0, 7.8, -95.0);
    armGroup.add(prismLight);

    // 4 Surrounding Guardian Obelisks
    [
      [0, 6.0, -90.0, 0xef4444],
      [5.0, 6.0, -95.0, 0x10b981],
      [0, 6.0, -100.0, 0x0ea5e9],
      [-5.0, 6.0, -95.0, 0xf59e0b],
    ].forEach(([x, y, z, col]) => {
      const obelisk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 0.5), stoneMat);
      obelisk.position.set(x as number, y as number, z as number);
      armGroup.add(obelisk);

      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: col as number, emissive: col as number, emissiveIntensity: 0.6 })
      );
      cap.position.set(x as number, (y as number) + 1.5, z as number);
      armGroup.add(cap);
    });

    this.group.add(armGroup);

    this.registerInteractable(armGroup, {
      id: 'armillary_sphere',
      title: 'Celestial Prismatic Armillary Sphere',
      verb: 'ALIGN PRISMATIC RINGS',
      distance: 4.5,
      position: [0, 7.5, -95.0],
      type: 'inspect',
    });
  }

  /**
   * 29. SUBTERRANEAN HYDRAULIC SIPHON SLUICE STATION
   */
  private buildHydraulicSiphonStation() {
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.85 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.35, metalness: 0.8 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });

    const siphGroup = new THREE.Group();

    // Sluice Valve Manifold Pedestal
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.6), stoneMat);
    bench.position.set(-5.5, -4.6, -52.0);
    siphGroup.add(bench);

    // 3 Bronze Wheel Sluice Valves
    [-0.5, 0, 0.5].forEach((x) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), bronzeMat);
      stem.position.set(-5.5 + x, -4.05, -52.0);
      siphGroup.add(stem);

      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 16), bronzeMat);
      wheel.rotation.x = Math.PI * 0.5;
      wheel.position.set(-5.5 + x, -3.9, -52.0);
      siphGroup.add(wheel);
    });

    // Copper Siphon Pipes
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), copperMat);
    pipe.rotation.z = Math.PI * 0.5;
    pipe.position.set(-5.5, -4.8, -52.0);
    siphGroup.add(pipe);

    this.group.add(siphGroup);

    this.registerInteractable(siphGroup, {
      id: 'hydraulic_siphon',
      title: 'Hydraulic Siphon Sluice Grid',
      verb: 'OPERATE HYDRAULIC VALVES',
      distance: 3.5,
      position: [-5.5, -4.5, -52.0],
      type: 'inspect',
    });
  }

  /**
   * 30. FIELD PALEONTOLOGY FOSSIL PREP BENCH
   */
  private buildPaleontologyBench() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });

    const paleoGroup = new THREE.Group();

    // Wooden Preparation Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 0.7), woodMat);
    table.position.set(-3.8, 1.15, 59.5);
    paleoGroup.add(table);

    // Monocular Brass Microscope
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.35, 8), brassMat);
    scope.rotation.x = 0.2;
    scope.position.set(-4.1, 1.7, 59.5);
    paleoGroup.add(scope);

    // Fossil Rock Specimen
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), boneMat);
    rock.position.set(-3.6, 1.6, 59.5);
    paleoGroup.add(rock);

    this.group.add(paleoGroup);

    this.registerInteractable(paleoGroup, {
      id: 'paleontology_bench',
      title: 'Field Paleontology Prep Bench',
      verb: 'PREPARE FOSSIL SPECIMEN',
      distance: 3.5,
      position: [-3.8, 1.2, 59.5],
      type: 'inspect',
    });
  }

  /**
   * 31. EXPEDITION FIELD METALLURGY SMELTING FORGE
   */
  private buildMetallurgyForge() {
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.85 });
    const moltenMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xf97316, emissiveIntensity: 1.2 });

    const forgeGroup = new THREE.Group();

    // Brick Forge Hearth
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.4), brickMat);
    hearth.position.set(-1.5, 0.45, 54.0);
    forgeGroup.add(hearth);

    // Molten Charcoal Crucible
    const crucible = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.45, 12), ironMat);
    crucible.position.set(-1.5, 0.95, 54.0);
    forgeGroup.add(crucible);

    const moltenCore = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), moltenMat);
    moltenCore.position.set(-1.5, 1.15, 54.0);
    forgeGroup.add(moltenCore);

    const forgeLight = new THREE.PointLight(0xf97316, 2.0, 10);
    forgeLight.position.set(-1.5, 1.2, 54.0);
    forgeGroup.add(forgeLight);

    // Blacksmith Anvil
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.9), ironMat);
    anvil.position.set(-0.6, 0.55, 54.0);
    forgeGroup.add(anvil);

    this.group.add(forgeGroup);

    this.registerInteractable(forgeGroup, {
      id: 'metallurgy_forge',
      title: 'Expedition Field Smelting Forge',
      verb: 'SMELT BRONZE CASTINGS',
      distance: 3.5,
      position: [-1.5, 1.2, 54.0],
      type: 'inspect',
    });
  }

  /**
   * 32. CARTOGRAPHER'S TOPOGRAPHIC DRAFTING DESK
   */
  private buildCartographyDesk() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });

    const cartGroup = new THREE.Group();

    // Drafting Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.8), woodMat);
    desk.position.set(-4.5, 1.1, 53.5);
    cartGroup.add(desk);

    // Tilted Drawing Board
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.7), paperMat);
    board.rotation.x = 0.25;
    board.position.set(-4.5, 1.55, 53.5);
    cartGroup.add(board);

    // Brass Stereoscope Binocular Viewer
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.18), brassMat);
    scope.position.set(-4.5, 1.7, 53.5);
    cartGroup.add(scope);

    this.group.add(cartGroup);

    this.registerInteractable(cartGroup, {
      id: 'cartography_desk',
      title: "Cartographer's Topographic Desk",
      verb: 'DRAFT EXPEDITION CHART',
      distance: 3.5,
      position: [-4.5, 1.2, 53.5],
      type: 'inspect',
    });
  }

  /**
   * 33. SUBTERRANEAN CHLADNI ACOUSTIC RESONANCE TABLE
   */
  private buildChladniTable() {
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });

    const chladGroup = new THREE.Group();

    // Central Pillar Stand
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 1.1, 12), stoneMat);
    stand.position.set(4.5, -4.45, -60.0);
    chladGroup.add(stand);

    // Square Brass Resonance Plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.9), brassMat);
    plate.position.set(4.5, -3.9, -60.0);
    chladGroup.add(plate);

    // Resonant Glow Light
    const chladLight = new THREE.PointLight(0xfef08a, 1.2, 8);
    chladLight.position.set(4.5, -3.7, -60.0);
    chladGroup.add(chladLight);

    this.group.add(chladGroup);

    this.registerInteractable(chladGroup, {
      id: 'chladni_table',
      title: 'Acoustic Chladni Resonance Table',
      verb: 'BOW HARMONIC FREQUENCIES',
      distance: 3.5,
      position: [4.5, -4.5, -60.0],
      type: 'inspect',
    });
  }

  /**
   * 34. 1928 CURTISS "FALCON" BIPLANE
   */
  private buildBiplane() {
    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.2 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const propMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });

    const planeGroup = new THREE.Group();
    planeGroup.position.set(-18.0, 14.5, 45.0);

    // Fuselage
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 4.2, 12), fuselageMat);
    fuse.rotation.x = Math.PI * 0.5;
    planeGroup.add(fuse);

    // Top Wing
    const topWing = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.08, 1.2), wingMat);
    topWing.position.set(0, 0.8, 0);
    planeGroup.add(topWing);

    // Bottom Wing
    const botWing = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 1.1), wingMat);
    botWing.position.set(0, -0.2, 0);
    planeGroup.add(botWing);

    // Wing Struts
    [-2.2, 2.2].forEach((x) => {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), strutMat);
      strut.position.set(x, 0.3, 0);
      planeGroup.add(strut);
    });

    // Radial Engine Cowling & Propeller
    const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.6, 12), strutMat);
    cowl.rotation.x = Math.PI * 0.5;
    cowl.position.set(0, 0, -2.2);
    planeGroup.add(cowl);

    const prop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.04), propMat);
    prop.position.set(0, 0, -2.55);
    planeGroup.add(prop);
    this.biplaneProp = prop;

    // Tail Fin & Rudder
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.6), wingMat);
    fin.position.set(0, 0.5, 2.1);
    planeGroup.add(fin);

    // Landing Gear Wheels
    [-0.7, 0.7].forEach((x) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 10), strutMat);
      wheel.rotation.z = Math.PI * 0.5;
      wheel.position.set(x, -0.7, -0.8);
      planeGroup.add(wheel);
    });

    this.group.add(planeGroup);
    this.biplaneMesh = planeGroup;

    this.registerInteractable(planeGroup, {
      id: 'mesa_biplane',
      title: '1928 Curtiss Falcon Biplane',
      verb: 'PILOT BIPLANE',
      distance: 5.0,
      position: [-18.0, 14.5, 45.0],
      type: 'inspect',
    });
  }

  /**
   * 35. HYDROSTATIC GRAVIMETRIC ASSAY SARCOPHAGUS
   */
  private buildAssaySarcophagus() {
    const graniteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.9 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });

    const sarcGroup = new THREE.Group();

    // Carved Granite Sarcophagus Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.2), graniteMat);
    base.position.set(0, 3.5, -115.0);
    sarcGroup.add(base);

    // Sarcophagus Lid
    const lid = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.3, 1.25), goldMat);
    lid.position.set(0, 4.2, -115.0);
    sarcGroup.add(lid);

    // Balance Scale Arch
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 6, 16, Math.PI), brassMat);
    arch.position.set(0, 4.9, -115.0);
    sarcGroup.add(arch);

    // Left & Right Balance Pans
    [-0.5, 0.5].forEach((x) => {
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.08, 12), brassMat);
      pan.position.set(x, 4.3, -115.0);
      sarcGroup.add(pan);
    });

    this.group.add(sarcGroup);

    this.registerInteractable(sarcGroup, {
      id: 'assay_balance',
      title: 'Hydrostatic Assay Balance Sarcophagus',
      verb: 'BALANCE ASSAY SCALES',
      distance: 3.8,
      position: [0, 4.0, -115.0],
      type: 'inspect',
    });
  }

  /**
   * 36. CARBIDE-LAMP MAGIC LANTERN PROJECTOR STATION
   */
  private buildMagicLanternStation() {
    const woodMat = ProceduralTextureGenerator.getWeatheredWoodMaterial();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const canvasMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.95 });

    const lantGroup = new THREE.Group();

    // Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.7), woodMat);
    table.position.set(3.5, 1.15, 53.0);
    lantGroup.add(table);

    // Magic Lantern Projector
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.45), brassMat);
    body.position.set(3.5, 1.68, 53.0);
    lantGroup.add(body);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.25, 10), brassMat);
    lens.rotation.x = Math.PI * 0.5;
    lens.position.set(3.5, 1.68, 52.7);
    lantGroup.add(lens);

    // Hanging Projection Canvas Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.04), canvasMat);
    screen.position.set(3.5, 2.0, 50.5);
    lantGroup.add(screen);

    this.group.add(lantGroup);

    this.registerInteractable(lantGroup, {
      id: 'magic_lantern',
      title: 'Carbide-Lamp Magic Lantern Projector',
      verb: 'PROJECT ARCHIVAL GLASS SLIDES',
      distance: 3.5,
      position: [3.5, 1.5, 53.0],
      type: 'inspect',
    });
  }

  /**
   * 37. GRAND ALTAR OF THE MERIDIAN APEX (SOLSTICE FINALE)
   */
  private buildGrandApexAltar() {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.95 });
    const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85 });

    const altarGroup = new THREE.Group();

    // Concentric Stepped Obsidian Dais
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 0.25, 16), obsidianMat);
    step1.position.set(0, 10.3, -95.0);
    altarGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.25, 16), obsidianMat);
    step2.position.set(0, 10.55, -95.0);
    altarGroup.add(step2);

    // Gold Altar Plinth
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 12), goldMat);
    plinth.position.set(0, 11.0, -95.0);
    altarGroup.add(plinth);

    // Central Floating Solstice Crystal Beacon
    const apexCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), crystalMat);
    apexCrystal.position.set(0, 11.8, -95.0);
    altarGroup.add(apexCrystal);

    // Glowing Apex Light
    const apexLight = new THREE.PointLight(0xfef08a, 2.5, 20);
    apexLight.position.set(0, 12.0, -95.0);
    altarGroup.add(apexLight);

    this.group.add(altarGroup);

    this.registerInteractable(altarGroup, {
      id: 'grand_apex_altar',
      title: 'Altar of the Meridian Apex',
      verb: 'INITIATE GRAND CELESTIAL ALIGNMENT',
      distance: 4.5,
      position: [0, 11.0, -95.0],
      type: 'inspect',
    });
  }
}
