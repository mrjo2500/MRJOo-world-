import { MusicTrackId } from '../types';

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private currentTrack: MusicTrackId = 'royal_battle';
  private musicIntervalId: number | null = null;
  private beatStep = 0;
  private musicVolume = 0.5;
  private sfxVolume = 0.8;
  private musicEnabled = true;
  private sfxEnabled = true;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSettings(settings: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    currentTrack: MusicTrackId;
  }) {
    this.musicEnabled = settings.musicEnabled;
    this.sfxEnabled = settings.sfxEnabled;
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;

    if (this.ctx && this.musicGain && this.sfxGain) {
      const targetMusicGain = this.musicEnabled ? this.musicVolume * 0.35 : 0;
      this.musicGain.gain.setTargetAtTime(targetMusicGain, this.ctx.currentTime, 0.1);

      const targetSfxGain = this.sfxEnabled ? this.sfxVolume : 0;
      this.sfxGain.gain.setTargetAtTime(targetSfxGain, this.ctx.currentTime, 0.1);
    }

    if (this.currentTrack !== settings.currentTrack) {
      this.currentTrack = settings.currentTrack;
      if (this.isMusicPlaying) {
        this.stopMusic();
        this.startMusic();
      }
    } else if (this.musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!this.musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying || !this.musicEnabled) return;
    this.isMusicPlaying = true;
    this.beatStep = 0;

    // Run rhythmic loop
    const stepDuration = 220; // ms per 16th/8th step
    this.musicIntervalId = window.setInterval(() => {
      this.playMusicBeat();
      this.beatStep = (this.beatStep + 1) % 32;
    }, stepDuration);
  }

  public stopMusic() {
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.isMusicPlaying = false;
  }

  private playMusicBeat() {
    if (!this.ctx || !this.musicGain || !this.musicEnabled) return;
    const t = this.ctx.currentTime;
    const step = this.beatStep;

    switch (this.currentTrack) {
      case 'royal_battle': {
        // High-energy driving synth battle bassline + pulse
        const bassNotes = [55, 55, 58, 55, 62, 60, 58, 55]; // A1 notes
        const freq = 440 * Math.pow(2, (bassNotes[step % 8] - 69) / 12);

        // Sub bass kick on beats 0, 4, 8, 12, 16, 20, 24, 28
        if (step % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(130, t);
          kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.15);
          kickGain.gain.setValueAtTime(0.4 * this.musicVolume, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          kickOsc.connect(kickGain);
          kickGain.connect(this.musicGain);
          kickOsc.start(t);
          kickOsc.stop(t + 0.2);
        }

        // Bass Synth
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + Math.sin(step * 0.4) * 200, t);
        filter.Q.value = 4;

        gain.gain.setValueAtTime(0.12 * this.musicVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 0.2);

        // Hi-hat shaker on odd steps
        if (step % 2 === 1) {
          this.playHiHat(t, 0.04 * this.musicVolume);
        }
        break;
      }

      case 'mythic_mystery': {
        // Ambient dark suspense pads & mysterious arpeggios
        const chordNotes = [
          [57, 60, 64], // Am
          [57, 60, 65], // F/A
          [55, 59, 62], // G
          [53, 57, 60], // Dm
        ];
        const currentChord = chordNotes[Math.floor(step / 8) % 4];
        const note = currentChord[step % currentChord.length];
        const freq = 440 * Math.pow(2, (note - 69) / 12);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + Math.sin(step) * 300, t);

        gain.gain.setValueAtTime(0.08 * this.musicVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 0.45);
        break;
      }

      case 'grand_heartbeat': {
        // Intense game-show heartbeat & suspense clock
        if (step % 8 === 0 || step % 8 === 2) {
          // Double heartbeat lub-dub
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(75, t);
          osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
          gain.gain.setValueAtTime(0.5 * this.musicVolume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(t);
          osc.stop(t + 0.2);
        }

        // Tension rising chord stab on beat 0 of 16
        if (step % 16 === 0) {
          [62, 65, 69].forEach((pitch) => {
            if (!this.ctx || !this.musicGain) return;
            const stabOsc = this.ctx.createOscillator();
            const stabGain = this.ctx.createGain();
            stabOsc.type = 'sawtooth';
            stabOsc.frequency.setValueAtTime(440 * Math.pow(2, (pitch - 69) / 12), t);
            stabGain.gain.setValueAtTime(0.05 * this.musicVolume, t);
            stabGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            stabOsc.connect(stabGain);
            stabGain.connect(this.musicGain);
            stabOsc.start(t);
            stabOsc.stop(t + 0.7);
          });
        }
        break;
      }

      case 'glory_anthem': {
        // Majestic triumphant fanfare chords & marching percussion
        const anthemNotes = [60, 64, 67, 72, 71, 67, 69, 72];
        const note = anthemNotes[Math.floor(step / 2) % anthemNotes.length];
        const freq = 440 * Math.pow(2, (note - 69) / 12);

        if (step % 2 === 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.09 * this.musicVolume, t);
          gain.gain.exponentialRampToValueAtTime(0.002, t + 0.3);
          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(t);
          osc.stop(t + 0.35);
        }

        if (step % 4 === 0) {
          this.playSnare(t, 0.08 * this.musicVolume);
        }
        break;
      }
    }
  }

  private playHiHat(t: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }

  private playSnare(t: number, vol: number) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }

  /* ================== SOUND EFFECTS (SFX) ================== */

  // Realistic Crowd Cheering & Applause Synthesizer!
  public playCrowdCheer(duration = 3.2) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;

    // 1. Crowd Stadium Vocal Roar (Formant-filtered pinkish noise)
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.5;
      }
    }

    const crowdNoise = this.ctx.createBufferSource();
    crowdNoise.buffer = buffer;

    // Bandpass filter to simulate human vocal frequencies (shouting, cheer)
    const vocalFilter = this.ctx.createBiquadFilter();
    vocalFilter.type = 'bandpass';
    vocalFilter.frequency.setValueAtTime(950, t);
    vocalFilter.Q.value = 1.4;

    const crowdGain = this.ctx.createGain();
    // Swell envelope: starts fast, rises to ecstatic peak, then cheers smoothly
    crowdGain.gain.setValueAtTime(0.01, t);
    crowdGain.gain.exponentialRampToValueAtTime(0.7 * this.sfxVolume, t + 0.35);
    crowdGain.gain.setValueAtTime(0.65 * this.sfxVolume, t + duration * 0.6);
    crowdGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    crowdNoise.connect(vocalFilter);
    vocalFilter.connect(crowdGain);
    crowdGain.connect(this.sfxGain);
    crowdNoise.start(t);

    // 2. High-energy Clapping Bursts (modulated granular claps)
    for (let i = 0; i < 28; i++) {
      const clapTime = t + 0.1 + Math.random() * (duration - 0.5);
      const clapOsc = this.ctx.createBufferSource();
      const clapLen = Math.floor(this.ctx.sampleRate * 0.04);
      const clapBuf = this.ctx.createBuffer(1, clapLen, this.ctx.sampleRate);
      const cData = clapBuf.getChannelData(0);
      for (let j = 0; j < clapLen; j++) {
        cData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (clapLen * 0.25));
      }
      clapOsc.buffer = clapBuf;

      const clapFilter = this.ctx.createBiquadFilter();
      clapFilter.type = 'bandpass';
      clapFilter.frequency.setValueAtTime(1400 + Math.random() * 800, clapTime);
      clapFilter.Q.value = 3;

      const singleClapGain = this.ctx.createGain();
      singleClapGain.gain.setValueAtTime((0.15 + Math.random() * 0.2) * this.sfxVolume, clapTime);

      clapOsc.connect(clapFilter);
      clapFilter.connect(singleClapGain);
      singleClapGain.connect(this.sfxGain);
      clapOsc.start(clapTime);
    }

    // 3. Cheerful Whistle / Woo-hoo Accent!
    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(1600, t + 0.15);
    whistle.frequency.exponentialRampToValueAtTime(2400, t + 0.45);
    whistle.frequency.exponentialRampToValueAtTime(1800, t + 0.8);
    whistleGain.gain.setValueAtTime(0.001, t);
    whistleGain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.25);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    whistle.connect(whistleGain);
    whistleGain.connect(this.sfxGain);
    whistle.start(t + 0.15);
    whistle.stop(t + 0.85);
  }

  // Correct Answer Chime + Joyful Arpeggio
  public playCorrect() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.001, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25 * this.sfxVolume, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.65);
    });

    // Also trigger crowd cheer on correct answer!
    this.playCrowdCheer(2.5);
  }

  // Wrong Answer Dramatic Thud / Buzzer
  public playWrong() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Dissonant minor second (130Hz and 138Hz)
    osc1.frequency.setValueAtTime(130, t);
    osc1.frequency.exponentialRampToValueAtTime(75, t + 0.5);

    osc2.frequency.setValueAtTime(138, t);
    osc2.frequency.exponentialRampToValueAtTime(80, t + 0.5);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
  }

  // Tactile Click / Hover
  public playClick() {
    this.playHover();
  }

  public playHover() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
    gain.gain.setValueAtTime(0.04 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Lock In Answer Sound (Suspense Thump)
  public playLockIn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.2);
    gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Lifeline Crystal Magical Sound
  public playLifeline() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    const freqs = [880, 1108.73, 1318.51, 1760];
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.06);
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.38);
    });
  }

  // Clock Tick for Countdown Timer
  public playTick(isUrgent = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isUrgent ? 950 : 650, t);
    gain.gain.setValueAtTime((isUrgent ? 0.25 : 0.12) * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Grand Fanfare for Milestones
  public playVictoryFanfare() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    const chord1 = [523.25, 659.25, 783.99]; // C
    const chord2 = [587.33, 739.99, 880.0];  // D
    const chord3 = [659.25, 830.61, 987.77]; // E
    const chord4 = [1046.5, 1318.51, 1567.98]; // C high

    const playChord = (chord: number[], startTime: number, dur: number) => {
      chord.forEach((freq) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.12 * this.sfxVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    };

    playChord(chord1, t, 0.25);
    playChord(chord2, t + 0.25, 0.25);
    playChord(chord3, t + 0.5, 0.3);
    playChord(chord4, t + 0.8, 1.2);

    this.playCrowdCheer(4.0);
  }
}

export const audio = new AudioManager();
