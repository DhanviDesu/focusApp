import React, { useState, useEffect } from 'react';
import { Coffee, Wind, Sparkles, Disc, Music, Shuffle, SkipForward, Target, Square, Play } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { dayTotalSeconds, formatHM } from '../utils/storage';

export default function FocusView({ 
  focusSeconds, 
  isPlaying, 
  onStartBreak, 
  onToggleAudio,
  day,
  activeSession,
  onStartSession,
  onEndSession,
  onEditGoal
}) {
  const [sessionName, setSessionName] = useState('');
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

      {/* Daily goal countdown — click to edit */}
      {(() => {
        const done = dayTotalSeconds(day);
        const goal = day.goalSeconds;
        const remaining = goal ? goal - done : 0;
        return (
          <button
            onClick={onEditGoal}
            title="Edit today's goal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', textAlign: 'center', padding: 0 }}
          >
            {!goal ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '15px', fontWeight: '600' }}>
                <Target size={16} /> Set today's goal
              </span>
            ) : remaining > 0 ? (
              <>
                <div style={{ fontSize: '26px', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(remaining)} left
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {formatHM(done)} of {formatHM(goal)} goal today
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                  Goal reached ✓ {-remaining >= 60 ? `+${formatHM(-remaining)} over` : ''}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {formatHM(done)} of {formatHM(goal)} goal today
                </div>
              </>
            )}
          </button>
        );
      })()}

      {/* Session controls */}
      {activeSession ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
          <span style={{ fontWeight: '600' }}>{activeSession.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>{formatHM(activeSession.focusSeconds)}</span>
          <button className="btn-secondary" onClick={onEndSession} style={{ padding: '6px 12px' }}>
            <Square size={14} />
            <span>End session</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={e => { e.preventDefault(); onStartSession(sessionName); setSessionName(''); }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <input
            type="text"
            placeholder="What are you working on? (optional)"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            style={{ width: '280px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '13px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
            <Play size={14} />
            <span>Start session</span>
          </button>
        </form>
      )}

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
