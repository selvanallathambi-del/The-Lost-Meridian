/**
 * The Lost Meridian - The Curator's 3D Reliquary & Artifact Inspection Chamber
 * Antique mahogany velvet reliquary case with interactive 3D turntable, magnifying loupe, and epigraphy appraisal.
 */

import React, { useState, useRef, useEffect } from 'react';
import { GameManager } from '../game/GameManager';
import { X, ZoomIn, RotateCw, Sparkles, Eye, Shield, Compass } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface ReliquaryModalProps {
  game: GameManager;
  onClose: () => void;
}

interface RelicItem {
  id: string;
  name: string;
  era: string;
  material: string;
  provenance: string;
  curatorNotes: string;
  icon: string;
  renderType: 'urn' | 'amulet' | 'dial' | 'prism' | 'orchid';
  color: string;
}

const CATALOG_RELICS: RelicItem[] = [
  {
    id: 'item_amulet_sunken_sun',
    name: 'Amulet of the Sunken Sun',
    era: 'Pre-Classic Meridian Culture • c. 650 BCE',
    material: 'Hammered Electrum & Polished Black Obsidian',
    provenance: 'Unsealed from the Guardian Crypt after igniting the 4 serpent braziers.',
    curatorNotes: 'Micro-relief engravings around the perimeter depict the celestial transit of Venus across the subterranean river.',
    icon: '🐍',
    renderType: 'amulet',
    color: '#fbbf24',
  },
  {
    id: 'item_sunken_urn_1',
    name: 'Sunken Gilded Urn',
    era: 'Meridian Dynastic Period • c. 820 BCE',
    material: 'Cast Bronze with Heavy Mercury Gilding & River Calcite',
    provenance: 'Dredged from the submerged plunge pool cavern beneath the Great Cascade.',
    curatorNotes: 'Sealed with ancient beeswax; interior residues indicate fragrant copal resin and wild cacao offerings.',
    icon: '🏺',
    renderType: 'urn',
    color: '#d97706',
  },
  {
    id: 'item_golden_dial',
    name: 'Astronomical Celestial Dial',
    era: 'Meridian Meridian Solar Priests • c. 500 BCE',
    material: 'Chiseled Meteoritic Iron & Cast Brass Inlays',
    provenance: 'Recovered from the expedition field desk at Base Camp.',
    curatorNotes: 'Three concentric rotating rings accurately project the winter and summer solstice solar azimuths.',
    icon: '🔮',
    renderType: 'dial',
    color: '#f59e0b',
  },
  {
    id: 'plant_grotto_orchid',
    name: 'Luminescent Grotto Orchid Specimen',
    era: 'Endemic Subterranean Flora',
    material: 'Preserved Bioluminescent Petals & Waxy Cuticle',
    provenance: 'Harvested from the damp limestone walls of the waterfall grotto.',
    curatorNotes: 'Emits a sustained cyan glow when stimulated by running mist or pure acoustic frequencies.',
    icon: '🪻',
    renderType: 'orchid',
    color: '#38bdf8',
  },
];

import * as THREE from 'three';

export const ReliquaryModal: React.FC<ReliquaryModalProps> = ({ game, onClose }) => {
  const [selectedRelic, setSelectedRelic] = useState<RelicItem>(CATALOG_RELICS[0]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [rotationX, setRotationX] = useState(15);
  const [rotationY, setRotationY] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const mountRef = useRef<HTMLDivElement>(null);

  // Filter relics that player has collected (or show all in study mode)
  const isCollected = (id: string) => {
    return game.quest.inventory.some((i) => i.id === id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setRotationY((prev) => prev + dx * 0.9);
    setRotationX((prev) => Math.max(-55, Math.min(55, prev + dy * 0.9)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Real Three.js WebGL 3D Inspection Turntable
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 360;
    const height = 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0907);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm museum showcase lighting
    const ambientLight = new THREE.AmbientLight(0xfff1e0, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 3.2);
    keyLight.position.set(2.5, 3.5, 2.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.0);
    rimLight.position.set(-2.5, 1.5, -2.0);
    scene.add(rimLight);

    const underGlow = new THREE.PointLight(0xd97706, 1.2, 4);
    underGlow.position.set(0, -0.6, 0.8);
    scene.add(underGlow);

    // Turntable Root Group
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);

    // Brass & Velvet Pedestal Stand
    const pedestalBaseGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.14, 32);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc9933b,
      metalness: 0.88,
      roughness: 0.28,
    });
    const pedestalBase = new THREE.Mesh(pedestalBaseGeo, brassMat);
    pedestalBase.position.y = -0.92;
    turntableGroup.add(pedestalBase);

    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x22120b,
      roughness: 0.95,
      metalness: 0.05,
    });
    const velvetPadGeo = new THREE.CylinderGeometry(1.12, 1.12, 0.04, 32);
    const velvetPad = new THREE.Mesh(velvetPadGeo, velvetMat);
    velvetPad.position.y = -0.83;
    turntableGroup.add(velvetPad);

    // Relic Model Group
    const relicGroup = new THREE.Group();
    turntableGroup.add(relicGroup);

    // PBR Materials
    const bronzePbrMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.32,
    });
    const electrumGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.22,
    });
    const obsidianGlassMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.2,
      roughness: 0.08,
    });
    const ironAstrolabeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.45,
    });

    if (selectedRelic.renderType === 'urn') {
      // 1. Classical Ancient Urn / Amphora
      const urnGeo = new THREE.Group();

      // Belly
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 20), bronzePbrMat);
      belly.scale.set(1.0, 1.25, 1.0);
      belly.position.y = -0.15;
      urnGeo.add(belly);

      // Neck & Lip
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.45, 24), bronzePbrMat);
      neck.position.y = 0.55;
      urnGeo.add(neck);

      const lip = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 12, 24), bronzePbrMat);
      lip.rotation.x = Math.PI / 2;
      lip.position.y = 0.77;
      urnGeo.add(lip);

      // Foot
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.2, 24), bronzePbrMat);
      foot.position.y = -0.74;
      urnGeo.add(foot);

      // Twin loop handles
      [-1, 1].forEach((side) => {
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 10, 20, Math.PI * 1.1), bronzePbrMat);
        handle.rotation.z = side * Math.PI * 0.35;
        handle.position.set(side * 0.52, 0.25, 0);
        urnGeo.add(handle);
      });

      relicGroup.add(urnGeo);
    } else if (selectedRelic.renderType === 'amulet') {
      // 2. Electrum Sun Amulet with Obsidian Core
      const amuletGeo = new THREE.Group();

      // Outer rayed sunburst
      for (let i = 0; i < 16; i++) {
        const rayAngle = (i * Math.PI * 2) / 16;
        const rayMesh = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 5), electrumGoldMat);
        rayMesh.position.set(Math.cos(rayAngle) * 0.65, Math.sin(rayAngle) * 0.65, 0);
        rayMesh.rotation.z = rayAngle - Math.PI / 2;
        amuletGeo.add(rayMesh);
      }

      // Outer gold bezel
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.06, 16, 32), electrumGoldMat);
      amuletGeo.add(rim);

      // Central obsidian convex cabochon
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 32), obsidianGlassMat);
      disc.rotation.x = Math.PI / 2;
      amuletGeo.add(disc);

      // Inscribed serpent medallion
      const snakeRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 12, 24), electrumGoldMat);
      snakeRing.position.z = 0.045;
      amuletGeo.add(snakeRing);

      relicGroup.add(amuletGeo);
    } else if (selectedRelic.renderType === 'dial') {
      // 3. Astronomical Celestial Astrolabe Dial
      const dialGeo = new THREE.Group();

      // Three concentric rotating rings
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.04, 12, 36), electrumGoldMat);
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.035, 12, 32), ironAstrolabeMat);
      const r3 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 12, 28), electrumGoldMat);
      dialGeo.add(r1, r2, r3);

      // Crossbars
      const barH = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.04, 0.03), ironAstrolabeMat);
      const barV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.48, 0.03), ironAstrolabeMat);
      dialGeo.add(barH, barV);

      // Center gnomon crystal needle
      const gnomonMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.9,
      });
      const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.75, 6), gnomonMat);
      gnomon.position.z = 0.25;
      gnomon.rotation.x = Math.PI / 2;
      dialGeo.add(gnomon);

      relicGroup.add(dialGeo);
    } else {
      // 4. Luminescent Grotto Orchid
      const orchidGeo = new THREE.Group();
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
      const petalMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.85,
        roughness: 0.25,
      });

      // Stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.2, 12), stemMat);
      stem.position.y = -0.3;
      orchidGeo.add(stem);

      // 6 delicate flared petals
      for (let p = 0; p < 6; p++) {
        const pAngle = (p * Math.PI * 2) / 6;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 5), petalMat);
        petal.position.set(Math.cos(pAngle) * 0.26, 0.35 + Math.sin(pAngle * 2) * 0.08, Math.sin(pAngle) * 0.26);
        petal.rotation.z = Math.cos(pAngle) * 0.85;
        petal.rotation.x = Math.sin(pAngle) * 0.85;
        orchidGeo.add(petal);
      }

      // Bioluminescent pistil core
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0xa5f3fc }));
      core.position.y = 0.38;
      orchidGeo.add(core);

      relicGroup.add(orchidGeo);
    }

    let animId: number;
    let autoRotate = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Apply drag rotation with gentle idle precession
      if (!isDragging) {
        autoRotate += 0.003;
      }

      turntableGroup.rotation.y = THREE.MathUtils.degToRad(rotationY) + autoRotate;
      turntableGroup.rotation.x = THREE.MathUtils.degToRad(rotationX);
      turntableGroup.scale.set(zoomLevel, zoomLevel, zoomLevel);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      scene.clear();
      if (container) container.innerHTML = '';
    };
  }, [selectedRelic, zoomLevel, rotationX, rotationY, isDragging]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#140e0b] shadow-2xl">
        {/* Left: 3D Turntable Inspection Stage */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1e1511] to-[#0c0806] relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="text-center mb-2 pointer-events-none">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              THE CURATOR'S RELIQUARY • FIELD APPRAISAL
            </span>
            <h2 className="font-cinzel text-lg font-bold text-amber-200 tracking-wider">
              {selectedRelic.name.toUpperCase()}
            </h2>
            <span className="text-[11px] font-mono text-stone-400">
              {selectedRelic.era}
            </span>
          </div>

          {/* Interactive WebGL 3D Turntable Viewport */}
          <div
            ref={mountRef}
            className="w-[360px] h-[340px] rounded-2xl overflow-hidden border-2 border-amber-900/60 shadow-[inset_0_4px_25px_rgba(0,0,0,0.8),0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-center bg-black/40"
          />

          {/* Turntable Zoom and Rotation Controls */}
          <div className="mt-4 flex items-center gap-4 bg-stone-900/80 px-4 py-2 rounded-full border border-stone-800 text-xs font-mono text-stone-300">
            <div className="flex items-center gap-2">
              <RotateCw className="h-3.5 w-3.5 text-amber-400" />
              <span>Drag mouse to rotate 360°</span>
            </div>
            <span className="text-stone-700">|</span>
            <div className="flex items-center gap-2">
              <ZoomIn className="h-3.5 w-3.5 text-cyan-400" />
              <input
                type="range"
                min="0.8"
                max="1.8"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Relic Catalog & Epigraphy Field Notes */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#16100d] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                DISCOVERED RELICS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Select an artifact to mount upon the inspection turntable.
              </p>
            </div>

            {/* Relic List */}
            <div className="space-y-2">
              {CATALOG_RELICS.map((relic) => {
                const collected = isCollected(relic.id);
                const isSelected = selectedRelic.id === relic.id;

                return (
                  <button
                    key={relic.id}
                    onClick={() => {
                      setSelectedRelic(relic);
                      audioEngine.playItemDiscovery();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{relic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold truncate">
                          {relic.name}
                        </span>
                        {collected && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/40">
                            FOUND
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 truncate block">
                        {relic.material}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Curator Appraisal Details */}
            <div className="rounded-xl border border-amber-900/50 bg-[#1a1310] p-3.5 space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase block">
                DR. STERLING'S APPRAISAL:
              </span>
              <p className="text-xs font-serif text-stone-300 leading-relaxed italic">
                "{selectedRelic.curatorNotes}"
              </p>
              <div className="text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                Provenance: {selectedRelic.provenance}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 py-2.5 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              <span>RETURN TO EXPEDITION</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
