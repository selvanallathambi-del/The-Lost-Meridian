/**
 * The Lost Meridian - Expedition Campfire Hearth & Billycan Brewing
 * Brew field herbal infusions over glowing embers to gain dynamic survival perks.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Flame, Coffee, Sparkles, CheckCircle2, Shield, Wind, Droplets } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface CampfireBrewModalProps {
  game: GameManager;
  onClose: () => void;
}

export interface BrewRecipe {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  perkTitle: string;
  perkDesc: string;
  durationSeconds: number;
  color: string;
  ingredients: string;
}

export const BREW_RECIPES: BrewRecipe[] = [
  {
    id: 'yerba_mate',
    name: 'Amazonian Yerba Mate',
    subtitle: 'High-Altitude Wild Leaf Infusion',
    icon: Wind,
    perkTitle: 'ENDLESS STRIDE (180s)',
    perkDesc: '+40% Sprint Movement Speed & Zero Stamina Drain while exploring.',
    durationSeconds: 180,
    color: '#10b981',
    ingredients: 'Harvested Forest Leaves • Spring Water • Gourd Gourd',
  },
  {
    id: 'dark_coffee',
    name: "Dr. Sterling's Dark Roast Coffee",
    subtitle: 'Colombian Field Ration Grounds',
    icon: Coffee,
    perkTitle: 'KEEN FOCUS (180s)',
    perkDesc: '+35% Interaction Inspection Distance & Steady Camera Shutter Zoom.',
    durationSeconds: 180,
    color: '#f59e0b',
    ingredients: 'Tin Billycan • Roasted Arabica Grounds • Boiling Kettle Water',
  },
  {
    id: 'grotto_mint',
    name: 'Subterranean Grotto Mint Infusion',
    subtitle: 'Limestone Plunge Pool Mentha',
    icon: Droplets,
    perkTitle: 'DEEP DIVER LUNGS (180s)',
    perkDesc: 'Oxygen depletion rate reduced by 50% during submerged dives.',
    durationSeconds: 180,
    color: '#06b6d4',
    ingredients: 'Fresh Grotto Mint Leaves • Crushed River Fern • Mineral Spring',
  },
];

export const CampfireBrewModal: React.FC<CampfireBrewModalProps> = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState<'infusions' | 'rest'>('infusions');
  const [selectedBrew, setSelectedBrew] = useState<BrewRecipe>(BREW_RECIPES[0]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [activePerkId, setActivePerkId] = useState<string | null>(game.activePerk?.id || null);

  const handleBrew = (recipe: BrewRecipe) => {
    setIsBrewing(true);
    audioEngine.playLiquidPour();

    setTimeout(() => {
      setIsBrewing(false);
      setActivePerkId(recipe.id);

      // Apply perk to game state
      game.applyBrewPerk({
        id: recipe.id,
        name: recipe.name,
        perkTitle: recipe.perkTitle,
        durationSeconds: recipe.durationSeconds,
        expiresAt: Date.now() + recipe.durationSeconds * 1000,
      });

      audioEngine.playItemDiscovery();
      game.quest.showNotification(`☕ BREWED: ${recipe.name.toUpperCase()} CONSUMED!`);
      if (game.onStateChange) game.onStateChange();
    }, 1200);
  };

  const handleRestWatch = (targetHour: number, watchName: string) => {
    setIsResting(true);
    audioEngine.playCampfireCrackle();

    setTimeout(() => {
      setIsResting(false);
      game.timeOfDay = targetHour;
      game.atmosphere.setTimeOfDay(targetHour);
      game.player.stamina = game.player.maxStamina;

      audioEngine.playCampfireCrackle();
      game.quest.showNotification(`⛺ RESTED BY HEARTH: ADVANCED TO ${watchName.toUpperCase()}`);
      if (game.onStateChange) game.onStateChange();
    }, 1000);
  };

  const WATCHES = [
    { hour: 6.0, name: 'Dawn Watch (06:00)', desc: 'Cool morning mist, waking birds, soft golden horizon', icon: '🌅' },
    { hour: 12.0, name: 'Midday Zenith (12:00)', desc: 'High overhead sun, sharp canopy light shafts, maximum visibility', icon: '☀️' },
    { hour: 18.0, name: 'Golden Twilight (18:00)', desc: 'Amber sunset glow, long shadows across ruins, calm river', icon: '🌇' },
    { hour: 23.0, name: 'Starlit Midnight (23:00)', desc: 'Dark starry canopy, glowing fireflies, cool nocturnal breeze', icon: '🌌' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-600/50 bg-[#12100e] shadow-2xl">
        {/* Left: Campfire Hearth & Billycan Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#181410] to-[#0c0a08] relative">
          <div className="text-center mb-4">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">
              1928 EXPEDITION CAMPFIRE HEARTH
            </span>
            <h2 className="font-cinzel text-lg font-bold text-amber-200 tracking-wider">
              {activeTab === 'infusions' ? 'FIELD HEARTH & BILLYCAN INFUSIONS' : 'REST BY HEARTH & PASS THE WATCH'}
            </h2>
            <span className="text-[11px] font-serif italic text-stone-400">
              Hardwood Charcoal • Drifting Embers • Explorer Respite
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 mb-6 bg-stone-900/90 p-1 rounded-full border border-stone-800">
            <button
              onClick={() => setActiveTab('infusions')}
              className={`px-4 py-1.5 rounded-full text-xs font-cinzel font-bold transition-all cursor-pointer ${
                activeTab === 'infusions'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              BILLYCAN INFUSIONS
            </button>
            <button
              onClick={() => setActiveTab('rest')}
              className={`px-4 py-1.5 rounded-full text-xs font-cinzel font-bold transition-all cursor-pointer ${
                activeTab === 'rest'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              REST & PASS WATCH
            </button>
          </div>

          {/* Cast Iron Kettle on Hearth Embers */}
          <div className="relative w-64 h-64 rounded-full border-4 border-amber-900/60 bg-gradient-to-b from-[#2a1b12] to-[#120b07] flex flex-col items-center justify-center shadow-[inset_0_4px_25px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.2)]">
            {/* Glowing Embers Base */}
            <div className="absolute bottom-6 flex gap-2">
              <div className="w-8 h-3 rounded-full bg-rose-600 animate-pulse shadow-[0_0_15px_#f43f5e]" />
              <div className="w-10 h-3 rounded-full bg-amber-500 animate-pulse delay-75 shadow-[0_0_15px_#f59e0b]" />
              <div className="w-6 h-3 rounded-full bg-orange-600 animate-pulse delay-150 shadow-[0_0_15px_#ea580c]" />
            </div>

            {/* Kettle or Campfire Visual */}
            <div className={`relative flex flex-col items-center ${isBrewing || isResting ? 'animate-bounce' : ''}`}>
              {/* Rising Steam / Smoke */}
              <div className="flex gap-1 mb-1">
                <span className="w-1 h-6 rounded-full bg-stone-300/40 animate-pulse" />
                <span className="w-1 h-8 rounded-full bg-stone-300/60 animate-pulse delay-100" />
                <span className="w-1 h-5 rounded-full bg-stone-300/40 animate-pulse delay-200" />
              </div>

              <div className="w-24 h-20 rounded-2xl bg-stone-800 border-2 border-stone-600 shadow-xl flex items-center justify-center text-4xl">
                <span>{activeTab === 'infusions' ? '🫖' : '⛺'}</span>
              </div>
            </div>

            {(isBrewing || isResting) && (
              <span className="absolute bottom-16 text-xs font-cinzel font-bold text-amber-300 animate-pulse">
                {isBrewing ? 'STEEPING INFUSION...' : 'RESTING BY HEARTH...'}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-stone-400">
            <Flame className="h-4 w-4 text-orange-400" />
            <span>Cast-iron hearth glowing over hardwood charcoal.</span>
          </div>
        </div>

        {/* Right Sidebar: Brew Selection or Pass the Watch */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 bg-[#161310] p-6 flex flex-col justify-between">
          {activeTab === 'infusions' ? (
            <div className="space-y-4">
              <div className="border-b border-stone-800 pb-2">
                <span className="font-cinzel text-xs font-bold text-amber-300">
                  FIELD RECIPES & PERKS
                </span>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Select an infusion and boil over the campfire.
                </p>
              </div>

              {/* Recipe List */}
              <div className="space-y-2.5">
                {BREW_RECIPES.map((recipe) => {
                  const Icon = recipe.icon;
                  const isSelected = selectedBrew.id === recipe.id;
                  const isActivePerk = activePerkId === recipe.id;

                  return (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedBrew(recipe)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
                          : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-cinzel text-xs font-bold">{recipe.name}</span>
                          {isActivePerk && (
                            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 leading-tight mt-1">
                          {recipe.perkDesc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Brew Details */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-3.5 space-y-1.5 text-xs">
                <span className="font-cinzel font-bold text-amber-300 text-xs block">
                  {selectedBrew.perkTitle}
                </span>
                <p className="text-[11px] text-stone-300 leading-relaxed italic">
                  "{selectedBrew.ingredients}"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-stone-800 pb-2">
                <span className="font-cinzel text-xs font-bold text-amber-300">
                  EXPEDITION WATCH PERIODS
                </span>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Rest by the hearth embers to advance the expedition day.
                </p>
              </div>

              {/* Watch List */}
              <div className="space-y-2.5">
                {WATCHES.map((w) => (
                  <button
                    key={w.hour}
                    onClick={() => handleRestWatch(w.hour, w.name)}
                    disabled={isResting}
                    className="w-full text-left p-3 rounded-2xl border border-amber-900/40 bg-stone-900/80 hover:bg-amber-950/40 hover:border-amber-600/60 transition-all cursor-pointer flex items-start gap-3 text-stone-200"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{w.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-cinzel text-xs font-bold text-amber-300 block">
                        {w.name}
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                        {w.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-3 text-[11px] text-stone-300 font-serif italic">
                "Resting beside the campfire fully restores explorer stamina and adjusts solar shadows."
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
            {activeTab === 'infusions' && (
              <button
                onClick={() => handleBrew(selectedBrew)}
                disabled={isBrewing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 py-3 text-xs font-cinzel font-bold transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Flame className="h-4 w-4 text-stone-950" />
                <span>{isBrewing ? 'STEEPING INFUSION...' : `BOIL & DRINK ${selectedBrew.name.toUpperCase()}`}</span>
              </button>
            )}

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
