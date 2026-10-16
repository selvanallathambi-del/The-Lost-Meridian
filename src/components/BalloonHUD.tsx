/**
 * The Lost Meridian - 1928 Expedition Observation Balloon HUD
 * Altimeter, fuel gauge, burner throttle, and high-altitude spyglass overlay.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { Flame, Wind, Eye, X, Compass, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface BalloonHUDProps {
  game: GameManager;
  onDismount: () => void;
}

export const BalloonHUD: React.FC<BalloonHUDProps> = ({ game, onDismount }) => {
  const balloon = game.balloonSystem;
  const altitude = Math.round(balloon.altitude);
  const fuel = Math.round(balloon.fuel);
  const [isSpyglass, setIsSpyglass] = useState(false);

  const toggleSpyglass = () => {
    setIsSpyglass(!isSpyglass);
    balloon.isSpyglassActive = !isSpyglass;
    audioEngine.playSfx('click');
  };

  const handleDropBallast = () => {
    balloon.dropBallast();
    game.quest.showNotification(`🪨 BALLAST DROPPED! (${balloon.ballastCount} REMAINING)`);
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-8 text-stone-200">
      {/* Spyglass Circular Reticle Overlay */}
      {isSpyglass && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[75vh] h-[75vh] rounded-full border-[28px] border-amber-950/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] flex items-center justify-center overflow-hidden">
            {/* Crosshairs */}
            <div className="absolute inset-x-0 h-0.5 bg-amber-400/40" />
            <div className="absolute inset-y-0 w-0.5 bg-amber-400/40" />
            <div className="w-32 h-32 rounded-full border border-amber-400/30" />
            <div className="w-64 h-64 rounded-full border border-amber-400/20" />
            <span className="absolute bottom-6 font-mono text-xs text-amber-300 font-bold">
              12X PANORAMIC BRASS FIELD OPTICS
            </span>
          </div>
        </div>
      )}

      {/* Top Header: Altimeter Barometer & Fuel Gauges */}
      <div className="relative flex items-center justify-between pointer-events-auto">
        {/* Left: Altimeter */}
        <div className="flex items-center gap-3 rounded-2xl bg-stone-900/90 px-4 py-2.5 backdrop-blur-md border border-amber-700/60 shadow-xl">
          <Wind className="h-5 w-5 text-amber-400" />
          <div>
            <span className="font-mono text-[10px] text-amber-500 uppercase tracking-wider block">
              BAROMETRIC ALTIMETER
            </span>
            <span className="font-mono text-base font-bold text-amber-200">{altitude} METERS MSL</span>
          </div>
        </div>

        {/* Center: Flight Status */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-stone-900/80 px-4 py-1.5 backdrop-blur-md border border-amber-900/60 text-xs font-cinzel text-amber-300 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>EXPEDITION AEROSTAT NO. 4 • SURVEY ELEVATION</span>
        </div>

        {/* Right: Kerosene Fuel & Ballast */}
        <div className="flex items-center gap-4 rounded-2xl bg-stone-900/90 px-4 py-2.5 backdrop-blur-md border border-amber-700/60 shadow-xl">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 ${balloon.isBurnerActive ? 'text-orange-400 animate-pulse' : 'text-amber-600'}`} />
            <div>
              <span className="font-mono text-[10px] text-amber-500 uppercase tracking-wider block">
                KEROSENE FUEL
              </span>
              <span className="font-mono text-sm font-bold text-amber-200">{fuel}%</span>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-700" />

          <div>
            <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider block">
              BALLAST
            </span>
            <span className="font-mono text-sm font-bold text-stone-300">{balloon.ballastCount} BAGS</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Legend & Action Buttons */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
        {/* Controls Legend */}
        <div className="flex items-center gap-2 rounded-2xl bg-stone-900/85 px-4 py-2 backdrop-blur-md border border-stone-800 text-xs font-mono text-stone-300 shadow-lg">
          <span className="text-amber-400 font-bold">[W]</span> BURNER LIFT
          <span className="text-stone-600">•</span>
          <span className="text-amber-400 font-bold">[S]</span> VENT AIR
          <span className="text-stone-600">•</span>
          <span className="text-amber-400 font-bold">[A/D]</span> ROTATE YAW
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSpyglass}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border backdrop-blur-md text-xs font-cinzel font-bold shadow-lg transition-all cursor-pointer ${
              isSpyglass
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Eye className="h-4 w-4 text-amber-400" />
            <span>SPYGLASS [Z]</span>
          </button>

          <button
            onClick={handleDropBallast}
            disabled={balloon.ballastCount <= 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-stone-300 font-cinzel text-xs font-bold shadow-lg transition-all cursor-pointer"
          >
            <span>DROP BALLAST [B]</span>
          </button>

          <button
            onClick={onDismount}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-950/90 hover:bg-amber-900 border border-amber-600/60 text-amber-200 font-cinzel text-xs font-bold shadow-xl transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>MOOR & DISMOUNT [SPACE]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
