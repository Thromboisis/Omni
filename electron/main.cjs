const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'OmniLaunch',
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.APP_URL;
  const distIndexPath = path.join(__dirname, '../dist/index.html');

  if (process.env.NODE_ENV === 'development' && devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (fs.existsSync(distIndexPath)) {
    mainWindow.loadFile(distIndexPath);
  } else {
    // Fallback to local dev server port
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      mainWindow.loadFile(distIndexPath);
    });
  }

  // Intercept external links and open in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler 1: Direct Native Game Launching
ipcMain.handle('launch-game', async (_event, gameConfig) => {
  const { executablePath, launchArgs, workingDir, protocolUri, store, storeAppId } = gameConfig;

  // 1. If it's a store protocol or no executable path given, launch through OS protocol handler
  if (protocolUri && (!executablePath || store !== 'standalone')) {
    try {
      await shell.openExternal(protocolUri);
      return { success: true, method: 'protocol_invoked' };
    } catch (err) {
      console.warn('Protocol launch failed, falling back:', err);
    }
  }

  // 2. Direct native process execution for standalone games / executables
  if (executablePath) {
    try {
      const isWin = process.platform === 'win32';
      const isMac = process.platform === 'darwin';

      const argsList = launchArgs ? launchArgs.split(' ').filter(Boolean) : [];
      const cwd = workingDir && fs.existsSync(workingDir)
        ? workingDir
        : path.dirname(executablePath);

      if (isWin) {
        // Windows spawn detached
        const child = spawn(executablePath, argsList, {
          cwd,
          detached: true,
          stdio: 'ignore',
          shell: executablePath.endsWith('.bat') || executablePath.endsWith('.cmd')
        });
        child.unref();
        return { success: true, method: 'executable_spawned', pid: child.pid };
      } else if (isMac && executablePath.endsWith('.app')) {
        // macOS application bundle
        const openArgs = ['-a', executablePath];
        if (argsList.length > 0) {
          openArgs.push('--args', ...argsList);
        }
        const child = spawn('open', openArgs, {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        return { success: true, method: 'mac_app_opened' };
      } else {
        // macOS / Linux binary
        const child = spawn(executablePath, argsList, {
          cwd,
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        return { success: true, method: 'executable_spawned', pid: child.pid };
      }
    } catch (err) {
      console.error('Failed to spawn executable:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'No executable path or protocol URI provided' };
});

// IPC Handler 2: Native Executable File Picker
ipcMain.handle('pick-executable', async () => {
  if (!mainWindow) return { canceled: true };

  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  const filters = isWin
    ? [
        { name: 'Game Executables (*.exe, *.bat, *.cmd)', extensions: ['exe', 'bat', 'cmd'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    : isMac
    ? [
        { name: 'macOS Applications & Binaries (*.app)', extensions: ['app'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    : [{ name: 'Executables', extensions: ['*'] }];

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Game Executable or App Bundle',
    properties: ['openFile'],
    filters
  });

  return {
    canceled: result.canceled,
    filePath: result.filePaths[0] || null
  };
});

// IPC Handler 3: Native Directory Picker
ipcMain.handle('pick-directory', async (_event, defaultPath) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Game Library Folder',
    properties: ['openDirectory'],
    defaultPath: defaultPath && fs.existsSync(defaultPath) ? defaultPath : undefined
  });

  return {
    canceled: result.canceled,
    directoryPath: result.filePaths[0] || null
  };
});

// IPC Handler 4: Native Directory Scan (Full local filesystem access)
ipcMain.handle('scan-directory', async (_event, { dirPath, store }) => {
  if (!dirPath || !fs.existsSync(dirPath)) {
    return { success: false, error: 'Directory does not exist' };
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const folders = entries
      .filter((e) => e.isDirectory() || e.name.endsWith('.app'))
      .map((e) => e.name);

    return {
      success: true,
      directory: dirPath,
      store: store || 'auto',
      folders
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler 5: Open External URL in default browser
ipcMain.handle('open-external', async (_event, url) => {
  if (url) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

// IPC Handler 6: Get App Version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
