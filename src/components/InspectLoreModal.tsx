/**
 * The Lost Meridian - 1928 Archaeological Field Dossier Modal
 * Grounded archival inspection interface displaying high-fidelity hieroglyphic transcriptions,
 * culture dating, architectural blueprints, and field archaeologist margin notes.
 */

import React, { useState } from 'react';
import { InspectLoreData } from '../game/types';
import { GameManager } from '../game/GameManager';
import {
  Scroll,
  BookOpen,
  Volume2,
  X,
  Compass,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  PenTool,
  Check,
} from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface InspectLoreModalProps {
  lore: InspectLoreData;
  game: GameManager;
  onClose: () => void;
}

export const InspectLoreModal: React.FC<InspectLoreModalProps> = ({
  lore,
  game,
  onClose,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedToJournal, setRecordedToJournal] = useState(false);

  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        window.speechSynthesis.cancel();
        const textToRead = `${lore.title}. ${lore.subtitle}. Culture: ${lore.authorOrCulture}. Date: ${lore.dateOrEra}. Translation: ${lore.glyphTranscription || ''}. Archaeological Analysis: ${lore.archaeologicalNotes}. ${lore.description}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.92;
        utterance.pitch = 0.95;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const handleRecordInJournal = () => {
    game.quest.addCustomJournalNote(
      `Archaeological Field Report: ${lore.title}`,
      `[Category: ${lore.category} · Era: ${lore.dateOrEra}]\n${lore.description}\n\nTranslation: ${lore.glyphTranscription || 'N/A'}\n\nField Notes: ${lore.archaeologicalNotes}`
    );
    audioEngine.playSfx('click');
    setRecordedToJournal(true);
    game.quest.showNotification(`✦ ARCHIVED IN FIELD JOURNAL: ${lore.title.toUpperCase()}`);
  };

  const handleOpenInCodex = () => {
    onClose();
    game.isJournalOpen = true;
    game.input.exitPointerLock();
    if (game.onStateChange) game.onStateChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in pointer-events-auto">
      <div className="relative flex max-h-[92vh] sm:max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-amber-600/60 bg-[#161310] text-stone-200 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Archival Parchment Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 bg-[#1f1a15] px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Scroll className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                  ROYAL GEOGRAPHIC SOCIETY · ARCHIVAL DOSSIER
                </span>
                <span className="rounded bg-amber-950/80 px-1.5 py-0.5 text-[9px] font-mono text-amber-300 border border-amber-800/40">
                  {lore.category}
                </span>
              </div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-100">
                {lore.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {'speechSynthesis' in window && (
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
                title="Read Dictation via Gramophone Voice"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isSpeaking ? 'STOP' : 'NARRATE'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Dossier"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-gradient-to-b from-[#161310] to-[#120f0d]">
          {/* Metadata Banner: Era, Culture, Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 rounded-xl bg-stone-950/80 p-3 sm:p-4 border border-amber-900/30 font-mono text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-500 uppercase">Historical Epoch</div>
                <div className="font-bold text-amber-200">{lore.dateOrEra}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-500 uppercase">Civilization / Author</div>
                <div className="font-bold text-amber-200">{lore.authorOrCulture}</div>
              </div>
            </div>
          </div>

          {/* Subtitle / Classification */}
          <div className="italic text-xs sm:text-sm text-amber-300/90 font-serif border-l-2 border-amber-500/60 pl-3 py-0.5">
            “{lore.subtitle}”
          </div>

          {/* Hieroglyphic Epigraphy & Translation Box */}
          {lore.glyphTranscription && (
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-stone-900/40 to-amber-950/30 p-3.5 sm:p-4 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  DECIPHERED SOLARIAN EPIGRAPHY & GLYPHS
                </span>
                <span className="text-stone-500">SECTOR 7 CORPUS</span>
              </div>
              <div className="rounded-lg bg-black/60 p-3 font-serif text-xs sm:text-sm leading-relaxed text-amber-100 border border-amber-900/40">
                {lore.glyphTranscription}
              </div>
            </div>
          )}

          {/* Physical Description & Architectural Survey */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>Physical Artifact Survey</span>
            </div>
            <p className="font-serif text-xs sm:text-sm leading-relaxed text-stone-300 text-justify">
              {lore.description}
            </p>
          </div>

          {/* Historical Significance */}
          <div className="space-y-1.5 rounded-xl bg-stone-900/60 p-3.5 sm:p-4 border border-stone-800">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Historical & Civilization Significance
            </div>
            <p className="font-serif text-xs sm:text-sm leading-relaxed text-stone-300 text-justify">
              {lore.historicalSignificance}
            </p>
          </div>

          {/* Expedition Archaeologist's Margin Notes (Handwritten Aesthetic) */}
          <div className="rounded-xl border border-amber-700/50 bg-[#1c1813] p-3.5 sm:p-4 relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400/90 mb-1 flex items-center gap-1.5">
              <PenTool className="h-3 w-3 text-amber-400" />
              FIELD NOTES & ARCHAEOLOGIST'S MARGINALIA
            </div>
            <p className="font-serif text-xs sm:text-sm leading-relaxed text-amber-200/90 italic">
              {lore.archaeologicalNotes}
            </p>
            {/* Wax Seal Stamp Watermark */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border-4 border-amber-600/10 flex items-center justify-center pointer-events-none text-[8px] font-mono uppercase text-amber-600/20 rotate-12">
              R.G.S. 1928 VERIFIED
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-amber-900/30 bg-[#191512] px-4 sm:px-6 py-3 gap-2">
          <button
            onClick={handleRecordInJournal}
            disabled={recordedToJournal}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
              recordedToJournal
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-default'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700'
            }`}
          >
            {recordedToJournal ? <Check className="h-4 w-4" /> : <PenTool className="h-4 w-4 text-amber-400" />}
            <span>{recordedToJournal ? 'RECORDED IN LOGBOOK' : 'RECORD IN JOURNAL'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInCodex}
              className="flex items-center gap-2 rounded-lg bg-amber-600/20 px-3.5 py-2 text-xs font-bold text-amber-200 border border-amber-500/40 hover:bg-amber-600/30 transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>EXPLORE CODEX (TAB)</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-500 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              RESUME EXPEDITION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
