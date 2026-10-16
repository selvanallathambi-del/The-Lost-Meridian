/**
 * The Lost Meridian - 1928 Archaeological Cartography Survey Table
 * Interactive topographical field chart with live expedition tracking & fast-travel waypoints.
 */

import React, { useEffect, useRef } from 'react';
import { GameManager } from '../game/GameManager';
import { X, MapPin, Anchor, Compass, Sparkles, Tent, Waves, Landmark, KeyRound } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface MapModalProps {
  game: GameManager;
  onClose: () => void;
}

interface LandmarkWaypoint {
  id: string;
  name: string;
  desc: string;
  pos: [number, number, number];
  icon: any;
  color: string;
  minZ: number; // Discovered when player has advanced near or past this Z
}

const LANDMARKS: LandmarkWaypoint[] = [
  {
    id: 'camp',
    name: 'Expedition Base Camp',
    desc: 'Dr. Sterling’s research tents, field desk & phonograph.',
    pos: [0, 1.2, 70],
    icon: Tent,
    color: '#d97706',
    minZ: 999, // Always unlocked
  },
  {
    id: 'dock',
    name: 'Stillwater Mill & Dock',
    desc: 'Wooden rowboat mooring, waterwheel & riverside pier.',
    pos: [-4.5, -1.2, 14],
    icon: Anchor,
    color: '#0284c7',
    minZ: 40,
  },
  {
    id: 'waterfall',
    name: 'Great Cascade & Grotto',
    desc: 'Roaring falls, mist plunge pool & hidden rock passage.',
    pos: [0, -1.5, -34],
    icon: Waves,
    color: '#06b6d4',
    minZ: -20,
  },
  {
    id: 'temple',
    name: 'Grand Meridian Temple',
    desc: 'Monumental stepped pyramid, solar prisms & celestial crest.',
    pos: [0, 0.5, -128],
    icon: Landmark,
    color: '#eab308',
    minZ: -90,
  },
  {
    id: 'sanctuary',
    name: 'Deep Meridian Sanctuary',
    desc: 'Subterranean chasm, resonant keystole & radiant core.',
    pos: [0, -3.8, -218],
    icon: KeyRound,
    color: '#a855f7',
    minZ: -180,
  },
];

export const MapModal: React.FC<MapModalProps> = ({ game, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Aged Parchment Background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 1.5);
    bgGrad.addColorStop(0, '#f2e8d3');
    bgGrad.addColorStop(0.8, '#e5d7bc');
    bgGrad.addColorStop(1, '#c9b491');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Latitude / Longitude Survey Grid
    ctx.strokeStyle = 'rgba(120, 90, 60, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 3. Topographical Elevation Contour Lines
    ctx.strokeStyle = 'rgba(140, 110, 80, 0.22)';
    ctx.lineWidth = 1.2;
    [0.15, 0.35, 0.55, 0.75].forEach((scale) => {
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.5, w * scale * 0.8, h * scale * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Meandering River Basin & Waterfalls
    ctx.fillStyle = '#7fa7b5';
    ctx.beginPath();
    ctx.moveTo(w * 0.44, 0);
    ctx.bezierCurveTo(w * 0.38, h * 0.28, w * 0.58, h * 0.48, w * 0.42, h);
    ctx.lineTo(w * 0.56, h);
    ctx.bezierCurveTo(w * 0.70, h * 0.48, w * 0.48, h * 0.28, w * 0.54, 0);
    ctx.closePath();
    ctx.fill();

    // Stillwater mill pond widening
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.54, 52, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Jungle Trail Dashed Line
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.88); // Camp
    ctx.lineTo(w * 0.42, h * 0.56); // Mill dock
    ctx.lineTo(w * 0.48, h * 0.38); // Waterfall
    ctx.lineTo(w * 0.5, h * 0.2);   // Temple
    ctx.lineTo(w * 0.5, h * 0.06);  // Meridian
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Draw Waypoint Circles on Canvas
    LANDMARKS.forEach((lm) => {
      const isDiscovered = game.player.position.z <= lm.minZ || lm.minZ === 999;
      const lx = ((lm.pos[0] + 30) / 60) * w;
      // Z ranges from ~80 (south, bottom) down to -230 (north, top)
      const ly = (1.0 - (lm.pos[2] + 240) / 320) * h;

      ctx.fillStyle = isDiscovered ? lm.color : '#a8a29e';
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#292524';
      ctx.font = 'bold 9px Cinzel, serif';
      ctx.fillText(lm.name, lx + 9, ly + 3);
    });

    // 7. Rowboat Marker
    const boatNormX = ((game.boat.position.x + 30) / 60) * w;
    const boatNormY = (1.0 - (game.boat.position.z + 240) / 320) * h;
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(boatNormX, boatNormY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '8px monospace';
    ctx.fillText('🛶 Rowboat', boatNormX + 8, boatNormY + 3);

    // 8. Player Live Location & Orientation Cone
    const px = ((game.player.position.x + 30) / 60) * w;
    const py = (1.0 - (game.player.position.z + 240) / 320) * h;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(game.cameraRig.yaw + Math.PI);

    // Vision cone
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 24, -Math.PI / 4, Math.PI / 4);
    ctx.closePath();
    ctx.fill();

    // Red beacon
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('📍 YOU ARE HERE', px - 35, py - 12);

    // Compass Rose in Top Corner
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 11px Cinzel, serif';
    ctx.fillText('▲ N', w - 32, 22);
  }, [game]);

  const handleFastTravel = (lm: LandmarkWaypoint) => {
    game.player.position.set(lm.pos[0], lm.pos[1], lm.pos[2]);
    audioEngine.playMapFastTravel();
    game.quest.showNotification(`FAST-TRAVELED TO: ${lm.name.toUpperCase()}`);
    if (game.onStateChange) game.onStateChange();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left: Vintage Topographical Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#181410] to-[#0c0a08]">
          <div className="flex w-full items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              <span className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 tracking-wider">
                SURVEY SECTOR 7: MERIDIAN EXPEDITION CHART
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80">1928 ROYAL GEOGRAPHIC</span>
          </div>

          <div className="relative w-full rounded-xl overflow-hidden border border-amber-900/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]">
            <canvas ref={canvasRef} width={500} height={380} className="w-full h-auto block" />
          </div>

          <div className="w-full flex items-center justify-between text-[10px] font-mono text-stone-400 mt-2">
            <span>Coordinates: X {Math.round(game.player.position.x)}m | Z {Math.round(game.player.position.z)}m</span>
            <span className="text-amber-300">Elevation: {Math.round(game.player.position.y * 10) / 10}m</span>
          </div>
        </div>

        {/* Right Sidebar: Fast-Travel Waypoints List */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">EXPEDITION WAYPOINTS</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Click any discovered landmark to fast travel.</p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {LANDMARKS.map((lm) => {
                const Icon = lm.icon;
                const isDiscovered = game.player.position.z <= lm.minZ || lm.minZ === 999;
                const isCurrent = Math.abs(game.player.position.z - lm.pos[2]) < 20;

                return (
                  <button
                    key={lm.id}
                    disabled={!isDiscovered}
                    onClick={() => handleFastTravel(lm)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-amber-600/25 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                        : isDiscovered
                        ? 'bg-stone-900/90 border-stone-800 text-stone-200 hover:bg-stone-800 hover:border-amber-600/50'
                        : 'bg-stone-950/60 border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div
                      className="p-1.5 rounded-lg shrink-0 mt-0.5"
                      style={{ backgroundColor: isDiscovered ? `${lm.color}25` : '#292524', color: lm.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-[11px] font-bold truncate">
                          {lm.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] font-mono bg-amber-500/20 text-amber-300 px-1 rounded">
                            HERE
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-stone-400 line-clamp-1 mt-0.5">{lm.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 py-2.5 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              <span>RETURN TO EXPEDITION</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
