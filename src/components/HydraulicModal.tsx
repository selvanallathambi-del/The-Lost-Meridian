/**
 * The Lost Meridian - Hydraulic Siphon Aqueduct & Clepsydra Water Clock
 * Subterranean cenote sluice gate grid, hydrostatic pressure balancing, and counterweighted floats.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Droplets, RotateCw, CheckCircle2, Waves, ArrowRight, RefreshCw } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface HydraulicModalProps {
  game: GameManager;
  onClose: () => void;
}

export const HydraulicModal: React.FC<HydraulicModalProps> = ({ game, onClose }) => {
  // Initial levels: Chamber A = 80L, Chamber B = 40L, Chamber C = 0L (Total = 120L)
  // Target: 40L in each chamber!
  const [tankA, setTankA] = useState(80);
  const [tankB, setTankB] = useState(40);
  const [tankC, setTankC] = useState(0);
  const [isEquilibriumAchieved, setIsEquilibriumAchieved] = useState(false);

  const transferWater = (
    from: 'A' | 'B' | 'C',
    to: 'A' | 'B' | 'C',
    amount: number
  ) => {
    audioEngine.playWaterValveTurn();
    audioEngine.playWaterSiphonGush();

    let curA = tankA;
    let curB = tankB;
    let curC = tankC;

    const getVal = (t: string) => (t === 'A' ? curA : t === 'B' ? curB : curC);
    const setVal = (t: string, val: number) => {
      if (t === 'A') curA = val;
      if (t === 'B') curB = val;
      if (t === 'C') curC = val;
    };

    const sourceVal = getVal(from);
    const targetVal = getVal(to);
    const maxTransfer = Math.min(amount, sourceVal, 100 - targetVal);

    if (maxTransfer > 0) {
      setVal(from, sourceVal - maxTransfer);
      setVal(to, targetVal + maxTransfer);

      setTankA(curA);
      setTankB(curB);
      setTankC(curC);

      // Check for 40 - 40 - 40 equilibrium
      if (curA === 40 && curB === 40 && curC === 40) {
        if (!isEquilibriumAchieved) {
          setIsEquilibriumAchieved(true);
          audioEngine.playItemDiscovery();
          game.quest.addItem({
            id: 'item_clepsydra_key',
            name: 'Bronze Clepsydra Siphon Key',
            category: 'key',
            description: 'A heavy geared bronze key used to lock the ancient hydraulic floodgates.',
            lore: 'Recovered after balancing the subterranean aqueduct siphon chambers.',
            iconName: 'Key',
          });
          game.quest.showNotification('🌊 HYDROSTATIC EQUILIBRIUM ACHIEVED! SUBMERGED BRIDGE RAISED!');
        }
      }
    }
  };

  const handleReset = () => {
    audioEngine.playWaterValveTurn();
    setTankA(80);
    setTankB(40);
    setTankC(0);
    setIsEquilibriumAchieved(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-600/50 bg-[#0f171c] shadow-2xl">
        {/* Left: 3 Hydrostatic Chambers Chamber Viewport */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#14232c] to-[#0a1014] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              SUBTERRANEAN CENOTE HYDRAULIC GRID
            </span>
            <h2 className="font-cinzel text-xl font-bold text-cyan-200 tracking-wider">
              CLEPSYDRA PRESSURE SIPHON
            </h2>
          </div>

          {/* 3 Water Tank Cylinders */}
          <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 my-6">
            {/* Chamber A */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs font-bold text-cyan-300 mb-1.5">
                CHAMBER A (INFLOW)
              </span>
              <div className="relative w-20 sm:w-24 h-48 rounded-2xl border-2 border-cyan-500/60 bg-[#0d1c24] overflow-hidden flex flex-col justify-end shadow-inner">
                {/* Water Column */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500 relative"
                  style={{ height: `${tankA}%` }}
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-cyan-200/60 animate-pulse" />
                </div>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-white drop-shadow">
                  {tankA} L
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-400 mt-2">
                TARGET: 40 L
              </span>
            </div>

            {/* Chamber B */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs font-bold text-cyan-300 mb-1.5">
                CHAMBER B (SIPHON)
              </span>
              <div className="relative w-20 sm:w-24 h-48 rounded-2xl border-2 border-cyan-500/60 bg-[#0d1c24] overflow-hidden flex flex-col justify-end shadow-inner">
                {/* Water Column */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500 relative"
                  style={{ height: `${tankB}%` }}
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-cyan-200/60 animate-pulse" />
                </div>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-white drop-shadow">
                  {tankB} L
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-400 mt-2">
                TARGET: 40 L
              </span>
            </div>

            {/* Chamber C */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs font-bold text-cyan-300 mb-1.5">
                CHAMBER C (CRYPT)
              </span>
              <div className="relative w-20 sm:w-24 h-48 rounded-2xl border-2 border-cyan-500/60 bg-[#0d1c24] overflow-hidden flex flex-col justify-end shadow-inner">
                {/* Water Column */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500 relative"
                  style={{ height: `${tankC}%` }}
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-cyan-200/60 animate-pulse" />
                </div>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-white drop-shadow">
                  {tankC} L
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-400 mt-2">
                TARGET: 40 L
              </span>
            </div>
          </div>

          {/* Siphon Flow Control Buttons */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => transferWater('A', 'B', 20)}
              disabled={tankA < 20 || tankB > 80}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>A → B (20L)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => transferWater('B', 'C', 20)}
              disabled={tankB < 20 || tankC > 80}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>B → C (20L)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => transferWater('C', 'A', 20)}
              disabled={tankC < 20 || tankA > 80}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md col-span-2 sm:col-span-1"
            >
              <span>C → A (20L)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Instructions & Solved State */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-cyan-900/40 bg-[#111c22] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-cyan-300">
                HYDROSTATIC EQUILIBRIUM
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Balance all 3 chambers to exactly 40 Liters.
              </p>
            </div>

            {/* Status Card */}
            <div className="rounded-2xl border border-cyan-800/60 bg-[#162730] p-4 space-y-2">
              <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block">
                SIPHON SLUICE STATUS:
              </span>
              {isEquilibriumAchieved ? (
                <div className="text-xs font-cinzel font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>EQUILIBRIUM ACHIEVED (40L - 40L - 40L)!</span>
                </div>
              ) : (
                <div className="text-xs font-mono text-stone-300">
                  Current: {tankA}L - {tankB}L - {tankC}L
                </div>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-cyan-900/50 p-3 bg-stone-950/60 text-[11px] font-serif text-stone-300 italic leading-relaxed">
              "The counterweight float will trigger when equal water column head pressure is exerted across all three vertical conduits."
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>RESET SLUICE GATES</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE HYDRAULIC BENCH
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
