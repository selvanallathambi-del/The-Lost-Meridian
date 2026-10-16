/**
 * The Lost Meridian - Type Definitions
 */

export enum QuestStage {
  INTRO = 'INTRO',
  CAMP_INVESTIGATION = 'CAMP_INVESTIGATION',
  JUNGLE_EXPEDITION = 'JUNGLE_EXPEDITION',
  RIVER_CROSSING = 'RIVER_CROSSING',
  RUINS_DISCOVERY = 'RUINS_DISCOVERY',
  WATERFALL_PASSAGE = 'WATERFALL_PASSAGE',
  AQUEDUCT_PUZZLE = 'AQUEDUCT_PUZZLE',
  TEMPLE_APPROACH = 'TEMPLE_APPROACH',
  LIGHT_ALIGNMENT_PUZZLE = 'LIGHT_ALIGNMENT_PUZZLE',
  UNDERGROUND_DESCENT = 'UNDERGROUND_DESCENT',
  MERIDIAN_DISCOVERY = 'MERIDIAN_DISCOVERY',
  MERIDIAN_ACTIVATION = 'MERIDIAN_ACTIVATION',
  CHAPTER_COMPLETE = 'CHAPTER_COMPLETE',
}

export interface QuestObjective {
  id: string;
  stage: QuestStage;
  title: string;
  description: string;
  location: string;
  isCompleted: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'artifact' | 'clue' | 'tool' | 'key' | 'document';
  description: string;
  lore: string;
  iconName: string;
  acquiredAt?: number;
  inspectableModel?: string;
  properties?: Record<string, string | number | boolean>;
}

export interface CollectibleDocument {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  sketchUrl?: string;
  type: 'journal_page' | 'field_note' | 'ancient_rubbing' | 'audio_transcript' | 'photograph';
  read: boolean;
}

export interface WaterPuzzleState {
  dial1: number; // 0, 90, 180, 270 deg
  dial2: number;
  dial3: number;
  isSolved: boolean;
  waterFlowRate: number; // 0 to 1
  gateOpenProgress: number; // 0 to 1
}

export interface LightPuzzleState {
  prism1: number; // 0, 45, 90, 135, 180, 225, 270, 315 deg
  prism2: number;
  prism3: number;
  isSolved: boolean;
  beam1Hit: boolean;
  beam2Hit: boolean;
  beam3Hit: boolean;
  energyCharge: number; // 0 to 1
}

export interface ExpeditionPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  location: string;
  filterStyle: string;
}

export type WeatherType = 'CLEAR' | 'FOG' | 'RAIN' | 'HUMID_OVERCAST' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'CLEARING' | 'DESERT';

export interface WeatherState {
  current: WeatherType;
  rainIntensity: number; // 0 to 1
  cloudCover: number;    // 0 to 1
  wetness: number;       // 0 to 1 (surface dampness)
  fogDensity: number;
  windSpeed: number;
}

export interface GraphicsSettings {
  shadowQuality: 'off' | 'low' | 'high';
  depthOfField: boolean;
  bloom: boolean;
  filmGrain: boolean;
  vignette: boolean;
  fov: number;
  resolutionScale: number;
  motionBlur: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambienceVolume: number;
}

export interface ControlSettings {
  mouseSensitivity: number;
  invertY: boolean;
  toggleCrouch: boolean;
  toggleSprint: boolean;
}

export interface GameSettings {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
}

export interface InteractionTarget {
  id: string;
  title: string;
  verb: string;
  distance: number;
  position: [number, number, number];
  type: 'inspect' | 'pickup' | 'activate' | 'rotate' | 'read' | 'altar' | 'brazier' | 'excavate' | 'rubbing' | 'harvest' | 'brew';
  data?: any;
}

export interface ActiveBrewPerk {
  id: string;
  name: string;
  perkTitle: string;
  durationSeconds: number;
  expiresAt: number;
}

export interface InspectLoreData {
  id: string;
  title: string;
  subtitle: string;
  category: 'CIVILIZATION' | 'EXPEDITION' | 'ASTRONOMY' | 'ENGINEERING' | 'FLORA';
  dateOrEra: string;
  authorOrCulture: string;
  description: string;
  historicalSignificance: string;
  archaeologicalNotes: string;
  glyphTranscription?: string;
}

export interface CheckpointData {
  stage: QuestStage;
  playerPosition: [number, number, number];
  playerRotation: [number, number];
  inventory: InventoryItem[];
  documents: CollectibleDocument[];
  waterPuzzle: WaterPuzzleState;
  lightPuzzle: LightPuzzleState;
  timestamp: number;
  locationName: string;
}
