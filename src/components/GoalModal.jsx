import React, { useState } from 'react';
import { X, Target } from 'lucide-react';

const QUICK_PICKS = [2, 4, 6];

export default function GoalModal({ goalSeconds, onSave, onClose }) {
  const [customHours, setCustomHours] = useState(goalSeconds ? String(goalSeconds / 3600) : '');

  const saveHours = (hours) => {
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    onSave(Math.round(h * 3600));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={22} className="accent-icon" />
            <h2 className="modal-title">How long today?</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          {QUICK_PICKS.map(h => (
            <button
              key={h}
              className={`preset-chip ${goalSeconds === h * 3600 ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => saveHours(h)}
            >
              {h}h
            </button>
          ))}
        </div>

        <form
          onSubmit={e => { e.preventDefault(); saveHours(customHours); }}
          style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <input
            type="number"
            min="0.25"
            step="0.25"
            placeholder="Custom hours (e.g. 3.5)"
            value={customHours}
            onChange={e => setCustomHours(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '13px' }}
          />
          <button type="submit" className="btn-primary">Set goal</button>
        </form>
      </div>
    </div>
  );
}
