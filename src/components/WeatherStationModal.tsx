/**
 * The Lost Meridian - 1928 Aneroid Barometer & Microclimate Weather Station
 * An antique brass meteorological instrument to monitor atmospheric pressure and summon weather states.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { WeatherType } from '../game/types';
import { X, CloudRain, Sun, CloudFog, CloudLightning, Moon, Wind } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface WeatherStationModalProps {
  game: GameManager;
  onClose: () => void;
}

interface ClimatePreset {
  id: WeatherType;
  name: string;
  pressure: number; // mmHg (normal ~760)
  icon: any;
  desc: string;
  ambientTone: string;
}

const PRESETS: ClimatePreset[] = [
  {
    id: 'CLEAR',
    name: 'Serene Golden Sun',
    pressure: 768,
    icon: Sun,
    desc: 'High atmospheric pressure. Crisp visibility, clear horizons, and gentle canopy breezes.',
    ambientTone: 'text-amber-400',
  },
  {
    id: 'RAIN',
    name: 'Tropical Monsoon',
    pressure: 742,
    icon: CloudLightning,
    desc: 'Low pressure tropical depression. Heavy rain torrents, lens condensation & distant thunder.',
    ambientTone: 'text-cyan-400',
  },
  {
    id: 'FOG',
    name: 'Mountain Grotto Mist',
    pressure: 755,
    icon: CloudFog,
    desc: 'Saturated valley humidity. Dense volumetric haze and diffused ethereal sunbeams.',
    ambientTone: 'text-stone-300',
  },
  {
    id: 'DESERT',
    name: 'Arid Valley Sirocco',
    pressure: 764,
    icon: Wind,
    desc: 'Dry gusts rolling from the northern canyon, clearing residual moisture.',
    ambientTone: 'text-orange-400',
  },
];

export const WeatherStationModal: React.FC<WeatherStationModalProps> = ({ game, onClose }) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherType>(game.weather.state.current);
  const [pressure, setPressure] = useState(() => {
    switch (game.weather.state.current) {
      case 'RAIN':
      case 'HEAVY_RAIN':
        return 742;
      case 'FOG':
        return 755;
      case 'DESERT':
        return 764;
      default:
        return 768;
    }
  });

  const handleApplyWeather = (preset: ClimatePreset) => {
    setCurrentWeather(preset.id);
    setPressure(preset.pressure);
    game.weather.setWeather(preset.id);

    if (preset.id === 'RAIN') {
      audioEngine.playThunder();
    } else {
      audioEngine.playSfx('stone');
    }

    game.quest.showNotification(`ATMOSPHERIC SHIFT: ${preset.name.toUpperCase()}`);
    if (game.onStateChange) game.onStateChange();
  };

  // Convert pressure (730..780) to needle rotation degrees (-75..+75 deg)
  const needleDeg = ((pressure - 755) / 25) * 65;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left: Antique Aneroid Barometer Instrument */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#181410] to-[#0c0a08] relative">
          <div className="text-center mb-4">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              EXPEDITION METEOROLOGICAL STATION
            </span>
            <h2 className="font-cinzel text-lg font-bold text-amber-200 tracking-wider">
              1928 ANEROID BAROMETER
            </h2>
            <span className="text-[11px] font-serif italic text-stone-400">
              Negretti & Zambra • London Instruments
            </span>
          </div>

          {/* Steampunk Brass Gauge Bezel */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-amber-700/80 bg-gradient-to-b from-[#f2e6cb] to-[#dfcead] shadow-[inset_0_4px_25px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
            {/* Inner dial markings */}
            <div className="absolute inset-4 rounded-full border-2 border-stone-800/40 flex flex-col items-center justify-between p-4">
              <span className="font-cinzel font-bold text-xs text-stone-800 tracking-widest mt-1">
                VARIABLE
              </span>

              <div className="flex w-full justify-between px-3 text-[10px] font-mono font-bold text-stone-700">
                <span className="text-cyan-800">STORMY<br />730</span>
                <span className="text-amber-900 text-right">VERY DRY<br />780</span>
              </div>

              {/* Central Pressure Reading */}
              <div className="text-center my-auto">
                <span className="font-mono text-2xl font-bold text-stone-900 tracking-tight block">
                  {pressure}
                </span>
                <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest">
                  mmHg • BAROMETRIC
                </span>
              </div>

              <span className="font-cinzel font-bold text-[10px] text-stone-700 mb-1">
                SET FAIR
              </span>
            </div>

            {/* Rotating Indicator Needle */}
            <div
              className="absolute w-1 bg-rose-700 origin-bottom rounded-t-full shadow-md transition-transform duration-700 ease-out"
              style={{
                height: '42%',
                bottom: '50%',
                transform: `rotate(${needleDeg}deg)`,
              }}
            >
              <div className="w-2.5 h-2.5 -ml-0.75 -top-1 rounded-full bg-rose-800 absolute" />
            </div>

            {/* Center Brass Cap */}
            <div className="absolute w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 border border-stone-900 shadow-md" />
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs font-mono text-stone-400">
            <span>Air Density: {(pressure / 760).toFixed(2)} atm</span>
            <span>•</span>
            <span className="text-amber-400">Field Elevation: 320m</span>
          </div>
        </div>

        {/* Right Sidebar: Microclimate Presets */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                ATMOSPHERIC REGIMES
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Alter the barometric chamber to shift valley conditions.
              </p>
            </div>

            <div className="space-y-2.5">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isActive = currentWeather === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyWeather(preset)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
                        : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800 hover:border-amber-600/40'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold">{preset.name}</span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {preset.pressure} mmHg
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight mt-1 line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-stone-800">
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
