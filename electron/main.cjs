const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let hotkeys = {
  doodleHotkey: 'Control+Shift+D',
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

  const handlers = {
    doodleHotkey: () => handleGlobalBreakTrigger('doodle'),
    meditationHotkey: () => handleGlobalBreakTrigger('meditate'),
    pauseHotkey: () => handleGlobalPauseTrigger()
  };

  // true = registered, false = another app already owns this shortcut
  const status = {};
  for (const [key, handler] of Object.entries(handlers)) {
    try {
      status[key] = globalShortcut.register(hotkeys[key], handler);
    } catch (err) {
      status[key] = false;
    }
    console.log(`Registered ${key} (${hotkeys[key]}): ${status[key]}`);
  }

  if (mainWindow) {
    mainWindow.webContents.send('hotkey-status', status);
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

// Only one FlowState at a time: a second launch (e.g. from Spotlight) just focuses the existing window
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
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
