/**
 * The Lost Meridian - Master Application Component
 * A Strict Three.js r186 Cinematic Archaeological Adventure Game
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GameManager } from './game/GameManager';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { JournalModal } from './components/JournalModal';
import { PauseMenu } from './components/PauseMenu';
import { OpeningScreen } from './components/OpeningScreen';
import { CinematicOverlay } from './components/CinematicOverlay';
import { CameraOverlay } from './components/CameraOverlay';
import { MobileControls } from './components/MobileControls';
import { CipherWheelModal } from './components/CipherWheelModal';
import { PocketWatchPopover } from './components/PocketWatchPopover';
import { MapModal } from './components/MapModal';
import { ExcavationModal } from './components/ExcavationModal';
import { WeatherStationModal } from './components/WeatherStationModal';
import { CharcoalRubbingModal } from './components/CharcoalRubbingModal';
import { HerbariumModal } from './components/HerbariumModal';
import { TuningForkModal } from './components/TuningForkModal';
import { CampfireBrewModal } from './components/CampfireBrewModal';
import { FalconScoutHUD } from './components/FalconScoutHUD';
import { ReliquaryModal } from './components/ReliquaryModal';
import { PlanetariumModal } from './components/PlanetariumModal';
import { ChemistryLabModal } from './components/ChemistryLabModal';
import { TheodoliteModal } from './components/TheodoliteModal';
import { PhonographModal } from './components/PhonographModal';
import { DivingHUD } from './components/DivingHUD';
import { BalloonHUD } from './components/BalloonHUD';
import { RadioModal } from './components/RadioModal';
import { EpigraphyModal } from './components/EpigraphyModal';
import { ArmillaryModal } from './components/ArmillaryModal';
import { HydraulicModal } from './components/HydraulicModal';
import { PaleontologyModal } from './components/PaleontologyModal';
import { MetallurgyModal } from './components/MetallurgyModal';
import { CartographyModal } from './components/CartographyModal';
import { ChladniModal } from './components/ChladniModal';
import { BiplaneHUD } from './components/BiplaneHUD';
import { AssayBalanceModal } from './components/AssayBalanceModal';
import { MagicLanternModal } from './components/MagicLanternModal';
import { FinaleModal } from './components/FinaleModal';
import { InspectLoreModal } from './components/InspectLoreModal';
import { QAAuditModal } from './components/QAAuditModal';
import { audioEngine } from './game/audio/AudioEngine';

export default function App() {
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [, setTick] = useState(0);

  // Initialize master game engine instance
  const game = useMemo(() => new GameManager(), []);

  useEffect(() => {
    // Hook state update callback for React re-renders on UI state shifts
    game.onStateChange = () => {
      setTick((t) => t + 1);
    };

    // Periodic UI tick for HUD updates (compass, stamina, interaction focus)
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 250);

    // Global keyboard listener for modal closing and emergency unstick
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (game.closeAnyOpenModal()) {
          e.preventDefault();
          game.input.requestPointerLock();
          setTick((t) => t + 1);
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        game.executeEmergencyRescue();
        setTick((t) => t + 1);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [game]);

  const handleStartExpedition = () => {
    setHasStartedGame(true);
    audioEngine.init();
    game.startNewGame();
  };

  const handleRestartExpedition = () => {
    window.location.reload();
  };

  const handleResume = () => {
    game.isPaused = false;
    setTick((t) => t + 1);
  };

  const handleCloseJournal = () => {
    game.isJournalOpen = false;
    setTick((t) => t + 1);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black font-sans select-none">
      {/* 1. Main 3D Viewport */}
      <GameCanvas game={game} />

      {/* 2. Opening Title & Start Briefing Screen */}
      {!hasStartedGame && (
        <OpeningScreen
          game={game}
          onStart={handleStartExpedition}
        />
      )}

      {/* 3. In-Game Master HUD & Mobile Controls */}
      {hasStartedGame && !game.isPaused && !game.isPhotoMode && !game.isAnyModalOpen() && (
        <>
          <HUD game={game} />
          <MobileControls game={game} />
        </>
      )}

      {/* Field Camera Mode */}
      {game.isPhotoMode && (
        <CameraOverlay
          game={game}
          onClose={() => {
            game.isPhotoMode = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 4. Cinematic Letterbox & Subtitles Overlay */}
      {hasStartedGame && (
        <CinematicOverlay
          game={game}
          onRestart={handleRestartExpedition}
        />
      )}

      {/* 5. Expedition Journal & Relics Archive */}
      {game.isJournalOpen && (
        <JournalModal
          game={game}
          onClose={handleCloseJournal}
        />
      )}

      {/* 5B. Archaeological Field Dossier & Stele Inscription Modal */}
      {game.isInspectLoreOpen && game.currentLoreData && (
        <InspectLoreModal
          lore={game.currentLoreData}
          game={game}
          onClose={() => {
            game.closeLoreInspection();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 6. Celestial Astrolabe Stele Cipher Minigame */}
      {game.isCipherWheelOpen && (
        <CipherWheelModal
          game={game}
          onClose={() => {
            game.isCipherWheelOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 7. 1928 Antique Pocket Watch Time Controller */}
      {game.isWatchOpen && (
        <PocketWatchPopover
          game={game}
          onClose={() => {
            game.isWatchOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 8. Topographical Cartography Survey Map & Fast-Travel */}
      {game.isMapOpen && (
        <MapModal
          game={game}
          onClose={() => {
            game.isMapOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 9. Field Excavation & Sediment Brushing Minigame */}
      {game.isExcavationOpen && (
        <ExcavationModal
          game={game}
          siteId={game.currentExcavationSiteId}
          onClose={() => {
            game.isExcavationOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 10. 1928 Aneroid Barometer & Microclimate Weather Station */}
      {game.isWeatherStationOpen && (
        <WeatherStationModal
          game={game}
          onClose={() => {
            game.isWeatherStationOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 11. Ancient Relief Charcoal Rubbing & Epigraphy Minigame */}
      {game.isRubbingOpen && (
        <CharcoalRubbingModal
          game={game}
          reliefId={game.currentReliefId}
          onClose={() => {
            game.isRubbingOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 13. Endemic Botanical Herbarium Specimen Press */}
      {game.isHerbariumOpen && (
        <HerbariumModal
          game={game}
          onClose={() => {
            game.isHerbariumOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 14. Pythagorean Acoustic Tuning Forks Resonance */}
      {game.isTuningForkOpen && (
        <TuningForkModal
          game={game}
          onClose={() => {
            game.isTuningForkOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 15. Expedition Campfire Hearth & Billycan Brewing */}
      {game.isCampfireBrewOpen && (
        <CampfireBrewModal
          game={game}
          onClose={() => {
            game.isCampfireBrewOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 16. Andean Falcon Aerial Canopy Reconnaissance HUD */}
      {game.isFalconFlying && (
        <FalconScoutHUD
          game={game}
          onExit={() => {
            game.stopFalconFlight();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 17. The Curator's 3D Reliquary & Artifact Inspection Chamber */}
      {game.isReliquaryOpen && (
        <ReliquaryModal
          game={game}
          onClose={() => {
            game.isReliquaryOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 18. Meridian Planetarium Dome & Constellation Projector */}
      {game.isPlanetariumOpen && (
        <PlanetariumModal
          game={game}
          onClose={() => {
            game.isPlanetariumOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 19. Archaeologist's Field Chemistry & Reagent Test Bench */}
      {game.isChemistryLabOpen && (
        <ChemistryLabModal
          game={game}
          onClose={() => {
            game.isChemistryLabOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 20. 1928 Brass Theodolite Optical Transit */}
      {game.isTheodoliteOpen && (
        <TheodoliteModal
          game={game}
          onClose={() => {
            game.isTheodoliteOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 21. 1928 Edison Wax-Cylinder Phonograph Player */}
      {game.isPhonographOpen && (
        <PhonographModal
          game={game}
          onClose={() => {
            game.isPhonographOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 22. 1920s Copper Hard-Hat Diving Helmet HUD */}
      {game.divingSystem.isDiving && (
        <DivingHUD
          game={game}
          onExit={() => {
            game.stopDiving();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 23. 1928 Expedition Observation Balloon HUD */}
      {game.balloonSystem.isBoarded && (
        <BalloonHUD
          game={game}
          onDismount={() => {
            game.dismountBalloon();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 24. 1928 Marconi Long-Wave Spark-Gap Wireless Field Radio */}
      {game.isRadioOpen && (
        <RadioModal
          game={game}
          onClose={() => {
            game.isRadioOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 25. Concentric Stone Epigraphy Wheel & Stelae Decryption */}
      {game.isEpigraphyOpen && (
        <EpigraphyModal
          game={game}
          onClose={() => {
            game.isEpigraphyOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 26. Celestial Prismatic Armillary Sphere */}
      {game.isArmillaryOpen && (
        <ArmillaryModal
          game={game}
          onClose={() => {
            game.isArmillaryOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 27. Subterranean Cenote Hydraulic Siphon Grid */}
      {game.isHydraulicOpen && (
        <HydraulicModal
          game={game}
          onClose={() => {
            game.isHydraulicOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 28. Field Paleontology & Fossil Preparation Bench */}
      {game.isPaleontologyOpen && (
        <PaleontologyModal
          game={game}
          onClose={() => {
            game.isPaleontologyOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 29. Expedition Field Metallurgy & Smelting Forge */}
      {game.isMetallurgyOpen && (
        <MetallurgyModal
          game={game}
          onClose={() => {
            game.isMetallurgyOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 30. Cartographer's Topographic Drafting Desk */}
      {game.isCartographyOpen && (
        <CartographyModal
          game={game}
          onClose={() => {
            game.isCartographyOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 31. Acoustic Chladni Resonance Table */}
      {game.isChladniOpen && (
        <ChladniModal
          game={game}
          onClose={() => {
            game.isChladniOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 32. 1928 Curtiss Biplane Cockpit Flight HUD */}
      {game.biplaneSystem.isBoarded && <BiplaneHUD game={game} />}

      {/* 33. Hydrostatic Assay Sarcophagus Balance Scale */}
      {game.isAssayOpen && (
        <AssayBalanceModal
          game={game}
          onClose={() => {
            game.isAssayOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 34. Carbide-Lamp Magic Lantern Glass Slide Projector */}
      {game.isLanternOpen && (
        <MagicLanternModal
          game={game}
          onClose={() => {
            game.isLanternOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 35. Grand Solstice Finale Victory Screen */}
      {game.isFinaleOpen && (
        <FinaleModal
          game={game}
          onContinueSandbox={() => {
            game.isFinaleOpen = false;
            game.input.requestPointerLock();
            setTick((t) => t + 1);
          }}
          onRestartExpedition={handleRestartExpedition}
        />
      )}

      {/* 35B. 10-Lead Stringent QA Audit Dossier & Master Review */}
      {game.isQAAuditOpen && (
        <QAAuditModal
          game={game}
          onClose={() => {
            game.closeQAAudit();
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* 36. Pause & Options Menu */}
      {game.isPaused && (
        <PauseMenu
          game={game}
          onResume={handleResume}
          onRestart={handleRestartExpedition}
        />
      )}
    </div>
  );
}
