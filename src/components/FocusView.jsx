import React, { useState, useEffect } from 'react';
import { Coffee, Wind, Compass, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export default function FocusView({ 
  focusSeconds, 
  isPlaying, 
  onStartBreak, 
  onToggleAudio 
}) {
  const [selectedPreset, setSelectedPreset] = useState('alpha');

  const presets = [
    { id: 'alpha', name: 'Alpha 10Hz Focus', freq: 10, desc: 'Binaural flow state wave' },
    { id: 'gamma', name: 'Gamma 40Hz Cognition', freq: 40, desc: 'High cognitive intensity' },
    { id: 'theta', name: 'Theta 6Hz Deep Creative', freq: 6, desc: 'Relaxed problem solving' }
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    soundEngine.setBinauralFreq(preset.freq);
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

      <div style={{ maxWidth: '440px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
        No voice interruptions or timed cut-offs. Focus for as long as you are in flow. Press your global shortcut whenever you need a break.
      </div>

      <div className="soundscape-selector">
        {presets.map(p => (
          <button
            key={p.id}
            className={`preset-chip ${selectedPreset === p.id ? 'active' : ''}`}
            onClick={() => handleSelectPreset(p)}
          >
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
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
