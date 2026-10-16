/**
 * The Lost Meridian - Grand Solstice Finale & Expedition Victory Screen
 * Official 1928 Royal Geographical Society Telegram, Scorecard, and Epilogue.
 */

import React from 'react';
import { GameManager } from '../game/GameManager';
import { Award, Compass, Sparkles, Map, Camera, RefreshCw, CheckCircle2, Trophy, Sun, Play } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface FinaleModalProps {
  game: GameManager;
  onContinueSandbox: () => void;
  onRestartExpedition: () => void;
}

export const FinaleModal: React.FC<FinaleModalProps> = ({
  game,
  onContinueSandbox,
  onRestartExpedition,
}) => {
  const inventoryCount = game.quest.inventory.length;
  const docsCount = game.quest.documents.filter((d) => d.read).length;
  const photosCount = game.capturedPhotos.length + game.biplaneSystem.photosTaken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border-2 border-amber-500/80 bg-[#14100b] shadow-[0_0_50px_rgba(245,158,11,0.35)] p-6 sm:p-8">
        {/* Top Victory Banner */}
        <div className="text-center space-y-2 border-b border-amber-800/60 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/60 bg-amber-950/80 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-widest shadow-lg">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>EXPEDITION CONCLUDED • 1928 MERIDIAN SOLSTICE ALIGNED</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-amber-100 tracking-wider">
            THE LOST MERIDIAN AWAKENS
          </h1>

          <p className="font-serif italic text-sm text-stone-300 max-w-xl mx-auto">
            "The celestial light paths converge at last. The ancient civilization's forgotten planetary archive has been illuminated for the modern age."
          </p>
        </div>

        {/* 1928 Royal Geographical Society Telegram */}
        <div className="my-6 rounded-2xl border-2 border-dashed border-amber-700/60 bg-[#1e150d] p-5 font-mono text-xs text-amber-200/90 shadow-inner space-y-2">
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2 text-[10px] text-amber-400 uppercase tracking-wider">
            <span>WESTERN UNION • IMPERIAL CABLEGRAM</span>
            <span>LONDON 14:30 GMT • OCT 5, 1928</span>
          </div>
          <div className="text-stone-300 leading-relaxed font-mono text-xs uppercase pt-1">
            TO: DR. AUSTIN STERLING, PERUVIAN EXPEDITION BASECAMP<br />
            MESSAGE: ROYAL GEOGRAPHICAL SOCIETY CONFIRMS RECEIPT OF TRIANGULATED MERIDIAN CHARTS AND CELESTIAL PHOTOMETRIC PLATES. PROFESSOR VANCE HAS BEEN SAFELY EXTRACTED FROM THE UPPER RIDGE. YOUR FIELD DISCOVERIES DEEMED GREATEST ARCHAEOLOGICAL BREAKTHROUGH OF THE CENTURY. CONGRATULATIONS TO THE ENTIRE FIELD PARTY.
          </div>
        </div>

        {/* Expedition Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
          <div className="rounded-2xl border border-amber-900/60 bg-stone-900/80 p-3.5 text-center flex flex-col items-center">
            <Sparkles className="h-5 w-5 text-amber-400 mb-1" />
            <span className="font-mono text-xl font-bold text-amber-200">{inventoryCount}</span>
            <span className="font-mono text-[10px] text-stone-400 uppercase">Relics & Artifacts</span>
          </div>

          <div className="rounded-2xl border border-amber-900/60 bg-stone-900/80 p-3.5 text-center flex flex-col items-center">
            <Map className="h-5 w-5 text-emerald-400 mb-1" />
            <span className="font-mono text-xl font-bold text-emerald-300">{docsCount} / 6</span>
            <span className="font-mono text-[10px] text-stone-400 uppercase">Field Dossiers</span>
          </div>

          <div className="rounded-2xl border border-amber-900/60 bg-stone-900/80 p-3.5 text-center flex flex-col items-center">
            <Camera className="h-5 w-5 text-sky-400 mb-1" />
            <span className="font-mono text-xl font-bold text-sky-300">{photosCount}</span>
            <span className="font-mono text-[10px] text-stone-400 uppercase">Photos & Plates</span>
          </div>

          <div className="rounded-2xl border border-amber-900/60 bg-stone-900/80 p-3.5 text-center flex flex-col items-center">
            <Compass className="h-5 w-5 text-orange-400 mb-1" />
            <span className="font-mono text-xl font-bold text-orange-300">100%</span>
            <span className="font-mono text-[10px] text-stone-400 uppercase">Valley Explored</span>
          </div>
        </div>

        {/* Archeological Honor Citation */}
        <div className="rounded-2xl border border-amber-600/60 bg-[#24190f] p-4 my-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-500/20 flex items-center justify-center shrink-0 shadow-lg">
            <Award className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              AWARDED FELLOWSHIP & TITLE:
            </span>
            <span className="font-cinzel text-sm sm:text-base font-bold text-amber-100">
              Commander of the Order of the Solstice • Fellow of the Royal Geographical Society
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onRestartExpedition}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-cinzel text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>RESTART EXPEDITION</span>
          </button>

          <button
            onClick={onContinueSandbox}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel text-xs font-black shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sun className="h-4 w-4" />
            <span>CONTINUE IN FREE-ROAM SANDBOX (GOLDEN HOUR)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
