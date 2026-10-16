/**
 * The Lost Meridian - Wildlife & Atmospheric Fauna System
 * Canopy flocking birds, fluttering jungle butterflies, and deep cave fireflies.
 */

import * as THREE from 'three';

interface Bird {
  group: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  speed: number;
  altitude: number;
  radius: number;
  angle: number;
  center: THREE.Vector3;
  flapRate: number;
  rollAngle: number;
}

interface Butterfly {
  group: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  basePos: THREE.Vector3;
  phase: number;
  flightSpeed: number;
  radius: number;
  flutterSpeed: number;
}

interface Gecko {
  group: THREE.Group;
  tail: THREE.Mesh;
  legs: THREE.Mesh[];
  homePos: THREE.Vector3;
  hidingPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  facingAngle: number;
  isFleeing: boolean;
  scuttleSpeed: number;
  phase: number;
}

const _scratchButterflyOffset = new THREE.Vector3();
const _scratchGeckoDir = new THREE.Vector3();

export class WildlifeSystem {
  public group = new THREE.Group();

  private birds: Bird[] = [];
  private butterflies: Butterfly[] = [];
  private geckos: Gecko[] = [];
  private fireflies!: THREE.Points;
  private fireflyPositions!: Float32Array;
  private butterflyTextures: THREE.CanvasTexture[] = [];

  private fireflyMat!: THREE.ShaderMaterial;

  constructor() {
    this.initBirds();
    this.initButterflies();
    this.initGeckos();
    this.initFireflies();
  }

  private isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );

  private initBirds() {
    // Shared materials for tropical macaws, canopy raptors, and coastal sea petrels
    const macawRedMat = new THREE.MeshStandardMaterial({
      color: 0xd62828,
      roughness: 0.55,
      metalness: 0.1,
    });
    const macawBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0077b6,
      roughness: 0.5,
      metalness: 0.15,
    });
    const macawYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfcb001,
      roughness: 0.6,
    });
    const gullWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.45,
      metalness: 0.05,
    });
    const gullSlateMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
    });
    const beakMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.35,
    });
    const gullBeakMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
    });

    const birdCount = this.isMobile ? 8 : 18;
    for (let i = 0; i < birdCount; i++) {
      const birdGroup = new THREE.Group();
      const isSeabird = i % 3 === 0;
      const isMacaw = i % 3 === 1;

      const primaryMat = isSeabird ? gullWhiteMat : isMacaw ? macawRedMat : macawBlueMat;
      const accentMat = isSeabird ? gullSlateMat : isMacaw ? macawYellowMat : macawRedMat;
      const birdBeakMat = isSeabird ? gullBeakMat : beakMat;

      // 1. Aerodynamic Bird Torso & Chest
      const torsoGeo = new THREE.ConeGeometry(0.18, 0.75, 7);
      torsoGeo.rotateX(Math.PI / 2);
      const torso = new THREE.Mesh(torsoGeo, primaryMat);
      birdGroup.add(torso);

      // 2. Head & Curved Beak
      const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const head = new THREE.Mesh(headGeo, primaryMat);
      head.position.set(0, 0.08, 0.45);

      const beakGeo = new THREE.ConeGeometry(0.05, 0.16, 5);
      beakGeo.rotateX(Math.PI / 2);
      const beak = new THREE.Mesh(beakGeo, birdBeakMat);
      beak.position.set(0, -0.04, 0.12);
      head.add(beak);
      birdGroup.add(head);

      // 3. Long Trailing Tail Feathers
      const tailGeo = new THREE.PlaneGeometry(0.18, 0.9);
      tailGeo.rotateX(-Math.PI / 2);
      tailGeo.translate(0, 0, -0.55);
      const tail = new THREE.Mesh(tailGeo, accentMat);
      tail.castShadow = true;
      birdGroup.add(tail);

      // 4. Left Feathered Wing (Hinged at shoulder x = 0.12)
      const leftWingGroup = new THREE.Group();
      leftWingGroup.position.set(0.12, 0.06, 0.1);

      const innerWingGeo = new THREE.PlaneGeometry(0.5, 0.3);
      innerWingGeo.translate(0.25, 0, 0);
      const innerWing = new THREE.Mesh(innerWingGeo, primaryMat);
      innerWing.rotation.x = Math.PI / 2;
      leftWingGroup.add(innerWing);

      const outerWingGeo = new THREE.PlaneGeometry(0.65, 0.26);
      outerWingGeo.translate(0.32, 0, -0.04);
      const outerWing = new THREE.Mesh(outerWingGeo, accentMat);
      outerWing.position.set(0.5, 0, 0);
      outerWing.rotation.x = Math.PI / 2;
      leftWingGroup.add(outerWing);

      birdGroup.add(leftWingGroup);

      // 5. Right Feathered Wing (Mirrored)
      const rightWingGroup = new THREE.Group();
      rightWingGroup.position.set(-0.12, 0.06, 0.1);

      const innerWingGeoR = innerWingGeo.clone();
      const innerWingR = new THREE.Mesh(innerWingGeoR, primaryMat);
      innerWingR.rotation.x = Math.PI / 2;
      innerWingR.scale.set(-1, 1, 1);
      rightWingGroup.add(innerWingR);

      const outerWingGeoR = outerWingGeo.clone();
      const outerWingR = new THREE.Mesh(outerWingGeoR, accentMat);
      outerWingR.position.set(-0.5, 0, 0);
      outerWingR.rotation.x = Math.PI / 2;
      outerWingR.scale.set(-1, 1, 1);
      rightWingGroup.add(outerWingR);

      birdGroup.add(rightWingGroup);

      const scale = 0.75 + Math.random() * 0.35;
      birdGroup.scale.set(scale, scale, scale);

      const bird: Bird = {
        group: birdGroup,
        leftWing: leftWingGroup,
        rightWing: rightWingGroup,
        speed: 0.28 + Math.random() * 0.22,
        altitude: 22 + Math.random() * 18,
        radius: 22 + Math.random() * 32,
        angle: Math.random() * Math.PI * 2,
        center: new THREE.Vector3((Math.random() - 0.5) * 45, 0, 40 - Math.random() * 140),
        flapRate: 6.5 + Math.random() * 2.5,
        rollAngle: 0,
      };

      this.birds.push(bird);
      this.group.add(birdGroup);
    }
  }

  private createButterflyTexture(type: 'morpho' | 'birdwing' | 'emerald'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 128, 128);

    // Anatomical Butterfly Wing Path (curved forewing & scalloped hindwing)
    ctx.beginPath();
    ctx.moveTo(8, 64);
    ctx.bezierCurveTo(24, 20, 70, 8, 118, 14); // Forewing top curve
    ctx.bezierCurveTo(124, 40, 114, 68, 92, 76); // Forewing outer edge
    ctx.bezierCurveTo(116, 92, 108, 118, 74, 122); // Hindwing scallop
    ctx.bezierCurveTo(36, 124, 14, 98, 8, 64); // Hindwing return to root
    ctx.closePath();

    // Vibrant Iridescent Wing Gradient
    const grad = ctx.createRadialGradient(24, 64, 8, 64, 64, 60);
    if (type === 'morpho') {
      grad.addColorStop(0, '#70d6ff');
      grad.addColorStop(0.35, '#0099ff');
      grad.addColorStop(0.7, '#0033aa');
      grad.addColorStop(1.0, '#050b18');
    } else if (type === 'birdwing') {
      grad.addColorStop(0, '#ffe066');
      grad.addColorStop(0.4, '#ff9900');
      grad.addColorStop(0.75, '#cc4400');
      grad.addColorStop(1.0, '#150804');
    } else {
      grad.addColorStop(0, '#86efac');
      grad.addColorStop(0.4, '#10b981');
      grad.addColorStop(0.75, '#047857');
      grad.addColorStop(1.0, '#062015');
    }

    ctx.fillStyle = grad;
    ctx.fill();

    // Velvety outer margin
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Delicately branching wing veins
    ctx.strokeStyle = 'rgba(10, 15, 25, 0.55)';
    ctx.lineWidth = 1.2;
    const veinEnds = [
      [110, 26], [116, 45], [105, 65], [96, 90], [78, 110]
    ];
    for (const [vx, vy] of veinEnds) {
      ctx.beginPath();
      ctx.moveTo(14, 64);
      ctx.quadraticCurveTo(55, (64 + vy) * 0.5 - 6, vx, vy);
      ctx.stroke();
    }

    // Delicate white marginal pearls on wing edge
    ctx.fillStyle = '#ffffff';
    for (let p = 0; p < 6; p++) {
      const px = 100 + Math.sin(p * 0.8) * 16;
      const py = 28 + p * 14;
      ctx.beginPath();
      ctx.arc(px, py, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private initButterflies() {
    const morphoTex = this.createButterflyTexture('morpho');
    const birdwingTex = this.createButterflyTexture('birdwing');
    const emeraldTex = this.createButterflyTexture('emerald');
    this.butterflyTextures = [morphoTex, birdwingTex, emeraldTex];

    // Wing geometry hinged at root (x = 0)
    const wingGeo = new THREE.PlaneGeometry(0.22, 0.20);
    wingGeo.translate(0.11, 0, 0); // Translate center so pivot is right at the root hinge

    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x16120e });
    const bodyGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.14, 5);
    bodyGeo.rotateX(Math.PI / 2);

    const materials = this.butterflyTextures.map(
      (tex) =>
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          side: THREE.DoubleSide,
          alphaTest: 0.1,
          depthWrite: false,
        })
    );

    const butterflyCount = this.isMobile ? 6 : 16;
    for (let i = 0; i < butterflyCount; i++) {
      const mat = materials[i % materials.length];
      const bfGroup = new THREE.Group();

      // Slender dark body
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      bfGroup.add(body);

      // Left Wing (hinged at x = 0, flaps upward/downward on Z/Y)
      const leftWing = new THREE.Mesh(wingGeo, mat);
      leftWing.position.set(0.008, 0, 0);
      bfGroup.add(leftWing);

      // Right Wing (mirrored scale on X)
      const rightWing = new THREE.Mesh(wingGeo, mat);
      rightWing.position.set(-0.008, 0, 0);
      rightWing.scale.set(-1, 1, 1);
      bfGroup.add(rightWing);

      const z = 72 - (i * 7.5) + (Math.random() - 0.5) * 6;
      const x = (Math.random() - 0.5) * 14;
      const y = 1.2 + Math.random() * 1.6;

      const butterfly: Butterfly = {
        group: bfGroup,
        leftWing,
        rightWing,
        basePos: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2,
        flightSpeed: 0.8 + Math.random() * 0.6,
        radius: 0.6 + Math.random() * 0.8,
        flutterSpeed: 14.0 + Math.random() * 6.0,
      };

      bfGroup.position.set(x, y, z);
      this.butterflies.push(butterfly);
      this.group.add(bfGroup);
    }
  }

  private initFireflies() {
    const count = 250;
    const geo = new THREE.BufferGeometry();
    this.fireflyPositions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Concentrate in Cave (Z = -55 to -100) and Meridian (Z = -190 to -260)
      const inChamber = i % 2 === 0;
      if (inChamber) {
        this.fireflyPositions[i * 3] = (Math.random() - 0.5) * 35;
        this.fireflyPositions[i * 3 + 1] = -22 + Math.random() * 12;
        this.fireflyPositions[i * 3 + 2] = -230 + (Math.random() - 0.5) * 35;
      } else {
        this.fireflyPositions[i * 3] = (Math.random() - 0.5) * 20;
        this.fireflyPositions[i * 3 + 1] = -14 + Math.random() * 8;
        this.fireflyPositions[i * 3 + 2] = -75 + (Math.random() - 0.5) * 30;
      }
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 1.2 + Math.random() * 2.2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.fireflyPositions, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.fireflyMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        attribute float aPhase;
        attribute float aSize;
        varying float vAlpha;
        varying float vPhase;

        void main() {
          vec3 pos = position;
          float t = uTime * 1.4 + aPhase;
          pos.y += sin(t * 1.1) * 0.45;
          pos.x += cos(t * 0.8) * 0.35;
          pos.z += sin(t * 0.6) * 0.35;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float dist = length(mvPosition.xyz);
          gl_PointSize = aSize * (260.0 / max(1.0, dist));

          vAlpha = 0.45 + 0.55 * sin(t * 1.8);
          vPhase = aPhase;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vPhase;

        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float dist = length(p);
          if (dist > 0.5) discard;
          float glow = exp(-dist * dist * 14.0);

          // Soft bioluminescent gradient (cyan/emerald to warm celestial gold)
          vec3 fireflyCol = mix(vec3(0.12, 0.95, 0.88), vec3(0.35, 1.0, 0.65), sin(vPhase) * 0.5 + 0.5);
          gl_FragColor = vec4(fireflyCol, glow * vAlpha * 0.88);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.fireflies = new THREE.Points(geo, this.fireflyMat);
    this.fireflies.frustumCulled = false;
    this.group.add(this.fireflies);
  }

  private initGeckos() {
    const geckoMat = new THREE.MeshStandardMaterial({
      color: 0x5a7d45, // mottled olive-sage wall lizard
      roughness: 0.75,
      metalness: 0.1,
    });
    const geckoBellyMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8a5,
      roughness: 0.8,
    });

    // 8 distinct sunning spots on rocks and terrace ledges
    const sunningSpots: { pos: [number, number, number]; hide: [number, number, number] }[] = [
      { pos: [3.5, 1.4, 30.5], hide: [5.2, 1.3, 31.8] },
      { pos: [-4.2, 1.6, 24.0], hide: [-6.0, 1.4, 25.5] },
      { pos: [6.8, 2.1, 8.5], hide: [8.5, 2.0, 7.0] },
      { pos: [-7.5, 1.9, -4.0], hide: [-9.0, 1.8, -5.5] },
      { pos: [5.0, 2.8, -25.0], hide: [7.2, 2.7, -26.5] },
      { pos: [-6.5, 3.2, -45.0], hide: [-8.0, 3.1, -46.0] },
      { pos: [8.2, 4.0, -75.0], hide: [10.0, 3.9, -76.5] },
      { pos: [-3.8, 4.4, -98.0], hide: [-5.5, 4.3, -99.0] },
    ];

    sunningSpots.forEach((spot) => {
      const gGroup = new THREE.Group();

      // Body (flattened tapered cylinder)
      const bodyGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.32, 6);
      bodyGeo.rotateX(Math.PI / 2);
      bodyGeo.scale(1.2, 0.6, 1.0);
      const body = new THREE.Mesh(bodyGeo, geckoMat);
      gGroup.add(body);

      // Head
      const headGeo = new THREE.ConeGeometry(0.05, 0.12, 5);
      headGeo.rotateX(Math.PI / 2);
      headGeo.scale(1.1, 0.6, 1.0);
      const head = new THREE.Mesh(headGeo, geckoMat);
      head.position.set(0, 0.01, 0.2);
      gGroup.add(head);

      // Tail (segmented, flexible)
      const tailGeo = new THREE.ConeGeometry(0.035, 0.38, 5);
      tailGeo.rotateX(-Math.PI / 2);
      tailGeo.scale(0.9, 0.5, 1.0);
      const tail = new THREE.Mesh(tailGeo, geckoMat);
      tail.position.set(0, 0.005, -0.32);
      gGroup.add(tail);

      // 4 splayed legs
      const legs: THREE.Mesh[] = [];
      const legPositions: [number, number, number, number][] = [
        [0.08, 0, 0.1, 0.6],
        [-0.08, 0, 0.1, -0.6],
        [0.09, 0, -0.08, 0.8],
        [-0.09, 0, -0.08, -0.8],
      ];

      legPositions.forEach(([lx, ly, lz, angle]) => {
        const legGeo = new THREE.BoxGeometry(0.025, 0.015, 0.12);
        const leg = new THREE.Mesh(legGeo, geckoBellyMat);
        leg.position.set(lx, ly, lz);
        leg.rotation.y = angle;
        gGroup.add(leg);
        legs.push(leg);
      });

      const homePos = new THREE.Vector3(...spot.pos);
      const hidingPos = new THREE.Vector3(...spot.hide);
      const currentPos = homePos.clone();
      gGroup.position.copy(currentPos);

      const facingAngle = Math.atan2(hidingPos.x - homePos.x, hidingPos.z - homePos.z) + Math.PI;
      gGroup.rotation.y = facingAngle;

      this.geckos.push({
        group: gGroup,
        tail,
        legs,
        homePos,
        hidingPos,
        currentPos,
        facingAngle,
        isFleeing: false,
        scuttleSpeed: 3.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      });

      this.group.add(gGroup);
    });
  }

  public update(delta: number, time: number, playerPos?: THREE.Vector3) {
    if (this.fireflyMat?.uniforms?.uTime) {
      this.fireflyMat.uniforms.uTime.value = time;
    }
    // 1. Tropical Macaws & Raptors circling overhead with thermal banking
    this.birds.forEach((bird) => {
      // If player approaches bird cluster, birds gain altitude and accelerate
      let speedMult = 1.0;
      if (playerPos) {
        const dist = bird.group.position.distanceTo(playerPos);
        if (dist < 18.0) {
          speedMult = 1.8;
          bird.altitude = Math.min(65.0, bird.altitude + delta * 2.5);
        }
      }

      bird.angle += bird.speed * speedMult * delta;
      const x = bird.center.x + Math.cos(bird.angle) * bird.radius;
      const z = bird.center.z + Math.sin(bird.angle) * bird.radius;
      const y = bird.altitude + Math.sin(bird.angle * 2.5) * 1.8;

      bird.group.position.set(x, y, z);
      bird.group.rotation.y = -bird.angle + Math.PI / 2;

      // Inward banking roll into the turn
      bird.group.rotation.z = 0.22;
      bird.group.rotation.x = Math.cos(bird.angle * 2.5) * 0.08;

      // Articulated flapping with glide pauses
      const flapCycle = Math.sin(time * bird.flapRate * speedMult + bird.altitude);
      const flapAngle = flapCycle * 0.52;
      bird.leftWing.rotation.z = flapAngle;
      bird.rightWing.rotation.z = -flapAngle;
    });

    // 2. Anatomical Morpho & Birdwing Butterflies fluttering in rainforest flowers
    this.butterflies.forEach((bf) => {
      const flightT = time * bf.flightSpeed + bf.phase;
      const offsetX = Math.cos(flightT) * bf.radius;
      const offsetZ = Math.sin(flightT * 0.8) * (bf.radius * 0.9);
      const offsetY = Math.sin(time * 3.2 + bf.phase) * 0.28;

      _scratchButterflyOffset.set(offsetX, offsetY, offsetZ);
      bf.group.position.copy(bf.basePos).add(_scratchButterflyOffset);

      // Orient body along tangent flight trajectory
      const tangentX = -Math.sin(flightT);
      const tangentZ = Math.cos(flightT * 0.8) * 0.8;
      bf.group.rotation.y = Math.atan2(tangentX, tangentZ);

      // Gentle roll banking into the turn
      bf.group.rotation.z = Math.sin(time * 2.5 + bf.phase) * 0.18;

      // Realistic dual-wing flap (hinged at thorax)
      const flapAngle = Math.sin(time * bf.flutterSpeed + bf.phase) * 0.78;
      bf.leftWing.rotation.y = flapAngle;
      bf.rightWing.rotation.y = -flapAngle;
    });

    // 3. Sun-basking Island Geckos scuttling when player approaches
    this.geckos.forEach((gecko) => {
      let targetPos = gecko.homePos;
      if (playerPos) {
        const distToPlayer = gecko.currentPos.distanceTo(playerPos);
        if (distToPlayer < 6.2) {
          gecko.isFleeing = true;
        } else if (distToPlayer > 11.5) {
          gecko.isFleeing = false;
        }
      }

      if (gecko.isFleeing) {
        targetPos = gecko.hidingPos;
      }

      const distToTarget = gecko.currentPos.distanceTo(targetPos);
      const isMoving = distToTarget > 0.08;

      if (isMoving) {
        _scratchGeckoDir.subVectors(targetPos, gecko.currentPos).normalize();
        const moveStep = Math.min(distToTarget, delta * gecko.scuttleSpeed);
        gecko.currentPos.addScaledVector(_scratchGeckoDir, moveStep);
        gecko.group.position.copy(gecko.currentPos);

        const targetYaw = Math.atan2(_scratchGeckoDir.x, _scratchGeckoDir.z);
        gecko.group.rotation.y = targetYaw;

        // Rapid splayed gait animation (opposing leg pairs)
        const gait = Math.sin(time * 26.0 + gecko.phase) * 0.65;
        gecko.legs[0].rotation.y = 0.6 + gait;
        gecko.legs[1].rotation.y = -0.6 + gait;
        gecko.legs[2].rotation.y = 0.8 - gait;
        gecko.legs[3].rotation.y = -0.8 - gait;

        // Tail whip counter-balance
        gecko.tail.rotation.y = -gait * 0.7;
      } else {
        // Idle basking: subtle head twitches & breathing
        const breathe = Math.sin(time * 2.2 + gecko.phase) * 0.04;
        gecko.group.scale.set(1.0 + breathe, 1.0, 1.0);
        gecko.tail.rotation.y = Math.sin(time * 1.1 + gecko.phase) * 0.12;
      }
    });
  }

  public dispose() {
    this.butterflyTextures.forEach((tex) => tex.dispose());
    this.fireflyMat?.dispose();
    this.fireflies?.geometry?.dispose();
  }
}
