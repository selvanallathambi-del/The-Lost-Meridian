/**
 * The Lost Meridian - Ancient Celestial Astrolabe Stele Cipher Wheel
 * Interactive concentric ring decryption minigame matching 1928 archaeological notes.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, RotateCw, RotateCcw, Sparkles, CheckCircle2, Award, HelpCircle } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface CipherWheelModalProps {
  game: GameManager;
  onClose: () => void;
}

const OUTER_GLYPHS = [
  { name: 'Serpent of the River', icon: '🐍', desc: 'Serpent' },
  { name: 'Jaguar of the Shadows', icon: '🐆', desc: 'Jaguar' },
  { name: 'Eagle of the Zenith', icon: '🦅', desc: 'Eagle' },
  { name: 'Crocodile of the Depths', icon: '🐊', desc: 'Crocodile' },
  { name: 'Monkey of the Canopy', icon: '🐒', desc: 'Monkey' },
  { name: 'Solar Deity Crest', icon: '☀️', desc: 'Sun God' },
  { name: 'Obsidian Mask', icon: '💀', desc: 'Ancestors' },
  { name: 'Water Spirit', icon: '🌊', desc: 'Currents' },
];

const MIDDLE_RUNES = [
  { name: 'Summer Solstice Meridian', icon: '☀️', desc: 'Solstice' },
  { name: 'Equinox Balance', icon: '⚖️', desc: 'Equinox' },
  { name: 'Celestial Zenith', icon: '🌟', desc: 'Zenith' },
  { name: 'Total Solar Eclipse', icon: '🌘', desc: 'Eclipse' },
  { name: 'Dawn Horizon', icon: '🌅', desc: 'Dawn' },
  { name: 'Nadir Underworld', icon: '🌌', desc: 'Nadir' },
];

const INNER_ELEMENTS = [
  { name: 'Solar Primordial Flame', icon: '🔥', desc: 'Solar Flame' },
  { name: 'Cascade River Torrent', icon: '💧', desc: 'Water Torrent' },
  { name: 'Living Jungle Jade', icon: '🌿', desc: 'Living Jade' },
  { name: 'Sacred Basalt Stone', icon: '🪨', desc: 'Earth Stone' },
];

export const CipherWheelModal: React.FC<CipherWheelModalProps> = ({ game, onClose }) => {
  const [outerIdx, setOuterIdx] = useState(2);
  const [middleIdx, setMiddleIdx] = useState(4);
  const [innerIdx, setInnerIdx] = useState(1);
  const [isSolved, setIsSolved] = useState(game.isCipherSolved);
  const [showHint, setShowHint] = useState(false);

  const checkSolution = (newOuter: number, newMid: number, newInner: number) => {
    // Correct alignment: Serpent (0) + Solstice (0) + Solar Flame (0)
    if (newOuter === 0 && newMid === 0 && newInner === 0 && !isSolved) {
      setIsSolved(true);
      game.isCipherSolved = true;
      audioEngine.playCipherSolve();

      // Award Relic & Journal Document
      game.quest.addItem({
        id: 'item_astrolabe_meridian',
        name: 'Astrolabe of the Meridian Sovereign',
        category: 'artifact',
        description: 'A concentric bronze astrolabe wheel inscribed with astronomical coordinates and stellar alignments.',
        lore: 'Recovered after decrypting the ancient relief carving along the river ruins.',
        iconName: 'Sparkles',
      });

      game.quest.documents.unshift({
        id: 'doc_astrolabe_rubbing',
        title: 'Decrypted Meridian Astrolabe Star Map',
        author: 'Deciphered Ancient Stele',
        date: 'July 14, 1928',
        content: 'The stars have aligned. When the solar solstice intersects the zenith of Sector 7, the underground chambers of the Meridian channel illuminate. The subterranean chasm holds the true key to the ancient solar machinery.',
        type: 'ancient_rubbing',
        read: true,
      });

      game.quest.showNotification('🏆 ASTROLABE CIPHER DECIPHERED — SOVEREIGN RELIC RECOVERED!');
      if (game.onStateChange) game.onStateChange();
    }
  };

  const rotateOuter = (dir: 1 | -1) => {
    if (isSolved) return;
    audioEngine.playCipherClick();
    const next = (outerIdx + dir + OUTER_GLYPHS.length) % OUTER_GLYPHS.length;
    setOuterIdx(next);
    checkSolution(next, middleIdx, innerIdx);
  };

  const rotateMiddle = (dir: 1 | -1) => {
    if (isSolved) return;
    audioEngine.playCipherClick();
    const next = (middleIdx + dir + MIDDLE_RUNES.length) % MIDDLE_RUNES.length;
    setMiddleIdx(next);
    checkSolution(outerIdx, next, innerIdx);
  };

  const rotateInner = (dir: 1 | -1) => {
    if (isSolved) return;
    audioEngine.playCipherClick();
    const next = (innerIdx + dir + INNER_ELEMENTS.length) % INNER_ELEMENTS.length;
    setInnerIdx(next);
    checkSolution(outerIdx, middleIdx, next);
  };

  const outerDeg = outerIdx * (360 / OUTER_GLYPHS.length);
  const middleDeg = middleIdx * (360 / MIDDLE_RUNES.length);
  const innerDeg = innerIdx * (360 / INNER_ELEMENTS.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row h-auto max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left / Center: The Brass & Obsidian Cipher Wheel */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#181410] to-[#0d0b09] relative">
          {/* Header */}
          <div className="text-center mb-4">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              ARCHAEOLOGICAL DECRYPTION
            </span>
            <h2 className="font-cinzel text-base sm:text-xl font-bold text-amber-200 tracking-wider">
              CELESTIAL ASTROLABE CIPHER
            </h2>
            <p className="text-[11px] text-stone-400 max-w-md mt-0.5">
              Align the concentric dials to match the celestial translation in Dr. Sterling’s expedition notebook.
            </p>
          </div>

          {/* Interactive Concentric Dial Graphics */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-2">
            {/* Outer Ring Shadow & Brass Rim */}
            <div
              className="absolute inset-0 rounded-full border-4 border-amber-600/60 bg-stone-900/90 shadow-[0_0_35px_rgba(217,119,6,0.25)] transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${-outerDeg}deg)` }}
            >
              {OUTER_GLYPHS.map((g, idx) => {
                const angle = (idx * 360) / OUTER_GLYPHS.length;
                return (
                  <div
                    key={idx}
                    className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center text-lg sm:text-xl"
                    style={{
                      left: `${50 + 42 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                      top: `${50 + 42 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                      transform: `rotate(${angle}deg)`,
                    }}
                    title={g.name}
                  >
                    <span>{g.icon}</span>
                  </div>
                );
              })}
            </div>

            {/* Middle Celestial Ring */}
            <div
              className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border-4 border-amber-500/70 bg-[#1e1914] shadow-inner transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${-middleDeg}deg)` }}
            >
              {MIDDLE_RUNES.map((r, idx) => {
                const angle = (idx * 360) / MIDDLE_RUNES.length;
                return (
                  <div
                    key={idx}
                    className="absolute w-7 h-7 -ml-3.5 -mt-3.5 flex items-center justify-center text-base sm:text-lg"
                    style={{
                      left: `${50 + 39 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                      top: `${50 + 39 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                      transform: `rotate(${angle}deg)`,
                    }}
                    title={r.name}
                  >
                    <span>{r.icon}</span>
                  </div>
                );
              })}
            </div>

            {/* Inner Element Ring */}
            <div
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-cyan-500/70 bg-[#151d20] shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${-innerDeg}deg)` }}
            >
              {INNER_ELEMENTS.map((el, idx) => {
                const angle = (idx * 360) / INNER_ELEMENTS.length;
                return (
                  <div
                    key={idx}
                    className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center text-sm sm:text-base"
                    style={{
                      left: `${50 + 34 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                      top: `${50 + 34 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                      transform: `rotate(${angle}deg)`,
                    }}
                    title={el.name}
                  >
                    <span>{el.icon}</span>
                  </div>
                );
              })}
            </div>

            {/* Central Crystal Core */}
            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 border-amber-300 transition-all ${
              isSolved
                ? 'bg-amber-400 text-black shadow-[0_0_25px_gold] animate-pulse'
                : 'bg-stone-900 text-amber-400'
            }`}>
              <Sparkles className="h-6 w-6" />
            </div>

            {/* Top Indicator Pointer Triangle */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-amber-400 z-20 drop-shadow-[0_0_8px_gold]" />
          </div>

          {/* Current Active Alignment Readout */}
          <div className="mt-3 flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-stone-300 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
            <span className="text-amber-400">Outer: {OUTER_GLYPHS[outerIdx].desc}</span>
            <span>•</span>
            <span className="text-amber-300">Middle: {MIDDLE_RUNES[middleIdx].desc}</span>
            <span>•</span>
            <span className="text-cyan-400">Inner: {INNER_ELEMENTS[innerIdx].desc}</span>
          </div>

          {/* Solved Status Indicator */}
          {isSolved && (
            <div className="mt-2.5 flex items-center gap-2 text-emerald-400 font-cinzel font-bold text-xs bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-600/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-4 w-4" />
              <span>ALIGNMENT HARMONIZED — REFINED RELIC UNSEALED</span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Ring Rotation Controls & Sterling Field Clue */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">MECHANICAL DIAL KEYS</span>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-[10px] font-mono text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="h-3 w-3" />
                <span>{showHint ? 'Hide Clue' : 'Field Clue'}</span>
              </button>
            </div>

            {/* Dr. Sterling Clue Box */}
            <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 font-serif text-xs text-amber-100/90 leading-relaxed shadow-sm">
              <div className="font-cinzel text-[10px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>Dr. Sterling's Translation Note (Page 44)</span>
              </div>
              "To unlock the celestial vault of the Meridian Sovereign, orient the <strong className="text-amber-300 font-bold">Serpent of the River</strong> at the zenith, cross with the <strong className="text-amber-300 font-bold">Summer Solstice</strong> meridian, and center upon the <strong className="text-cyan-300 font-bold">Solar Flame</strong>."
            </div>

            {/* Individual Ring Controllers */}
            <div className="space-y-2.5">
              {/* Outer Ring Controller */}
              <div className="rounded-lg bg-stone-900/90 p-2.5 border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-200">Outer Zodiac Ring</div>
                  <div className="text-[10px] text-stone-400">{OUTER_GLYPHS[outerIdx].name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={isSolved}
                    onClick={() => rotateOuter(-1)}
                    className="p-1.5 rounded-md bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    disabled={isSolved}
                    onClick={() => rotateOuter(1)}
                    className="p-1.5 rounded-md bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Middle Ring Controller */}
              <div className="rounded-lg bg-stone-900/90 p-2.5 border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-300">Middle Meridian Ring</div>
                  <div className="text-[10px] text-stone-400">{MIDDLE_RUNES[middleIdx].name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={isSolved}
                    onClick={() => rotateMiddle(-1)}
                    className="p-1.5 rounded-md bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    disabled={isSolved}
                    onClick={() => rotateMiddle(1)}
                    className="p-1.5 rounded-md bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Inner Element Controller */}
              <div className="rounded-lg bg-stone-900/90 p-2.5 border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-cyan-300">Inner Element Ring</div>
                  <div className="text-[10px] text-stone-400">{INNER_ELEMENTS[innerIdx].name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={isSolved}
                    onClick={() => rotateInner(-1)}
                    className="p-1.5 rounded-md bg-stone-800 text-stone-300 hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    disabled={isSolved}
                    onClick={() => rotateInner(1)}
                    className="p-1.5 rounded-md bg-stone-800 text-stone-300 hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Close / Action Footer */}
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2.5 text-xs transition-colors cursor-pointer shadow-lg"
            >
              <span>{isSolved ? 'COLLECT RELIC & RETURN' : 'EXIT TO EXPEDITION'}</span>
            </button>
          </div>
        </div>

        {/* Top Right Close Button */}
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
