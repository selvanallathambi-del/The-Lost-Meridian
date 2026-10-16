/**
 * The Lost Meridian - Cartographer's Topographic Drafting Table & Stereoscope Mapper
 * 1928 aerial photogrammetry stereopair alignment, contour isoline drafting, and triangulation.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Map, Compass, Sparkles, CheckCircle2, Eye, PenTool, Navigation } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface CartographyModalProps {
  game: GameManager;
  onClose: () => void;
}

export const CartographyModal: React.FC<CartographyModalProps> = ({ game, onClose }) => {
  const [parallax, setParallax] = useState(18); // Target: 0 (perfect alignment)
  const [focus, setFocus] = useState(35); // Target: 50
  const [contoursDrawn, setContoursDrawn] = useState<Record<number, boolean>>({});

  const isStereoAligned = Math.abs(parallax) <= 2 && Math.abs(focus - 50) <= 5;
  const isMapFullyDrafted = Object.keys(contoursDrawn).length === 3;

  const handleParallaxChange = (val: number) => {
    setParallax(val);
    audioEngine.playDraftingPencil();
    checkAutoAlign(val, focus);
  };

  const handleFocusChange = (val: number) => {
    setFocus(val);
    audioEngine.playDraftingPencil();
    checkAutoAlign(parallax, val);
  };

  const checkAutoAlign = (p: number, f: number) => {
    if (Math.abs(p) <= 2 && Math.abs(f - 50) <= 5) {
      audioEngine.playRuneChime();
    }
  };

  const handleTraceContour = (level: number) => {
    if (!isStereoAligned) return;
    audioEngine.playDraftingPencil();
    const updated = { ...contoursDrawn, [level]: true };
    setContoursDrawn(updated);

    if (Object.keys(updated).length === 3) {
      audioEngine.playItemDiscovery();
      game.quest.addItem({
        id: 'map_meridian_triangulation',
        name: 'Triangulated Meridian Topographic Chart',
        category: 'artifact',
        description: 'A hand-drafted photogrammetry chart triangulating the buried subterranean vault at bearing 142° SE.',
        lore: 'Drawn at the 1928 expedition cartography desk using stereoscopic aerial plates.',
        iconName: 'Map',
      });
      game.quest.showNotification('🗺️ TRIANGULATION COMPLETE: SUBTERRANEAN VAULT LOCATED AT 142° SE!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16120d] shadow-2xl">
        {/* Left: Stereoscopic Photogrammetry Viewport */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#221a11] to-[#0f0b07] relative">
          <div>
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
                  1928 EXPEDITION PHOTOGRAMMETRY DESK
                </span>
                <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
                  STEREOSCOPIC RELIEF MAPPER
                </h2>
              </div>
              <Compass className="h-6 w-6 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />
            </div>

            {/* Dual-Lens Stereopair Viewer */}
            <div className="relative my-6 h-56 rounded-3xl border border-amber-900/60 bg-[#1a130c] p-4 flex items-center justify-center gap-4 overflow-hidden shadow-inner">
              {/* Left Aerial Plate */}
              <div
                className="relative flex-1 h-full rounded-2xl border border-amber-600/60 bg-[#121915] p-3 flex flex-col justify-between overflow-hidden shadow-md"
                style={{ filter: `blur(${Math.abs(focus - 50) * 0.08}px)` }}
              >
                <div className="font-mono text-[9px] text-emerald-400 font-bold">
                  PLATE L: AEROSTAT SURVEY (150m)
                </div>
                {/* Simulated Topographic Elevation Lines */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-emerald-500/40" />
                  <div className="w-20 h-20 rounded-full border border-emerald-500/60" />
                  <div className="w-10 h-10 rounded-full border border-emerald-400" />
                </div>
              </div>

              {/* Right Aerial Plate (Displaced by Parallax) */}
              <div
                className="relative flex-1 h-full rounded-2xl border border-amber-600/60 bg-[#121915] p-3 flex flex-col justify-between overflow-hidden shadow-md"
                style={{
                  transform: `translateX(${parallax}px)`,
                  filter: `blur(${Math.abs(focus - 50) * 0.08}px)`,
                }}
              >
                <div className="font-mono text-[9px] text-emerald-400 font-bold">
                  PLATE R: FALCON SCOUT (160m)
                </div>
                {/* Simulated Topographic Elevation Lines */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-emerald-500/40" />
                  <div className="w-20 h-20 rounded-full border border-emerald-500/60" />
                  <div className="w-10 h-10 rounded-full border border-emerald-400" />
                </div>
              </div>

              {/* 3D Stereoscopic Fusion Reticle */}
              {isStereoAligned && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                  <div className="px-4 py-2 rounded-2xl bg-stone-900/90 border border-emerald-500 text-emerald-300 font-cinzel text-xs font-bold shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>3D STEREOSCOPIC RELIEF FUSED!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Parallax & Focus Alignment Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-stone-800 bg-[#19120b] p-3 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-amber-400">
                  <span>PARALLAX PRISM OFFSET</span>
                  <span>{parallax > 0 ? `+${parallax}` : parallax} px</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={parallax}
                  onChange={(e) => handleParallaxChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
              </div>

              <div className="rounded-2xl border border-stone-800 bg-[#19120b] p-3 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-amber-400">
                  <span>STEREOSCOPE OPTICAL FOCUS</span>
                  <span>{focus}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={focus}
                  onChange={(e) => handleFocusChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Trace Contours Action Palette */}
          <div className="mt-4 pt-4 border-t border-amber-900/40 flex items-center justify-between">
            <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
              DRAFT CONTOURS (50m, 100m, 150m):
            </span>
            <div className="flex gap-2">
              {[50, 100, 150].map((level) => {
                const isDrawn = contoursDrawn[level];
                return (
                  <button
                    key={level}
                    onClick={() => handleTraceContour(level)}
                    disabled={!isStereoAligned || isDrawn}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      isDrawn
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : isStereoAligned
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-900 border-stone-800 text-stone-600 opacity-40'
                    }`}
                  >
                    <PenTool className="h-3 w-3 inline mr-1" />
                    <span>{level}m ISOLINE</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Triangulation Coordinates */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#19120b] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                MERIDIAN TRIANGULATION
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Align stereopair and trace elevation contours.
              </p>
            </div>

            {/* Triangulation Output Card */}
            <div className="rounded-2xl border border-amber-900/60 bg-[#1e150d] p-4 space-y-2">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">
                SURVEY BEARING:
              </span>
              {isMapFullyDrafted ? (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Navigation className="h-4 w-4" />
                    <span>142° SE • ELEVATION 42m MSL</span>
                  </div>
                  <p className="text-[11px] font-serif text-stone-300 italic">
                    "Subterranean entrance located precisely beneath the third waterfall cataract fault-line."
                  </p>
                </div>
              ) : (
                <div className="text-xs font-mono text-stone-500 italic">
                  [AWAITING 3D CONTOUR TRIANGULATION...]
                </div>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-stone-800 p-3 text-[11px] font-mono text-stone-400 leading-relaxed">
              Step 1: Set Parallax to 0 px<br />
              Step 2: Set Focus to 50%<br />
              Step 3: Trace all 3 elevation isolines
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE DRAFTING TABLE
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
