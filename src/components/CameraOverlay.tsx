/**
 * The Lost Meridian - 1928 Archaeological Bellows Field Camera Viewfinder UI
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { Camera, X, Sparkles, Sliders } from 'lucide-react';

interface CameraOverlayProps {
  game: GameManager;
  onClose: () => void;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ game, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<'1928 Sepia' | 'Cyanotype' | 'Monochrome' | 'Natural'>('1928 Sepia');
  const [isFlashing, setIsFlashing] = useState(false);

  const getFilterStyleCss = () => {
    switch (selectedFilter) {
      case '1928 Sepia':
        return 'sepia(0.8) contrast(1.15) brightness(0.92)';
      case 'Cyanotype':
        return 'hue-rotate(160deg) sepia(0.5) contrast(1.25) brightness(0.9)';
      case 'Monochrome':
        return 'grayscale(1) contrast(1.35) brightness(0.95)';
      case 'Natural':
      default:
        return 'none';
    }
  };

  const handleSnapPhoto = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 250);

    // Capture WebGL canvas image
    if (game.renderer && game.renderer.domElement) {
      try {
        const dataUrl = game.renderer.domElement.toDataURL('image/jpeg', 0.9);
        game.capturePhoto(dataUrl, selectedFilter);
      } catch (err) {
        console.error('Failed to capture canvas photo:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between pointer-events-auto select-none animate-fade-in">
      {/* Camera Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 z-50 bg-white animate-ping opacity-90 transition-opacity duration-200" />
      )}

      {/* Viewfinder Filter Preview Styling on Main Canvas Container */}
      <style>{`
        canvas {
          filter: ${getFilterStyleCss()} !important;
          transition: filter 0.3s ease;
        }
      `}</style>

      {/* Top Vintage Brass Viewfinder Bar */}
      <div className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-amber-200 font-cinzel">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-bold tracking-widest text-amber-100">
            1928 BELLOWS FIELD CAMERA
          </span>
        </div>

        <div className="text-xs text-stone-300 hidden md:block">
          SECTOR: <span className="text-amber-300 font-semibold">{game.getZoneNameByPosition(game.player.position.z)}</span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-stone-900/80 border border-stone-700 hover:bg-red-950/60 hover:border-red-500 text-stone-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Center Camera Viewfinder Reticle & Corner Brackets */}
      <div className="relative w-full max-w-4xl h-[65vh] border-2 border-amber-500/30 rounded-xl my-auto flex items-center justify-center pointer-events-none">
        {/* Brass Vintage Corner Brackets */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

        {/* Center Crosshair Focal Ring */}
        <div className="relative w-24 h-24 border border-amber-400/50 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <div className="absolute w-full h-[1px] bg-amber-400/30" />
          <div className="absolute h-full w-[1px] bg-amber-400/30" />
        </div>

        {/* Framing Grid Overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-15 border border-white/20">
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
        </div>
      </div>

      {/* Bottom Shutter & Filter Control Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent gap-4">
        {/* Filter Selection */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <Sliders className="h-4 w-4 text-amber-400 shrink-0" />
          {[
            { id: '1928 Sepia', label: '🎞️ 1928 Sepia' },
            { id: 'Cyanotype', label: '📘 Cyanotype' },
            { id: 'Monochrome', label: '🗿 Rubbing' },
            { id: 'Natural', label: '🌿 Natural' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === f.id
                  ? 'bg-amber-600/40 border-amber-400 text-amber-100 shadow-lg'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Big Shutter Trigger Button */}
        <button
          onClick={handleSnapPhoto}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 font-cinzel font-bold text-sm tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300"
        >
          <Camera className="h-5 w-5" />
          <span>SNAP EXPEDITION PHOTO</span>
        </button>
      </div>
    </div>
  );
};
