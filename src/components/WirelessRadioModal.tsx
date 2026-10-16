/**
 * The Lost Meridian - 1928 Marconi Spark-Gap Wireless Telegraph & Shortwave Radio
 * Interactive vacuum tube frequency tuning, authentic spark-gap Morse telegraph key, and shortwave audio streams.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Radio, Zap, Volume2, Sparkles, Disc } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface WirelessRadioModalProps {
  game: GameManager;
  onClose: () => void;
}

interface RadioStation {
  freq: number; // kHz
  name: string;
  source: string;
  audioTone: number; // Frequency for synthesis
  desc: string;
}

const STATIONS: RadioStation[] = [
  {
    freq: 550,
    name: 'WWOZ New Orleans • 1928 Ragtime Jazz',
    source: 'Commercial Broadcast • New Orleans',
    audioTone: 440,
    desc: 'Upbeat ragtime brass and vintage piano crackling across the atmospheric ionosphere.',
  },
  {
    freq: 830,
    name: 'S.S. Valparaiso • Maritime Distress (SOS)',
    source: 'Pacific Shipping Lane • Emergency Beacon',
    audioTone: 750,
    desc: 'Continuous automated Morse distress beacon transmitting nautical coordinates.',
  },
  {
    freq: 1120,
    name: 'Royal Geographic Society • Expedition Net',
    source: 'London Shortwave Relay • Sector 7',
    audioTone: 600,
    desc: 'Encrypted expedition dispatch verifying Dr. Sterling’s field credentials.',
  },
  {
    freq: 1450,
    name: 'Subterranean Meridian Core Resonance',
    source: 'Ancient Keystone Antechamber',
    audioTone: 220,
    desc: 'Eerie, rhythmic celestial electromagnetic oscillations pulsing from deep below.',
  },
];

export const WirelessRadioModal: React.FC<WirelessRadioModalProps> = ({ game, onClose }) => {
  const [frequency, setFrequency] = useState(1120);
  const [isSparking, setIsSparking] = useState(false);
  const [morseTape, setMorseTape] = useState('... --- ...  -- . .-. .. -.. .. .- -.');
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);

  useEffect(() => {
    // Check if frequency is locked onto a station (within 25 kHz)
    const match = STATIONS.find((s) => Math.abs(s.freq - frequency) <= 25);
    setActiveStation(match || null);
  }, [frequency]);

  const handleTune = (newFreq: number) => {
    setFrequency(newFreq);
    audioEngine.playRadioTuneStatic();
  };

  const handleTapMorseKey = () => {
    setIsSparking(true);
    const tones = [720, 800, 850];
    const chosenTone = tones[Math.floor(Math.random() * tones.length)];
    audioEngine.playMorseSparkKey(chosenTone);

    const chars = ['.', '-', ' '];
    const c = chars[Math.floor(Math.random() * chars.length)];
    setMorseTape((prev) => (prev + c).slice(-32));

    setTimeout(() => {
      setIsSparking(false);
    }, 120);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTapMorseKey();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left: 1928 Marconi Vacuum Tube & Galvanometer Tuning Console */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#181410] to-[#0c0a08] relative">
          <div className="text-center mb-4">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              MARCONI WIRELESS TELEGRAPH CO. • 1928
            </span>
            <h2 className="font-cinzel text-lg font-bold text-amber-200 tracking-wider">
              SPARK-GAP TRANSMITTER & RECEIVER
            </h2>
            <span className="text-[11px] font-mono text-stone-400">
              Type 107 Shortwave Tuner • Sector Communications
            </span>
          </div>

          {/* Triode Vacuum Tubes Glow Row */}
          <div className="flex items-center gap-6 mb-6">
            {[1, 2, 3].map((tubeIdx) => (
              <div
                key={tubeIdx}
                className="relative w-12 h-20 rounded-t-full border-2 border-stone-600/60 bg-stone-900/60 flex flex-col items-center justify-end pb-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {/* Glowing Filament */}
                <div className="w-1.5 h-10 rounded-full bg-gradient-to-t from-amber-600 to-amber-300 animate-pulse shadow-[0_0_12px_#f59e0b]" />
                <div className="w-8 h-3 rounded-b bg-stone-800 border-t border-stone-700 mt-1" />
              </div>
            ))}
          </div>

          {/* Analog Tuning Ribbon / Galvanometer */}
          <div className="w-full max-w-md bg-stone-950/80 rounded-2xl border-2 border-amber-800/60 p-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono text-amber-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-amber-400" />
                <span>FREQUENCY</span>
              </span>
              <span className="text-base font-bold tracking-wider">{frequency} kHz</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={500}
              max={1600}
              step={10}
              value={frequency}
              onChange={(e) => handleTune(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
            />

            <div className="flex justify-between text-[9px] font-mono text-stone-500 mt-1">
              <span>500 kHz (AM Longwave)</span>
              <span>1000 kHz</span>
              <span>1600 kHz (Shortwave)</span>
            </div>

            {/* Reception Status */}
            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-400">SIGNAL LOCK:</span>
              {activeStation ? (
                <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
                  <Disc className="h-3.5 w-3.5" />
                  {activeStation.name}
                </span>
              ) : (
                <span className="text-xs font-mono text-stone-500 italic">
                  [ Atmospheric Shortwave Static ]
                </span>
              )}
            </div>
          </div>

          {/* Morse Paper Tape Output */}
          <div className="w-full max-w-md mt-4 bg-[#f2e6cb] text-stone-900 rounded-xl px-4 py-2 border border-stone-700 shadow-inner flex items-center justify-between font-mono text-xs overflow-hidden">
            <span className="text-[9px] font-bold tracking-widest text-stone-600 uppercase">
              TELEGRAPH TAPE:
            </span>
            <span className="font-bold tracking-widest truncate ml-2 text-stone-950">
              {morseTape}
            </span>
          </div>
        </div>

        {/* Right Sidebar: Brass Morse Tapper Key & Station Log */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                BRASS TELEGRAPH KEY
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Press [SPACE] or tap the brass knob to broadcast Morse signals.
              </p>
            </div>

            {/* Interactive Brass Morse Key Assembly */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-900 border border-stone-800 relative">
              {/* Spark discharge flash */}
              {isSparking && (
                <div className="absolute top-3 w-8 h-8 rounded-full bg-cyan-400/80 shadow-[0_0_20px_#22d3ee] animate-ping pointer-events-none" />
              )}

              <button
                onPointerDown={handleTapMorseKey}
                className={`relative w-28 h-20 rounded-xl border-4 transition-all duration-75 flex flex-col items-center justify-center cursor-pointer shadow-xl ${
                  isSparking
                    ? 'translate-y-1 bg-amber-500 border-amber-300 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                    : 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-500 text-amber-100 hover:from-amber-500'
                }`}
              >
                <Zap className="h-6 w-6 mb-0.5" />
                <span className="font-cinzel text-xs font-bold">TAP KEY</span>
              </button>

              <span className="text-[9px] font-mono text-stone-400 mt-2">
                High-Voltage Spark Gap
              </span>
            </div>

            {/* Quick Frequency Tuner Shortcuts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-cinzel font-bold text-amber-400 uppercase block">
                KNOWN FREQUENCIES
              </span>
              {STATIONS.map((st) => (
                <button
                  key={st.freq}
                  onClick={() => handleTune(st.freq)}
                  className={`w-full text-left p-2 rounded-xl border text-[11px] font-mono transition-colors cursor-pointer flex items-center justify-between ${
                    frequency === st.freq
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <span className="truncate">{st.name.split('•')[0]}</span>
                  <span className="text-[10px] font-bold text-amber-400 ml-2">{st.freq}k</span>
                </button>
              ))}
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
