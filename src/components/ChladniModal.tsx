/**
 * The Lost Meridian - Acoustic Chladni Resonance Plate & Sacred Harmonic Table
 * Brass vibration plate, quartz sand nodal line migration, and frequency harmonics.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Volume2, Sparkles, CheckCircle2, ShieldCheck, Music, Play, Waves } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface ChladniModalProps {
  game: GameManager;
  onClose: () => void;
}

interface HarmonicMode {
  freq: number;
  name: string;
  harmonicTitle: string;
  patternGeometry: string;
  lore: string;
  patternType: 'circle' | 'cross' | 'hexagram' | 'rosette';
}

const MODES: HarmonicMode[] = [
  {
    freq: 432,
    name: '432 Hz - Fundamental Solar Monad',
    harmonicTitle: 'Concentric Solar Ring',
    patternGeometry: 'Single central circular nodal perimeter',
    lore: 'Harmonizes the basalt bedrock foundations of the Sun Temple.',
    patternType: 'circle',
  },
  {
    freq: 528,
    name: '528 Hz - Meridian Solfeggio Tone',
    harmonicTitle: 'Meridian Symmetrical Cross',
    patternGeometry: 'Orthogonal nodal intersection and hyperbolic arcs',
    lore: 'The master resonance frequency that opens subterranean water channels.',
    patternType: 'cross',
  },
  {
    freq: 741,
    name: '741 Hz - Celestial Star Hexagram',
    harmonicTitle: 'Six-Fold Sacred Mandala',
    patternGeometry: 'Interlocking equilateral triangular nodal lines',
    lore: 'Awakens the celestial star projector in the planetarium sanctuary.',
    patternType: 'hexagram',
  },
  {
    freq: 963,
    name: '963 Hz - Crown Apex Resonance',
    harmonicTitle: 'Eight-Fold Rosette Matrix',
    patternGeometry: 'Complex harmonic nodal petal array',
    lore: 'Shatters the resonant crystalline barrier sealing the inner crypt.',
    patternType: 'rosette',
  },
];

export const ChladniModal: React.FC<ChladniModalProps> = ({ game, onClose }) => {
  const [activeModeIdx, setActiveModeIdx] = useState(1); // 528 Hz default
  const [isBowing, setIsBowing] = useState(false);
  const [bowedModes, setBowedModes] = useState<Record<number, boolean>>({});

  const currentMode = MODES[activeModeIdx];
  const isAllBowed = Object.keys(bowedModes).length === 4;

  const handleBowPlate = () => {
    setIsBowing(true);
    audioEngine.playChladniTone(currentMode.freq, 1.6);
    audioEngine.playSandScatter();

    setTimeout(() => {
      setIsBowing(false);
      const updated = { ...bowedModes, [currentMode.freq]: true };
      setBowedModes(updated);

      if (Object.keys(updated).length === 4) {
        audioEngine.playItemDiscovery();
        game.quest.addItem({
          id: 'item_chladni_tuning_plate',
          name: 'Resonant Brass Chladni Plate',
          category: 'artifact',
          description: 'A master acoustic plate inscribed with 4 sacred harmonic nodal geometries.',
          lore: 'Excited with violin bow friction in the subterranean crypt.',
          iconName: 'Sparkles',
        });
        game.quest.showNotification('🕯️ ALL 4 CHLADNI HARMONICS RESONATED! CRYSTAL BARRIER SHATTERED!');
      } else {
        game.quest.showNotification(`✦ RESONATED: ${currentMode.name}!`);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16120e] shadow-2xl">
        {/* Left: Square Brass Chladni Resonance Plate Viewport */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#211a12] to-[#0f0b08] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              ANCIENT ACOUSTIC VIBRATION MATRIX
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              CHLADNI HARMONIC RESONANCE TABLE
            </h2>
          </div>

          {/* Square Brass Plate Simulator */}
          <div className="relative w-64 h-64 sm:w-76 sm:h-76 my-4 rounded-3xl border-4 border-amber-600/80 bg-[#281c12] p-4 flex items-center justify-center overflow-hidden shadow-[0_0_35px_rgba(217,119,6,0.35)]">
            {/* Center Mounting Screw */}
            <div className="w-5 h-5 rounded-full border border-stone-400 bg-stone-700 z-20 shadow-md" />

            {/* Simulated Sand Geometric Nodal Lines */}
            {currentMode.patternType === 'circle' && (
              <div className="absolute w-44 h-44 rounded-full border-4 border-dashed border-stone-100 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            )}

            {currentMode.patternType === 'cross' && (
              <>
                <div className="absolute inset-x-8 h-1 bg-stone-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <div className="absolute inset-y-8 w-1 bg-stone-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <div className="absolute w-48 h-48 rounded-full border-2 border-stone-100/50" />
              </>
            )}

            {currentMode.patternType === 'hexagram' && (
              <div className="absolute w-48 h-48 flex items-center justify-center">
                <div className="absolute w-40 h-40 border-2 border-stone-100 rotate-0" />
                <div className="absolute w-40 h-40 border-2 border-stone-100 rotate-45" />
                <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-stone-100" />
              </div>
            )}

            {currentMode.patternType === 'rosette' && (
              <div className="absolute w-52 h-52 flex items-center justify-center">
                {[0, 22.5, 45, 67.5, 90].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-44 h-12 rounded-full border-2 border-stone-100/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    style={{ transform: `rotate(${deg}deg)` }}
                  />
                ))}
              </div>
            )}

            {/* Vibrational Scatter Animation Overlay */}
            {isBowing && (
              <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-xs flex items-center justify-center font-cinzel text-xs font-bold text-amber-100 animate-pulse z-30">
                BOWING BRASS EDGE ({currentMode.freq} Hz)...
              </div>
            )}
          </div>

          {/* Bow Plate Trigger Button */}
          <button
            onClick={handleBowPlate}
            disabled={isBowing}
            className="px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel text-xs font-bold shadow-xl transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Music className="h-4 w-4" />
            <span>BOW RESONANCE PLATE ({currentMode.freq} Hz)</span>
          </button>
        </div>

        {/* Right Sidebar: Harmonic Modes */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#18120b] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                SACRED HARMONIC FREQUENCIES
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Bow all 4 frequencies to harmonize the crypt.
              </p>
            </div>

            {/* Modes List */}
            <div className="space-y-2">
              {MODES.map((md, idx) => {
                const isSelected = idx === activeModeIdx;
                const isBowed = bowedModes[md.freq];
                return (
                  <button
                    key={md.freq}
                    onClick={() => {
                      setActiveModeIdx(idx);
                      audioEngine.playSfx('click');
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-cinzel text-xs font-bold">{md.name}</div>
                      <span className="font-mono text-[10px] text-amber-500">{md.harmonicTitle}</span>
                    </div>
                    {isBowed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-stone-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mode Lore */}
            <div className="rounded-2xl border border-amber-900/60 bg-[#1d150d] p-3.5 text-xs font-serif italic text-stone-300 leading-relaxed">
              "{currentMode.lore}"
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE HARMONIC TABLE
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
