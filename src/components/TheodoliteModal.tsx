/**
 * The Lost Meridian - 1928 Troughton & Simms Brass Theodolite Transit
 * Optical sighting reticle, horizontal azimuth circle, vertical vernier scale, and valley triangulation.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Target, Compass, CheckCircle2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface TheodoliteModalProps {
  game: GameManager;
  onClose: () => void;
}

interface TriangulationTarget {
  id: string;
  name: string;
  targetAzimuth: number; // 0..360
  targetElevation: number; // -20..+20
  sighted: boolean;
  desc: string;
}

const INITIAL_TARGETS: TriangulationTarget[] = [
  {
    id: 'target_pyramid',
    name: 'Grand Pyramid Sun Apex',
    targetAzimuth: 284,
    targetElevation: 14,
    sighted: false,
    desc: 'Golden capstone solar alignment point overlooking the grand plaza.',
  },
  {
    id: 'target_cascade',
    name: 'Cascade Overlook Monolith',
    targetAzimuth: 148,
    targetElevation: 6,
    sighted: false,
    desc: 'Basalt megalith anchored above the thundering waterfall plunge pool.',
  },
  {
    id: 'target_mill',
    name: 'River Mill Waterwheel Spindle',
    targetAzimuth: 42,
    targetElevation: -8,
    sighted: false,
    desc: 'Heavy cast-iron bearing of the riverside timber waterwheel.',
  },
];

export const TheodoliteModal: React.FC<TheodoliteModalProps> = ({ game, onClose }) => {
  const [azimuth, setAzimuth] = useState(270);
  const [elevation, setElevation] = useState(10);
  const [targets, setTargets] = useState<TriangulationTarget[]>(INITIAL_TARGETS);

  const allSighted = targets.every((t) => t.sighted);

  const moveScope = (dAz: number, dEl: number) => {
    audioEngine.playTheodoliteClick();
    const newAz = (azimuth + dAz + 360) % 360;
    const newEl = Math.max(-25, Math.min(25, elevation + dEl));
    setAzimuth(newAz);
    setElevation(newEl);

    // Check if any target aligns within precision tolerance
    setTargets((prev) =>
      prev.map((t) => {
        const azDiff = Math.abs(newAz - t.targetAzimuth);
        const elDiff = Math.abs(newEl - t.targetElevation);
        const inScope = (azDiff <= 4 || azDiff >= 356) && elDiff <= 3;

        if (inScope && !t.sighted) {
          audioEngine.playItemDiscovery();
          game.quest.showNotification(`📐 SIGHTED: ${t.name.toUpperCase()}!`);
          return { ...t, sighted: true };
        }
        return t;
      })
    );
  };

  const handleFinishTriangulation = () => {
    audioEngine.playItemDiscovery();
    game.quest.addItem({
      id: 'item_surveyors_coordinates',
      name: "Surveyor's Triangulation Logbook",
      category: 'artifact',
      description: 'Precision transit coordinates unearthing hidden surveyor cache #7.',
      lore: 'Calibrated by Dr. Sterling using 1928 trigonometric vernier tables.',
      iconName: 'Compass',
    });
    game.quest.showNotification('✦ TRIANGULATION COMPLETE: CACHE #7 COORDINATES MAPPED!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#120e0a] shadow-2xl">
        {/* Left: Theodolite Optical Scope Lens View */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#1b150f] to-[#0a0705] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              1928 TROUGHTON & SIMMS • FIELD SURVEYOR
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              OPTICAL TRANSIT THEODOLITE
            </h2>
          </div>

          {/* Optical Scope Eyepiece Reticle */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-amber-800/80 bg-radial from-stone-900/60 to-black flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(217,119,6,0.3)] overflow-hidden">
            {/* Crosshair Stadia Wires */}
            <div className="absolute w-full h-px bg-amber-400/70" />
            <div className="absolute h-full w-px bg-amber-400/70" />

            {/* Upper and Lower Stadia Ticks */}
            <div className="absolute w-12 h-px bg-amber-400/70 -translate-y-8" />
            <div className="absolute w-12 h-px bg-amber-400/70 translate-y-8" />

            {/* Concentric Milliradian Rings */}
            <div className="absolute w-44 h-44 rounded-full border border-amber-600/30" />
            <div className="absolute w-28 h-28 rounded-full border border-dashed border-amber-600/40" />

            {/* Current Target In-Crosshair Indicator */}
            {targets.map((t) => {
              const azDiff = ((t.targetAzimuth - azimuth + 540) % 360) - 180;
              const elDiff = t.targetElevation - elevation;
              const px = azDiff * 7;
              const py = -elDiff * 7;
              const isVisible = Math.abs(px) < 110 && Math.abs(py) < 110;

              if (!isVisible) return null;

              return (
                <div
                  key={t.id}
                  className="absolute flex flex-col items-center pointer-events-none transition-transform duration-75"
                  style={{ transform: `translate(${px}px, ${py}px)` }}
                >
                  <Target
                    className={`h-5 w-5 ${
                      t.sighted ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-amber-300 bg-black/80 px-1 rounded whitespace-nowrap">
                    {t.name}
                  </span>
                </div>
              );
            })}

            {/* Center Aim Point */}
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </div>

          {/* Scope Pan Controls & Vernier Readings */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between bg-stone-900/80 px-4 py-2 rounded-xl border border-stone-800 text-xs font-mono">
              <div>
                <span className="text-stone-500 uppercase block text-[9px]">Azimuth</span>
                <span className="text-amber-400 font-bold text-sm">{azimuth}°</span>
              </div>
              <div className="border-l border-stone-800 pl-4">
                <span className="text-stone-500 uppercase block text-[9px]">Elevation Vernier</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {elevation > 0 ? `+${elevation}` : elevation}°
                </span>
              </div>
            </div>

            {/* Precision Micro-Metric Knobs */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => moveScope(-5, 0)}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-amber-300 cursor-pointer"
                title="Pan Left [A]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveScope(0, 2)}
                  className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:bg-stone-800 text-amber-300 cursor-pointer flex justify-center"
                  title="Pitch Up [W]"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveScope(0, -2)}
                  className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:bg-stone-800 text-amber-300 cursor-pointer flex justify-center"
                  title="Pitch Down [S]"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => moveScope(5, 0)}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-amber-300 cursor-pointer"
                title="Pan Right [D]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Triangulation Targets & Epigraphy */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#16110c] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                VALLEY TRIANGULATION TARGETS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Align the optical crosshair with each landmark to lock its survey azimuth.
              </p>
            </div>

            <div className="space-y-2">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  className={`p-3 rounded-xl border transition-all ${
                    tgt.sighted
                      ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-xs font-bold">{tgt.name}</span>
                    {tgt.sighted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono text-amber-500/80">
                        {tgt.targetAzimuth}° / {tgt.targetElevation > 0 ? `+${tgt.targetElevation}` : tgt.targetElevation}°
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug">{tgt.desc}</p>
                </div>
              ))}
            </div>

            {/* Triangulation Solution Box */}
            <div className="rounded-xl border border-amber-900/50 bg-[#1e1710] p-3 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                TRIGONOMETRIC STATUS:
              </span>
              <p className="text-xs font-serif text-stone-300 italic">
                {allSighted
                  ? 'All 3 baseline vectors resolved. Solution coordinates for Cache #7 computed.'
                  : `Sight all 3 valley landmarks to complete the resection calculation.`}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
            <button
              onClick={handleFinishTriangulation}
              disabled={!allSighted}
              className={`w-full py-3 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                allSighted
                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer'
                  : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>RECORD TRIANGULATION IN LOG</span>
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 text-xs font-mono transition-colors cursor-pointer"
            >
              DISENGAGE THEODOLITE
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
