/**
 * The Lost Meridian - Quest & Narrative State Machine
 * Manages objectives, field documents, inventory artifacts, and checkpoints.
 */

import {
  QuestStage,
  QuestObjective,
  InventoryItem,
  CollectibleDocument,
  CheckpointData,
  WaterPuzzleState,
  LightPuzzleState,
} from '../types';
import { audioEngine } from '../audio/AudioEngine';

export class QuestManager {
  public currentStage: QuestStage = QuestStage.CAMP_INVESTIGATION;
  public objectives: QuestObjective[] = [];
  public inventory: InventoryItem[] = [];
  public documents: CollectibleDocument[] = [];
  public currentSubtitle = '';
  public subtitleTimer = 0;

  // Notification Banner
  public notificationMessage: string | null = null;
  public notificationTimer = 0;

  constructor() {
    this.initDefaultDocuments();
    this.initDefaultInventory();
    this.initObjectives();
    this.loadFromStorage();
  }

  private initObjectives() {
    this.objectives = [
      {
        id: 'obj_camp',
        stage: QuestStage.CAMP_INVESTIGATION,
        title: 'Investigate the Abandoned Expedition Camp',
        description: 'Examine Dr. Sterling’s research notes, recover the Meridian key fragment, and prepare for the jungle ascent.',
        location: 'Expedition Base Camp (Sector Alpha)',
        isCompleted: false,
      },
      {
        id: 'obj_trail',
        stage: QuestStage.JUNGLE_EXPEDITION,
        title: 'Follow the Ancient Waystones',
        description: 'Venture deep into the uncharted rainforest following the carved megalith markers.',
        location: 'Jungle Ravine Trail',
        isCompleted: false,
      },
      {
        id: 'obj_waterfall',
        stage: QuestStage.WATERFALL_PASSAGE,
        title: 'Locate the Hidden Grotto Passage',
        description: 'Cross the river ruins and locate the hidden entrance behind the roaring Great Waterfall.',
        location: 'The Great Cascade Gorge',
        isCompleted: false,
      },
      {
        id: 'obj_aqueduct',
        stage: QuestStage.AQUEDUCT_PUZZLE,
        title: 'Align the Ancient Water Aqueducts',
        description: 'Rotate the 3 stone conduit dials to redirect the water torrent and unseal the sunken gate.',
        location: 'Subterranean Aqueduct Chamber',
        isCompleted: false,
      },
      {
        id: 'obj_temple',
        stage: QuestStage.TEMPLE_APPROACH,
        title: 'Ascend the Grand Temple of the Sun',
        description: 'Climb the monumental megalithic steps and enter the primary solar sanctuary.',
        location: 'Grand Temple Facade',
        isCompleted: false,
      },
      {
        id: 'obj_prisms',
        stage: QuestStage.LIGHT_ALIGNMENT_PUZZLE,
        title: 'Focus the Solar Prisms',
        description: 'Refract the shaft of sunlight through all three crystalline monoliths onto the Meridian Solar Crest.',
        location: 'Temple Inner Solar Hall',
        isCompleted: false,
      },
      {
        id: 'obj_meridian',
        stage: QuestStage.MERIDIAN_DISCOVERY,
        title: 'Descend to the Meridian Sanctuary',
        description: 'Cross the subterranean chasm bridge and reach the ancient core of the lost civilization.',
        location: 'The Meridian Abyss',
        isCompleted: false,
      },
      {
        id: 'obj_activate',
        stage: QuestStage.MERIDIAN_ACTIVATION,
        title: 'Awaken the Meridian',
        description: 'Place the Meridian Key into the central altar and initiate the awakening ritual.',
        location: 'The Meridian Sanctuary Altar',
        isCompleted: false,
      },
    ];
  }

  private initDefaultInventory() {
    this.inventory = [
      {
        id: 'item_torch',
        name: 'Archaeological Torch',
        category: 'tool',
        description: 'A heavy-duty waterproof expedition spotlight with parabolic brass reflector. Press [T] to toggle illumination.',
        lore: 'Standard issue equipment for the 1928 Royal Geographic Society Equatorial Expedition. Uses dual carbide batteries reinforced with rubber gaskets for subterranean humidity.',
        iconName: 'Flashlight',
      },
      {
        id: 'item_compass',
        name: 'Prismatic Brass Field Compass',
        category: 'tool',
        description: 'A liquid-damped magnetic surveying compass by T. Cooke & Sons London (1914).',
        lore: 'The jeweled sapphire needle oscillates wildly near the basalt megaliths, indicating an unnatural subterranean geomagnetic flux aligned directly with the Meridian axis.',
        iconName: 'Compass',
      },
      {
        id: 'relic_jade_serpent',
        name: 'Jade Serpent of Atlan-Mar',
        category: 'artifact',
        description: 'Translucent nephrite jade carved in the likeness of the primordial river serpent binding the karst basin.',
        lore: 'Dating to the Early Astrarch Dynasty (~450 BCE). Solarian river priests cast these talismans into the Great Cascade during seasonal monsoons to honor the subterranean aquifer gods.',
        iconName: 'Sparkles',
      },
      {
        id: 'relic_obsidian_mirror',
        name: 'Obsidian Eclipse Mirror',
        category: 'artifact',
        description: 'Polished volcanic glass mirror with an engraved bronze rim depicting the 8 phases of solar corona.',
        lore: 'Recovered from the High Priest’s observation alcove. When held against the sun at solstice zenith, the dark glass reveals solar magnetic flare loops without blinding the observer.',
        iconName: 'Eye',
      },
      {
        id: 'relic_sun_dagger',
        name: 'Celestial Meteorite Sun Dagger',
        category: 'artifact',
        description: 'Forged from octahedrite meteoric iron with intricate Widmanstätten etchings and Solarian solar cartouches.',
        lore: 'Ancient Solarian metallurgy was centuries ahead of its time. This ceremonial blade served as a magnetic key to engage the hydraulic catch levers inside the Aqueduct flume chambers.',
        iconName: 'Sparkles',
      },
      {
        id: 'relic_astrolabe_ring',
        name: 'Golden Solstice Astrolabe Ring',
        category: 'artifact',
        description: 'Solid electrum celestial navigation band calibrated precisely for 0° equatorial latitude.',
        lore: 'The concentric outer dial rotates to align the stellar paths of Orion and the Pleiades with the Summer Solstice noon sun, unsealing the prism sanctuaries within the Grand Sun Temple.',
        iconName: 'Sparkles',
      },
      {
        id: 'item_sunken_chalice',
        name: 'Gilded Sunken Chalice of Sol-Invictus',
        category: 'artifact',
        description: 'Chased gold libation goblet inlaid with carnelian beads and lapis lazuli.',
        lore: 'Submerged for over a millennium beneath the plunge pool of the Great Cascade. Used during the Solstice Baptism ritual to pour sanctified aquifer mineral water across the Meridian Crest.',
        iconName: 'Sparkles',
      },
      {
        id: 'item_amulet_sunken_sun',
        name: 'Amulet of the Nocturnal Sun',
        category: 'artifact',
        description: 'A radiant talisman of electrum and red jasper showing the sun traversing the subterranean underworld.',
        lore: 'Bestowed upon the Guardian of the Braziers. In Solarian cosmology, the sun did not die at sunset; it journeyed through the subterranean river chasm to be reborn at the Eastern Meridian.',
        iconName: 'Sparkles',
      },
    ];
  }

  private initDefaultDocuments() {
    this.documents = [
      {
        id: 'doc_camp_journal',
        title: "Dr. Sterling's Field Journal — Entry 47: The Acoustic Humming",
        author: 'Dr. Arthur Sterling (Expedition Director)',
        date: 'October 14, 1928',
        content: `“The seismic and acoustic galvanometers are registering continuous harmonic oscillations at exactly 432 Hertz. The signal does not emanate from tectonic faulting—it originates from deep below the limestone plateau, past the great cascade.
        
The local river guides call this valley 'The Navel of the Sun'. According to my translation of Stele IV, the ancient builders named themselves the Solarian Astrarchs of Atlan-Mar. They constructed a subterranean planetary axis—'The Meridian'—that channels geomagnetic flux during the summer solstice to irrigate the subterranean aquifer network.
        
Tomorrow at dawn, Vance, Higgins, and I shall enter the Great Cascade grotto. If my calculations hold, the water lock dials require precise astronomical coordination: 90° for the Rising Dawn, 180° for the Zenith Sun, and 270° for the Setting Twilight. May fortune favor our endeavor.”`,
        type: 'journal_page',
        read: false,
      },
      {
        id: 'doc_sterling_entry_12',
        title: "Dr. Sterling's Field Journal — Entry 12: Discovery of the Karst Ridge",
        author: 'Dr. Arthur Sterling',
        date: 'September 28, 1928',
        content: `“After three weeks of hacking through impenetrable tropical canopy, the fog cleared at twilight to reveal the sheer karst limestone bluffs of Sector 7. The geology here is extraordinary: towering sinkholes, subterranean caverns carved by subterranean torrents, and cyclopean masonry half-swallowed by fig roots.
        
The civilization that built these megaliths was neither Maya nor Incan. The masonry utilizes interlocking seismic joints reminiscent of Mycenae, yet the iconography is entirely heliocentric. Every stone column is oriented along a strict true-north meridian line that ignores magnetic declination. They knew the true axial rotation of the earth millennia before Copernicus.”`,
        type: 'journal_page',
        read: false,
      },
      {
        id: 'doc_vance_epigraphy',
        title: "Eleanor Vance's Epigraphy Lexicon: The Solarian Glyphs",
        author: 'Dr. Eleanor Vance (Senior Epigrapher, Cambridge)',
        date: 'October 4, 1928',
        content: `[EPIGRAPHY WORKING LOG — SOLAIRE-AETHEL SCRIPT]
        
I have succeeded in establishing a preliminary phonetic key for the primary temple cartouches:
1. ☀️ The Radiated Crown (Sol-Atlan): Signifies 'The Unconquered Axis' or 'The Meridian Core'.
2. 🌊 The Triple Wave Chevron (Khor-Nu): Represents 'The Three Great Aqueducts' that nourish the underworld.
3. 👁️ The Ringed Pupil (Astra-Vea): The Observation Eye; denotes optical crystalline prism chambers.
4. 🦅 The Sun Falcon (Hor-Kael): The solar messenger guarding the high plateaus.
        
Fascinatingly, the grammar is mathematical rather than narrative. Sentences are structured as geometric equations describing angles of incidence, fluid flow rates, and stellar coordinates. They did not simply worship the sun—they engineered with its light.”`,
        type: 'field_note',
        read: false,
      },
      {
        id: 'doc_vance_letter',
        title: "Eleanor Vance's Unsent Letter: The Singing Stones",
        author: 'Dr. Eleanor Vance',
        date: 'October 8, 1928',
        content: `“Dearest Mother,
        
I write this by the amber glow of our kerosene lamp at Sector 7 camp. If you could see the stars through the canopy tonight, you would understand why Arthur is so captivated.
        
When the wind sweeps across the karst bluffs at dusk, the hollowed limestone pillars emit a deep, haunting chord, like a cathedral pipe organ echoing through the mist. Arthur insists it is merely Aeolian acoustic resonance, but yesterday in the grotto, I discovered acoustic tuning slits cut into the basalt blocks by human hands. The ancient Solarians tuned their entire valley like an instrument.
        
They believed the earth was alive, its geomagnetic core humming like a spun top. The Meridian was built to keep that song in harmony.”`,
        type: 'journal_page',
        read: false,
      },
      {
        id: 'doc_higgins_aqueduct',
        title: "Capt. Higgins' Engineering Survey: The Siphon Locks",
        author: 'Capt. Thomas Higgins (Royal Engineers)',
        date: 'October 10, 1928',
        content: `“ENGINEERING REPORT: SUBTERRANEAN HYDRAULIC NETWORK
        
The aqueduct chamber behind the waterfall is an absolute marvel of ancient hydraulic engineering. The conduits operate on an inverted siphon principle, drawing water from the upper river gorge and forcing it through three rotary stone flumes.
        
Each dial weighs roughly 3.5 tons yet rotates smoothly on submerged basalt ball-bearings lubricated by mineral sediment.
- Conduit I (East): Diverts riverhead headwater into the irrigation canals at 90°.
- Conduit II (Central): Equalizes hydrostatic head pressure at 180°.
- Conduit III (West): Flushes the subterranean sluice gate counterweights at 270°.
        
If the dials are aligned incorrectly, excess pressure vents harmlessly into the plunge pool. But when aligned in unison, the hydrostatic siphon unseats the 12-ton sunken granite slab in under thirty seconds. Genius.”`,
        type: 'field_note',
        read: false,
      },
      {
        id: 'doc_higgins_mining',
        title: "Capt. Higgins' Field Log: The Chasm Rail Transit",
        author: 'Capt. Thomas Higgins',
        date: 'October 13, 1928',
        content: `“We managed to repair the hand-brake linkages and greased the wheel axles on the narrow-gauge minecart along the chasm precipice. The rails themselves were laid during an unrecorded 1902 Belgian prospecting expedition that vanished into the interior.
        
The tracks hug the sheer canyon wall, descending 180 feet down to the lower temple platform. It is a hair-raising ride, but it saves four hours of perilous cliff descent. I left a spare wooden wedge brake in the cart depot. Watch the hairpin turn over the abyss!”`,
        type: 'field_note',
        read: false,
      },
      {
        id: 'doc_finch_botany',
        title: "Dr. Finch's Botanical Monograph: Flora of the Karst Basin",
        author: 'Dr. Alistair Finch (Expedition Physician & Botanist)',
        date: 'October 5, 1928',
        content: `“The subterranean karst microclimate has fostered several remarkable endemic botanicals:
        
1. Luminescent Grotto Orchid (Orchis phosphorea): Grows in complete darkness on wet cave limestone. Emits a cool bluish-white bioluminescence generated by luciferase enzymes. The sap is a potent coagulant.
        
2. Sacred Meridian Spiral Fern (Pteris solaris): Found only along basalt seams exposed to the midday sun. Its fronds curl in strict Fibonacci spirals that track solar zenith.
        
3. Crimson Dragon's Blood Blossom (Dracaena equatorialis): Rich in antioxidant resins. When steeped over a campfire hearth, it produces a bitter tonic that dispels physical fatigue and sharpens mental focus under extreme jungle humidity.”`,
        type: 'field_note',
        read: false,
      },
      {
        id: 'doc_ward_recon',
        title: "Evelyn Ward's Aerial Reconnaissance Dispatch",
        author: 'Evelyn Ward (Curtiss Biplane Aviator)',
        date: 'October 7, 1928',
        content: `“FLIGHT LOG: CURTISS 'FALCON' BIPLANE — RECON PASS 3
Altitude: 1,800 feet. Ceiling: Light cumulus over river basin.
        
From the cockpit, the true geometry of the valley becomes breathtakingly clear. The temple, the watermill, the waterfall gorge, and the stepped pyramid are not randomly scattered ruins—they form an immense terrestrial sundial spanning over two kilometers.
        
At exactly 12:00 noon, the shadow cast by the Grand Temple's apex obelisk aligns with the center flume dial of the subterranean aqueduct. The ancient architects laid out the entire jungle valley as an astrological calendar.”`,
        type: 'field_note',
        read: false,
      },
      {
        id: 'doc_stele_solarians',
        title: 'Ancient Stele of Atlan-Mar: The Covenant of the Astrarchs',
        author: 'Ancient Astrarch Scribe (Translated by E. Vance)',
        date: 'Circa 720 BCE',
        content: `“We are the Children of the Unconquered Meridian.
        
When the northern skies burned and the wandering tribes froze in shadow, our architects raised the Pillars of Atlan-Mar. Here, where the sun crosses the heavens without deviation, we anchored the Core of Fire to the Deep Waters of the Earth.
        
Let no tyrant claim this valley. Let only the seeker who understands the harmony of Water, Light, and Stone step across the threshold. The Meridian does not belong to mortals; mortals belong to the cycle of the sun.”`,
        type: 'ancient_rubbing',
        read: false,
      },
      {
        id: 'doc_stele_water',
        title: 'Ancient Stele of the Three Torrents',
        author: 'Priests of the Aquatic Conduits',
        date: 'Circa 350 CE',
        content: `“Three are the waters that nurse the soil:
        
The First Water is the Dawn Torrent, born of morning mist and dew. Turn its face toward the Rising Sun [90°].
        
The Second Water is the Zenith Deluge, rushing with the strength of the midday roar. Set its conduit toward the High Meridian [180°].
        
The Third Water is the Twilight Flow, that cleanses the silt before the coming of darkness. Direct its flume toward the Setting Haven [270°].
        
When the three waters speak as one tongue, the stone gate of the ancients shall yield to the river's command.”`,
        type: 'ancient_rubbing',
        read: false,
      },
      {
        id: 'doc_stele_cataclysm',
        title: 'Chronicle of the Red Sun: The Great Eclipse',
        author: 'High Priest Kaelen (Final Inscription)',
        date: 'Circa 780 CE',
        content: `“In the fourth year of the Red Comet, the sun turned to ash at noon. The sky bled copper, and the geomagnetic needle spun without anchor.
        
The Meridian Core surged with violent terrestrial fire, cracking the limestone chambers. To save our people and preserve the subterranean aquifers, the Astrarchs made the sacred sacrifice: we dismantled the primary solar prisms, sealed the subterranean chasm behind the waterfall, and withdrew into the deep sanctuary beneath the abyss.
        
We leave the keys in the stone. When the celestial alignment is restored and a righteous seeker walks the path, the Meridian shall wake once more.”`,
        type: 'ancient_rubbing',
        read: false,
      },
      {
        id: 'doc_water_clue',
        title: 'Aqueduct Glyphs Rubbing: Dial Alignments',
        author: 'Expedition Survey Team',
        date: 'October 12, 1928',
        content: `[ARCHAEOLOGICAL CHARCOAL RUBBING]
        
Dial I (East Conduits): Rotate to the Rising Sun Glyph [90°]
Dial II (Central Flume): Rotate to the Zenith Meridian [180°]
Dial III (West Aqueduct): Rotate to the Setting Twilight [270°]
        
"When the three torrents converge in unison, the sunken stone of the ancients shall recede into the earth."`,
        type: 'ancient_rubbing',
        read: false,
      },
      {
        id: 'doc_trail_stele',
        title: 'Waystone Stele Translation: Path of the Grotto',
        author: 'Solarian Waystone Scribe',
        date: 'Circa 800 CE',
        content: `“Seek the roar that splits the earth. Behind the veil of falling water lies the sacred gateway to the Sun Temple.
        
Carry the flame of the torch into the shadowed halls. Only those who rekindle the four sacred guardian braziers shall gaze upon the Meridian Heart.”`,
        type: 'field_note',
        read: false,
      },
      {
        id: 'doc_final_dispatch',
        title: "Expedition Final Dispatch: The Descent into the Abyss",
        author: 'Dr. Arthur Sterling',
        date: 'October 15, 1928 (03:15 AM)',
        content: `“The subterranean gate is open. The sight before us defies human language: a colossal subterranean cavern bathed in ethereal golden luminescence, suspended above an abyss of turquoise thermal water.
        
The Meridian Core is intact. It is a monumental gyroscopic sphere of unknown meteoric alloy, ringed by celestial bands that respond to human presence. The hum in the air is deafening yet profoundly tranquil.
        
Vance, Higgins, and I are crossing the chasm bridge now. If anyone finds our base camp journal, know that we did not perish in fear. We have touched the living heart of antiquity.
        
— Arthur Sterling, F.R.G.S.”`,
        type: 'journal_page',
        read: false,
      },
    ];
  }

  public showNotification(msg: string, duration = 4.5) {
    this.notificationMessage = msg;
    this.notificationTimer = duration;
  }

  public showSubtitle(text: string, duration = 4.0) {
    this.currentSubtitle = text;
    this.subtitleTimer = duration;
  }

  public advanceStage(nextStage: QuestStage, bannerText?: string) {
    this.currentStage = nextStage;

    // Mark completed objectives
    this.objectives.forEach((obj) => {
      if (obj.stage === nextStage) {
        // active
      } else if (this.getStageIndex(obj.stage) < this.getStageIndex(nextStage)) {
        obj.isCompleted = true;
      }
    });

    if (bannerText) {
      this.showNotification(`OBJECTIVE UPDATED: ${bannerText}`);
      audioEngine.playItemDiscovery();
    }

    this.ensurePrerequisiteQuestItems();
  }

  public ensurePrerequisiteQuestItems() {
    const stageIdx = this.getStageIndex(this.currentStage);
    const expeditionIdx = this.getStageIndex(QuestStage.JUNGLE_EXPEDITION);
    if (stageIdx >= expeditionIdx) {
      if (!this.inventory.some((i) => i.id === 'item_meridian_key_1')) {
        this.addItem({
          id: 'item_meridian_key_1',
          name: 'Meridian Solar Disc Fragment',
          category: 'artifact',
          description: 'An ancient carved golden dial bearing astronomical star positions.',
          lore: 'Recovered from Dr. Sterling’s field kit at the base camp.',
          iconName: 'Sparkles',
        });
      }
    }
  }

  private getStageIndex(stage: QuestStage): number {
    const order = Object.values(QuestStage);
    return order.indexOf(stage);
  }

  public addItem(item: InventoryItem) {
    if (!this.inventory.find((i) => i.id === item.id)) {
      this.inventory.push(item);
      this.showNotification(`ACQUIRED: ${item.name}`);
      audioEngine.playItemDiscovery();
    }
  }

  public readDocument(docId: string): CollectibleDocument | undefined {
    const doc = this.documents.find((d) => d.id === docId);
    if (doc) {
      doc.read = true;
      audioEngine.playJournalTurn();
    }
    return doc;
  }

  public addDocument(doc: CollectibleDocument) {
    if (!this.documents.some((d) => d.id === doc.id)) {
      this.documents.push(doc);
    }
  }

  public addCustomJournalNote(title: string, body: string): CollectibleDocument {
    const id = `note_${Date.now()}`;
    const doc: CollectibleDocument = {
      id,
      title,
      author: 'Expedition Archaeologist (You)',
      date: 'October 1928',
      content: body,
      type: 'field_note',
      read: true,
    };
    this.addDocument(doc);
    return doc;
  }

  public getCurrentObjective(): QuestObjective | undefined {
    return this.objectives.find((obj) => obj.stage === this.currentStage && !obj.isCompleted) || this.objectives[this.objectives.length - 1];
  }

  public update(delta: number) {
    if (this.notificationTimer > 0) {
      this.notificationTimer -= delta;
      if (this.notificationTimer <= 0) {
        this.notificationMessage = null;
      }
    }

    if (this.subtitleTimer > 0) {
      this.subtitleTimer -= delta;
      if (this.subtitleTimer <= 0) {
        this.currentSubtitle = '';
      }
    }
  }

  public saveCheckpoint(
    playerPos: [number, number, number],
    playerRot: [number, number],
    waterState: WaterPuzzleState,
    lightState: LightPuzzleState
  ) {
    const data: CheckpointData = {
      stage: this.currentStage,
      playerPosition: playerPos,
      playerRotation: playerRot,
      inventory: this.inventory,
      documents: this.documents,
      waterPuzzle: waterState,
      lightPuzzle: lightState,
      timestamp: Date.now(),
      locationName: this.getCurrentObjective()?.location || 'Jungle Sanctuary',
    };

    try {
      localStorage.setItem('lost_meridian_save', JSON.stringify(data));
      this.showNotification('EXPEDITION CHECKPOINT SAVED');
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
  }

  public loadFromStorage(): CheckpointData | null {
    try {
      const raw = localStorage.getItem('lost_meridian_save');
      if (raw) {
        const data: CheckpointData = JSON.parse(raw);
        this.currentStage = data.stage;
        this.inventory = data.inventory;
        this.documents = data.documents;
        return data;
      }
    } catch (e) {
      // Ignore corrupted save
    }
    return null;
  }
}
