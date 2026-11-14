import React, { useState } from 'react';
import { X, Sliders, Keyboard, Bell, Volume2, Palette, Wind, Pause } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export default function SettingsModal({ 
  settings, 
  onSaveSettings, 
  onClose 
}) {
  const [doodleHotkey, setDoodleHotkey] = useState(settings.doodleHotkey || 'Control+Shift+D');
  const [meditationHotkey, setMeditationHotkey] = useState(settings.meditationHotkey || 'Option+M');
  const [pauseHotkey, setPauseHotkey] = useState(settings.pauseHotkey || 'Option+P');

  const [autoChime, setAutoChime] = useState(settings.autoChime !== false);
  const [volumes, setVolumes] = useState({
    master: soundEngine.volumes.master,
    binaural: soundEngine.volumes.binaural,
    noise: soundEngine.volumes.noise,
    synth: soundEngine.volumes.synth
  });

  const handleVolumeChange = (layer, val) => {
    const num = parseFloat(val);
    setVolumes(prev => ({ ...prev, [layer]: num }));
    soundEngine.setVolume(layer, num);
  };

  const handleSave = () => {
    const newSettings = {
      ...settings,
      doodleHotkey,
      meditationHotkey,
      pauseHotkey,
      autoChime,
      volumes
    };
    onSaveSettings(newSettings);

    if (window.electronAPI && window.electronAPI.updateHotkeys) {
      window.electronAPI.updateHotkeys({
        doodleHotkey,
        meditationHotkey,
        pauseHotkey
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={22} className="accent-icon" />
            <h2 className="modal-title">App & Audio Settings</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="audio-slider-group">
          <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={16} /> Global System-Wide Shortcuts
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            {/* Doodle Hotkey */}
            <div>
              <label style={{ fontSize: '13px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: '600' }}>
                <Palette size={14} /> iPad Doodle Break Shortcut
              </label>
              <select 
                value={doodleHotkey} 
                onChange={e => setDoodleHotkey(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '13px' }}
              >
                <option value="Option+Space">Option + Space (⌥ Space)</option>
                <option value="CommandOrControl+Shift+B">Cmd + Shift + B (⌘⇧B)</option>
                <option value="CommandOrControl+Option+B">Cmd + Option + B (⌘⌥B)</option>
                <option value="Control+Shift+D">Ctrl + Shift + D</option>
              </select>
            </div>

            {/* Meditation Hotkey */}
            <div>
              <label style={{ fontSize: '13px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: '600' }}>
                <Wind size={14} /> Guided Meditation Break Shortcut
              </label>
              <select 
                value={meditationHotkey} 
                onChange={e => setMeditationHotkey(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '13px' }}
              >
                <option value="Option+M">Option + M (⌥ M)</option>
                <option value="CommandOrControl+Shift+M">Cmd + Shift + M (⌘⇧M)</option>
                <option value="CommandOrControl+Option+M">Cmd + Option + M (⌘⌥M)</option>
                <option value="Control+Shift+M">Ctrl + Shift + M</option>
              </select>
            </div>

            {/* Pause / Play Hotkey */}
            <div>
              <label style={{ fontSize: '13px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: '600' }}>
                <Pause size={14} /> Pause / Play Toggle Shortcut
              </label>
              <select 
                value={pauseHotkey} 
                onChange={e => setPauseHotkey(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '13px' }}
              >
                <option value="Option+P">Option + P (⌥ P)</option>
                <option value="CommandOrControl+Shift+P">Cmd + Shift + P (⌘⇧P)</option>
                <option value="CommandOrControl+Option+P">Cmd + Option + P (⌘⌥P)</option>
                <option value="Control+Shift+P">Ctrl + Shift + P</option>
              </select>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '12px 0' }} />

          <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={16} /> Soundscape Layer Mixer
          </div>

          <div className="slider-row">
            <div className="slider-label-row">
              <span>Master Volume</span>
              <span>{Math.round(volumes.master * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={volumes.master} 
              onChange={e => handleVolumeChange('master', e.target.value)} 
            />
          </div>

          <div className="slider-row">
            <div className="slider-label-row">
              <span>Binaural Beats (Alpha / Gamma)</span>
              <span>{Math.round(volumes.binaural * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={volumes.binaural} 
              onChange={e => handleVolumeChange('binaural', e.target.value)} 
            />
          </div>

          <div className="slider-row">
            <div className="slider-label-row">
              <span>Deep Focus Brown Noise</span>
              <span>{Math.round(volumes.noise * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={volumes.noise} 
              onChange={e => handleVolumeChange('noise', e.target.value)} 
            />
          </div>

          <div className="slider-row">
            <div className="slider-label-row">
              <span>Warm Ambient Synth Drone</span>
              <span>{Math.round(volumes.synth * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={volumes.synth} 
              onChange={e => handleVolumeChange('synth', e.target.value)} 
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '12px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-main)' }}>
              <Bell size={16} /> Play Audio Chime on Global Break
            </div>
            <input 
              type="checkbox" 
              checked={autoChime} 
              onChange={e => setAutoChime(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
