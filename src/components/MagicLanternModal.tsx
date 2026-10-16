/**
 * The Lost Meridian - 1928 Carbide-Lamp Magic Lantern Slide Projector
 * Archival 1924 expedition glass slides, focus bellows, and ultraviolet secret cipher revelation.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Film, Eye, Sparkles, CheckCircle2, ShieldCheck, Sun, Lightbulb } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface MagicLanternModalProps {
  game: GameManager;
  onClose: () => void;
}

interface GlassSlide {
  id: string;
  title: string;
  date: string;
  normalText: string;
  uvSecretText: string;
  icon: string;
}

const SLIDES: GlassSlide[] = [
  {
    id: 'slide_1',
    title: 'Plate I: Valley Topographic Baseline',
    date: 'August 14, 1924',
    normalText: 'Survey triangulation markers established along the eastern ridge by Vance & Thorne.',
    uvSecretText: '✦ CIPHER NOTE: "The true magnetic meridian is offset 7° west of the solar alignment."',
    icon: '🗺️',
  },
  {
    id: 'slide_2',
    title: 'Plate II: Sun Temple Portal Inscription',
    date: 'September 2, 1924',
    normalText: 'Basalt glyphs photographed under magnesium flare illumination at the temple threshold.',
    uvSecretText: '✦ CIPHER NOTE: "Press the Obsidian scarab before rotating the third solstice dial."',
    icon: '🏛️',
  },
  {
    id: 'slide_3',
    title: 'Plate III: Subterranean Aqueduct Cross-Section',
    date: 'October 11, 1924',
    normalText: 'Rough schematic drafting of the underground cenote water drainage channels.',
    uvSecretText: '✦ CIPHER NOTE: "Equalize all three siphon tanks to 40 Liters to raise the counterweight float."',
    icon: '🌊',
  },
  {
    id: 'slide_4',
    title: 'Plate IV: Celestial Solstice Alignment',
    date: 'November 28, 1924',
    normalText: 'Long-exposure astrophotograph of the zenith star cluster above the armillary sanctuary.',
    uvSecretText: '✦ CIPHER NOTE: "The ruby beam unlocks the northern phoenix guardian obelisk at 90° elevation."',
    icon: '🔮',
  },
];

export const MagicLanternModal: React.FC<MagicLanternModalProps> = ({ game, onClose }) => {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [focus, setFocus] = useState(30); // Target: 50%
  const [isUvActive, setIsUvActive] = useState(false);
  const [inspectedSlides, setInspectedSlides] = useState<Record<string, boolean>>({});

  const currentSlide = SLIDES[activeSlideIdx];
  const isSharpFocus = Math.abs(focus - 50) <= 6;

  const handleSlideChange = (idx: number) => {
    setActiveSlideIdx(idx);
    audioEngine.playLanternClick();
  };

  const handleToggleUv = () => {
    audioEngine.playUvFilterSwitch();
    const next = !isUvActive;
    setIsUvActive(next);

    if (next && isSharpFocus) {
      const updated = { ...inspectedSlides, [currentSlide.id]: true };
      setInspectedSlides(updated);

      if (Object.keys(updated).length === 4) {
        audioEngine.playItemDiscovery();
        game.quest.addItem({
          id: 'doc_vance_uv_notes',
          name: "Vance's Deciphered UV Lantern Dossier",
          category: 'artifact',
          description: 'The complete set of secret ultraviolet cipher notes from the 1924 Vance expedition.',
          lore: 'Deciphered using the carbide magic lantern and cobalt UV filter.',
          iconName: 'Sparkles',
        });
        game.quest.showNotification('📜 ALL 4 GLASS SLIDES DECIPHERED WITH UV FILTER!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#14100b] shadow-2xl">
        {/* Left: Projected Screen Viewport */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#22180f] to-[#0d0905] relative">
          <div>
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
                  1928 CARBIDE-LAMP MAGIC LANTERN
                </span>
                <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
                  OPTICAL SLIDE PROJECTOR THEATRE
                </h2>
              </div>
              <Film className="h-6 w-6 text-amber-400" />
            </div>

            {/* Projected Canvas Screen */}
            <div
              className={`relative my-6 h-56 rounded-3xl border-2 p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
                isUvActive
                  ? 'border-cyan-400/80 bg-[#07131b] shadow-[0_0_35px_rgba(34,211,238,0.4)]'
                  : 'border-amber-700/80 bg-[#fef3c7] text-stone-900 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
              }`}
              style={{ filter: `blur(${Math.abs(focus - 50) * 0.08}px)` }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold ${isUvActive ? 'text-cyan-400' : 'text-amber-900'}`}>
                    1924 VANCE EXPEDITION ARCHIVE • {currentSlide.date}
                  </span>
                  <span className="text-xl">{currentSlide.icon}</span>
                </div>
                <h3 className={`font-cinzel text-base font-bold mt-1 ${isUvActive ? 'text-cyan-200' : 'text-stone-900'}`}>
                  {currentSlide.title}
                </h3>
              </div>

              {/* Slide Body Text */}
              <div className="my-2">
                <p className={`text-xs font-serif leading-relaxed ${isUvActive ? 'text-stone-400' : 'text-stone-800'}`}>
                  {currentSlide.normalText}
                </p>

                {/* Glowing UV Secret Annotation */}
                {isUvActive && (
                  <div className="mt-2 p-2.5 rounded-xl border border-cyan-400 bg-cyan-950/80 text-cyan-200 font-mono text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse">
                    {currentSlide.uvSecretText}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className={`font-mono text-[9px] ${isUvActive ? 'text-cyan-500' : 'text-stone-600'}`}>
                  CARBIDE BELLOWS FOCUS: {focus}%
                </span>
              </div>
            </div>

            {/* Focus Slider */}
            <div className="rounded-2xl border border-stone-800 bg-[#19110a] p-3 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-amber-400">
                <span>LEATHER BELLOWS OPTICAL FOCUS</span>
                <span>{focus}% {isSharpFocus ? '✦ SHARP' : '(BLURRED)'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={focus}
                onChange={(e) => {
                  setFocus(Number(e.target.value));
                  audioEngine.playLanternClick();
                }}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>
          </div>

          {/* UV Filter Toggle Button */}
          <div className="mt-4 pt-4 border-t border-amber-900/40 flex items-center justify-between">
            <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
              OPTICAL FILTER TRAY:
            </span>
            <button
              onClick={handleToggleUv}
              className={`px-5 py-2.5 rounded-2xl border text-xs font-cinzel font-bold shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
                isUvActive
                  ? 'bg-cyan-500 border-cyan-300 text-stone-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                  : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              <span>{isUvActive ? 'DISENGAGE UV FILTER' : 'ENGAGE COBALT UV FILTER'}</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Glass Slide Carousel */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#171009] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                ARCHIVAL GLASS SLIDES (1924)
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Inspect plates with UV filter to reveal hidden annotations.
              </p>
            </div>

            {/* Slides Carousel List */}
            <div className="space-y-2">
              {SLIDES.map((sl, idx) => {
                const isSelected = idx === activeSlideIdx;
                const isDeciphered = inspectedSlides[sl.id];
                return (
                  <button
                    key={sl.id}
                    onClick={() => handleSlideChange(idx)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sl.icon}</span>
                      <div>
                        <div className="font-cinzel text-xs font-bold">{sl.title}</div>
                        <span className="font-mono text-[10px] text-amber-500">{sl.date}</span>
                      </div>
                    </div>
                    {isDeciphered ? (
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-stone-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              CLOSE MAGIC LANTERN
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
