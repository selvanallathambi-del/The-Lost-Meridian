/**
 * The Lost Meridian - 1928 Antique Sterling & Co. Brass Pocket Watch
 * Real-time analog clock & celestial celestial time scrub controller.
 */

import React from 'react';
import { GameManager } from '../game/GameManager';
import { X, Play, Pause, Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface PocketWatchPopoverProps {
  game: GameManager;
  onClose: () => void;
}

export const PocketWatchPopover: React.FC<PocketWatchPopoverProps> = ({ game, onClose }) => {
  const currentHour = game.timeOfDay;
  const hours = Math.floor(currentHour) % 24;
  const minutes = Math.floor((currentHour % 1) * 60);
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // Analog hands angles
  const hourDeg = (currentHour % 12) * 30 + (minutes / 60) * 30;
  const minuteDeg = (minutes / 60) * 360;

  const getTimePeriodName = (h: number) => {
    if (h >= 5 && h < 7.5) return '🌅 Dawn Twilight';
    if (h >= 7.5 && h < 11.5) return '☀️ Morning Sunlight';
    if (h >= 11.5 && h < 14) return '☀️ High Noon';
    if (h >= 14 && h < 17.5) return '☀️ Golden Afternoon';
    if (h >= 17.5 && h < 20) return '🌇 Crimson Sunset';
    return '🌌 Starlit Midnight';
  };

  const handleSetTime = (h: number) => {
    game.setTimeOfDay(h);
    audioEngine.playSfx('click');
    if (game.onStateChange) game.onStateChange();
  };

  const handleToggleAdvancing = () => {
    game.isTimeAdvancing = !game.isTimeAdvancing;
    audioEngine.playSfx('click');
    if (game.onStateChange) game.onStateChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col items-center max-w-sm w-full rounded-3xl border border-amber-600/50 bg-[#14110e] p-6 shadow-2xl">
        {/* Top Pocket Watch Crown & Loop */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500/80 bg-stone-900" />
          <div className="w-3 h-2 bg-amber-600 rounded-sm -mt-0.5" />
        </div>

        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-amber-900/40 mt-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="font-cinzel text-xs font-bold text-amber-200 tracking-wider">
              STERLING & CO. CHRONOMETER
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Vintage Analog Pocket Watch Face */}
        <div className="relative w-48 h-48 my-5 rounded-full border-4 border-amber-600/70 bg-gradient-to-b from-[#f5ede0] to-[#e4d5be] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center">
          {/* Roman Numerals on Watch Face */}
          {[
            { num: 'XII', deg: 0 },
            { num: 'III', deg: 90 },
            { num: 'VI', deg: 180 },
            { num: 'IX', deg: 270 },
          ].map((item, idx) => (
            <span
              key={idx}
              className="absolute font-serif font-bold text-stone-800 text-[11px] tracking-tight"
              style={{
                transform: `rotate(${item.deg}deg) translate(0, -68px) rotate(${-item.deg}deg)`,
              }}
            >
              {item.num}
            </span>
          ))}

          {/* Subdial / 1928 Brand Mark */}
          <div className="absolute top-12 text-center pointer-events-none">
            <div className="font-cinzel text-[7px] font-bold text-stone-600 tracking-widest">
              EXPEDITION 1928
            </div>
            <div className="text-[6px] font-mono text-stone-500">SECTOR 7 BASIN</div>
          </div>

          {/* Hour Hand */}
          <div
            className="absolute bottom-1/2 left-1/2 w-1.5 h-12 -ml-[3px] bg-stone-900 rounded-full origin-bottom shadow-sm transition-transform duration-200"
            style={{ transform: `rotate(${hourDeg}deg)` }}
          />

          {/* Minute Hand */}
          <div
            className="absolute bottom-1/2 left-1/2 w-1 h-18 -ml-[2px] bg-amber-900 rounded-full origin-bottom shadow-sm transition-transform duration-200"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />

          {/* Center Pin */}
          <div className="relative z-10 w-3 h-3 rounded-full bg-amber-600 border border-stone-900 shadow-sm" />
        </div>

        {/* Digital Readout */}
        <div className="text-center mb-4">
          <div className="font-mono text-2xl font-bold tracking-widest text-amber-300 drop-shadow">
            {timeStr}
          </div>
          <div className="text-xs font-serif text-stone-300 italic mt-0.5">
            {getTimePeriodName(currentHour)}
          </div>
        </div>

        {/* Quick Celestial Time Jumps */}
        <div className="grid grid-cols-4 gap-1.5 w-full mb-4">
          {[
            { label: 'Dawn', h: 6.0, icon: Sunrise },
            { label: 'Noon', h: 12.0, icon: Sun },
            { label: 'Dusk', h: 18.5, icon: Sunset },
            { label: 'Night', h: 0.0, icon: Moon },
          ].map((t) => {
            const Icon = t.icon;
            const isNear = Math.abs(currentHour - t.h) < 1.5;
            return (
              <button
                key={t.label}
                onClick={() => handleSetTime(t.h)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                  isNear
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md shadow-amber-900/20'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 mb-1 text-amber-400" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Scrub Slider */}
        <div className="w-full space-y-1.5 mb-4">
          <div className="flex justify-between text-[10px] font-mono text-stone-400">
            <span>00:00 (Midnight)</span>
            <span>12:00</span>
            <span>23:59</span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="0.25"
            value={currentHour}
            onChange={(e) => handleSetTime(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>

        {/* Flow of Time Play/Pause Toggle */}
        <button
          onClick={handleToggleAdvancing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 border border-amber-800/40 hover:border-amber-500 py-2.5 px-4 text-xs font-medium text-amber-200 transition-colors cursor-pointer"
        >
          {game.isTimeAdvancing ? (
            <>
              <Pause className="h-3.5 w-3.5 text-amber-400" />
              <span>FLOW OF TIME: ACTIVE (ADVANCING)</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-emerald-400" />
              <span>FLOW OF TIME: PAUSED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
