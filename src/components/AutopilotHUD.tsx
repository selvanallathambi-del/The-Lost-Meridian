/**
 * The Lost Meridian - Autopilot Live Control Overlay & Narration HUD
 */

import React from 'react';
import { GameManager } from '../game/GameManager';
import { Play, Pause, FastForward, SkipForward, X, Bot, Compass, Sparkles } from 'lucide-react';

interface AutopilotHUDProps {
  game: GameManager;
  onUpdate: () => void;
}

export const AutopilotHUD: React.FC<AutopilotHUDProps> = ({ game, onUpdate }) => {
  const ap = game.autopilot;
  if (!ap.isActive) return null;

  const currentWp = ap.getCurrentWaypoint();
  const stageIndex = ap.currentWaypointIndex + 1;
  const totalStages = 8;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 pointer-events-none select-none">
      {/* Top Banner: Autopilot Status & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/50 bg-black/85 p-3.5 sm:px-6 sm:py-3.5 backdrop-blur-md text-stone-200 shadow-2xl pointer-events-auto animate-fade-in">
        {/* Left: Status Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
              <Bot className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-amber-300 uppercase">
                AUTOPILOT DEMO MODE
              </span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 border border-amber-500/30">
                {ap.speedMultiplier}x SPEED
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-stone-400 font-medium">
              Stage {stageIndex} of {totalStages}: {currentWp?.subtitle.replace('🤖 ', '').split(':')[0] || 'Navigating'}
            </div>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="w-full sm:w-48 bg-stone-800/80 rounded-full h-2 overflow-hidden border border-amber-900/40">
          <div
            className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-200 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{ width: `${Math.min(100, (stageIndex / totalStages) * 100)}%` }}
          />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => {
              ap.togglePause();
              onUpdate();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-600/30 hover:border-amber-400 transition-colors cursor-pointer"
            title={ap.isPaused ? 'Resume Demo' : 'Pause Demo'}
          >
            {ap.isPaused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
            <span>{ap.isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Speed Toggle (1x -> 2x -> 4x) */}
          <button
            onClick={() => {
              const nextSpeed = ap.speedMultiplier === 1.0 ? 2.0 : ap.speedMultiplier === 2.0 ? 4.0 : 1.0;
              ap.setSpeed(nextSpeed);
              onUpdate();
            }}
            className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-900/90 px-2.5 py-1.5 text-xs font-mono font-bold text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Cycle Playback Speed"
          >
            <FastForward className="h-3.5 w-3.5 text-amber-400" />
            <span>{ap.speedMultiplier}x</span>
          </button>

          {/* Skip Stage */}
          <button
            onClick={() => {
              ap.nextWaypoint();
              onUpdate();
            }}
            className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-900/90 px-2.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Skip to Next Stage"
          >
            <SkipForward className="h-3.5 w-3.5 text-stone-300" />
            <span className="hidden sm:inline">Skip</span>
          </button>

          {/* Exit Autopilot */}
          <button
            onClick={() => {
              ap.stop();
              onUpdate();
            }}
            className="ml-1 rounded-lg border border-red-500/40 bg-red-950/60 p-1.5 text-red-300 hover:bg-red-900/80 transition-colors cursor-pointer"
            title="Exit Autopilot Demo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Subtitle / Lore Narration Banner */}
      <div className="self-center max-w-2xl w-full mb-4 rounded-xl border border-amber-500/40 bg-black/85 p-4 backdrop-blur-md text-center shadow-2xl animate-fade-in pointer-events-auto">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
          <span className="font-cinzel text-[11px] font-bold uppercase tracking-widest text-amber-400">
            EXPEDITION LORE NARRATION
          </span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-stone-100 leading-relaxed drop-shadow">
          {ap.currentSubtitle || currentWp?.subtitle}
        </p>
      </div>
    </div>
  );
};
