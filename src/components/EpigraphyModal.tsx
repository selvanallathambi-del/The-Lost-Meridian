/**
 * The Lost Meridian - Concentric Stone Epigraphy Wheel & Stelae Decryption Desk
 * Mayan-Meridian glyph wheels, phonetic prism alignment, and ancient epigraphy translation.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, RotateCw, RotateCcw, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface EpigraphyModalProps {
  game: GameManager;
  onClose: () => void;
}

interface StelePuzzle {
  id: string;
  name: string;
  location: string;
  targetOuter: number; // 0..5 (Celestial)
  targetMiddle: number; // 0..3 (Phase)
  targetInner: number; // 0..5 (Rune)
  translation: string;
  unlockedLore: string;
}

const OUTER_GLYPHS = [
  { name: 'Celestial Jaguar', symbol: '🐆', sound: 'BALAM' },
  { name: 'Solar Eagle', symbol: '🦅', sound: 'MEN' },
  { name: 'Feathered Serpent', symbol: '🐍', sound: 'KUKUL' },
  { name: 'Golden Sun Apex', symbol: '☀️', sound: 'KINICH' },
  { name: 'Silver Lunar Crescent', symbol: '🌙', sound: 'IXCHEL' },
  { name: 'Meridian Zenith Star', symbol: '⭐', sound: 'EK' },
];

const MIDDLE_PHASES = [
  { name: 'Zenith Noon', symbol: '🔺', sound: 'PAX' },
  { name: 'Summer Solstice', symbol: '☀️', sound: 'YAXKIN' },
  { name: 'Autumn Equinox', symbol: '⚖️', sound: 'CH\'EN' },
  { name: 'Solar Eclipse', symbol: '🌑', sound: 'WAYEB' },
];

const INNER_RUNES = [
  { name: 'KA (Fire / Heat)', symbol: '🔥', sound: 'KA' },
  { name: 'RA (Celestial Beam)', symbol: '⚡', sound: 'RA' },
  { name: 'TZO (Resonant Stone)', symbol: '💎', sound: 'TZO' },
  { name: 'KIN (Solar Meridian)', symbol: '🌀', sound: 'KIN' },
  { name: 'AKBAL (Subterranean Dark)', symbol: '🌌', sound: 'AKBAL' },
  { name: 'TUN (Eternal Cycle)', symbol: '⏳', sound: 'TUN' },
];

const STELAE_TABLETS: StelePuzzle[] = [
  {
    id: 'stele_1',
    name: 'Stele of the Solar Canal',
    location: 'Waterfall Plunge Pool Basin',
    targetOuter: 0, // Jaguar
    targetMiddle: 1, // Solstice
    targetInner: 3, // KIN
    translation:
      'BALAM • YAXKIN • KIN: "When the Jaguar drinks at the summer solstice, the sunken canal opens beneath the roaring cascade."',
    unlockedLore: 'Discloses the hydraulic floodgates feeding the subterranean crypt.',
  },
  {
    id: 'stele_2',
    name: 'Stele of the Star Projector',
    location: 'Deep Sanctuary Altar',
    targetOuter: 5, // Star
    targetMiddle: 0, // Zenith
    targetInner: 1, // RA
    translation:
      'EK • PAX • RA: "The zenith star shall cast light through crystal prisms, igniting the ceiling starfield dome."',
    unlockedLore: 'Confirms the focal coordinates for the Planetarium Star Projector.',
  },
  {
    id: 'stele_3',
    name: 'Stele of the Harmonic Core',
    location: 'Grand Pyramid Apex',
    targetOuter: 2, // Serpent
    targetMiddle: 3, // Eclipse
    targetInner: 2, // TZO
    translation:
      'KUKUL • WAYEB • TZO: "During the black sun, the resonant stone sings at 528 vibrations to awaken the Meridian heart."',
    unlockedLore: 'The master acoustic resonance key of the ancient civilization.',
  },
];

export const EpigraphyModal: React.FC<EpigraphyModalProps> = ({ game, onClose }) => {
  const [activeSteleIdx, setActiveSteleIdx] = useState(0);
  const [outerIdx, setOuterIdx] = useState(2);
  const [middleIdx, setMiddleIdx] = useState(3);
  const [innerIdx, setInnerIdx] = useState(0);
  const [solvedStelae, setSolvedStelae] = useState<Record<string, boolean>>({});

  const currentStele = STELAE_TABLETS[activeSteleIdx];
  const isCurrentlyAligned =
    outerIdx === currentStele.targetOuter &&
    middleIdx === currentStele.targetMiddle &&
    innerIdx === currentStele.targetInner;

  const isSolved = solvedStelae[currentStele.id] || isCurrentlyAligned;

  const rotateOuter = (dir: number) => {
    audioEngine.playStoneWheelGrind();
    const next = (outerIdx + dir + OUTER_GLYPHS.length) % OUTER_GLYPHS.length;
    setOuterIdx(next);
    checkSolve(next, middleIdx, innerIdx);
  };

  const rotateMiddle = (dir: number) => {
    audioEngine.playStoneWheelGrind();
    const next = (middleIdx + dir + MIDDLE_PHASES.length) % MIDDLE_PHASES.length;
    setMiddleIdx(next);
    checkSolve(outerIdx, next, innerIdx);
  };

  const rotateInner = (dir: number) => {
    audioEngine.playStoneWheelGrind();
    const next = (innerIdx + dir + INNER_RUNES.length) % INNER_RUNES.length;
    setInnerIdx(next);
    checkSolve(outerIdx, middleIdx, next);
  };

  const checkSolve = (outI: number, midI: number, inI: number) => {
    if (
      outI === currentStele.targetOuter &&
      midI === currentStele.targetMiddle &&
      inI === currentStele.targetInner
    ) {
      if (!solvedStelae[currentStele.id]) {
        audioEngine.playRuneChime();
        setSolvedStelae((prev) => ({ ...prev, [currentStele.id]: true }));
        game.quest.showNotification(`✦ DECIPHERED: ${currentStele.name.toUpperCase()}!`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16120e] shadow-2xl">
        {/* Left: Concentric Stone Wheel Chamber */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#221912] to-[#0f0b08] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              ANCIENT MERIDIAN CALENDRICAL CRYPTEX
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              CONCENTRIC GLYPH EPIGRAPHY WHEEL
            </h2>
          </div>

          {/* 3 Concentric Carved Stone Rings */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center">
            {/* Outer Stone Ring (Celestial) */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-800/80 bg-[#1e150e] flex items-center justify-center shadow-2xl">
              <div className="absolute top-2 font-cinzel text-xs font-bold text-amber-300">
                {OUTER_GLYPHS[outerIdx].symbol} {OUTER_GLYPHS[outerIdx].name}
              </div>
            </div>

            {/* Middle Stone Ring (Phases) */}
            <div className="absolute w-44 h-44 rounded-full border-4 border-amber-600/60 bg-[#281c13] flex items-center justify-center shadow-inner">
              <div className="absolute top-2 font-cinzel text-xs font-bold text-amber-200">
                {MIDDLE_PHASES[middleIdx].symbol} {MIDDLE_PHASES[middleIdx].name}
              </div>
            </div>

            {/* Inner Stone Ring (Runes) */}
            <div className="absolute w-24 h-24 rounded-full border-4 border-cyan-700/60 bg-[#15232d] flex flex-col items-center justify-center shadow-lg">
              <span className="text-xl">{INNER_RUNES[innerIdx].symbol}</span>
              <span className="font-mono text-[10px] font-bold text-cyan-300">
                {INNER_RUNES[innerIdx].sound}
              </span>
            </div>

            {/* Alignment Pointer */}
            <div className="absolute -top-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 z-20" />
          </div>

          {/* Rotation Controls per Ring */}
          <div className="w-full grid grid-cols-3 gap-2">
            {/* Outer Ring Controls */}
            <div className="flex flex-col items-center rounded-xl bg-stone-900/80 p-2 border border-amber-900/60">
              <span className="font-mono text-[10px] text-amber-400">OUTER RING</span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => rotateOuter(-1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => rotateOuter(1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Ring Controls */}
            <div className="flex flex-col items-center rounded-xl bg-stone-900/80 p-2 border border-amber-900/60">
              <span className="font-mono text-[10px] text-amber-400">MID RING</span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => rotateMiddle(-1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => rotateMiddle(1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Inner Ring Controls */}
            <div className="flex flex-col items-center rounded-xl bg-stone-900/80 p-2 border border-cyan-900/60">
              <span className="font-mono text-[10px] text-cyan-400">INNER RUNE</span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => rotateInner(-1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => rotateInner(1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Stelae Tablets Library & Translations */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#19140f] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                TEMPLE STELAE INSCRIPTIONS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Align the 3 rings to decrypt the ancient inscriptions.
              </p>
            </div>

            {/* Stelae Selector Tabs */}
            <div className="space-y-2">
              {STELAE_TABLETS.map((st, idx) => {
                const isDecrypted = solvedStelae[st.id];
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setActiveSteleIdx(idx);
                      audioEngine.playSfx('click');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      idx === activeSteleIdx
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-cinzel text-xs font-bold">{st.name}</div>
                      <span className="text-[10px] font-mono text-stone-500">{st.location}</span>
                    </div>
                    {isDecrypted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-amber-500/50" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Translation Output Box */}
            <div className="rounded-2xl border border-amber-900/60 bg-[#1d160f] p-3.5 space-y-2">
              <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                DECIPHERED TRANSLATION:
              </span>
              {isSolved ? (
                <div className="space-y-1.5 animate-fade-in">
                  <p className="text-xs font-serif text-amber-200 italic leading-relaxed">
                    {currentStele.translation}
                  </p>
                  <p className="text-[10px] font-mono text-cyan-300 pt-1 border-t border-amber-900/40">
                    ✦ ARCHAEOLOGICAL DISCOVERY: {currentStele.unlockedLore}
                  </p>
                </div>
              ) : (
                <div className="text-xs font-mono text-stone-500 italic py-3 text-center">
                  [GLYPHIC CIPHER LOCKED — ROTATE RINGS TO MATCH STELAE]
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE EPIGRAPHY TABLE
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
