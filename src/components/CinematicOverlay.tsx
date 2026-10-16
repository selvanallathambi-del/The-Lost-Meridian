/**
 * The Lost Meridian - Cinematic Letterbox, Subtitles, and Finale Overlay
 */

import React from 'react';
import { GameManager } from '../game/GameManager';
import { QuestStage } from '../game/types';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';

interface CinematicOverlayProps {
  game: GameManager;
  onRestart: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ game, onRestart }) => {
  const isCinematic = game.cinematics.isPlayingCinematic;
  const subtitle = game.quest.currentSubtitle;
  const isChapterComplete = game.quest.currentStage === QuestStage.CHAPTER_COMPLETE;
  const visionFlash = game.cinematics.visionFlashIntensity;

  const handleSkip = () => {
    game.cinematics.skipCinematic();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden">
      {/* Skip Cutscene Button if cinematic playing */}
      {isCinematic && (
        <div className="pointer-events-auto absolute top-6 right-6 z-50">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-cinzel font-bold text-amber-300 backdrop-blur-md border border-amber-500/40 hover:bg-amber-900/60 transition-colors shadow-lg cursor-pointer"
          >
            <span>SKIP CUTSCENE ✕</span>
          </button>
        </div>
      )}

      {/* 3. Celestial Vision Flash Effect */}
      {visionFlash > 0.01 && (
        <div
          className="absolute inset-0 bg-cyan-200 transition-opacity duration-300"
          style={{
            opacity: visionFlash * 0.9,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 4. Subtitles Container */}
      {subtitle && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-2xl px-6 text-center">
          <div className="inline-block rounded-lg bg-black/75 px-5 py-2.5 backdrop-blur-md border border-stone-800/80 shadow-2xl">
            <p className="font-serif text-sm md:text-base font-medium leading-relaxed text-stone-100 italic">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      {/* 5. Chapter I Complete Victory Card */}
      {isChapterComplete && (
        <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8 text-center animate-fade-in text-stone-100">
          <div className="max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#0a1118] p-10 shadow-[0_0_50px_rgba(56,189,248,0.25)] space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400">
                <Sparkles className="h-8 w-8 text-cyan-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase font-mono">
                Expedition Concluded
              </div>
              <h2 className="font-cinzel text-4xl md:text-5xl font-extrabold text-stone-100 text-glow-cyan">
                THE LOST MERIDIAN
              </h2>
              <p className="font-cinzel text-lg text-amber-200">
                CHAPTER I — THE AWAKENING OF THE SUN TEMPLE
              </p>
            </div>

            <p className="font-serif text-sm text-stone-300 leading-relaxed max-w-lg mx-auto italic">
              “The ancient planetary conduits have sparked to life. The subterranean abyss echoes with celestial harmonics, revealing the coordinate coordinates to the next continent...”
            </p>

            <div className="grid grid-cols-3 gap-3 text-xs text-stone-400 font-mono pt-2">
              <div className="rounded-lg bg-black/50 p-3 border border-stone-800">
                <div className="text-cyan-400 font-bold text-sm">2 / 2</div>
                <div>Puzzles Solved</div>
              </div>
              <div className="rounded-lg bg-black/50 p-3 border border-stone-800">
                <div className="text-cyan-400 font-bold text-sm">3 / 3</div>
                <div>Relics Recovered</div>
              </div>
              <div className="rounded-lg bg-black/50 p-3 border border-stone-800">
                <div className="text-cyan-400 font-bold text-sm">100%</div>
                <div>Expedition Synced</div>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={onRestart}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-8 py-3.5 text-sm font-bold text-stone-950 hover:bg-cyan-500 transition-all hover:scale-105 shadow-lg cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>REPLAY EXPEDITION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
