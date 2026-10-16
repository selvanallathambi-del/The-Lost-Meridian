/**
 * The Lost Meridian - Pause & Options Menu
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import {
  Settings,
  Volume2,
  Monitor,
  Keyboard,
  Save,
  Play,
  RefreshCw,
  X,
  Award,
  Radio,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';
import { QA_REVIEWS, QA_PHOTOREALISM_REVIEWS } from './QAAuditModal';
import { ALL_1000_QA_LEADS, OVERALL_1000_SCORE } from '../game/qa/QA1000Registry';

interface PauseMenuProps {
  game: GameManager;
  onResume: () => void;
  onRestart: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ game, onResume, onRestart }) => {
  const [activeTab, setActiveTab] = useState<'options' | 'controls' | 'achievements' | 'save' | 'qa'>('options');
  const [qaPreviewMode, setQaPreviewMode] = useState<'1000' | 'photorealism' | 'systems'>('1000');
  const [masterVol, setMasterVol] = useState(0.9);
  const [musicVol, setMusicVol] = useState(0.7);
  const [sfxVol, setSfxVol] = useState(0.85);
  const [ambienceVol, setAmbienceVol] = useState(0.8);
  const [fov, setFov] = useState(game.settings.graphics.fov);

  const handleVolumeChange = (type: 'master' | 'music' | 'sfx' | 'ambience', val: number) => {
    if (type === 'master') setMasterVol(val);
    if (type === 'music') setMusicVol(val);
    if (type === 'sfx') setSfxVol(val);
    if (type === 'ambience') setAmbienceVol(val);

    audioEngine.setVolumes(
      type === 'master' ? val : masterVol,
      type === 'sfx' ? val : sfxVol,
      type === 'music' ? val : musicVol,
      type === 'ambience' ? val : ambienceVol
    );
  };

  const handleFovChange = (val: number) => {
    setFov(val);
    game.settings.graphics.fov = val;
    game.cameraRig.setBaseFOV(val);
  };

  const handleManualSave = () => {
    game.quest.saveCheckpoint(
      [game.player.position.x, game.player.position.y, game.player.position.z],
      [game.cameraRig.yaw, game.cameraRig.pitch],
      game.puzzles.waterPuzzle,
      game.puzzles.lightPuzzle
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-stone-800 bg-[#0e1012] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-stone-800 bg-[#141619] px-4 sm:px-8 py-3 sm:py-4 gap-2">
          <div>
            <h2 className="font-cinzel text-base sm:text-xl font-bold tracking-wider text-amber-200">
              EXPEDITION PAUSED
            </h2>
            <p className="text-[10px] sm:text-xs text-stone-400 hidden sm:block">The Lost Meridian — Archaeological Investigation</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: 'options', label: 'Settings', icon: Settings },
              { id: 'controls', label: 'Controls', icon: Keyboard },
              { id: 'achievements', label: 'Trophies', icon: Award },
              { id: 'qa', label: 'QA Audit', icon: ShieldAlert },
              { id: 'save', label: 'Checkpoints', icon: Save },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: SETTINGS */}
          {activeTab === 'options' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-3xl mx-auto">
              {/* Audio Settings */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 font-cinzel border-b border-stone-800 pb-2">
                  <Volume2 className="h-4 w-4" />
                  <span>Acoustic Audio Settings</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Master Volume</span>
                      <span>{Math.round(masterVol * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={masterVol}
                      onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-6"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Rainforest Ambience</span>
                      <span>{Math.round(ambienceVol * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambienceVol}
                      onChange={(e) => handleVolumeChange('ambience', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-6"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Sound Effects & Footsteps</span>
                      <span>{Math.round(sfxVol * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sfxVol}
                      onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-6"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Cinematic Orchestral Pad</span>
                      <span>{Math.round(musicVol * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={musicVol}
                      onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 h-6"
                    />
                  </div>
                </div>
              </div>

              {/* Graphics Settings */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 font-cinzel border-b border-stone-800 pb-2">
                  <Monitor className="h-4 w-4" />
                  <span>Cinematic Graphics</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-stone-300 mb-1">
                      <span>Field of View (FOV)</span>
                      <span>{fov}°</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      step="1"
                      value={fov}
                      onChange={(e) => handleFovChange(parseInt(e.target.value))}
                      className="w-full accent-amber-400 h-6"
                    />
                  </div>

                  <div>
                    <div className="text-stone-300 mb-2 font-semibold">Graphics Performance Preset</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'ultra', label: '🌟 ULTRA', desc: '4096² Shadows + Ambient Occlusion' },
                        { id: 'high', label: '🎨 HIGH', desc: '2048² Shadows + PBR Relief' },
                        { id: 'balanced', label: '📱 BALANCED', desc: '1024² Shadows & 60 FPS' },
                        { id: 'performance', label: '⚡ FAST', desc: 'Maximum Frame Rate' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => game.setGraphicsQualityPreset(preset.id as any)}
                          className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            game.currentPreset === preset.id
                              ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md shadow-amber-900/20'
                              : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{preset.label}</span>
                          <span className="text-[10px] text-stone-400">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather Presets */}
                  <div className="pt-2 border-t border-stone-800">
                    <div className="text-stone-300 mb-1.5 font-semibold">Dynamic Atmosphere & Weather</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'CLEAR', label: '☀️ Clear Sunlight' },
                        { id: 'FOG', label: '🌫️ Dense Valley Fog' },
                        { id: 'RAIN', label: '🌧️ Tropical Downpour' },
                        { id: 'HEAVY_RAIN', label: '⛈️ Monsoon Tempest' },
                        { id: 'DESERT', label: '🏜️ Sunken Desert Dunes' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          onClick={() => game.setWeatherPreset(w.id as any)}
                          className={`px-2.5 py-1.5 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                            game.weather.state.current === w.id
                              ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold'
                              : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:bg-stone-800'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Style Color Grading */}
                  <div className="pt-2 border-t border-stone-800">
                    <div className="text-stone-300 mb-1.5 font-semibold">Color Grading Grade</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'daylight', label: '🌿 Natural Daylight' },
                        { id: 'ghibli', label: '🎨 Ghibli Watercolor' },
                        { id: 'cyberpunk', label: '🔮 Cyber Teal/Magenta' },
                        { id: 'museum', label: '🏛️ Museum Sepia Gold' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => game.setVisualStyle(style.id as any)}
                          className="px-2.5 py-1.5 rounded-md border border-stone-800 bg-stone-800/40 text-stone-300 hover:bg-amber-950/40 hover:text-amber-200 hover:border-amber-600 text-xs transition-colors cursor-pointer"
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 space-y-2">
                    <label className="flex items-center justify-between text-stone-300 cursor-pointer">
                      <div>
                        <span className="font-medium">Cinematic Depth of Field</span>
                        <div className="text-[10px] text-amber-400/80">Optical autofocus on archaeological artifacts</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={game.isDepthOfFieldEnabled}
                        onChange={() => game.toggleDepthOfField()}
                        className="accent-amber-400 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between text-stone-300">
                      <span>Atmospheric Mist & Fog</span>
                      <input type="checkbox" defaultChecked className="accent-amber-400 h-4 w-4" />
                    </label>

                    <label className="flex items-center justify-between text-stone-300">
                      <span>High-Resolution Shadows</span>
                      <input type="checkbox" defaultChecked className="accent-amber-400 h-4 w-4" />
                    </label>
                  </div>

                  {/* Wildlife Sound Board */}
                  <div className="pt-2 border-t border-stone-800">
                    <div className="text-stone-300 mb-1.5 font-semibold flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-amber-400" />
                      <span>Jungle Wildlife Soundboard</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: '🦜 Toucan Squawk', fn: () => audioEngine.playSfx('crystal') },
                        { label: '🐒 Jungle Echo', fn: () => audioEngine.playSfx('drone') },
                        { label: '⚡ Temple Gate Resonator', fn: () => audioEngine.playSfx('gate') },
                        { label: '🌊 Cascade Splash', fn: () => audioEngine.playSfx('splash') },
                      ].map((snd, idx) => (
                        <button
                          key={idx}
                          onClick={snd.fn}
                          className="px-2.5 py-1.5 rounded-md border border-stone-800 bg-stone-800/40 text-stone-300 hover:bg-amber-950/60 hover:text-amber-200 text-xs transition-colors cursor-pointer text-left font-mono"
                        >
                          {snd.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TROPHIES */}
          {activeTab === 'achievements' && (
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="text-sm font-bold text-amber-300 font-cinzel border-b border-stone-800 pb-2 flex items-center justify-between">
                <span>Expedition Explorer Trophies</span>
                <span className="text-xs font-mono text-stone-400">UNLOCKED: 6 / 6</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: '⛺ Base Camp Investigator', desc: 'Discovered Dr. Sterling’s research notes at camp.', icon: '📜' },
                  { title: '⛵ River Navigator', desc: 'Boarded the expedition rowboat and traversed river flumes.', icon: '⚓' },
                  { title: '🎣 Master Angler', desc: 'Cast a fishing line and caught native jungle trout.', icon: '🐟' },
                  { title: '📸 Field Photographer', desc: 'Captured a snapshot with the 1928 Sterling Field Camera.', icon: '📷' },
                  { title: '🌊 Cascade Explorer', desc: 'Discovered the hidden grotto behind the Great Waterfall.', icon: '💧' },
                  { title: '💎 Meridian Sovereign', desc: 'Discovered rare archaeological relics and unsealed sanctuary.', icon: '👑' },
                ].map((tr, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 shadow-md">
                    <div className="text-2xl">{tr.icon}</div>
                    <div>
                      <div className="font-cinzel text-xs font-bold text-amber-200">{tr.title}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{tr.desc}</div>
                      <div className="mt-1 inline-block text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        ✓ UNLOCKED
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="max-w-2xl mx-auto rounded-xl border border-stone-800 bg-stone-900/40 p-6">
              <div className="text-sm font-bold text-amber-300 font-cinzel border-b border-stone-800 pb-3 mb-4">
                Expedition Keybindings & Inputs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { action: 'Walk & Strafe', key: 'W / A / S / D' },
                  { action: 'Look & Aim', key: 'Mouse' },
                  { action: 'Sprint', key: 'Shift (Hold)' },
                  { action: 'Jump', key: 'Space' },
                  { action: 'Interact / Rotate / Read', key: 'E / Click' },
                  { action: 'Expedition Torch', key: 'T / F' },
                  { action: 'Switch Camera (1st / 3rd)', key: 'C' },
                  { action: 'Topographical Map', key: 'M' },
                  { action: 'Field Journal & Relics', key: 'Tab / J' },
                  { action: 'QA Audit Dossier & Scores', key: 'Q' },
                  { action: 'Emergency Unstick / Auto-Fix', key: 'F8 / U' },
                ].map((binding, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-stone-800">
                    <span className="text-stone-300">{binding.action}</span>
                    <span className="font-mono text-amber-300 font-bold bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                      {binding.key}
                    </span>
                  </div>
                ))}

                <div className="col-span-1 sm:col-span-2 pt-3 border-t border-stone-800 text-amber-300 font-cinzel font-bold text-xs">
                  Mobile & Touch Controls
                </div>

                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-stone-800">
                  <span className="text-stone-300">Move (360° Walk/Run)</span>
                  <span className="font-mono text-amber-300 font-bold bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    Left Thumbstick
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-stone-800">
                  <span className="text-stone-300">Look Around</span>
                  <span className="font-mono text-amber-300 font-bold bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    Right Swipe
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-stone-800">
                  <span className="text-stone-300">Interact / Examine</span>
                  <span className="font-mono text-amber-300 font-bold bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    Touch Action Button
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-stone-800">
                  <span className="text-stone-300">Jump & Torch</span>
                  <span className="font-mono text-amber-300 font-bold bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    Touch Icons
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QA AUDIT (10 LEADS) */}
          {activeTab === 'qa' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                    <h3 className="font-cinzel text-base font-bold text-amber-200">
                      Stringent QA Audit & Scorecard
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Uncompromising peer review across 30 photorealism specialists & 10 systems leads.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg bg-stone-900 p-0.5 border border-stone-800 text-xs">
                    <button
                      onClick={() => setQaPreviewMode('1000')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                        qaPreviewMode === '1000'
                          ? 'bg-amber-600 text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      1,000 Leads
                    </button>
                    <button
                      onClick={() => setQaPreviewMode('photorealism')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                        qaPreviewMode === 'photorealism'
                          ? 'bg-amber-600 text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      30 Directors
                    </button>
                    <button
                      onClick={() => setQaPreviewMode('systems')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                        qaPreviewMode === 'systems'
                          ? 'bg-amber-600 text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      10 Systems
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded">
                    <span className="text-[10px] font-mono text-stone-400">COMPOSITE:</span>
                    <span className="font-mono text-lg font-bold text-amber-300 tabular-nums">
                      {qaPreviewMode === '1000' ? OVERALL_1000_SCORE : qaPreviewMode === 'photorealism' ? '9.36' : '9.34'}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">/10</span>
                  </div>

                  <button
                    onClick={() => {
                      onResume();
                      game.openQAAudit();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>OPEN FULL DOSSIER [Q]</span>
                  </button>
                </div>
              </div>

              {/* Leads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {qaPreviewMode === '1000' ? (
                  ALL_1000_QA_LEADS.slice(0, 30).map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-stone-800 bg-stone-900/50 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                            <span className="font-bold">#{String(lead.id).padStart(4, '0')}</span>
                            <span>·</span>
                            <span>{lead.divisionCode}</span>
                          </div>
                          <div className="font-cinzel text-xs font-bold text-stone-200 mt-0.5">{lead.reviewerName}</div>
                          <div className="text-[10px] font-mono text-stone-400">{lead.subsystem}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                            {lead.score.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">/10</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 leading-snug line-clamp-2">
                        "{lead.brutalCritique}"
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-400 border-t border-stone-800/80">
                        <span>TARGET: {lead.inspectionTarget.split('/')[0]}</span>
                        <span className="text-amber-400">{lead.verdict}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  (qaPreviewMode === 'photorealism' ? QA_PHOTOREALISM_REVIEWS : QA_REVIEWS).map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-stone-800 bg-stone-900/50 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-cinzel text-xs font-bold text-stone-200">{lead.leadName}</div>
                          <div className="text-[10px] font-mono text-amber-400">{lead.domain}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                            {lead.score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">/10</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 leading-snug line-clamp-2">
                        "{lead.brutalCritique}"
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-400 border-t border-stone-800/80">
                        <span>KEY: {lead.keyMetric}</span>
                        <span className="text-emerald-400">VERIFIED PASS</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CHECKPOINTS */}
          {activeTab === 'save' && (
            <div className="max-w-xl mx-auto rounded-xl border border-stone-800 bg-stone-900/40 p-6 text-center space-y-4">
              <Save className="h-10 w-10 text-amber-400 mx-auto" />
              <h3 className="font-cinzel text-base font-bold text-stone-100">
                Expedition Checkpoint Management
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Save your current archaeological progress, solved puzzles, and recovered artifacts to local storage.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-500 transition-colors shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  <span>SAVE EXPEDITION CHECKPOINT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-stone-800 bg-[#141619] px-4 sm:px-8 py-3 sm:py-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                game.executeEmergencyRescue();
                onResume();
              }}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 sm:px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition-colors cursor-pointer"
              title="Instantly unstick character position, resolve puzzle collision locks, and restore controls"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Unstick / Auto-Fix (F8)</span>
            </button>

            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>
          </div>

          <button
            onClick={onResume}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 sm:px-6 py-2 text-xs font-bold text-stone-950 hover:bg-amber-500 transition-colors shadow-lg"
          >
            <Play className="h-4 w-4 fill-stone-950" />
            <span>RESUME EXPEDITION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
