import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FocusView from './components/FocusView';
import DoodleScreen from './components/DoodleScreen';
import MeditationScreen from './components/MeditationScreen';
import SettingsModal from './components/SettingsModal';
import StatsModal from './components/StatsModal';
import { soundEngine } from './audio/SoundEngine';
import { getSettings, saveSettings, logSession } from './utils/storage';

export default function App() {
  const [mode, setMode] = useState('focus'); // 'focus' | 'doodle' | 'meditate'
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [settings, setSettings] = useState(getSettings());

  const [showMixer, setShowMixer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Focus Timer
  useEffect(() => {
    let timer = null;
    if (mode === 'focus' && isPlaying) {
      timer = setInterval(() => {
        setFocusSeconds(prev => prev + 1);
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
        soundEngine.startBreakSoundscape();
      }
      setIsPlaying(true);
    }
  };

  const triggerBreak = (breakType = 'doodle') => {
    if (settings.autoChime !== false) {
      soundEngine.playBreakChime();
    }

    logSession(focusSeconds, breakType);

    setTimeout(() => {
      soundEngine.startBreakSoundscape();
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
      />

      <main className="main-viewport">
        {mode === 'focus' && (
          <FocusView 
            focusSeconds={focusSeconds}
            isPlaying={isPlaying}
            onStartBreak={triggerBreak}
            onToggleAudio={toggleAudio}
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

      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}
    </>
  );
}
