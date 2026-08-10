const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let hotkeys = {
  doodleHotkey: 'Option+Space',
  meditationHotkey: 'Option+M',
  pauseHotkey: 'Option+P'
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#090a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  const startUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(startUrl);
  } else {
    const distPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(distPath).catch(() => {
      mainWindow.loadURL(startUrl);
    });
  }

  registerGlobalHotkeys();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerGlobalHotkeys() {
  globalShortcut.unregisterAll();

  // 1. Doodle Break Hotkey
  try {
    const regDoodle = globalShortcut.register(hotkeys.doodleHotkey, () => {
      handleGlobalBreakTrigger('doodle');
    });
    console.log(`Registered Doodle hotkey (${hotkeys.doodleHotkey}): ${regDoodle}`);
  } catch (err) {
    console.error('Failed to register Doodle hotkey:', err);
  }

  // 2. Meditation Break Hotkey
  try {
    const regMeditation = globalShortcut.register(hotkeys.meditationHotkey, () => {
      handleGlobalBreakTrigger('meditate');
    });
    console.log(`Registered Meditation hotkey (${hotkeys.meditationHotkey}): ${regMeditation}`);
  } catch (err) {
    console.error('Failed to register Meditation hotkey:', err);
  }

  // 3. Pause / Play Toggle Hotkey
  try {
    const regPause = globalShortcut.register(hotkeys.pauseHotkey, () => {
      handleGlobalPauseTrigger();
    });
    console.log(`Registered Pause hotkey (${hotkeys.pauseHotkey}): ${regPause}`);
  } catch (err) {
    console.error('Failed to register Pause hotkey:', err);
  }
}

function handleGlobalBreakTrigger(breakType) {
  if (!mainWindow) return;

  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();

  mainWindow.setAlwaysOnTop(true);
  setTimeout(() => {
    if (mainWindow) mainWindow.setAlwaysOnTop(false);
  }, 1000);

  mainWindow.webContents.send('trigger-global-break', { breakType, timestamp: Date.now() });
}

function handleGlobalPauseTrigger() {
  if (!mainWindow) return;
  mainWindow.webContents.send('trigger-global-pause', { timestamp: Date.now() });
}

ipcMain.on('update-global-hotkeys', (_event, newHotkeys) => {
  if (newHotkeys && typeof newHotkeys === 'object') {
    hotkeys = { ...hotkeys, ...newHotkeys };
    registerGlobalHotkeys();
    if (mainWindow) {
      mainWindow.webContents.send('hotkey-updated', { hotkeys });
    }
  }
});

ipcMain.on('bring-to-front', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
