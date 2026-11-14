const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onGlobalBreakTrigger: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('trigger-global-break', subscription);
    return () => ipcRenderer.removeListener('trigger-global-break', subscription);
  },
  onGlobalTogglePause: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('trigger-global-pause', subscription);
    return () => ipcRenderer.removeListener('trigger-global-pause', subscription);
  },
  onHotkeyUpdated: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('hotkey-updated', subscription);
    return () => ipcRenderer.removeListener('hotkey-updated', subscription);
  },
  onHotkeyStatus: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('hotkey-status', subscription);
    return () => ipcRenderer.removeListener('hotkey-status', subscription);
  },
  updateHotkeys: (hotkeys) => ipcRenderer.send('update-global-hotkeys', hotkeys),
  bringToFront: () => ipcRenderer.send('bring-to-front'),
  isElectron: true
});
