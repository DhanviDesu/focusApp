// Storage utility for FlowState preferences and session history

const KEYS = {
  SETTINGS: 'flowstate_settings',
  STATS: 'flowstate_stats'
};

const DEFAULT_SETTINGS = {
  doodleHotkey: 'Control+Shift+D',
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

// Daily goal + sessions, keyed by local date: { 'YYYY-MM-DD': { goalSeconds, sessions: [...] } }
const DAYS_KEY = 'flowstate_days';

export function todayKey(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getAllDays() {
  try {
    return JSON.parse(localStorage.getItem(DAYS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

export function getDay(key) {
  return getAllDays()[key] || { goalSeconds: null, sessions: [] };
}

export function saveDay(key, data) {
  const all = getAllDays();
  all[key] = data;
  try {
    localStorage.setItem(DAYS_KEY, JSON.stringify(all));
  } catch (e) {}
}

export function dayTotalSeconds(day) {
  return day.sessions.reduce((sum, s) => sum + s.focusSeconds, 0);
}

// 4h, 1h 46m, 12m
export function formatHM(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
