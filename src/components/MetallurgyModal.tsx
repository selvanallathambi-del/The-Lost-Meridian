/**
 * The Lost Meridian - 1928 Expedition Field Metallurgy & Smelting Forge
 * Kerosene bellows crucible, alloy formulating, mold pouring, and water quenching.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Flame, Wind, Sparkles, CheckCircle2, ShieldCheck, Hammer, Droplets } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface MetallurgyModalProps {
  game: GameManager;
  onClose: () => void;
}

interface CastingProject {
  id: string;
  name: string;
  minTemp: number; // °C
  alloyRecipe: string;
  moldType: string;
  lore: string;
  rewardId: string;
  rewardName: string;
}

const PROJECTS: CastingProject[] = [
  {
    id: 'cast_orichalcum_gear',
    name: 'Orichalcum Planetary Gear Wheel',
    minTemp: 1050,
    alloyRecipe: '80% Copper Ore + 20% Meteoric Iron Ingot',
    moldType: 'Two-Part Green Sand Involute Mold',
    lore: 'A replacement 36-tooth precision planetary gear required to drive the Sun Temple Orrery.',
    rewardId: 'item_orichalcum_gear',
    rewardName: 'Orichalcum Planetary Gear',
  },
  {
    id: 'cast_corinthian_key',
    name: 'Corinthian Bronze Glyphic Key',
    minTemp: 920,
    alloyRecipe: '88% Copper Ore + 12% Tin Ingot',
    moldType: 'Lost-Wax Investment Flask Mold',
    lore: 'An intricate three-bitted bronze key engraved with the double-headed serpent glyph.',
    rewardId: 'item_corinthian_key',
    rewardName: 'Corinthian Bronze Glyphic Key',
  },
  {
    id: 'cast_stannite_reed',
    name: 'Stannite Acoustic Resonance Reed',
    minTemp: 750,
    alloyRecipe: '60% Tin Ingot + 40% Native Silver Leaf',
    moldType: 'Chill-Hardened Open Ingot Mold',
    lore: 'A micro-tuned vibrational acoustic reed designed to excite the Chladni resonance table.',
    rewardId: 'item_stannite_reed',
    rewardName: 'Stannite Acoustic Resonance Reed',
  },
];

type CastStage = 'heating' | 'pouring' | 'quenching' | 'finished';

export const MetallurgyModal: React.FC<MetallurgyModalProps> = ({ game, onClose }) => {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [temperature, setTemperature] = useState(620); // 20..1200 °C
  const [castStage, setCastStage] = useState<CastStage>('heating');
  const [completedCasts, setCompletedCasts] = useState<Record<string, boolean>>({});

  const currentProject = PROJECTS[activeProjectIdx];
  const isTempSufficient = temperature >= currentProject.minTemp;
  const isCastCompleted = !!completedCasts[currentProject.id];

  const handlePumpBellows = () => {
    audioEngine.playBellowsBlast();
    setTemperature((t) => Math.min(1200, t + 65));
  };

  const handlePourMold = () => {
    if (!isTempSufficient || isCastCompleted) return;
    audioEngine.playMoltenPour();
    setCastStage('pouring');

    setTimeout(() => {
      setCastStage('quenching');
    }, 1800);
  };

  const handleQuench = () => {
    audioEngine.playQuenchHiss();
    audioEngine.playBoneRestored();

    const updated = { ...completedCasts, [currentProject.id]: true };
    setCompletedCasts(updated);
    setCastStage('finished');

    game.quest.addItem({
      id: currentProject.rewardId,
      name: currentProject.rewardName,
      category: 'artifact',
      description: currentProject.lore,
      lore: `Cast in the 1928 expedition field forge at ${temperature}°C.`,
      iconName: 'Sparkles',
    });

    game.quest.showNotification(`🪓 CAST COMPLETE: ${currentProject.rewardName.toUpperCase()}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16100c] shadow-2xl">
        {/* Left: Smelting Crucible & Mold Bay */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#24170f] to-[#0f0a07] relative">
          <div>
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-orange-500 uppercase">
                  1928 FIELD METALLURGY & ALLOY FOUNDRY
                </span>
                <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
                  KEROSENE-BELLOWS SMELTING FORGE
                </h2>
              </div>
              <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>

            {/* Molten Crucible Visualizer */}
            <div className="relative my-6 h-52 rounded-3xl border border-orange-900/60 bg-[#1e120b] p-6 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              {/* Crucible Pot Glow */}
              <div
                className="w-32 h-32 rounded-full border-4 border-orange-600/70 flex flex-col items-center justify-center transition-all duration-500 shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                style={{
                  backgroundColor: temperature > 900 ? '#ea580c' : temperature > 600 ? '#b45309' : '#78350f',
                }}
              >
                <span className="font-mono text-xl font-bold text-white drop-shadow">
                  {temperature}°C
                </span>
                <span className="font-mono text-[9px] text-amber-200 font-bold mt-0.5">
                  CRUCIBLE TEMP
                </span>
              </div>

              {/* Mold State Overlay */}
              {castStage === 'pouring' && (
                <div className="absolute inset-0 bg-orange-950/70 backdrop-blur-xs flex items-center justify-center font-cinzel text-sm font-bold text-amber-200 animate-pulse">
                  POURING MOLTEN ALLOY INTO CASTING MOLD...
                </div>
              )}

              {castStage === 'quenching' && (
                <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center font-cinzel text-sm font-bold text-cyan-300">
                  READY FOR COLD WATER TROUGH QUENCH!
                </div>
              )}

              {castStage === 'finished' && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-cinzel text-[10px] font-bold flex items-center gap-1 shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>CASTING QUENCHED & FINISHED</span>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="rounded-2xl border border-stone-800 bg-[#19110b] p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">
                  ALLOY FORMULATION:
                </span>
                <span className="text-xs font-serif text-stone-200">{currentProject.alloyRecipe}</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-stone-400">Required: </span>
                <span className={isTempSufficient ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
                  {currentProject.minTemp}°C
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handlePumpBellows}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-stone-950 font-cinzel text-xs font-bold shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wind className="h-4 w-4" />
              <span>PUMP AIR BELLOWS (+65°C)</span>
            </button>

            {castStage === 'quenching' ? (
              <button
                onClick={handleQuench}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-cinzel text-xs font-bold shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-bounce"
              >
                <Droplets className="h-4 w-4" />
                <span>QUENCH IN WATER TROUGH</span>
              </button>
            ) : (
              <button
                onClick={handlePourMold}
                disabled={!isTempSufficient || isCastCompleted || castStage === 'pouring'}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-35 text-stone-950 font-cinzel text-xs font-bold shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="h-4 w-4" />
                <span>POUR INTO SAND MOLD</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Casting Projects */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#19110a] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                FOUNDRY CASTING PROJECTS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Select an ancient mechanical replacement to cast.
              </p>
            </div>

            {/* Projects List */}
            <div className="space-y-2">
              {PROJECTS.map((pj, idx) => {
                const isSelected = idx === activeProjectIdx;
                const isDone = completedCasts[pj.id];
                return (
                  <button
                    key={pj.id}
                    onClick={() => {
                      setActiveProjectIdx(idx);
                      setCastStage(isDone ? 'finished' : 'heating');
                      audioEngine.playSfx('click');
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-cinzel text-xs font-bold">{pj.name}</div>
                      <span className="font-mono text-[10px] text-orange-400">
                        Min: {pj.minTemp}°C • {pj.moldType}
                      </span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-stone-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Project Lore */}
            <div className="rounded-2xl border border-amber-900/60 bg-[#1d140d] p-3.5 text-xs font-serif italic text-stone-300 leading-relaxed">
              "{currentProject.lore}"
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              LEAVE FOUNDRY FORGE
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
