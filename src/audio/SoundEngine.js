// Web Audio API Sound Synthesizer for FlowState

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentMode = 'focus'; // 'focus' | 'break' | 'off'

    // Layer gains
    this.binauralGain = null;
    this.noiseGain = null;
    this.synthGain = null;
    this.rainGain = null;

    // Volume states (0 to 1)
    this.volumes = {
      master: 0.8,
      binaural: 0.6,
      noise: 0.4,
      synth: 0.5,
      rain: 0.3
    };

    // Current preset config
    this.binauralFreq = 10; // Alpha 10 Hz
    this.baseFreq = 216; // A 432 Hz tuning base
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

    // Create a 2-stage Tibetan Singing Bowl chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now); // 528 Hz Solfeggio frequency
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

  startFocusSoundscape() {
    this.initContext();
    this.stopAll();

    this.currentMode = 'focus';
    this.isPlaying = true;

    const now = this.ctx.currentTime;

    // --- 1. Binaural Beats Layer ---
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

    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel

    merger.connect(this.binauralGain);
    this.binauralGain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.activeNodes = [oscLeft, oscRight];

    // --- 2. Deep Focus Brown Noise Layer ---
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.001, now);
    this.noiseGain.gain.linearRampToValueAtTime(this.volumes.noise * 0.3, now + 2);

    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Boost brown noise curve
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, now);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource);

    // --- 3. Warm Ambient Drone Layer ---
    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.setValueAtTime(0.001, now);
    this.synthGain.gain.linearRampToValueAtTime(this.volumes.synth * 0.25, now + 3);

    const chord = [130.81, 164.81, 196.00, 246.94]; // C major 7 drone
    chord.forEach((freq) => {
      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      droneOsc.connect(filter);
      filter.connect(this.synthGain);
      droneOsc.start();
      this.activeNodes.push(droneOsc);
    });

    this.synthGain.connect(this.masterGain);
  }

  startBreakSoundscape() {
    this.initContext();
    this.stopAll();

    this.currentMode = 'break';
    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Warm relaxation pads (432Hz tuning, gentle F-major warmth)
    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.setValueAtTime(0.001, now);
    this.synthGain.gain.linearRampToValueAtTime(this.volumes.synth * 0.4, now + 2);

    const breakChord = [173.24, 218.27, 260.00, 327.03]; // Warm F major 7
    breakChord.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      osc.connect(filter);
      filter.connect(this.synthGain);
      osc.start();
      this.activeNodes.push(osc);
    });

    this.synthGain.connect(this.masterGain);
  }

  setVolume(layer, val) {
    this.volumes[layer] = val;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (layer === 'master' && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(val, now + 0.1);
    } else if (layer === 'binaural' && this.binauralGain) {
      this.binauralGain.gain.linearRampToValueAtTime(val, now + 0.1);
    } else if (layer === 'noise' && this.noiseGain) {
      this.noiseGain.gain.linearRampToValueAtTime(val * 0.3, now + 0.1);
    } else if (layer === 'synth' && this.synthGain) {
      this.synthGain.gain.linearRampToValueAtTime(val * 0.3, now + 0.1);
    }
  }

  setBinauralFreq(freq) {
    this.binauralFreq = freq;
    if (this.isPlaying && this.currentMode === 'focus') {
      this.startFocusSoundscape();
    }
  }

  stopAll() {
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
