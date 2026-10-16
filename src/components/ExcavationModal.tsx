/**
 * The Lost Meridian - Archaeological Field Excavation & Stratum Brushing Minigame
 * Interactive trowel chipping & delicate sediment sweeping to uncover buried artifacts.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Sparkles, CheckCircle2, Award, Shovel, Paintbrush } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface ExcavationModalProps {
  game: GameManager;
  siteId: string;
  onClose: () => void;
}

interface ExcavationArtifact {
  id: string;
  name: string;
  category: 'artifact';
  description: string;
  lore: string;
  iconName: string;
  color: string;
  shape: 'compass' | 'spear' | 'scarab';
}

const SITE_ARTIFACTS: Record<string, ExcavationArtifact> = {
  excavation_mound_1: {
    id: 'item_relic_compass_lid',
    name: '1912 Sterling Expedition Compass Lid',
    category: 'artifact',
    description: 'A heavy brass compass bezel engraved with the Sterling family crest and sector coordinates.',
    lore: 'Buried deep beneath the camp loam from an earlier 1912 survey expedition.',
    iconName: 'Sparkles',
    color: '#d97706',
    shape: 'compass',
  },
  excavation_mound_2: {
    id: 'item_relic_obsidian_spear',
    name: 'Ancient Obsidian Serpent Spearhead',
    category: 'artifact',
    description: 'A razor-sharp volcanic glass point pressure-flaked into the likeness of a coiled serpent.',
    lore: 'Discovered in the river silt, likely used by ancient Meridian guardians.',
    iconName: 'Sparkles',
    color: '#0284c7',
    shape: 'spear',
  },
  excavation_mound_3: {
    id: 'item_relic_jade_scarab',
    name: 'Carved Jade Sun-Scarab',
    category: 'artifact',
    description: 'A polished nephrite jade amulet bearing the winged solar crest of the Meridian zenith.',
    lore: 'Excavated from the gravel terrace flanking the Grand Temple steps.',
    iconName: 'Sparkles',
    color: '#10b981',
    shape: 'scarab',
  },
};

export const ExcavationModal: React.FC<ExcavationModalProps> = ({ game, siteId, onClose }) => {
  const artifact = SITE_ARTIFACTS[siteId] || SITE_ARTIFACTS.excavation_mound_1;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'trowel' | 'brush'>('trowel');
  const [progress, setProgress] = useState(0);
  const [isExtracted, setIsExtracted] = useState(false);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Fill with layered archaeological stratum (dirt, loam, clay)
    ctx.fillStyle = '#453225';
    ctx.fillRect(0, 0, w, h);

    // Layer 1: Rocky clay clumps
    ctx.fillStyle = '#5c4033';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 12 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 2: Sand and fine sediment
    ctx.fillStyle = '#6b4c35';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 8 + Math.random() * 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top silt dusting
    ctx.fillStyle = '#805d43';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 4, 4);
    }
  }, []);

  const [patinaIntegrity, setPatinaIntegrity] = useState(100);
  const [dustPuffs, setDustPuffs] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const calculateProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample central target region (where artifact is buried)
    const cw = canvas.width;
    const ch = canvas.height;
    const imgData = ctx.getImageData(cw * 0.25, ch * 0.25, cw * 0.5, ch * 0.5);
    let clearedCount = 0;
    const totalPixels = imgData.data.length / 4;

    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] < 40) {
        clearedCount++;
      }
    }

    const pct = Math.min(100, Math.round((clearedCount / totalPixels) * 100));
    setProgress(pct);

    if (pct >= 80 && !isExtracted) {
      setIsExtracted(true);
      audioEngine.playItemDiscovery();

      game.quest.addItem(artifact);
      game.quest.showNotification(`🏆 EXCAVATED & RECOVERED: ${artifact.name.toUpperCase()}`);
      if (game.onStateChange) game.onStateChange();
    }
  };

  const excavateAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    // Trigger airborne sediment dust puff
    const puffId = Date.now() + Math.random();
    setDustPuffs((prev) => [
      ...prev.slice(-12),
      { id: puffId, x: clientX - rect.left, y: clientY - rect.top, size: tool === 'brush' ? 18 : 28 },
    ]);
    setTimeout(() => {
      setDustPuffs((prev) => prev.filter((p) => p.id !== puffId));
    }, 450);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    if (tool === 'trowel') {
      audioEngine.playTrowelScrape();
      // If artifact is partially revealed, heavy trowel chipping risks scoring patina
      if (progress > 38 && patinaIntegrity > 75) {
        setPatinaIntegrity((prev) => Math.max(75, prev - 1));
      }

      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      audioEngine.playBrushStroke();
      // Camelhair brush delicately sweeps away loose sediment without scratching
      const grad = ctx.createRadialGradient(x, y, 2, x, y, 32);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    calculateProgress();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isExtracted) return;
    isDrawingRef.current = true;
    excavateAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || isExtracted) return;
    excavateAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left: Excavation Pit with Buried Artifact */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#181410] to-[#0c0a08] relative">
          <div className="text-center mb-3">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              FIELD ARCHAEOLOGY STRATUM RECOVERY
            </span>
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-amber-200 tracking-wider">
              {artifact.name.toUpperCase()}
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Clear the sediment layer using the trowel and bristle brush to extract the artifact intact.
            </p>
          </div>

          {/* Interactive Excavation Frame */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden border-4 border-amber-800/80 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.9)] bg-stone-900 cursor-crosshair">
            {/* The Hidden Artifact Lying Below the Sediment */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#241a12]">
              {artifact.shape === 'compass' && (
                <div className="w-44 h-44 rounded-full border-4 border-amber-500 bg-gradient-to-b from-amber-600 to-amber-900 flex items-center justify-center shadow-2xl">
                  <div className="w-32 h-32 rounded-full border-2 border-stone-800 bg-[#f5ede0] flex items-center justify-center relative">
                    <span className="font-serif font-bold text-stone-800 text-xs">STERLING 1912</span>
                    <Sparkles className="h-6 w-6 text-amber-600 absolute" />
                  </div>
                </div>
              )}

              {artifact.shape === 'spear' && (
                <div className="w-36 h-56 flex flex-col items-center justify-center">
                  <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[90px] border-b-sky-950 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
                  <div className="w-10 h-28 bg-stone-950 border border-sky-600/40 rounded-b-md" />
                </div>
              )}

              {artifact.shape === 'scarab' && (
                <div className="w-44 h-44 rounded-full border-4 border-emerald-400 bg-gradient-to-b from-emerald-600 to-emerald-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Sparkles className="h-16 w-16 text-emerald-200 animate-pulse" />
                </div>
              )}
            </div>

            {/* Scratch-Off Stratum Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="absolute inset-0 w-full h-full block touch-none"
            />

            {/* Airborne Silt Dust Particles */}
            {dustPuffs.map((puff) => (
              <div
                key={puff.id}
                className="absolute pointer-events-none rounded-full bg-amber-600/30 blur-sm animate-ping"
                style={{
                  left: puff.x - puff.size / 2,
                  top: puff.y - puff.size / 2,
                  width: puff.size,
                  height: puff.size,
                }}
              />
            ))}
          </div>

          {/* Progress Bar & Patina Preservation */}
          <div className="w-full max-w-sm mt-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-400 font-bold">SEDIMENT REMOVED</span>
              <span className="text-stone-300">{progress}% / 80%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  progress >= 80 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Patina Integrity Gauge */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-1">
              <span className="text-stone-400">PATINA INTEGRITY</span>
              <span className={`font-bold ${patinaIntegrity > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {patinaIntegrity}% · {tool === 'brush' ? 'Delicate Camelhair Sweep' : 'Heavy Trowel'}
              </span>
            </div>
          </div>

          {isExtracted && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400 font-cinzel font-bold text-xs bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500 shadow-lg animate-bounce">
              <CheckCircle2 className="h-4 w-4" />
              <span>ARTIFACT EXTRACTION COMPLETE — ARCHIVED TO FIELD JOURNAL</span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Tools & Archaeological Field Log */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">EXCAVATION KIT</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Select a tool to clear dirt deposits.</p>
            </div>

            {/* Tool Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTool('trowel')}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${
                  tool === 'trowel'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <Shovel className="h-5 w-5 mb-1.5 text-amber-400" />
                <span className="font-cinzel text-xs font-bold">Field Trowel</span>
                <span className="text-[9px] text-stone-400 mt-0.5">Heavy Loam Chipper</span>
              </button>

              <button
                onClick={() => setTool('brush')}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${
                  tool === 'brush'
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 ring-1 ring-cyan-400/50 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <Paintbrush className="h-5 w-5 mb-1.5 text-cyan-400" />
                <span className="font-cinzel text-xs font-bold">Camel Brush</span>
                <span className="text-[9px] text-stone-400 mt-0.5">Delicate Silt Sweeper</span>
              </button>
            </div>

            {/* Field Notes on the Artifact */}
            <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-400 font-cinzel text-xs font-bold">
                <Award className="h-3.5 w-3.5" />
                <span>Field Excavation Log</span>
              </div>
              <p className="text-xs font-serif text-stone-300 leading-relaxed italic">
                "{artifact.lore}"
              </p>
              <div className="text-[10px] font-mono text-amber-300/80 pt-1">
                Conservation Status: {isExtracted ? 'Cleaned & Catalogued' : 'Sediment Encrusted'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-stone-950 py-2.5 text-xs font-cinzel font-bold transition-colors cursor-pointer shadow-lg"
            >
              <span>{isExtracted ? 'STORE RELIC & RETURN' : 'EXIT EXCAVATION'}</span>
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
