import React, { useState } from 'react';
import {
  X,
  User,
  FolderOpen,
  Download,
  Upload,
  HardDrive,
  Trash2,
  Plus,
  Check,
  ShieldCheck,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { GamePlatform, ScanFolderConfig, TargetOS, UserProfile } from '../types';
import { PLATFORM_INFO } from '../services/storeProtocols';

interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  scanFolders: ScanFolderConfig[];
  onAddScanFolder: (folder: Omit<ScanFolderConfig, 'id'>) => void;
  onDeleteScanFolder: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetDatabase: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  scanFolders,
  onAddScanFolder,
  onDeleteScanFolder,
  onExportBackup,
  onImportBackup,
  onResetDatabase
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'folders' | 'backup'>('profile');
  const [profileName, setProfileName] = useState(profile.name);
  const [preferredOs, setPreferredOs] = useState<TargetOS>(profile.preferredOs);

  // New custom folder form state
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPath, setNewFolderPath] = useState('');
  const [newFolderStore, setNewFolderStore] = useState<GamePlatform | 'auto'>('auto');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: profileName.trim() || 'Local Gamer',
      preferredOs
    });
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !newFolderPath.trim()) return;

    onAddScanFolder({
      name: newFolderName.trim(),
      path: newFolderPath.trim(),
      store: newFolderStore
    });

    setNewFolderName('');
    setNewFolderPath('');
    setNewFolderStore('auto');
    setIsAddingFolder(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Local Profile & Custom Folders Config
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile Name
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'folders'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Scan Folders ({scanFolders.length})
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'backup'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Database Export & Restore
          </button>
        </div>

        {/* Tab 1: Profile Name */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Profile / Gamer Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Jesse or Player 1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Used locally for organizing your library and naming database backups.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Primary Operating System
                </label>
                <select
                  value={preferredOs}
                  onChange={(e) => setPreferredOs(e.target.value as TargetOS)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="both">Both / Universal (Windows & macOS)</option>
                  <option value="windows">Windows PC</option>
                  <option value="macos">macOS (Apple Silicon / Intel)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Custom Scan Folders */}
        {activeTab === 'folders' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Configured Scan Directories</span>
                <span className="text-[11px] text-slate-400">
                  Add custom drives (e.g. D:\SteamLibrary, secondary SSDs, custom GOG folders).
                </span>
              </div>

              {!isAddingFolder && (
                <button
                  onClick={() => setIsAddingFolder(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Folder</span>
                </button>
              )}
            </div>

            {/* Add Custom Folder Form */}
            {isAddingFolder && (
              <form onSubmit={handleCreateFolder} className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-3">
                <span className="font-bold text-emerald-400 block">Configure New Scan Folder</span>

                <div>
                  <label className="block text-slate-300 mb-1">Folder Nickname</label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. D: Drive Steam Library or External SSD Games"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Full Folder Path</label>
                  <input
                    type="text"
                    required
                    value={newFolderPath}
                    onChange={(e) => setNewFolderPath(e.target.value)}
                    placeholder="e.g. D:\SteamLibrary\steamapps\common or /Volumes/SSD/Games"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Store / Launcher Origin</label>
                  <select
                    value={newFolderStore}
                    onChange={(e) => setNewFolderStore(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="auto">Auto-Detect</option>
                    <option value="steam">Steam Library</option>
                    <option value="epic">Epic Games Store</option>
                    <option value="gog">GOG Galaxy / GOG Games</option>
                    <option value="standalone">Standalone / DRM-Free</option>
                    <option value="ea">EA App</option>
                    <option value="ubisoft">Ubisoft Connect</option>
                    <option value="battlenet">Battle.net</option>
                    <option value="itch">itch.io</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingFolder(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-400 text-slate-950 font-bold rounded-lg"
                  >
                    Save Scan Folder
                  </button>
                </div>
              </form>
            )}

            {/* Folder List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {scanFolders.map((folder) => {
                const storeLabel =
                  folder.store === 'auto'
                    ? 'Auto-Detect'
                    : PLATFORM_INFO[folder.store as GamePlatform]?.name || folder.store;

                return (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="space-y-0.5 truncate max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{folder.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                          {storeLabel}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {folder.path}
                      </div>
                    </div>

                    {!folder.isDefault && (
                      <button
                        onClick={() => onDeleteScanFolder(folder.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Remove custom scan folder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Database Export & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Local Data Ownership (No Cloud Dependencies)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                All your owned game store tags, executable launch paths, favorites, custom scan folders, and profile details are preserved in your local configuration. You can export a full portable JSON backup file at any time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={onExportBackup}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-colors font-semibold text-white"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Database JSON</span>
                </button>

                <button
                  onClick={onImportBackup}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-xl transition-colors font-semibold text-white"
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>Restore Database JSON</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-rose-950/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-300 block">Reset Local Database</span>
                <span className="text-[11px] text-slate-500">
                  Restores default seed catalog and clears custom overrides.
                </span>
              </div>
              <button
                onClick={onResetDatabase}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-white border border-rose-500/40 hover:bg-rose-950/60 rounded-lg transition-colors"
              >
                Reset Database
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
