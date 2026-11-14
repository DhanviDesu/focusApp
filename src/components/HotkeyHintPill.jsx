import React from 'react';
import { Palette, Wind, Pause } from 'lucide-react';

export default function HotkeyHintPill({ settings, hotkeyStatus = {}, onClick }) {
  // Shortcut couldn't register — another app already owns it
  const taken = (key) => hotkeyStatus[key] === false;
  const takenStyle = { textDecoration: 'line-through', color: '#f87171' };
  const takenTitle = ' — NOT WORKING: another app is using this shortcut. Pick a different one in Settings.';

  const formatKey = (str = '') => {
    return str
      .replace('CommandOrControl', '⌘')
      .replace('Option', '⌥')
      .replace('Shift', '⇧')
      .replace('Control', '⌃');
  };

  const doodleKey = formatKey(settings?.doodleHotkey || 'Control+Shift+D');
  const meditationKey = formatKey(settings?.meditationHotkey || 'Option+M');
  const pauseKey = formatKey(settings?.pauseHotkey || 'Option+P');

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div 
        className="hotkey-pill" 
        onClick={onClick} 
        style={{ cursor: 'pointer' }} 
        title={'Global shortcut for iPad Doodle break' + (taken('doodleHotkey') ? takenTitle : '')}
      >
        <Palette size={13} style={{ color: 'var(--accent-amber)' }} />
        <span>Doodle</span>
        <span className="hotkey-badge" style={taken('doodleHotkey') ? takenStyle : undefined}>{doodleKey}</span>
      </div>

      <div 
        className="hotkey-pill" 
        onClick={onClick} 
        style={{ cursor: 'pointer' }} 
        title={'Global shortcut for Guided Meditation break' + (taken('meditationHotkey') ? takenTitle : '')}
      >
        <Wind size={13} style={{ color: 'var(--accent-emerald)' }} />
        <span>Meditate</span>
        <span className="hotkey-badge" style={taken('meditationHotkey') ? takenStyle : undefined}>{meditationKey}</span>
      </div>

      <div 
        className="hotkey-pill" 
        onClick={onClick} 
        style={{ cursor: 'pointer' }} 
        title={'Global shortcut to Pause / Resume audio & timer' + (taken('pauseHotkey') ? takenTitle : '')}
      >
        <Pause size={13} style={{ color: 'var(--accent-cyan)' }} />
        <span>Pause</span>
        <span className="hotkey-badge" style={taken('pauseHotkey') ? takenStyle : undefined}>{pauseKey}</span>
      </div>
    </div>
  );
}
