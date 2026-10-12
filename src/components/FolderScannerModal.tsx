import React, { useState, useEffect } from 'react';
import { X, FolderSearch, HardDrive, Check, Plus, AlertCircle, ArrowRight, FolderPlus, Trash2 } from 'lucide-react';
import { DetectedFolderGame, GameItem, GamePlatform, ScanFolderConfig, TargetOS } from '../types';
import { analyzeFolderGame, getStoredScanFolders, addCustomScanFolder, deleteCustomScanFolder } from '../services/libraryStorage';
import { buildProtocolUri, PLATFORM_INFO } from '../services/storeProtocols';

interface FolderScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGames: (newGames: GameItem[]) => void;
  scanFolders?: ScanFolderConfig[];
  onAddScanFolder?: (folder: Omit<ScanFolderConfig, 'id'>) => void;
}

export const FolderScannerModal: React.FC<FolderScannerModalProps> = ({
  isOpen,
  onClose,
  onImportGames,
  scanFolders: propScanFolders,
  onAddScanFolder: propOnAddScanFolder
}) => {
  if (!isOpen) return null;

  const [scanFolders, setScanFolders] = useState<ScanFolderConfig[]>(() => {
    return propScanFolders || getStoredScanFolders();
  });

  const [activeFolderConfig, setActiveFolderConfig] = useState<ScanFolderConfig | null>(null);
  const [scanPath, setScanPath] = useState('');
  const [selectedStore, setSelectedStore] = useState<GamePlatform | 'auto'>('auto');
  const [detected, setDetected] = useState<DetectedFolderGame[]>([]);
  const [scanning, setScanning] = useState(false);
  const [folderText, setFolderText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isAddingNewFolder, setIsAddingNewFolder] = useState(false);

  // New folder form state
  const [customName, setCustomName] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [customStore, setCustomStore] = useState<GamePlatform | 'auto'>('auto');

  useEffect(() => {
    const folders = propScanFolders || getStoredScanFolders();
    setScanFolders(folders);
    if (folders.length > 0 && !scanPath) {
      setActiveFolderConfig(folders[0]);
      setScanPath(folders[0].path);
      setSelectedStore(folders[0].store);
    }
  }, [propScanFolders]);

  const handleSelectConfig = (folder: ScanFolderConfig) => {
    setActiveFolderConfig(folder);
    setScanPath(folder.path);
    setSelectedStore(folder.store);

    // Provide immediate mock sample folders for known presets
    const samples: Record<string, string[]> = {
      steam: ['Baldurs Gate 3', 'Cyberpunk 2077', 'Hades II', 'Stardew Valley', 'Portal 2'],
      epic: ['AlanWake2', 'Grand Theft Auto V', 'Celeste'],
      gog: ['The Witcher 3 Wild Hunt', 'Cyberpunk 2077', 'Disco Elysium'],
      standalone: ['Celeste.app', 'Baldurs Gate 3.app', 'Stardew Valley']
    };

    const sampleList = samples[folder.store] || samples.steam;
    const results = sampleList.map((f) => analyzeFolderGame(f, folder.path, folder.store));
    setDetected(results);
  };

  // Trigger Native / HTML5 Directory Picker
  const handlePickDirectory = async () => {
    setScanning(true);
    try {
      // 1. Native Electron Desktop Picker & FS Reader
      if (window.electronAPI?.pickDirectory && window.electronAPI?.scanDirectory) {
        const dirRes = await window.electronAPI.pickDirectory(scanPath);
        if (!dirRes.canceled && dirRes.directoryPath) {
          const chosenDir = dirRes.directoryPath;
          const scanRes = await window.electronAPI.scanDirectory(chosenDir, selectedStore);
          if (scanRes.success && scanRes.folders) {
            const results = scanRes.folders.map((f) =>
              analyzeFolderGame(f, chosenDir, selectedStore)
            );
            setScanPath(chosenDir);
            setDetected(results);
          }
        }
        setScanning(false);
        return;
      }

      // 2. HTML5 Directory Picker
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const results: DetectedFolderGame[] = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'directory' || entry.name.endsWith('.app')) {
            results.push(analyzeFolderGame(entry.name, dirHandle.name, selectedStore));
          }
        }
        setScanPath(dirHandle.name);
        setDetected(results);
      } else {
        setShowManualInput(true);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Directory Picker error, offering manual input:', err);
        setShowManualInput(true);
      }
    } finally {
      setScanning(false);
    }
  };

  // Create a new custom scan folder
  const handleSaveCustomFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPath.trim()) return;

    const newConfigData = {
      name: customName.trim(),
      path: customPath.trim(),
      store: customStore
    };

    if (propOnAddScanFolder) {
      propOnAddScanFolder(newConfigData);
    }
    const updated = addCustomScanFolder(newConfigData);
    setScanFolders(updated);

    // Select the new folder
    const created = updated[0];
    setActiveFolderConfig(created);
    setScanPath(created.path);
    setSelectedStore(created.store);

    setCustomName('');
    setCustomPath('');
    setCustomStore('auto');
    setIsAddingNewFolder(false);
  };

  // Parse text input if user pastes folder names
  const handleParseFolderText = () => {
    if (!folderText.trim()) return;
    const lines = folderText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const results = lines.map((f) => analyzeFolderGame(f, scanPath || 'Custom Library', selectedStore));
    setDetected(results);
    setShowManualInput(false);
  };

  const toggleSelect = (index: number) => {
    setDetected((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCommitImport = () => {
    const selectedItems = detected.filter((d) => d.selected);
    if (selectedItems.length === 0) return;

    const newGames: GameItem[] = selectedItems.map((item) => {
      const banner = item.guessedStoreAppId
        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.guessedStoreAppId}/header.jpg`
        : 'https://images.placeholders.dev/?width=600&height=300&text=' + encodeURIComponent(item.guessedTitle);

      const protocolUri = buildProtocolUri(item.guessedPlatform, item.guessedStoreAppId);

      return {
        id: `scanned-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: item.guessedTitle,
        banner,
        store: item.guessedPlatform,
        ownedStores: [item.guessedPlatform],
        storeAppId: item.guessedStoreAppId || '',
        os: 'both',
        launchType: item.guessedStoreAppId ? 'protocol' : 'executable',
        executablePath: item.fullPath,
        launchArgs: '',
        workingDir: '',
        protocolUri,
        isInstalled: true,
        isFavorite: false,
        genres: ['Action', 'Installed Game'],
        installPath: item.fullPath,
        installSizeGb: 20.0,
        notes: `Imported via directory scan: ${item.fullPath}`,
        dateAdded: new Date().toISOString()
      };
    });

    onImportGames(newGames);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FolderSearch className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Local Game Folder Scanner</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Scan your game installation directories locally. You can scan standard default folders or configure custom library folders on secondary drives (e.g. <code className="text-emerald-400 font-mono">D:\SteamLibrary</code> or external SSDs).
          </p>

          {/* Scan Directories Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Choose or add a scan folder:
              </span>
              <button
                onClick={() => setIsAddingNewFolder(!isAddingNewFolder)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isAddingNewFolder ? 'Cancel' : '+ Add Custom Folder'}</span>
              </button>
            </div>

            {/* Quick Add Custom Folder Panel */}
            {isAddingNewFolder && (
              <form onSubmit={handleSaveCustomFolder} className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-2.5 text-xs">
                <span className="font-bold text-emerald-400 block">Configure Custom Drive / Folder</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1">Nickname</label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. D: Drive Steam Library"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1">Store Type</label>
                    <select
                      value={customStore}
                      onChange={(e) => setCustomStore(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="auto">Auto-Detect</option>
                      <option value="steam">Steam</option>
                      <option value="epic">Epic Games</option>
                      <option value="gog">GOG Galaxy</option>
                      <option value="standalone">Standalone / DRM-Free</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-[11px] mb-1">Full Directory Path</label>
                  <input
                    type="text"
                    required
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="e.g. D:\SteamLibrary\steamapps\common or /Volumes/SSD/Games"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewFolder(false)}
                    className="px-2.5 py-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-emerald-400 text-slate-950 font-bold rounded-lg"
                  >
                    Save & Select Folder
                  </button>
                </div>
              </form>
            )}

            {/* Folder Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {scanFolders.map((folder) => {
                const isSelected = activeFolderConfig?.id === folder.id;
                const storeLabel = folder.store === 'auto' ? 'Auto' : PLATFORM_INFO[folder.store as GamePlatform]?.name || folder.store;

                return (
                  <button
                    key={folder.id}
                    onClick={() => handleSelectConfig(folder)}
                    className={`flex flex-col text-left p-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-500/60 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {folder.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 ml-1">
                        {storeLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {folder.path}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory Picker Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handlePickDirectory}
              disabled={scanning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <HardDrive className="w-4 h-4" />
              <span>{scanning ? 'Reading Directory...' : 'Choose Local Folder (Native Picker)'}</span>
            </button>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="px-4 py-2.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {showManualInput ? 'Hide Manual Paste' : 'Paste Folder List'}
            </button>
          </div>

          {/* Manual paste field */}
          {showManualInput && (
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Paste folder names (one per line, e.g. Cyberpunk 2077, Hades II, Stardew Valley):
              </label>
              <textarea
                rows={3}
                value={folderText}
                onChange={(e) => setFolderText(e.target.value)}
                placeholder="Baldurs Gate 3&#10;Hades II&#10;The Witcher 3 Wild Hunt"
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleParseFolderText}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400"
              >
                Detect from Pasted List
              </button>
            </div>
          )}

          {/* Detected Games List */}
          {detected.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Detected Games ({detected.filter((d) => d.selected).length}/{detected.length} Selected)
                </span>
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-xs">
                  {scanPath}
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {detected.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleSelect(idx)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      item.selected
                        ? 'bg-slate-950/90 border-emerald-500/50'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          item.selected
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700'
                        }`}
                      >
                        {item.selected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{item.guessedTitle}</span>
                          <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300">
                            {item.guessedPlatform}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Folder: {item.folderName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {item.matchScore}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommitImport}
            disabled={detected.filter((d) => d.selected).length === 0}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Import Selected ({detected.filter((d) => d.selected).length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
