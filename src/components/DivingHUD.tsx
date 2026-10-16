/**
 * The Lost Meridian - 1920s Hard-Hat Copper Diving Helmet HUD
 * Brass pressure gauges, depth indicator, and underwater lantern controls.
 */

import React from 'react';
import { GameManager } from '../game/GameManager';
import { Gauge, Lightbulb, Compass, Waves, X } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface DivingHUDProps {
  game: GameManager;
  onExit: () => void;
}

export const DivingHUD: React.FC<DivingHUDProps> = ({ game, onExit }) => {
  const depth = game.divingSystem.depth;
  const airPressure = Math.round(game.divingSystem.airPressure);

  const toggleLantern = () => {
    game.divingSystem.isLanternOn = !game.divingSystem.isLanternOn;
    game.divingSystem.diverLight.intensity = game.divingSystem.isLanternOn ? 3.5 : 0;
    audioEngine.playSfx('click');
    game.quest.showNotification(
      game.divingSystem.isLanternOn ? '💡 DIVER LANTERN IGNITED' : 'DIVER LANTERN EXTINGUISHED'
    );
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-8">
      {/* Heavy Copper Helmet Oval Viewport Border Vignette */}
      <div className="absolute inset-0 pointer-events-none border-[36px] sm:border-[54px] border-amber-950/60 rounded-[80px] shadow-[inset_0_0_90px_rgba(4,47,46,0.8)]" />

      {/* Top Bar: Depth & Air Pressure Gauges */}
      <div className="relative flex items-center justify-between pointer-events-auto">
        {/* Air Supply Gauge */}
        <div className="flex items-center gap-3 rounded-2xl bg-stone-900/85 px-4 py-2 backdrop-blur-md border border-cyan-800/60 shadow-xl">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Gauge className="h-4 w-4" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              AIR UMBILICAL
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-amber-300">{airPressure} PSI</span>
        </div>

        {/* Depth Gauge */}
        <div className="flex items-center gap-3 rounded-2xl bg-stone-900/85 px-4 py-2 backdrop-blur-md border border-cyan-800/60 shadow-xl">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Waves className="h-4 w-4" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">DEPTH</span>
          </div>
          <span className="font-mono text-sm font-bold text-cyan-200">{depth.toFixed(1)} M</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative flex items-center justify-between pointer-events-auto">
        {/* Lantern Switch */}
        <button
          onClick={toggleLantern}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border backdrop-blur-md transition-all cursor-pointer shadow-lg ${
            game.divingSystem.isLanternOn
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-400'
              : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850'
          }`}
        >
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span className="font-cinzel text-xs font-bold">DIVER LANTERN [L]</span>
        </button>

        {/* Surface & Exit Rig */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-cyan-600/50 text-cyan-200 font-cinzel text-xs font-bold shadow-xl transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span>SURFACE & REMOVE RIG [SPACE]</span>
        </button>
      </div>
    </div>
  );
};
