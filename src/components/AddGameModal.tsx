import React, { useState } from 'react';
import { X, HardDrive, Layers, Check } from 'lucide-react';
import { GameItem, GamePlatform, LaunchType, TargetOS } from '../types';
import { PLATFORM_INFO, buildProtocolUri } from '../services/storeProtocols';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: GameItem) => void;
  initialGame?: Partial<GameItem>;
  defaultInstalled?: boolean;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGame,
  defaultInstalled = true
}) => {
  if (!isOpen) return null;

  const [isInstalled, setIsInstalled] = useState<boolean>(
    initialGame?.isInstalled !== undefined ? initialGame.isInstalled : defaultInstalled
  );
  const [title, setTitle] = useState(initialGame?.title || '');
  const [store, setStore] = useState<GamePlatform>(initialGame?.store || 'steam');
  const [storeAppId, setStoreAppId] = useState(initialGame?.storeAppId || '');
  const [os, setOs] = useState<TargetOS>(initialGame?.os || 'both');
  const [launchType, setLaunchType] = useState<LaunchType>(
    initialGame?.launchType || (store === 'standalone' ? 'executable' : 'protocol')
  );
  const [executablePath, setExecutablePath] = useState(initialGame?.executablePath || '');
  const [launchArgs, setLaunchArgs] = useState(initialGame?.launchArgs || '');
  const [workingDir, setWorkingDir] = useState(initialGame?.workingDir || '');
  const [banner, setBanner] = useState(
    initialGame?.banner ||
      'https://images.placeholders.dev/?width=600&height=300&text=Game%20Cover'
  );
  const [genres, setGenres] = useState(initialGame?.genres?.join(', ') || 'Action, Adventure');
  const [installSizeGb, setInstallSizeGb] = useState(initialGame?.installSizeGb?.toString() || '15.0');
  const [notes, setNotes] = useState(initialGame?.notes || '');

  const handleStoreChange = (newStore: GamePlatform) => {
    setStore(newStore);
    if (newStore === 'standalone') {
      setLaunchType('executable');
    } else {
      setLaunchType('protocol');
    }
  };

  const handleBannerPreset = (type: 'steam' | 'custom') => {
    if (type === 'steam' && storeAppId.trim()) {
      setBanner(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${storeAppId.trim()}/header.jpg`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const protocolUri = buildProtocolUri(store, storeAppId);

    const newGame: GameItem = {
      id: initialGame?.id || `game-${Date.now()}`,
      title: title.trim(),
      banner: banner.trim(),
      store,
      ownedStores: initialGame?.ownedStores || [store],
      storeAppId: storeAppId.trim(),
      os,
      launchType,
      executablePath: executablePath.trim(),
      launchArgs: launchArgs.trim(),
      workingDir: workingDir.trim(),
      protocolUri,
      isInstalled,
      isFavorite: initialGame?.isFavorite || false,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      installPath: executablePath || store,
      installSizeGb: parseFloat(installSizeGb) || 0,
      notes: notes.trim(),
      dateAdded: initialGame?.dateAdded || new Date().toISOString()
    };

    onSave(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {initialGame?.id ? 'Edit Game Configuration' : 'Add Game to Collection'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status selector: Installed vs Owned Uninstalled */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Installation Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsInstalled(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-colors ${
                  isInstalled
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Installed on Local Disk</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInstalled(false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-colors ${
                  !isInstalled
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Owned (Not Currently Installed)</span>
              </button>
            </div>
          </div>

          {/* Store Platform Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Store / Distribution Origin
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['steam', 'epic', 'gog', 'standalone', 'ea', 'ubisoft', 'battlenet', 'itch'] as GamePlatform[]).map(
                (p) => {
                  const info = PLATFORM_INFO[p];
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handleStoreChange(p)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-colors ${
                        store === p
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {info.name}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Title & App ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Game Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Baldur's Gate 3"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Store App ID (Optional for Protocol)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storeAppId}
                  onChange={(e) => setStoreAppId(e.target.value)}
                  placeholder={store === 'steam' ? 'e.g. 1086940' : 'e.g. Sugar or AppID'}
                  className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {store === 'steam' && storeAppId && (
                  <button
                    type="button"
                    onClick={() => handleBannerPreset('steam')}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg whitespace-nowrap"
                    title="Auto-fetch Steam Header image"
                  >
                    Fetch Art
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* If Installed: Local Executable details */}
          {isInstalled && (
            <div className="space-y-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Local Installation & Executable Config
                </span>
                <span className="text-[10px] text-slate-500">
                  Runs directly on your machine
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Executable Path (.exe on Windows, .app on macOS)
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.electronAPI?.pickExecutable) {
                        const res = await window.electronAPI.pickExecutable();
                        if (!res.canceled && res.filePath) {
                          setExecutablePath(res.filePath);
                          if (!title) {
                            const fileName = res.filePath.split('\\').pop()?.split('/').pop()?.replace(/\.(exe|app|bat)$/i, '');
                            if (fileName) setTitle(fileName);
                          }
                        }
                      } else {
                        // Prompt helper in browser
                        const path = prompt('Enter the full path to your game executable (.exe or .app):', executablePath);
                        if (path !== null) setExecutablePath(path);
                      }
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    📁 Browse File Explorer...
                  </button>
                </div>
                <input
                  type="text"
                  value={executablePath}
                  onChange={(e) => setExecutablePath(e.target.value)}
                  placeholder="C:\Games\Cyberpunk2077\bin\x64\Cyberpunk.exe or /Applications/Game.app"
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Launch Arguments / Flags (Optional)
                  </label>
                  <input
                    type="text"
                    value={launchArgs}
                    onChange={(e) => setLaunchArgs(e.target.value)}
                    placeholder="e.g. -fullscreen --skip-launcher"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Disk Size (GB)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={installSizeGb}
                    onChange={(e) => setInstallSizeGb(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Banner URL & Genres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cover Art URL
              </label>
              <input
                type="text"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Genres
              </label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="RPG, Action, Roguelike"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              {isInstalled ? 'Save Installed Game' : 'Save Owned Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
