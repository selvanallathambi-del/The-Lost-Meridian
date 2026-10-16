/**
 * The Lost Meridian - 1928 Edison Wax-Cylinder Phonograph Player
 * Spring-driven phonograph mandrel, acoustic horn sound, and field voice logs.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Disc, Play, Pause, RotateCw, Volume2, Sparkles } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface PhonographModalProps {
  game: GameManager;
  onClose: () => void;
}

interface WaxCylinder {
  id: string;
  code: string;
  title: string;
  date: string;
  speaker: string;
  duration: string;
  color: string;
  transcript: string;
}

const WAX_CYLINDERS: WaxCylinder[] = [
  {
    id: 'cyl_101',
    code: 'CYL #101',
    title: 'Departure from Callao Riverhead',
    date: 'October 14, 1924',
    speaker: 'Prof. Percival Vance',
    duration: '1m 18s',
    color: 'from-amber-900 to-amber-950',
    transcript:
      'Percival Vance dictating. We have pushed upstream past the rapids of the Rio Meridian. The native guides speak of singing subterranean grottos where the stones hum at sunrise. If my calculations on the solstice ephemeris are sound, the capstone alignment will occur when the Pleiades reach zenith.',
  },
  {
    id: 'cyl_102',
    code: 'CYL #102',
    title: 'The Resonance of the Chasm',
    date: 'November 2, 1924',
    speaker: 'Prof. Percival Vance',
    duration: '1m 42s',
    color: 'from-cyan-900 to-slate-950',
    transcript:
      'Extraordinary phenomenon today. In the chasm beyond the waterfall plunge pool, our acoustic tuning forks began vibrating spontaneously at 528 cycles. The limestone is not mere bedrock—it has been hollowed into massive acoustic waveguides by an astronomical civilization millennia before the Inka.',
  },
  {
    id: 'cyl_103',
    code: 'CYL #103',
    title: 'The Meridian Solar Capstone',
    date: 'December 21, 1924',
    speaker: 'Prof. Percival Vance',
    duration: '2m 05s',
    color: 'from-yellow-900 to-amber-950',
    transcript:
      'Solstice noon. The golden capstone atop the grand pyramid focused a beam of celestial daylight down through the vertical shaft. It struck the subterranean armillary projector, and for five glorious seconds, the entire cavern dome erupted into a projected map of the ancient heavens!',
  },
  {
    id: 'cyl_104',
    code: 'CYL #104',
    title: 'Final Testament & The Descent',
    date: 'January 12, 1925',
    speaker: 'Prof. Percival Vance',
    duration: '1m 55s',
    color: 'from-rose-950 to-stone-950',
    transcript:
      'Fever is setting in. The porters have fled back to the river. I am taking the diving rig down into the sunken crypt beneath the waterfall plunge pool. If Sterling ever finds this camp... know that the Meridian does not lead to gold, but to something that transcends time itself.',
  },
];

export const PhonographModal: React.FC<PhonographModalProps> = ({ game, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [springTension, setSpringTension] = useState(85); // 0..100

  const activeCylinder = WAX_CYLINDERS[selectedIdx];

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (springTension <= 10) {
        game.quest.showNotification('WIND MECHANICAL HAND-CRANK TO RESTORE SPRING TENSION');
        return;
      }
      setIsPlaying(true);
      audioEngine.playPhonographTrack(selectedIdx);
      game.quest.showNotification(`🎙️ PLAYING: ${activeCylinder.title.toUpperCase()}`);
    }
  };

  const handleCrank = () => {
    audioEngine.playSfx('click');
    setSpringTension((prev) => Math.min(100, prev + 25));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#16120e] shadow-2xl">
        {/* Left: Phonograph Player Apparatus */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#211a14] to-[#0f0b08] relative">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              1928 EDISON HOME PHONOGRAPH • SPRING MOTOR
            </span>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 tracking-wider">
              WAX-CYLINDER FIELD AUDIO LOGS
            </h2>
          </div>

          {/* Rotating Wax Mandrel & Horn Graphic */}
          <div className="relative flex flex-col items-center my-6">
            <div className="relative w-48 h-48 rounded-full border-4 border-amber-900/60 bg-[#19130d] flex items-center justify-center shadow-inner">
              {/* Spinning Wax Cylinder Rim */}
              <div
                className={`w-36 h-36 rounded-full border-4 border-dashed border-amber-500/50 flex items-center justify-center transition-transform ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '3.5s' }}
              >
                <Disc className="h-16 w-16 text-amber-600/70" />
              </div>

              {/* Tonearm Stylus */}
              <div className="absolute top-4 right-6 w-16 h-2 bg-amber-700/80 rotate-45 origin-right rounded-full shadow" />
            </div>

            {/* Cylinder Label Badge */}
            <div className="mt-3 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs font-mono font-bold">
              {activeCylinder.code} • {activeCylinder.title}
            </div>
          </div>

          {/* Player Transport Controls */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleCrank}
                className="px-3 py-2 rounded-xl bg-stone-900 border border-amber-900 hover:bg-stone-850 text-amber-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title="Wind Hand-Crank Spring Motor"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>WIND CRANK ({springTension}%)</span>
              </button>

              <button
                onClick={handlePlayToggle}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'STOP NEEDLE' : 'LOWER NEEDLE & PLAY'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Cylinder Library & Transcripts */}
        <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#19140f] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                RECOVERED WAX CYLINDERS
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Vance Expedition archival cylinders (1924–1925).
              </p>
            </div>

            {/* Cylinder Selector List */}
            <div className="space-y-2">
              {WAX_CYLINDERS.map((cyl, idx) => (
                <button
                  key={cyl.id}
                  onClick={() => {
                    setSelectedIdx(idx);
                    setIsPlaying(false);
                    audioEngine.playSfx('click');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    idx === selectedIdx
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400/50'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎙️</span>
                    <div>
                      <div className="font-cinzel text-xs font-bold">{cyl.title}</div>
                      <span className="text-[10px] font-mono text-stone-500">
                        {cyl.date} • {cyl.speaker}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Transcript Box */}
            <div className="rounded-xl border border-amber-900/50 bg-[#1e1710] p-3 space-y-1.5 max-h-44 overflow-y-auto">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                CYLINDER TRANSCRIPT:
              </span>
              <p className="text-xs font-serif text-stone-300 italic leading-relaxed">
                "{activeCylinder.transcript}"
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={() => {
                setIsPlaying(false);
                onClose();
              }}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            >
              STORE PHONOGRAPH HORN
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsPlaying(false);
            onClose();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
