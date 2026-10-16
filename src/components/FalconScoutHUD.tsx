/**
 * The Lost Meridian - Andean Falcon Scouting HUD & Aerial Canopy Flight
 * High-altitude flight telemetry, airspeed, altitude, waypoint markers, and aerial guidance.
 */

import React from 'react';
import { GameManager } from '../game/GameManager';
import { Compass, Wind, Eye, ArrowUp, ArrowDown, X } from 'lucide-react';

interface FalconScoutHUDProps {
  game: GameManager;
  onExit: () => void;
}

export const FalconScoutHUD: React.FC<FalconScoutHUDProps> = ({ game, onExit }) => {
  const falcon = game.falconFlight;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none flex flex-col justify-between p-4 sm:p-6 text-amber-200">
      {/* Top Aerial Barometer & Compass */}
      <div className="flex items-center justify-between">
        {/* Left: Altitude & Speed Gauge */}
        <div className="pointer-events-auto rounded-2xl bg-black/60 backdrop-blur-md border border-amber-500/40 p-3.5 space-y-1 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-amber-300">
            <Wind className="h-4 w-4 text-cyan-400" />
            <span>ANDEAN FALCON RECONNAISSANCE</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono pt-1">
            <div>
              <span className="text-[10px] text-stone-400 block uppercase">Altitude</span>
              <span className="text-base font-bold text-amber-400">
                {Math.round(falcon.altitude)} m
              </span>
            </div>
            <div className="border-l border-stone-700 pl-4">
              <span className="text-[10px] text-stone-400 block uppercase">Airspeed</span>
              <span className="text-base font-bold text-cyan-400">
                {Math.round(falcon.speed * 3.6)} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Center: Flight Reticle & Crosshair */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-full border border-amber-400/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <div className="absolute top-0 w-px h-3 bg-amber-400/60" />
            <div className="absolute bottom-0 w-px h-3 bg-amber-400/60" />
            <div className="absolute left-0 h-px w-3 bg-amber-400/60" />
            <div className="absolute right-0 h-px w-3 bg-amber-400/60" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-amber-400/80 mt-1 uppercase">
            AERIAL CANOPY SURVEILLANCE
          </span>
        </div>

        {/* Right: Exit / Return Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onExit}
            className="flex items-center gap-2 rounded-2xl bg-stone-900/80 hover:bg-stone-850 backdrop-blur-md border border-amber-700/50 px-4 py-2.5 text-xs font-cinzel font-bold shadow-2xl transition-all cursor-pointer text-stone-200"
          >
            <span>RETURN TO STERLING</span>
            <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">
              [SPACE]
            </span>
          </button>
        </div>
      </div>

      {/* Flight Control Legend */}
      <div className="flex justify-center">
        <div className="rounded-2xl bg-black/70 backdrop-blur-md border border-amber-900/50 px-5 py-2.5 shadow-2xl flex items-center gap-4 text-xs font-mono text-stone-300">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-400">[W]</span>
            <span>Dive & Accelerate</span>
          </div>
          <span className="text-stone-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-400">[S]</span>
            <span>Pitch Up & Soar</span>
          </div>
          <span className="text-stone-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-400">[A / D]</span>
            <span>Bank Left / Right</span>
          </div>
        </div>
      </div>
    </div>
  );
};
