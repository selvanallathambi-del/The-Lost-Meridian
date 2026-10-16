/**
 * The Lost Meridian - Hydrostatic Counterweight Sarcophagus & Gold Assay Balance Scale
 * Ancient gravimetric balancing, mercury manometer columns, and sarcophagus unlocking.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Scale, Sparkles, CheckCircle2, ShieldCheck, Plus, Minus } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface AssayBalanceModalProps {
  game: GameManager;
  onClose: () => void;
}

interface AssayWeightItem {
  id: string;
  name: string;
  weightOz: number;
  icon: string;
  color: string;
}

const AVAILABLE_WEIGHTS: AssayWeightItem[] = [
  { id: 'gold_nugget', name: 'Pure Gold Ingot', weightOz: 36, icon: '🟡', color: '#f59e0b' },
  { id: 'electrum_bar', name: 'Electrum Alloy Bar', weightOz: 24, icon: '⚪', color: '#e2e8f0' },
  { id: 'jade_disk', name: 'Jade Sun Talisman', weightOz: 18, icon: '🟢', color: '#10b981' },
  { id: 'meteor_iron', name: 'Meteoric Iron Nodule', weightOz: 12, icon: '🟣', color: '#8b5cf6' },
  { id: 'silver_pyrite', name: 'Native Silver Pyrite', weightOz: 6, icon: '🔘', color: '#94a3b8' },
];

const TARGET_WEIGHT = 144; // 144 Troy Ounces (12 Ancient Mina)

export const AssayBalanceModal: React.FC<AssayBalanceModalProps> = ({ game, onClose }) => {
  const [placedWeights, setPlacedWeights] = useState<Record<string, number>>({
    gold_nugget: 2, // 72 oz
    electrum_bar: 1, // 24 oz
    jade_disk: 0,
    meteor_iron: 1, // 12 oz
    silver_pyrite: 0,
  }); // Total initial = 108 oz
  const [isUnlocked, setIsUnlocked] = useState(false);

  const currentTotal = AVAILABLE_WEIGHTS.reduce((acc, item) => {
    return acc + (placedWeights[item.id] || 0) * item.weightOz;
  }, 0);

  const weightDiff = currentTotal - TARGET_WEIGHT;
  const tiltAngle = Math.max(-25, Math.min(25, weightDiff * 0.4)); // degrees

  const handleAdd = (id: string) => {
    if (isUnlocked) return;
    audioEngine.playScaleTilt();
    const cur = placedWeights[id] || 0;
    const updated = { ...placedWeights, [id]: cur + 1 };
    setPlacedWeights(updated);
    checkBalance(updated);
  };

  const handleRemove = (id: string) => {
    if (isUnlocked) return;
    const cur = placedWeights[id] || 0;
    if (cur <= 0) return;
    audioEngine.playScaleTilt();
    const updated = { ...placedWeights, [id]: cur - 1 };
    setPlacedWeights(updated);
    checkBalance(updated);
  };

  const checkBalance = (weights: Record<string, number>) => {
    const total = AVAILABLE_WEIGHTS.reduce((acc, item) => {
      return acc + (weights[item.id] || 0) * item.weightOz;
    }, 0);

    if (total === TARGET_WEIGHT) {
      if (!isUnlocked) {
        setIsUnlocked(true);
        audioEngine.playScaleBalanceChime();
        game.quest.addItem({
          id: 'artifact_sun_mask',
          name: 'Royal Sun King Gold Burial Mask',
          category: 'artifact',
          description: 'A solid electrum funerary mask inlaid with lapis lazuli and turquoise eyes.',
          lore: 'Recovered from the opened subterranean sarcophagus after solving the hydrostatic assay balance.',
          iconName: 'Sparkles',
        });
        game.quest.showNotification('⚖️ EXACT GRAVIMETRIC EQUILIBRIUM ACHIEVED! SARCOPHAGUS OPENED!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16110a] shadow-2xl">
        {/* Left: Dual Balance Beam Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#22170d] to-[#0f0a06] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              SUBTERRANEAN MERIDIAN VAULT SARCOPHAGUS
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              HYDROSTATIC ASSAY BALANCE SCALE
            </h2>
          </div>

          {/* Balance Scale Graphical Representation */}
          <div className="relative w-full max-w-md h-56 my-4 flex flex-col items-center justify-center">
            {/* Center Fulcrum Post */}
            <div className="w-4 h-36 rounded-full bg-gradient-to-b from-amber-500 to-stone-800 shadow-md z-10" />
            <div className="w-16 h-4 rounded-full bg-stone-800 -mt-2 z-10 border border-amber-600/50" />

            {/* Rotating Balance Beam */}
            <div
              className="absolute w-72 sm:w-88 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform duration-300 flex items-center justify-between px-2"
              style={{ transform: `rotate(${tiltAngle}deg)` }}
            >
              {/* Left Pan (Target Weight 144 oz) */}
              <div className="relative -bottom-16 -left-3 flex flex-col items-center">
                <div className="w-0.5 h-16 bg-amber-400" />
                <div className="w-24 h-6 rounded-b-2xl border-2 border-amber-400 bg-amber-950/90 shadow-lg flex items-center justify-center">
                  <span className="font-mono text-[10px] text-amber-200 font-bold">144 oz (12 Mina)</span>
                </div>
              </div>

              {/* Right Pan (Player Assay Items) */}
              <div className="relative -bottom-16 -right-3 flex flex-col items-center">
                <div className="w-0.5 h-16 bg-amber-400" />
                <div className="w-24 h-6 rounded-b-2xl border-2 border-amber-400 bg-amber-950/90 shadow-lg flex items-center justify-center">
                  <span className="font-mono text-[10px] text-amber-200 font-bold">{currentTotal} oz</span>
                </div>
              </div>
            </div>

            {/* Mercury Manometer Column */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-xl border border-cyan-800/80 bg-stone-900/90 px-3 py-1 text-[10px] font-mono">
              <span className="text-cyan-400 font-bold">MERCURY:</span>
              <span className={weightDiff === 0 ? 'text-emerald-400 font-bold' : 'text-stone-300'}>
                {Math.abs(weightDiff)} mmHg {weightDiff === 0 ? '✓' : weightDiff > 0 ? '(HEAVY)' : '(LIGHT)'}
              </span>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="w-full rounded-2xl border border-amber-900/60 bg-[#1e140b] p-3 text-center">
            {isUnlocked ? (
              <div className="text-xs font-cinzel font-bold text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>EQUILIBRIUM ACHIEVED (144 oz = 144 oz)! SARCOPHAGUS UNSEALED!</span>
              </div>
            ) : (
              <span className="font-mono text-xs text-amber-300">
                Target: 144 oz • Current: {currentTotal} oz (Offset: {weightDiff > 0 ? `+${weightDiff}` : weightDiff} oz)
              </span>
            )}
          </div>
        </div>

        {/* Right Sidebar: Assay Items Palette */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#181008] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                ASSAY WEIGHT PALETTE
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Place items on the right scale pan to reach 144 oz.
              </p>
            </div>

            {/* Weights List */}
            <div className="space-y-2">
              {AVAILABLE_WEIGHTS.map((item) => {
                const count = placedWeights[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl border border-stone-800 bg-stone-900/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-cinzel text-xs font-bold text-stone-200">{item.name}</div>
                        <span className="font-mono text-[10px] text-amber-400">{item.weightOz} oz / unit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={count <= 0 || isUnlocked}
                        className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-xs font-bold w-4 text-center">{count}</span>
                      <button
                        onClick={() => handleAdd(item.id)}
                        disabled={isUnlocked}
                        className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-stone-950 flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE ASSAY BALANCE
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
