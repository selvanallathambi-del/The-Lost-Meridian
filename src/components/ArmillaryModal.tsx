/**
 * The Lost Meridian - Celestial Prismatic Armillary Sphere & Spectral Refraction Array
 * 3-axis brass armillary gyro, optical quartz prism beam splitters, and obelisk ignition.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, RotateCw, RotateCcw, Sparkles, Sun, Eye, ShieldCheck } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface ArmillaryModalProps {
  game: GameManager;
  onClose: () => void;
}

interface ObeliskTarget {
  name: string;
  color: string;
  wavelength: string;
  targetElevation: number; // 0..360
  targetDeclination: number; // 0..180
  targetPolar: number; // 0..360
}

const OBELISKS: ObeliskTarget[] = [
  {
    name: 'North Obelisk of the Fire Phoenix',
    color: '#ef4444',
    wavelength: 'Ruby 650nm',
    targetElevation: 90,
    targetDeclination: 45,
    targetPolar: 180,
  },
  {
    name: 'East Obelisk of the Forest Serpent',
    color: '#10b981',
    wavelength: 'Emerald 532nm',
    targetElevation: 180,
    targetDeclination: 90,
    targetPolar: 90,
  },
  {
    name: 'South Obelisk of the Ocean Depths',
    color: '#0ea5e9',
    wavelength: 'Sapphire 450nm',
    targetElevation: 270,
    targetDeclination: 135,
    targetPolar: 270,
  },
  {
    name: 'West Obelisk of the Golden Solstice',
    color: '#f59e0b',
    wavelength: 'Amber 589nm',
    targetElevation: 0,
    targetDeclination: 90,
    targetPolar: 0,
  },
];

export const ArmillaryModal: React.FC<ArmillaryModalProps> = ({ game, onClose }) => {
  const [elevation, setElevation] = useState(45); // 0..360
  const [declination, setDeclination] = useState(90); // 0..180
  const [polar, setPolar] = useState(0); // 0..360
  const [activeObeliskIdx, setActiveObeliskIdx] = useState(0);
  const [ignitedObelisks, setIgnitedObelisks] = useState<Record<number, boolean>>({});

  const currentTarget = OBELISKS[activeObeliskIdx];

  const checkIgnition = (elev: number, dec: number, pol: number) => {
    const dElev = Math.abs(elev - currentTarget.targetElevation);
    const dDec = Math.abs(dec - currentTarget.targetDeclination);
    const dPol = Math.abs(pol - currentTarget.targetPolar);

    if (dElev <= 15 && dDec <= 15 && dPol <= 15) {
      if (!ignitedObelisks[activeObeliskIdx]) {
        audioEngine.playSpectralBeamIgnition();
        const updated = { ...ignitedObelisks, [activeObeliskIdx]: true };
        setIgnitedObelisks(updated);
        game.quest.showNotification(`✦ IGNITED: ${currentTarget.name.toUpperCase()}!`);

        // Check all 4
        if (Object.keys(updated).length === 4) {
          game.quest.addItem({
            id: 'artifact_zenith_prism',
            name: 'Solar Zenith Prism Crown',
            category: 'artifact',
            description: 'A faceted hyper-pure quartz crystal prism that bends solstice sunlight.',
            lore: 'Recovered from the armillary focal chamber atop the Sun Temple.',
            iconName: 'Sparkles',
          });
          game.quest.showNotification('🌟 COMPLETED: ALL 4 GUARDIAN OBELISKS IGNITED!');
        }
      }
    }
  };

  const handleElevationChange = (delta: number) => {
    audioEngine.playArmillaryGearTurn();
    const next = (elevation + delta + 360) % 360;
    setElevation(next);
    checkIgnition(next, declination, polar);
  };

  const handleDeclinationChange = (delta: number) => {
    audioEngine.playArmillaryGearTurn();
    const next = Math.max(0, Math.min(180, declination + delta));
    setDeclination(next);
    checkIgnition(elevation, next, polar);
  };

  const handlePolarChange = (delta: number) => {
    audioEngine.playArmillaryGearTurn();
    const next = (polar + delta + 360) % 360;
    setPolar(next);
    checkIgnition(elevation, declination, next);
  };

  const isCurrentTargetIgnited = !!ignitedObelisks[activeObeliskIdx];
  const allIgnited = Object.keys(ignitedObelisks).length === 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#14120e] shadow-2xl">
        {/* Left: Prismatic Gyroscope Viewport */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#211a11] to-[#0f0b08] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              1928 ASTRONOMICAL SANCTUARY INSTRUMENT
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              PRISMATIC ARMILLARY SPHERE
            </h2>
          </div>

          {/* 3D Gyro Graphical Visualizer */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-4 flex items-center justify-center">
            {/* Outer Meridian Ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-amber-600/70 shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `rotate(${elevation}deg)` }}
            >
              <div className="absolute top-1 font-mono text-[9px] text-amber-400 font-bold">
                ELEVATION {elevation}°
              </div>
            </div>

            {/* Middle Declination Ring */}
            <div
              className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `rotate(${declination * 2}deg)` }}
            >
              <div className="absolute left-2 font-mono text-[9px] text-amber-300 font-bold">
                DECL {declination}°
              </div>
            </div>

            {/* Inner Polar Ring */}
            <div
              className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-cyan-400/90 shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `rotate(${polar}deg)` }}
            >
              <div className="absolute bottom-1 font-mono text-[9px] text-cyan-300 font-bold">
                POLAR {polar}°
              </div>
            </div>

            {/* Central Quartz Prism Core */}
            <div
              className="w-12 h-12 rounded-xl border-2 border-white/80 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)]"
              style={{
                backgroundColor: currentTarget.color,
                boxShadow: `0 0 35px ${currentTarget.color}`,
              }}
            >
              <Sun className="h-6 w-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            {/* Active Refraction Spectral Ray */}
            <div
              className="absolute h-1 rounded-full transition-all duration-300 pointer-events-none"
              style={{
                width: isCurrentTargetIgnited ? '100%' : '50%',
                backgroundColor: currentTarget.color,
                boxShadow: `0 0 15px ${currentTarget.color}`,
                transform: `rotate(${elevation + polar}deg)`,
              }}
            />
          </div>

          {/* Precision Adjustment Dials */}
          <div className="w-full grid grid-cols-3 gap-2 sm:gap-3">
            {/* Elevation Dial */}
            <div className="flex flex-col items-center rounded-2xl bg-stone-900/80 p-2.5 border border-amber-900/60 shadow-lg">
              <span className="font-mono text-[10px] text-amber-400 font-bold">ELEVATION</span>
              <span className="font-mono text-sm font-bold text-stone-200">{elevation}°</span>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => handleElevationChange(-15)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono cursor-pointer"
                >
                  -15°
                </button>
                <button
                  onClick={() => handleElevationChange(15)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono cursor-pointer"
                >
                  +15°
                </button>
              </div>
            </div>

            {/* Declination Dial */}
            <div className="flex flex-col items-center rounded-2xl bg-stone-900/80 p-2.5 border border-amber-900/60 shadow-lg">
              <span className="font-mono text-[10px] text-amber-400 font-bold">DECLINATION</span>
              <span className="font-mono text-sm font-bold text-stone-200">{declination}°</span>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => handleDeclinationChange(-15)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono cursor-pointer"
                >
                  -15°
                </button>
                <button
                  onClick={() => handleDeclinationChange(15)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono cursor-pointer"
                >
                  +15°
                </button>
              </div>
            </div>

            {/* Polar Dial */}
            <div className="flex flex-col items-center rounded-2xl bg-stone-900/80 p-2.5 border border-cyan-900/60 shadow-lg">
              <span className="font-mono text-[10px] text-cyan-400 font-bold">POLAR AXIS</span>
              <span className="font-mono text-sm font-bold text-cyan-200">{polar}°</span>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => handlePolarChange(-15)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-cyan-300 text-xs font-mono cursor-pointer"
                >
                  -15°
                </button>
                <button
                  onClick={() => handlePolarChange(15)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-cyan-300 text-xs font-mono cursor-pointer"
                >
                  +15°
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: 4 Obelisk Target Selectors & Refraction Logs */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#18130e] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                GUARDIAN OBELISK ARRAY
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Refract sunlight to ignite all 4 temple obelisks.
              </p>
            </div>

            {/* 4 Obelisks List */}
            <div className="space-y-2">
              {OBELISKS.map((ob, idx) => {
                const isIgnited = !!ignitedObelisks[idx];
                const isSelected = idx === activeObeliskIdx;
                return (
                  <button
                    key={ob.name}
                    onClick={() => {
                      setActiveObeliskIdx(idx);
                      audioEngine.playSfx('click');
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: ob.color }}
                      />
                      <div>
                        <div className="font-cinzel text-xs font-bold">{ob.name}</div>
                        <span className="font-mono text-[10px] text-stone-400">
                          {ob.wavelength} (Req: {ob.targetElevation}° / {ob.targetDeclination}° / {ob.targetPolar}°)
                        </span>
                      </div>
                    </div>
                    {isIgnited ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-stone-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status Feedback */}
            <div className="rounded-2xl border border-amber-900/60 bg-[#1d160f] p-4">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">
                FOCAL ALIGNMENT STATUS:
              </span>
              {isCurrentTargetIgnited ? (
                <div className="text-xs font-cinzel font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>REFRACTION LOCKED & OBELISK IGNITED!</span>
                </div>
              ) : (
                <div className="text-xs font-mono text-stone-400 mt-1">
                  Adjust dials to match {currentTarget.targetElevation}° / {currentTarget.targetDeclination}° / {currentTarget.targetPolar}°.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              DISENGAGE ARMILLARY
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
