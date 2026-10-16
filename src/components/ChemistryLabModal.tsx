/**
 * The Lost Meridian - Archaeologist's Field Chemistry & Reagent Test Bench
 * Chemical analysis, calcite dissolution, copal resin solvent, and patina restoration.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, FlaskConical, Sparkles, Droplets, CheckCircle, Flame } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface ChemistryLabModalProps {
  game: GameManager;
  onClose: () => void;
}

interface SpecimenSubject {
  id: string;
  name: string;
  encrustation: string;
  reagentNeeded: 'acid' | 'solvent' | 'polish';
  cleanProgress: number; // 0..100
  isCleaned: boolean;
  revealedSecret: string;
  icon: string;
}

const INITIAL_SUBJECTS: SpecimenSubject[] = [
  {
    id: 'chem_urn_calcite',
    name: 'Dredged River Amphora',
    encrustation: 'Centuries of heavy calcium carbonate & river silt encrustation',
    reagentNeeded: 'acid',
    cleanProgress: 0,
    isCleaned: false,
    revealedSecret: 'Revealed pure mercury gilding and the royal seal of Priest-King K’uk’ Meridian.',
    icon: '🏺',
  },
  {
    id: 'chem_stele_resin',
    name: 'Petrified Copal Tablet',
    encrustation: 'Rock-hard black copal resin obscuring celestial calendar glyphs',
    reagentNeeded: 'solvent',
    cleanProgress: 0,
    isCleaned: false,
    revealedSecret: 'Revealed astronomical lunar ephemeris predicting the 1928 solar eclipse.',
    icon: '📜',
  },
  {
    id: 'chem_bronze_tarnish',
    name: 'Corroded Astrolabe Gear',
    encrustation: 'Thick green verdigris copper oxidation jamming precision teeth',
    reagentNeeded: 'polish',
    cleanProgress: 0,
    isCleaned: false,
    revealedSecret: 'Revealed a hidden 52-tooth bronze planetary wheel crafted from meteoritic alloy.',
    icon: '⚙️',
  },
];

export const ChemistryLabModal: React.FC<ChemistryLabModalProps> = ({ game, onClose }) => {
  const [subjects, setSubjects] = useState<SpecimenSubject[]>(INITIAL_SUBJECTS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedReagent, setSelectedReagent] = useState<'acid' | 'solvent' | 'polish'>('acid');

  const activeSubject = subjects[selectedIdx];

  const handleApplyReagent = () => {
    audioEngine.playChemicalFizz();

    if (selectedReagent === activeSubject.reagentNeeded) {
      setSubjects((prev) =>
        prev.map((s, idx) => {
          if (idx !== selectedIdx) return s;
          const newProgress = Math.min(100, s.cleanProgress + 25);
          const isNowCleaned = newProgress >= 100;

          if (isNowCleaned && !s.isCleaned) {
            audioEngine.playItemDiscovery();
            game.quest.showNotification(`🧪 ${s.name.toUpperCase()} FULLY CLEANSED & RESTORED!`);
          }

          return {
            ...s,
            cleanProgress: newProgress,
            isCleaned: isNowCleaned,
          };
        })
      );
    } else {
      game.quest.showNotification('INCORRECT REAGENT — INEFFECTIVE ON THIS ENCRUSTATION');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16120e] shadow-2xl">
        {/* Left: Chemistry Workstage & Pipette Minigame */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#211a14] to-[#120d09] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              BASE CAMP EXPEDITION LABORATORY • APPARATUS
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              FIELD CHEMISTRY & RESTORATION BENCH
            </h2>
          </div>

          {/* Specimen Inspection Tray */}
          <div className="relative flex flex-col items-center my-6">
            <div className="relative w-44 h-44 rounded-2xl border-2 border-amber-900/60 bg-[#1a140f] flex items-center justify-center shadow-inner overflow-hidden">
              <span className="text-6xl">{activeSubject.icon}</span>

              {/* Encrustation Grime Overlay */}
              {!activeSubject.isCleaned && (
                <div
                  className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center transition-all duration-300 pointer-events-none"
                  style={{ opacity: (100 - activeSubject.cleanProgress) / 100 }}
                >
                  <span className="text-stone-400 font-mono text-[10px] uppercase tracking-wider text-center px-4">
                    [ENCRUSTED]
                  </span>
                </div>
              )}

              {/* Cleaned Glimmer Effect */}
              {activeSubject.isCleaned && (
                <div className="absolute inset-0 border-2 border-amber-400/80 rounded-2xl shadow-[inset_0_0_20px_rgba(245,158,11,0.5)] pointer-events-none animate-pulse" />
              )}
            </div>

            {/* Cleaning Progress Bar */}
            <div className="w-56 mt-4 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-stone-400">
                <span>RESTORATION PROGRESS</span>
                <span className="text-amber-400 font-bold">{activeSubject.cleanProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-900 border border-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                  style={{ width: `${activeSubject.cleanProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reagent Pipette Bar */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedReagent('acid');
                  audioEngine.playSfx('click');
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedReagent === 'acid'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-1 ring-rose-400'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850'
                }`}
              >
                <Droplets className="h-3.5 w-3.5 text-rose-400" />
                <span>10% Hydrochloric Acid</span>
              </button>

              <button
                onClick={() => {
                  setSelectedReagent('solvent');
                  audioEngine.playSfx('click');
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedReagent === 'solvent'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-400'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5 text-amber-400" />
                <span>Citric Copal Solvent</span>
              </button>

              <button
                onClick={() => {
                  setSelectedReagent('polish');
                  audioEngine.playSfx('click');
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedReagent === 'polish'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ammonia Bronze Polish</span>
              </button>
            </div>

            <button
              onClick={handleApplyReagent}
              disabled={activeSubject.isCleaned}
              className={`w-full py-3 rounded-xl font-cinzel text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeSubject.isCleaned
                  ? 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer'
              }`}
            >
              <Droplets className="h-4 w-4" />
              <span>
                {activeSubject.isCleaned
                  ? 'SPECIMEN FULLY RESTORED'
                  : 'APPLY REAGENT WITH PIPETTE & SCRUB'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Specimen Catalog & Revealed Secrets */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#19140f] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                ENCRUSTED SPECIMENS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Select a specimen to analyze mineral corrosion and dissolve patina.
              </p>
            </div>

            <div className="space-y-2">
              {subjects.map((sub, idx) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedIdx(idx);
                    audioEngine.playSfx('click');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    idx === selectedIdx
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{sub.icon}</span>
                    <div>
                      <div className="font-cinzel text-xs font-bold">{sub.name}</div>
                      <span className="text-[10px] font-mono text-stone-500">
                        {sub.isCleaned ? 'Restored' : `${sub.cleanProgress}% cleaned`}
                      </span>
                    </div>
                  </div>
                  {sub.isCleaned && (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Revealed Secret Field Box */}
            <div className="rounded-xl border border-amber-900/50 bg-[#1f1913] p-3 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                {activeSubject.isCleaned ? '✦ REVEALED INSCRIPTION:' : 'ENCRUSTATION ANALYSIS:'}
              </span>
              <p className="text-xs font-serif text-stone-300 italic leading-relaxed">
                {activeSubject.isCleaned
                  ? `"${activeSubject.revealedSecret}"`
                  : activeSubject.encrustation}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              RETURN TO CAMP
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
