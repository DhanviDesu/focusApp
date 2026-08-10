import React, { useState, useEffect } from 'react';
import { Palette, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

const DOODLE_PROMPTS = [
  {
    title: "Continuous Organic Loops",
    desc: "Without lifting your Apple Pencil, draw smooth overlapping loops across the screen. Fill the enclosed negative spaces with fine parallel lines."
  },
  {
    title: "Zentangle Lattice Patterns",
    desc: "Draw a loose grid, then populate each tile with repeating concentric squares, dots, or spiraling curves to ease mental fatigue."
  },
  {
    title: "Mind Map & Visual Brain Dump",
    desc: "Draw a central circle of your current main problem. Sprout branches into quick visual icons, doodles, and key ideas without judgment."
  },
  {
    title: "Geometric Symmetry & Mandalas",
    desc: "Start with a central dot and radiate outward with repeating petals, triangles, and rhythmic hatch patterns."
  },
  {
    title: "Abstract Contour Shading",
    desc: "Draw 3 large intersecting curved blobs. Use dense cross-hatching to shade from pitch black gradients down to soft stippling."
  }
];

export default function DoodleScreen({ onEndBreak }) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [remainingSec, setRemainingSec] = useState(461);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(461);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isScrubbing) {
        const info = soundEngine.getBreakRemainingTime('doodle');
        if (info && info.durationSec > 0) {
          setRemainingSec(info.remainingSec);
          setDurationSec(info.durationSec);
          setCurrentTimeSec(info.currentTimeSec);
          if (info.remainingSec <= 0) {
            onEndBreak();
          }
        }
      }
    }, 400);

    return () => clearInterval(timer);
  }, [onEndBreak, isScrubbing]);

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTimeSec(newTime);
    soundEngine.seekBreakAudio('doodle', newTime);
  };

  const nextPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % DOODLE_PROMPTS.length);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPrompt = DOODLE_PROMPTS[promptIdx];

  return (
    <div className="break-screen-container">
      <div className="break-badge">
        <Palette size={16} />
        <span>iPad Doodle & Rest Time</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '420px' }}>
        <div style={{ fontSize: '14px', color: '#a5f3fc', display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: '600' }}>
          <span>Elapsed: {formatTime(currentTimeSec)}</span>
          <span>Remaining: {formatTime(remainingSec)}</span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max={durationSec || 461} 
          value={currentTimeSec} 
          onMouseDown={() => setIsScrubbing(true)}
          onMouseUp={() => setIsScrubbing(false)}
          onChange={handleSeek}
          style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
          title="Drag slider to skip to any point in the doodling session"
        />
      </div>

      <div className="doodle-prompt-card">
        <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-amber)', marginBottom: '8px', fontWeight: '700' }}>
          iPad Prompt #{promptIdx + 1}
        </div>
        <h2 className="doodle-prompt-title">{currentPrompt.title}</h2>
        <p className="doodle-prompt-desc">{currentPrompt.desc}</p>

        <div className="doodle-prompt-actions">
          <button className="btn-secondary" onClick={nextPrompt}>
            <RefreshCw size={16} />
            <span>New Prompt Idea</span>
          </button>

          <button className="btn-primary" onClick={onEndBreak}>
            <CheckCircle size={16} />
            <span>Finished Doodling — Return to Flow</span>
            <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>⌥Space / Esc</span>
          </button>
        </div>
      </div>

      <div style={{ color: 'var(--text-dim)', fontSize: '13px', textAlign: 'center' }}>
        Drag the slider anytime to skip forward or backward in your doodling session.
      </div>
    </div>
  );
}
