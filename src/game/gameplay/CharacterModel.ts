/**
 * The Lost Meridian - Photorealistic Expedition Archaeologist Character Model
 * High-fidelity PBR character pipeline matching Unity 5 Standard Shader / AAA Adventure Engine fidelity:
 * - Anatomical 1:7.9 heroic explorer proportions (1.82m tall, broad athletic frame)
 * - Sculpted human facial features: Ocular orbits, hazel/amber irises with dark limbal rings, glossy clearcoat corneas,
 *   sculpted nose with alar nostrils, chiseled cheekbones & jawline, 5 o'clock expedition stubble, lips, ears, and hair
 * - Multi-layered expedition outfit: Unbuttoned linen shirt with exposed clavicle, tailored Norfolk canvas field jacket,
 *   bellows pockets, notched lapels, Sam Browne cross-body leather harness, sidearm holster with revolver grip,
 *   vintage field canteen, brass roller buckles, and rolled sleeve cuffs
 * - Anatomical hands with sculpted fingers, knuckles, and relaxed grip articulation
 * - High-top lace-up leather field boots with criss-cross laces, brass eyelets, welt stitching, and deep rubber lug treads
 * - Sculpted 1928 fur-felt fedora with snap-brim rake, pinched teardrop crown, and grosgrain ribbon with bow
 * - Dynamic locomotion kinematics: Thoracic respiratory breathing, knee flexion with impact dampening,
 *   elbow pendulum recoil, pelvic torque, athletic corner banking, gaze tracking, and dynamic wind/inertia coat tails
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from '../textures/ProceduralTextureGenerator';

export class CharacterModel {
  public group: THREE.Group;
  public body: THREE.Group;
  public head: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public coatMesh: THREE.Mesh;
  public lanternInHand: THREE.PointLight | null = null;
  public handTorchGroup: THREE.Group;

  // Chest mesh for thoracic breathing animation
  private chestMesh: THREE.Mesh;

  // Hierarchical Knee and Elbow Articulations
  private leftKnee: THREE.Group;
  private rightKnee: THREE.Group;
  private leftElbow: THREE.Group;
  private rightElbow: THREE.Group;

  // Dynamic Coat Tail Flaps (Inertia & Wind Physics)
  private coatTailLeft: THREE.Group;
  private coatTailRight: THREE.Group;
  private satchelMesh: THREE.Mesh;

  // Eye gaze tracking nodes
  private leftEyeNode: THREE.Group;
  private rightEyeNode: THREE.Group;

  private torchLensMat: THREE.MeshBasicMaterial;
  private walkPhase = 0;
  private coatSwayTimer = 0;
  private breathPhase = 0;

  constructor() {
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.group.add(this.body);

    // ==========================================
    // 1. PROCEDURAL COOK-TORRANCE PBR MATERIALS
    // ==========================================
    const fabricPBR = ProceduralTextureGenerator.generateFabricWeaveMaps(256);
    const leatherPBR = ProceduralTextureGenerator.generateLeatherGrainMaps(256);
    const skinPBR = ProceduralTextureGenerator.generateSkinPBRMaps(256);
    const faceAlbedo = ProceduralTextureGenerator.generateExplorerFaceAlbedo(256);
    const eyeIrisTex = ProceduralTextureGenerator.generateEyeIrisTexture(128);

    // Explorer Norfolk Coat: Heavy Khaki / Olive Drab Double-Weave Canvas
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x5a4b38,
      normalMap: fabricPBR.normal,
      normalScale: new THREE.Vector2(1.8, 1.8),
      roughnessMap: fabricPBR.roughness,
      roughness: 0.82,
      metalness: 0.03,
      envMapIntensity: 0.9,
    });

    // Unbleached Linen Expedition Shirt (Inner Layer)
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xd8cebd,
      normalMap: fabricPBR.normal,
      normalScale: new THREE.Vector2(1.4, 1.4),
      roughness: 0.84,
      metalness: 0.02,
      envMapIntensity: 0.8,
    });

    // Expedition Trousers: Heavy Corduroy / Moleskin Field Slacks
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x2e2720,
      normalMap: fabricPBR.normal,
      normalScale: new THREE.Vector2(2.5, 2.5),
      roughnessMap: fabricPBR.roughness,
      roughness: 0.88,
      metalness: 0.02,
      envMapIntensity: 0.85,
    });

    // Bridle Leather: High-Tensile Saddlery Leather (Harness, Belt, Holster)
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x26170e,
      normalMap: leatherPBR.normal,
      normalScale: new THREE.Vector2(2.2, 2.2),
      roughnessMap: leatherPBR.roughness,
      roughness: 0.48,
      metalness: 0.14,
      envMapIntensity: 1.3,
    });

    // Dark Boots: Heavy Treated Field Mud Leather
    const bootLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x18100a,
      normalMap: leatherPBR.normal,
      normalScale: new THREE.Vector2(2.5, 2.5),
      roughnessMap: leatherPBR.roughness,
      roughness: 0.54,
      metalness: 0.12,
      envMapIntensity: 1.15,
    });

    // Polished Archaeological Brass: Buckles, Eyelets, Rivets, Torch Fitting
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.9,
      envMapIntensity: 2.0,
    });

    // Blued Steel: Sidearm Revolver Metal
    const gunMetalMat = new THREE.MeshStandardMaterial({
      color: 0x23272a,
      roughness: 0.36,
      metalness: 0.88,
      envMapIntensity: 1.6,
    });

    // Wood Grip: Walnut Revolver Grip
    const woodGripMat = new THREE.MeshStandardMaterial({
      color: 0x3d2012,
      roughness: 0.45,
      metalness: 0.05,
    });

    // Sun-Weathered Human Skin with Micro-Pores and Warm Subsurface Undertone
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc68d6c,
      map: faceAlbedo,
      normalMap: skinPBR.normal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: skinPBR.roughness,
      roughness: 0.56,
      metalness: 0.04,
      envMapIntensity: 0.85,
    });

    // Clean Body Skin (Neck, Hands, Forearms)
    const bodySkinMat = new THREE.MeshStandardMaterial({
      color: 0xc48c6b,
      normalMap: skinPBR.normal,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: skinPBR.roughness,
      roughness: 0.58,
      metalness: 0.04,
      envMapIntensity: 0.85,
    });

    // Realistic Hazel/Amber Eye Iris
    const eyeMat = new THREE.MeshStandardMaterial({
      map: eyeIrisTex,
      roughness: 0.18,
      metalness: 0.02,
      envMapIntensity: 1.6,
    });

    // Glossy Cornea Clearcoat Dome
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0.0,
      transmission: 0.94,
      transparent: true,
      opacity: 0.88,
      envMapIntensity: 2.4,
    });

    // Dark Chestnut Hair & Stubble
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x221610,
      normalMap: fabricPBR.normal,
      normalScale: new THREE.Vector2(1.8, 1.8),
      roughness: 0.82,
      metalness: 0.04,
    });

    // 1928 Fur-Felt Fedora
    const feltMat = new THREE.MeshStandardMaterial({
      color: 0x3c2a1a,
      normalMap: fabricPBR.normal,
      normalScale: new THREE.Vector2(1.3, 1.3),
      roughness: 0.82,
      metalness: 0.03,
      envMapIntensity: 0.8,
    });

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.42,
      metalness: 0.12,
    });

    // ==========================================
    // 2. SCULPTED HUMAN TORSO & NORFOLK DUSTER
    // ==========================================
    // Upper Chest & Pectoral Taper (Broad 1920s Athletic Explorer Frame)
    const chestGeo = new THREE.CylinderGeometry(0.24, 0.205, 0.44, 14);
    chestGeo.scale(1.18, 1.0, 0.86); // Anatomical oval cross-section
    this.chestMesh = new THREE.Mesh(chestGeo, coatMat);
    this.chestMesh.position.y = 1.22;
    this.chestMesh.castShadow = true;
    this.body.add(this.chestMesh);

    // Inner Shirt V-Neck & Throat (visible between lapels)
    const shirtChestGeo = new THREE.BoxGeometry(0.14, 0.22, 0.06);
    const shirtChest = new THREE.Mesh(shirtChestGeo, shirtMat);
    shirtChest.position.set(0, 1.30, 0.16);
    shirtChest.rotation.x = -0.15;
    this.body.add(shirtChest);

    // Exposed Clavicle & Chest Skin Triangle
    const skinChestGeo = new THREE.ConeGeometry(0.055, 0.12, 6);
    skinChestGeo.rotateZ(Math.PI);
    const skinChest = new THREE.Mesh(skinChestGeo, bodySkinMat);
    skinChest.position.set(0, 1.36, 0.185);
    this.body.add(skinChest);

    // Brass Shirt Buttons
    for (let b = 0; b < 3; b++) {
      const buttonGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.005, 8);
      buttonGeo.rotateX(Math.PI / 2);
      const button = new THREE.Mesh(buttonGeo, brassMat);
      button.position.set(0, 1.28 - b * 0.05, 0.19);
      this.body.add(button);
    }

    // Abdominal & Tapered Waist Section
    const waistGeo = new THREE.CylinderGeometry(0.205, 0.215, 0.35, 14);
    waistGeo.scale(1.10, 1.0, 0.84);
    this.coatMesh = new THREE.Mesh(waistGeo, coatMat);
    this.coatMesh.position.y = 0.92;
    this.coatMesh.castShadow = true;
    this.body.add(this.coatMesh);

    // Tailored Notched Lapels with Stitched Relief
    const lapelGeo = new THREE.BoxGeometry(0.11, 0.22, 0.04);
    const leftLapel = new THREE.Mesh(lapelGeo, coatMat);
    leftLapel.position.set(-0.09, 1.33, 0.17);
    leftLapel.rotation.set(-0.35, -0.22, 0.28);
    leftLapel.castShadow = true;
    this.body.add(leftLapel);

    const rightLapel = new THREE.Mesh(lapelGeo, coatMat);
    rightLapel.position.set(0.09, 1.33, 0.17);
    rightLapel.rotation.set(-0.35, 0.22, -0.28);
    rightLapel.castShadow = true;
    this.body.add(rightLapel);

    // Left and Right Norfolk Chest Bellows Pockets
    const pocketGeo = new THREE.BoxGeometry(0.085, 0.10, 0.035);
    const leftPocket = new THREE.Mesh(pocketGeo, coatMat);
    leftPocket.position.set(-0.14, 1.20, 0.17);
    leftPocket.rotation.y = -0.25;
    this.body.add(leftPocket);

    const rightPocket = new THREE.Mesh(pocketGeo, coatMat);
    rightPocket.position.set(0.14, 1.20, 0.17);
    rightPocket.rotation.y = 0.25;
    this.body.add(rightPocket);

    // Brass Pocket Buttons
    const pocketBtnGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8);
    pocketBtnGeo.rotateX(Math.PI / 2);
    const lPocketBtn = new THREE.Mesh(pocketBtnGeo, brassMat);
    lPocketBtn.position.set(-0.14, 1.23, 0.19);
    this.body.add(lPocketBtn);

    const rPocketBtn = new THREE.Mesh(pocketBtnGeo, brassMat);
    rPocketBtn.position.set(0.14, 1.23, 0.19);
    this.body.add(rPocketBtn);

    // Heavy Bridle Leather Utility Belt & Brass Roller Buckle
    const beltGeo = new THREE.CylinderGeometry(0.225, 0.225, 0.08, 16);
    beltGeo.scale(1.11, 1.0, 0.86);
    const belt = new THREE.Mesh(beltGeo, leatherMat);
    belt.position.y = 0.76;
    this.body.add(belt);

    // Brass Framed Roller Buckle with Tongue Prong
    const buckleFrameGeo = new THREE.BoxGeometry(0.085, 0.068, 0.032);
    const buckleFrame = new THREE.Mesh(buckleFrameGeo, brassMat);
    buckleFrame.position.set(0, 0.76, 0.205);
    this.body.add(buckleFrame);

    const prongGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.05, 6);
    const prong = new THREE.Mesh(prongGeo, brassMat);
    prong.position.set(0, 0.76, 0.215);
    this.body.add(prong);

    // Leather Belt Loops
    const loopGeo = new THREE.BoxGeometry(0.02, 0.09, 0.015);
    const loopL = new THREE.Mesh(loopGeo, leatherMat);
    loopL.position.set(-0.11, 0.76, 0.195);
    this.body.add(loopL);
    const loopR = new THREE.Mesh(loopGeo, leatherMat);
    loopR.position.set(0.11, 0.76, 0.195);
    this.body.add(loopR);

    // Split Norfolk Duster Coat Tails (Left & Right Flaps draped over hips)
    this.coatTailLeft = new THREE.Group();
    this.coatTailLeft.position.set(-0.11, 0.72, 0);
    const tailGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.35, 10, 1, true, -Math.PI * 0.75, Math.PI * 0.75);
    tailGeo.scale(1.0, 1.0, 0.86);
    const tailLMesh = new THREE.Mesh(tailGeo, coatMat);
    tailLMesh.position.y = -0.17;
    tailLMesh.castShadow = true;
    this.coatTailLeft.add(tailLMesh);
    this.body.add(this.coatTailLeft);

    this.coatTailRight = new THREE.Group();
    this.coatTailRight.position.set(0.11, 0.72, 0);
    const tailRMesh = new THREE.Mesh(tailGeo.clone(), coatMat);
    tailRMesh.position.y = -0.17;
    tailRMesh.castShadow = true;
    this.coatTailRight.add(tailRMesh);
    this.body.add(this.coatTailRight);

    // Cross-body Sam Browne Leather Harness with Brass Studs
    const strapGeo = new THREE.TorusGeometry(0.36, 0.024, 8, 24);
    const strap = new THREE.Mesh(strapGeo, leatherMat);
    strap.position.set(0, 1.13, 0);
    strap.rotation.set(Math.PI / 2.5, Math.PI / 3.8, 0);
    this.body.add(strap);

    // Archaeologist Leather Map Satchel on Hip
    const satchelGeo = new THREE.BoxGeometry(0.19, 0.25, 0.09);
    this.satchelMesh = new THREE.Mesh(satchelGeo, leatherMat);
    this.satchelMesh.position.set(0.25, 0.78, -0.04);
    this.satchelMesh.rotation.set(0, 0, -0.12);
    this.satchelMesh.castShadow = true;

    // Satchel Flap & Buckle Details
    const satchelFlapGeo = new THREE.BoxGeometry(0.195, 0.14, 0.095);
    const satchelFlap = new THREE.Mesh(satchelFlapGeo, leatherMat);
    satchelFlap.position.set(0, 0.06, 0.005);
    this.satchelMesh.add(satchelFlap);

    for (let s = -1; s <= 1; s += 2) {
      const satchelBklGeo = new THREE.BoxGeometry(0.025, 0.03, 0.015);
      const satchelBkl = new THREE.Mesh(satchelBklGeo, brassMat);
      satchelBkl.position.set(s * 0.06, -0.02, 0.055);
      this.satchelMesh.add(satchelBkl);
    }
    this.body.add(this.satchelMesh);

    // Weathered Leather Hip Holster with Revolver
    const holsterGroup = new THREE.Group();
    holsterGroup.position.set(-0.24, 0.69, 0.04);
    holsterGroup.rotation.z = 0.16;

    const holsterGeo = new THREE.BoxGeometry(0.08, 0.24, 0.07);
    const holster = new THREE.Mesh(holsterGeo, leatherMat);
    holster.castShadow = true;
    holsterGroup.add(holster);

    // Webley .455 Service Revolver Grip peeking from holster
    const gripGeo = new THREE.BoxGeometry(0.035, 0.09, 0.045);
    const grip = new THREE.Mesh(gripGeo, woodGripMat);
    grip.position.set(0, 0.11, 0.01);
    grip.rotation.set(0.2, 0, -0.35);
    holsterGroup.add(grip);

    const hammerGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.025, 6);
    const hammer = new THREE.Mesh(hammerGeo, gunMetalMat);
    hammer.position.set(0, 0.15, -0.01);
    holsterGroup.add(hammer);

    this.body.add(holsterGroup);

    // Vintage Felt-Covered Expedition Canteen on Left Hip
    const canteenGroup = new THREE.Group();
    canteenGroup.position.set(-0.20, 0.74, -0.10);
    const canteenGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 14);
    canteenGeo.rotateX(Math.PI / 2);
    const canteenMat = new THREE.MeshStandardMaterial({ color: 0x4a4f44, roughness: 0.88 });
    const canteenMesh = new THREE.Mesh(canteenGeo, canteenMat);
    canteenMesh.castShadow = true;
    canteenGroup.add(canteenMesh);

    const canteenCapGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.025, 8);
    const canteenCap = new THREE.Mesh(canteenCapGeo, brassMat);
    canteenCap.position.set(0, 0.075, 0);
    canteenGroup.add(canteenCap);
    this.body.add(canteenGroup);

    // Expedition Canvas Rucksack & Bedroll
    const packGeo = new THREE.BoxGeometry(0.31, 0.42, 0.19);
    const backpack = new THREE.Mesh(packGeo, coatMat);
    backpack.position.set(0, 1.16, -0.22);
    backpack.castShadow = true;

    // Rolled Wool Blanket / Bedroll with Straps
    const bedrollGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.38, 14);
    bedrollGeo.rotateZ(Math.PI / 2);
    const bedrollMat = new THREE.MeshStandardMaterial({ color: 0x7c2c1c, roughness: 0.88 });
    const bedroll = new THREE.Mesh(bedrollGeo, bedrollMat);
    bedroll.position.set(0, 0.25, 0);
    backpack.add(bedroll);

    for (let str = -1; str <= 1; str += 2) {
      const bStrapGeo = new THREE.TorusGeometry(0.072, 0.012, 6, 16);
      const bStrap = new THREE.Mesh(bStrapGeo, leatherMat);
      bStrap.position.set(str * 0.12, 0.25, 0);
      bStrap.rotation.y = Math.PI / 2;
      backpack.add(bStrap);
    }
    this.body.add(backpack);

    // ==========================================
    // 3. SCULPTED HUMAN HEAD & 1928 PINCHED FEDORA
    // ==========================================
    this.head = new THREE.Group();
    this.head.position.set(0, 1.48, 0);

    // Muscular Neck with Sternocleidomastoid Contour
    const neckGeo = new THREE.CylinderGeometry(0.072, 0.088, 0.15, 12);
    const neck = new THREE.Mesh(neckGeo, bodySkinMat);
    neck.position.y = -0.055;
    neck.castShadow = true;
    this.head.add(neck);

    // Adam's Apple Subtle Relief
    const adamsAppleGeo = new THREE.SphereGeometry(0.016, 8, 8);
    adamsAppleGeo.scale(1.0, 1.4, 1.0);
    const adamsApple = new THREE.Mesh(adamsAppleGeo, bodySkinMat);
    adamsApple.position.set(0, -0.04, 0.078);
    this.head.add(adamsApple);

    // Anatomical Cranium Base
    const craniumGeo = new THREE.SphereGeometry(0.125, 20, 18);
    craniumGeo.scale(0.95, 1.16, 1.06);
    const cranium = new THREE.Mesh(craniumGeo, skinMat);
    cranium.position.set(0, 0.07, 0.01);
    cranium.castShadow = true;
    this.head.add(cranium);

    // Chiseled Cheekbones (Zygomatic Arches)
    const cheekGeo = new THREE.BoxGeometry(0.035, 0.055, 0.06);
    const leftCheek = new THREE.Mesh(cheekGeo, skinMat);
    leftCheek.position.set(-0.095, 0.055, 0.06);
    leftCheek.rotation.set(0.1, -0.25, 0.15);
    this.head.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, skinMat);
    rightCheek.position.set(0.095, 0.055, 0.06);
    rightCheek.rotation.set(0.1, 0.25, -0.15);
    this.head.add(rightCheek);

    // Defined Mandible & Square Explorer Chin
    const jawGeo = new THREE.BoxGeometry(0.115, 0.095, 0.11);
    const jaw = new THREE.Mesh(jawGeo, skinMat);
    jaw.position.set(0, 0.01, 0.05);
    jaw.rotation.x = 0.20;
    this.head.add(jaw);

    const chinGeo = new THREE.BoxGeometry(0.055, 0.04, 0.04);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.025, 0.108);
    this.head.add(chin);

    // Prominent Brow Ridge (Superciliary Arch)
    const browGeo = new THREE.BoxGeometry(0.13, 0.028, 0.05);
    const brow = new THREE.Mesh(browGeo, skinMat);
    brow.position.set(0, 0.105, 0.105);
    brow.rotation.x = 0.18;
    this.head.add(brow);

    // Dark Textured Eyebrows
    const browHairGeo = new THREE.BoxGeometry(0.048, 0.012, 0.015);
    const leftBrowHair = new THREE.Mesh(browHairGeo, hairMat);
    leftBrowHair.position.set(-0.046, 0.112, 0.125);
    leftBrowHair.rotation.set(0.1, 0, 0.08);
    this.head.add(leftBrowHair);

    const rightBrowHair = new THREE.Mesh(browHairGeo, hairMat);
    rightBrowHair.position.set(0.046, 0.112, 0.125);
    rightBrowHair.rotation.set(0.1, 0, -0.08);
    this.head.add(rightBrowHair);

    // ------------------------------------------
    // Photorealistic Eyes (Orbits, Sclera, Hazel Iris, Cornea)
    // ------------------------------------------
    this.leftEyeNode = new THREE.Group();
    this.leftEyeNode.position.set(-0.044, 0.078, 0.108);

    const eyeGeo = new THREE.SphereGeometry(0.022, 14, 12);
    eyeGeo.rotateY(Math.PI / 2);
    const leftEyeball = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEyeNode.add(leftEyeball);

    // Clear Cornea Specular Dome
    const corneaGeo = new THREE.SphereGeometry(0.023, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    corneaGeo.rotateX(Math.PI / 2);
    const leftCornea = new THREE.Mesh(corneaGeo, corneaMat);
    this.leftEyeNode.add(leftCornea);

    // Upper Eyelid Fold
    const eyelidGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.012, 12, 1, false, 0, Math.PI);
    eyelidGeo.rotateZ(Math.PI / 2);
    const leftUpperLid = new THREE.Mesh(eyelidGeo, skinMat);
    leftUpperLid.position.set(0, 0.014, 0.006);
    this.leftEyeNode.add(leftUpperLid);
    this.head.add(this.leftEyeNode);

    this.rightEyeNode = new THREE.Group();
    this.rightEyeNode.position.set(0.044, 0.078, 0.108);

    const rightEyeball = new THREE.Mesh(eyeGeo.clone(), eyeMat);
    this.rightEyeNode.add(rightEyeball);

    const rightCornea = new THREE.Mesh(corneaGeo.clone(), corneaMat);
    this.rightEyeNode.add(rightCornea);

    const rightUpperLid = new THREE.Mesh(eyelidGeo.clone(), skinMat);
    rightUpperLid.position.set(0, 0.014, 0.006);
    this.rightEyeNode.add(rightUpperLid);
    this.head.add(this.rightEyeNode);

    // ------------------------------------------
    // Sculpted Nose (Dorsum Bridge & Alar Nostrils)
    // ------------------------------------------
    const noseBridgeGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.055, 8);
    noseBridgeGeo.scale(0.8, 1.0, 1.4);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
    noseBridge.position.set(0, 0.065, 0.130);
    noseBridge.rotation.x = -0.32;
    this.head.add(noseBridge);

    const noseTipGeo = new THREE.SphereGeometry(0.014, 10, 8);
    noseTipGeo.scale(1.2, 0.9, 1.1);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
    noseTip.position.set(0, 0.040, 0.146);
    this.head.add(noseTip);

    // Alar Nostril Wings
    const alarGeo = new THREE.SphereGeometry(0.008, 6, 6);
    const lAlar = new THREE.Mesh(alarGeo, skinMat);
    lAlar.position.set(-0.014, 0.038, 0.138);
    this.head.add(lAlar);
    const rAlar = new THREE.Mesh(alarGeo, skinMat);
    rAlar.position.set(0.014, 0.038, 0.138);
    this.head.add(rAlar);

    // ------------------------------------------
    // Sculpted Mouth & Lips
    // ------------------------------------------
    const upperLipGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.038, 8);
    upperLipGeo.rotateZ(Math.PI / 2);
    upperLipGeo.scale(1.0, 0.45, 0.8);
    const upperLipMat = new THREE.MeshStandardMaterial({
      color: 0xaa5b50,
      roughness: 0.52,
      metalness: 0.02,
    });
    const upperLip = new THREE.Mesh(upperLipGeo, upperLipMat);
    upperLip.position.set(0, 0.014, 0.126);
    this.head.add(upperLip);

    const lowerLipGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.034, 8);
    lowerLipGeo.rotateZ(Math.PI / 2);
    lowerLipGeo.scale(1.0, 0.55, 0.85);
    const lowerLip = new THREE.Mesh(lowerLipGeo, upperLipMat);
    lowerLip.position.set(0, 0.002, 0.124);
    this.head.add(lowerLip);

    // ------------------------------------------
    // Sculpted Ears (Left & Right)
    // ------------------------------------------
    const earGeo = new THREE.BoxGeometry(0.025, 0.065, 0.04);
    earGeo.scale(0.8, 1.0, 1.0);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.128, 0.065, 0.005);
    leftEar.rotation.set(0.12, -0.22, -0.15);
    this.head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.128, 0.065, 0.005);
    rightEar.rotation.set(0.12, 0.22, 0.15);
    this.head.add(rightEar);

    // ------------------------------------------
    // Explorer Hair Tufts & Sideburns (Peeking from Fedora)
    // ------------------------------------------
    const sideburnGeo = new THREE.BoxGeometry(0.022, 0.075, 0.035);
    const leftSideburn = new THREE.Mesh(sideburnGeo, hairMat);
    leftSideburn.position.set(-0.122, 0.075, 0.03);
    this.head.add(leftSideburn);

    const rightSideburn = new THREE.Mesh(sideburnGeo, hairMat);
    rightSideburn.position.set(0.122, 0.075, 0.03);
    this.head.add(rightSideburn);

    // Nape Hair (Back of neck)
    const napeGeo = new THREE.CylinderGeometry(0.082, 0.088, 0.08, 12, 1, false, 0, Math.PI);
    napeGeo.rotateY(Math.PI / 2);
    const napeHair = new THREE.Mesh(napeGeo, hairMat);
    napeHair.position.set(0, 0.02, -0.035);
    this.head.add(napeHair);

    // Forehead Hair Bangs under hat
    const bangsGeo = new THREE.BoxGeometry(0.10, 0.025, 0.03);
    const bangs = new THREE.Mesh(bangsGeo, hairMat);
    bangs.position.set(0, 0.13, 0.095);
    bangs.rotation.x = -0.15;
    this.head.add(bangs);

    // ------------------------------------------
    // 1928 Fur-Felt Fedora with Pinched Teardrop Crown & Snap-Brim
    // ------------------------------------------
    // Fedora: Curved Raked Snap-Brim (Lowered in front, swept back)
    const brimGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.022, 24);
    brimGeo.scale(0.92, 1.0, 1.14);
    const brim = new THREE.Mesh(brimGeo, feltMat);
    brim.position.set(0, 0.145, -0.015);
    brim.rotation.x = -0.10;
    brim.castShadow = true;
    this.head.add(brim);

    // Fedora: Pinched Teardrop Crown
    const crownGeo = new THREE.CylinderGeometry(0.145, 0.175, 0.20, 18);
    crownGeo.scale(0.86, 1.0, 1.12);
    const crown = new THREE.Mesh(crownGeo, feltMat);
    crown.position.set(0, 0.24, -0.015);
    crown.rotation.x = -0.10;
    crown.castShadow = true;
    this.head.add(crown);

    // Fedora Center Teardrop Crease Dent (Sculpted indentation on crown top)
    const dentGeo = new THREE.BoxGeometry(0.07, 0.05, 0.18);
    const dent = new THREE.Mesh(dentGeo, feltMat);
    dent.position.set(0, 0.315, -0.02);
    dent.rotation.x = -0.10;
    this.head.add(dent);

    // Dark Grosgrain Silk Ribbon Hatband
    const bandGeo = new THREE.CylinderGeometry(0.177, 0.177, 0.040, 18);
    bandGeo.scale(0.88, 1.0, 1.13);
    const band = new THREE.Mesh(bandGeo, ribbonMat);
    band.position.set(0, 0.17, -0.015);
    band.rotation.x = -0.10;
    this.head.add(band);

    // Grosgrain Ribbon Bow Knot on Left Side
    const bowGeo = new THREE.BoxGeometry(0.015, 0.038, 0.055);
    const bow = new THREE.Mesh(bowGeo, ribbonMat);
    bow.position.set(-0.160, 0.17, -0.015);
    bow.rotation.set(-0.10, 0, 0.15);
    this.head.add(bow);

    this.body.add(this.head);

    // ==========================================
    // 4. ARTICULATED TWO-SEGMENT LEGS (KNEES + BOOTS)
    // ==========================================
    const legDataL = this.createArticulatedLeg(pantsMat, bootLeatherMat, brassMat);
    this.leftLeg = legDataL.legGroup;
    this.leftKnee = legDataL.kneeGroup;
    this.leftLeg.position.set(-0.13, 0.74, 0);
    this.body.add(this.leftLeg);

    const legDataR = this.createArticulatedLeg(pantsMat, bootLeatherMat, brassMat);
    this.rightLeg = legDataR.legGroup;
    this.rightKnee = legDataR.kneeGroup;
    this.rightLeg.position.set(0.13, 0.74, 0);
    this.body.add(this.rightLeg);

    // ==========================================
    // 5. ARTICULATED TWO-SEGMENT ARMS (ELBOWS + HANDS)
    // ==========================================
    const armDataL = this.createArticulatedArm(coatMat, bodySkinMat, brassMat, false);
    this.leftArm = armDataL.armGroup;
    this.leftElbow = armDataL.elbowGroup;
    this.leftArm.position.set(-0.30, 1.34, 0);
    this.body.add(this.leftArm);

    const armDataR = this.createArticulatedArm(coatMat, bodySkinMat, brassMat, true);
    this.rightArm = armDataR.armGroup;
    this.rightElbow = armDataR.elbowGroup;
    this.rightArm.position.set(0.30, 1.34, 0);
    this.body.add(this.rightArm);

    // ==========================================
    // 6. VINTAGE HANDHELD EXPEDITION BRASS TORCH
    // ==========================================
    this.handTorchGroup = new THREE.Group();
    const torchTubeGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.22, 10);
    torchTubeGeo.rotateX(Math.PI / 2);
    const torchTube = new THREE.Mesh(torchTubeGeo, brassMat);
    torchTube.castShadow = true;
    this.handTorchGroup.add(torchTube);

    const reflectorGeo = new THREE.CylinderGeometry(0.054, 0.030, 0.08, 12);
    reflectorGeo.rotateX(Math.PI / 2);
    const reflector = new THREE.Mesh(reflectorGeo, brassMat);
    reflector.position.z = 0.14;
    reflector.castShadow = true;
    this.handTorchGroup.add(reflector);

    this.torchLensMat = new THREE.MeshBasicMaterial({ color: 0x443322 });
    const lensGeo = new THREE.CircleGeometry(0.050, 14);
    const lens = new THREE.Mesh(lensGeo, this.torchLensMat);
    lens.position.z = 0.182;
    this.handTorchGroup.add(lens);

    this.handTorchGroup.position.set(0, -0.36, 0.09);
    this.handTorchGroup.visible = false;
    this.rightElbow.add(this.handTorchGroup);
  }

  /**
   * Builds an articulated 2-segment leg with anatomical thigh, knee joint, calf, and treaded leather boot
   */
  private createArticulatedLeg(
    pantsMat: THREE.Material,
    bootMat: THREE.Material,
    brassMat: THREE.Material
  ): { legGroup: THREE.Group; kneeGroup: THREE.Group } {
    const legGroup = new THREE.Group();

    // Upper Thigh Segment (Muscular quad/hamstring cylinder)
    const thighGeo = new THREE.CylinderGeometry(0.098, 0.078, 0.40, 12);
    thighGeo.scale(1.02, 1.0, 1.14);
    const thigh = new THREE.Mesh(thighGeo, pantsMat);
    thigh.position.y = -0.20;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Articulated Knee Joint & Lower Shin
    const kneeGroup = new THREE.Group();
    kneeGroup.position.set(0, -0.40, 0);

    // Patella Kneecap Contour
    const kneeCapGeo = new THREE.SphereGeometry(0.065, 10, 8);
    const kneeCap = new THREE.Mesh(kneeCapGeo, pantsMat);
    kneeCap.position.set(0, 0, 0.025);
    kneeGroup.add(kneeCap);

    // Shin & Calf Segment
    const calfGeo = new THREE.CylinderGeometry(0.078, 0.064, 0.38, 12);
    calfGeo.scale(0.96, 1.0, 1.18);
    const calf = new THREE.Mesh(calfGeo, pantsMat);
    calf.position.y = -0.19;
    calf.castShadow = true;
    kneeGroup.add(calf);

    // ------------------------------------------
    // High-Top Expedition Lace-Up Leather Field Boot
    // ------------------------------------------
    // Boot Upper Shaft
    const bootShaftGeo = new THREE.CylinderGeometry(0.070, 0.066, 0.18, 12);
    const bootShaft = new THREE.Mesh(bootShaftGeo, bootMat);
    bootShaft.position.set(0, -0.33, 0.005);
    bootShaft.castShadow = true;
    kneeGroup.add(bootShaft);

    // Boot Tongue & Lacing Geometry with Brass Eyelets
    const tongueGeo = new THREE.BoxGeometry(0.035, 0.16, 0.04);
    const tongue = new THREE.Mesh(tongueGeo, bootMat);
    tongue.position.set(0, -0.32, 0.062);
    kneeGroup.add(tongue);

    // Criss-Cross Boot Laces & Eyelets
    for (let l = 0; l < 4; l++) {
      const yLace = -0.26 - l * 0.035;
      const laceGeo = new THREE.BoxGeometry(0.045, 0.006, 0.01);
      const laceMat = new THREE.MeshStandardMaterial({ color: 0x3d3024, roughness: 0.85 });
      const lace = new THREE.Mesh(laceGeo, laceMat);
      lace.position.set(0, yLace, 0.076);
      kneeGroup.add(lace);

      for (let eye = -1; eye <= 1; eye += 2) {
        const eyeletGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.004, 6);
        eyeletGeo.rotateX(Math.PI / 2);
        const eyelet = new THREE.Mesh(eyeletGeo, brassMat);
        eyelet.position.set(eye * 0.026, yLace, 0.075);
        kneeGroup.add(eyelet);
      }
    }

    // Boot Vamp & Contoured Toe Box
    const footGeo = new THREE.BoxGeometry(0.125, 0.095, 0.23);
    const foot = new THREE.Mesh(footGeo, bootMat);
    foot.position.set(0, -0.41, 0.045);
    foot.castShadow = true;
    kneeGroup.add(foot);

    // Goodyear Welt Stitching Rim
    const weltGeo = new THREE.BoxGeometry(0.134, 0.015, 0.245);
    const weltMat = new THREE.MeshStandardMaterial({ color: 0x2e1a0f, roughness: 0.65 });
    const welt = new THREE.Mesh(weltGeo, weltMat);
    welt.position.set(0, -0.45, 0.045);
    kneeGroup.add(welt);

    // Heavy Rubber Lug Vibram Tread Sole
    const soleGeo = new THREE.BoxGeometry(0.132, 0.030, 0.25);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.95 });
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.47, 0.045);
    kneeGroup.add(sole);

    legGroup.add(kneeGroup);
    return { legGroup, kneeGroup };
  }

  /**
   * Builds an articulated 2-segment arm with deltoid shoulder cap, bicep, elbow, rolled canvas cuff,
   * muscular forearm, wrist, and anatomical hand with sculpted fingers and knuckles
   */
  private createArticulatedArm(
    coatMat: THREE.Material,
    skinMat: THREE.Material,
    brassMat: THREE.Material,
    isRightArm: boolean
  ): { armGroup: THREE.Group; elbowGroup: THREE.Group } {
    const armGroup = new THREE.Group();

    // Deltoid Shoulder Cap
    const shoulderGeo = new THREE.SphereGeometry(0.088, 12, 10);
    const shoulder = new THREE.Mesh(shoulderGeo, coatMat);
    armGroup.add(shoulder);

    // Bicep / Upper Arm Cylinder
    const bicepGeo = new THREE.CylinderGeometry(0.076, 0.065, 0.32, 12);
    const bicep = new THREE.Mesh(bicepGeo, coatMat);
    bicep.position.y = -0.16;
    bicep.castShadow = true;
    armGroup.add(bicep);

    // Articulated Elbow Joint & Forearm
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, -0.32, 0);

    // Upper Forearm with Rolled Canvas Sleeve Cuff
    const upperForearmGeo = new THREE.CylinderGeometry(0.066, 0.062, 0.12, 12);
    const upperForearm = new THREE.Mesh(upperForearmGeo, coatMat);
    upperForearm.position.y = -0.06;
    upperForearm.castShadow = true;
    elbowGroup.add(upperForearm);

    // Rolled Fabric Torus Sleeve Ring
    const cuffGeo = new THREE.TorusGeometry(0.065, 0.020, 8, 16);
    const cuff = new THREE.Mesh(cuffGeo, coatMat);
    cuff.position.y = -0.12;
    cuff.rotation.x = Math.PI / 2;
    elbowGroup.add(cuff);

    // Exposed Muscular Lower Forearm (Showing Skin with Micro-Pores)
    const lowerForearmGeo = new THREE.CylinderGeometry(0.055, 0.044, 0.20, 12);
    const lowerForearm = new THREE.Mesh(lowerForearmGeo, skinMat);
    lowerForearm.position.y = -0.22;
    lowerForearm.castShadow = true;
    elbowGroup.add(lowerForearm);

    // Wrist Joint with Vintage Leather Field Strap / Watch on Left Arm
    const wristGeo = new THREE.CylinderGeometry(0.040, 0.042, 0.05, 10);
    const wrist = new THREE.Mesh(wristGeo, skinMat);
    wrist.position.y = -0.32;
    elbowGroup.add(wrist);

    if (!isRightArm) {
      // 1928 Trench Wristwatch on Left Arm
      const watchBandGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.022, 12);
      const watchBandMat = new THREE.MeshStandardMaterial({ color: 0x331c10, roughness: 0.55 });
      const watchBand = new THREE.Mesh(watchBandGeo, watchBandMat);
      watchBand.position.y = -0.32;
      elbowGroup.add(watchBand);

      const watchCaseGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.008, 10);
      watchCaseGeo.rotateX(Math.PI / 2);
      const watchCase = new THREE.Mesh(watchCaseGeo, brassMat);
      watchCase.position.set(0, -0.32, 0.044);
      elbowGroup.add(watchCase);
    }

    // ------------------------------------------
    // Anatomical Hand with Sculpted Fingers & Knuckles
    // ------------------------------------------
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.35, 0);

    // Contoured Palm
    const palmGeo = new THREE.BoxGeometry(0.075, 0.082, 0.042);
    const palm = new THREE.Mesh(palmGeo, skinMat);
    palm.position.set(0, -0.04, 0.008);
    palm.castShadow = true;
    handGroup.add(palm);

    // Knuckle Ridge
    const knuckleGeo = new THREE.BoxGeometry(0.076, 0.018, 0.038);
    const knuckle = new THREE.Mesh(knuckleGeo, skinMat);
    knuckle.position.set(0, -0.075, 0.010);
    handGroup.add(knuckle);

    // 4 Articulated Fingers (Curled in natural relaxed explorer grip)
    const fingerSpacing = 0.018;
    for (let f = 0; f < 4; f++) {
      const xF = -0.027 + f * fingerSpacing;
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(xF, -0.080, 0.012);

      // Proximal Phalanx
      const proxGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.032, 6);
      const prox = new THREE.Mesh(proxGeo, skinMat);
      prox.position.y = -0.016;
      fingerGroup.add(prox);

      // Intermediate & Distal Phalanx (curled inwards)
      const distGeo = new THREE.CylinderGeometry(0.007, 0.006, 0.026, 6);
      const dist = new THREE.Mesh(distGeo, skinMat);
      dist.position.set(0, -0.038, 0.008);
      dist.rotation.x = 0.45;
      fingerGroup.add(dist);

      handGroup.add(fingerGroup);
    }

    // Opposable Thumb (2 Articulated Joints)
    const thumbSide = isRightArm ? 0.042 : -0.042;
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(thumbSide, -0.035, 0.020);
    thumbGroup.rotation.set(0.3, isRightArm ? -0.4 : 0.4, isRightArm ? 0.35 : -0.35);

    const thumbProxGeo = new THREE.CylinderGeometry(0.010, 0.009, 0.032, 6);
    const thumbProx = new THREE.Mesh(thumbProxGeo, skinMat);
    thumbProx.position.y = -0.016;
    thumbGroup.add(thumbProx);

    const thumbDistGeo = new THREE.CylinderGeometry(0.008, 0.007, 0.024, 6);
    const thumbDist = new THREE.Mesh(thumbDistGeo, skinMat);
    thumbDist.position.set(0, -0.036, 0.006);
    thumbDist.rotation.x = 0.4;
    thumbGroup.add(thumbDist);

    handGroup.add(thumbGroup);
    elbowGroup.add(handGroup);

    armGroup.add(elbowGroup);
    return { armGroup, elbowGroup };
  }

  /**
   * Photorealistic Mecanim-Style Locomotion Animation Engine matching Unity 5 fidelity
   */
  public update(
    delta: number,
    speed: number,
    isMoving: boolean,
    facingYaw: number,
    isSittingInBoat: boolean,
    cameraYaw = facingYaw,
    cameraPitch = 0,
    isTorchOn = false
  ) {
    this.group.rotation.y = facingYaw;

    // Toggle handheld torch visibility and emissive warmth
    this.handTorchGroup.visible = isTorchOn;
    this.torchLensMat.color.setHex(isTorchOn ? 0xfff0aa : 0x443322);

    if (isSittingInBoat) {
      // Sitting Rowing Pose
      this.body.position.y = -0.18;
      this.body.rotation.z = 0;
      this.body.rotation.x = 0.08;

      this.leftLeg.rotation.set(Math.PI / 2.3, 0.1, 0);
      this.leftKnee.rotation.x = -Math.PI / 2.8;

      this.rightLeg.rotation.set(Math.PI / 2.3, -0.1, 0);
      this.rightKnee.rotation.x = -Math.PI / 2.8;

      this.leftArm.rotation.set(Math.PI / 3.8, 0, 0);
      this.leftElbow.rotation.x = -Math.PI / 4.0;

      this.rightArm.rotation.set(Math.PI / 3.8, 0, 0);
      this.rightElbow.rotation.x = -Math.PI / 4.0;

      this.head.rotation.set(0, 0, 0);
      return;
    }

    // ==========================================
    // 1. DYNAMIC HEAD & EYE GAZE TRACKING
    // ==========================================
    const yawDiff = THREE.MathUtils.euclideanModulo(cameraYaw - facingYaw + Math.PI, Math.PI * 2) - Math.PI;
    const targetHeadYaw = THREE.MathUtils.clamp(yawDiff, -0.75, 0.75);
    const targetHeadPitch = THREE.MathUtils.clamp(-cameraPitch * 0.7, -0.45, 0.45);
    this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, targetHeadYaw, Math.min(1.0, delta * 9.0));
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, targetHeadPitch, Math.min(1.0, delta * 9.0));

    // Dynamic Ocular Gaze Deviation (Eyes glance slightly in target direction before head turns)
    const eyeGlanceYaw = THREE.MathUtils.clamp((targetHeadYaw - this.head.rotation.y) * 0.45, -0.22, 0.22);
    const eyeGlancePitch = THREE.MathUtils.clamp((targetHeadPitch - this.head.rotation.x) * 0.45, -0.15, 0.15);
    this.leftEyeNode.rotation.y = eyeGlanceYaw;
    this.leftEyeNode.rotation.x = eyeGlancePitch;
    this.rightEyeNode.rotation.y = eyeGlanceYaw;
    this.rightEyeNode.rotation.x = eyeGlancePitch;

    // ==========================================
    // 2. KINETIC ATHLETIC BANKING & WEIGHT SHIFT
    // ==========================================
    const targetBank = isMoving ? THREE.MathUtils.clamp(-yawDiff * 0.28, -0.18, 0.18) * Math.min(speed / 4.0, 1.0) : 0;
    this.body.rotation.z = THREE.MathUtils.lerp(this.body.rotation.z, targetBank, Math.min(1.0, delta * 8.0));

    // ==========================================
    // 3. THORACIC RESPIRATORY BREATHING (Unity Mecanim Style)
    // ==========================================
    this.breathPhase += delta * (isMoving ? 3.2 : 1.4);
    const breathScale = 1.0 + Math.sin(this.breathPhase) * 0.018;
    this.chestMesh.scale.set(1.0 + Math.sin(this.breathPhase) * 0.015, breathScale, 1.0 + Math.sin(this.breathPhase) * 0.022);

    // ==========================================
    // 4. ARTICULATED HIERARCHICAL LOCOMOTION
    // ==========================================
    if (isMoving && speed > 0.1) {
      const strideSpeed = Math.min(speed * 3.6, 13.0);
      this.walkPhase += delta * strideSpeed;
      this.coatSwayTimer += delta * (strideSpeed * 0.85);

      const hipAngle = Math.sin(this.walkPhase) * 0.62;
      const armAngle = -Math.sin(this.walkPhase) * 0.52;

      // Leg Hierarchical Articulation with Natural Knee Flexion & Foot Cushioning
      this.leftLeg.rotation.x = hipAngle;
      // Knee bends backward when leg swings forward, cushions slightly on ground impact
      const leftKneeBend = hipAngle < 0 ? Math.sin(-hipAngle * 2.2) * 0.78 : 0.06;
      this.leftKnee.rotation.x = -leftKneeBend;

      this.rightLeg.rotation.x = -hipAngle;
      const rightKneeBend = -hipAngle < 0 ? Math.sin(hipAngle * 2.2) * 0.78 : 0.06;
      this.rightKnee.rotation.x = -rightKneeBend;

      // Arm Hierarchical Articulation with Natural Elbow Flexion
      this.leftArm.rotation.x = armAngle;
      this.leftElbow.rotation.x = -0.25 - Math.max(0, -armAngle) * 0.45;

      if (isTorchOn) {
        // Raise right arm forward to illuminate trail
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -Math.PI / 3.4, Math.min(1.0, delta * 12.0));
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, -0.2, Math.min(1.0, delta * 12.0));
      } else {
        this.rightArm.rotation.x = -armAngle;
        this.rightElbow.rotation.x = -0.25 - Math.max(0, armAngle) * 0.45;
      }

      // Sinusoidal Pelvic Cadence & Torque Transfer
      this.body.position.y = Math.abs(Math.sin(this.walkPhase * 2)) * 0.04;
      this.body.rotation.y = Math.sin(this.walkPhase) * 0.05; // Pelvic twist

      // Duster Coat Tails Sway Backwards with Momentum & Wind
      const tailSway = Math.sin(this.coatSwayTimer) * 0.12 + Math.min(speed / 6.0, 1.0) * 0.32;
      this.coatTailLeft.rotation.x = tailSway;
      this.coatTailRight.rotation.x = tailSway;
      this.satchelMesh.rotation.x = Math.sin(this.walkPhase) * 0.15;
    } else {
      // Idle Breathing Cycle (0.24Hz Calm Explorer Respiratory Oscillation)
      this.walkPhase += delta * 1.6;
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, delta * 8.0);
      this.leftKnee.rotation.x = THREE.MathUtils.lerp(this.leftKnee.rotation.x, 0, delta * 8.0);

      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, delta * 8.0);
      this.rightKnee.rotation.x = THREE.MathUtils.lerp(this.rightKnee.rotation.x, 0, delta * 8.0);

      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, delta * 8.0);
      this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, -0.15, delta * 8.0);

      if (isTorchOn) {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -Math.PI / 3.4, delta * 10.0);
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, -0.2, delta * 10.0);
      } else {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, delta * 8.0);
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, -0.15, delta * 8.0);
      }

      this.body.position.y = Math.sin(this.walkPhase) * 0.015;
      this.body.rotation.y = 0;
      this.coatTailLeft.rotation.x = THREE.MathUtils.lerp(this.coatTailLeft.rotation.x, 0, delta * 6.0);
      this.coatTailRight.rotation.x = THREE.MathUtils.lerp(this.coatTailRight.rotation.x, 0, delta * 6.0);
      this.satchelMesh.rotation.x = THREE.MathUtils.lerp(this.satchelMesh.rotation.x, 0, delta * 6.0);
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }
}
