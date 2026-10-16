/**
 * The Lost Meridian - Endemic Botanical Herbarium & Specimen Press
 * Botanist's wooden screw-press album catalogue with pressed dried flora and ethnobotanical notes.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import { X, Sparkles, BookOpen, CheckCircle, Leaf } from 'lucide-react';
import { audioEngine } from '../game/audio/AudioEngine';

interface HerbariumModalProps {
  game: GameManager;
  onClose: () => void;
}

export interface PlantSpecimen {
  id: string;
  commonName: string;
  latinName: string;
  family: string;
  location: string;
  rarity: 'Common' | 'Rare' | 'Mythic';
  color: string;
  sketchSymbol: string;
  medicinalUse: string;
  botanicalDescription: string;
}

export const ENDEMIC_PLANTS: PlantSpecimen[] = [
  {
    id: 'plant_grotto_orchid',
    commonName: 'Luminescent Grotto Orchid',
    latinName: 'Orchis grottoides lumines',
    family: 'Orchidaceae',
    location: 'Waterfall Plunge Pool & Grotto Rocks',
    rarity: 'Mythic',
    color: '#38bdf8',
    sketchSymbol: '🪻',
    medicinalUse: 'Infused petals yield high acoustic sensitivity and respiratory calming in saturated cave air.',
    botanicalDescription: 'Epiphytic orchid with waxy bioluminescent turquoise labellum that glows in subterranean darkness.',
  },
  {
    id: 'plant_meridian_fern',
    commonName: 'Sacred Meridian Spiral Fern',
    latinName: 'Polypodium meridiana aurea',
    family: 'Polypodiaceae',
    location: 'Grand Temple Pyramid Colonnade Steps',
    rarity: 'Rare',
    color: '#fbbf24',
    sketchSymbol: '🍃',
    medicinalUse: 'Burned as ceremonial incense by ancient priests to calm nervous tremors during astronomical alignments.',
    botanicalDescription: 'Fibrous fronds unfurling in golden logarithmic spirals aligned precisely with solar solstice rays.',
  },
  {
    id: 'plant_dragons_blood',
    commonName: "Crimson Dragon's Blood Blossom",
    latinName: 'Croton lechleri sanguis',
    family: 'Euphorbiaceae',
    location: 'Riverside Mangrove Roots & Landing',
    rarity: 'Rare',
    color: '#f43f5e',
    sketchSymbol: '🌺',
    medicinalUse: 'Dense scarlet resin acts as a rapid coagulant and antiseptic against tropical thorn lacerations.',
    botanicalDescription: 'Clusters of deep carmine inflorescences that exude a thick ruby-red resin when harvested at twilight.',
  },
];

export const HerbariumModal: React.FC<HerbariumModalProps> = ({ game, onClose }) => {
  const [selectedPlant, setSelectedPlant] = useState<PlantSpecimen>(ENDEMIC_PLANTS[0]);

  // Track collected plants from inventory
  const isCollected = (id: string) => {
    return game.quest.inventory.some((item) => item.id === id);
  };

  const handleSelect = (plant: PlantSpecimen) => {
    setSelectedPlant(plant);
    audioEngine.playJournalTurn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in text-stone-200">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-emerald-700/50 bg-[#101511] shadow-2xl">
        {/* Left: Pressed Botanical Specimen Sheet */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#141c15] to-[#0a100b] relative">
          <div className="text-center mb-4">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
              EXPEDITION BOTANICAL ARCHIVE • 1928
            </span>
            <h2 className="font-cinzel text-lg font-bold text-emerald-200 tracking-wider">
              DR. STERLING'S HERBARIUM PRESS
            </h2>
            <span className="text-[11px] font-serif italic text-stone-400">
              Royal Botanical Gardens • Latin America Sector
            </span>
          </div>

          {/* Pressed Herbarium Specimen Sheet Plate */}
          <div className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-2xl border-4 border-amber-900/60 bg-[#f4ede0] text-stone-900 p-5 shadow-[inset_0_2px_15px_rgba(0,0,0,0.15),0_10px_35px_rgba(0,0,0,0.7)] flex flex-col justify-between overflow-hidden">
            {/* Stamp / Herbarium Header */}
            <div className="border-b border-stone-400/80 pb-2 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-stone-600 block uppercase">
                  FLORA OF THE RIO MERIDIAN
                </span>
                <span className="font-cinzel text-xs font-bold text-stone-900">
                  {selectedPlant.commonName}
                </span>
              </div>
              <span className="text-[9px] font-mono bg-stone-300 px-2 py-0.5 rounded text-stone-800">
                {selectedPlant.rarity.toUpperCase()}
              </span>
            </div>

            {/* Specimen Illustration / Pressed Dried Flower Display */}
            <div className="relative my-auto flex flex-col items-center justify-center py-4">
              {/* Parchment tape strips */}
              <div className="w-16 h-4 bg-amber-100/80 -rotate-12 border border-stone-300 shadow-sm mb-1" />
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-md border-2 border-stone-300"
                style={{ backgroundColor: `${selectedPlant.color}15` }}
              >
                <span>{selectedPlant.sketchSymbol}</span>
              </div>
              <div className="w-16 h-4 bg-amber-100/80 rotate-12 border border-stone-300 shadow-sm mt-1" />

              <span className="font-serif italic text-sm font-bold text-stone-800 mt-3">
                {selectedPlant.latinName}
              </span>
              <span className="text-[10px] font-mono text-stone-600">
                Family: {selectedPlant.family}
              </span>
            </div>

            {/* Botanical Card Footer */}
            <div className="border-t border-stone-400/80 pt-2 flex items-center justify-between text-[9px] font-mono text-stone-700">
              <span>Coll. by Arthur Sterling</span>
              <span className="font-bold">Oct 1928 • Specimen #{selectedPlant.id.slice(-2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Specimen Directory & Ethnobotanical Lore */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-emerald-900/40 bg-[#0d140e] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-800 pb-2">
              <span className="font-cinzel text-xs font-bold text-emerald-300">
                ENDEMIC TAXONOMY
              </span>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Select an endemic specimen to inspect botanical field entries.
              </p>
            </div>

            {/* Plant List Buttons */}
            <div className="space-y-2">
              {ENDEMIC_PLANTS.map((plant) => {
                const collected = isCollected(plant.id);
                const isSelected = selectedPlant.id === plant.id;

                return (
                  <button
                    key={plant.id}
                    onClick={() => handleSelect(plant)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-850'
                    }`}
                  >
                    <span className="text-xl shrink-0">{plant.sketchSymbol}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold truncate">
                          {plant.commonName}
                        </span>
                        {collected && (
                          <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-serif italic text-stone-500 block">
                        {plant.latinName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed Ethnobotanical Lore */}
            <div className="rounded-xl border border-emerald-900/50 bg-[#121a13] p-3.5 space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">
                ETHNOBOTANICAL PROPERTIES:
              </span>
              <p className="text-xs font-serif text-stone-300 leading-relaxed italic">
                "{selectedPlant.medicinalUse}"
              </p>
              <div className="text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                Habitat: {selectedPlant.location}
              </div>
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
