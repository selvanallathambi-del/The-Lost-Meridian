/**
 * The Lost Meridian - 1928 Marconi Long-Wave Spark-Gap Wireless Radio & Telegraph
 * Vacuum tube transceiver, frequency tuning, S-meter needle, and Morse keyer.
 */

import React, { useState, useEffect } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Radio, Volume2, Sparkles, Zap, Key } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface RadioModalProps {
  game: GameManager;
  onClose: () => void;
}

interface RadioStation {
  freq: number; // kHz
  callsign: string;
  title: string;
  morse: string;
  transcript: string;
  clarity: number; // calculated at runtime
}

const STATIONS: Omit<RadioStation, 'clarity'>[] = [
  {
    freq: 210,
    callsign: 'OBL-LIMA',
    title: 'Lima Naval Hydrographic & Weather Station',
    morse: '.-.. .. -- .- / .-- -..-',
    transcript:
      'LIMA METEOROLOGICAL: High-pressure ridge over Andean cordillera dissipating. Heavy tropical mist moving east across the Rio Meridian valley. Navigation advised by ground compass.',
  },
  {
    freq: 345,
    callsign: 'SOS-VANCE',
    title: '1924 Vance Expedition Distress Beacon (Echo)',
    morse: '... --- ... / ...- .- -. -.-. .',
    transcript:
      'DISTRESS REPEAT: This is Percival Vance. Camp overrun by flash floods. Taking refuge in the central pyramid shaft. The stone wheels require celestial alignment before the solstice zenith.',
  },
  {
    freq: 520,
    callsign: 'PAS-LOND',
    title: 'Pan-American Archaeological Society Dispatch',
    morse: '.- .-. -.-. .... / -.. .. ... .--',
    transcript:
      'EXPEDITION DISPATCH: Dr. Sterling, your permit has been ratified. The 1928 equinox occurs at noon today. Ensure the sunray prism is aligned with the subterranean planetarium dome.',
  },
  {
    freq: 760,
    callsign: 'MERIDIAN-EM',
    title: 'Subterranean Meridian Electromagnetic Pulse',
    morse: '--- -- . --. .- / -- . .-. .. -.. .. .- -.',
    transcript:
      'UNEARTHLY RESONANCE: 528 Hz continuous harmonic emission originating from deep basalt bedrock beneath the waterfall plunge pool. Crystalline piezo-electric oscillations detected.',
  },
];

export const RadioModal: React.FC<RadioModalProps> = ({ game, onClose }) => {
  const [frequency, setFrequency] = useState(340); // 150..850 kHz
  const [isKeying, setIsKeying] = useState(false);
  const [transmittedMorse, setTransmittedMorse] = useState('');

  // Find nearest station & signal strength
  let bestStation: (typeof STATIONS)[0] | null = null;
  let highestClarity = 0;

  STATIONS.forEach((st) => {
    const diff = Math.abs(st.freq - frequency);
    if (diff < 20) {
      const cl = Math.max(0, 1 - diff / 20);
      if (cl > highestClarity) {
        highestClarity = cl;
        bestStation = st;
      }
    }
  });

  const handleTune = (newFreq: number) => {
    const clamped = Math.max(150, Math.min(850, Math.round(newFreq)));
    setFrequency(clamped);
    audioEngine.playRadioStatic();
    if (highestClarity > 0.8) {
      audioEngine.playMorseTone(750, 0.08);
    }
  };

  const handleTelegraphKeyDown = () => {
    setIsKeying(true);
    audioEngine.playTelegraphClick();
    audioEngine.playMorseTone(820, 0.15);
    setTransmittedMorse((prev) => (prev.length > 25 ? '.' : prev + '.'));
  };

  const handleTelegraphKeyUp = () => {
    setIsKeying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16120e] shadow-2xl">
        {/* Left: Radio Transceiver Bench */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#221a14] to-[#0f0b08] relative">
          <div>
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
                  1928 MARCONI WIRELESS CO. • SPARK-GAP TUNER
                </span>
                <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
                  LONG-WAVE EXPEDITION TRANSCEIVER
                </h2>
              </div>
              {/* Vacuum Tubes Glow */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-9 rounded-t-full border border-amber-500/40 bg-gradient-to-t from-orange-600 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse"
                    style={{ animationDuration: `${1.2 + i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>

            {/* S-Meter & Frequency Dial */}
            <div className="grid grid-cols-2 gap-4 my-6">
              {/* S-Meter Gauge */}
              <div className="rounded-2xl border border-amber-800/60 bg-[#1a140e] p-4 flex flex-col justify-between shadow-inner">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                  SIGNAL STRENGTH (S-METER)
                </span>
                <div className="relative h-12 flex items-center justify-center">
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 transition-all duration-300"
                      style={{ width: `${Math.round(highestClarity * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-stone-500">
                  <span>S1 (WEAK)</span>
                  <span className="text-amber-300 font-bold">
                    {Math.round(highestClarity * 100)}% CLARITY
                  </span>
                  <span>S9+ (MAX)</span>
                </div>
              </div>

              {/* Frequency Readout */}
              <div className="rounded-2xl border border-amber-800/60 bg-[#1a140e] p-4 flex flex-col justify-between shadow-inner text-center">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                  TUNED FREQUENCY
                </span>
                <div className="font-mono text-3xl font-bold text-amber-300 tracking-wider">
                  {frequency} <span className="text-sm text-amber-500">kHz</span>
                </div>
                <span className="font-mono text-[10px] text-stone-400">
                  LONG-WAVE BAND (150–850 kHz)
                </span>
              </div>
            </div>

            {/* Rotary Frequency Tuning Slider */}
            <div className="space-y-2 rounded-2xl border border-amber-900/60 bg-[#1e1710] p-4">
              <div className="flex justify-between text-xs font-cinzel text-amber-300 font-bold">
                <span>TUNING CAPACITOR VERNIER</span>
                <span className="font-mono">{frequency} kHz</span>
              </div>
              <input
                type="range"
                min="150"
                max="850"
                step="2"
                value={frequency}
                onChange={(e) => handleTune(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
              />
              <div className="flex justify-between gap-2 pt-2">
                {STATIONS.map((st) => (
                  <button
                    key={st.freq}
                    onClick={() => handleTune(st.freq)}
                    className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-amber-900/60 text-[10px] font-mono text-amber-400 cursor-pointer"
                  >
                    {st.freq} kHz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Morse Telegraph Key */}
          <div className="mt-4 pt-4 border-t border-amber-900/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">
                TELEGRAPH KEYER (CLICK / TAP)
              </span>
              <div className="font-mono text-xs text-amber-300 bg-stone-950 px-3 py-1 rounded border border-stone-800 h-6 flex items-center">
                {transmittedMorse || 'TAP KEY TO TRANSMIT...'}
              </div>
            </div>

            <button
              onMouseDown={handleTelegraphKeyDown}
              onMouseUp={handleTelegraphKeyUp}
              className={`px-6 py-3 rounded-2xl border font-cinzel text-xs font-bold transition-all shadow-xl cursor-pointer ${
                isKeying
                  ? 'bg-amber-500 border-amber-300 text-stone-950 scale-95 ring-4 ring-amber-400/50'
                  : 'bg-stone-900 hover:bg-stone-850 border-amber-600 text-amber-300'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-1.5" />
              <span>TAP TELEGRAPH KEY</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Intercepted Broadcasts & Transcripts */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#19140f] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                INTERCEPTED TRANSMISSIONS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Tune dial near transmission carrier frequencies.
              </p>
            </div>

            {bestStation !== null && highestClarity > 0.4 ? (
              <div className="space-y-3 rounded-2xl border border-amber-600/60 bg-[#211a12] p-4 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {(bestStation as (typeof STATIONS)[0]).callsign} ({(bestStation as (typeof STATIONS)[0]).freq} kHz)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                    {Math.round(highestClarity * 100)}% SIGNAL
                  </span>
                </div>

                <div className="font-cinzel text-xs font-bold text-stone-200">
                  {(bestStation as (typeof STATIONS)[0]).title}
                </div>

                <div className="font-mono text-[10px] text-amber-500 tracking-wider">
                  MORSE: {(bestStation as (typeof STATIONS)[0]).morse}
                </div>

                <div className="rounded-xl border border-amber-900/40 bg-stone-950/80 p-2.5 text-xs font-serif text-stone-300 italic leading-relaxed">
                  "{(bestStation as (typeof STATIONS)[0]).transcript}"
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-800 p-6 text-center text-stone-500 font-mono text-xs">
                <Radio className="h-8 w-8 mx-auto mb-2 opacity-40 text-amber-600" />
                <span>ATMOSPHERIC STATIC...</span>
                <p className="text-[10px] mt-1 text-stone-600">
                  Rotate the tuning vernier to 210, 345, 520, or 760 kHz.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              POWER OFF WIRELESS
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
