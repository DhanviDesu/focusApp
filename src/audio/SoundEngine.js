// Web Audio API & Audio Section Manager

export const SPOTIFY_TRACKS = [
  { file: 'track_01.m4a', title: 'Attention (Violin)', artist: 'Dramatica' },
  { file: 'track_02.m4a', title: 'Dandelions (Violin)', artist: 'Dramatica' },
  { file: 'track_03.m4a', title: 'Fairytale (Violin)', artist: 'Dramatica' },
  { file: 'track_04.m4a', title: 'First Sight', artist: 'Joel Sunny' },
  { file: 'track_05.m4a', title: 'Into the Woods', artist: 'Joel Sunny' },
  { file: 'track_06.m4a', title: 'Love Nwantiti (Violin)', artist: 'Dramatica' },
  { file: 'track_07.m4a', title: 'Luminary', artist: 'Joel Sunny' },
  { file: 'track_08.m4a', title: 'Middle Of The Night (Violin)', artist: 'Joel Sunny, Dramatica' },
  { file: 'track_09.m4a', title: 'Play Date (Violin)', artist: 'Dramatica' },
  { file: 'track_10.m4a', title: 'Runaway (Violin)', artist: 'Dramatica' },
  { file: 'track_11.m4a', title: 'Running Up That Hill (Violin)', artist: 'Dramatica' },
  { file: 'track_12.m4a', title: 'Say It Right (Violin)', artist: 'Dramatica' },
  { file: 'track_13.m4a', title: 'Slow Dancing In The Dark (Violin)', artist: 'Dramatica' },
  { file: 'track_14.m4a', title: 'Streets (Violin)', artist: 'Dramatica' },
  { file: 'track_15.m4a', title: 'Sweater Weather (Violin)', artist: 'Dramatica' },
  { file: 'track_16.m4a', title: 'Train Wreck (Violin)', artist: 'Dramatica' },
  { file: 'track_17.m4a', title: "Why'd You Only Call Me When You're High (Violin)", artist: 'Dramatica' },
  { file: 'track_18.m4a', title: 'Young and Beautiful (Violin)', artist: 'Dramatica' },
  { file: 'track_19.m4a', title: 'With Love Comes Loss (Piano Solo)', artist: 'John Powell, Batu Sener' },
  { file: 'track_20.m4a', title: 'Time (Inception Piano)', artist: 'Random Piano' },
  { file: 'track_21.m4a', title: 'Into The West', artist: 'Jamie Duffy' },
  { file: 'track_22.m4a', title: 'Breathing', artist: 'Jamie Duffy' },
  { file: 'track_23.m4a', title: 'Solas', artist: 'Jamie Duffy' },
  { file: 'track_24.m4a', title: "Valzer D'amore", artist: 'Jason Fervento' },
  { file: 'track_25.m4a', title: 'Hijo De La Luna (Orchestra)', artist: '2dypoy' },
  { file: 'track_26.m4a', title: 'Dawn of Faith', artist: 'Eternal Eclipse' },
  { file: 'track_27.m4a', title: 'Idea 12', artist: 'Gibran Alcocer' },
  { file: 'track_28.m4a', title: 'Idea 25', artist: 'Gibran Alcocer, Andrea Vanzo' },
  { file: 'track_29.m4a', title: 'November', artist: 'TWO LANES' },
  { file: 'track_30.m4a', title: 'Dance For Me Wallis', artist: 'Abel Korzeniowski' }
];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentMode = 'focus'; // 'focus' | 'doodle' | 'meditate' | 'off'
    this.selectedFocusTrack = 'focus_section_1.m4a';

    // Playlist Shuffle State
    this.playlistQueue = [];
    this.playlistIndex = 0;
    this.currentTrackInfo = { title: '', artist: '' };
    this.onTrackChange = null;

    // Callback when break audio finishes playing naturally
    this.onBreakEnded = null;

    // HTML5 Audio elements
    this.focusAudio = new Audio('./audio/focus_section_1.m4a');
    this.focusAudio.loop = true;

    this.doodleAudio = new Audio('./audio/guided_doodle.m4a');
    this.doodleAudio.loop = false;

    this.meditationAudio = new Audio('./audio/guided_meditation.m4a');
    this.meditationAudio.loop = false;

    // Spotify track end listener -> play next track in shuffled queue
    this.focusAudio.onended = () => {
      if (this.currentMode === 'focus' && this.selectedFocusTrack === 'spotify_shuffle') {
        this.playNextSpotifyTrack();
      }
    };

    this.doodleAudio.onended = () => {
      if (this.onBreakEnded) this.onBreakEnded('doodle');
    };
    this.meditationAudio.onended = () => {
      if (this.onBreakEnded) this.onBreakEnded('meditate');
    };

    // Layer gains
    this.binauralGain = null;
    this.noiseGain = null;

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

    // Soft Acoustic & Tactile Wooden Kalimba Pluck
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

    const freqs = [329.63, 493.88];
    freqs.forEach((freq, idx) => {
      const toneOsc = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      const toneFilter = this.ctx.createBiquadFilter();

      toneOsc.type = 'sine';
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

  // Shuffle playlist tracks using Fisher-Yates algorithm
  shuffleSpotifyQueue() {
    const queue = [...SPOTIFY_TRACKS];
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    this.playlistQueue = queue;
    this.playlistIndex = 0;
  }

  setFocusTrack(trackFilename) {
    this.selectedFocusTrack = trackFilename;

    if (trackFilename === 'spotify_shuffle') {
      this.focusAudio.loop = false;
      this.shuffleSpotifyQueue();
      this.playCurrentSpotifyTrack();
      return;
    }

    this.focusAudio.loop = true;
    if (trackFilename !== 'binaural') {
      this.focusAudio.src = `./audio/${trackFilename}`;
    }
    if (this.isPlaying && this.currentMode === 'focus') {
      this.startFocusSoundscape();
    }
  }

  playCurrentSpotifyTrack() {
    if (this.playlistQueue.length === 0) {
      this.shuffleSpotifyQueue();
    }
    const currentTrack = this.playlistQueue[this.playlistIndex];
    this.currentTrackInfo = { title: currentTrack.title, artist: currentTrack.artist };
    if (this.onTrackChange) this.onTrackChange(this.currentTrackInfo);

    this.focusAudio.src = `./audio/spotify_playlist/${currentTrack.file}`;
    if (this.isPlaying && this.currentMode === 'focus') {
      this.focusAudio.volume = this.volumes.master;
      this.focusAudio.play().catch(err => console.warn("Spotify audio deferred:", err));
    }
  }

  playNextSpotifyTrack() {
    this.playlistIndex = (this.playlistIndex + 1) % this.playlistQueue.length;
    if (this.playlistIndex === 0) {
      this.shuffleSpotifyQueue();
    }
    this.playCurrentSpotifyTrack();
  }

  startFocusSoundscape() {
    this.initContext();
    this.stopAll();

    this.currentMode = 'focus';
    this.isPlaying = true;

    if (this.selectedFocusTrack === 'spotify_shuffle') {
      if (this.playlistQueue.length === 0) {
        this.shuffleSpotifyQueue();
      }
      this.playCurrentSpotifyTrack();
      return;
    }

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

  // Continue a paused break where it left off (startBreakSoundscape restarts from 0)
  resumeBreak(breakType) {
    this.initContext();
    this.currentMode = breakType;
    this.isPlaying = true;
    const audio = breakType === 'doodle' ? this.doodleAudio : this.meditationAudio;
    audio.volume = this.volumes.master;
    audio.play().catch(err => console.warn("Break audio resume deferred:", err));
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
