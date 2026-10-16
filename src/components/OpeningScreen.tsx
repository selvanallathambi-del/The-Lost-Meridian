/**
 * The Lost Meridian - Cinematic Title & Start Screen
 */

import React from 'react';
import { Play, Compass, Sparkles } from 'lucide-react';
import { GameManager } from '../game/GameManager';

interface OpeningScreenProps {
  game?: GameManager;
  onStart: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col items-center justify-between bg-gradient-to-b from-black/40 via-stone-950/15 to-black/60 backdrop-blur-[0.5px] p-4 sm:p-8 md:p-10 select-none text-stone-200 overflow-y-auto pointer-events-auto">
      {/* Top Bar */}
      <div className="flex w-full max-w-6xl items-center justify-between border-b border-amber-900/30 pb-3 sm:pb-4 text-[10px] sm:text-xs tracking-widest text-stone-400 font-mono">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="tracking-widest uppercase">ROYAL GEOGRAPHIC SOCIETY · EXPEDITION ARCHIVES</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-stone-400">
          <span>OCTOBER 1928 · SECTOR ALPHA</span>
        </div>
      </div>

      {/* Center Title & Synopsis */}
      <div className="flex flex-col items-center text-center max-w-3xl space-y-3 sm:space-y-4 md:space-y-5 my-auto py-2">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.35em] text-amber-400 uppercase font-mono">
            A Cinematic 3D Archaeological Mystery
          </div>
          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-amber-100 text-glow-gold">
            THE LOST MERIDIAN
          </h1>
          <div className="h-0.5 w-24 sm:w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
        </div>

        <p className="font-serif text-xs sm:text-sm md:text-base leading-relaxed text-stone-300 max-w-xl mx-auto italic px-2">
          “October 1928 — Dr. Arthur Sterling’s Royal Geographic expedition has vanished while excavating the lost Solarian Dynasty of Atlan-Mar. Retrace their footsteps through Sector 7, decipher the ancient astronomical aqueducts, and awaken the subterranean Meridian Core.”
        </p>

        {/* Start Button */}
        <div className="flex items-center justify-center pt-4">
          <button
            onClick={onStart}
            className="group relative flex items-center gap-3 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-600 to-amber-500 px-8 py-4 sm:px-10 sm:py-4.5 font-cinzel text-xs sm:text-sm font-bold tracking-widest text-stone-950 transition-all active:scale-95 hover:scale-105 hover:from-amber-500 hover:to-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <Play className="h-4 w-4 fill-stone-950 transition-transform group-hover:translate-x-0.5" />
            <span>COMMENCE EXPEDITION</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls Overview (Clean Unboxed Typography) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 text-[10px] sm:text-[11px] text-stone-400 font-mono tracking-wide text-center">
        <span>[WASD / Joystick] Move</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>[Shift] Sprint</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>[E] Inspect / Interact</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>[TAB] Field Journal</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>[C] Camera View</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>[T] Torch</span>
      </div>
    </div>
  );
};
