/**
 * The Lost Meridian - Procedural Web Audio Engine
 * Real-time synthesis of rainforest soundscapes, spatial acoustics, footsteps, puzzles, and adaptive music.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master Gain Nodes
  private masterGain: GainNode | null = null;
  private underwaterFilter: BiquadFilterNode | null = null;
  public isUnderwater = false;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;

  // Ambience generators
  private windNode: AudioNode | null = null;
  private rainGainNode: GainNode | null = null;
  private waterfallGainNode: GainNode | null = null;
  private riverGainNode: GainNode | null = null;
  private caveGainNode: GainNode | null = null;
  private meridianDroneGainNode: GainNode | null = null;

  // Music state
  private musicTimer: number | null = null;
  private currentMusicMood: 'ambient' | 'discovery' | 'mystery' | 'tension' | 'climax' = 'ambient';

  // Volume settings (0..1)
  private volumes = {
    master: 0.9,
    sfx: 0.85,
    music: 0.7,
    ambience: 0.8,
  };

  constructor() {
    // AudioContext will be initialized on first user interaction (click/play)
  }

  public init(): boolean {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') return true;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return false;

      this.ctx = new AudioCtxClass();

      // Master output graph with underwater acoustic filter
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);

      this.underwaterFilter = this.ctx.createBiquadFilter();
      this.underwaterFilter.type = 'lowpass';
      this.underwaterFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
      this.underwaterFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.masterGain.connect(this.underwaterFilter);
      this.underwaterFilter.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.volumes.sfx, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.volumes.music, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(this.volumes.ambience, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      this.setupAmbienceLayers();
      this.startAdaptiveMusic();
      this.startWildlifeBirdScheduler();

      this.isInitialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch (err) {
      console.error('Failed to initialize AudioContext:', err);
      return false;
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, music: number, ambience: number) {
    this.volumes = { master, sfx, music, ambience };
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(master, t, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, t, 0.05);
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(music, t, 0.05);
    if (this.ambienceGain) this.ambienceGain.gain.setTargetAtTime(ambience, t, 0.05);
  }

  /**
   * Underwater acoustic lowpass filter damping & bubbling
   */
  public setUnderwater(underwater: boolean) {
    if (this.isUnderwater === underwater) return;
    this.isUnderwater = underwater;
    if (!this.ctx || !this.underwaterFilter) return;

    const t = this.ctx.currentTime;
    if (underwater) {
      // Muffle high frequencies down to 380Hz with resonant Q
      this.underwaterFilter.frequency.cancelScheduledValues(t);
      this.underwaterFilter.frequency.setTargetAtTime(380, t, 0.08);
      this.underwaterFilter.Q.setTargetAtTime(2.8, t, 0.08);
      this.playUnderwaterBubble();
    } else {
      // Restore full auditory spectrum
      this.underwaterFilter.frequency.cancelScheduledValues(t);
      this.underwaterFilter.frequency.setTargetAtTime(20000, t, 0.12);
      this.underwaterFilter.Q.setTargetAtTime(1.0, t, 0.12);
    }
  }

  public playUnderwaterBubble() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 420 + Math.random() * 260;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.14);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  public playCipherClick() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Heavy brass/stone mechanical tooth ratchet
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(820, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playCipherSolve() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Majestic celestial chime sequence with low stone rumble
    this.playStoneGateOpening();
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);
      gain.gain.setValueAtTime(0, t + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.09 + 1.8);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 1.9);
    });
  }

  /**
   * Continuous procedural ambient layers
   */
  private setupAmbienceLayers() {
    if (!this.ctx || !this.ambienceGain) return;

    // 1. Rainforest Wind / Foliage rustle (filtered pink noise)
    const windBuffer = this.createNoiseBuffer(4);
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const windLFO = this.ctx.createOscillator();
    windLFO.frequency.setValueAtTime(0.15, this.ctx.currentTime); // slow sway
    const windLFOGain = this.ctx.createGain();
    windLFOGain.gain.setValueAtTime(250, this.ctx.currentTime);
    windLFO.connect(windLFOGain);
    windLFOGain.connect(windFilter.frequency);
    windLFO.start();

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.ambienceGain);
    windSource.start();
    this.windNode = windGain;

    // 2. Rain layer (filtered white noise with modulated gain)
    const rainBuffer = this.createNoiseBuffer(3);
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.rainGainNode = this.ctx.createGain();
    this.rainGainNode.gain.setValueAtTime(0.0, this.ctx.currentTime); // starts at 0

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGainNode);
    this.rainGainNode.connect(this.ambienceGain);
    rainSource.start();

    // 3. Waterfall roaring layer (heavy sub-bass noise + spray bandpass)
    const waterfallNoise = this.createNoiseBuffer(5);
    const wfSource = this.ctx.createBufferSource();
    wfSource.buffer = waterfallNoise;
    wfSource.loop = true;

    const wfLowFilter = this.ctx.createBiquadFilter();
    wfLowFilter.type = 'lowpass';
    wfLowFilter.frequency.setValueAtTime(180, this.ctx.currentTime);

    const wfHighFilter = this.ctx.createBiquadFilter();
    wfHighFilter.type = 'bandpass';
    wfHighFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    wfHighFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.waterfallGainNode = this.ctx.createGain();
    this.waterfallGainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);

    wfSource.connect(wfLowFilter);
    wfSource.connect(wfHighFilter);
    wfLowFilter.connect(this.waterfallGainNode);
    wfHighFilter.connect(this.waterfallGainNode);
    this.waterfallGainNode.connect(this.ambienceGain);
    wfSource.start();

    // 4. Subterranean Cave Drone
    const caveOsc = this.ctx.createOscillator();
    caveOsc.type = 'sine';
    caveOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // 45 Hz deep rumble

    const caveOsc2 = this.ctx.createOscillator();
    caveOsc2.type = 'triangle';
    caveOsc2.frequency.setValueAtTime(67.5, this.ctx.currentTime); // fifth harmonic

    this.caveGainNode = this.ctx.createGain();
    this.caveGainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);

    caveOsc.connect(this.caveGainNode);
    caveOsc2.connect(this.caveGainNode);
    this.caveGainNode.connect(this.ambienceGain);
    caveOsc.start();
    caveOsc2.start();

    // 5. Meridian Mystic Resonator Drone (harmonics of 432Hz Solarian Acoustic Frequency)
    const meridianOsc1 = this.ctx.createOscillator();
    meridianOsc1.type = 'sawtooth';
    meridianOsc1.frequency.setValueAtTime(108, this.ctx.currentTime); // Sub-harmonic 432 / 4

    const meridianOsc2 = this.ctx.createOscillator();
    meridianOsc2.type = 'sine';
    meridianOsc2.frequency.setValueAtTime(216, this.ctx.currentTime); // Harmonic 432 / 2

    const meridianFilter = this.ctx.createBiquadFilter();
    meridianFilter.type = 'bandpass';
    meridianFilter.frequency.setValueAtTime(432, this.ctx.currentTime); // Exact 432 Hz Meridian Resonance
    meridianFilter.Q.setValueAtTime(6.0, this.ctx.currentTime);

    // LFO to sweep the Meridian resonant filter
    const mFilterLFO = this.ctx.createOscillator();
    mFilterLFO.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const mFilterLFOGain = this.ctx.createGain();
    mFilterLFOGain.gain.setValueAtTime(300, this.ctx.currentTime);
    mFilterLFO.connect(mFilterLFOGain);
    mFilterLFOGain.connect(meridianFilter.frequency);
    mFilterLFO.start();

    this.meridianDroneGainNode = this.ctx.createGain();
    this.meridianDroneGainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);

    meridianOsc1.connect(meridianFilter);
    meridianOsc2.connect(meridianFilter);
    meridianFilter.connect(this.meridianDroneGainNode);
    this.meridianDroneGainNode.connect(this.ambienceGain);
    meridianOsc1.start();
    meridianOsc2.start();
  }

  /**
   * Updates positional ambient sounds based on player coordinates (Z-axis progress)
   */
  public updateSpatialAmbience(playerZ: number, rainIntensity: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Rain intensity
    if (this.rainGainNode) {
      this.rainGainNode.gain.setTargetAtTime(rainIntensity * 0.45, t, 0.2);
    }

    // Waterfall proximity (around Z = -35 to -55)
    if (this.waterfallGainNode) {
      const distToWaterfall = Math.abs(playerZ - (-45));
      const wfVol = Math.max(0, 1.0 - distToWaterfall / 35.0) * 0.7;
      this.waterfallGainNode.gain.setTargetAtTime(wfVol, t, 0.1);
    }

    // Cave & Temple reverberance (Z < -55 to -180)
    if (this.caveGainNode) {
      const inCave = playerZ < -55 && playerZ > -190;
      const caveVol = inCave ? 0.35 : (playerZ <= -190 ? 0.15 : 0.0);
      this.caveGainNode.gain.setTargetAtTime(caveVol, t, 0.5);
    }

    // Meridian energy hum (Z < -190)
    if (this.meridianDroneGainNode) {
      const distToMeridian = Math.max(0, -180 - playerZ);
      const meridianVol = Math.min(0.65, (distToMeridian / 50.0) * 0.65);
      this.meridianDroneGainNode.gain.setTargetAtTime(meridianVol, t, 0.2);
    }
  }

  /**
   * Procedural Bird Chirp Scheduler for jungle immersion
   */
  private startWildlifeBirdScheduler() {
    const triggerBird = () => {
      if (this.ctx && this.ctx.state === 'running') {
        const pan = (Math.random() * 2 - 1) * 0.8;
        const birdType = Math.random();
        if (birdType > 0.6) {
          this.playExoticCanopyCall(pan);
        } else if (birdType > 0.3) {
          this.playBellbirdChirp(pan);
        } else {
          this.playRustlingLeaves(pan);
        }
      }
      const nextDelay = 4000 + Math.random() * 8000;
      setTimeout(triggerBird, nextDelay);
    };
    setTimeout(triggerBird, 2000);
  }

  private playExoticCanopyCall(pan = 0) {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    osc.type = 'sine';
    const baseFreq = 1600 + Math.random() * 600;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.28);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    if (panner) {
      panner.pan.setValueAtTime(pan, t);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.ambienceGain);
    } else {
      osc.connect(gain);
      gain.connect(this.ambienceGain);
    }

    osc.start(t);
    osc.stop(t + 0.4);
  }

  private playBellbirdChirp(pan = 0) {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400 + Math.random() * 400, t);
    osc.frequency.linearRampToValueAtTime(2100, t + 0.18);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ambienceGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  private playRustlingLeaves(pan = 0) {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.4);
    const source = this.ctx.createBufferSource();
    source.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);
    source.start(t);
  }

  /**
   * Adaptive Generative Cinematic Soundtrack
   */
  public setMusicMood(mood: 'ambient' | 'discovery' | 'mystery' | 'tension' | 'climax') {
    this.currentMusicMood = mood;
  }

  private startAdaptiveMusic() {
    const chordProgressions = {
      ambient: [
        [146.83, 220.0, 261.63, 329.63], // D3, A3, C4, E4 (Dm9)
        [130.81, 196.0, 246.94, 329.63], // C3, G3, B3, E4 (Cmaj7)
        [110.0, 164.81, 220.0, 261.63],  // A2, E3, A3, C4 (Am)
        [123.47, 185.0, 246.94, 293.66], // B2, F#3, B3, D4 (Bm)
      ],
      discovery: [
        [146.83, 220.0, 293.66, 370.0],  // Dmaj7
        [174.61, 261.63, 329.63, 392.0], // Fmaj7
        [196.0, 293.66, 392.0, 493.88],  // Gmaj9
        [146.83, 220.0, 329.63, 440.0],  // Dsus2
      ],
      mystery: [
        [110.0, 164.81, 233.08, 277.18], // A dim / mystic
        [98.0, 146.83, 207.65, 261.63],
        [116.54, 174.61, 233.08, 311.13],
        [110.0, 155.56, 220.0, 311.13],
      ],
      tension: [
        [73.42, 110.0, 146.83, 174.61],
        [65.41, 98.0, 130.81, 164.81],
        [69.30, 103.83, 138.59, 174.61],
        [73.42, 110.0, 138.59, 164.81],
      ],
      climax: [
        [110.0, 164.81, 220.0, 277.18, 329.63, 440.0], // Majestic A Major / Meridian
        [146.83, 220.0, 293.66, 370.0, 440.0, 587.33], // D Major
        [164.81, 246.94, 329.63, 415.30, 493.88, 659.25], // E Major
        [110.0, 164.81, 220.0, 329.63, 440.0, 554.37], // A9
      ],
    };

    let step = 0;
    const playChordStep = () => {
      if (this.ctx && this.ctx.state === 'running' && this.musicGain) {
        const chords = chordProgressions[this.currentMusicMood] || chordProgressions.ambient;
        const chord = chords[step % chords.length];
        this.playSynthesizedPadChord(chord, 6.0);

        if (Math.random() > 0.35) {
          const root = chord[0];
          setTimeout(() => {
            this.playCrystalMotif(root * 2);
          }, 1500 + Math.random() * 2000);
        }
        step++;
      }
      setTimeout(playChordStep, 5800);
    };
    setTimeout(playChordStep, 1000);
  }

  private playSynthesizedPadChord(frequencies: number[], duration = 5.0) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    frequencies.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      // subtle chorus detune
      osc.detune.setValueAtTime((i % 2 === 0 ? 3 : -3), t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + i * 150, t);

      const maxGain = 0.035 / frequencies.length;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(maxGain, t + 2.0);
      gain.gain.setTargetAtTime(0.0001, t + duration - 2.0, 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(t);
      osc.stop(t + duration + 1.5);
    });
  }

  private playCrystalMotif(baseFreq: number) {
    if (!this.ctx || !this.musicGain) return;
    const intervals = [1, 1.25, 1.334, 1.5, 1.875];
    const notes = [0, 2, 4, 3].map((idx) => baseFreq * intervals[idx % intervals.length]);

    notes.forEach((freq, i) => {
      const delay = i * 0.45;
      const t = this.ctx!.currentTime + delay;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  /**
   * Sound Effects (Footsteps, Puzzles, Relics, UI)
   */
  public playFootstep(
    surface: 'grass' | 'mud' | 'stone' | 'water' | 'wood' | 'sand' | 'gravel' = 'grass',
    isSprinting = false,
    isCrouching = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const volumeScale = isCrouching ? 0.45 : isSprinting ? 1.35 : 1.0;

    const noise = this.createNoiseBuffer(0.14);
    const source = this.ctx.createBufferSource();
    source.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (surface === 'stone') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.setValueAtTime(2.2, t);
      gain.gain.setValueAtTime(0.075 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isSprinting ? 0.07 : 0.09));
    } else if (surface === 'water') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(1.0, t);
      gain.gain.setValueAtTime(0.09 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    } else if (surface === 'mud') {
      // Viscous two-phase suction squelch
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, t);
      filter.frequency.linearRampToValueAtTime(540, t + 0.05);
      gain.gain.setValueAtTime(0.11 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      // Micro suction pop on toe-off
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(160, t + 0.04);
      popOsc.frequency.exponentialRampToValueAtTime(320, t + 0.09);
      popGain.gain.setValueAtTime(0.04 * volumeScale, t + 0.04);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      popOsc.connect(popGain);
      popGain.connect(this.sfxGain);
      popOsc.start(t + 0.04);
      popOsc.stop(t + 0.12);
    } else if (surface === 'sand') {
      // Gritty granular compression
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, t);
      filter.Q.setValueAtTime(0.9, t);
      gain.gain.setValueAtTime(0.065 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    } else if (surface === 'gravel') {
      // Pebble rattle with high-band crunch
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1350, t);
      filter.Q.setValueAtTime(1.8, t);
      gain.gain.setValueAtTime(0.08 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);
    } else {
      // Grass / soil
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(580, t);
      filter.Q.setValueAtTime(1.1, t);
      gain.gain.setValueAtTime(0.055 * volumeScale, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(t);
  }

  /**
   * Delicate Camelhair Archaeological Brush Sweep
   */
  public playBrushStroke() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.22);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.linearRampToValueAtTime(1800, t + 0.1);
    filter.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  /**
   * Field Trowel Delicate Sediment Scrape
   */
  public playTrowelScrape() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.18);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, t);
    filter.Q.setValueAtTime(3.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  /**
   * Campfire Hearth Ember Crackle & Snap
   */
  public playCampfireCrackle() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Small sharp wood snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 + Math.random() * 800, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);

    // Warm ember hiss
    const noise = this.createNoiseBuffer(0.16);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.setValueAtTime(2.0, t);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.05, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    src.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    src.start(t);
  }

  /**
   * Antique Pocket Compass Gimbaled Case Click
   */
  public playCompassClick() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.035);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  public playWaterSplash(intensity = 0.5) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.45);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.35);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playStoneDialTurn() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Heavy low grind + click
    const noise = this.createNoiseBuffer(0.6);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, t);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);

    // Stone locking 'thud'
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(120, t + 0.45);
    thud.frequency.exponentialRampToValueAtTime(40, t + 0.6);
    thudGain.gain.setValueAtTime(0.15, t + 0.45);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thud.start(t + 0.45);
    thud.stop(t + 0.7);
  }

  public playCameraShutter() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Metallic mechanical shutter click
    const buffer = this.createNoiseBuffer(0.18);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);

    // Follower metallic spring snap
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

    oscGain.gain.setValueAtTime(0.2, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playPrismAlign() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Crystalline chime
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, t);
    osc2.frequency.exponentialRampToValueAtTime(2640, t + 0.25);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 1.3);
    osc2.stop(t + 1.3);
  }

  public playStoneGateOpening() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Sub rumble + continuous grind
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.linearRampToValueAtTime(45, t + 3.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, t);

    oscGain.gain.setValueAtTime(0.01, t);
    oscGain.gain.linearRampToValueAtTime(0.25, t + 0.8);
    oscGain.gain.linearRampToValueAtTime(0.2, t + 2.5);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 3.5);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 3.6);
  }

  public playItemDiscovery() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, t + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 1.5);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 1.6);
    });
  }

  public playSfx(type: 'click' | 'relic' | 'splash' | 'stone' | 'crystal' | 'gate' | 'drone') {
    if (!this.ctx || !this.sfxGain) return;
    switch (type) {
      case 'click': {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }
      case 'relic':
        this.playItemDiscovery();
        break;
      case 'splash':
        this.playWaterSplash(0.6);
        break;
      case 'stone':
        this.playStoneDialTurn();
        break;
      case 'crystal':
        this.playPrismAlign();
        break;
      case 'gate':
        this.playStoneGateOpening();
        break;
      case 'drone':
        break;
    }
  }

  public playMeridianPulse() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Grand harmonic swell
    const freqs = [110, 220, 330, 440, 550, 660, 880];
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, t);
      filter.Q.setValueAtTime(12.0, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 5.2);
    });
  }

  public playTorchToggle(isOn: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isOn ? 1200 : 700, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playJournalTurn() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.2);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playFireIgnition() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Resonant fire whoosh
    const noise = this.createNoiseBuffer(0.6);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.linearRampToValueAtTime(850, t + 0.15);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.55);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playBrushSweep() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.18);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200 + Math.random() * 600, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playTrowelChip() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playMapFastTravel() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.1, t + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.07 + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 1.3);
    });
  }

  public playThunder() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(2.4);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, t);
    filter.frequency.linearRampToValueAtTime(70, t + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.3);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playCharcoalShade() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.12);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800 + Math.random() * 400, t);
    filter.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playMorseSparkKey(freq = 800) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    // High-pitched electrical spark buzzer
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playRadioTuneStatic() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.2);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playTuningFork(freq = 432) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Strike transient click
    const strikeOsc = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(freq * 3.5, t);
    strikeGain.gain.setValueAtTime(0.15, t);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    strikeOsc.connect(strikeGain);
    strikeGain.connect(this.sfxGain);
    strikeOsc.start(t);
    strikeOsc.stop(t + 0.05);

    // Fundamental Pure Tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Long acoustic metallic ringdown
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);

    // Harmonic Overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, t);
    gain2.gain.setValueAtTime(0.08, t);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 4.0);
    osc2.start(t);
    osc2.stop(t + 2.0);
  }

  public playLiquidPour() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.4);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 1.2);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playPlantHarvest() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.25);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playFalconCry() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    // Pitch envelope: sharp piercing cry descending
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(2600, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.55);

    // Vibrato LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(28, t);
    lfoGain.gain.setValueAtTime(120, t);
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.6);

    // Bandpass filter for nasal avian timbre
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1900, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  public playRappelFriction() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Carabiner metallic latch click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(2400, t);
    clickGain.gain.setValueAtTime(0.12, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);
    clickOsc.start(t);
    clickOsc.stop(t + 0.05);

    // Rope slide texture
    const noise = this.createNoiseBuffer(0.45);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.2);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playChemicalFizz() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.5);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.linearRampToValueAtTime(1800, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playTheodoliteClick() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.03);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  public playStarlightHum() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const freqs = [528, 792, 1056];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 2.1);
    });
  }

  public playDiverBreathing() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.4);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.linearRampToValueAtTime(540, t + 0.6);
    filter.frequency.linearRampToValueAtTime(260, t + 1.4);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playDiverBubbles() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const startT = t + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220 + i * 80, startT);
      osc.frequency.exponentialRampToValueAtTime(580 + i * 120, startT + 0.14);

      gain.gain.setValueAtTime(0.08, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startT);
      osc.stop(startT + 0.16);
    }
  }

  public playMinecartClatter() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.25);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playGramophoneCrackle() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.0);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playPhonographTrack(trackIdx: number) {
    if (!this.ctx || !this.sfxGain) return;
    this.playGramophoneCrackle();

    const t = this.ctx.currentTime;
    // Nostalgic 1920s gramophone melody intervals
    const melodySets = [
      [261.63, 329.63, 392.00, 523.25, 392.00], // C major arpeggio
      [220.00, 261.63, 329.63, 440.00, 329.63], // A minor lament
      [349.23, 440.00, 523.25, 698.46, 523.25], // F major triumphant
      [196.00, 246.94, 293.66, 392.00, 293.66], // G major resolution
    ];
    const notes = melodySets[trackIdx % melodySets.length];

    notes.forEach((pitch, i) => {
      const startT = t + i * 0.45;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // Bandpass to emulate tinny acoustic horn resonance
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, startT);
      filter.Q.setValueAtTime(3.5, startT);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, startT);

      gain.gain.setValueAtTime(0.01, startT);
      gain.gain.linearRampToValueAtTime(0.07, startT + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.44);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startT);
      osc.stop(startT + 0.46);
    });
  }

  public playBurnerRoar() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.2);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(240, t);
    filter.frequency.linearRampToValueAtTime(380, t + 0.3);
    filter.frequency.linearRampToValueAtTime(180, t + 1.2);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playHighAltitudeWind() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(2.0);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 1.0);
    filter.frequency.linearRampToValueAtTime(400, t + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playRadioStatic() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.6);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playMorseTone(freq = 800, duration = 0.12) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.setValueAtTime(0.15, t + duration - 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  public playTelegraphClick() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  public playStoneWheelGrind() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.5);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, t);
    filter.frequency.linearRampToValueAtTime(650, t + 0.25);
    filter.frequency.linearRampToValueAtTime(280, t + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playRuneChime() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77]; // E major chord

    notes.forEach((freq, idx) => {
      const startT = t + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.01, startT);
      gain.gain.linearRampToValueAtTime(0.12, startT + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startT);
      osc.stop(startT + 1.7);
    });
  }

  public playArmillaryGearTurn() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.12);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playSpectralBeamIgnition() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C major celestial chord

    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.05);

      gain.gain.setValueAtTime(0.01, t + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, t + i * 0.05 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 2.0);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 2.1);
    });
  }

  public playWaterValveTurn() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.25);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playWaterSiphonGush() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.4);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(750, t + 0.4);
    filter.frequency.linearRampToValueAtTime(320, t + 1.4);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playChiselChip() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playAcidSizzle() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.8);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playBoneRestored() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major triumphant chord

    notes.forEach((freq, idx) => {
      const startT = t + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.01, startT);
      gain.gain.linearRampToValueAtTime(0.12, startT + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 1.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startT);
      osc.stop(startT + 1.9);
    });
  }

  public playBellowsBlast() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.8);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.linearRampToValueAtTime(520, t + 0.3);
    filter.frequency.linearRampToValueAtTime(120, t + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playMoltenPour() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.2);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.6);
    filter.frequency.linearRampToValueAtTime(400, t + 1.2);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playQuenchHiss() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.5);
    if (!noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.linearRampToValueAtTime(3200, t + 0.4);
    filter.frequency.linearRampToValueAtTime(900, t + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playDraftingPencil() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.3);
    if (!noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.setValueAtTime(5.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playChladniTone(freq = 528, duration = 1.4) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    // Bandpass to emulate brass resonance plate
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, t);
    filter.Q.setValueAtTime(8.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.2);
    gain.gain.setValueAtTime(0.18, t + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  public playSandScatter() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.5);
    if (!noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.07, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playBiplaneEngine(throttle = 0.5) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const baseFreq = 55 + throttle * 75; // 55Hz (idle) to 130Hz (full throttle)
    osc.frequency.setValueAtTime(baseFreq, t);

    gain.gain.setValueAtTime(0.08 * Math.max(0.2, throttle), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playFlareDrop() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(1.8);
    if (!noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.3);
    filter.frequency.linearRampToValueAtTime(300, t + 1.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playScaleTilt() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.linearRampToValueAtTime(280, t + 0.15);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playScaleBalanceChime() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D major harmonic chime

    notes.forEach((freq, idx) => {
      const startT = t + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.01, startT);
      gain.gain.linearRampToValueAtTime(0.14, startT + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 2.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startT);
      osc.stop(startT + 2.3);
    });
  }

  public playLanternClick() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playUvFilterSwitch() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.linearRampToValueAtTime(2400, t + 0.12);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playGrandFinaleFanfare() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Triumphant orchestral & celestial chord progression (C - G - Am - F - C8)
    const chords = [
      { notes: [261.63, 329.63, 392.0, 523.25], time: 0, dur: 1.2 }, // C
      { notes: [293.66, 392.0, 493.88, 587.33], time: 0.9, dur: 1.2 }, // G
      { notes: [220.0, 261.63, 329.63, 440.0], time: 1.8, dur: 1.2 }, // Am
      { notes: [349.23, 440.0, 523.25, 698.46], time: 2.7, dur: 1.5 }, // F
      { notes: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98], time: 3.8, dur: 4.5 }, // Grand Apex C
    ];

    chords.forEach((chord) => {
      const chordStart = t + chord.time;
      chord.notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, chordStart);

        gain.gain.setValueAtTime(0.01, chordStart);
        gain.gain.linearRampToValueAtTime(0.12, chordStart + 0.08);
        gain.gain.setValueAtTime(0.12, chordStart + chord.dur - 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + chord.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(chordStart);
        osc.stop(chordStart + chord.dur + 0.05);
      });
    });
  }

  private createNoiseBuffer(durationSeconds: number): AudioBuffer | null {
    if (!this.ctx) {
      return null;
    }
    const sampleRate = this.ctx.sampleRate || 44100;
    const frameCount = Math.floor(sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < frameCount; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise approximation
      lastOut = (lastOut * 0.95) + (white * 0.05);
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }
}

export const audioEngine = new AudioEngine();
