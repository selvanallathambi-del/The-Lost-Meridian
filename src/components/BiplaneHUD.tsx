/**
 * The Lost Meridian - 1928 Curtiss Biplane Cockpit HUD
 * Vintage instrument cluster, airspeed, altimeter, flare drop, and aerial photogrammetry.
 */

import React, { useEffect, useState } from 'react';
import { GameManager } from '../game/GameManager';
import { Plane, Camera, Flame, ArrowUp, ArrowDown, LogOut, Compass } from 'lucide-react';

interface BiplaneHUDProps {
  game: GameManager;
}

export const BiplaneHUD: React.FC<BiplaneHUDProps> = ({ game }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 40); // 25fps UI refresh
    return () => clearInterval(interval);
  }, []);

  const biplane = game.biplaneSystem;
  const airspeed = Math.round(biplane.airspeed);
  const altitudeFt = Math.round(biplane.position.y * 3.28084);
  const throttlePct = Math.round(biplane.throttle * 100);
  const pitchDeg = Math.round((biplane.rotation.x * 180) / Math.PI);
  const rollDeg = Math.round((biplane.rotation.z * 180) / Math.PI);

  const handleDropFlare = () => {
    biplane.dropFlare();
    game.quest.showNotification(`🛩️ FLARE DROPPED (${biplane.flareCount} REMAINING)`);
  };

  const handleSnapPhoto = () => {
    if (biplane.snapAerialPhoto()) {
      game.quest.addItem({
        id: `photo_aerial_${Date.now()}`,
        name: `Aerial Survey Plate #${biplane.photosTaken}`,
        category: 'artifact',
        description: `Glass-plate aerial survey negative taken from the cockpit at ${altitudeFt}ft MSL.`,
        lore: 'Captured during the 1928 Curtiss Falcon valley flyover.',
        iconName: 'Camera',
      });
      game.quest.showNotification('📷 AERIAL SURVEY PHOTO CAPTURED & FILED!');
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 select-none font-mono">
      {/* Top Cockpit Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-2xl border border-amber-600/60 bg-stone-950/80 px-4 py-2 backdrop-blur-md shadow-xl">
          <Plane className="h-5 w-5 text-amber-400" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block">
              1928 CURTISS "FALCON" BIPLANE
            </span>
            <span className="font-cinzel text-xs font-bold text-stone-200">
              AERIAL RECONNAISSANCE SQUADRON
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleDropFlare}
            disabled={biplane.flareCount <= 0}
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/60 bg-stone-900/90 px-3.5 py-2 text-xs font-bold text-orange-300 shadow-xl hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
          >
            <Flame className="h-4 w-4" />
            <span>DROP FLARE ({biplane.flareCount})</span>
          </button>

          <button
            onClick={handleSnapPhoto}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/60 bg-stone-900/90 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-xl hover:bg-stone-800 cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>SNAP AERIAL PHOTO</span>
          </button>

          <button
            onClick={() => game.dismountBiplane()}
            className="flex items-center gap-1.5 rounded-xl border border-red-600/60 bg-stone-900/90 px-3.5 py-2 text-xs font-bold text-red-300 shadow-xl hover:bg-stone-800 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>LAND & EXIT [X]</span>
          </button>
        </div>
      </div>

      {/* Flight Control Hints */}
      <div className="flex justify-center">
        <div className="rounded-full bg-stone-950/70 border border-stone-800 px-4 py-1 text-[11px] text-stone-400 backdrop-blur-xs">
          Throttle: [W]/[S] • Pitch: [↑]/[↓] • Roll: [A]/[D] • Rudder: [Q]/[E] • Flare: [Space]
        </div>
      </div>

      {/* Bottom Cockpit Instrument Dials */}
      <div className="flex justify-center">
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-6 rounded-3xl border-2 border-amber-700/60 bg-stone-950/90 p-3 sm:p-4 backdrop-blur-md shadow-2xl">
          {/* Airspeed Dial */}
          <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-amber-900/80 bg-stone-900/80 p-2 shadow-inner">
            <span className="text-[9px] text-amber-500 font-bold">AIRSPEED</span>
            <span className="text-lg sm:text-xl font-bold text-stone-100">{airspeed}</span>
            <span className="text-[9px] text-stone-400">KNOTS</span>
          </div>

          {/* Altimeter Dial */}
          <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-amber-900/80 bg-stone-900/80 p-2 shadow-inner">
            <span className="text-[9px] text-amber-500 font-bold">ALTITUDE</span>
            <span className="text-lg sm:text-xl font-bold text-stone-100">{altitudeFt}</span>
            <span className="text-[9px] text-stone-400">FT MSL</span>
          </div>

          {/* Artificial Horizon Gyro */}
          <div className="relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-amber-900/80 bg-stone-900/80 p-2 overflow-hidden shadow-inner">
            <span className="text-[8px] text-amber-500 font-bold mb-1">HORIZON</span>
            <div
              className="w-12 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-transform duration-75"
              style={{ transform: `rotate(${-rollDeg}deg) translateY(${pitchDeg * 0.5}px)` }}
            />
            <span className="text-[9px] text-stone-400 mt-1">P:{pitchDeg}° R:{rollDeg}°</span>
          </div>

          {/* Throttle Lever */}
          <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-amber-900/80 bg-stone-900/80 p-2 shadow-inner">
            <span className="text-[9px] text-amber-500 font-bold">THROTTLE</span>
            <span className="text-lg sm:text-xl font-bold text-orange-400">{throttlePct}%</span>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => biplane.adjustThrottle(-0.1)}
                className="p-1 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 text-[10px]"
              >
                -
              </button>
              <button
                onClick={() => biplane.adjustThrottle(0.1)}
                className="p-1 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 text-[10px]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
