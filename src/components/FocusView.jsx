import React, { useState } from 'react';
import { Coffee, Wind, Sparkles, Disc } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export default function FocusView({ 
  focusSeconds, 
  isPlaying, 
  onStartBreak, 
  onToggleAudio 
}) {
  const [selectedPreset, setSelectedPreset] = useState('focus_section_1.m4a');

  const presets = [
    { id: 'focus_section_1.m4a', name: '🎵 Focus Section 1', desc: 'Focus Block 1' },
    { id: 'focus_section_2.m4a', name: '🎵 Focus Section 2', desc: 'Focus Block 2' },
    { id: 'focus_section_3.m4a', name: '🎵 Focus Section 3', desc: 'Focus Block 3' },
    { id: 'binaural', name: '✨ Alpha 10Hz Binaural', desc: 'Binaural flow wave synth' }
  ];

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    soundEngine.setFocusTrack(p.id);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;

    if (hrs > 0) {
      return `${hrs}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="focus-container">
      <div className="flow-timer-ring">
        <div className="flow-timer-display">{formatTime(focusSeconds)}</div>
        <div className="flow-timer-label">Indefinite Flow State</div>
      </div>

      <div style={{ maxWidth: '520px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
        Focus music playing on an indefinite loop without speech interruptions. Press your shortcut when you need a break.
      </div>

      <div className="soundscape-selector">
        {presets.map(p => (
          <button
            key={p.id}
            className={`preset-chip ${selectedPreset === p.id ? 'active' : ''}`}
            onClick={() => handleSelectPreset(p)}
          >
            {p.id.startsWith('focus') ? (
              <Disc size={14} style={{ display: 'inline', marginRight: '6px' }} />
            ) : (
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
            )}
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <button className="btn-primary" onClick={() => onStartBreak('doodle')}>
          <Coffee size={18} />
          <span>Doodle & Rest Break</span>
        </button>

        <button className="btn-secondary" onClick={() => onStartBreak('meditate')}>
          <Wind size={18} />
          <span>Guided Meditation</span>
        </button>
      </div>
    </div>
  );
}
