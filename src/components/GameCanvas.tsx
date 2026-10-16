/**
 * Stillwater - Three.js WebGL Canvas Component
 * Clean, frictionless canvas with natural drag-to-orbit camera controls.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameManager } from '../game/GameManager';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface GameCanvasProps {
  game: GameManager;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ game }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webGlError, setWebGlError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      game.init(canvasRef.current);
      setWebGlError(null);
    } catch (err: any) {
      console.error('WebGL initialization failure:', err);
      setWebGlError(err?.message || 'WebGL Context could not be established.');
    }

    return () => {
      game.destroy();
    };
  }, [game]);

  const handleRetry = () => {
    setWebGlError(null);
    if (canvasRef.current) {
      try {
        game.init(canvasRef.current);
      } catch (err: any) {
        setWebGlError(err?.message || 'WebGL Context could not be established.');
      }
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onClick={() => {
          if (!game.input.isPointerLocked) {
            game.input.requestPointerLock();
          }
        }}
        className="absolute inset-0 h-full w-full block cursor-grab active:cursor-grabbing outline-none touch-none select-none"
      />

      {webGlError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-950/95 p-6 text-stone-200 backdrop-blur-md select-none">
          <div className="flex max-w-md flex-col items-center text-center space-y-4 rounded-2xl border border-amber-900/60 bg-stone-900/95 p-8 shadow-2xl">
            <AlertCircle className="h-12 w-12 text-amber-500 animate-pulse" />
            <h3 className="font-cinzel text-xl font-bold tracking-wider text-amber-200">
              EXPEDITION GRAPHICS RECOVERY
            </h3>
            <p className="text-xs font-mono text-stone-400 leading-relaxed">
              Hardware graphics acceleration was momentarily interrupted. Click below to re-initialize the expedition viewport.
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-600 px-6 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-500 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>RE-INITIALIZE EXPEDITION VIEWPORT</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
