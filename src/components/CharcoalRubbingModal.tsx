/**
 * The Lost Meridian - Ancient Relief Charcoal Rubbing & Translation Minigame
 * Tactile charcoal shading on textured tracing paper to record forgotten pre-Columbian murals.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Sparkles, CheckCircle2, Feather, Pencil, ScrollText } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface CharcoalRubbingModalProps {
  game: GameManager;
  reliefId: string;
  onClose: () => void;
}

interface ReliefData {
  id: string;
  title: string;
  period: string;
  lore: string;
  glyphSummary: string;
  symbolType: 'serpent' | 'jaguar' | 'astrolabe';
}

const RELIEFS: Record<string, ReliefData> = {
  rubbing_stele_1: {
    id: 'rubbing_stele_1',
    title: 'The Great Feathered Serpent of Stillwater',
    period: 'Early Meridian • c. 650 CE',
    lore: 'Carved directly into the limestone grotto wall, depicting the serpent deity safeguarding the subterranean aqueducts.',
    glyphSummary: 'Water Runes • River Confluence • Serpent Eye of Jade',
    symbolType: 'serpent',
  },
  rubbing_stele_2: {
    id: 'rubbing_stele_2',
    title: 'The Winged Solar Jaguar of the Solstice',
    period: 'High Zenith Epoch • c. 890 CE',
    lore: 'Discovered upon the grand temple colonnade, illustrating the jaguar crowned in solar flame during the summer zenith.',
    glyphSummary: 'Solar Flares • Summer Solstice • Obsidian Claws',
    symbolType: 'jaguar',
  },
  rubbing_stele_3: {
    id: 'rubbing_stele_3',
    title: 'The Astrolabe Celestial Meridian Sphere',
    period: 'Transcendence Dynasty • c. 1120 CE',
    lore: 'A complex astronomical diagram unsealed in the subterranean antechamber, aligning the planetary orbits with the Meridian Core.',
    glyphSummary: 'Planetary Rings • Meridian Zenith • Concentric Armillaries',
    symbolType: 'astrolabe',
  },
};

export const CharcoalRubbingModal: React.FC<CharcoalRubbingModalProps> = ({ game, reliefId, onClose }) => {
  const relief = RELIEFS[reliefId] || RELIEFS.rubbing_stele_1;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const isShadingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Fill with translucent parchment tracing paper tone
    ctx.fillStyle = '#f5efe0';
    ctx.fillRect(0, 0, w, h);

    // Subtle paper fibrous grain
    ctx.fillStyle = 'rgba(180, 160, 130, 0.08)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, []);

  const calculateProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgData = ctx.getImageData(cw * 0.15, ch * 0.15, cw * 0.7, ch * 0.7);
    let shadedCount = 0;
    const totalPixels = imgData.data.length / 4;

    for (let i = 0; i < imgData.data.length; i += 4) {
      // Shaded dark charcoal pixels (r, g, b < 120)
      if (imgData.data[i] < 120) {
        shadedCount++;
      }
    }

    const pct = Math.min(100, Math.round((shadedCount / totalPixels) * 100));
    setProgress(pct);

    if (pct >= 75 && !isCompleted) {
      setIsCompleted(true);
      audioEngine.playCipherSolve();

      // Add to field journal collectible documents
      game.quest.addDocument({
        id: `doc_rubbing_${relief.id}`,
        title: `Charcoal Rubbing: ${relief.title}`,
        author: 'Dr. Sterling Expedition Rubbing',
        date: 'October 1928',
        content: `${relief.lore}\n\nGlyphic Translation: ${relief.glyphSummary}`,
        type: 'ancient_rubbing',
        read: true,
      });

      game.quest.showNotification(`📜 RELIEF TRANSCRIBED: ${relief.title.toUpperCase()}`);
      if (game.onStateChange) game.onStateChange();
    }
  };

  const shadeAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    audioEngine.playCharcoalShade();

    // Charcoal stick stroke texture
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 2, x, y, 24);
    grad.addColorStop(0, 'rgba(40, 36, 32, 0.45)');
    grad.addColorStop(0.6, 'rgba(60, 52, 44, 0.25)');
    grad.addColorStop(1, 'rgba(100, 90, 80, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Subtle grain hatching
    ctx.strokeStyle = 'rgba(30, 26, 22, 0.35)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const offX = (Math.random() - 0.5) * 18;
      const offY = (Math.random() - 0.5) * 18;
      ctx.beginPath();
      ctx.moveTo(x + offX - 6, y + offY - 4);
      ctx.lineTo(x + offX + 6, y + offY + 4);
      ctx.stroke();
    }

    ctx.restore();
    calculateProgress();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCompleted) return;
    isShadingRef.current = true;
    shadeAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isShadingRef.current || isCompleted) return;
    shadeAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isShadingRef.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left: Textured Bas-Relief & Charcoal Tracing Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#181410] to-[#0c0a08] relative">
          <div className="text-center mb-3">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              FIELD EPIGRAPHY & CHARCOAL RUBBING
            </span>
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-amber-200 tracking-wider">
              {relief.title.toUpperCase()}
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Drag your charcoal stick across the tracing parchment to reveal the relief engravings.
            </p>
          </div>

          {/* Stele Frame */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden border-4 border-amber-900/80 shadow-[inset_0_4px_25px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.9)] bg-[#2e261e] cursor-crosshair">
            {/* The In-Relief Stone Artwork Underneath */}
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none p-6">
              {relief.symbolType === 'serpent' && (
                <div className="w-56 h-56 rounded-full border-8 border-stone-600 flex flex-col items-center justify-center text-stone-400 opacity-60">
                  <div className="w-40 h-40 rounded-full border-4 border-dashed border-stone-500 flex items-center justify-center">
                    <span className="font-cinzel text-4xl font-bold tracking-widest text-stone-300">🐍</span>
                  </div>
                  <span className="font-cinzel text-[10px] font-bold mt-2">QUETZALCOATL MERIDIAN</span>
                </div>
              )}

              {relief.symbolType === 'jaguar' && (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-stone-400 opacity-60">
                  <div className="w-44 h-44 rounded-2xl border-8 border-stone-600 rotate-45 flex items-center justify-center">
                    <span className="font-cinzel text-4xl font-bold -rotate-45 text-amber-300">🐆</span>
                  </div>
                  <span className="font-cinzel text-[10px] font-bold mt-4">SOLAR JAGUAR CREST</span>
                </div>
              )}

              {relief.symbolType === 'astrolabe' && (
                <div className="w-56 h-56 rounded-full border-8 border-stone-600 flex items-center justify-center text-stone-400 opacity-60 relative">
                  <div className="w-40 h-40 rounded-full border-2 border-stone-500 animate-spin-slow" />
                  <div className="w-24 h-24 rounded-full border-4 border-stone-400 absolute" />
                  <span className="font-cinzel text-3xl font-bold text-cyan-300">✦</span>
                </div>
              )}
            </div>

            {/* Tracing Paper Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="absolute inset-0 w-full h-full block touch-none mix-blend-multiply opacity-90"
            />
          </div>

          {/* Shading Progress Bar */}
          <div className="w-full max-w-sm mt-4 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-400 font-bold">RELIEF SHADING DENSITY</span>
              <span className="text-stone-300">{progress}% / 75%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  progress >= 75 ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 'bg-stone-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {isCompleted && (
            <div className="mt-3 flex items-center gap-2 text-amber-300 font-cinzel font-bold text-xs bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500 shadow-lg animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              <span>RUBBING TRANSCRIBED & ARCHIVED TO FIELD JOURNAL</span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Historical Context & Tool */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">FIELD EPIGRAPHY TOOL</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Hand-pressed willow charcoal stick.</p>
            </div>

            {/* Tool Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-950/30 border border-amber-700/50">
              <div className="p-2 rounded-lg bg-stone-900 text-amber-400 border border-amber-800">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <span className="font-cinzel text-xs font-bold text-amber-200">Willow Charcoal Stick</span>
                <p className="text-[10px] text-stone-400">Soft density for capturing low-relief striae.</p>
              </div>
            </div>

            {/* Historical Inscription Notes */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-cinzel text-xs font-bold">
                <ScrollText className="h-3.5 w-3.5" />
                <span>Epigraphic Translation</span>
              </div>
              <span className="text-[10px] font-mono text-stone-400 block">{relief.period}</span>
              <p className="text-xs font-serif text-stone-300 leading-relaxed italic">
                "{relief.lore}"
              </p>
              <div className="text-[10px] font-mono text-amber-300/90 pt-1 border-t border-stone-800">
                Key Glyphs: {relief.glyphSummary}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 py-2.5 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              <span>{isCompleted ? 'ARCHIVE RUBBING & RETURN' : 'EXIT RUBBING'}</span>
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
