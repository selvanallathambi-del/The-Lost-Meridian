/**
 * The Lost Meridian - Pythagorean Acoustic Tuning Forks & Echo-Sonar Resonance
 * Brass harmonic tuning forks that emit resonant pure acoustic frequencies and 3D cave sonar wavefronts.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Sparkles, Activity, Volume2, Radio } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface TuningForkModalProps {
  game: GameManager;
  onClose: () => void;
}

interface ForkSpec {
  freq: number; // Hz
  name: string;
  harmonic: string;
  resonanceLore: string;
  color: string;
}

const FORKS: ForkSpec[] = [
  {
    freq: 432,
    name: 'Alpha Fork • Earth Fundamental',
    harmonic: 'A = 432 Hz • Natural Golden Ratio Tuning',
    resonanceLore: 'Harmonizes with subterranean limestone cave resonance and the natural vibration of running waters.',
    color: '#fbbf24',
  },
  {
    freq: 648,
    name: 'Beta Fork • Celestial Fifth',
    harmonic: 'E = 648 Hz • Pythagorean Perfect Fifth',
    resonanceLore: 'Vibrates in sympathy with the solar prisms of the Grand Temple, illuminating inscribed astronomical steles.',
    color: '#38bdf8',
  },
  {
    freq: 972,
    name: 'Gamma Fork • Meridian Keystole Overtone',
    harmonic: 'B = 972 Hz • Subterranean Sanctuary Octave',
    resonanceLore: 'Resonates directly with the rotating armillary rings of the Deep Meridian Core, causing ancient basalt to hum.',
    color: '#c084fc',
  },
];

export const TuningForkModal: React.FC<TuningForkModalProps> = ({ game, onClose }) => {
  const [activeFork, setActiveFork] = useState<ForkSpec>(FORKS[0]);
  const [isStriking, setIsStriking] = useState(false);

  const handleStrike = (fork: ForkSpec) => {
    setActiveFork(fork);
    setIsStriking(true);
    audioEngine.playTuningFork(fork.freq);

    // Trigger visual sonar wavefront in 3D scene
    game.triggerSonarWavefront(fork.freq);
    game.quest.showNotification(`🔔 ACOUSTIC RESONANCE: ${fork.freq} Hz EMITTED`);

    setTimeout(() => {
      setIsStriking(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-500/50 bg-[#12100e] shadow-2xl">
        {/* Left: Brass Tuning Fork Strikers */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#181410] to-[#0c0a08] relative">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              PYTHAGOREAN ACOUSTIC RESONANCE
            </span>
            <h2 className="font-cinzel text-lg font-bold text-amber-200 tracking-wider">
              DR. STERLING'S HARMONIC TUNING FORKS
            </h2>
            <span className="text-[11px] font-mono text-stone-400">
              Calibrated Phosphor-Bronze • London 1928
            </span>
          </div>

          {/* Three Physical Tuning Forks Display */}
          <div className="flex items-end justify-center gap-8 my-4">
            {FORKS.map((fork, idx) => {
              const isSelected = activeFork.freq === fork.freq;
              const heightClass = idx === 0 ? 'h-52' : idx === 1 ? 'h-44' : 'h-36';

              return (
                <div key={fork.freq} className="flex flex-col items-center">
                  <button
                    onClick={() => handleStrike(fork)}
                    className={`relative w-16 ${heightClass} rounded-2xl border-4 transition-all duration-150 flex flex-col items-center justify-between py-2 cursor-pointer shadow-xl ${
                      isSelected && isStriking
                        ? 'translate-y-1 bg-amber-400 border-white shadow-[0_0_30px_#fbbf24]'
                        : isSelected
                        ? 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-400'
                        : 'bg-stone-900 border-stone-700 hover:border-amber-600/70 hover:bg-stone-850'
                    }`}
                  >
                    {/* Tines */}
                    <div className="flex gap-2 w-full justify-center pt-1">
                      <div className="w-2 h-14 bg-gradient-to-t from-amber-500 to-amber-200 rounded-t-sm shadow-sm" />
                      <div className="w-2 h-14 bg-gradient-to-t from-amber-500 to-amber-200 rounded-t-sm shadow-sm" />
                    </div>

                    {/* Stem */}
                    <div className="w-2.5 h-16 bg-gradient-to-b from-amber-600 to-amber-900 rounded-b shadow-sm" />

                    <span className="text-[10px] font-mono font-bold text-stone-200">
                      {fork.freq} Hz
                    </span>
                  </button>

                  <span className="font-cinzel text-[11px] font-bold text-amber-300 mt-3">
                    {fork.name.split('•')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-stone-400 bg-stone-900/80 px-4 py-2 rounded-full border border-stone-800">
            <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Click any fork to strike and project an acoustic sonar wave across the valley.</span>
          </div>
        </div>

        {/* Right Sidebar: Frequency Acoustics & Subterranean Echo Info */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                ACOUSTIC HARMONICS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Physical sound frequency interaction with subterranean stone.
              </p>
            </div>

            {/* Active Fork Details Card */}
            <div className="rounded-xl border border-amber-700/50 bg-stone-900/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-xs font-bold text-amber-200">
                  {activeFork.name}
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {activeFork.freq} Hz
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 block">
                {activeFork.harmonic}
              </span>
              <p className="text-xs font-serif text-stone-300 leading-relaxed italic pt-1">
                "{activeFork.resonanceLore}"
              </p>
            </div>

            {/* In-Game Sonar Wave Utility */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-3.5 space-y-1.5 text-stone-400 text-xs">
              <span className="font-cinzel font-bold text-amber-400 text-[11px] block">
                3D ECHO-SONAR UTILITY:
              </span>
              <p className="text-[11px] leading-relaxed">
                Striking a tuning fork sends a glowing sonar wave out to 60 meters, causing dark cave walls, hidden glyph reliefs, and resonant chambers to reverberate with acoustic phosphorescence!
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 py-2.5 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              <span>RETURN TO EXPEDITION</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
