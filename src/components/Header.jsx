import React from 'react';
import { Waves, Sliders, BarChart2, Settings, Play, Pause } from 'lucide-react';
import HotkeyHintPill from './HotkeyHintPill';

export default function Header({ 
  isPlaying, 
  onToggleAudio, 
  onOpenMixer, 
  onOpenStats, 
  onOpenSettings, 
  settings 
}) {
  return (
    <header className="app-header">
      <div className="app-title-group">
        <div className="app-logo">
          <Waves size={20} />
        </div>
        <span className="app-name">FlowState</span>
      </div>

      <HotkeyHintPill settings={settings} onClick={onOpenSettings} />

      <div className="header-actions">
        <button 
          className="btn-icon" 
          onClick={onToggleAudio}
          title={isPlaying ? "Pause Focus Audio" : "Play Focus Audio"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button 
          className="btn-icon" 
          onClick={onOpenMixer} 
          title="Audio Soundscape Mixer"
        >
          <Sliders size={18} />
        </button>

        <button 
          className="btn-icon" 
          onClick={onOpenStats} 
          title="Session Analytics"
        >
          <BarChart2 size={18} />
        </button>

        <button 
          className="btn-icon" 
          onClick={onOpenSettings} 
          title="Settings & Global Hotkey"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
