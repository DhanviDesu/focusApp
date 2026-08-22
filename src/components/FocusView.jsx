import React, { useState, useEffect } from 'react';
import { Coffee, Wind, Sparkles, Disc, Music, Shuffle, SkipForward } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export default function FocusView({ 
  focusSeconds, 
  isPlaying, 
  onStartBreak, 
  onToggleAudio 
}) {
  const [selectedPreset, setSelectedPreset] = useState('focus_section_1.m4a');
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '' });

  useEffect(() => {
    soundEngine.onTrackChange = (info) => {
      setTrackInfo(info);
    };
  }, []);

  const presets = [
    { id: 'focus_section_1.m4a', name: '🎵 Focus Section 1', desc: 'Focus Block 1' },
    { id: 'focus_section_2.m4a', name: '🎵 Focus Section 2', desc: 'Focus Block 2' },
    { id: 'focus_section_3.m4a', name: '🎵 Focus Section 3', desc: 'Focus Block 3' },
    { id: 'spotify_shuffle', name: '🔀 Spotify Shuffle (30 Songs)', desc: 'Random shuffle of your 30-track focus playlist' },
    { id: 'binaural', name: '✨ Alpha 10Hz Binaural', desc: 'Binaural flow wave synth' }
  ];

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    soundEngine.setFocusTrack(p.id);
  };

  const handleSkipTrack = () => {
    soundEngine.playNextSpotifyTrack();
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
            {p.id === 'spotify_shuffle' ? (
              <Shuffle size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-emerald)' }} />
            ) : p.id.startsWith('focus') ? (
              <Disc size={14} style={{ display: 'inline', marginRight: '6px' }} />
            ) : (
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
            )}
            {p.name}
          </button>
        ))}
      </div>

      {selectedPreset === 'spotify_shuffle' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          background: 'rgba(0, 176, 155, 0.1)', 
          border: '1px solid rgba(0, 176, 155, 0.25)', 
          padding: '8px 16px', 
          borderRadius: '20px',
          color: 'var(--accent-emerald)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <Music size={15} />
          <span>
            Now Playing: {trackInfo.title ? `${trackInfo.title} — ${trackInfo.artist}` : 'Loading Track...'}
          </span>
          <button 
            onClick={handleSkipTrack} 
            title="Skip to next shuffled track"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-emerald)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '2px 4px' 
            }}
          >
            <SkipForward size={16} />
          </button>
        </div>
      )}

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
