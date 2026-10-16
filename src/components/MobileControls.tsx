/**
 * The Lost Meridian - Responsive AAA Mobile Touch Controls & Floating Joystick
 * Features dynamic floating thumbstick, gesture look tracking, contextual boat/fishing controls,
 * and tactile mobile ergonomics.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameManager } from '../game/GameManager';
import {
  Flashlight,
  BookOpen,
  ChevronUp,
  Zap,
  Sparkles,
  Pause,
  ArrowDown,
  Map as MapIcon,
  Camera,
  Fish,
  Anchor,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface MobileControlsProps {
  game: GameManager;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ game }) => {
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({ x: 90, y: 0 });
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  const joystickTouchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number } | null>(null);

  const target = game.player.currentFocusTarget;
  const isTorchOn = game.player.isTorchOn;
  const isSprinting = game.player.isSprinting;
  const isCrouching = game.player.isCrouching;
  const isBoatBoarded = game.boat.isBoarded;
  const isNearWater = game.player.position.z > -10 && game.player.position.z < 55 && game.player.position.y < 3.5;
  const isFishing = game.fishing.isFishing;

  // Haptic Feedback Helper
  const triggerHaptic = (ms = 12) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Ignore
      }
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && isCoarsePointer;
      setIsMobileMode(game.showTouchControls || isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [game.showTouchControls]);

  // 1. Floating Dynamic Virtual Joystick Handlers (Left Screen Half - Touch & Pointer)
  const processJoystickStart = (clientX: number, clientY: number, id: number | string) => {
    joystickTouchIdRef.current = typeof id === 'number' ? id : 999;
    setJoystickCenter({ x: clientX, y: clientY });
    setJoystickPos({ x: 0, y: 0 });
    setJoystickActive(true);
    triggerHaptic(10);
  };

  const processJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickActive && joystickTouchIdRef.current === null) return;
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const maxRadius = 48; // Max stick throw

    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: stickX, y: stickY });

    // Normalized analog movement (-1 to +1)
    const normX = stickX / maxRadius;
    const normY = -stickY / maxRadius;
    game.input.setVirtualJoystick(normX, normY);
  };

  const processJoystickEnd = () => {
    joystickTouchIdRef.current = null;
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    game.input.setVirtualJoystick(0, 0);
  };

  const handleJoystickZoneTouchStart = (e: React.TouchEvent) => {
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    processJoystickStart(touch.clientX, touch.clientY, touch.identifier);
  };

  const handleJoystickZoneTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        processJoystickMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickZoneTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        processJoystickEnd();
        break;
      }
    }
  };

  // 2. Right Screen Swipe Camera Look Handlers (Touch & Pointer)
  const processLookStart = (clientX: number, clientY: number, id: number | string) => {
    lookTouchIdRef.current = typeof id === 'number' ? id : 888;
    lastLookPosRef.current = { x: clientX, y: clientY };
  };

  const processLookMove = (clientX: number, clientY: number) => {
    if (lastLookPosRef.current) {
      const dx = clientX - lastLookPosRef.current.x;
      const dy = clientY - lastLookPosRef.current.y;
      lastLookPosRef.current = { x: clientX, y: clientY };
      game.input.addTouchLookDelta(dx * 1.7, dy * 1.7);
    }
  };

  const processLookEnd = () => {
    lookTouchIdRef.current = null;
    lastLookPosRef.current = null;
  };

  const handleLookTouchStart = (e: React.TouchEvent) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    processLookStart(touch.clientX, touch.clientY, touch.identifier);
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        processLookMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        processLookEnd();
        break;
      }
    }
  };

  if (!isMobileMode) return null;

  return (
    <div className="pointer-events-none fixed inset-0 select-none overflow-hidden z-20 touch-none">
      {/* LEFT HALF: Dynamic Floating Thumbstick Touch Surface */}
      <div
        className="pointer-events-auto absolute top-16 left-0 bottom-0 w-1/2 touch-none"
        onTouchStart={handleJoystickZoneTouchStart}
        onTouchMove={handleJoystickZoneTouchMove}
        onTouchEnd={handleJoystickZoneTouchEnd}
        onTouchCancel={handleJoystickZoneTouchEnd}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.buttons === 1) {
            processJoystickStart(e.clientX, e.clientY, 'mouse_joy');
          }
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' && e.buttons === 1) {
            processJoystickMove(e.clientX, e.clientY);
          }
        }}
        onPointerUp={processJoystickEnd}
      />

      {/* RIGHT HALF: Smooth Camera Look Touch Surface */}
      <div
        className="pointer-events-auto absolute top-16 right-0 bottom-24 w-1/2 touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.buttons === 1) {
            processLookStart(e.clientX, e.clientY, 'mouse_look');
          }
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' && e.buttons === 1) {
            processLookMove(e.clientX, e.clientY);
          }
        }}
        onPointerUp={processLookEnd}
      />

      {/* FLOATING VIRTUAL JOYSTICK (Renders centered under user thumb on touch) */}
      {joystickActive && (
        <div
          className="pointer-events-none fixed flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-400/80 bg-black/60 backdrop-blur-md shadow-2xl z-30"
          style={{
            left: `${joystickCenter.x}px`,
            top: `${joystickCenter.y}px`,
          }}
        >
          {/* Central Cross Grid */}
          <div className="absolute h-full w-[1px] bg-amber-400/20" />
          <div className="absolute h-[1px] w-full bg-amber-400/20" />

          {/* Stick Knob */}
          <div
            className="h-12 w-12 rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.85)] transform transition-transform duration-75"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          />
        </div>
      )}

      {/* TOP BAR: Safe-Area Quick Shortcut Hub */}
      <div className="pointer-events-auto absolute top-3 right-3 flex items-center gap-2 z-40">
        {/* Expedition Map Button */}
        <button
          onClick={() => {
            triggerHaptic();
            game.input.triggerMap();
          }}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 shadow-xl active:scale-90 transition-transform cursor-pointer"
          aria-label="Open Map"
          title="Map"
        >
          <MapIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Expedition Journal */}
        <button
          onClick={() => {
            triggerHaptic();
            game.input.triggerJournal();
          }}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 shadow-xl active:scale-90 transition-transform cursor-pointer"
          aria-label="Open Field Journal"
          title="Field Journal"
        >
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Camera 1st / 3rd Person Toggle */}
        <button
          onClick={() => {
            triggerHaptic();
            game.input.triggerCameraViewToggle();
          }}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/75 backdrop-blur-md border border-stone-700 text-stone-300 shadow-xl active:scale-90 transition-transform cursor-pointer"
          aria-label="Toggle Camera View"
          title="Toggle Perspective (1st / 3rd Person)"
        >
          <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Pause Menu */}
        <button
          onClick={() => {
            triggerHaptic();
            game.input.triggerPause();
          }}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/75 backdrop-blur-md border border-stone-700 text-stone-300 shadow-xl active:scale-90 transition-transform cursor-pointer"
          aria-label="Pause Menu"
          title="Pause"
        >
          <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Mobile Top Stamina Meter */}
      <div className="pointer-events-none absolute top-14 sm:top-16 right-3 flex items-center gap-2 rounded-lg bg-black/80 px-2.5 py-1 backdrop-blur-md border border-stone-800 shadow-md z-30">
        <span className="text-[9px] font-mono font-bold text-stone-400">STAMINA</span>
        <div className="h-1 w-16 sm:w-20 rounded-full bg-stone-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-150 ${
              game.player.stamina > 35 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${Math.round((game.player.stamina / game.player.maxStamina) * 100)}%` }}
          />
        </div>
      </div>

      {/* CONTEXTUAL ROWBOAT ON-SCREEN D-PAD (When player is in the rowboat) */}
      {isBoatBoarded && (
        <div className="pointer-events-auto absolute bottom-28 left-6 flex flex-col items-center gap-1.5 z-40 bg-black/75 backdrop-blur-md p-2.5 rounded-2xl border border-amber-600/40 shadow-2xl">
          <span className="text-[10px] font-bold text-amber-300 tracking-wider">ROWBOAT CONTROLS</span>
          <button
            onTouchStart={() => { game.input.moveForward = true; }}
            onTouchEnd={() => { game.input.moveForward = false; }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/40 border border-amber-500/60 text-amber-200 active:bg-amber-500 active:text-black transition-colors"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onTouchStart={() => { game.input.moveLeft = true; }}
              onTouchEnd={() => { game.input.moveLeft = false; }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/40 border border-amber-500/60 text-amber-200 active:bg-amber-500 active:text-black transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onTouchStart={() => { game.input.moveBackward = true; }}
              onTouchEnd={() => { game.input.moveBackward = false; }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/40 border border-amber-500/60 text-amber-200 active:bg-amber-500 active:text-black transition-colors"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              onTouchStart={() => { game.input.moveRight = true; }}
              onTouchEnd={() => { game.input.moveRight = false; }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/40 border border-amber-500/60 text-amber-200 active:bg-amber-500 active:text-black transition-colors"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT: Tactile Action Cluster */}
      <div className="pointer-events-auto absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col items-end gap-2.5 sm:gap-3 z-40 pb-[env(safe-area-inset-bottom)]">
        {/* Contextual Fishing Quick Action (When near water or fishing) */}
        {(isNearWater || isFishing) && !isBoatBoarded && (
          <button
            onClick={() => {
              triggerHaptic(20);
              game.input.triggerFishing();
            }}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 backdrop-blur-md shadow-2xl active:scale-90 transition-all cursor-pointer ${
              isFishing
                ? 'border-emerald-400 bg-emerald-600 text-white animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                : 'border-cyan-500/60 bg-cyan-950/70 text-cyan-300'
            }`}
            aria-label="Fish"
          >
            <Fish className="h-6 w-6" />
            <span className="absolute -top-6 whitespace-nowrap rounded bg-cyan-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase font-mono shadow-md">
              {isFishing ? 'REEL IN' : 'CAST ROD'}
            </span>
          </button>
        )}

        {/* PRIMARY CONTEXTUAL INTERACT / BOARD BUTTON */}
        <button
          onClick={() => {
            triggerHaptic(25);
            game.input.triggerInteract();
          }}
          className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 backdrop-blur-md shadow-2xl active:scale-90 transition-all cursor-pointer ${
            isBoatBoarded
              ? 'border-amber-400 bg-amber-500 text-black shadow-[0_0_25px_rgba(251,191,36,0.9)]'
              : target
              ? 'border-amber-400 bg-amber-500 text-black shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse'
              : 'border-stone-700 bg-black/75 text-stone-400'
          }`}
          aria-label="Interact Action"
        >
          {isBoatBoarded ? <Anchor className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
          {(isBoatBoarded || target) && (
            <span className="absolute -top-7 whitespace-nowrap rounded bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-black uppercase font-mono shadow-md">
              {isBoatBoarded ? 'DISMOUNT BOAT' : target?.verb}
            </span>
          )}
        </button>

        {/* SECONDARY ACTION ROW (Crouch, Torch, Sprint, Jump) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Crouch Toggle */}
          <button
            onClick={() => {
              triggerHaptic();
              game.input.isCrouching = !game.input.isCrouching;
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md shadow-xl active:scale-90 transition-all cursor-pointer ${
              isCrouching
                ? 'border-amber-400 bg-amber-500/30 text-amber-300'
                : 'border-stone-800 bg-black/75 text-stone-500'
            }`}
            aria-label="Toggle Crouch"
          >
            <ArrowDown className="h-5 w-5" />
          </button>

          {/* Flashlight / Torch Toggle */}
          <button
            onClick={() => {
              triggerHaptic();
              game.input.triggerTorch();
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md shadow-xl active:scale-90 transition-all cursor-pointer ${
              isTorchOn
                ? 'border-amber-400 bg-amber-500/30 text-amber-300'
                : 'border-stone-800 bg-black/75 text-stone-500'
            }`}
            aria-label="Toggle Torch"
          >
            <Flashlight className="h-5 w-5" />
          </button>

          {/* Meridian Celestial Lens Toggle */}
          <button
            onClick={() => {
              triggerHaptic();
              game.input.triggerLensToggle();
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md shadow-xl active:scale-90 transition-all cursor-pointer ${
              game.isLensModeActive
                ? 'border-cyan-400 bg-cyan-500/40 text-cyan-300 ring-2 ring-cyan-400/60'
                : 'border-stone-800 bg-black/75 text-stone-500'
            }`}
            aria-label="Toggle Meridian Spectral Lens"
          >
            <Sparkles className="h-5 w-5" />
          </button>

          {/* Sprint Toggle */}
          <button
            onClick={() => {
              triggerHaptic();
              game.input.triggerSprintToggle();
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md shadow-xl active:scale-90 transition-all cursor-pointer ${
              isSprinting
                ? 'border-amber-400 bg-amber-500/30 text-amber-300'
                : 'border-stone-800 bg-black/75 text-stone-500'
            }`}
            aria-label="Toggle Sprint"
          >
            <Zap className="h-5 w-5" />
          </button>

          {/* Jump */}
          <button
            onClick={() => {
              triggerHaptic();
              game.input.triggerJump();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-700 bg-black/75 text-stone-200 backdrop-blur-md shadow-xl active:scale-90 transition-transform cursor-pointer"
            aria-label="Jump"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
