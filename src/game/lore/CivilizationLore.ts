/**
 * The Lost Meridian - Master Civilization & Archaeological Lore Repository
 * Grounded 1928 Royal Geographic Society Expedition dossiers, Solarian Dynasty history,
 * deciphered hieroglyphic inscriptions, architectural blueprints, and field notes.
 */

import { InspectLoreData } from '../types';

export const CIVILIZATION_LORE_REGISTRY: Record<string, InspectLoreData> = {
  // 1. Expedition Camp & Dr. Sterling's Desk
  camp_sterling_desk: {
    id: 'camp_sterling_desk',
    title: "Dr. Arthur Sterling's Field Desk & Dispatch Crate",
    subtitle: 'Royal Geographic Society Expedition #42 · Sector 7 Headquarters',
    category: 'EXPEDITION',
    dateOrEra: 'October 1–12, 1928',
    authorOrCulture: 'Dr. Arthur Sterling, F.R.G.S. (Senior Expedition Leader)',
    description:
      'A teakwood military campaign desk weathered by torrential equatorial humidity. Covered in hand-ruled topographical charts, brass vernier calipers, a half-empty bottle of quinine tonic, and charcoal rubbings of stepped pyramid friezes.',
    historicalSignificance:
      'Dr. Sterling was dispatched by the Royal Geographic Society in London following reports of an unmapped tributary valley harboring megalithic pre-Columbian architecture with advanced astronomical alignments. His preliminary reports stunned the academic world before radio contact went silent on October 14.',
    archaeologicalNotes:
      'Sterling\'s marginal notes in red ink: "The architecture does not conform to standard Incan, Mayan, or Tiwanaku cultures. The masonry joints are diamond-dressed with millimeter tolerances, and the subterranean aqueducts utilize pressurized siphon dynamics unheard of in Bronze Age antiquity."',
    glyphTranscription:
      'FIELD MEMO #47: "If you are reading this, I have advanced past the Cascade Grotto into the Prism Sanctuary. The Solar Disc fragment found in my kit is 1 of 3 keys. Do not force the water dials—the pressure will flood the ante-chamber."',
  },

  // 2. Monolithic Waystone Stele on Trail
  doc_trail_stele: {
    id: 'doc_trail_stele',
    title: 'First Meridian Waystone Stele',
    subtitle: 'Megalithic Boundary Marker of the Heliocentric Astrarchy',
    category: 'CIVILIZATION',
    dateOrEra: 'Middle Solarian Horizon, c. 1420 BCE',
    authorOrCulture: 'Sacerdotal Order of the Golden Sun (Atlan-Mar)',
    description:
      'A four-meter monolith of vesicular basalt, deeply incised with celestial epigraphy and bas-relief winged jaguar motifs flanking a radiant sun disc.',
    historicalSignificance:
      'Marks the sacred pilgrim trail ascending from the navigable river basin toward the High Temple. It served as both a spiritual threshold and a precise geodetic benchmark aligned with true celestial north.',
    archaeologicalNotes:
      'Petrographic analysis reveals basalt sourced from volcanic vents 60 kilometers eastward, indicating sophisticated riverine barge transport. The circular socket near the stele’s apex aligns perfectly with the angle of the midday sun on the autumn equinox.',
    glyphTranscription:
      '𓇳 𓈖 𓈗 𓊹 𓊽 — "He who treads the path of the Meridian must honor the twin serpent waters. When the shadow falls upon the golden cleft, the gate of Atlan-Mar shall receive the initiate."',
  },

  // 3. Bas-Relief: Serpent of Stillwater
  rubbing_stele_1: {
    id: 'rubbing_stele_1',
    title: 'Bas-Relief of the Plumed Water Serpent',
    subtitle: 'Deification of the Subterranean Aquifer & River Currents',
    category: 'CIVILIZATION',
    dateOrEra: 'Early Solarian Era, c. 1650 BCE',
    authorOrCulture: 'Guild of Hydraulic Masons of Atlan-Mar',
    description:
      'An ancient carved andesite panel depicting the celestial serpent wrapping its coils around a mountain spring, with stylized water drops rendered as polished jade cabochons.',
    historicalSignificance:
      'The Solarians venerated water as the living circulatory fluid of the cosmos. Their engineers designed the valley’s natural river network into a closed-loop hydraulic mechanism powering subterranean portcullises.',
    archaeologicalNotes:
      'Dr. Jonathan Vance’s field rubbing notation: "Notice the three spiral crests along the serpent’s dorsal ridge. They correspond exactly to the three sluice gates of the upper water mill and the aqueduct flume bypass."',
    glyphTranscription:
      '𓈗 𓆓 𓏏 𓇋 𓈖 𓈗 — "The river slumbers until the three wheels turn in unison. Feed the serpent its rightful torrent, and the passage beneath the roaring curtain will unseal."',
  },

  // 4. Bas-Relief: Winged Solar Jaguar
  rubbing_stele_2: {
    id: 'rubbing_stele_2',
    title: 'Bas-Relief of the Winged Solar Jaguar',
    subtitle: 'Emblem of the High Priest-King & Solstice Guardians',
    category: 'ASTRONOMY',
    dateOrEra: 'High Imperial Solarian Empire, c. 1380 BCE',
    authorOrCulture: 'Imperial Atlan Court Sculptors',
    description:
      'A majestic carved stele showing a feline predator with feathered raptor wings, holding the golden Meridian Disc in its talons while striding across the solar arc.',
    historicalSignificance:
      'Represents the zenith transit of the sun across the 14th meridian. The jaguar symbolized nocturnal subterranean passage, while the raptor wings embodied the daytime flight across the heavens.',
    archaeologicalNotes:
      'Microscopic traces of powdered cinnabar and Egyptian blue pigment remain in the recessed carving grooves. Gold leaf foil was originally pressed into the solar disc medallion.',
    glyphTranscription:
      '𓃭 𓅄 𓇳 𓎛 𓏏 𓊪 — "The sun descends into the belly of the earth at twilight. Only through the three aligned prisms may the celestial ray pierce the darkness and illuminate the golden throne."',
  },

  // 5. Bas-Relief: Astrolabe Celestial Sphere
  rubbing_stele_3: {
    id: 'rubbing_stele_3',
    title: 'Bas-Relief of the Celestial Astrolabe & Equinox Ring',
    subtitle: 'Star Map of the Southern Constellations & Precessional Dial',
    category: 'ASTRONOMY',
    dateOrEra: 'Late Meridian Horizon, c. 1210 BCE',
    authorOrCulture: 'Astronomical Academy of Atlan-Mar',
    description:
      'An intricate concentric petroglyph carving demonstrating sophisticated knowledge of axial precession, the 365-day solar year, and the transit of Venus.',
    historicalSignificance:
      'Proves that the builders of the Lost Meridian possessed astronomical observational instruments rivaling the Hellenistic Antikythera mechanism and ancient Babylonian star catalogs.',
    archaeologicalNotes:
      'The outer ring is divided into 28 lunar mansions. The center pivot bears an iron-nickel meteoric core that causes standard surveyor’s magnetic compasses to deviate by 18 degrees.',
    glyphTranscription:
      '𓊽 𓇹 𓇳 𓋹 𓏏 𓍿 — "As above in the starry heavens, so below in the crystalline stone. Align the three concentric rings to the sign of the Solstice Sun to unbind the subterranean vault."',
  },

  // 6. Hydraulic Aqueduct Siphon Chamber
  aqueduct_puzzle_site: {
    id: 'aqueduct_puzzle_site',
    title: 'The Great Aqueduct Siphon Chamber',
    subtitle: 'Pressurized Hydraulic Conduit System of the High Valley',
    category: 'ENGINEERING',
    dateOrEra: 'High Solarian Empire, c. 1350 BCE',
    authorOrCulture: 'Grand Master Hydrologist Kaelen-Ra',
    description:
      'A monumental stone water distribution facility featuring interlocking channels, carved stone sluice flumes, and rotating bronze-geared conduit dials.',
    historicalSignificance:
      'Supplied water to the city above while serving as an unpickable hydraulic combination lock. Unless the three water flumes are rotated to balance hydraulic pressure evenly, the temple gate counterweights remain locked.',
    archaeologicalNotes:
      'Captain Higgins\' Expedition Log: "The workmanship on these stone sluices is astounding. The tolerances are tight enough to maintain siphon vacuum without modern gaskets. Turning the three circular conduits redirects 4,000 gallons per minute into the lower balance reservoir."',
    glyphTranscription:
      '𓈗 𓎛 𓏏 𓊪 𓇳 — "Balance the three living streams: the mountain torrent, the serene river, and the subterranean cistern. When all three flow into the sacred reservoir, the heavy stone shall float like reed."',
  },

  // 7. Grand Temple Pylon & Solstice Façade
  grand_temple_pylon: {
    id: 'grand_temple_pylon',
    title: 'The Monumental Solstice Pylon & Temple Steps',
    subtitle: 'Ceremonial Façade of the High Sun Temple',
    category: 'CIVILIZATION',
    dateOrEra: 'Classical Atlan-Mar Architecture, c. 1400 BCE',
    authorOrCulture: 'Royal Dynasty of the Red Sun',
    description:
      'A 30-meter tiered megalithic temple terrace flanked by colossal stone guardian statues, fluted columns, and ceremonial braziers leading up to the Sanctuary Portal.',
    historicalSignificance:
      'The center of public worship, royal coronation, and astronomical tracking for over five centuries. At its zenith, the temple supported a population of 25,000 priests, scholars, engineers, and artisans.',
    archaeologicalNotes:
      'Built using cyclopean ashlar masonry where 12-ton limestone blocks are dry-fitted without mortar. The grand staircase contains precisely 52 steps, symbolizing the 52-year Mesoamerican calendar round.',
    glyphTranscription:
      '𓉐 𓇳 𓊹 𓋹 𓍿 — "Enter with clean hands and unclouded heart. Here stands the throne of the Sun who never sleeps. He who solves the riddle of the light shall inherit the secrets of the ancient stars."',
  },

  // 8. Solar Prism Hall of Refraction
  solar_prism_hall: {
    id: 'solar_prism_hall',
    title: 'The Heliocentric Optical Chamber & Prisms',
    subtitle: 'Optical Beam Alignment & Light Reflection Sanctuary',
    category: 'ASTRONOMY',
    dateOrEra: 'c. 1320 BCE',
    authorOrCulture: 'Priestly Guild of Optical Glassworkers',
    description:
      'A cavernous vaulted sanctuary housing three rotatable bronze stanchions topped with flawless optical calcite (Iceland spar) and beryl prisms.',
    historicalSignificance:
      'The optical triggering chamber. When the sunlight strikes the primary reflector at the temple apex, it must be directed through the three prisms sequentially to strike the photosensitive quartz receptor above the chasm gate.',
    archaeologicalNotes:
      'The crystals are cut with optical grade facets of 60-degree equilateral angles. The floor is inlaid with brass transit tracks marked in degrees of solar declination.',
    glyphTranscription:
      '𓇳 𓆑 𓈖 𓂋 𓈗 — "Light is the hand that turns the unseen key. Do not block the beam; guide its path from dawn-stanchion to evening-stanchion until the crystal heart catches flame."',
  },

  // 9. Subterranean Guardian Crypt Braziers
  grotto_guardian_crypt: {
    id: 'grotto_guardian_crypt',
    title: 'The Guardian Crypt of the Sunken Sun',
    subtitle: 'Underground Plunge Chamber beneath the Great Cascade',
    category: 'CIVILIZATION',
    dateOrEra: 'Early Solarian Necropolis, c. 1500 BCE',
    authorOrCulture: 'Keepers of the Subterranean Meridian',
    description:
      'A damp subterranean cavern filled with cascading mist and four ancient stone braziers flanking the submerged crypt gate.',
    historicalSignificance:
      'Constructed to protect the sacred Amulet of the Sunken Sun. The braziers contain volatile asphalt and resin compounds that reignite vigorously when brought into contact with an archaeological flame.',
    archaeologicalNotes:
      'Four braziers represent the four cardinal directions and the four guardians of the underworld: North (Earth), East (Air), South (Fire), and West (Water). Igniting all four balances the air pressure in the crypt chimney, sliding the stone floor slab open.',
    glyphTranscription:
      '𓊗 𓊹 𓊽 𓇳 𓈖 — "When the four fires burn together in the darkness beneath the thunder of waters, the guardians yield their treasure. Let the light pierce the mist of the abyss."',
  },

  // 10. Meridian Core Apex Altar
  grand_apex_altar: {
    id: 'grand_apex_altar',
    title: 'The Meridian Core Apex Altar',
    subtitle: 'The Heart of the Valley & Astronomical Resonance Engine',
    category: 'ASTRONOMY',
    dateOrEra: 'Prime Foundation Era, c. 1600 BCE',
    authorOrCulture: 'Founding Astrarchs of Atlan-Mar',
    description:
      'A massive golden armillary disc floating atop an electrum pedestal in the heart of the subterranean crater chamber, surrounded by resonant tuning crystals and hydraulic runnels.',
    historicalSignificance:
      'The scientific masterwork of the Lost Meridian civilization. It functioned as an astronomical computer, seasonal agricultural clock, and seismic early-warning device driven by subterranean geothermal steam.',
    archaeologicalNotes:
      'Dr. Arthur Sterling\'s final dispatch note: "October 16, 1928 — It is not magic. It is pure, sublime mathematics and terrestrial engineering. When the solstice sun reaches its zenith, the light through the ceiling oculus strikes the golden sphere, releasing the harmonic chime across the whole valley."',
    glyphTranscription:
      '𓇳 𓊽 𓋹 𓍿 𓊹 𓈖 — "THE MERIDIAN RESTORED: All skies return to their rightful home. The eternal sun shines in the subterranean heart forever."',
  },

  // 11. Camp Weather Station
  weather_station_camp: {
    id: 'weather_station_camp',
    title: '1928 Short & Mason Aneroid Field Barometer',
    subtitle: 'Expedition Meteorology & Microclimate Station',
    category: 'EXPEDITION',
    dateOrEra: 'Manufactured London, 1926 · Deployed October 1928',
    authorOrCulture: 'Royal Geographic Society Scientific Instrument Unit',
    description:
      'A heavy lacquered brass drum housing a corrugated beryllium copper vacuum capsule, mounted on an English oak surveyor\'s tripod alongside a four-cup Robinson anemometer.',
    historicalSignificance:
      'Critical for predicting sudden tropical squalls, river flash floods, and dense fog rolling off the Andean foothills into the Sector 7 depression.',
    archaeologicalNotes:
      'Barometric pressure in the valley exhibits anomalous cyclic micro-oscillations of 1.4 millibars every 18 minutes, matching the resonance frequency of the subterranean water tunnels beneath the mill.',
    glyphTranscription:
      'SCIENTIFIC LOG: "Elevation: 840m above sea level. Barometric baseline: 29.82 inHg. Temperature: 26°C. High humidity indicates imminent afternoon storm fronts."',
  },

  // 12. Marconi Radio Telegraph Desk
  marconi_radio_camp: {
    id: 'marconi_radio_camp',
    title: 'Marconi 1.5kW Rotary Spark-Gap Wireless Telegraph',
    subtitle: 'Expedition Long-Range Transceiver Unit #M-1927',
    category: 'EXPEDITION',
    dateOrEra: 'October 1928',
    authorOrCulture: 'Marconi\'s Wireless Telegraph Co., Chelmsford, UK',
    description:
      'A heavy mahogany and vulcanite instrument desk equipped with glowing vacuum diode tubes, a brass Morse transmission key, a tuning capacitor dial, and a twin-wire inverted-L aerial mast.',
    historicalSignificance:
      'The expedition\'s sole lifeline to the Royal Geographic outpost in Lima. The final Morse transmission recorded on October 14 was cut short mid-transmission: "CQ CQ DE RGS-42 ... WE HAVE BREACHED THE WATER GATE ... STERLING HAS GONE AHEAD ... THE STONE CHIMES ..."',
    archaeologicalNotes:
      'The receiver continues to pick up faint rhythmic static oscillations on 500 kHz during the evening hours, coinciding with the acoustic vibrations of the underground hydraulic siphons.',
    glyphTranscription:
      'TELEGRAPH LOG: "Frequency: 500 kHz (International Maritime Calling). Transmitter tuned to 600m wavelength. Battery voltage: 24V DC. Antenna SWR balanced."',
  },

  // 13. Dr. Sterling's Field Journal
  doc_camp_journal: {
    id: 'doc_camp_journal',
    title: "Dr. Arthur Sterling's Field Journal",
    subtitle: 'Expedition Leader\'s Leather-Bound Fieldbook · October 1928',
    category: 'EXPEDITION',
    dateOrEra: 'October 1–12, 1928',
    authorOrCulture: 'Dr. Arthur Sterling, F.R.G.S.',
    description:
      'A weathered calfskin notebook with gold-embossed corners and ribbon bookmark. Filled with hand-inked cross-sections of the subterranean aqueduct, epigraphic translations, and personal logs of the team\'s progress.',
    historicalSignificance:
      'Contains the definitive archaeological roadmap of the valley: the location of the three water dials, the solar prism alignment sanctuary, and the warning that only a divided light beam unseals the Meridian Core.',
    archaeologicalNotes:
      'Final entry dated Oct 12: "The sound of rushing water beneath my tent floor has grown rhythmic—almost musical. Vance claims he hears harmonics at 432 Hz. Tomorrow morning at dawn, I take the solar disc and descend through the cascade."',
    glyphTranscription:
      'FIELD NOTEBOOK EXCERPT: "Key 1 is in my desk kit. Key 2 is locked behind the aqueduct flume. Key 3 rests within the solar prism alcove. Bring all three to the Core."',
  },

  // 14. Meridian Solar Disc Key Fragment
  item_meridian_key_1: {
    id: 'item_meridian_key_1',
    title: 'Meridian Solar Disc Fragment (Primary)',
    subtitle: 'First Key of the Celestial Equinox Portal',
    category: 'CIVILIZATION',
    dateOrEra: 'Middle Solarian Horizon, c. 1420 BCE',
    authorOrCulture: 'Sacerdotal Astrologers of Atlan-Mar',
    description:
      'A circular talisman of solid electrum alloy inlaid with carved astronomical constellation degrees, four directional solar ray fins, and central sun aperture.',
    historicalSignificance:
      'One of three celestial keys required to unlock the sanctuary threshold. When inserted into the matching recess on the waystone stele, it casts a shadow indicating the subterranean cavern entrance.',
    archaeologicalNotes:
      'The electrum alloy contains 68% gold, 26% silver, and 6% copper. X-ray fluorescence indicates smelting techniques far beyond customary pre-Columbian metallurgy.',
    glyphTranscription:
      '𓇳 𓊹 𓊽 — "THE FIRST RAY: The sun ascends above the eastern ridge. When the disc meets its shadow, the path through the river mist shall be revealed."',
  },
};

/**
 * Helper to get lore data by target ID, falling back to a structured default.
 */
export function getLoreData(id: string): InspectLoreData | null {
  if (CIVILIZATION_LORE_REGISTRY[id]) {
    return CIVILIZATION_LORE_REGISTRY[id];
  }

  // Handle fuzzy matching
  for (const key of Object.keys(CIVILIZATION_LORE_REGISTRY)) {
    if (id.includes(key) || key.includes(id)) {
      return CIVILIZATION_LORE_REGISTRY[key];
    }
  }

  return null;
}
