const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform, // 'win32', 'darwin', 'linux'
  launchGame: (gameConfig) => ipcRenderer.invoke('launch-game', gameConfig),
  pickExecutable: () => ipcRenderer.invoke('pick-executable'),
  pickDirectory: (defaultPath) => ipcRenderer.invoke('pick-directory', defaultPath),
  scanDirectory: (dirPath, store) => ipcRenderer.invoke('scan-directory', { dirPath, store }),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
