/**
 * The Lost Meridian - Master HUD Component
 * Fully featured archaeological adventure HUD with Compass ribbon, Objective card,
 * Interaction prompt, Stamina gauge, Quick Journal access, and Sound/View controls.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import {
  Compass,
  BookOpen,
  Volume2,
  VolumeX,
  Eye,
  Menu,
  Flashlight,
  Sparkles,
  Footprints,
  Camera,
  Navigation,
  Radio,
  Clock,
  Droplets,
  KeyRound,
  CloudRain,
  Leaf,
  Bell,
  Flame,
  Feather,
  Box,
  FlaskConical,
  Target,
  Star,
  Disc,
  Anchor,
  TrainTrack,
  Wind,
  Key,
  Sun,
  Waves,
  Hammer,
  Anvil,
  MapPin,
  Music,
  Plane,
  Scale,
  Film,
  Trophy,
  Scroll,
  ShieldAlert,
} from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';
import { getLoreData } from '../game/lore/CivilizationLore';

interface HUDProps {
  game: GameManager;
}

export const HUD: React.FC<HUDProps> = ({ game }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isStationsOpen, setIsStationsOpen] = useState(false);

  const target = game.player.currentFocusTarget;
  const targetLore = target ? getLoreData(target.id) : null;
  const currentObj = game.quest.getCurrentObjective();
  const staminaPct = Math.round((game.player.stamina / game.player.maxStamina) * 100);
  const yawDeg = Math.round((((game.cameraRig.yaw * 180) / Math.PI) % 360 + 360) % 360);

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setVolumes(next ? 0 : 0.85, next ? 0 : 0.8, next ? 0 : 0.65, next ? 0 : 0.75);
  };

  const handleCycleView = () => {
    game.cameraRig.cycleViewMode();
  };

  const getViewModeLabel = () => {
    switch (game.cameraRig.viewMode) {
      case 'follow':
        return '3rd Person';
      case 'explore':
        return 'Isometric';
      case 'firstPerson':
        return '1st Person';
    }
  };

  const getCompassHeading = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'N';
    if (deg >= 22.5 && deg < 67.5) return 'NE';
    if (deg >= 67.5 && deg < 112.5) return 'E';
    if (deg >= 112.5 && deg < 157.5) return 'SE';
    if (deg >= 157.5 && deg < 202.5) return 'S';
    if (deg >= 202.5 && deg < 247.5) return 'SW';
    if (deg >= 247.5 && deg < 292.5) return 'W';
    return 'NW';
  };

  const loreCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'CIVILIZATION': return 'SOLARIAN DYNASTY';
      case 'ASTRONOMY': return 'CELESTIAL ALIGNMENT';
      case 'ENGINEERING': return 'HYDRAULIC ARCHITECTURE';
      case 'EXPEDITION': return '1928 EXPEDITION ARCHIVE';
      default: return cat;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden text-stone-100">
      {/* Underwater Aquatic Caustics & Muffled Vignette Overlay */}
      {game.isUnderwater && (
        <div className="absolute inset-0 pointer-events-none z-10 animate-fade-in bg-gradient-to-b from-cyan-950/35 via-teal-900/25 to-blue-950/50 shadow-[inset_0_0_120px_rgba(6,182,212,0.45)]">
          {/* Subtle animated water caustics line shimmer */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.3)_0%,transparent_70%)] animate-pulse" />

          {/* Submerged Dive Banner */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-cyan-950/90 px-4 py-1.5 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.35)] text-cyan-200 text-xs font-mono font-bold tracking-wide">
            <Droplets className="h-3.5 w-3.5 text-cyan-300 animate-bounce" />
            <span>SUBMERGED RUINS DIVE · [CTRL] Dive Deeper · [SPACE] Surface</span>
          </div>
        </div>
      )}

      {/* Surface Swimming Status Banner */}
      {!game.isUnderwater && game.player.isSwimming && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-cyan-950/90 px-4 py-1.5 border border-cyan-600/50 shadow-lg text-cyan-200 text-xs font-mono font-bold z-20">
          <span>SWIMMING · [CTRL] Submerge</span>
        </div>
      )}

      {/* Active Expedition Infusion Perk Badge */}
      {game.activePerk && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-emerald-950/90 px-4 py-1.5 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-300 text-xs font-mono font-bold z-20">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>ACTIVE PERK: {game.activePerk.perkTitle}</span>
          <span className="text-[10px] text-stone-400">
            ({Math.max(0, Math.ceil((game.activePerk.expiresAt - Date.now()) / 1000))}s)
          </span>
        </div>
      )}

      {/* 1. Top Compass Ribbon & Header Controls */}
      <header className="absolute top-2.5 sm:top-3 left-0 right-0 flex items-center justify-between px-3 sm:px-6 z-30">
        {/* Left: Quick Journal, Watch, Cipher & Menu Access (Desktop only) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => {
              game.isJournalOpen = true;
              game.input.exitPointerLock();
            }}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3.5 py-1.5 backdrop-blur-md border border-amber-700/40 text-amber-200 text-xs font-cinzel font-bold shadow-lg hover:bg-stone-800 hover:border-amber-500 transition-colors cursor-pointer"
            title="Open Field Journal [TAB]"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>LOGBOOK & CODEX</span>
            <span className="text-[10px] font-mono text-stone-400">[TAB]</span>
          </button>

          <button
            onClick={() => {
              game.isWatchOpen = true;
              game.input.exitPointerLock();
              audioEngine.playCompassClick();
            }}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1.5 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="1928 Sterling Pocket Watch & Celestial Time Controller"
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {String(Math.floor(game.timeOfDay) % 24).padStart(2, '0')}:
              {String(Math.floor((game.timeOfDay % 1) * 60)).padStart(2, '0')}
            </span>
          </button>

          <button
            onClick={() => {
              game.isMapOpen = true;
              game.input.exitPointerLock();
              audioEngine.playCompassClick();
            }}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1.5 backdrop-blur-md border border-amber-600/40 text-amber-200 text-xs font-cinzel shadow-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Expedition Cartography Map & Fast Travel [M]"
          >
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>MAP</span>
            <span className="text-[10px] font-mono text-stone-400">[M]</span>
          </button>
        </div>

        {/* Center: Tactical Antique Scrolling Compass Ribbon */}
        <div className="relative flex flex-col items-center">
          <div className="relative flex h-8 w-44 sm:w-56 items-center justify-center overflow-hidden rounded-full bg-stone-900/90 px-2 backdrop-blur-md border border-amber-900/60 shadow-xl font-mono text-xs">
            {/* Center Pointer Triangle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-400 z-10" />

            {/* Scrolling Compass Ticks */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {[-180, -135, -90, -45, 0, 45, 90, 135, 180, 225, 270, 315, 360, 405, 450, 495, 540].map((dir) => {
                const diff = ((dir - yawDeg + 540) % 360) - 180;
                if (Math.abs(diff) > 90) return null; // Cull ticks offscreen
                const label = getCompassHeading((dir % 360 + 360) % 360);
                const xOffset = diff * 1.8; // pixels per degree
                const isCardinal = dir % 90 === 0;

                return (
                  <div
                    key={dir}
                    className="absolute flex flex-col items-center transition-transform duration-75"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        label === 'N'
                          ? 'text-rose-400 font-extrabold scale-110'
                          : isCardinal
                          ? 'text-amber-300'
                          : 'text-stone-400'
                      }`}
                    >
                      {label}
                    </span>
                    <div
                      className={`w-[1px] ${
                        isCardinal ? 'h-2 bg-amber-400' : 'h-1 bg-stone-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-amber-400/90 mt-0.5 tracking-wider">
            {yawDeg}°
          </span>
        </div>

        {/* Right: Camera View, Touch HUD, Photo Mode & Sound (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => game.toggleTouchControls()}
            className={`pointer-events-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 backdrop-blur-md border text-xs font-cinzel transition-colors cursor-pointer ${
              game.showTouchControls
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-stone-900/80 border-stone-700/50 text-stone-400'
            }`}
            title="Toggle On-Screen Mobile Touch HUD Controls"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{game.showTouchControls ? 'TOUCH HUD: ON' : 'TOUCH HUD: OFF'}</span>
          </button>

          <button
            onClick={() => game.toggleCameraMode()}
            className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-stone-950/85 px-3 py-1.5 backdrop-blur-md border border-amber-800/60 text-amber-200 text-xs font-medium shadow-md hover:bg-stone-900 hover:border-amber-500 transition-colors cursor-pointer"
            title="Field Camera Photo Mode [P]"
          >
            <Camera className="h-3.5 w-3.5 text-amber-400" />
            <span>Camera</span>
            <span className="text-[10px] font-mono text-amber-400">[P]</span>
          </button>

          <button
            onClick={handleCycleView}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1.5 backdrop-blur-md border border-stone-700/50 text-stone-200 text-xs font-medium shadow-lg hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            title="Change Camera View [C]"
          >
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <span>{getViewModeLabel()}</span>
            <span className="text-[10px] font-mono text-stone-400">[C]</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playSfx('crystal');
              const tracks = [
                '📻 Gramophone: 1928 Royal Expedition March',
                '📻 Radio Telegraph: Morse Signal from Sector 7 Base',
                '📻 Gramophone: Meridian Solstice Serenade (Waltz)',
                '📻 Field Radio: High Altitude Atmospheric Resonance',
              ];
              const idx = Math.floor(Math.random() * tracks.length);
              game.quest.showNotification(tracks[idx]);
            }}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1.5 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-medium shadow-lg hover:bg-amber-950/80 hover:text-white transition-colors cursor-pointer"
            title="1920s Phonograph Gramophone Radio"
          >
            <Radio className="h-3.5 w-3.5 text-amber-400" />
            <span>Gramophone</span>
          </button>

          <button
            onClick={() => game.executeEmergencyRescue()}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-2.5 sm:px-3 py-1.5 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-medium shadow-lg hover:bg-amber-950/80 hover:text-white transition-colors cursor-pointer"
            title="Emergency Unstick / Auto-Fix Safeguard [F8 / U]"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Unstick</span>
            <span className="text-[10px] font-mono text-amber-400">[F8]</span>
          </button>

          <button
            onClick={() => game.openQAAudit()}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-stone-900/80 px-2.5 sm:px-3 py-1.5 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-medium shadow-lg hover:bg-amber-950/80 hover:text-white transition-colors cursor-pointer"
            title="10-Lead Stringent QA Audit Dossier & Scores [Q]"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">QA Audit</span>
            <span className="text-[10px] font-mono text-amber-400">[Q]</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="pointer-events-auto flex items-center justify-center p-2 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700/50 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-lg"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-teal-400" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Top Active Objective Card (Positioned top-left on mobile under compass/top bar; top-right on desktop) */}
      {currentObj && (
        <aside className="absolute top-14 sm:top-16 left-3 sm:left-auto sm:right-6 max-w-[170px] sm:max-w-sm rounded-xl bg-stone-900/90 p-2 sm:p-3.5 backdrop-blur-md border border-amber-900/50 shadow-xl z-20">
          <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
            <div className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
              <span>OBJECTIVE</span>
            </div>
            {/* Dynamic Distance Counter */}
            <span className="text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
              🧭 {Math.round(Math.abs(game.player.position.z - (
                game.quest.currentStage === 'CAMP_INVESTIGATION' ? 72 :
                game.quest.currentStage === 'JUNGLE_EXPEDITION' ? 25 :
                game.quest.currentStage === 'WATERFALL_PASSAGE' ? -35 :
                game.quest.currentStage === 'AQUEDUCT_PUZZLE' ? -72 :
                game.quest.currentStage === 'TEMPLE_APPROACH' ? -130 :
                game.quest.currentStage === 'LIGHT_ALIGNMENT_PUZZLE' ? -155 :
                game.quest.currentStage === 'UNDERGROUND_DESCENT' ? -195 : -235
              )))}m
            </span>
          </div>
          <h4 className="font-cinzel text-[10px] sm:text-sm font-bold text-stone-100 mt-0.5 sm:mt-1 line-clamp-2">
            {currentObj.title}
          </h4>
        </aside>
      )}

      {/* 3. Center Screen Crosshair (In 1st person or when exploring) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`h-2 w-2 rounded-full transition-all duration-200 ${
            target
              ? 'scale-150 bg-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
              : 'scale-100 bg-white/40 ring-1 ring-black/40'
          }`}
        />
      </div>

      {/* 4. Interactive Focus Prompt Banner (Desktop keyboard prompt; hidden on mobile touch where on-screen button exists) */}
      {target && (
        <div className="pointer-events-auto hidden sm:flex absolute bottom-24 left-1/2 -translate-x-1/2 items-center gap-3 rounded-xl bg-stone-900/95 px-5 py-2.5 backdrop-blur-md border border-amber-500/70 text-stone-100 shadow-[0_0_30px_rgba(0,0,0,0.85)] z-30">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 font-mono text-xs font-bold text-amber-300 border border-amber-400/40">
            E
          </span>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">
                {target.verb}
              </span>
              {targetLore && (
                <span className="text-[9px] font-mono tracking-wider text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50">
                  ✦ {targetLore.authorOrCulture} · {loreCategoryLabel(targetLore.category)}
                </span>
              )}
            </div>
            <span className="font-cinzel text-xs sm:text-sm font-bold text-white">
              {target.title}
            </span>
          </div>

          <div className="ml-2 flex items-center gap-2">
            {targetLore && (
              <button
                onClick={() => game.openLoreInspection(targetLore)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-950/80 px-2.5 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-600/50 hover:bg-amber-900/90 cursor-pointer shadow-md transition-all active:scale-95"
                title="Examine Archaeological Field Dossier [L]"
              >
                <Scroll className="h-3.5 w-3.5 text-amber-400" />
                <span>DOSSIER [L]</span>
              </button>
            )}

            <button
              onClick={() => game.handleInteraction()}
              className="rounded-lg bg-amber-600 px-3.5 py-1 text-xs font-bold text-stone-950 hover:bg-amber-500 cursor-pointer shadow-md transition-all active:scale-95"
            >
              INTERACT
            </button>
          </div>
        </div>
      )}

      {/* Water Droplet Lens Condensation Overlay (In rain or near waterfall spray) */}
      {(game.weather.state.rainIntensity > 0.15 || Math.abs(game.player.position.z - (-45)) < 22) && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-75 overflow-hidden transition-opacity duration-1000">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(180,220,255,0.15)_100%)]" />
          <div className="absolute top-10 left-12 w-6 h-12 bg-white/20 rounded-full blur-[2px] animate-pulse" />
          <div className="absolute top-1/3 right-16 w-8 h-16 bg-cyan-200/20 rounded-full blur-[2px] animate-pulse" />
          <div className="absolute bottom-20 left-1/4 w-5 h-10 bg-white/15 rounded-full blur-[2px]" />
          <div className="absolute top-1/2 left-1/3 w-7 h-14 bg-blue-100/20 rounded-full blur-[2px]" />
        </div>
      )}

      {/* 5. In-Game Notification Pop */}
      {game.quest.notificationMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl bg-amber-950/90 px-4 sm:px-6 py-2 sm:py-2.5 backdrop-blur-md border border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-40 font-cinzel text-[11px] sm:text-xs font-bold tracking-wider animate-bounce max-w-[90vw] text-center">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">{game.quest.notificationMessage}</span>
        </div>
      )}

      {/* 6. Corner Brass Minimap Radar Widget (Desktop & Tablet) */}
      <div className="hidden sm:flex absolute bottom-4 right-6 flex-col items-center z-20 pointer-events-auto">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-amber-500/70 bg-[#12100e]/90 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex items-center justify-center">
          {/* Top Cardinal Notch Labels */}
          <span className="absolute top-1 text-[9px] font-mono font-bold text-rose-400 z-10">N</span>
          <span className="absolute bottom-1 text-[9px] font-mono font-bold text-amber-300 z-10">S</span>
          <span className="absolute left-1 text-[9px] font-mono font-bold text-amber-300 z-10">W</span>
          <span className="absolute right-1 text-[9px] font-mono font-bold text-amber-300 z-10">E</span>

          {/* Concentric Radar Distance Rings */}
          <div className="absolute w-20 h-20 rounded-full border border-amber-500/20" />
          <div className="absolute w-12 h-12 rounded-full border border-amber-500/30" />
          <div className="absolute w-full h-[1px] bg-amber-500/15" />
          <div className="absolute h-full w-[1px] bg-amber-500/15" />

          {/* Rotating Player Orientation Arrow */}
          <div
            className="absolute z-20 transition-transform duration-75"
            style={{ transform: `rotate(${-yawDeg}deg)` }}
          >
            <Navigation className="h-5 w-5 text-amber-400 fill-amber-400/30 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          </div>

          {/* Rowboat Marker on Radar */}
          {Math.abs(game.boat.position.z - game.player.position.z) < 80 && (
            <div
              className="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full border border-black animate-pulse z-10 shadow-[0_0_8px_cyan]"
              style={{
                transform: `translate(${Math.max(-45, Math.min(45, (game.boat.position.x - game.player.position.x) * 1.5))}px, ${Math.max(-45, Math.min(45, (game.boat.position.z - game.player.position.z) * 1.5))}px)`,
              }}
              title="Rowboat Dock"
            />
          )}

          {/* Active Objective Beacon Dot on Radar */}
          <div
            className="absolute w-3 h-3 bg-amber-400 rounded-full border border-amber-200 z-10 animate-ping shadow-[0_0_10px_gold]"
            style={{
              transform: `translate(0px, ${Math.max(-48, Math.min(48, ((
                game.quest.currentStage === 'CAMP_INVESTIGATION' ? 72 :
                game.quest.currentStage === 'JUNGLE_EXPEDITION' ? 25 :
                game.quest.currentStage === 'WATERFALL_PASSAGE' ? -35 :
                game.quest.currentStage === 'AQUEDUCT_PUZZLE' ? -72 :
                game.quest.currentStage === 'TEMPLE_APPROACH' ? -130 :
                game.quest.currentStage === 'LIGHT_ALIGNMENT_PUZZLE' ? -155 :
                game.quest.currentStage === 'UNDERGROUND_DESCENT' ? -195 : -235
              ) - game.player.position.z) * 0.8))}px)`,
            }}
            title="Active Waypoint"
          />
        </div>
        <div className="mt-1 flex items-center gap-2 text-[9px] font-mono text-amber-300/80 font-bold tracking-wider">
          <span>X: {Math.round(game.player.position.x)}m</span>
          <span>Z: {Math.round(game.player.position.z)}m</span>
        </div>
      </div>

      {/* 7. Desktop Bottom Gauges (Stamina & Status) */}
      <footer className="hidden sm:flex absolute bottom-4 left-4 sm:left-6 items-center gap-3 z-20">
        <div className="flex flex-col gap-1 rounded-xl bg-stone-900/80 px-3.5 py-2 backdrop-blur-md border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-stone-400">
              <Footprints className="h-3 w-3 text-amber-400" />
              <span>STAMINA</span>
            </span>
            <span className="font-bold text-stone-200">{staminaPct}%</span>
          </div>
          <div className="h-1.5 w-32 sm:w-40 rounded-full bg-stone-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                staminaPct > 35 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${staminaPct}%` }}
            />
          </div>
        </div>

        {/* Oxygen Breath Gauge (Visible when swimming or submerged) */}
        {(game.isUnderwater || game.player.isSwimming) && (
          <div className="flex flex-col gap-1 rounded-xl bg-stone-900/80 px-3.5 py-2 backdrop-blur-md border border-cyan-800/60 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-300">
                <Droplets className="h-3 w-3 text-cyan-400" />
                <span>OXYGEN</span>
              </span>
              <span className={`font-bold ${game.oxygenLevel < 25 ? 'text-rose-400 animate-ping' : 'text-cyan-200'}`}>
                {Math.round(game.oxygenLevel)}%
              </span>
            </div>
            <div className="h-1.5 w-32 sm:w-36 rounded-full bg-stone-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  game.oxygenLevel > 30 ? 'bg-cyan-400' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${game.oxygenLevel}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => game.player.toggleTorch()}
          className={`pointer-events-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md border shadow-lg transition-colors cursor-pointer ${
            game.player.torchLight.visible
              ? 'bg-amber-600/30 text-amber-200 border-amber-500/60 ring-1 ring-amber-400/50'
              : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
          title="Toggle Field Torch [T]"
        >
          <Flashlight className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">TORCH</span>
          <span className="text-[10px] font-mono text-stone-500">[T]</span>
        </button>

        <button
          onClick={() => {
            game.isLensModeActive = !game.isLensModeActive;
            game.postProcessing?.setLensMode(game.isLensModeActive);
            audioEngine.playSfx('click');
            game.quest.showNotification(
              game.isLensModeActive
                ? '✦ MERIDIAN CELESTIAL LENS ENGAGED [V]'
                : '✦ MERIDIAN CELESTIAL LENS DISENGAGED'
            );
            if (game.onStateChange) game.onStateChange();
          }}
          className={`pointer-events-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md border shadow-lg transition-colors cursor-pointer ${
            game.isLensModeActive
              ? 'bg-cyan-600/40 text-cyan-200 border-cyan-400/80 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
          title="Toggle Meridian Celestial Spectral Lens [V]"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
          <span className="hidden sm:inline">LENS</span>
          <span className="text-[10px] font-mono text-stone-500">[V]</span>
        </button>
      </footer>

      {/* 8. Expedition Stations & Scientific Instruments Categorized Popover Modal */}
      {isStationsOpen && (() => {
        const openStation = (action: () => void, targetPos?: [number, number, number]) => {
          setIsStationsOpen(false);
          if (targetPos) {
            game.player.position.set(targetPos[0], targetPos[1], targetPos[2]);
            game.player.velocity.set(0, 0, 0);
          }
          action();
        };

        return (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-stone-900/95 border-2 border-amber-500/60 p-6 shadow-2xl text-stone-100 font-sans">
            <button
              onClick={() => {
                setIsStationsOpen(false);
                game.input.requestPointerLock();
              }}
              className="absolute top-4 right-4 rounded-full bg-stone-800 p-2 text-stone-300 hover:bg-stone-700 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-800/40 pb-4 mb-6">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <div>
                <h3 className="font-cinzel text-xl font-bold text-amber-300 tracking-wide">
                  EXPEDITION STATIONS & INSTRUMENTS
                </h3>
                <p className="text-xs font-mono text-stone-400">
                  Fast-Travel & Direct Interactive Access to Physical 3D Expedition Sites
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category 1: Ancient Puzzles */}
              <div className="flex flex-col gap-3 rounded-xl bg-stone-950/80 p-4 border border-amber-900/40">
                <h4 className="font-cinzel text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-800 pb-2">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  <span>Ancient Stelae & Puzzles</span>
                </h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openStation(() => { game.isCipherWheelOpen = true; game.input.exitPointerLock(); }, [0, 1.2, 55])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Astrolabe Cipher Wheel</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isEpigraphyOpen = true; game.input.exitPointerLock(); }, [1.5, 1.2, 56.5])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Key className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Epigraphy Glyph Translation</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isArmillaryOpen = true; game.input.exitPointerLock(); }, [0, -14, -85])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Armillary Prismatic Sphere</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isHydraulicOpen = true; game.input.exitPointerLock(); }, [0, -14, -85])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-blue-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Waves className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Hydraulic Cenote Siphon</span>
                  </button>
                  <button onClick={() => openStation(() => { game.triggerGrandFinale(); }, [0, 11, -95])} className="flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-amber-900/80 to-amber-800/80 px-3 py-2 text-xs font-bold text-amber-200 border border-amber-500/60 hover:brightness-110 transition-all text-left cursor-pointer shadow-md">
                    <Trophy className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Solstice Apex Altar Finale</span>
                  </button>
                </div>
              </div>

              {/* Category 2: Scientific Instruments */}
              <div className="flex flex-col gap-3 rounded-xl bg-stone-950/80 p-4 border border-cyan-900/40">
                <h4 className="font-cinzel text-sm font-bold text-cyan-300 flex items-center gap-2 border-b border-stone-800 pb-2">
                  <FlaskConical className="h-4 w-4 text-cyan-400" />
                  <span>Field Instruments & Labs</span>
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
                  <button onClick={() => openStation(() => { game.isWeatherStationOpen = true; game.input.exitPointerLock(); }, [-2.5, 1.2, 58])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-cyan-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <CloudRain className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Barometer Weather Station</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isHerbariumOpen = true; game.input.exitPointerLock(); }, [2.5, 1.2, 58])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-emerald-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Leaf className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Botanical Herbarium Press</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isTuningForkOpen = true; game.input.exitPointerLock(); }, [-4.5, 1.2, 54])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Bell className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Pythagorean Tuning Forks</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isReliquaryOpen = true; game.input.exitPointerLock(); }, [0, 1.2, 55])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Box className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Curator 3D Reliquary</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isPlanetariumOpen = true; game.input.exitPointerLock(); }, [0, -6, -145])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-indigo-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Star className="h-4 w-4 text-indigo-300 shrink-0" />
                    <span>Planetarium Orrery Dome</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isChemistryLabOpen = true; game.input.exitPointerLock(); }, [-3.5, 1.2, 56.5])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-teal-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <FlaskConical className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Reagent Field Chemistry Lab</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isTheodoliteOpen = true; game.input.exitPointerLock(); }, [-5.0, 1.2, 48])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Target className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Transit Optical Theodolite</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isRadioOpen = true; game.input.exitPointerLock(); }, [4.5, 1.2, 56.5])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Radio className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Wireless Shortwave Radio</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isPhonographOpen = true; game.input.exitPointerLock(); }, [3.0, 1.2, 54])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Disc className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Wax-Cylinder Phonograph</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isPaleontologyOpen = true; game.input.exitPointerLock(); }, [-6.0, 1.2, 52])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Hammer className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Field Paleontology Bench</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isMetallurgyOpen = true; game.input.exitPointerLock(); }, [6.0, 1.2, 52])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-orange-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Flame className="h-4 w-4 text-orange-400 shrink-0" />
                    <span>Expedition Smelting Forge</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isCartographyOpen = true; game.input.exitPointerLock(); }, [2.0, 1.2, 58])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <MapPin className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Cartography Drafting Desk</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isChladniOpen = true; game.input.exitPointerLock(); }, [-1.5, 1.2, 56])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Music className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Chladni Acoustic Table</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isAssayOpen = true; game.input.exitPointerLock(); }, [0, 4.0, -115])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Scale className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Assay Balance Sarcophagus</span>
                  </button>
                  <button onClick={() => openStation(() => { game.isLanternOpen = true; game.input.exitPointerLock(); }, [3.5, 1.5, 53])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Film className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Magic Lantern Projector</span>
                  </button>
                </div>
              </div>

              {/* Category 3: Vehicles & Recon */}
              <div className="flex flex-col gap-3 rounded-xl bg-stone-950/80 p-4 border border-sky-900/40">
                <h4 className="font-cinzel text-sm font-bold text-sky-300 flex items-center gap-2 border-b border-stone-800 pb-2">
                  <Plane className="h-4 w-4 text-sky-400" />
                  <span>Vehicles & Reconnaissance</span>
                </h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openStation(() => { game.startFalconFlight(); })} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-sky-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Feather className="h-4 w-4 text-sky-300 shrink-0" />
                    <span>Andean Falcon Aerial Scout</span>
                  </button>
                  <button onClick={() => openStation(() => { if (game.divingSystem.isDiving) game.stopDiving(); else game.startDiving(); }, [-4.2, -4.0, -42])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-cyan-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Anchor className="h-4 w-4 text-cyan-300 shrink-0" />
                    <span>Copper Diving Apparatus</span>
                  </button>
                  <button onClick={() => openStation(() => { if (game.minecartSystem.isRiding) game.dismountMinecart(); else game.boardMinecart(); }, [-3.0, -8.0, -118])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <TrainTrack className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Ore Railway Minecart</span>
                  </button>
                  <button onClick={() => openStation(() => { if (game.balloonSystem.isBoarded) game.dismountBalloon(); else game.boardBalloon(); }, [-18, 12, 30])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-sky-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Wind className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Observation Aerostat Balloon</span>
                  </button>
                  <button onClick={() => openStation(() => { if (game.biplaneSystem.isBoarded) game.dismountBiplane(); else game.boardBiplane(); }, [-18, 14.5, 45])} className="flex items-center gap-2.5 rounded-lg bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-200 border border-stone-800 hover:border-sky-500 hover:bg-stone-800 transition-all text-left cursor-pointer">
                    <Plane className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Curtiss Falcon Biplane</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* 7. Controls Reference (Bottom Center - Clean Unboxed Typography) */}
      <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-2.5 px-4 py-1 text-[11px] text-stone-400 font-mono tracking-wider drop-shadow-md">
        <span>WASD Move</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>Shift Sprint</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>E Interact</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>M Map</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>V Lens</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>T Torch</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>Tab Journal</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span>C View</span>
      </div>
    </div>
  );
};
