/**
 * The Lost Meridian - Field Paleontology & Fossil Preparation Laboratory
 * Dental chisel, camelhair dusters, acetic acid etching, and plaster stabilization.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Sparkles, CheckCircle2, ShieldCheck, Hammer, Brush, FlaskConical, Bandage } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface PaleontologyModalProps {
  game: GameManager;
  onClose: () => void;
}

interface FossilSpecimen {
  id: string;
  name: string;
  era: string;
  rockMatrix: string;
  icon: string;
  description: string;
  lore: string;
}

const SPECIMENS: FossilSpecimen[] = [
  {
    id: 'fossil_megatherium',
    name: 'Megatherium Ground Sloth Talon',
    era: 'Pleistocene Epoch (~12,000 BP)',
    rockMatrix: 'Dense River Calcite Siltstone',
    icon: '🦴',
    description: 'A massive curved fossilized ungual claw from an extinct 4-ton giant ground sloth.',
    lore: 'Discovered lodged in the riverbank sediment strata near Base Camp.',
  },
  {
    id: 'fossil_titanoboa',
    name: 'Titanoboa Constrictor Vertebra',
    era: 'Paleocene Epoch (~58 Mya)',
    rockMatrix: 'Bituminous Tropical Mudstone',
    icon: '🐍',
    description: 'A massive thoracic vertebra belonging to the largest prehistoric serpent in Earth history.',
    lore: 'Excavated from the deep subterranean limestone fissure.',
  },
  {
    id: 'fossil_trilobite',
    name: 'Pyritized Crystalline Trilobite Matrix',
    era: 'Ordovician Epoch (~450 Mya)',
    rockMatrix: 'Pyrite-Infused Black Shale',
    icon: '💎',
    description: 'A pristine trilobite carapace replaced with gleaming golden iron pyrite crystals.',
    lore: 'Found within the crystalline geodes of the Meridian Chasm.',
  },
];

type ToolType = 'chisel' | 'brush' | 'acid' | 'plaster';

export const PaleontologyModal: React.FC<PaleontologyModalProps> = ({ game, onClose }) => {
  const [activeSpecimenIdx, setActiveSpecimenIdx] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolType>('chisel');
  const [prepProgress, setPrepProgress] = useState<Record<string, { chisel: number; brush: number; acid: number; stabilized: boolean }>>({
    fossil_megatherium: { chisel: 0, brush: 0, acid: 0, stabilized: false },
    fossil_titanoboa: { chisel: 0, brush: 0, acid: 0, stabilized: false },
    fossil_trilobite: { chisel: 0, brush: 0, acid: 0, stabilized: false },
  });

  const currentSpecimen = SPECIMENS[activeSpecimenIdx];
  const currentProgress = prepProgress[currentSpecimen.id] || { chisel: 0, brush: 0, acid: 0, stabilized: false };

  const isFullyCleaned =
    currentProgress.chisel >= 100 &&
    currentProgress.brush >= 100 &&
    currentProgress.acid >= 100;

  const handleUseTool = () => {
    const updated = { ...prepProgress };
    const cur = { ...updated[currentSpecimen.id] };

    if (activeTool === 'chisel') {
      audioEngine.playChiselChip();
      cur.chisel = Math.min(100, cur.chisel + 25);
    } else if (activeTool === 'brush') {
      audioEngine.playSfx('click');
      cur.brush = Math.min(100, cur.brush + 25);
    } else if (activeTool === 'acid') {
      audioEngine.playAcidSizzle();
      cur.acid = Math.min(100, cur.acid + 25);
    } else if (activeTool === 'plaster') {
      if (isFullyCleaned && !cur.stabilized) {
        audioEngine.playBoneRestored();
        cur.stabilized = true;
        game.quest.addItem({
          id: currentSpecimen.id,
          name: currentSpecimen.name,
          category: 'artifact',
          description: currentSpecimen.description,
          lore: currentSpecimen.lore,
          iconName: 'Sparkles',
        });
        game.quest.showNotification(`🦴 RESTORED & CATALOGED: ${currentSpecimen.name.toUpperCase()}!`);
      }
    }

    updated[currentSpecimen.id] = cur;
    setPrepProgress(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#15120e] shadow-2xl">
        {/* Left: Fossil Preparation Workspace */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#221a12] to-[#0f0b08] relative">
          <div>
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
                  1928 FIELD PALEONTOLOGY LABORATORY
                </span>
                <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
                  FOSSIL PREPARATION BENCH
                </h2>
              </div>
              <span className="text-2xl">{currentSpecimen.icon}</span>
            </div>

            {/* Specimen Matrix Visualizer */}
            <div className="relative my-6 h-48 rounded-3xl border border-amber-900/60 bg-[#1d1610] p-6 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              <div className="text-4xl mb-2 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                {currentSpecimen.icon}
              </div>
              <h3 className="font-cinzel text-base font-bold text-amber-200">
                {currentSpecimen.name}
              </h3>
              <span className="font-mono text-xs text-amber-400 mt-0.5">
                {currentSpecimen.era}
              </span>
              <span className="font-mono text-[10px] text-stone-400 mt-1">
                Matrix: {currentSpecimen.rockMatrix}
              </span>

              {/* Stabilized Ribbon */}
              {currentProgress.stabilized && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-cinzel text-[10px] font-bold flex items-center gap-1 shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>PREPARED & MOUNTED</span>
                </div>
              )}
            </div>

            {/* Preparation Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {/* Matrix Chiseled */}
              <div className="rounded-2xl border border-stone-800 bg-[#19130d] p-3 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-amber-400">
                  <span>CHISEL MATRIX</span>
                  <span>{currentProgress.chisel}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${currentProgress.chisel}%` }} />
                </div>
              </div>

              {/* Dust Brushed */}
              <div className="rounded-2xl border border-stone-800 bg-[#19130d] p-3 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-amber-400">
                  <span>DUST REMOVED</span>
                  <span>{currentProgress.brush}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${currentProgress.brush}%` }} />
                </div>
              </div>

              {/* Acid Etched */}
              <div className="rounded-2xl border border-stone-800 bg-[#19130d] p-3 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-amber-400">
                  <span>ACID DISSOLVED</span>
                  <span>{currentProgress.acid}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${currentProgress.acid}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tool Palette & Action Trigger */}
          <div className="mt-4 pt-4 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Tool Selection Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTool('chisel')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeTool === 'chisel'
                    ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
                title="Dental Chisel"
              >
                <Hammer className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTool('brush')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeTool === 'brush'
                    ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
                title="Camelhair Duster"
              >
                <Brush className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTool('acid')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeTool === 'acid'
                    ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
                title="Dilute Acetic Acid Pipette"
              >
                <FlaskConical className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTool('plaster')}
                disabled={!isFullyCleaned}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-30 ${
                  activeTool === 'plaster'
                    ? 'bg-emerald-500 border-emerald-300 text-stone-950 font-bold'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
                title="Resin & Plaster Stabilizer"
              >
                <Bandage className="h-4 w-4" />
              </button>
            </div>

            {/* Execute Tool Action */}
            <button
              onClick={handleUseTool}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel text-xs font-bold shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              {activeTool === 'chisel' && 'CHIP LIMESTONE MATRIX'}
              {activeTool === 'brush' && 'BRUSH MATRIX DUST'}
              {activeTool === 'acid' && 'APPLY ACETIC ACID'}
              {activeTool === 'plaster' && 'APPLY RESIN STABILIZER'}
            </button>
          </div>
        </div>

        {/* Right Sidebar: Fossil Catalog */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#18130e] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                EXCAVATED SPECIMENS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Select a prehistoric fossil to prepare and stabilize.
              </p>
            </div>

            {/* Specimens List */}
            <div className="space-y-2">
              {SPECIMENS.map((sp, idx) => {
                const isSelected = idx === activeSpecimenIdx;
                const isDone = prepProgress[sp.id]?.stabilized;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setActiveSpecimenIdx(idx);
                      audioEngine.playSfx('click');
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-cinzel text-xs font-bold">{sp.name}</div>
                      <span className="font-mono text-[10px] text-stone-500">{sp.era}</span>
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

            {/* Specimen Lore */}
            <div className="rounded-2xl border border-amber-900/60 bg-[#1c150e] p-3 text-xs font-serif italic text-stone-300 leading-relaxed">
              "{currentSpecimen.lore}"
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE PALEONTOLOGY LAB
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
