/**
 * The Lost Meridian - Archaeological Expedition Journal & Civilization Codex
 * Comprehensive lore repository: 14 field manuscripts, Solarian civilization history,
 * 1928 expedition personnel dossiers, astronomical calendars, and hieroglyphic translations.
 */

import React, { useState } from 'react';
import { GameManager } from '../game/GameManager';
import {
  BookOpen,
  FileText,
  Sparkles,
  Map,
  X,
  CheckCircle2,
  Camera,
  Trash2,
  Maximize2,
  Circle,
  Volume2,
  Square,
  PenTool,
  Plus,
  Scroll,
  Users,
  Compass,
  Sun,
  Waves,
  Feather,
} from 'lucide-react';

interface JournalModalProps {
  game: GameManager;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'codex' | 'objectives' | 'artifacts' | 'map' | 'photos' | 'write'>('documents');
  const [codexSection, setCodexSection] = useState<'civilization' | 'personnel' | 'astronomy' | 'glyphs'>('civilization');
  const [docFilter, setDocFilter] = useState<'all' | 'sterling' | 'vance' | 'higgins' | 'ancient' | 'expedition'>('all');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>(game.quest.documents[0]?.id || '');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(game.quest.inventory[0]?.id || '');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [mobileDetailView, setMobileDetailView] = useState<boolean>(false);

  const toggleNarration = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const filteredDocs = game.quest.documents.filter((doc) => {
    if (docFilter === 'sterling') return doc.author.includes('Sterling');
    if (docFilter === 'vance') return doc.author.includes('Vance');
    if (docFilter === 'higgins') return doc.author.includes('Higgins');
    if (docFilter === 'ancient') return doc.type === 'ancient_rubbing' || doc.author.includes('Ancient') || doc.author.includes('Priest');
    if (docFilter === 'expedition') return doc.author.includes('Expedition') || doc.author.includes('Finch') || doc.author.includes('Ward');
    return true;
  });

  const selectedDoc = game.quest.documents.find((d) => d.id === selectedDocId) || filteredDocs[0];
  const selectedArtifact = game.quest.inventory.find((i) => i.id === selectedArtifactId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 select-none animate-fade-in">
      <div className="relative flex h-[92vh] sm:h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-amber-800/40 bg-[#12100e] text-stone-200 shadow-2xl">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-amber-900/30 bg-[#1a1714] px-3 sm:px-8 py-2.5 sm:py-3.5 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-amber-400 shrink-0" />
            <div>
              <h2 className="font-cinzel text-sm sm:text-base md:text-lg font-bold tracking-wider text-amber-200">
                FIELD RESEARCH LOGBOOK & CODEX
              </h2>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden sm:block">
                Royal Geographic Society (1928) — Sector 7 Basin & Solarian Ruins of Atlan-Mar
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full">
            {[
              { id: 'documents', label: `Manuscripts (${game.quest.documents.length})`, icon: FileText },
              { id: 'codex', label: 'Civilization Codex', icon: Scroll },
              { id: 'objectives', label: 'Quests', icon: CheckCircle2 },
              { id: 'artifacts', label: `Relics (${game.quest.inventory.length})`, icon: Sparkles },
              { id: 'map', label: 'Map', icon: Map },
              { id: 'photos', label: 'Album', icon: Camera },
              { id: 'write', label: 'Field Note', icon: PenTool },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileDetailView(false);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold tracking-wide transition-colors whitespace-nowrap min-h-[34px] cursor-pointer ${
                    isActive
                      ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50 shadow-sm'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={onClose}
              className="ml-1 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close Journal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* TAB 1: FIELD MANUSCRIPTS & ANCIENT TABLETS */}
          {activeTab === 'documents' && (
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
              {/* Left Document List with Filters */}
              <div className={`w-full md:w-5/12 lg:w-4/12 border-r border-amber-900/30 bg-[#151310] p-3 sm:p-4 overflow-y-auto space-y-2.5 ${mobileDetailView ? 'hidden md:block' : 'block'}`}>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-400 font-cinzel flex items-center justify-between">
                  <span>Recovered Texts ({filteredDocs.length})</span>
                  <span className="text-[10px] text-stone-500 font-mono">1928 ARCHIVES</span>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'sterling', label: 'Dr. Sterling' },
                    { id: 'vance', label: 'E. Vance' },
                    { id: 'higgins', label: 'T. Higgins' },
                    { id: 'ancient', label: 'Stelae' },
                    { id: 'expedition', label: 'Survey' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setDocFilter(filter.id as any)}
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        docFilter === filter.id
                          ? 'bg-amber-600 text-stone-950 font-bold'
                          : 'bg-stone-800/80 text-stone-400 hover:bg-stone-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Document Items */}
                <div className="space-y-1.5">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setMobileDetailView(true);
                      }}
                      className={`w-full text-left rounded-lg p-2.5 transition-all border cursor-pointer ${
                        selectedDocId === doc.id
                          ? 'border-amber-500/60 bg-amber-950/40 text-amber-100 shadow-md ring-1 ring-amber-500/30'
                          : 'border-stone-800/60 bg-stone-900/40 text-stone-300 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold font-cinzel line-clamp-1 flex-1">{doc.title}</span>
                        {doc.type === 'ancient_rubbing' ? (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-900/40 text-amber-300 shrink-0">STELE</span>
                        ) : (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-stone-800 text-stone-400 shrink-0">LOG</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                        <span className="line-clamp-1">{doc.author}</span>
                        <span className="shrink-0">{doc.date}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Document Reading View (Parchment Texture) */}
              <div className={`flex-1 bg-[#1a1714] p-3 sm:p-8 overflow-y-auto ${!mobileDetailView ? 'hidden md:block' : 'block'}`}>
                {mobileDetailView && (
                  <button
                    onClick={() => setMobileDetailView(false)}
                    className="md:hidden mb-3 text-xs text-amber-400 font-semibold flex items-center gap-1 cursor-pointer bg-black/40 px-3 py-1.5 rounded border border-amber-900/40"
                  >
                    ← Back to Manuscripts List
                  </button>
                )}
                {selectedDoc ? (
                  <div className="max-w-2xl mx-auto rounded-lg border border-amber-900/40 bg-[#f5ebd7] p-5 sm:p-8 text-[#2e261e] shadow-2xl relative">
                    {/* Archival Header & Stamp */}
                    <div className="border-b border-[#c8b79d] pb-3 sm:pb-4 mb-4 sm:mb-6 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#7a6448]">
                          {selectedDoc.date} — {selectedDoc.author}
                        </div>
                        <h3 className="font-cinzel text-base sm:text-xl font-bold text-[#1f1913] mt-1 leading-snug">
                          {selectedDoc.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleNarration(`${selectedDoc.title}. ${selectedDoc.content}`)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold font-mono transition-all shrink-0 cursor-pointer ${
                          isSpeaking
                            ? 'bg-amber-800 text-amber-100 border-amber-900 animate-pulse'
                            : 'bg-[#e2d5c0] text-[#4a3a28] border-[#b09e82] hover:bg-[#d5c5ad]'
                        }`}
                        title={isSpeaking ? 'Stop Audio Narration' : 'Play Audio Transcript'}
                      >
                        {isSpeaking ? <Square className="h-3.5 w-3.5 fill-current" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{isSpeaking ? 'STOP AUDIO' : 'AUDIO TRANSCRIPT'}</span>
                      </button>
                    </div>

                    {/* Document Content */}
                    <div className="whitespace-pre-line font-serif text-xs sm:text-sm leading-relaxed text-[#3b3024]">
                      {selectedDoc.content}
                    </div>

                    {/* Visual Schematics / Footers */}
                    {selectedDoc.id === 'doc_water_clue' && (
                      <div className="mt-4 sm:mt-6 rounded border border-[#ab9574] bg-[#eae0ca] p-3 sm:p-4 text-center">
                        <div className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-[#5c4a34]">
                          AQUEDUCT DIAL CONFIGURATION SUMMARY
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 text-xs font-mono">
                          <div className="rounded bg-[#dfd3b9] p-2 text-stone-900 font-bold">Dial 1: [ 90° EAST ]</div>
                          <div className="rounded bg-[#dfd3b9] p-2 text-stone-900 font-bold">Dial 2: [ 180° ZENITH ]</div>
                          <div className="rounded bg-[#dfd3b9] p-2 text-stone-900 font-bold">Dial 3: [ 270° WEST ]</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-500 text-sm">
                    Select a field note to read
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CIVILIZATION CODEX & EXPEDITION DOSSIER */}
          {activeTab === 'codex' && (
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-[#141210]">
              {/* Left Codex Sub-Menu */}
              <div className="w-full md:w-1/4 border-r border-amber-900/30 bg-[#161310] p-3 sm:p-4 space-y-1.5 overflow-y-auto">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-500 font-cinzel mb-2">
                  Codex Archive
                </div>
                {[
                  { id: 'civilization', label: 'The Solarian Dynasty', icon: Sun },
                  { id: 'personnel', label: 'Expedition Personnel', icon: Users },
                  { id: 'astronomy', label: 'Solstice & Meridian Grid', icon: Compass },
                  { id: 'glyphs', label: 'Epigraphy & Glyphs', icon: Feather },
                ].map((item) => {
                  const Icon = item.icon;
                  const isCur = codexSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCodexSection(item.id as any)}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                        isCur
                          ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50 shadow-sm'
                          : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Codex Reader */}
              <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-3xl space-y-6">
                {/* 1. THE SOLAIRAN CIVILIZATION */}
                {codexSection === 'civilization' && (
                  <div className="space-y-4">
                    <div className="border-b border-amber-900/40 pb-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">ARCHAEOLOGICAL PROFILE</div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
                        The Solarian Dynasty of Atlan-Mar (650 BCE – 780 CE)
                      </h3>
                      <p className="text-xs text-stone-400 font-serif italic mt-1">
                        A lost equatorial civilization built along the geomagnetic 0° Meridian.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-stone-300 font-serif leading-relaxed">
                      <p>
                        Deep within the uncharted karst limestone canyons of Sector 7 flourished one of the ancient world's most scientifically advanced cultures: the <strong className="text-amber-200">Solarian Astrarchs</strong>. Unlike the surrounding rainforest cultures, the Solarians worshipped not a pantheon of zoomorphic deities, but the <strong className="text-amber-200">Heliocentric Principle</strong> and the mathematical harmony of the cosmos.
                      </p>
                      
                      <h4 className="font-cinzel text-sm font-bold text-amber-300 pt-2">The Meridian Axis & True North</h4>
                      <p>
                        The core city was laid out along a strict terrestrial Meridian running north-to-south. Solarian astronomers discovered that at this precise equatorial latitude, the earth’s magnetic flux converges with subterranean mineral aquifers. They constructed cyclopean seismic-resistant basalt foundations that withstood centuries of tropical rain and earthquakes.
                      </p>

                      <h4 className="font-cinzel text-sm font-bold text-amber-300 pt-2">The Hydraulic & Optical Marvels</h4>
                      <p>
                        Their greatest achievements were twofold:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-stone-300">
                        <li><strong className="text-amber-200">The Aqueduct of the Three Torrents:</strong> An inverted subterranean siphon system that redirected riverhead torrents through rotating basalt conduit dials to power automated temple water gates.</li>
                        <li><strong className="text-amber-200">The Prism Hall of Sol-Invictus:</strong> A crystalline optical chamber where natural sunlight was refracted across the temple sanctuary to charge resonant solar crests.</li>
                      </ul>

                      <h4 className="font-cinzel text-sm font-bold text-amber-300 pt-2">The Great Red Eclipse & The Sealing (780 CE)</h4>
                      <p>
                        In 780 CE, a prolonged solar event (recorded as the 'Year of the Red Comet') caused catastrophic geomagnetic surges. To preserve the subterranean aquifers and protect their core technology, the Astrarchs dismantled the prism arrays, sealed the entrance behind the roaring Great Cascade Waterfall, and retreated into the subterranean abyss.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. EXPEDITION PERSONNEL */}
                {codexSection === 'personnel' && (
                  <div className="space-y-4">
                    <div className="border-b border-amber-900/40 pb-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">ROYAL GEOGRAPHIC SOCIETY DOSSIER</div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
                        The 1928 Expedition Personnel Roster
                      </h3>
                      <p className="text-xs text-stone-400 font-serif italic mt-1">
                        Dispatched from London on August 14, 1928. Last communication logged October 15.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          name: 'Dr. Arthur Sterling, F.R.G.S.',
                          role: 'Expedition Director & Senior Archaeologist',
                          desc: 'Oxford fellow renowned for his controversial treatise on subterranean ancient acoustics. Convinced that the Meridian core holds the key to planetary magnetic resonance.',
                        },
                        {
                          name: 'Dr. Eleanor Vance',
                          role: 'Master Epigrapher & Paleographer (Cambridge)',
                          desc: 'Fluent in ancient Mediterranean and Mesoamerican scripts. Successfully cracked the phonetic cipher of the Astrarch Solarian alphabet.',
                        },
                        {
                          name: 'Captain Thomas Higgins',
                          role: 'Mining Engineer & Surveyor (Royal Engineers)',
                          desc: 'Veteran of the Somme tunneling operations. Restored the narrow-gauge chasm minecart and mapped the subterranean hydraulic siphon pressures.',
                        },
                        {
                          name: 'Dr. Alistair Finch',
                          role: 'Expedition Physician & Ethnobotanist',
                          desc: 'Discovered the bioluminescent properties of the cave orchids and catalogued the medicinal value of the endemic flora at camp.',
                        },
                        {
                          name: 'Evelyn Ward',
                          role: 'Reconnaissance Aviator (Curtiss "Falcon" Biplane)',
                          desc: 'Pioneered high-altitude aerial cartography over Sector 7, discovering that the entire valley forms a two-kilometer astronomical sundial.',
                        },
                      ].map((person, idx) => (
                        <div key={idx} className="rounded-xl border border-stone-800 bg-stone-950/70 p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-cinzel font-bold text-amber-200 text-sm">{person.name}</span>
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                              {person.role}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 font-serif leading-relaxed">{person.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ASTRONOMY & SOLSTICE GRID */}
                {codexSection === 'astronomy' && (
                  <div className="space-y-4">
                    <div className="border-b border-amber-900/40 pb-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">COSMOLOGICAL MECHANICS</div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
                        The Solstice Meridian Grid & Acoustic Harmony
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-stone-300 font-serif leading-relaxed">
                      <p>
                        The Meridian sanctuary operates on the fundamental physics of <strong className="text-amber-200">astronomical alignment and harmonic resonance</strong>:
                      </p>

                      <div className="rounded-xl border border-amber-900/40 bg-stone-950/60 p-4 space-y-2 font-mono text-xs">
                        <div className="text-amber-300 font-bold">1. Solar Solstice Convergence:</div>
                        <p className="text-stone-400">At the Summer Solstice noon, the equatorial sun strikes the apex obelisk at exactly 90.0° zenith, funneling light down the central vertical light shaft directly into the prism hall.</p>

                        <div className="text-amber-300 font-bold pt-2">2. The 432 Hz Planetary Acoustic Key:</div>
                        <p className="text-stone-400">The hollowed karst columns surrounding the basin act as acoustic Helmholtz resonators, vibrating at 432 Hz during peak geothermal pressure. This frequency unseals the stone counterweights.</p>

                        <div className="text-amber-300 font-bold pt-2">3. Fluid Siphon Mechanics:</div>
                        <p className="text-stone-400">Three conduits (Rising Dawn: 90°, Zenith: 180°, Twilight: 270°) must balance hydrostatic head pressure to lower the 12-ton sunken granite gate.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. EPIGRAPHY & GLYPHS */}
                {codexSection === 'glyphs' && (
                  <div className="space-y-4">
                    <div className="border-b border-amber-900/40 pb-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">SOLARIAN EPIGRAPHY</div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
                        Ancient Cartouches & Hieroglyphic Lexicon
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { glyph: '☀️ Sol-Atlan', title: 'The Unconquered Axis', desc: 'Denotes the Meridian Core and celestial solar zenith.' },
                        { glyph: '🌊 Khor-Nu', title: 'The Three Torrents', desc: 'Symbolizes the river conduits and the aqueduct siphon gates.' },
                        { glyph: '👁️ Astra-Vea', title: 'The Observation Eye', desc: 'Marks crystalline solar prism halls and optical light alignment.' },
                        { glyph: '🦅 Hor-Kael', title: 'The Solar Falcon', desc: 'The guardian messenger watching over the canyon plateau.' },
                        { glyph: '🐍 Ouro-Kael', title: 'The River Serpent', desc: 'Protector of the subterranean mineral aquifers and waterfalls.' },
                        { glyph: '⚡ Pyr-Zon', title: 'The Subterranean Fire', desc: 'The volcanic geothermal core fueling the ancient mechanisms.' },
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 space-y-1">
                          <div className="font-cinzel font-bold text-amber-300 text-sm">{item.glyph}</div>
                          <div className="text-[10px] font-mono text-stone-400">{item.title}</div>
                          <p className="text-xs text-stone-400 font-serif">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OBJECTIVES */}
          {activeTab === 'objectives' && (
            <div className="flex-1 bg-[#161412] p-3 sm:p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 font-cinzel">
                  Expedition Milestones & Quests
                </div>
                {game.quest.objectives.map((obj) => {
                  const isActive = obj.stage === game.quest.currentStage && !obj.isCompleted;
                  return (
                    <div
                      key={obj.id}
                      className={`flex items-start gap-3 sm:gap-4 rounded-xl border p-3 sm:p-4 transition-all ${
                        obj.isCompleted
                          ? 'border-emerald-900/30 bg-emerald-950/10 text-stone-400 opacity-70'
                          : isActive
                          ? 'border-amber-500/60 bg-amber-950/30 text-stone-100 shadow-lg'
                          : 'border-stone-800 bg-stone-900/20 text-stone-500'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {obj.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                        ) : isActive ? (
                          <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 animate-pulse fill-amber-400/20" />
                        ) : (
                          <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-stone-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <h4 className="font-cinzel text-xs sm:text-sm font-semibold">{obj.title}</h4>
                          <span className="text-[10px] font-mono text-stone-400">{obj.location}</span>
                        </div>
                        <p className="mt-1 text-xs text-stone-400 font-serif">{obj.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RELICS & ARTIFACTS */}
          {activeTab === 'artifacts' && (
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
              <div className={`w-full md:w-1/3 border-r border-amber-900/30 bg-[#151310] p-3 sm:p-4 overflow-y-auto space-y-2 ${mobileDetailView ? 'hidden md:block' : 'block'}`}>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-500 font-cinzel mb-2 sm:mb-3">
                  Inventory & Relics ({game.quest.inventory.length})
                </div>
                {game.quest.inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedArtifactId(item.id);
                      setMobileDetailView(true);
                    }}
                    className={`w-full text-left rounded-lg p-2.5 sm:p-3 transition-all border cursor-pointer ${
                      selectedArtifactId === item.id
                        ? 'border-amber-500/60 bg-amber-950/40 text-amber-100 shadow-md'
                        : 'border-stone-800/60 bg-stone-900/40 text-stone-300 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-xs font-semibold font-cinzel line-clamp-1">{item.name}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                      <span className="uppercase">{item.category}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className={`flex-1 bg-[#1a1714] p-4 sm:p-8 overflow-y-auto ${!mobileDetailView ? 'hidden md:block' : 'block'}`}>
                {mobileDetailView && (
                  <button
                    onClick={() => setMobileDetailView(false)}
                    className="md:hidden mb-3 text-xs text-amber-400 font-semibold flex items-center gap-1 cursor-pointer bg-black/40 px-3 py-1.5 rounded border border-amber-900/40"
                  >
                    ← Back to Relics List
                  </button>
                )}
                {selectedArtifact ? (
                  <div className="max-w-xl mx-auto rounded-xl border border-amber-900/40 bg-stone-950/80 p-5 sm:p-8 text-stone-200 shadow-xl space-y-4">
                    <div className="border-b border-stone-800 pb-3 flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                          {selectedArtifact.category.toUpperCase()} ARTIFACT
                        </div>
                        <h3 className="font-cinzel text-lg sm:text-2xl font-bold text-amber-100 mt-1">
                          {selectedArtifact.name}
                        </h3>
                      </div>
                      <Sparkles className="h-6 w-6 text-amber-400 shrink-0" />
                    </div>

                    <div className="space-y-3 font-serif text-xs sm:text-sm text-stone-300 leading-relaxed">
                      <p><strong className="text-amber-200 font-sans">Physical Description:</strong> {selectedArtifact.description}</p>
                      <div className="rounded-lg bg-stone-900/80 p-3.5 border border-stone-800 text-stone-400 text-xs leading-relaxed">
                        <strong className="text-amber-400 font-sans block mb-1">Archaeological Lore:</strong>
                        {selectedArtifact.lore}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-500 text-sm">
                    Select an artifact to examine
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MAP */}
          {activeTab === 'map' && (
            <div className="flex flex-1 flex-col p-4 sm:p-6 overflow-y-auto bg-[#13110e]">
              <div className="max-w-3xl mx-auto w-full space-y-4">
                <div className="border-b border-amber-900/30 pb-3">
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-amber-200">
                    TOPOGRAPHICAL SURVEY MAP — SECTOR 7 BASIN
                  </h3>
                  <p className="text-xs text-stone-400">Mapped via Prismatic Theodolite & Curtiss Biplane Reconnaissance</p>
                </div>

                <div className="rounded-xl border border-amber-900/40 bg-[#1e1913] p-4 text-xs font-mono space-y-2 text-stone-300">
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-amber-300 font-bold">Zone Alpha (Z: +70m):</span>
                    <span>Expedition Base Camp, Radio Mast, Weather Station</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-amber-300 font-bold">Zone Beta (Z: +20m):</span>
                    <span>River Rapids, Watermill Landing, Jungle Ravine Trail</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-amber-300 font-bold">Zone Gamma (Z: -35m):</span>
                    <span>The Great Cascade Waterfall & Grotto Flume Entrance</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-amber-300 font-bold">Zone Delta (Z: -72m):</span>
                    <span>Subterranean Aqueduct Siphon Chambers & Water Dials</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-amber-300 font-bold">Zone Epsilon (Z: -140m):</span>
                    <span>Grand Temple of the Sun & Solar Prisms Sanctuary</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-300 font-bold">Zone Omega (Z: -240m):</span>
                    <span>The Subterranean Abyss & Meridian Resonator Core</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PHOTO ALBUM */}
          {activeTab === 'photos' && (
            <div className="flex flex-1 flex-col p-4 sm:p-6 overflow-y-auto bg-[#13110e]">
              <div className="flex items-center justify-between mb-4 border-b border-amber-900/30 pb-3">
                <div>
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-amber-200">
                    EXPEDITION PHOTOGRAPHIC LOG ({game.capturedPhotos.length})
                  </h3>
                  <p className="text-xs text-stone-400">Captured with 1928 Sterling Bellows Field Camera [Key P]</p>
                </div>
              </div>

              {game.capturedPhotos.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-stone-500 my-auto">
                  <Camera className="h-12 w-12 text-stone-600 mb-3 animate-bounce" />
                  <p className="font-cinzel text-sm text-stone-400 font-semibold mb-1">NO PHOTOGRAPHS CAPTURED YET</p>
                  <p className="text-xs text-stone-500 max-w-sm">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300">P</kbd> or click the Camera icon in HUD to engage field camera and capture photos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {game.capturedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative flex flex-col rounded-lg border border-amber-900/40 bg-[#1a1714] p-2.5 overflow-hidden shadow-lg hover:border-amber-500/60 transition-all"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded border border-stone-800 bg-black">
                        <img
                          src={photo.dataUrl}
                          alt={photo.location}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          onClick={() => setSelectedPhotoUrl(photo.dataUrl)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-600 cursor-pointer"
                          title="Enlarge Photo"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-cinzel font-semibold text-amber-200 line-clamp-1">{photo.location}</div>
                          <div className="text-[10px] text-stone-400">{photo.timestamp} • {photo.filterStyle}</div>
                        </div>

                        <button
                          onClick={() => game.deletePhoto(photo.id)}
                          className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Delete Photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: WRITE CUSTOM FIELD NOTE */}
          {activeTab === 'write' && (
            <div className="flex flex-1 flex-col p-4 sm:p-8 overflow-y-auto max-w-2xl mx-auto w-full space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-cinzel border-b border-amber-900/30 pb-2">
                <PenTool className="h-4 w-4 text-amber-400" />
                <span>Write Personal Field Entry</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">ENTRY TITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. Observations on Waterfall Grotto Strata"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full rounded-lg bg-stone-900/80 border border-stone-800 px-3 py-2 text-xs text-amber-200 focus:border-amber-500 focus:outline-none font-cinzel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">FIELD LOG OBSERVATIONS & INK SKETCHES</label>
                  <textarea
                    rows={6}
                    placeholder="Type your archaeological discoveries, coordinate notes, or hypothesis..."
                    value={newNoteBody}
                    onChange={(e) => setNewNoteBody(e.target.value)}
                    className="w-full rounded-lg bg-stone-900/80 border border-stone-800 p-3 text-xs text-stone-200 focus:border-amber-500 focus:outline-none font-serif leading-relaxed"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newNoteTitle.trim() && !newNoteBody.trim()) return;
                    game.quest.documents.unshift({
                      id: `doc_custom_${Date.now()}`,
                      title: newNoteTitle || 'Untitled Expedition Observation',
                      author: 'Field Investigator',
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      content: newNoteBody || 'No text written.',
                      type: 'journal_page',
                      read: true,
                    });
                    setNewNoteTitle('');
                    setNewNoteBody('');
                    setActiveTab('documents');
                    setSelectedDocId(game.quest.documents[0].id);
                    game.quest.showNotification('📜 Personal Field Note Recorded in Logbook!');
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-500 transition-colors shadow-lg cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>RECORD FIELD NOTE IN LOGBOOK</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Photo Lightbox Modal */}
        {selectedPhotoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-amber-500/50 bg-black p-2">
              <img src={selectedPhotoUrl} alt="Enlarged Expedition Photo" className="max-h-[82vh] w-auto object-contain rounded" />
              <button
                onClick={() => setSelectedPhotoUrl(null)}
                className="absolute top-4 right-4 rounded-full bg-stone-900/80 p-2 text-white hover:bg-amber-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-amber-900/30 bg-[#151310] px-8 py-2.5 text-center text-xs text-stone-500 font-mono">
          Press [TAB] or [ESC] to return to 3D Expedition
        </div>
      </div>
    </div>
  );
};
