// Web Audio API & Audio Section Manager

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentMode = 'focus'; // 'focus' | 'doodle' | 'meditate' | 'off'
    this.selectedFocusTrack = 'focus_section_1.m4a';

    // HTML5 Audio elements for focus & guided break tracks
    this.focusAudio = new Audio('./audio/focus_section_1.m4a');
    this.focusAudio.loop = true;

    this.doodleAudio = new Audio('./audio/guided_doodle.m4a');
    this.doodleAudio.loop = true;

    this.meditationAudio = new Audio('./audio/guided_meditation.m4a');
    this.meditationAudio.loop = true;

    // Layer gains for Binaural Beats fallback/layering
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

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);
    osc1.frequency.exponentialRampToValueAtTime(524, now + 3);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1056, now);
    osc2.frequency.exponentialRampToValueAtTime(1048, now + 3);

    chimeGain.gain.setValueAtTime(0.01, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.6, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 4);

    osc1.connect(chimeGain);
    osc2.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 4);
    osc2.stop(now + 4);
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
      this.focusAudio.play().catch(err => {
        console.warn("Focus audio play deferred:", err);
      });
      return;
    }

    // Binaural Beats fallback
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
