/**
 * The Lost Meridian - Meridian Planetarium Dome & Constellation Projector
 * Armillary celestial star projector, constellation alignments, and subterranean zodiac starlight.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Sparkles, Compass, Moon, Sun, Star } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface PlanetariumModalProps {
  game: GameManager;
  onClose: () => void;
}

interface Constellation {
  id: string;
  name: string;
  glyph: string;
  targetAngle: number; // degrees
  currentAngle: number;
  lore: string;
  aligned: boolean;
}

const INITIAL_CONSTELLATIONS: Constellation[] = [
  {
    id: 'jaguar',
    name: 'The Celestial Jaguar',
    glyph: '🐆',
    targetAngle: 45,
    currentAngle: 120,
    lore: 'Patron of the nocturnal underworld and midnight zenith.',
    aligned: false,
  },
  {
    id: 'falcon',
    name: 'The Solar Falcon',
    glyph: '🦅',
    targetAngle: 135,
    currentAngle: 210,
    lore: 'Guardian of the midday sun and solstice apex.',
    aligned: false,
  },
  {
    id: 'serpent',
    name: 'The Obsidian Serpent',
    glyph: '🐍',
    targetAngle: 225,
    currentAngle: 60,
    lore: 'Cosmic celestial river connecting subterranean waters to the heavens.',
    aligned: false,
  },
  {
    id: 'cross',
    name: 'The Meridian Southern Cross',
    glyph: '✦',
    targetAngle: 315,
    currentAngle: 300,
    lore: 'The eternal navigational pivot guiding ancient voyagers.',
    aligned: false,
  },
];

export const PlanetariumModal: React.FC<PlanetariumModalProps> = ({ game, onClose }) => {
  const [constellations, setConstellations] = useState<Constellation[]>(INITIAL_CONSTELLATIONS);
  const [activeIdx, setActiveIdx] = useState(0);

  const active = constellations[activeIdx];
  const allAligned = constellations.every((c) => c.aligned);

  const rotateActive = (deltaDegrees: number) => {
    setConstellations((prev) =>
      prev.map((c, idx) => {
        if (idx !== activeIdx) return c;
        const newAngle = (c.currentAngle + deltaDegrees + 360) % 360;
        const diff = Math.abs(newAngle - c.targetAngle);
        const isNowAligned = diff <= 12 || diff >= 348;

        if (isNowAligned && !c.aligned) {
          audioEngine.playStarlightHum();
          game.quest.showNotification(`✦ ${c.name.toUpperCase()} CELESTIAL AXIS ALIGNED!`);
        } else {
          audioEngine.playSfx('click');
        }

        return {
          ...c,
          currentAngle: newAngle,
          aligned: isNowAligned,
        };
      })
    );
  };

  const handleActivateDome = () => {
    game.activatePlanetariumDome();
    audioEngine.playItemDiscovery();
    game.quest.showNotification('🌌 MERIDIAN CELESTIAL PLANETARIUM DOME IGNITED!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-600/50 bg-[#0c121d] shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Left: Interactive Celestial Starlight Astrolabe Dial */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0f172a] to-[#070b13] relative">
          <div className="text-center mb-3">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              MERIDIAN DEEP SANCTUARY • CELESTIAL ARMILLARY
            </span>
            <h2 className="font-cinzel text-xl font-bold text-cyan-200 tracking-wider">
              PLANETARIUM STAR-PROJECTOR
            </h2>
          </div>

          {/* Starlight Dome Canvas / Projection Disc */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-cyan-500/40 bg-radial from-cyan-950/60 to-black flex items-center justify-center shadow-[inset_0_0_30px_rgba(6,182,212,0.3)]">
            {/* Outer Cardinal Ring */}
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-800/40" />

            {/* Target Alignment Notches */}
            {constellations.map((c) => (
              <div
                key={c.id}
                className="absolute w-full h-full flex items-start justify-center pointer-events-none"
                style={{ transform: `rotate(${c.targetAngle}deg)` }}
              >
                <div
                  className={`w-2.5 h-4 rounded-b-sm border-x border-b transition-all ${
                    c.aligned
                      ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_12px_#38bdf8]'
                      : 'bg-stone-800 border-stone-600'
                  }`}
                />
              </div>
            ))}

            {/* Rotating Active Constellation Pointer */}
            <div
              className="absolute w-full h-full flex items-start justify-center transition-transform duration-100 pointer-events-none"
              style={{ transform: `rotate(${active.currentAngle}deg)` }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-3.5 h-6 rounded-full border shadow-lg transition-colors ${
                    active.aligned
                      ? 'bg-cyan-300 border-white shadow-[0_0_15px_#67e8f9]'
                      : 'bg-amber-400 border-amber-200 shadow-[0_0_10px_#f59e0b]'
                  }`}
                />
                <span className="text-xl mt-1">{active.glyph}</span>
              </div>
            </div>

            {/* Center Luminous Star Core */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
                allAligned
                  ? 'bg-cyan-500/30 border-cyan-300 shadow-[0_0_25px_#38bdf8] animate-pulse'
                  : 'bg-stone-900/80 border-cyan-900/60'
              }`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  allAligned ? 'text-cyan-200 animate-spin' : 'text-cyan-500/50'
                }`}
              />
            </div>
          </div>

          {/* Dial Rotation Buttons */}
          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={() => rotateActive(-15)}
              className="px-4 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-cyan-700/50 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
            >
              ↺ ROTATE -15°
            </button>
            <span className="font-mono text-sm font-bold text-amber-300 min-w-16 text-center">
              {active.currentAngle}°
            </span>
            <button
              onClick={() => rotateActive(15)}
              className="px-4 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-cyan-700/50 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
            >
              ROTATE +15° ↻
            </button>
          </div>
        </div>

        {/* Right Sidebar: Constellation Alignment Status & Lore */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-cyan-900/40 bg-[#0e1624] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-cyan-900/40 pb-2">
              <span className="font-cinzel text-xs font-bold text-cyan-300">
                SACRED MERIDIAN ZODIAC
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Rotate each constellation to match its subterranean zenith marker.
              </p>
            </div>

            {/* Constellation Selectors */}
            <div className="space-y-2">
              {constellations.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    audioEngine.playSfx('click');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    idx === activeIdx
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 ring-1 ring-cyan-400/50'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.glyph}</span>
                    <div>
                      <div className="font-cinzel text-xs font-bold">{c.name}</div>
                      <span className="text-[10px] font-mono text-stone-500">
                        Target: {c.targetAngle}°
                      </span>
                    </div>
                  </div>
                  {c.aligned ? (
                    <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/50">
                      ALIGNED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-stone-500">
                      {Math.abs(c.currentAngle - c.targetAngle)}° OFF
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Lore Box */}
            <div className="rounded-xl border border-cyan-900/50 bg-[#070f1a] p-3 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                SANCTUARY EPIGRAPHY:
              </span>
              <p className="text-xs font-serif text-stone-300 italic leading-relaxed">
                "{active.lore}"
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-900/40 space-y-2">
            <button
              onClick={handleActivateDome}
              disabled={!allAligned}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-cinzel text-xs font-bold transition-all ${
                allAligned
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer'
                  : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>IGNITE CELESTIAL PLANETARIUM</span>
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 text-xs font-mono transition-colors cursor-pointer"
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
