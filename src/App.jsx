import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import FocusView from './components/FocusView';
import DoodleScreen from './components/DoodleScreen';
import MeditationScreen from './components/MeditationScreen';
import SettingsModal from './components/SettingsModal';
import StatsModal from './components/StatsModal';
import GoalModal from './components/GoalModal';
import { soundEngine } from './audio/SoundEngine';
import { getSettings, saveSettings, logSession, todayKey, getDay, saveDay, dayTotalSeconds } from './utils/storage';

export default function App() {
  const [mode, setMode] = useState('focus'); // 'focus' | 'doodle' | 'meditate'
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [settings, setSettings] = useState(getSettings());

  const [showMixer, setShowMixer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hotkeyStatus, setHotkeyStatus] = useState({});

  // --- Daily goal & sessions ---
  // Refs hold the source of truth so interval/event callbacks never see stale state;
  // `day` state mirrors dayRef for rendering.
  const dayKeyRef = useRef(todayKey());
  const dayRef = useRef(null);
  if (dayRef.current === null) {
    // Sessions left open by a previous run (app quit mid-session) are closed on launch
    const loaded = getDay(dayKeyRef.current);
    dayRef.current = {
      ...loaded,
      sessions: loaded.sessions.map(s => s.endedAt ? s : { ...s, endedAt: Date.now() })
    };
  }
  const activeIdRef = useRef(null);
  const [day, setDay] = useState(dayRef.current);
  const [activeId, setActiveId] = useState(null);
  const [showGoal, setShowGoal] = useState(dayRef.current.goalSeconds == null);

  const commitDay = (data) => {
    dayRef.current = data;
    saveDay(dayKeyRef.current, data);
    setDay(data);
  };

  const setActive = (id) => {
    activeIdRef.current = id;
    setActiveId(id);
  };

  const startSession = (name = '') => {
    const d = dayRef.current;
    const session = {
      id: Date.now(),
      name: name.trim() || `Session ${d.sessions.length + 1}`,
      startedAt: Date.now(),
      endedAt: null,
      focusSeconds: 0
    };
    commitDay({ ...d, sessions: [...d.sessions, session] });
    setActive(session.id);
  };

  const closeActiveSession = (data) => ({
    ...data,
    sessions: data.sessions.map(s => s.id === activeIdRef.current ? { ...s, endedAt: Date.now() } : s)
  });

  // New calendar day: close the running session in yesterday's log and continue it
  // in today's, so each day only gets the minutes actually worked in it
  const checkRollover = () => {
    const key = todayKey();
    if (key === dayKeyRef.current) return;

    const old = dayRef.current;
    const active = old.sessions.find(s => s.id === activeIdRef.current);
    saveDay(dayKeyRef.current, closeActiveSession(old));

    dayKeyRef.current = key;
    let fresh = getDay(key);
    if (active) {
      const continued = { ...active, id: Date.now(), startedAt: Date.now(), endedAt: null, focusSeconds: 0 };
      fresh = { ...fresh, sessions: [...fresh.sessions, continued] };
      setActive(continued.id);
    }
    commitDay(fresh);
    if (fresh.goalSeconds == null) setShowGoal(true);
  };

  // Called once per second while focusing
  const tickFocus = () => {
    checkRollover();
    if (!activeIdRef.current) startSession();

    const d = dayRef.current;
    const before = dayTotalSeconds(d);
    commitDay({
      ...d,
      sessions: d.sessions.map(s => s.id === activeIdRef.current ? { ...s, focusSeconds: s.focusSeconds + 1 } : s)
    });

    if (d.goalSeconds && before < d.goalSeconds && before + 1 >= d.goalSeconds) {
      soundEngine.playBreakChime();
    }
  };

  // Catch midnight even when the app sits idle overnight
  useEffect(() => {
    const interval = setInterval(checkRollover, 60 * 1000);
    window.addEventListener('focus', checkRollover);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkRollover);
    };
  }, []);

  const handleSaveGoal = (goalSeconds) => {
    commitDay({ ...dayRef.current, goalSeconds });
    setShowGoal(false);
  };

  // Electron starts with built-in defaults; push the saved shortcuts on launch
  // and track which ones failed to register (taken by another app)
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onHotkeyStatus?.(setHotkeyStatus);
    window.electronAPI.updateHotkeys?.({
      doodleHotkey: settings.doodleHotkey,
      meditationHotkey: settings.meditationHotkey,
      pauseHotkey: settings.pauseHotkey
    });
    return cleanup;
  }, []);

  // AirPods / media keys: route play & pause through the app's own toggle
  // so the timer and UI stay in sync (and binaural mode can be paused too)
  const setPlaybackRef = useRef(null);
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => setPlaybackRef.current(true));
    navigator.mediaSession.setActionHandler('pause', () => setPlaybackRef.current(false));
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Auto-return to focus mode when break audio completes
  useEffect(() => {
    soundEngine.onBreakEnded = (breakType) => {
      handleEndBreak();
    };
  }, []);

  // Focus Timer
  useEffect(() => {
    let timer = null;
    if (mode === 'focus' && isPlaying) {
      timer = setInterval(() => {
        setFocusSeconds(prev => prev + 1);
        tickFocus();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, isPlaying]);

  // Global IPC listeners (Electron) & In-App Keyboard Shortcuts
  useEffect(() => {
    // 1. Electron Global Break Trigger
    const handleGlobalBreak = (data) => {
      const type = data?.breakType || 'doodle';
      if (mode === 'doodle' || mode === 'meditate') {
        // If already in a break, pressing global break shortcut exits break and resumes focus!
        handleEndBreak();
      } else {
        triggerBreak(type);
      }
    };

    // 2. Electron Global Pause Trigger
    const handleGlobalPause = () => {
      toggleAudio();
    };

    let cleanupBreak = null;
    let cleanupPause = null;

    if (window.electronAPI) {
      if (window.electronAPI.onGlobalBreakTrigger) {
        cleanupBreak = window.electronAPI.onGlobalBreakTrigger(handleGlobalBreak);
      }
      if (window.electronAPI.onGlobalTogglePause) {
        cleanupPause = window.electronAPI.onGlobalTogglePause(handleGlobalPause);
      }
    }

    // In-app hotkey listener when app is focused
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      if (mode === 'doodle' || mode === 'meditate') {
        if (
          e.key === 'Escape' || 
          e.key === 'Enter' || 
          e.key === 'b' || 
          e.key === 'B' || 
          e.key === 'm' || 
          e.key === 'M' || 
          e.code === 'Space'
        ) {
          e.preventDefault();
          handleEndBreak();
        }
      } else if (mode === 'focus') {
        if (e.key === 'b' || e.key === 'B' || e.code === 'Space') {
          e.preventDefault();
          triggerBreak('doodle');
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          triggerBreak('meditate');
        }
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (cleanupBreak) cleanupBreak();
      if (cleanupPause) cleanupPause();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, focusSeconds, settings, isPlaying]);

  const toggleAudio = () => {
    if (isPlaying) {
      soundEngine.stopAll();
      setIsPlaying(false);
    } else {
      if (mode === 'focus') {
        soundEngine.startFocusSoundscape();
      } else {
        soundEngine.resumeBreak(mode);
      }
      setIsPlaying(true);
    }
  };

  setPlaybackRef.current = (play) => {
    if (play !== isPlaying) toggleAudio();
  };

  const triggerBreak = (breakType = 'doodle') => {
    if (settings.autoChime !== false) {
      soundEngine.playBreakChime();
    }

    logSession(focusSeconds, breakType);

    setTimeout(() => {
      soundEngine.startBreakSoundscape(breakType);
      setIsPlaying(true);
    }, 500);

    setMode(breakType);

    if (window.electronAPI && window.electronAPI.bringToFront) {
      window.electronAPI.bringToFront();
    }
  };

  const handleEndBreak = () => {
    if (settings.autoChime !== false) {
      soundEngine.playBreakChime();
    }

    setTimeout(() => {
      soundEngine.startFocusSoundscape();
      setIsPlaying(true);
    }, 400);

    setFocusSeconds(0);
    setMode('focus');
  };

  const handleStartSession = (name) => {
    startSession(name);
    if (!isPlaying) toggleAudio();
  };

  const handleEndSession = () => {
    commitDay(closeActiveSession(dayRef.current));
    setActive(null);
    if (isPlaying) toggleAudio();
    setFocusSeconds(0);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <>
      <div className="ambient-bg">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <Header 
        isPlaying={isPlaying}
        onToggleAudio={toggleAudio}
        onOpenMixer={() => setShowSettings(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenSettings={() => setShowSettings(true)}
        settings={settings}
        hotkeyStatus={hotkeyStatus}
      />

      <main className="main-viewport">
        {mode === 'focus' && (
          <FocusView 
            focusSeconds={focusSeconds}
            isPlaying={isPlaying}
            onStartBreak={triggerBreak}
            onToggleAudio={toggleAudio}
            day={day}
            activeSession={day.sessions.find(s => s.id === activeId) || null}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            onEditGoal={() => setShowGoal(true)}
          />
        )}

        {mode === 'doodle' && (
          <DoodleScreen onEndBreak={handleEndBreak} />
        )}

        {mode === 'meditate' && (
          <MeditationScreen onEndBreak={handleEndBreak} />
        )}
      </main>

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showGoal && (
        <GoalModal
          goalSeconds={day.goalSeconds}
          onSave={handleSaveGoal}
          onClose={() => setShowGoal(false)}
        />
      )}

      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}
    </>
  );
}
