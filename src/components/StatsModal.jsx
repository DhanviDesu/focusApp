import React from 'react';
import { X, BarChart2, Flame, Coffee, Clock } from 'lucide-react';
import { getStats, getDay, todayKey, dayTotalSeconds, formatHM } from '../utils/storage';

export default function StatsModal({ onClose }) {
  const stats = getStats();
  const today = getDay(todayKey());
  const todayTotal = dayTotalSeconds(today);

  const formatTotalTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} minutes`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={22} className="accent-icon" />
            <h2 className="modal-title">Session Flow Analytics</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <Clock size={24} style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
              {formatTotalTime(stats.totalFocusSeconds)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total Deep Flow Time
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <Coffee size={24} style={{ color: 'var(--accent-amber)', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
              {stats.breaksTaken}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Mindful Breaks Taken
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Today's Sessions</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
            {formatHM(todayTotal)}{today.goalSeconds ? ` / ${formatHM(today.goalSeconds)} goal` : ''}
          </span>
        </h3>

        {today.goalSeconds ? (
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (todayTotal / today.goalSeconds) * 100)}%`, background: 'var(--accent-emerald)' }} />
          </div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {today.sessions.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
              No sessions yet today.
            </div>
          ) : (
            today.sessions.map(s => (
              <div
                key={s.id}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', fontSize: '13px' }}
              >
                <span>
                  {s.name}{' '}
                  <span style={{ color: 'var(--text-dim)' }}>
                    {new Date(s.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {s.endedAt ? '' : ' · in progress'}
                  </span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {formatHM(s.focusSeconds)}
                  {today.goalSeconds ? ` · ${Math.round((s.focusSeconds / today.goalSeconds) * 100)}% of goal` : ''}
                </span>
              </div>
            ))
          )}
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>
          Recent Break History
        </h3>

        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stats.history.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No break sessions logged yet. Start focus mode and hit your break shortcut!
            </div>
          ) : (
            stats.history.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '13px'
                }}
              >
                <span>{item.breakType === 'doodle' ? '🎨 iPad Doodle Break' : '🧘 Guided Meditation'}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {Math.round(item.focusSeconds / 60)} min flow
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
