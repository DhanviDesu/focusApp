import React, { useState, useEffect } from 'react';
import { Wind, CheckCircle, Clock } from 'lucide-react';

export default function MeditationScreen({ onEndBreak }) {
  const [phase, setPhase] = useState('Inhale'); // Inhale | Hold | Exhale | Rest
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [totalBreakSec, setTotalBreakSec] = useState(0);

  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalBreakSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(totalTimer);
  }, []);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhaseSeconds(prev => {
        if (prev <= 1) {
          // Advance phase
          if (phase === 'Inhale') { setPhase('Hold'); return 4; }
          if (phase === 'Hold') { setPhase('Exhale'); return 4; }
          if (phase === 'Exhale') { setPhase('Rest'); return 4; }
          if (phase === 'Rest') { setPhase('Inhale'); return 4; }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(phaseTimer);
  }, [phase]);

  const getScale = () => {
    if (phase === 'Inhale') return 1.25;
    if (phase === 'Hold') return 1.25;
    if (phase === 'Exhale') return 0.85;
    return 0.85;
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="break-screen-container">
      <div className="break-badge" style={{ background: 'rgba(0, 176, 155, 0.12)', borderColor: 'rgba(0, 176, 155, 0.3)', color: 'var(--accent-emerald)' }}>
        <Wind size={16} />
        <span>Guided Breathing Meditation</span>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={16} />
        <span>Meditation Time: {formatTime(totalBreakSec)}</span>
      </div>

      <div 
        className="breathing-ring"
        style={{ transform: `scale(${getScale()})` }}
      >
        <div className="breathing-phase-text">{phase}</div>
        <div className="breathing-timer-text">{phaseSeconds}s</div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '460px', color: 'var(--text-muted)', fontSize: '15px' }}>
        Follow the ring rhythm. Box Breathing resets nervous system tension and restores clarity.
      </div>

      <button className="btn-primary" onClick={onEndBreak} style={{ background: 'linear-gradient(135deg, #00b09b, #96c93d)', color: '#050b14' }}>
        <CheckCircle size={16} />
        <span>Complete Meditation & Resume Focus</span>
        <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>⌥M / Esc</span>
      </button>
    </div>
  );
}
