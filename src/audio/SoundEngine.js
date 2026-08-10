// Web Audio API & Audio Section Manager

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentMode = 'focus'; // 'focus' | 'doodle' | 'meditate' | 'off'
    this.selectedFocusTrack = 'focus_section_1.m4a';

    // Callback when break audio finishes playing naturally
    this.onBreakEnded = null;

    // HTML5 Audio elements
    this.focusAudio = new Audio('./audio/focus_section_1.m4a');
    this.focusAudio.loop = true;

    this.doodleAudio = new Audio('./audio/guided_doodle.m4a');
    this.doodleAudio.loop = false;

    this.meditationAudio = new Audio('./audio/guided_meditation.m4a');
    this.meditationAudio.loop = false;

    this.doodleAudio.onended = () => {
      if (this.onBreakEnded) this.onBreakEnded('doodle');
    };
    this.meditationAudio.onended = () => {
      if (this.onBreakEnded) this.onBreakEnded('meditate');
    };

    // Layer gains
    this.binauralGain = null;
    this.noiseGain = null;
    this.synthGain = null;

    // Volume states (0 to 1)
    this.volumes = {
      master: 0.8,
      binaural: 0.6,
      noise: 0.4,
      synth: 0.5
    };

    this.binauralFreq = 10;
    this.baseFreq = 216;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBreakChime() {
    this.initContext();
    const now = this.ctx.currentTime;

    // --- Soft Acoustic & Tactile Wooden Kalimba Pluck ---
    
    // 1. Tactile Pluck Impulse (Finger strike click)
    const clickBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.005, this.ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickData.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.001));
    }
    const clickSource = this.ctx.createBufferSource();
    clickSource.buffer = clickBuffer;
    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(1500, now);
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.04 * this.volumes.master, now);
    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickSource.start(now);

    // 2. Plucked Wooden Tine (Fundamental + Harmonics)
    // Warm E4 (329.6 Hz) & B4 (493.9 Hz) dual tactile pluck
    const freqs = [329.63, 493.88];
    freqs.forEach((freq, idx) => {
      const toneOsc = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      const toneFilter = this.ctx.createBiquadFilter();

      toneOsc.type = 'sine';
      // Subtle pitch bend downward simulating finger tension release on a wooden tine
      toneOsc.frequency.setValueAtTime(freq + 4, now);
      toneOsc.frequency.exponentialRampToValueAtTime(freq, now + 0.04);

      toneFilter.type = 'lowpass';
      toneFilter.frequency.setValueAtTime(1800 - idx * 400, now);

      toneGain.gain.setValueAtTime(0.001, now);
      toneGain.gain.linearRampToValueAtTime(0.09 * this.volumes.master / (idx + 1), now + 0.006);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 - idx * 0.3);

      toneOsc.connect(toneFilter);
      toneFilter.connect(toneGain);
      toneGain.connect(this.masterGain);

      toneOsc.start(now);
      toneOsc.stop(now + 2.0);
    });
  }

  setFocusTrack(trackFilename) {
    this.selectedFocusTrack = trackFilename;
    if (trackFilename !== 'binaural') {
      this.focusAudio.src = `./audio/${trackFilename}`;
    }
    if (this.isPlaying && this.currentMode === 'focus') {
      this.startFocusSoundscape();
    }
  }

  startFocusSoundscape() {
    this.initContext();
    this.stopAll();

    this.currentMode = 'focus';
    this.isPlaying = true;

    if (this.selectedFocusTrack !== 'binaural') {
      this.focusAudio.volume = this.volumes.master;
      this.focusAudio.play().catch(err => console.warn("Focus audio play deferred:", err));
      return;
    }

    const now = this.ctx.currentTime;
    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.setValueAtTime(0.001, now);
    this.binauralGain.gain.linearRampToValueAtTime(this.volumes.binaural, now + 2);

    const merger = this.ctx.createChannelMerger(2);
    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();

    oscLeft.type = 'sine';
    oscRight.type = 'sine';

    oscLeft.frequency.setValueAtTime(this.baseFreq, now);
    oscRight.frequency.setValueAtTime(this.baseFreq + this.binauralFreq, now);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);

    merger.connect(this.binauralGain);
    this.binauralGain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    this.activeNodes = [oscLeft, oscRight];
  }

  startBreakSoundscape(breakType = 'doodle') {
    this.initContext();
    this.stopAll();

    this.currentMode = breakType;
    this.isPlaying = true;

    if (breakType === 'doodle') {
      this.doodleAudio.volume = this.volumes.master;
      this.doodleAudio.currentTime = 0;
      this.doodleAudio.play().catch(err => console.warn("Doodle audio deferred:", err));
    } else if (breakType === 'meditate') {
      this.meditationAudio.volume = this.volumes.master;
      this.meditationAudio.currentTime = 0;
      this.meditationAudio.play().catch(err => console.warn("Meditation audio deferred:", err));
    }
  }

  getBreakRemainingTime(breakType) {
    const audio = breakType === 'doodle' ? this.doodleAudio : this.meditationAudio;
    if (!audio || !audio.duration || isNaN(audio.duration)) {
      return { remainingSec: 0, durationSec: 0, currentTimeSec: 0, progress: 0 };
    }

    const currentTimeSec = Math.floor(audio.currentTime);
    const durationSec = Math.ceil(audio.duration);
    const remainingSec = Math.max(0, Math.ceil(audio.duration - audio.currentTime));
    const progress = Math.min(1, audio.currentTime / audio.duration);

    return { remainingSec, durationSec, currentTimeSec, progress };
  }

  seekBreakAudio(breakType, timeInSeconds) {
    const audio = breakType === 'doodle' ? this.doodleAudio : this.meditationAudio;
    if (audio && !isNaN(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(timeInSeconds, audio.duration));
    }
  }

  setVolume(layer, val) {
    this.volumes[layer] = val;
    if (this.focusAudio) this.focusAudio.volume = val;
    if (this.doodleAudio) this.doodleAudio.volume = val;
    if (this.meditationAudio) this.meditationAudio.volume = val;

    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (layer === 'master' && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(val, now + 0.1);
    }
  }

  stopAll() {
    if (this.focusAudio) this.focusAudio.pause();
    if (this.doodleAudio) this.doodleAudio.pause();
    if (this.meditationAudio) this.meditationAudio.pause();

    if (this.activeNodes) {
      this.activeNodes.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      this.activeNodes = [];
    }
    this.isPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
