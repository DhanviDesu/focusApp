// Storage utility for FlowState preferences and session history

const KEYS = {
  SETTINGS: 'flowstate_settings',
  STATS: 'flowstate_stats'
};

const DEFAULT_SETTINGS = {
  doodleHotkey: 'Option+Space',
  meditationHotkey: 'Option+M',
  pauseHotkey: 'Option+P',
  autoChime: true,
  autoBringToFront: true,
  binauralFreq: 10, // 10Hz Alpha
  volumes: {
    master: 0.8,
    binaural: 0.6,
    noise: 0.4,
    synth: 0.5
  }
};

const DEFAULT_STATS = {
  totalFocusSeconds: 0,
  sessionsCompleted: 0,
  breaksTaken: 0,
  history: []
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

export function getStats() {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : DEFAULT_STATS;
  } catch (e) {
    return DEFAULT_STATS;
  }
}

export function logSession(focusSeconds, breakType) {
  const stats = getStats();
  stats.totalFocusSeconds += focusSeconds;
  stats.breaksTaken += 1;
  stats.history.unshift({
    timestamp: new Date().toISOString(),
    focusSeconds,
    breakType
  });
  if (stats.history.length > 50) stats.history.pop();
  try {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch (e) {}
}
