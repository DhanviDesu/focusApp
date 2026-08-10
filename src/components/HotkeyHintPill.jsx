import React from 'react';
import { Palette, Wind, Pause } from 'lucide-react';

export default function HotkeyHintPill({ settings, onClick }) {
  const formatKey = (str = '') => {
    return str
      .replace('CommandOrControl', '⌘')
      .replace('Option', '⌥')
      .replace('Shift', '⇧')
      .replace('Control', '⌃');
  };

  const doodleKey = formatKey(settings?.doodleHotkey || 'Option+Space');
  const meditationKey = formatKey(settings?.meditationHotkey || 'Option+M');
  const pauseKey = formatKey(settings?.pauseHotkey || 'Option+P');

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div 
        className="hotkey-pill" 
        onClick={onClick} 
        style={{ cursor: 'pointer' }} 
        title="Global shortcut for iPad Doodle break"
      >
        <Palette size={13} style={{ color: 'var(--accent-amber)' }} />
        <span>Doodle</span>
        <span className="hotkey-badge">{doodleKey}</span>
      </div>

      <div 
        className="hotkey-pill" 
        onClick={onClick} 
        style={{ cursor: 'pointer' }} 
        title="Global shortcut for Guided Meditation break"
      >
        <Wind size={13} style={{ color: 'var(--accent-emerald)' }} />
        <span>Meditate</span>
        <span className="hotkey-badge">{meditationKey}</span>
      </div>

      <div 
        className="hotkey-pill" 
        onClick={onClick} 
        style={{ cursor: 'pointer' }} 
        title="Global shortcut to Pause / Resume audio & timer"
      >
        <Pause size={13} style={{ color: 'var(--accent-cyan)' }} />
        <span>Pause</span>
        <span className="hotkey-badge">{pauseKey}</span>
      </div>
    </div>
  );
}
